"""
Convierte las tablas de trabajo (Excel) de `datos-fuente/` en los JSON que lee
la plataforma desde `public/datos/`.

    python scripts/actualizar-datos.py

Se corre cada vez que se actualiza alguno de los Excel:
  - Proyecto-seguimiento.xlsx   -> proyectos-seguimiento.json (monitores, inicio)
  - Estrategia-indicadores.xlsx -> estrategia-indicadores.json (geovisor)
  - Ficha-tecnica.xlsx          -> publicaciones-instrumentos.json (catálogo)

PROVISIONAL: en la versión final estas tablas vivirán en Supabase y este paso
desaparece; el frontend las lee por un único punto (src/lib/datosPrograma.ts).
Requiere openpyxl.
"""
import json
import re
import sys
import unicodedata
from pathlib import Path

import openpyxl

RAIZ = Path(__file__).resolve().parent.parent
FUENTE = RAIZ / "datos-fuente"
SALIDA = RAIZ / "public" / "datos"


def norm(texto):
    """Misma regla que norm() de src/lib/cartografia.ts: sin acentos, minúsculas, solo [a-z0-9]."""
    t = unicodedata.normalize("NFKD", str(texto or ""))
    t = "".join(c for c in t if not unicodedata.combining(c)).lower()
    return re.sub(r"[^a-z0-9]", "", t)


VACIAS = {"de", "del", "la", "las", "los", "el", "en", "y", "para", "por", "con", "entre", "municipio", "estado", "campeche", "localidad", "construccion", "programa", "proyecto"}


def palabras_clave(texto):
    return {norm(w) for w in re.split(r"\W+", str(texto or "")) if len(norm(w)) > 3 and norm(w) not in VACIAS}


def limpio(v):
    if v is None:
        return None
    if isinstance(v, float) and v.is_integer():
        v = int(v)
    s = str(v).strip()
    return s or None


def filas(nombre):
    ws = openpyxl.load_workbook(FUENTE / nombre, data_only=True).worksheets[0]
    it = ws.iter_rows(values_only=True)
    encabezados = [re.sub(r"\s+", " ", str(h)).strip() if h else None for h in next(it)]
    for r in it:
        fila = {h: limpio(c) for h, c in zip(encabezados, r) if h}
        if any(fila.values()):
            yield fila


def col(fila, *opciones):
    """Lee una columna tolerando variaciones de nombre (acentos, mayúsculas, espacios)."""
    indice = {norm(k): v for k, v in fila.items()}
    for o in opciones:
        if norm(o) in indice:
            return indice[norm(o)]
    return None


# Monitor del Excel -> id del monitor en la página de inicio y módulo del geovisor
MONITORES = {
    "ambiental": ("Ambiental", "ambiental"),
    "social": ("Social", "social"),
    "infraestructura": ("Infraestructura", "infraestructura"),
    "economico": ("Económico", "aptitud"),
}


def monitor_de(texto):
    n = norm(texto)
    for clave, (titulo, modulo) in MONITORES.items():
        if clave in n:
            return titulo, modulo
    return texto, None


