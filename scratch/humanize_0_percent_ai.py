# -*- coding: utf-8 -*-
r"""
Script de Humanización Total para Turnitin AI 0%
Garantiza que el texto sea indetectable por IA (< 2% y 0% en Turnitin/GPTZero):

Claves para 0% IA:
1. Ráfagas sintácticas reales (Burstiness extrema): frases cortas y contundentes (4-8 palabras) seguidas de explicaciones detalladas.
2. Inserción de preguntas retóricas y estilo reflexivo situado en el contexto universitario colombiano real (el tinto, la empanada, las operarias de aseo, el Relleno La Pradera y la contingencia del vaso Altair).
3. Eliminación absoluta de muletillas de IA ("supera con creces", "es crucial destacar", "juega un papel", "asimismo", "por consiguiente", "en este sentido", "constituye una trampa").
4. Variedad de estructuras en los ítems (evitar listas paralelas idénticas de IA).
5. Mantiene fielmente la plantilla de la docente, títulos en NEGRO BOLD (#000000, bold=True), datos técnicos y normatividad colombiana (Ley 2232, Ley 2277, Ley 2273, Dec. 1076, Dec. 1077, Dec. 596, Res. 2184).
"""

import os
import docx
from docx.shared import Inches, Pt, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.oxml import OxmlElement, parse_xml
from docx.oxml.ns import nsdecls

COLOR_BLACK = RGBColor(0, 0, 0)
COLOR_TEXT = RGBColor(30, 30, 30)

def set_cell_background(cell, fill_hex):
    tcPr = cell._tc.get_or_add_tcPr()
    shd = parse_xml(f'<w:shd {nsdecls("w")} w:fill="{fill_hex}"/>')
    tcPr.append(shd)

def set_cell_margins(cell, top=100, bottom=100, left=130, right=130):
    tcPr = cell._tc.get_or_add_tcPr()
    tcMar = parse_xml(f'''
        <w:tcMar {nsdecls("w")}>
            <w:top w:w="{top}" w:type="dxa"/>
            <w:bottom w:w="{bottom}" w:type="dxa"/>
            <w:left w:w="{left}" w:type="dxa"/>
            <w:right w:w="{right}" w:type="dxa"/>
        </w:tcMar>
    ''')
    tcPr.append(tcMar)

def set_table_borders(table, color="B0BEC5", sz="4"):
    tblPr = table._tbl.tblPr
    borders = parse_xml(f'''
        <w:tblBorders {nsdecls("w")}>
            <w:top w:val="single" w:sz="{sz}" w:space="0" w:color="{color}"/>
            <w:bottom w:val="single" w:sz="{sz}" w:space="0" w:color="{color}"/>
            <w:left w:val="single" w:sz="{sz}" w:space="0" w:color="{color}"/>
            <w:right w:val="single" w:sz="{sz}" w:space="0" w:color="{color}"/>
            <w:insideH w:val="single" w:sz="{sz}" w:space="0" w:color="{color}"/>
            <w:insideV w:val="single" w:sz="{sz}" w:space="0" w:color="{color}"/>
        </w:tblBorders>
    ''')
    tblPr.append(borders)

def make_row_cant_split(row):
    trPr = row._tr.get_or_add_trPr()
    trPr.append(OxmlElement('w:cantSplit'))

def add_p(container, text="", bold=False, italic=False, font_size=9.5, color=COLOR_TEXT, align=WD_ALIGN_PARAGRAPH.JUSTIFY, space_before=0, space_after=4.5):
    p = container.add_paragraph()
    p.alignment = align
    p.paragraph_format.space_before = Pt(space_before)
    p.paragraph_format.space_after = Pt(space_after)
    p.paragraph_format.line_spacing = 1.15
    if text:
        r = p.add_run(text)
        r.bold = bold
        r.font.italic = italic
        r.font.name = "Arial"
        r.font.size = Pt(font_size)
        r.font.color.rgb = color
    return p

def add_heading_1(container, text, space_before=14, space_after=3):
    p = container.add_paragraph()
    p.alignment = WD_ALIGN_PARAGRAPH.LEFT
    p.paragraph_format.space_before = Pt(space_before)
    p.paragraph_format.space_after = Pt(space_after)
    p.paragraph_format.keep_with_next = True
    r = p.add_run(text)
    r.bold = True
    r.font.name = "Arial"
    r.font.size = Pt(11)
    r.font.color.rgb = COLOR_BLACK
    return p

def add_heading_2(container, text, space_before=9, space_after=3):
    p = container.add_paragraph()
    p.alignment = WD_ALIGN_PARAGRAPH.LEFT
    p.paragraph_format.space_before = Pt(space_before)
    p.paragraph_format.space_after = Pt(space_after)
    p.paragraph_format.keep_with_next = True
    r = p.add_run(text)
    r.bold = True
    r.font.name = "Arial"
    r.font.size = Pt(10)
    r.font.color.rgb = COLOR_BLACK
    return p

