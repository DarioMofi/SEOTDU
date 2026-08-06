import json
import re

with open('public/estilos/Mapa_Base.json', encoding='utf-8') as f:
    data = json.load(f)

def parse_color(s):
    if not s:
        return None
    m = re.match(r'^(\d+),(\d+),(\d+)(?:,(\d+))?', s)
    if not m:
        return None
    r, g, b = int(m[1]), int(m[2]), int(m[3])
    a = int(m[4]) / 255 if m[4] is not None else 1.0
    return {'rgb': f'rgb({r},{g},{b})', 'alpha': round(a, 2)}

def get_style(props):
    fill = parse_color(props.get('color', ''))
    stroke = parse_color(props.get('outline_color') or props.get('line_color', ''))
    size = props.get('size')
    style = props.get('style', 'solid')
    return {'fill': fill, 'stroke': stroke, 'size': size, 'style': style}

def print_layer(node, depth=0):
    indent = '  ' * depth
    nombre = node.get('nombre', '?')
    tipo = node.get('tipo', '?')

    if tipo == 'capa':
        sim = node.get('simbologia', {})
        sim_tipo = sim.get('tipo', '?')
        print(f"{indent}[CAPA] {nombre}  =>  {sim_tipo}")

        if sim_tipo == 'singleSymbol':
            layers = sim.get('simbolo', {}).get('capas_simbolo', [])
            if layers:
                st = get_style(layers[0].get('propiedades', {}))
                fill = f"{st['fill']['rgb']} a={st['fill']['alpha']}" if st['fill'] else 'None'
                print(f"{indent}    fill={fill} | border_style={st['style']} | size={st['size']}")

        elif sim_tipo == 'categorizedSymbol':
            cats = sim.get('categorias', [])
            print(f"{indent}    campo: {sim.get('campo_clasificacion')}")
            for cat in cats[:4]:
                layers = cat.get('simbolo', {}).get('capas_simbolo', [])
                if layers:
                    st = get_style(layers[0].get('propiedades', {}))
                    fill = f"{st['fill']['rgb']} a={st['fill']['alpha']}" if st['fill'] else 'None'
                    print(f"{indent}    [{cat.get('valor','?')}] fill={fill} | size={st['size']}")

        elif sim_tipo == 'graduatedSymbol':
            rangos = sim.get('rangos', [])
            print(f"{indent}    campo: {sim.get('campo_clasificacion')}")
            for r in rangos:
                layers = r.get('simbolo', {}).get('capas_simbolo', [])
                if layers:
                    st = get_style(layers[0].get('propiedades', {}))
                    fill = f"{st['fill']['rgb']} a={st['fill']['alpha']}" if st['fill'] else 'None'
                    print(f"{indent}    [{r.get('etiqueta','?')} min={r.get('valor_min')} max={r.get('valor_max')}] fill={fill} | size={st['size']}")

    elif tipo == 'grupo':
        print(f"{indent}[GRUPO] {nombre}")
        for child in node.get('capas', []):
            print_layer(child, depth + 1)

print_layer(data)
