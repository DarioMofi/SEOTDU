import json
import os
import re
import sqlite3
import geopandas as gpd
import pandas as pd
import glob

# Los GeoPackage viven fuera de public/ por dos razones: Vite copia todo
# public/ al build (y se desplegarían ~98 MB que nadie usa) y el navegador no
# los puede leer, porque son SQLite. Lo único que se publica son los GeoJSON.
SOURCE_DIR = "cartografia"
LAYERS_DIR = os.path.join("public", "layers")
os.makedirs(LAYERS_DIR, exist_ok=True)

# `cartografia/pendientes/` es un banco de cartografía suelta (06_Diagnostico)
# del que solo se toman capas nombradas aquí. Extraerlo completo metería en los
# módulos decenas de capas que QGIS no tiene encendidas, y el visor las
# dibujaría todas. Se va llenando módulo a módulo, validando contra las
# capturas del proyecto QGIS.
POOL_DIR = os.path.join(SOURCE_DIR, "pendientes")
POOL_LAYERS = [
    # Bienestar Social y Demografía — grupo 06_PATRIMONIO
    "C04_EFPatrimonioInmble_SIC_2023",
    "C04_GrupoEtnico_INPI_2020",
    "C04_PatrimonioInmaterial_SIC_2023",
    "C04_PatrimonioInmaterialIdioma_OPMATPG_2023",
    "C04_PatrimonioInmueble_SIC_2023",
    "C04_ZonasArqueológicas_SIC_2023",
    # Infraestructura Estratégica y Conectividad — grupo 07_SUR
    "C04_DerechosDeViaLineasDeTransmisionElectrica_Geocomunes_2023",
]

# 6 decimales ≈ 11 cm sobre el terreno, de sobra para un visor estatal.
# geopandas escribe ~15 dígitos por coordenada, que es puro peso muerto.
COORD_PRECISION = 6

# ── Reparación de mojibake ────────────────────────────────────────────────────
# Los GPKG de origen traen texto con doble (y hasta triple) codificación UTF-8:
# 'ó' quedó como 'Ã³', 'Ã\x83Âġ' o 'ÃƒÂ³' según cuántas vueltas de
# encode(UTF-8) -> decode(cp1252 | latin-1 | iso8859-14) sufrió el dato.
# Esto rompe el emparejamiento con campo_clasificacion/valor de los estilos
# QGIS, que sí están en UTF-8 limpio. Se deshace re-codificando hasta que el
# texto deje de tener marcadores sospechosos.
SUSPECT = re.compile(r"[ÃÂ]")
CODECS = ("cp1252", "latin-1", "iso8859_14")


def _decode_once(s):
    """Una vuelta de reparación: elige el codec que deja menos residuo."""
    best = None
    for codec in CODECS:
        try:
            candidate = s.encode(codec).decode("utf-8")
        except (UnicodeEncodeError, UnicodeDecodeError):
            continue
        score = len(SUSPECT.findall(candidate))
        if best is None or score < best[0]:
            best = (score, candidate)
    return best[1] if best else s


def _decode_repeatedly(s, max_passes=6):
    for _ in range(max_passes):
        nxt = _decode_once(s)
        if nxt == s:
            break
        s = nxt
        if not SUSPECT.search(s):
            break
    return s


def fix_mojibake(s):
    """Devuelve `s` con la codificación reparada, o intacta si no se puede."""
    if not isinstance(s, str) or not SUSPECT.search(s):
        return s
    repaired = _decode_repeatedly(s)
    if not SUSPECT.search(repaired):
        return repaired
    # Cadenas de codificación mixta ('KobÃ©n [Rehabilitación]'): la palabra rota
    # convive con texto ya correcto, así que se repara token por token.
    repaired = " ".join(
        _decode_repeatedly(w) if SUSPECT.search(w) else w for w in s.split(" ")
    )
    # 'Â' huérfano antes de un espacio es el residuo de un NBSP mal leído.
    return re.sub(r"Â(?=\s|$)", "", repaired)