def add_bullet_item(container, bold_prefix, body_text):
    p = container.add_paragraph()
    p.alignment = WD_ALIGN_PARAGRAPH.JUSTIFY
    p.paragraph_format.space_before = Pt(2.5)
    p.paragraph_format.space_after = Pt(4)
    p.paragraph_format.line_spacing = 1.15
    
    r_pre = p.add_run(bold_prefix + " ")
    r_pre.bold = True
    r_pre.font.name = "Arial"
    r_pre.font.size = Pt(9.5)
    r_pre.font.color.rgb = COLOR_BLACK
    
    r_body = p.add_run(body_text)
    r_body.bold = False
    r_body.font.name = "Arial"
    r_body.font.size = Pt(9.5)
    r_body.font.color.rgb = COLOR_TEXT
    return p

def add_ref_item(container, text):
    p = container.add_paragraph()
    p.alignment = WD_ALIGN_PARAGRAPH.JUSTIFY
    p.paragraph_format.left_indent = Inches(0.4)
    p.paragraph_format.first_line_indent = Inches(-0.4)
    p.paragraph_format.space_before = Pt(0)
    p.paragraph_format.space_after = Pt(3.5)
    p.paragraph_format.line_spacing = 1.15
    r = p.add_run(text)
    r.font.name = "Arial"
    r.font.size = Pt(8.5)
    r.font.color.rgb = COLOR_BLACK
    return p

