# -*- coding: utf-8 -*-
r"""
Script maestro para estructurar la Plantilla Oficial de la IU Digital:
'Plantilla Tipo Tarea_CIENCIAS SOCIALES Y AMBIENTE -ACTIVIDAD-1.docx'
"""

import os
import copy
import docx
from docx.shared import Inches, Pt, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.enum.table import WD_TABLE_ALIGNMENT
from docx.oxml import OxmlElement, parse_xml
from docx.oxml.ns import nsdecls, qn

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

def add_p(container, text="", bold=False, italic=False, font_size=10, color=COLOR_TEXT, align=WD_ALIGN_PARAGRAPH.JUSTIFY, space_before=0, space_after=5, first_line_indent=0):
    p = container.add_paragraph()
    p.alignment = align
    p.paragraph_format.space_before = Pt(space_before)
    p.paragraph_format.space_after = Pt(space_after)
    p.paragraph_format.line_spacing = 1.15
    if first_line_indent > 0:
        p.paragraph_format.first_line_indent = Inches(first_line_indent)
    if text:
        r = p.add_run(text)
        r.bold = bold
        r.font.italic = italic
        r.font.name = "Arial"
        r.font.size = Pt(font_size)
        r.font.color.rgb = color
    return p

def add_heading_1(container, text, space_before=14, space_after=4):
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

def add_action_item(container, action_title, action_body):
    p = container.add_paragraph()
    p.alignment = WD_ALIGN_PARAGRAPH.JUSTIFY
    p.paragraph_format.space_before = Pt(3)
    p.paragraph_format.space_after = Pt(4)
    p.paragraph_format.line_spacing = 1.15
    
    r_title = p.add_run(action_title + " ")
    r_title.bold = True
    r_title.font.name = "Arial"
    r_title.font.size = Pt(9.5)
    r_title.font.color.rgb = COLOR_BLACK
    
    r_body = p.add_run(action_body)
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
    p.paragraph_format.space_after = Pt(4)
    p.paragraph_format.line_spacing = 1.15
    r = p.add_run(text)
    r.font.name = "Arial"
    r.font.size = Pt(8.5)
    r.font.color.rgb = COLOR_BLACK
    return p

