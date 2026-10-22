"""
Extrae del documento «Trazabilidad modular-SEOTDU.docx» la descripción
narrativa y analítica de cada tema y la deja en public/datos/trazabilidad-temas.json.

    python scripts/extraer-trazabilidad.py [ruta.docx]

Por omisión lee datos-fuente/Trazabilidad modular-SEOTDU.docx. Requiere pandoc.

Estructura del Word que se asume (encabezados):
  nivel 6  Monitor ...            (Monitor Ambiental, Monitor Social, ...)
  nivel 7  Sección temática       (Medio físico, Sociodemográfico, ...)
  nivel 8  Tema                   (Provincias fisiográficas, ...)
  nivel 9  Subtema (opcional)     (Actividades primarias, ...)
y dentro de cada tema los rótulos en negritas «Descripción:», «Variables:»,
«Capas utilizadas:», «Descripción analítica:» y «Descripción narrativa:».

Las series para las gráficas se deducen del texto analítico cuando trae
pares «Etiqueta (valor)»; si no hay al menos tres, el tema queda sin gráfica.
"""
import json
import re
import subprocess
import sys
import unicodedata
from pathlib import Path

RAIZ = Path(__file__).resolve().parent.parent
ENTRADA = Path(sys.argv[1]) if len(sys.argv) > 1 else RAIZ / "datos-fuente" / "Trazabilidad modular-SEOTDU.docx"
SALIDA = RAIZ / "public" / "datos" / "trazabilidad-temas.json"
# Vínculos capa → tema que el Word no trae (revisados por el equipo).
VINCULOS = RAIZ / "datos-fuente" / "vinculos-capa-tema.xlsx"
VALIDADO = {"si", "sí", "x", "1", "true", "validado"}


def aplicar_vinculos(temas):
    """Suma a cada tema las capas de la hoja de vínculos marcadas como validadas."""
    if not VINCULOS.exists():
        return 0
    import openpyxl
    ws = openpyxl.load_workbook(VINCULOS, data_only=True)["Vinculos"]
    filas = list(ws.iter_rows(values_only=True))
    col = {str(h).strip().lower(): i for i, h in enumerate(filas[0]) if h}
    por_id = {t["id"]: t for t in temas}
    sumadas, sin_tema = 0, []
    for f in filas[1:]:
        if str(f[col["validado"]] or "").strip().lower() not in VALIDADO:
            continue
        archivo, id_tema = f[col["archivo_capa"]], str(f[col["id_tema"]] or "").strip()
        tema = por_id.get(id_tema)
        if not tema:
            sin_tema.append(f"{archivo} -> {id_tema}")
            continue
        clave = norm(archivo)
        if clave and clave not in tema["capas"]:
            tema["capas"].append(clave)
            sumadas += 1
    for s in sin_tema:
        print("  Aviso: tema no encontrado en la hoja de vínculos:", s)
    return sumadas


def norm(t):
    t = unicodedata.normalize("NFKD", str(t or ""))
    t = "".join(c for c in t if not unicodedata.combining(c)).lower()
    return re.sub(r"[^a-z0-9]", "", t)


def slug(t):
    t = unicodedata.normalize("NFKD", str(t or ""))
    t = "".join(c for c in t if not unicodedata.combining(c)).lower()
    return re.sub(r"[^a-z0-9]+", "-", t).strip("-")


# Monitor -> id del monitor en la plataforma
MONITORES = {
    "ambiental": "ambiental", "economico": "aptitud", "social": "social",
    "infraestructura": "infraestructura", "modelo": "normatividad",
}

# Sección temática -> subsistema del PEOTDU (Ilustración 1 y patrón modular).
# Lo no listado hereda el subsistema por defecto de su monitor.
SUBSISTEMA_POR_SECCION = {
    "sociodemografico": "sociodemografico", "mediotransformado": "sociodemografico",
    "patrimonio": "patrimonio", "gobernanza": "institucional",
    # Restricciones ecológicas, compatibilidad de uso de suelo y franjas de
    # seguridad son gobernanza aunque vivan en el monitor de Infraestructura.
    "gobernanzainstitucional": "institucional",
    "movilidad": "movilidad",
}
SUBSISTEMA_POR_MONITOR = {
    "ambiental": "fisico-natural", "aptitud": "economico", "social": "sociodemografico",
    "infraestructura": "urbano-rural", "normatividad": "institucional",
}