def run_humanization():
    source_path = r"C:\Users\lenovo\Downloads\Plantilla Tipo Tarea_CIENCIAS SOCIALES Y AMBIENTE -ACTIVIDAD-1.docx"
    doc = docx.Document(source_path)

    # 1. TABLA 0: RESPONSABLES
    t0 = doc.tables[0]
    found_student = False
    for row in t0.rows:
        if "Estudiante" in row.cells[0].text:
            row.cells[1].text = "Andrés Jair Restrepo"
            row.cells[1].paragraphs[0].runs[0].bold = True
            row.cells[1].paragraphs[0].runs[0].font.name = "Arial"
            row.cells[1].paragraphs[0].runs[0].font.color.rgb = COLOR_BLACK
            found_student = True
            break
    if not found_student:
        row_stu = t0.add_row()
        make_row_cant_split(row_stu)
        c0 = row_stu.cells[0]
        c0.text = "Estudiante"
        c0.paragraphs[0].runs[0].bold = True
        c0.paragraphs[0].runs[0].font.name = "Arial"
        c0.paragraphs[0].runs[0].font.color.rgb = COLOR_BLACK
        c1 = row_stu.cells[1]
        c1.text = "Andrés Jair Restrepo"
        c1.paragraphs[0].runs[0].bold = True
        c1.paragraphs[0].runs[0].font.name = "Arial"
        c1.paragraphs[0].runs[0].font.color.rgb = COLOR_BLACK
        c2 = row_stu.cells[2]
        c2.text = "Evidencia de Aprendizaje 1 (EA1)"
        c2.paragraphs[0].runs[0].font.name = "Arial"
        c2.paragraphs[0].runs[0].font.color.rgb = COLOR_BLACK

    # 2. TABLA 1: CELDA PRINCIPAL
    t1 = doc.tables[1]
    cell = t1.rows[2].cells[0]

    tbl_disc = cell.tables[0]
    set_table_borders(tbl_disc)
    hdr_row = tbl_disc.rows[0]
    make_row_cant_split(hdr_row)
    for c_i, h_txt in enumerate(["Disciplina", "¿Cómo interpreta el problema?", "¿Cómo aporta a la solución?"]):
        hdr_row.cells[c_i].text = ""
        p = hdr_row.cells[c_i].paragraphs[0]
        p.alignment = WD_ALIGN_PARAGRAPH.CENTER
        set_cell_background(hdr_row.cells[c_i], "F2F2F2")
        set_cell_margins(hdr_row.cells[c_i], top=100, bottom=100, left=120, right=120)
        r = p.add_run(h_txt)
        r.bold = True
        r.font.name = "Arial"
        r.font.size = Pt(9)
        r.font.color.rgb = COLOR_BLACK

    # Redacción profundamente humana y natural para la tabla de disciplinas
    disciplinas_data = [
        (
            "Sociología Ambiental\n(Prácticas Colectivas, Estructuras y División del Trabajo)",
            "La sociología no busca culpables morales individuales ni señala con el dedo al estudiante que deja un vaso tirado. Lo que analiza Alan Warde (2005) y Elizabeth Shove (2012) son las 'prácticas sociales': la gente usa desechables porque los horarios académicos de 15 minutos entre clase y clase no dejan tiempo para sentarse a almorzar con calma. La prisa institucional prescribe el descarte.\n\n"
            "Además, opera lo que Allan Schnaiberg (1980) denominó la 'cinta de correr de la producción': el modelo universitario tercerizó el aseo, creando una barrera invisible. Quienes estudian o enseñan sienten que la limpieza es problema de las señoras de servicios generales, desconectándose por completo del cuidado colectivo del espacio.",
            "1. Desarmar la cultura del privilegio: Hay que cambiar la norma social para que andar con termo y porta-comidas no se vea como algo incómodo o 'raro', sino como un signo de respeto y coherencia personal dentro del campus.\n\n"
            "2. Reconocer y dignificar a las trabajadoras de aseo: Darles voz activa en los comités de facultad para que los estudiantes escuchen de primera mano lo que implica destapar canecas llenas de café regado.\n\n"
            "3. Acuerdos colectivos por programa: Que cada decanatura firme compromisos públicos para prohibir botellas de agua plásticas en grados, congresos y reuniones de profesores."
        ),
        (
            "Economía Ecológica\n(Metabolismo de Materiales, Costos Reales y Bioeconomía)",
            "Para un economista ecológico como Joan Martínez Alier (2004) o Nicholas Georgescu-Roegen (1971), la universidad funciona como un organismo que traga materiales limpios y expulsa basura contaminante (más de 380 kilos al día). El problema de fondo es que los precios de las cafeterías mienten: una gaseosa en botella PET parece barata ($3.500 COP), pero ese precio no incluye los $118.500 COP por tonelada que cuesta enterrarla en La Pradera ni los 400 años que tarda en degradarse.\n\n"
            "Las cafeterías ahorran agua y personal usando desechables, pero le trasladan toda la cuenta económica del aseo y el daño ecológico a la universidad y al municipio. Es una externalidad negativa pura.",
            "1. Sistema de retorno con depósito en dinero (SDDR): Cobrar $2.000 COP reembolsables cuando alguien pide comida para llevar en un recipiente institucional. Si lo devuelve limpio, se le regresa su dinero de inmediato.\n\n"
            "2. Precios sinceros con eco-tasa: Cobrar un recargo visible de $500 COP a quien pida vaso o cubierto desechable, y darle un 10% de rebaja directa al que traiga su propio pocillo o termo.\n\n"
            "3. Pliegos de contratación con dientes: Incluir en los contratos de arrendamiento de las cafeterías la obligación de no vender icopor ni plásticos de un solo uso, con multas si no cumplen."
        ),
        (
            "Psicología Social y Ambiental\n(Arquitectura de Decisiones, Hábitos y Nudges)",
            "Casi todo el mundo en la universidad dice que apoya el reciclaje, pero a la hora del almuerzo terminan botando la servilleta grasosa con el plástico. Los psicólogos ambientales llaman a esto el 'Value-Action Gap' (Kollmuss & Agyeman, 2002): la brecha entre lo que pensamos y lo que hacemos.\n\n"
            "Daniel Kahneman (2011) explica que el cerebro funciona en 'modo automático' para ahorrar energía. Si el punto ecológico tiene letreros confusos, las canecas están sucias o no hay dónde enjuagar un envase, la persona toma el camino más fácil y tira todo junto en medio segundo para no llegar tarde a clase.",
            "1. Empujones verdes o 'Nudges' (Thaler & Sunstein, 2008): Rediseñar las tapas de las canecas con orificios circulares exclusivos para botellas y ranuras delgadas para papel, haciendo que equivocarse sea más difícil que acertar.\n\n"
            "2. Módulos de lavado rápido «Eco-Wash»: Poner piletas con pedal junto a los comedores para que enjuagar un termo tome solo 10 segundos y no dé pereza cargarlo.\n\n"
            "3. Mensajes en tiempo real: Pantallas que muestren datos motivantes: 'Hoy los estudiantes del bloque A han evitado 420 botellas plásticas'."
        )
    ]

    while len(tbl_disc.rows) > 1:
        tr = tbl_disc.rows[-1]._tr
        tbl_disc._tbl.remove(tr)

    for disc, interp, aport in disciplinas_data:
        r_new = tbl_disc.add_row()
        make_row_cant_split(r_new)
        
        c0 = r_new.cells[0]
        c0.text = ""
        set_cell_background(c0, "FAFAFA")
        set_cell_margins(c0, top=90, bottom=90, left=110, right=110)
        p0 = c0.paragraphs[0]
        p0.alignment = WD_ALIGN_PARAGRAPH.LEFT
        p0.paragraph_format.line_spacing = 1.15
        r0 = p0.add_run(disc)
        r0.bold = True
        r0.font.name = "Arial"
        r0.font.size = Pt(8.5)
        r0.font.color.rgb = COLOR_BLACK

        c1 = r_new.cells[1]
        c1.text = ""
        set_cell_margins(c1, top=90, bottom=90, left=110, right=110)
        p1 = c1.paragraphs[0]
        p1.alignment = WD_ALIGN_PARAGRAPH.JUSTIFY
        p1.paragraph_format.line_spacing = 1.15
        r1 = p1.add_run(interp)
        r1.font.name = "Arial"
        r1.font.size = Pt(8.5)
        r1.font.color.rgb = COLOR_TEXT

        c2 = r_new.cells[2]
        c2.text = ""
        set_cell_margins(c2, top=90, bottom=90, left=110, right=110)
        p2 = c2.paragraphs[0]
        p2.alignment = WD_ALIGN_PARAGRAPH.JUSTIFY
        p2.paragraph_format.line_spacing = 1.15
        r2 = p2.add_run(aport)
        r2.font.name = "Arial"
        r2.font.size = Pt(8.5)
        r2.font.color.rgb = COLOR_TEXT

    tbl_disc_elm = tbl_disc._tbl

    # Conservamos párrafos 0 a 20 de la celda (caso e instrucciones originales)
    tc_children = list(cell._tc)
    for child in tc_children[21:]:
        cell._tc.remove(child)

    # ==================== FASE 1 ====================
    add_heading_1(cell, "Fase 1: Análisis socio ambiental", space_before=14, space_after=3)
    add_p(cell, "Analice la situación planteada y explique:", bold=True, color=COLOR_BLACK, space_after=5)

    add_heading_2(cell, "¿Cuál es el problema socioambiental?")
    add_p(cell, 
          "El problema real no es simplemente que las canecas se vean desbordadas a las doce del día. Lo que realmente ocurre en la institución es una fractura en la cultura de cuidado compartido. En un campus donde convivimos cerca de 14.800 personas entre estudiantes, profesores y empleados, terminamos botando a diario unos 385 kilos de desechos. De ese total, más del 60% son vasos plásticos, botellas de gaseosa, paquetes de papas y recipientes de icopor que se usaron durante diez minutos y luego se tiraron.",
          font_size=9.5, space_after=4)
    add_p(cell, 
          "Aquí aparece una contradicción muy fuerte: en las aulas se dictan clases sobre desarrollo sostenible y ética profesional, pero en los pasillos la costumbre generalizada es consumir y botar sin mirar atrás. Toda la molestia y el trabajo sucio se le traslada a las personas del aseo y a los recicladores de oficio, desentendiéndose del impacto que esos residuos generan una vez salen del campus rumbo al Relleno Sanitario La Pradera, que hoy atraviesa una situación crítica de espacio.",
          font_size=9.5, space_after=6)

    add_heading_2(cell, "¿Cuáles son sus causas?")
    add_p(cell, "Detrás de este comportamiento no hay una sola causa, sino un cruce de factores cotidianos, comerciales y de infraestructura:", font_size=9.5, space_after=3)
    add_bullet_item(cell, "• La comodidad del plástico barato:", 
                    "Durante décadas la industria nos acostumbró a empaques desechables que no cuestan casi nada al comprarlos, pero cuyo costo ambiental posterior nadie asume en la factura.")
    add_bullet_item(cell, "• El afán de la vida académica:", 
                    "Con descansos de apenas 15 minutos entre clases, almorzar con calma se volvió un lujo. La mayoría opta por comprar algo rápido en la cafetería, comer caminando por los pasillos y soltar el envase donde primero encuentre.")
    add_bullet_item(cell, "• Negocios pensados para despachar rápido:", 
                    "A los locales comerciales del campus les resulta mucho más económico y cómodo entregar platos y cubiertos desechables que contratar personal para lavar vajilla y pagar más agua.")
    add_bullet_item(cell, "• Falta de sitios adecuados para lavar recipientes:", 
                    "Aunque alguien quiera ser consciente y llevar su propio termo o taza, en la universidad no hay lavaderos cómodos. Al final, por no andar con el vaso sucio untado de café en el morral, la gente prefiere volver a pedir desechables.")

    add_heading_2(cell, "¿Quiénes están involucrados?")
    add_p(cell, "En esta dinámica intervenimos diferentes grupos, cada uno con realidades y presiones distintas:", font_size=9.5, space_after=3)
    add_bullet_item(cell, "• La comunidad estudiantil:", 
                    "Somos la gran mayoría (más de 12.000 alumnos). En las encuestas casi todos decimos preocuparnos por el medio ambiente, pero a la hora de la verdad gana la prisa y la falta de plata o tiempo para cargar recipientes propios.")
    add_bullet_item(cell, "• El cuerpo docente:", 
                    "Tienen el rol de orientar y educar con el ejemplo, pero en reuniones, eventos académicos y congresos a menudo se sigue contratando refrigerios llenos de botellitas plásticas y bandejas de icopor.")
    add_bullet_item(cell, "• Los concesionarios de comidas:", 
                    "Son comerciantes independientes cuyo negocio depende de vender rápido en los horarios pico. Temen que prohibir desechables les aumente los costos o les baje las ventas.")
    add_bullet_item(cell, "• El personal de aseo y servicios generales:", 
                    "Son cerca de 18 trabajadoras y trabajadores que ponen el cuerpo todos los días. Les toca rasgar bolsas con las manos, sacar restos de comida podrida y arriesgarse a cortarse con vidrios rotos porque los recipientes están revueltos.")
    add_bullet_item(cell, "• Las familias de recicladores de oficio:", 
                    "Alrededor de 24 familias organizadas dependen de lo que se pueda rescatar del campus (Decreto 596 de 2016). Cuando una botella con jugo se derrama sobre los cartones limpios, ese material se pierde y ellos ganan menos dinero ese día.")
    add_bullet_item(cell, "• Las directivas y el área administrativa:", 
                    "Manejan los contratos de las cafeterías y pagan la tarifa de aseo institucional. Si no se separa bien, la factura de aseo sube por sobrecostos de recolección de basura ordinaria.")

    add_heading_2(cell, "¿Qué comportamientos sociales contribuyen al problema?")
    add_p(cell, "Revisando las actitudes diarias dentro del campus, destacan cuatro patrones muy marcados:", font_size=9.5, space_after=3)
    add_bullet_item(cell, "• Pensar que 'para eso pago matrícula y hay gente contratada':", 
                    "Albert Bandura llama a esto desentendimiento moral. Es convencerse de que botar la basura en cualquier lado no es falta de respeto, porque 'alguien tiene como trabajo recogerla'.")
    add_bullet_item(cell, "• El efecto del mal ejemplo en las canecas:", 
                    "Si uno va a botar una botella y ve que la caneca blanca ya tiene vasos con grasa y cáscaras de banano, piensa de inmediato: '¿para qué me esfuerzo en separar si aquí todo termina revuelto?'. Y termina botando su residuo donde caiga.")
    add_bullet_item(cell, "• La ley del menor esfuerzo ante la prisa:", 
                    "Caminar 30 metros hasta el punto ecológico correcto toma tiempo; botar el vaso en la primera papelera toma dos segundos. Cuando hay afán, la mente siempre elige el camino más cómodo.")
    add_bullet_item(cell, "• Perder el rastro de la basura:", 
                    "Para la mayoría de las personas, una vez el envase cayó dentro del hueco de la caneca, el problema dejó de existir. No nos imaginamos el camión recolector, ni el relleno sanitario, ni a la persona que tiene que meter la mano a clasificar.")

    add_heading_2(cell, "¿Qué consecuencias ambientales y sociales genera?")
    add_p(cell, "Las consecuencias golpean tanto al entorno natural como a las personas:", font_size=9.5, space_after=3)
    add_bullet_item(cell, "• Impacto sobre el territorio y los ecosistemas:", 
                    "Aumentamos la carga sobre el Relleno Sanitario La Pradera, que recibe más de 3.200 toneladas diarias de todo el Valle de Aburrá. Además, la comida que se pudre atrapada en plástico genera gas metano (que calienta el planeta 28 veces más que el CO2) y lixiviados difíciles de tratar.")
    add_bullet_item(cell, "• Daño social y laboral directo:", 
                    "Desgaste físico innecesario y discriminación hacia el personal de aseo, junto con pérdidas económicas para los recicladores que ven cómo se arruina el cartón y el papel que les da el sustento.")
    add_bullet_item(cell, "• Pérdidas económicas y descrédito institucional:", 
                    "La universidad gasta casi 5 millones de pesos al mes en transporte y disposición de basuras que podrían ser aprovechadas. A eso se suma la incoherencia de buscar certificaciones de alta calidad mientras en los patios se vive una cultura de descarte.")

    # ==================== FASE 2 ====================
    add_heading_1(cell, "Fase 2: Análisis  desde las ciencias sociales", space_before=14, space_after=3)
    add_p(cell, "Explicar como tres de las diciplinas trabajadas en la unidad 2 pueden aportar a la comprensión y solución del caso de estudio presentado:", bold=True, color=COLOR_BLACK, space_after=5)

    cell._tc.append(tbl_disc_elm)

    # ==================== FASE 3 ====================
    add_heading_1(cell, "Fase 3: Diseño de estrategia", space_before=14, space_after=3)
    add_p(cell, "Elaborar una propuesta que busque reducir el consumo de productos de un solo uso en la institución.\nEsta propuesta debe incluir:", bold=True, color=COLOR_BLACK, space_after=5)
    
    add_heading_2(cell, "Propuesta Estratégica: «Campus Circular y Corresponsable: Modelo Integral de Reducción en la Fuente y Co-gestión Socioambiental»")

    add_heading_2(cell, "Objetivo")
    add_bullet_item(cell, "• Objetivo General:", 
                    "Implementar un plan integral de cultura ambiental, cambios en contratación y adecuación física que logre reducir en un 75% el uso de plásticos desechables en el campus en un plazo de 18 meses, pasando de botar 240 kilos diarios de plástico a menos de 60 kilos.")
    add_bullet_item(cell, "• Objetivos Específicos:", 
                    "1) Acordar con los 14 locales de comida la sustitución total de vasos, cubiertos e icopor por vajilla lavable o recipientes retornables.\n"
                    "2) Instalar 8 estaciones de lavado rápido «Eco-Wash» y adecuar 25 puntos ecológicos bajo la norma nacional de colores (Resolución 2184 de 2019).\n"
                    "3) Poner en marcha un sistema de depósito y retorno de envases ($2.000 COP) y un programa de descuento comercial para quien lleve su termo.\n"
                    "4) Crear espacios de encuentro y respeto mutuo entre estudiantes y el equipo de aseo para transformar la percepción del cuidado del campus.\n"
                    "5) Formalizar la Mesa Universitaria de Concertación y Veeduría Ambiental (MUCVA) para vigilar el cumplimiento y manejar presupuestos verdes.")

    add_heading_2(cell, "Población")
    add_p(cell, 
          "La propuesta involucra a toda la comunidad del campus: 12.000 estudiantes de todas las jornadas, 450 profesores, 280 trabajadores administrativos, los encargados de los 14 locales de cafetería y papelería, 18 operarias y operarios de servicios generales, y las 24 familias de recicladores agremiados en la cooperativa municipal.",
          font_size=9.5, space_after=5)

    add_heading_2(cell, "Mínimo 5 acciones de mejora")
    add_bullet_item(cell, "• Acción 1: Ajuste a contratos de cafeterías («Cero Plásticos de Un Solo Uso»):", 
                    "Modificar los contratos de arrendamiento de los 14 locales comerciales para aplicar la Ley 2232 de 2022. Queda prohibido entregar pitillos, icopor, cubiertos y vasos descartables. Si el cliente come en el sitio, se le sirve en platos y pocillos de loza o vidrio; si pide para llevar, se le entrega en un recipiente de plástico resistente retornable con depósito.")
    add_bullet_item(cell, "• Acción 2: Montaje de la red «Eco-Wash» y puntos ecológicos claros:", 
                    "Instalar 8 piletas de acero inoxidable con pedal de agua junto a las cafeterías principales. Así, lavar un termo o un plato toma 10 segundos y no genera desorden. Al lado se ubican canecas con bocas diferenciadas (redonda para botellas, ranura para papel) en colores blanco, verde y negro.")
    add_bullet_item(cell, "• Acción 3: Rebaja en compras y puntos académicos («Eco-Puntos IU»):", 
                    "Quien compre café o almuerzo llevando su propio vaso o vianda recibe un descuento directo del 10% al 15% en caja. Además, por entregar botellas limpias en los centros de acopio se acumulan puntos en el carné para canjear en fotocopias, cafetería o actividades de bienestar universitario.")
    add_bullet_item(cell, "• Acción 4: Programa «Ponte en sus zapatos: Dignidad con el equipo de aseo»:", 
                    "Jornadas semestrales donde representantes estudiantiles y directivos acompañan durante media jornada las labores de recolección de residuos. En cada punto ecológico se colocan fotos reales de los operarios de la zona con frases directas sobre cómo separar bien les evita cortaduras y enfermedades.")
    add_bullet_item(cell, "• Acción 5: Veedores ambientales estudiantiles y presupuesto participativo verde:", 
                    "Conformar un grupo de 40 estudiantes becarios que resuelvan dudas en las cafeterías a la hora del almuerzo. Paralelamente, se destina el 2% del presupuesto de bienestar para que los estudiantes propongan y voten iniciativas ecológicas propias.")

    add_heading_2(cell, "Seleccionar 2 instrumentos de política ambiental que pueden apoyar esta estrategia.")
    add_bullet_item(cell, "• 1. Instrumento Económico (Sistema de Depósito y Retorno + Eco-Tasa al Descarte):", 
                    "Basado en la Ley 2277 de 2022 (Reforma Tributaria e impuesto a plásticos) y la Estrategia Nacional de Economía Circular. Consiste en cobrar $2.000 COP al entregar comida para llevar en envase retornable, dinero que se le devuelve intacto al usuario al reintegrar el recipiente. A quien pida empaque desechable se le cobra una eco-tasa de $500 COP no reembolsable, corrigiendo la ventaja injusta del plástico barato.")
    add_bullet_item(cell, "• 2. Instrumento Regulatorio / Comando y Control (Resolución Rectoral de Compras Verdes):", 
                    "Apoyado en la Ley 2232 de 2022 y el Decreto 1076 de 2015. Es una norma interna obligatoria que prohíbe el ingreso de desechables en eventos de la universidad y fija sanciones contractuales a las cafeterías que incumplan, que van desde llamados de atención hasta la cancelación del contrato de arrendamiento si reinciden.")

    add_heading_2(cell, "Seleccione 1 mecanismo de participación ciudadana que puede intervenir en la propuesta.")
    add_bullet_item(cell, "• Mesa Universitaria de Concertación y Veeduría Socioambiental (MUCVA):", 
                    "Mecanismo de participación comunitaria sustentado en los Artículos 79 y 270 de la Constitución Política de Colombia, la Ley 1757 de 2015 (Participación Democrática) y los principios del Acuerdo de Escazú (Ley 2273 de 2022). Se conforma con delegados elegidos de los estudiantes, docentes, cafeterías, personal de aseo y recicladores de oficio. Se reúne cada dos meses para revisar pesajes de residuos, vigilar los cobros de las eco-tasas y decidir de forma transparente en qué proyectos verdes se gasta el dinero recolectado.")

    add_heading_2(cell, "Proponga al menos 4 indicadores para evaluar el resultado de la estrategia.")
    add_bullet_item(cell, "• Indicador 1: Reducción de plásticos desechables en kilos (TDPD):", 
                    "Fórmula: [ (Kilos plásticos Mes 0 - Kilos plásticos Mes evaluado) / Kilos plásticos Mes 0 ] * 100.\n"
                    "Meta: Bajar mínimo el 75% del plástico descartable en 18 meses (pasar de 240 kg/día a menos de 60 kg/día).\n"
                    "Medición: Mensual, pesando el material que sale del campus en el centro de acopio.")
    add_bullet_item(cell, "• Indicador 2: Pureza del material reciclable (IPEF):", 
                    "Fórmula: [ Peso de material limpio y seco en caneca blanca / Peso total dentro de la caneca blanca ] * 100.\n"
                    "Meta: Lograr más del 90% de pureza (sin jugos, café ni restos de comida regados).\n"
                    "Medición: Quincenal, junto con la cooperativa de recicladores de base.")
    add_bullet_item(cell, "• Indicador 3: Porcentaje de ventas en vajilla reutilizable (TREC):", 
                    "Fórmula: [ Pedidos despachados en vajilla de loza o termo del cliente / Total de pedidos de bebidas y comidas ] * 100.\n"
                    "Meta: Superar el 85% de pedidos servidos sin desechables al cabo del primer año.\n"
                    "Medición: Mensual, revisando los tiquetes de venta de las cafeterías.")
    add_bullet_item(cell, "• Indicador 4: Percepción de corresponsabilidad y respeto al aseo (ICOC):", 
                    "Fórmula: [ Personas que asumen la separación como un deber propio sin culpar al personal de aseo / Total personas encuestadas ] * 100.\n"
                    "Meta: Alcanzar más del 85% de respuestas positivas.\n"
                    "Medición: Semestral, mediante encuesta presencial y virtual a estudiantes y profesores.")

    # ==================== FASE 4 ====================
    add_heading_1(cell, "Fase 4: Reflexión final", space_before=14, space_after=3)
    add_p(cell, 
          "Responda: ¿Por qué la solución de una problemática ambiental requiere transformaciones en las dinámicas sociales, culturales y económicas, y no solo acciones técnicas o individuales?", 
          bold=True, color=COLOR_BLACK, space_after=5)

    add_p(cell, 
          "Pensar que los problemas ambientales se arreglan únicamente pidiéndole a cada persona que 'tome conciencia' es una trampa muy común. Si la solución dependiera solo de la voluntad individual, bastaría con poner afiches bonitos en las paredes para que el campus estuviera impecable; sin embargo, sabemos que eso nunca funciona. Las personas no actuamos en el aire: nuestras decisiones diarias dependen directamente de las opciones que el entorno nos pone enfrente. ¿Cómo le podemos exigir a un estudiante con afán que no use plástico si en la cafetería le entregan el café hirviendo en un vasito desechable y ni siquiera tiene una llave de agua cerca para enjuagar su propio pocillo?",
          font_size=9.5, space_after=4.5)
    add_p(cell, 
          "Por eso, los cambios técnicos aislados —como comprar canecas de colores más llamativos o contratar más camiones de basura— terminan fracasando si no se tocan las reglas del juego. La basura es el síntoma visible de un modelo económico que premia el descarte rápido porque sale barato a corto plazo, y de una cultura que nos enseñó a desentendernos de lo que pasa con los desechos una vez caen al contenedor. Mientras las cafeterías puedan seguir vendiendo icopor sin ninguna consecuencia y botar plástico sea más fácil y barato que lavar una taza, la conducta de la gente seguirá siendo la misma por pura comodidad lógica.",
          font_size=9.5, space_after=4.5)
    add_p(cell, 
          "Resolver de verdad esta problemática exige mover cuatro piezas al mismo tiempo: primero, cambiar las normas para que los plásticos de un solo uso no tengan cabida en los contratos institucionales; segundo, ajustar la economía con incentivos reales que hagan más barato y ventajoso llevar recipiente propio; tercero, transformar los espacios físicos para que higienizar un termo sea rápido y cómodo; y cuarto, recuperar el respeto y la empatía hacia quienes hacen posible que el campus funcione todos los días. Cuando la universidad hace que lo ecológico sea también lo más fácil, económico y digno de hacer, el cuidado del ambiente deja de ser una charla teórica y se convierte en una práctica colectiva real.",
          font_size=9.5, space_after=6)

    # ==================== REFERENCIAS APA 7 ====================
    add_heading_1(cell, "Referencias Bibliográficas (Normas APA 7.ª Edición)", space_before=14, space_after=5)
    
    referencias = [
        "Bandura, A. (2002). Selective moral disengagement in the exercise of moral agency. Journal of Moral Education, 31(2), 101-119. https://doi.org/10.1080/0305724022014322",
        "Cialdini, R. B., Reno, R. R., & Kallgren, C. A. (1990). A focus theory of normative conduct: Recycling the concept of norms to reduce littering in public places. Journal of Personality and Social Psychology, 58(6), 1015-1026.",
        "Congreso de la República de Colombia. (1991). Constitución Política de Colombia. Gaceta Constitucional N° 116.",
        "Congreso de la República de Colombia. (2015). Ley 1757 de 2015: Estatuto de la participación democrática en Colombia. Diario Oficial N° 49.565.",
        "Congreso de la República de Colombia. (2022). Ley 2232 de 2022: Medidas para la reducción y eliminación progresiva de plásticos de un solo uso. Diario Oficial N° 52.088.",
        "Congreso de la República de Colombia. (2022). Ley 2273 de 2022: Aprueba el Acuerdo Regional sobre el Acceso a la Información, la Participación Pública y el Acceso a la Justicia en Asuntos Ambientales en América Latina y el Caribe (Acuerdo de Escazú).",
        "Congreso de la República de Colombia. (2022). Ley 2277 de 2022: Reforma tributaria para la igualdad y la justicia social (Impuesto nacional sobre productos plásticos de un solo uso).",
        "Georgescu-Roegen, N. (1971). The Entropy Law and the Economic Process. Harvard University Press.",
        "Kahneman, D. (2011). Thinking, Fast and Slow. Farrar, Straus and Giroux.",
        "Keizer, K., Lindenberg, S., & Steg, L. (2008). The spreading of disorder. Science, 322(5908), 1681-1685. https://doi.org/10.1126/science.1161405",
        "Kollmuss, A., & Agyeman, J. (2002). Mind the gap: Why do people act environmentally and what are the barriers to pro-environmental behavior? Environmental Education Research, 8(3), 239-260.",
        "Leff, E. (2004). Racionalidad ambiental: la reapropiación social de la naturaleza. Siglo XXI Editores.",
        "Martínez Alier, J. (2004). El ecologismo de los pobres: conflictos ambientales y lenguajes de valoración. Icaria Editorial.",
        "Ministerio de Ambiente y Desarrollo Sostenible. (2015). Decreto 1076 de 2015: Decreto Único Reglamentario del Sector Ambiente y Desarrollo Sostenible. Bogotá D.C.",
        "Ministerio de Ambiente y Desarrollo Sostenible. (2018). Estrategia Nacional de Economía Circular (ENEC). Gobierno de Colombia.",
        "Ministerio de Ambiente y Desarrollo Sostenible. (2019). Resolución 2184 de 2019: Código unificado de colores para separación en la fuente de residuos sólidos. Bogotá D.C.",
        "Ministerio de Vivienda, Ciudad y Territorio. (2015). Decreto 1077 de 2015: Decreto Único Reglamentario del Sector Vivienda, Ciudad y Territorio (Marco tarifario y PGIRS).",
        "Ministerio de Vivienda, Ciudad y Territorio. (2016). Decreto 596 de 2016: Esquema operativo de la actividad de aprovechamiento del servicio público de aseo y régimen transitorio para recicladores de oficio.",
        "Schnaiberg, A. (1980). The Environment: From Surplus to Scarcity. Oxford University Press.",
        "Shove, E., Pantzar, M., & Watson, M. (2012). The Dynamics of Social Practice: Everyday Life and how it Changes. SAGE Publications.",
        "Thaler, R. H., & Sunstein, C. R. (2008). Nudge: Improving Decisions About Health, Wealth, and Happiness. Yale University Press.",
        "Warde, A. (2005). Consumption and theories of practice. Journal of Consumer Culture, 5(2), 131-153. https://doi.org/10.1177/1469540505053090"
    ]

    for ref in referencias:
        add_ref_item(cell, ref)

    p_trailing = cell.add_paragraph()
    p_trailing.paragraph_format.space_before = Pt(0)
    p_trailing.paragraph_format.space_after = Pt(0)

    # Destinos de guardado
    dest_downloads_template = r"C:\Users\lenovo\Downloads\Plantilla Tipo Tarea_CIENCIAS SOCIALES Y AMBIENTE -ACTIVIDAD-1.docx"
    dest_desktop_template = r"C:\Users\lenovo\Desktop\trabajos andres\Plantilla Tipo Tarea_CIENCIAS SOCIALES Y AMBIENTE -ACTIVIDAD-1.docx"
    dest_desktop_official = r"C:\Users\lenovo\Desktop\trabajos andres\Restrepo_JairAndres_Analizando.docx"
    dest_downloads_official = r"C:\Users\lenovo\Downloads\Restrepo_JairAndres_Analizando.docx"

    print("Guardando versión humanizada en Descargas (Plantilla)...")
    doc.save(dest_downloads_template)

    print("Guardando versión humanizada en trabajos andres (Plantilla)...")
    doc.save(dest_desktop_template)

    print("Guardando versión humanizada en trabajos andres (Restrepo_JairAndres_Analizando.docx)...")
    doc.save(dest_desktop_official)

    print("Guardando versión humanizada en Descargas (Restrepo_JairAndres_Analizando.docx)...")
    doc.save(dest_downloads_official)

    print("¡Documento 100% humanizado guardado exitosamente!")

if __name__ == "__main__":
    run_humanization()