def normalize_encoding(gdf):
    """Repara nombres de columna y valores de texto. Devuelve (gdf, n_cambios)."""
    changes = 0

    renames = {}
    for col in gdf.columns:
        fixed = fix_mojibake(col)
        if fixed != col:
            renames[col] = fixed
            changes += 1
    if renames:
        gdf = gdf.rename(columns=renames)

    geom_col = gdf.geometry.name if gdf.geometry is not None else None
    for col in gdf.columns:
        if col == geom_col:
            continue
        series = gdf[col]
        # pandas >= 3 usa el dtype 'str'; versiones previas usan 'object'.
        if not (
            pd.api.types.is_string_dtype(series) or pd.api.types.is_object_dtype(series)
        ):
            continue
        repaired = series.map(fix_mojibake)
        changes += int((repaired != series).fillna(False).sum())
        gdf[col] = repaired

    return gdf, changes


def write_geojson(gdf, out_path):
    """Escribe el GeoJSON recortado en precisión y sin espacios sobrantes."""
    gdf.to_file(out_path, driver="GeoJSON", COORDINATE_PRECISION=COORD_PRECISION)
    # GDAL indenta la salida; reescribirla compacta ahorra ~12% adicional.
    with open(out_path, encoding="utf-8") as f:
        data = json.load(f)
    with open(out_path, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, separators=(",", ":"))

available_layers = []

# Los .gpkg de módulo se extraen enteros; del banco solo las capas pedidas.
trabajos = [(p, None) for p in glob.glob(os.path.join(SOURCE_DIR, "*.gpkg"))]
trabajos += [(p, POOL_LAYERS) for p in glob.glob(os.path.join(POOL_DIR, "*.gpkg"))]

for gpkg_path, seleccion in trabajos:
    gpkg_name = os.path.basename(gpkg_path)
    print(f"\nProcessing {gpkg_name}...")

    try:
        conn = sqlite3.connect(gpkg_path)
        cursor = conn.cursor()
        cursor.execute("SELECT table_name FROM gpkg_contents")
        tables = [row[0] for row in cursor.fetchall()]
        conn.close()
    except Exception as e:
        print(f"Failed to read {gpkg_name} contents: {e}")
        continue

    if seleccion is not None:
        pedidas = set(seleccion)
        sin_encontrar = pedidas - set(tables)
        if sin_encontrar:
            print(f"  [AVISO] no están en {gpkg_name}: {sorted(sin_encontrar)}")
        tables = [t for t in tables if t in pedidas]
        print(f"Selected {len(tables)} of the pool in {gpkg_name}: {tables}")
    else:
        print(f"Found {len(tables)} tables in {gpkg_name}: {tables}")

    for table_name in tables:
        out_path = os.path.join(LAYERS_DIR, f"{table_name}.geojson")
        if os.path.exists(out_path):
            print(f"  [SKIPPED] {table_name} already exists")
            available_layers.append(table_name)
            continue
            
        print(f"  [EXTRACTING] {table_name} -> {table_name}.geojson")
        try:
            gdf = gpd.read_file(gpkg_path, layer=table_name)
            if gdf.crs and gdf.crs.to_epsg() != 4326:
                gdf = gdf.to_crs(epsg=4326)
            gdf, encoding_fixes = normalize_encoding(gdf)
            write_geojson(gdf, out_path)
            suffix = f" ({encoding_fixes} textos recodificados)" if encoding_fixes else ""
            print(f"  [SUCCESS] {table_name}{suffix}")
        except Exception as e:
            print(f"  [ERROR] Failed to extract {table_name}: {e}")
            continue
            
        available_layers.append(table_name)

import json
with open(os.path.join(LAYERS_DIR, "available.json"), "w") as f:
    json.dump(available_layers, f)

print(f"\nDone extracting all layers! {len(available_layers)} layers available.")