def plano(md):
    """Fragmento markdown -> texto plano (párrafos y viñetas «- »)."""
    if not md.strip():
        return ""
    r = subprocess.run(["pandoc", "-f", "markdown", "-t", "plain", "--wrap=none"],
                       input=md, capture_output=True, text=True, encoding="utf-8")
    t = r.stdout
    t = re.sub(r"^\s*-\s{2,}", "- ", t, flags=re.M)
    # Restos de notas al pie y guiones sueltos del Word («ADVC.* -»)
    t = re.sub(r"\*\s*-?\s*$", "", t, flags=re.M)
    t = re.sub(r"\s+-\s*$", "", t, flags=re.M)
    t = re.sub(r"\n{3,}", "\n\n", t)
    return t.strip()


def numero(s):
    s = s.replace("−", "-").replace("$", "").replace(" ", "")
    if re.fullmatch(r"-?\d{1,3}(,\d{3})+(\.\d+)?", s):
        s = s.replace(",", "")
    elif re.fullmatch(r"-?\d+,\d+", s):
        s = s.replace(",", ".")
    try:
        return float(s)
    except ValueError:
        return None


PAR = re.compile(
    r"([A-Za-zÁÉÍÓÚÜÑáéíóúüñ0-9][^():;\n]{0,70}?)\s*\(\s*\$?\s*([+\-−]?[\d][\d.,]*)\s*(%|[A-Za-z ]{0,12})?\s*(?:/\s*([\d.,]+)\s*%)?\s*\)"
)


def series(texto):
    """Bloques «Título: A (1), B (2) ...» -> [{titulo, unidad, datos:[{etiqueta, valor}]}]"""
    salida = []
    bloques = [b.strip() for b in re.split(r"\n\s*\n|\n- ", texto) if b.strip()]
    for b in bloques:
        b = b.lstrip("- ").strip()
        titulo = None
        m = re.match(r"([^:]{3,120}):\s*(.*)", b, flags=re.S)
        if m and "(" not in m.group(1):
            titulo, cuerpo = m.group(1).strip(), m.group(2)
        else:
            cuerpo = b
        # Un bloque puede traer varias series separadas por «;» con su propio rótulo
        for parte in re.split(r";\s*(?=[A-ZÁÉÍÓÚ][^()]{2,40}:)", cuerpo):
            sub = re.match(r"\s*([A-ZÁÉÍÓÚ][^():]{2,60}):\s*(.*)", parte, flags=re.S)
            tit = titulo
            if sub:
                tit = f"{titulo} · {sub.group(1).strip()}" if titulo else sub.group(1).strip()
                parte = sub.group(2)
            # Cada par lleva su unidad; una serie solo mezcla pares de la misma
            # unidad (si no, «% del territorio» y «msnm» acabarían en un eje).
            datos = []
            for et, val, uni, pct in PAR.findall(parte):
                et = re.sub(r"^(y|e|,)\s+", "", et.strip(" ,.-y")).strip()
                et = re.sub(r"\s*[a-z]/$", "", et)  # llamadas de nota «a/»
                v = numero(pct) if pct else numero(val)
                if v is None or not et or len(et) > 70:
                    continue
                # Etiquetas que son frases o llevan cifras: no son categorías
                if "%" in et or (re.search(r"\d", et) and not re.fullmatch(r"\d{4}", et)):
                    continue
                if et[0].islower() and len(et.split()) > 3:
                    continue
                if et.lower().startswith("total"):
                    continue
                u = "%" if (pct or (uni or "").strip() == "%") else ((uni or "").strip() or None)
                datos.append({"etiqueta": et, "valor": v, "_u": u})
            if not datos:
                continue
            from collections import Counter
            unidad = Counter(d["_u"] for d in datos).most_common(1)[0][0]
            datos = [{"etiqueta": d["etiqueta"], "valor": d["valor"]} for d in datos if d["_u"] == unidad]
            if tit and re.match(r"Tabla \d+", tit):
                tit = None
            # sin duplicados de etiqueta
            vistos, limpios = set(), []
            for d in datos:
                if d["etiqueta"] not in vistos:
                    vistos.add(d["etiqueta"])
                    limpios.append(d)
            if len(limpios) >= 3:
                salida.append({"titulo": tit, "unidad": unidad, "datos": limpios[:24]})
    return salida


ROTULOS = {
    "descripcion": r"Descripci[oó]n",
    "variables": r"Variables?",
    "capas": r"Capas utilizadas",
    "analitica": r"Descripci[oó]n\**\s*\**\s*anal[ií]tica",
    "narrativa": r"Descripci[oó]n\**\s*\**\s*narrativa",
}


