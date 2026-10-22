"""Incidencias de cartografía (Excel) -> src/data/incidencias-cartografia.json

Lista las capas citadas en el PEOTDU que todavía no se pueden desplegar en el
geovisor (archivo inexistente, tabla vacía, capa no identificada). El geovisor
las muestra como «pendientes» dentro de cada monitor.

Uso:  python scripts/extraer-incidencias.py
"""
import json
import re
import unicodedata
from pathlib import Path

import openpyxl

RAIZ = Path(__file__).resolve().parent.parent
FUENTE = RAIZ / "datos-fuente" / "Incidencias EN CARTOGRAFIA - SEOTDU.xlsx"
# En src/ y no en public/: así el geovisor la toma sin reiniciar el servidor
# de desarrollo (vite.config.ts no vigila public/).
SALIDA = RAIZ / "src" / "data" / "incidencias-cartografia.json"

MODULO = {"ambiental": "ambiental", "social": "social", "infraestructura": "infraestructura",
          "economico": "aptitud", "mot": "normatividad", "gobernanza": "normatividad"}


def norm(s):
    s = unicodedata.normalize("NFKD", str(s or "")).encode("ascii", "ignore").decode().lower()
    return re.sub(r"[^a-z0-9]", "", s)


def texto(v):
    return re.sub(r"\s+", " ", str(v)).strip() if v not in (None, "") else None


# Respaldo para renglones sin monitor en el Excel. Lo correcto es llenarlo en
# el Excel; mientras tanto se asigna aquí y se reporta al correr el script.
# Las R04_* son rásteres de peligros del Atlas (CENAPRED, SMN, UNAM, OPMATPG).
RIESGO_GEOLOGICO = ("INESLAD", "SUSINES", "HUNDIMIENTO")


def asignar_respaldo(nombre, archivo):
    """(modulo, subsistema, tematica, vista) para un renglón sin monitor, o None."""
    a = (archivo or "").upper()
    if a.startswith("R04_"):
        geo = any(k in a for k in RIESGO_GEOLOGICO)
        return ("ambiental", "Físico Natural",
                "Peligros geológicos" if geo else "Peligros hidrometeorológicos", "desempeno")
    if re.search(r"sistema de ciudades", str(nombre or ""), re.I):
        # La observación del Excel la liga a la estrategia 4 (integración territorial)
        return ("infraestructura", "Urbano-rural", "Sistema de ciudades", "estrategia")
    return None


def main():
    ws = openpyxl.load_workbook(FUENTE, data_only=True).worksheets[0]
    filas = []
    asignadas = []
    for r in ws.iter_rows(min_row=2, values_only=True):
        subsistema, monitor, tematica, nombre, archivo, incidencia, estatus, obs = (list(r) + [None] * 8)[:8]
        modulo = MODULO.get(norm(monitor))
        vista_forzada = None
        if not modulo and (nombre or archivo):
            respaldo = asignar_respaldo(nombre, texto(archivo))
            if respaldo:
                modulo, subsistema, tematica_r, vista_forzada = respaldo
                tematica = tematica or tematica_r
                obs = ((texto(obs) + " · ") if texto(obs) else "") + "Monitor asignado por el script: falta en el Excel"
                asignadas.append(f"{texto(nombre) or texto(archivo)} -> {modulo}")
        if not modulo or not (nombre or archivo):
            continue  # sin monitor no hay caja donde mostrarla
        archivo = texto(archivo)
        if archivo and set(archivo) <= set("-?"):
            archivo = None
        # Los proyectos de la EEMSV son salidas; lo demás, insumos del diagnóstico
        es_estrategia = bool(re.match(r"\s*proyecto", str(nombre or ""), re.I)) or "estrategias" in (archivo or "").lower()
        filas.append({
            "modulo": modulo,
            "subsistema": texto(subsistema),
            "tematica": texto(tematica),
            "nombre": texto(nombre) or archivo,
            "archivo": archivo,
            "capaNorm": norm(re.sub(r"\.tif$", "", archivo or "")) or None,
            "vista": vista_forzada or ("estrategia" if es_estrategia else "desempeno"),
            "estatus": texto(estatus) or "Pendiente",
            "incidencia": texto(incidencia),
            "observaciones": texto(obs),
        })
    SALIDA.parent.mkdir(parents=True, exist_ok=True)
    SALIDA.write_text(json.dumps(filas, ensure_ascii=False, indent=1), encoding="utf-8")
    print(f"{len(filas)} incidencias -> {SALIDA.name}")
    if asignadas:
        print(f"Aviso: {len(asignadas)} renglones sin monitor en el Excel; se asignaron por respaldo:")
        for a in asignadas:
            print("  -", a)


if __name__ == "__main__":
    main()