def build_perfect_template():
    source_path = r"C:\Users\lenovo\Downloads\Plantilla Tipo Tarea_CIENCIAS SOCIALES Y AMBIENTE -ACTIVIDAD-1.docx"
    doc = docx.Document(source_path)

    # 1. TABLA 0: RESPONSABLES
    t0 = doc.tables[0]
    # Revisamos si ya tiene fila de Estudiante o la actualizamos
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

    # Extraemos las tablas anidadas existentes antes de limpiar
    # Table 0: 3 disciplinas
    # Table 1: caja de entrega
    # Table 2: nota de rúbrica
    tbl_disc = cell.tables[0]
    tbl_entrega = cell.tables[1] if len(cell.tables) > 1 else None
    tbl_rubrica = cell.tables[2] if len(cell.tables) > 2 else None

    # Preparamos la tabla de 3 disciplinas con contenido perfecto
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

    disciplinas_data = [
        (
            "Sociología Ambiental\n(Estructura Social, Prácticas Colectivas y Jerarquías de Cuidado)",
            "Interpreta la crisis no como una sumatoria de defectos morales individuales, sino como el producto de 'Sistemas de Provisión' y 'Prácticas Sociales' colectivas institucionalizadas (Warde, 2005). La comunidad consume desechables porque la estructura del campus y la aceleración del tiempo escolar imponen ese patrón.\n\n"
            "Asimismo, aplica la teoría de la 'Cinta de Correr de la Producción' (Schnaiberg, 1980) y la estratificación sociolaboral interna: las élites intelectuales externalizan las tareas degradantes de limpieza hacia un estamento subalterno, invisibilizando la economía del cuidado y fracturando el contrato social de convivencia.",
            "1. Desnormalización de la cultura del privilegio: Construir nuevas normas sociales compartidas donde portar un termo y vajilla propia sea un símbolo de prestigio ético y pertenencia comunitaria en la universidad.\n\n"
            "2. Democratización sociolaboral y justicia interna: Visibilizar y empoderar a las operarias de aseo como formadoras ambientales con autoridad moral en los comités de bienestar y ordenamiento del campus.\n\n"
            "3. Acuerdos colectivos vinculantes: Fomentar pactos de convivencia por facultad para erradicar el plástico en eventos académicos y reuniones de departamento."
        ),
        (
            "Economía Ecológica\n(Metabolismo Social, Externalidades y Bioeconomía)",
            "Concibe la universidad como un organismo biofísico abierto que engulle flujos de materia y energía de baja entropía para excretar basura contaminante, ignorando la capacidad de asimilación del ecosistema regional.\n\n"
            "Desde la economía ambiental aplicada, detecta una flagrante 'externalidad negativa no internalizada': las cafeterías expenden desechables porque transfieren el costo de recolección y enterramiento a la administración y al planeta. El precio de mercado de un jugo en botella PET oculta su verdadero costo social, incentivando artificialmente la opción más contaminante.",
            "1. Internalización económica mediante SDDR: Estructurar un Sistema de Depósito, Devolución y Retorno que asigne un valor monetario recuperable al envase retornable, incentivando su reintegro.\n\n"
            "2. Señales de precio transparentes: Imponer una eco-tasa visible al empaque descartable ($500 COP) y otorgar un descuento directo del 10% al 15% a los usuarios que aporten vajilla limpia.\n\n"
            "3. Contratación pública circular: Incorporar pliegos de compras verdes que obliguen a los concesionarios a asumir metas contractuales de cero descartables so pena de rescisión de concesión."
        ),
        (
            "Psicología Social y Ambiental\n(Arquitectura de Decisiones, Sesgos y Teoría del Nudge)",
            "Diagnostica el 'Value-Action Gap' (Kollmuss & Agyeman, 2002): una persona puede tener una sólida preocupación ambiental teórica, pero al interactuar con el entorno físico actúa bajo heurísticas de menor esfuerzo y sesgo del presente.\n\n"
            "La 'Arquitectura de Decisiones' (Thaler & Sunstein, 2008) del campus está mal diseñada: canecas con orificios confusos y la ausencia de lavaderos generan fatiga cognitiva. Ante la menor incomodidad o prisa, el usuario elige automáticamente la opción más cómoda: arrojar todo junto.",
            "1. Aplicación de Nudges (Empujones Verdes): Modificar el entorno con señalética hiper-intuitiva, bocas geométricas específicas y código de colores contrastante (Res. 2184/2019) que guíen la acción correcta de forma refleja.\n\n"
            "2. Estaciones de bajo esfuerzo «Eco-Wash»: Instalar módulos de higienización rápida con grifos temporizados de pedal junto a los puntos ecológicos para eliminar la pereza de lavar recipientes.\n\n"
            "3. Refuerzo social positivo en tiempo real: Pantallas que informen en vivo: 'En esta plazoleta hoy la comunidad ha evitado 850 botellas plásticas'."
        )
    ]

    # Limpiamos las filas de datos anteriores si ya estaban agregadas
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

    # Actualizamos la caja de entrega si existe
    if tbl_entrega:
        tbl_entrega.rows[0].cells[0].text = "Restrepo_JairAndres_Analizando.docx"
        p_nom = tbl_entrega.rows[0].cells[0].paragraphs[0]
        p_nom.alignment = WD_ALIGN_PARAGRAPH.CENTER
        p_nom.runs[0].bold = True
        p_nom.runs[0].font.name = "Arial"
        p_nom.runs[0].font.color.rgb = COLOR_BLACK

    # Ahora limpiamos los elementos sobrantes en cell._tc desde el elemento 22 en adelante
    # Manteniendo intactos:
    # 0..21 (encabezado institucional y caso de estudio)
    # y manteniendo las referencias de tbl_disc, tbl_entrega y tbl_rubrica
    tbl_disc_elm = tbl_disc._tbl
    tbl_entrega_elm = tbl_entrega._tbl if tbl_entrega else None
    tbl_rubrica_elm = tbl_rubrica._tbl if tbl_rubrica else None

    # Guardamos los elementos de 0 a 21
    tc_children = list(cell._tc)
    for child in tc_children[22:]:
        cell._tc.remove(child)

    # Ahora agregamos ordenadamente cada sección con formato APA 7 y títulos en NEGRO BOLD

    # ==================== FASE 1 ====================
    add_heading_1(cell, "Fase 1: Análisis Socioambiental del Caso de Estudio", space_before=14, space_after=4)
    add_p(cell, "A continuación se analiza la situación planteada a la luz de la ecología política y las ciencias ambientales, respondiendo a cada uno de los interrogantes estructurantes:", font_size=9.5, space_after=6)

    # Pregunta 1
    add_heading_2(cell, "1. ¿Cuál es el problema socioambiental?")
    add_p(cell, 
          "El problema socioambiental analizado trasciende con creces la mera acumulación visible de residuos sólidos en recipientes de basura. "
          "Consiste fundamentalmente en una fractura de la corresponsabilidad comunitaria y la instauración de una cultura de consumo lineal acelerado, "
          "donde los estamentos universitarios externalizan las consecuencias ecológicas y laborales de su confort cotidiano hacia los sectores más "
          "vulnerables de la estructura institucional: el personal de servicios generales y los recuperadores ambientales de base.", 
          font_size=9.5, space_after=4)
    add_p(cell, 
          "Se evidencia una profunda disonancia ética y estructural: mientras en las aulas se debaten principios de bioética y desarrollo sustentable, "
          "en los pasillos, plazoletas y cafeterías prevalece el descarte masivo de polímeros petroquímicos de un solo uso que tardan cientos de años "
          "en degradarse, empleados durante apenas diez minutos. La infraestructura física actual opera de manera pasiva y descontextualizada, "
          "generando una desconexión metabólica entre el consumo intra-campus y el pasivo ambiental transferido al relleno sanitario regional.", 
          font_size=9.5, space_after=6)

    # Pregunta 2
    add_heading_2(cell, "2. ¿Cuáles son sus causas?")
    add_p(cell, "La problemática responde a una multiplicidad de factores socioeconómicos, infraestructurales y culturales articulados:", font_size=9.5, space_after=3)
    add_action_item(cell, "• Expansión petroquímica y abaratamiento de polímeros descartables:", "La industria sustituyó los esquemas de botellas y envases retornables por empaques descartables de bajísimo costo de mercado, externalizando su tratamiento final.")
    add_action_item(cell, "• Aceleración del tiempo social y patrones «On-the-go»:", "Horarios académicos comprimidos y descansos de corta duración desincentivan la alimentación pausada, fomentando el consumo de alimentos procesados y bebidas en envases descartables.")
    add_action_item(cell, "• Desregulación comercial en cafeterías concesionadas:", "Los contratos de arrendamiento comercial privilegian el pago del canon sin imponer pliegos de compras públicas sostenibles ni prohibir los desechables.")
    add_action_item(cell, "• Infraestructura pasiva y carencia de módulos de higienización:", "La inexistencia de piletas para el enjuague rápido de recipientes obliga a descartar envases con restos orgánicos, contaminando irreversiblemente el papel y cartón reciclable en los puntos ecológicos.")

    # Pregunta 3
    add_heading_2(cell, "3. ¿Quiénes están involucrados?")
    add_p(cell, "En el territorio universitario convergen diversos actores sociales con lógicas e intereses específicos:", font_size=9.5, space_after=3)
    add_action_item(cell, "• Estudiantes de pregrado y posgrado:", "Constituyen el mayor volumen demográfico del campus. Manifiestan alta conciencia ambiental teórica pero baja disposición al esfuerzo físico de higienizar y portar vajilla reutilizable.")
    add_action_item(cell, "• Docentes e investigadores:", "Líderes formadores y referentes de opinión que, en ocasiones, reproducen prácticas de descarte en seminarios, congresos y reuniones de trabajo.")
    add_action_item(cell, "• Concesionarios de cafeterías y locales comerciales:", "Actores privados enfocados en maximizar utilidades y acelerar despachos, prefiriendo empaques descartables para ahorrar costos de personal y lavado.")
    add_action_item(cell, "• Personal de servicios generales (operarios de aseo):", "Sector laboral subalterno que asume la sobrecarga física, el riesgo biomecánico y la exposición a patógenos al tener que reclasificar bolsas contaminadas sin reconocimiento social.")
    add_action_item(cell, "• Asociaciones de recicladores de base (Decreto 596 de 2016):", "Familias de recuperadores agremiados cuyo sustento depende de la recolección de materiales limpios y secos, perjudicadas cuando los reciclables llegan impregnados de grasas o jugos.")
    add_action_item(cell, "• Directivas y dependencias administrativas:", "Encargadas del marco reglamentario, la gestión del presupuesto y la tarifa de aseo institucional (Decreto 1077 de 2015).")

    # Pregunta 4
    add_heading_2(cell, "4. ¿Qué comportamientos sociales contribuyen al problema?")
    add_p(cell, "Se identifican patrones de conducta colectiva explicables desde la sociología y la psicología social:", font_size=9.5, space_after=3)
    add_action_item(cell, "• Desentendimiento moral y transferencia de responsabilidad (Bandura, 2002):", "Creencia generalizada de que la separación y limpieza no corresponde a los usuarios porque pagan matrícula y 'para eso hay empleados de aseo'.")
    add_action_item(cell, "• Degeneración de la norma descriptiva (efecto 'Ventanas Rotas'):", "Cuando un usuario observa una caneca de reciclaje contaminada con restos de comida, infiere que la norma colectiva tolera el desorden y arroja su propio residuo sin clasificar.")
    add_action_item(cell, "• Heurística del menor esfuerzo y sesgo del presente:", "La comodidad inmediata de soltar un vaso en la primera caneca disponible se antepone a la búsqueda del punto ecológico adecuado o al lavado del recipiente.")
    add_action_item(cell, "• Desconexión cognitiva del metabolismo de residuos:", "Pérdida de noción de destino: una vez el residuo desaparece dentro del orificio del contenedor, el usuario se desentiende por completo de su trazabilidad territorial.")

    # Pregunta 5
    add_heading_2(cell, "5. ¿Qué consecuencias ambientales y sociales genera?")
    add_p(cell, "Las repercusiones abarcan múltiples dimensiones territoriales e institucionales:", font_size=9.5, space_after=3)
    add_action_item(cell, "• Consecuencias ambientales:", "Saturación prematura del relleno sanitario regional, incremento de emisiones de metano (CH4) por descomposición anaeróbica de materia orgánica atrapada y fragmentación de plásticos en microplásticos contaminantes de fuentes hídricas.")
    add_action_item(cell, "• Consecuencias sociales y laborales:", "Precarización y humillación implícita del personal de aseo, vulneración de los derechos laborales y de salud en el trabajo, y reducción de ingresos de los recicladores de oficio.")
    add_action_item(cell, "• Consecuencias económicas e institucionales:", "Incremento en los costos de facturación del servicio público de aseo (Decreto 1076 de 2015) y pérdida de coherencia ética y reputación de la universidad frente a sus acreditaciones de alta calidad.")

    # ==================== FASE 2 ====================
    add_heading_1(cell, "Fase 2: Análisis desde las Ciencias Sociales", space_before=14, space_after=4)
    add_p(cell, 
          "A continuación se presenta la matriz analítica donde tres disciplinas fundamentales de las ciencias sociales "
          "(Sociología Ambiental, Economía Ecológica y Psicología Social-Ambiental) interpretan la raíz del problema socioambiental "
          "en el campus universitario y formulan sus respectivos aportes a la solución integral:", 
          font_size=9.5, space_after=6)

    # Insertamos la tabla de disciplinas tbl_disc
    cell._tc.append(tbl_disc_elm)

    # ==================== FASE 3 ====================
    add_heading_1(cell, "Fase 3: Diseño de Estrategia Socioambiental", space_before=14, space_after=4)
    add_heading_2(cell, "Propuesta Estratégica: «Campus Circular y Corresponsable»")
    
    add_heading_2(cell, "1. Objetivos del Plan:")
    add_action_item(cell, "• Objetivo General:", "Diseñar, implementar y consolidar un modelo integral de descarbonización de materiales y corresponsabilidad socioambiental en el campus, logrando abatir en un 75% el volumen de plásticos y empaques descartables en un horizonte de 18 meses, transformando los hábitos de consumo mediante instrumentos normativos, económicos, infraestructura facilitadora y gobernanza comunitaria vinculante.")
    add_action_item(cell, "• Objetivos Específicos:", "1) Erradicar de forma concertada y progresiva los plásticos descartables en cafeterías mediante vajilla institucional y esquemas de préstamo. 2) Readecuar la infraestructura de disposición con puntos ecológicos inteligentes (Resolución 2184 de 2019) y módulos «Eco-Wash». 3) Implementar incentivos y desincentivos financieros (Sistema de Depósito, Devolución y Retorno - SDDR). 4) Dignificar al personal de aseo mediante campañas vivenciales de empatía. 5) Consolidar la Mesa Universitaria de Concertación y Veeduría Ambiental (MUCVA).")

    add_heading_2(cell, "2. Población Objetivo:")
    add_p(cell, 
          "La estrategia abarca a toda la comunidad universitaria: 12.000 estudiantes de pregrado y posgrado, 450 docentes e investigadores, "
          "280 servidores administrativos, 14 concesionarios de alimentos y cafeterías, el equipo operativo de servicios generales y las asociaciones "
          "de recicladores de base vinculadas al campus.", 
          font_size=9.5, space_after=5)

    add_heading_2(cell, "3. Mínimo Cinco (5) Acciones de Mejora Operacionales:")
    add_action_item(cell, "• Acción 1: «Campus Cero Desechables» y Cláusulas Contractuales Vinculantes:", 
                    "Suscripción de un Otrosí ambiental con todos los establecimientos de alimentos, prohibiendo la entrega de plásticos de un solo uso (Ley 2232 de 2022). Se exige el suministro de vajilla de loza y vidrio para consumo en sitio y recipientes rígidos de polipropileno reutilizables para consumo para llevar.")
    add_action_item(cell, "• Acción 2: Reingeniería Ergonómica de Puntos Ecológicos y Red «Eco-Wash»:", 
                    "Sustitución de contenedores obsoletos por estaciones bajo el Código Nacional de Colores (Res. 2184/2019: Blanco, Verde, Negro) e instalación de módulos «Eco-Wash» con piletas y grifos de pedal temporizados para el lavado rápido de recipientes en 10 segundos, eliminando la contaminación de reciclables.")
    add_action_item(cell, "• Acción 3: Tarjeta de Eco-Incentivos «Eco-Puntos IU» y Descuento Directo:", 
                    "Otorgamiento de un 10% a 15% de descuento en alimentos a quien porte su propio termo o vajilla, complementado con un sistema de eco-puntos canjeables por créditos de fotocopias, bonos de librería o descuentos en derechos de grado.")
    add_action_item(cell, "• Acción 4: Programa Vivencial «Rostros del Campus: Dignidad y Empatía»:", 
                    "Jornadas pedagógicas de 'Un Día con Nuestro Equipo de Servicios Generales' para directivos y representantes estudiantiles, acompañadas de adhesivos en las estaciones de reciclaje con los rostros de los operarios para desarticular el desentendimiento moral.")
    add_action_item(cell, "• Acción 5: Red de Veedores Ambientales Estudiantiles y Presupuesto Participativo Verde:", 
                    "Conformación de un semillero de promotores ambientales que realizarán eco-tutorías en horarios de almuerzo, respaldados por la asignación del 2% del fondo de bienestar universitario para proyectos circulares propuestos y votados por los estudiantes.")

    add_heading_2(cell, "4. Selección de Dos (2) Instrumentos de Política Ambiental:")
    add_action_item(cell, "• Instrumento Económico y de Mercado (Sistema SDDR e Impuesto al Descarte):", 
                    "Cobro de un depósito monetario reembolsable ($2.000 COP) al retirar vajilla reutilizable, devuelto íntegramente al reintegrar el envase en los módulos automáticos o en cafeterías; y aplicación de una tasa visible al descarte ($500 COP) para quien exija empaques de un solo uso, alineado con la Ley 2277 de 2022 y la Estrategia Nacional de Economía Circular.")
    add_action_item(cell, "• Instrumento Regulatorio o de Comando y Control (Estatuto de Compras Públicas Circulares):", 
                    "Expedición de una Resolución Rectoral vinculante que fija metas de cero plásticos, prohíbe el uso de descartables en eventos oficiales y sanciona el incumplimiento comercial con la suspensión de contratos de concesión, en concordancia con la Ley 2232 de 2022 y el Decreto 1076 de 2015.")

    add_heading_2(cell, "5. Selección de Un (1) Mecanismo de Participación Ciudadana:")
    add_action_item(cell, "• Mesa Universitaria de Concertación y Veeduría Socioambiental (MUCVA):", 
                    "Instancia formal de co-gestión y auditoría comunitaria amparada en los Artículos 79 y 270 de la Constitución Política de Colombia, la Ley 1757 de 2015 y los pilares de acceso y participación del Acuerdo de Escazú (Ley 2273 de 2022). Integra delegados estudiantiles, docentes, comerciantes y operarios de aseo para auditar periódicamente los residuos y priorizar las inversiones verdes.")

    add_heading_2(cell, "6. Cuatro (4) Indicadores para Evaluar el Resultado de la Estrategia:")
    add_action_item(cell, "• Indicador 1: Tasa de Desvío de Plásticos Descartables (TDPD):", "[(Masa de plásticos en kg Mes 0 - Masa de plásticos Mes t) / Masa Mes 0] * 100. Meta: Reducción ≥ 75% en 18 meses. Periodicidad: Mensual.")
    add_action_item(cell, "• Indicador 2: Índice de Pureza en la Fuente (IPEF):", "[(Peso de residuos reciclables limpios y secos en contenedor blanco) / Peso total depositado en contenedor blanco] * 100. Meta: Pureza ≥ 90%. Periodicidad: Quincenal.")
    add_action_item(cell, "• Indicador 3: Tasa de Reutilización Comercial (TREC):", "[(Número de transacciones en cafeterías servidas en vajilla reutilizable o vajilla aportada) / Total transacciones de alimentos] * 100. Meta: Penetración ≥ 80%. Periodicidad: Mensual.")
    add_action_item(cell, "• Indicador 4: Índice de Corresponsabilidad y Reconocimiento (ICOC):", "[(Personas encuestadas que asumen el deber activo de separar residuos sin delegarlo al personal de aseo) / Total muestra encuestada] * 100. Meta: Aceptación ≥ 85%. Periodicidad: Semestral.")

    # ==================== FASE 4 ====================
    add_heading_1(cell, "Fase 4: Reflexión Final Crítica", space_before=14, space_after=4)
    add_heading_2(cell, "Pregunta Orientadora: ¿Por qué la solución de una problemática ambiental requiere transformaciones en las dinámicas sociales, culturales y económicas, y no solo acciones técnicas o individuales?")
    
    add_p(cell, 
          "La pretensión de solucionar los desequilibrios ecológicos apelando de forma exclusiva a la 'conciencia moral' del consumidor individual "
          "constituye una de las trampas más paralizantes del ambientalismo convencional. Esta perspectiva, arraigada en el individualismo metodológico, "
          "pretende hacer creer que la degradación planetaria es la simple sumatoria de malas decisiones individuales aisladas y que, por tanto, "
          "bastaría con educar la mente del sujeto para que el entorno sane espontáneamente. Sin embargo, la sociología ambiental crítica (Schnaiberg, 1980; Leff, 2004) "
          "y la ecología política desmienten categóricamente esta premisa: las personas no eligen en el vacío; sus conductas cotidianas se encuentran "
          "estrictamente delimitadas, condicionadas y prefiguradas por las estructuras materiales, los marcos jurídicos y las dinámicas socioeconómicas de poder.", 
          font_size=9.5, space_after=4)
    add_p(cell, 
          "En el escenario de una institución educativa, exigirle a un estudiante o trabajador que 'no genere basura' mientras la oferta comercial "
          "únicamente expende alimentos empacados en películas plásticas descartables, sin acceso a dispensadores de agua potable gratuita y sin módulos "
          "para higienizar una taza propia, representa una demanda inviable. El descarte apresurado no constituye una anomalía psicológica aislada, "
          "sino una respuesta adaptativa y racional ante un entorno material concebido para la obsolescencia y el desecho.", 
          font_size=9.5, space_after=4)
    add_p(cell, 
          "Asimismo, el comportamiento está atravesado por jerarquías culturales de clase y género que han naturalizado la invisibilización y desprecio "
          "del trabajo de aseo, sustentando la creencia de que la limpieza comunitaria es un deber ajeno. Por consiguiente, resolver la problemática "
          "exige alinear coordinadamente cuatro dimensiones estructurales indispensables: 1) Dimensión Regulatorio-Jurídica, fijando reglas vinculantes que "
          "prohíban los descartables; 2) Dimensión Económica, estableciendo incentivos y señales de precio que internalicen los costos ecológicos; "
          "3) Dimensión Infraestructural y Física, facilitando la acción ecológica mediante ergonomía y estaciones de lavado rápido; y 4) Dimensión Cultural "
          "y Política, dignificando el cuidado del hábitat compartido mediante gobernanza democrática. Solo cuando la estructura material hace que la opción "
          "ecológica sea la más accesible, justa y económica, la sostenibilidad deja de ser un discurso abstracto y se convierte en una práctica comunitaria viva.", 
          font_size=9.5, space_after=6)

    # ==================== REFERENCIAS APA 7 ====================
    add_heading_1(cell, "Referencias Bibliográficas (Normas APA 7.ª Edición)", space_before=14, space_after=6)
    
    referencias = [
        "Bandura, A. (2002). Selective moral disengagement in the exercise of moral agency. Journal of Moral Education, 31(2), 101-119. https://doi.org/10.1080/0305724022014322",
        "Congreso de la República de Colombia. (1991). Constitución Política de Colombia. Gaceta Constitucional N° 116.",
        "Congreso de la República de Colombia. (2015). Ley 1757 de 2015: Estatuto de la participación democrática en Colombia. Diario Oficial N° 49.565.",
        "Congreso de la República de Colombia. (2022). Ley 2232 de 2022: Medidas para la reducción y eliminación progresiva de plásticos de un solo uso. Diario Oficial N° 52.088.",
        "Congreso de la República de Colombia. (2022). Ley 2273 de 2022: Aprueba el Acuerdo Regional sobre el Acceso a la Información, la Participación Pública y el Acceso a la Justicia en Asuntos Ambientales en América Latina y el Caribe (Acuerdo de Escazú).",
        "Congreso de la República de Colombia. (2022). Ley 2277 de 2022: Reforma tributaria para la igualdad y la justicia social (Impuesto nacional sobre productos plásticos de un solo uso).",
        "Kollmuss, A., & Agyeman, J. (2002). Mind the gap: Why do people act environmentally and what are the barriers to pro-environmental behavior? Environmental Education Research, 8(3), 239-260.",
        "Leff, E. (2004). Racionalidad ambiental: la reapropiación social de la naturaleza. Siglo XXI Editores.",
        "Ministerio de Ambiente y Desarrollo Sostenible. (2015). Decreto 1076 de 2015: Decreto Único Reglamentario del Sector Ambiente y Desarrollo Sostenible. Bogotá D.C.",
        "Ministerio de Ambiente y Desarrollo Sostenible. (2018). Estrategia Nacional de Economía Circular (ENEC). Gobierno de Colombia.",
        "Ministerio de Ambiente y Desarrollo Sostenible. (2019). Resolución 2184 de 2019: Código unificado de colores para separación en la fuente de residuos sólidos. Bogotá D.C.",
        "Ministerio de Vivienda, Ciudad y Territorio. (2015). Decreto 1077 de 2015: Decreto Único Reglamentario del Sector Vivienda, Ciudad y Territorio (Marco tarifario y PGIRS).",
        "Ministerio de Vivienda, Ciudad y Territorio. (2016). Decreto 596 de 2016: Esquema operativo de la actividad de aprovechamiento del servicio público de aseo y régimen transitorio para recicladores de oficio.",
        "Schnaiberg, A. (1980). The Environment: From Surplus to Scarcity. Oxford University Press.",
        "Thaler, R. H., & Sunstein, C. R. (2008). Nudge: Improving Decisions About Health, Wealth, and Happiness. Yale University Press.",
        "Warde, A. (2005). Consumption and theories of practice. Journal of Consumer Culture, 5(2), 131-153. https://doi.org/10.1177/1469540505053090"
    ]

    for ref in referencias:
        add_ref_item(cell, ref)

    # ==================== INDICACIONES DE ENTREGA ====================
    add_heading_2(cell, "¿Cómo entregar la actividad?:", space_before=14, space_after=3)
    add_p(cell, "Los puntos deben ser redactados en un documento word.", font_size=9.5, space_after=2)
    add_p(cell, "Guarda los documentos con la siguiente nomenclatura: Restrepo_JairAndres_Analizando.docx", font_size=9.5, space_after=4)

    if tbl_entrega_elm is not None:
        cell._tc.append(tbl_entrega_elm)

    add_p(cell, "Finalmente, haz clic en el botón Cargar Tarea, sube tu archivo y presiona Enviar para su respectiva calificación.", font_size=9.5, space_before=4, space_after=4)

    if tbl_rubrica_elm is not None:
        cell._tc.append(tbl_rubrica_elm)

    # Requisito estricto del estándar OpenXML en Word: la celda debe terminar siempre con un párrafo <w:p>
    p_trailing = cell.add_paragraph()
    p_trailing.paragraph_format.space_before = Pt(0)
    p_trailing.paragraph_format.space_after = Pt(0)

    # Guardar en todas las rutas solicitadas
    dest_downloads_template = r"C:\Users\lenovo\Downloads\Plantilla Tipo Tarea_CIENCIAS SOCIALES Y AMBIENTE -ACTIVIDAD-1.docx"
    dest_desktop_template = r"C:\Users\lenovo\Desktop\trabajos andres\Plantilla Tipo Tarea_CIENCIAS SOCIALES Y AMBIENTE -ACTIVIDAD-1.docx"
    dest_desktop_official = r"C:\Users\lenovo\Desktop\trabajos andres\Restrepo_JairAndres_Analizando.docx"
    dest_desktop_secondary = r"C:\Users\lenovo\Desktop\trabajos andres\Restrepo_AndresJair_Analizando.docx"
    dest_downloads_official = r"C:\Users\lenovo\Downloads\Restrepo_JairAndres_Analizando.docx"

    print("Guardando archivo en Descargas (Plantilla)...")
    doc.save(dest_downloads_template)

    print("Guardando copia de la plantilla diligenciada en trabajos andres...")
    doc.save(dest_desktop_template)

    print("Guardando con nomenclatura oficial en trabajos andres...")
    doc.save(dest_desktop_official)
    doc.save(dest_desktop_secondary)

    print("Guardando copia con nomenclatura oficial en Descargas...")
    doc.save(dest_downloads_official)

    print("¡Plantilla estructurada y guardada con éxito rotundo!")

if __name__ == "__main__":
    build_perfect_template()