def campos(bloque):
    """Separa el bloque de un tema en sus rótulos en negritas."""
    marcas = []
    for clave, pat in ROTULOS.items():
        for m in re.finditer(r"\*\*\s*" + pat + r"\s*:?\s*\**\s*:?\s*\**", bloque, flags=re.I):
            # «Descripción» a secas no debe tragarse «Descripción analítica»
            if clave == "descripcion" and re.match(r"\*\*\s*Descripci[oó]n\**\s*\**\s*(anal|narr)", bloque[m.start():m.start() + 40], flags=re.I):
                continue
            marcas.append((m.start(), m.end(), clave))
    marcas.sort()
    out = {}
    for i, (ini, fin, clave) in enumerate(marcas):
        hasta = marcas[i + 1][0] if i + 1 < len(marcas) else len(bloque)
        if clave not in out:
            out[clave] = bloque[fin:hasta]
    # La narrativa termina donde empieza la ficha técnica tabulada del tema
    for k in ("analitica", "narrativa", "descripcion", "capas", "variables"):
        if k in out:
            out[k] = re.split(r"\n\s*(?:\*\*)?Tabla \d+ ", out[k])[0]
    return out


def main():
    md = subprocess.run(["pandoc", str(ENTRADA), "-t", "markdown", "--wrap=none"],
                        capture_output=True, text=True, encoding="utf-8").stdout
    md = re.sub(r"!\[[^\]]*\]\([^)]*\)(\{[^}]*\})?", "", md)  # sin imágenes
    lineas = md.split("\n")
    temas, actual = [], None
    monitor = seccion = tema = None

    def cerrar():
        if actual and "\n".join(actual["_md"]).strip():
            c = campos("\n".join(actual.pop("_md")))
            if not any(k in c for k in ("analitica", "narrativa", "descripcion")):
                return
            # Las políticas del MOT no traen narrativa propia: su descripción
            # cumple esa función.
            if not plano(c.get("narrativa", "")).strip():
                c["narrativa"] = c.get("descripcion", "")
            capas_txt = plano(c.get("capas", ""))
            analitica = plano(c.get("analitica", ""))
            actual.update({
                "descripcion": plano(c.get("descripcion", "")),
                "variables": plano(c.get("variables", "")),
                "capasTexto": capas_txt,
                "capas": sorted({norm(x) for x in re.findall(r"\b[CR]\d\d_[\wÁÉÍÓÚáéíóúñÑ\-]+", capas_txt)}),
                "analitica": analitica,
                "narrativa": plano(c.get("narrativa", "")),
                "series": series(analitica),
            })
            temas.append(actual)

    for ln in lineas:
        h = re.match(r"^(#{6,9})\s+(.*?)\s*(\{.*\})?\s*$", ln)
        if h:
            nivel, texto = len(h.group(1)), re.sub(r"\*", "", h.group(2)).strip()
            if nivel == 6:
                cerrar(); actual = None
                monitor = next((v for k, v in MONITORES.items() if k in norm(texto)), None)
                seccion = tema = None
                if monitor is None:  # «Usos de suelo y densidades» cuelga del MOT
                    monitor = "normatividad"; seccion = texto
                continue
            if nivel == 7:
                cerrar(); actual = None; seccion = texto; tema = None; continue
            if nivel in (8, 9):
                cerrar()
                if nivel == 8:
                    tema = texto
                titulo = texto
                sub = SUBSISTEMA_POR_SECCION.get(norm(seccion or "")) or SUBSISTEMA_POR_MONITOR.get(monitor)
                actual = {
                    "id": slug(f"{monitor}-{seccion}-{titulo}"),
                    "monitor": monitor,
                    "subsistema": sub,
                    # Diagnóstico = Desempeño territorial; el MOT = Estrategia territorial
                    "vista": "estrategia" if monitor == "normatividad" else "desempeno",
                    "seccion": seccion,
                    "tema": tema if nivel == 9 else titulo,
                    "titulo": titulo,
                    "_md": [],
                }
                continue
        if actual is not None:
            actual["_md"].append(ln)
    cerrar()

    vinculadas = aplicar_vinculos(temas)
    if vinculadas:
        print(f"{vinculadas} vínculos capa → tema añadidos desde {VINCULOS.name}")

    SALIDA.parent.mkdir(parents=True, exist_ok=True)
    SALIDA.write_text(json.dumps(temas, ensure_ascii=False, indent=1), encoding="utf-8")
    con_graf = sum(1 for t in temas if t["series"])
    print(f"{len(temas)} temas -> {SALIDA.name}; {con_graf} con gráfica; "
          f"{sum(1 for t in temas if t['capas'])} con capas vinculadas")


if __name__ == "__main__":
    main()