def main():
    SALIDA.mkdir(parents=True, exist_ok=True)

    # ── Estrategia-indicadores ────────────────────────────────────────────
    indicadores = []
    for f in filas("Estrategia-indicadores.xlsx"):
        archivo = col(f, "Archivo (.gpkg)")
        if not archivo:
            continue
        titulo, modulo = monitor_de(col(f, "Monitor"))
        indicadores.append({
            "clave": col(f, "PK - Nomenclatura"),
            "estrategia": (col(f, "pk - Estrategia") or "").replace("_", " ").replace("  ", " "),
            "monitor": titulo,
            "modulo": modulo,
            "principio": col(f, "FK - Principio"),
            "archivo": archivo,
            "capaNorm": norm(archivo),
            "nombreCapa": col(f, "Nombre de Capa"),
            "linea": col(f, "Línea Estratégica"),
            "accion": col(f, "Acción"),
            "dimension": col(f, "Dimensión"),
            "indicador": col(f, "Indicador"),
            "definicion": col(f, "Definición"),
            "metodo": col(f, "Método de cálculo"),
            "unidadMedida": col(f, "Unidad de medida"),
            "unidadAnalisis": col(f, "Unidad de análisis"),
            "frecuencia": col(f, "Frecuencia de medición"),
            "lineaBase": col(f, "Linea base"),
            "lineaAprobatoria": col(f, "Linea aprobatoria"),
            "meta": col(f, "Meta"),
            "sentido": col(f, "Sentido del indicador"),
            "semaforizacion": col(f, "Semaforización"),
            "justificacion": col(f, "Justificación Urbana/Ambiental"),
            "responsable": col(f, "Responsable de ejecución"),
            "fuente": col(f, "Fuente"),
        })

    # ── Proyecto-seguimiento ──────────────────────────────────────────────
    proyectos = []
    sin_capa = []
    for i, f in enumerate(filas("Proyecto-seguimiento.xlsx"), start=1):
        nombre = col(f, "Programa, proyecto, acción y obra")
        if not nombre:
            continue
        titulo, modulo = monitor_de(col(f, "Monitor"))
        # Vínculo proyecto -> capa: la «Acción» de Estrategia-indicadores
        # empieza con el nombre del proyecto de la Matriz de Programación.
        # Si no empieza igual, se acepta cuando al menos el 70 % de las palabras
        # significativas del proyecto aparecen en la acción.
        n = norm(nombre)
        palabras = palabras_clave(nombre)

        def coincide(x):
            a = norm(x["accion"])
            if n and (a.startswith(n[:40]) or n[:40] in a):
                return True
            pa = palabras_clave(x["accion"])
            return bool(palabras) and len(palabras & pa) / len(palabras) >= 0.7

        capas = sorted({x["archivo"] for x in indicadores if coincide(x)})
        if not capas:
            sin_capa.append(nombre)
        proyectos.append({
            "id": f"{col(f, 'PK-Nomenclatura') or 'P'}-{i:03d}",
            "clave": col(f, "PK-Nomenclatura"),
            "estrategia": col(f, "Estrategia"),
            "monitor": titulo,
            "modulo": modulo,
            "nombre": nombre,
            "ubicacion": col(f, "Ubicación"),
            "linea": col(f, "Línea estratégica"),
            "monto": col(f, "Monto de Inversión"),
            "publico": bool(col(f, "Público")),
            "privado": bool(col(f, "Privado")),
            "plazo": col(f, "Plazo"),
            "prioridad": col(f, "Prioridad"),
            "responsable": col(f, "Responsable de la Ejecución"),
            "coordinacion": col(f, "Coordinación o Concertación"),
            "poblacion": col(f, "Población beneficiada"),
            "financiamiento": col(f, "Posible fuente de Financiamiento"),
            "capas": capas,
        })

    # ── Ficha-tecnica ─────────────────────────────────────────────────────
    publicaciones = {}
    for f in filas("Ficha-tecnica.xlsx"):
        clave = col(f, "ID")
        if not clave:
            continue
        link = col(f, "Link de públicación", "Link de publicación")
        es_url = bool(link and re.match(r"^https?://", link))
        publicaciones[clave] = {
            "linkPublicacion": link if es_url else None,
            "notaPublicacion": None if es_url else link,
            "linkRepositorio": col(f, "Link del repositorio"),
            "linkPdfExterno": col(f, "Link de PDF"),
        }

    for nombre, datos in [
        ("estrategia-indicadores.json", indicadores),
        ("proyectos-seguimiento.json", proyectos),
        ("publicaciones-instrumentos.json", publicaciones),
    ]:
        (SALIDA / nombre).write_text(json.dumps(datos, ensure_ascii=False, indent=1), encoding="utf-8")
        print(f"{nombre}: {len(datos)} registros")

    if sin_capa:
        print(f"\n{len(sin_capa)} proyectos sin capa vinculada en Estrategia-indicadores:")
        for s in sin_capa:
            print("  -", s)


if __name__ == "__main__":
    sys.exit(main())
