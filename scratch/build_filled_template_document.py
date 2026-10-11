# -*- coding: utf-8 -*-
"""
Diligenciamiento Definitivo de la Plantilla Oficial de la IU Digital:
'Plantilla Tipo Tarea_CIENCIAS SOCIALES Y AMBIENTE -ACTIVIDAD-1.docx'

Estructura:
1. Mantiene el encabezado oficial institucional 'FORMATO PARA EVIDENCIA DE APRENDIZAJE' con el logo.
2. Tabla 0: Agrega al Estudiante Andrés Jair Restrepo.
3. Tabla 1: Mantiene la cabecera oficial de la Unidad 2 y Actividad Final.
4. Celda de desarrollo:
   - Presenta el Objetivo, Instrucciones y Caso de Estudio original.
   - Desarrolla Fase 1 con las 5 preguntas resueltas a profundidad y subtítulos en negrilla negra.
   - Desarrolla Fase 2 llenando la tabla oficial de 3 disciplinas (Sociología, Economía Ecológica, Psicología Social).
   - Desarrolla Fase 3 con la propuesta completa (Objetivos, Población, 5 Acciones, 2 Instrumentos, 1 Mecanismo de participación, 4 Indicadores en tabla).
   - Desarrolla Fase 4 con la respuesta a la pregunta orientadora.
   - Incorpora las Referencias Bibliográficas en formato APA 7.ª edición.
5. Se guarda tanto con el nombre de la plantilla en Descargas y Escritorio, como con la nomenclatura oficial 'Restrepo_JairAndres_Analizando.docx'.
"""

import os
import docx
from docx.shared import Inches, Pt, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.enum.table import WD_TABLE_ALIGNMENT
from docx.oxml import OxmlElement, parse_xml
from docx.oxml.ns import nsdecls, qn

COLOR_BLACK = RGBColor(0, 0, 0)
COLOR_DARK = RGBColor(30, 30, 30)

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

def add_p(container, text="", bold=False, italic=False, font_size=10, color=COLOR_DARK, align=WD_ALIGN_PARAGRAPH.JUSTIFY, space_before=0, space_after=5, first_line_indent=0):
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

def add_heading_p(container, text, font_size=11, space_before=10, space_after=3):
    return add_p(container, text, bold=True, font_size=font_size, color=COLOR_BLACK, align=WD_ALIGN_PARAGRAPH.LEFT, space_before=space_before, space_after=space_after)

def add_table_header_cell(row, col_idx, text, width=None, bg_hex="F2F2F2"):
    cell = row.cells[col_idx]
    if width:
        cell.width = width
    set_cell_background(cell, bg_hex)
    set_cell_margins(cell, top=100, bottom=100, left=120, right=120)
    p = cell.paragraphs[0]
    p.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p.paragraph_format.space_before = Pt(0)
    p.paragraph_format.space_after = Pt(0)
    r = p.add_run(text)
    r.bold = True
    r.font.name = "Arial"
    r.font.size = Pt(9)
    r.font.color.rgb = COLOR_BLACK
    return cell

def add_table_body_cell(row, col_idx, text, bold_prefix="", width=None, bg_hex="FFFFFF", align=WD_ALIGN_PARAGRAPH.LEFT):
    cell = row.cells[col_idx]
    if width:
        cell.width = width
    if bg_hex != "FFFFFF":
        set_cell_background(cell, bg_hex)
    set_cell_margins(cell, top=80, bottom=80, left=110, right=110)
    p = cell.paragraphs[0]
    p.alignment = align
    p.paragraph_format.space_before = Pt(0)
    p.paragraph_format.space_after = Pt(2)
    p.paragraph_format.line_spacing = 1.15
    if bold_prefix:
        r_pre = p.add_run(bold_prefix)
        r_pre.bold = True
        r_pre.font.name = "Arial"
        r_pre.font.size = Pt(8.5)
        r_pre.font.color.rgb = COLOR_BLACK
    r = p.add_run(text)
    r.font.name = "Arial"
    r.font.size = Pt(8.5)
    r.font.color.rgb = COLOR_DARK
    return cell

def build_filled_template():
    source_path = r"C:\Users\lenovo\Downloads\Plantilla Tipo Tarea_CIENCIAS SOCIALES Y AMBIENTE -ACTIVIDAD-1.docx"
    doc = docx.Document(source_path)

    # 1. ACTUALIZAR TABLA 0: RESPONSABLES
    t0 = doc.tables[0]
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

    # 2. LOCALIZAR CELDA DE DESARROLLO (Tabla 1 Fila 2 Celda 0)
    t1 = doc.tables[1]
    cell = t1.rows[2].cells[0]
    
    # Dentro de esta celda, identificamos las tablas anidadas
    # nested_tables[0] es la tabla de las disciplinas de Fase 2
    # nested_tables[1] es la caja de nomenclatura
    # nested_tables[2] es la caja de la nota de rúbrica
    tbl_disc = cell.tables[0]
    
    # Actualizamos el encabezado de la tabla de disciplinas
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

    for disc, interp, aport in disciplinas_data:
        r_new = tbl_disc.add_row()
        make_row_cant_split(r_new)
        
        c0 = r_new.cells[0]
        c0.text = ""
        set_cell_background(c0, "F9F9F9")
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
        r1.font.color.rgb = COLOR_DARK

        c2 = r_new.cells[2]
        c2.text = ""
        set_cell_margins(c2, top=90, bottom=90, left=110, right=110)
        p2 = c2.paragraphs[0]
        p2.alignment = WD_ALIGN_PARAGRAPH.JUSTIFY
        p2.paragraph_format.line_spacing = 1.15
        r2 = p2.add_run(aport)
        r2.font.name = "Arial"
        r2.font.size = Pt(8.5)
        r2.font.color.rgb = COLOR_DARK

    # 3. RECORREMOS LOS PÁRRAFOS EXISTENTES DENTRO DE LA CELDA PARA INSERTAR
    # LAS RESPUESTAS DIRECTAMENTE DEBAJO DE CADA PREGUNTA
    # Mapeo de párrafos en cell:
    paragraphs = cell.paragraphs
    print(f"Total párrafos iniciales en la celda: {len(paragraphs)}")

    # Localizamos los párrafos clave por su texto
    idx_p_prob = -1
    idx_p_causas = -1
    idx_p_involucrados = -1
    idx_p_comportamientos = -1
    idx_p_consecuencias = -1
    idx_p_fase3 = -1
    idx_p_fase4 = -1
    idx_p_entrega = -1

    for i, p in enumerate(paragraphs):
        txt = p.text.strip()
        if "¿Cuál es el problema socioambiental?" in txt:
            idx_p_prob = i
        elif "¿Cuáles son sus causas?" in txt:
            idx_p_causas = i
        elif "¿Quiénes están involucrados?" in txt:
            idx_p_involucrados = i
        elif "¿Qué comportamientos sociales contribuyen al problema?" in txt:
            idx_p_comportamientos = i
        elif "¿Qué consecuencias ambientales y sociales genera?" in txt:
            idx_p_consecuencias = i
        elif "Fase 3: Diseño de estrategia" in txt:
            idx_p_fase3 = i
        elif "Fase 4: Reflexión final" in txt:
            idx_p_fase4 = i
        elif "¿Cómo entregar la actividad?:" in txt:
            idx_p_entrega = i

    print(f"Indices detectados: prob={idx_p_prob}, causas={idx_p_causas}, involucrados={idx_p_involucrados}, comportamientos={idx_p_comportamientos}, consecuencias={idx_p_consecuencias}, fase3={idx_p_fase3}, fase4={idx_p_fase4}, entrega={idx_p_entrega}")

    # Respuestas detalladas para cada Fase:
    resp_problema = (
        "Respuesta:\n"
        "El problema socioambiental analizado trasciende con creces la mera acumulación de residuos sólidos ordinarios en canecas. "
        "Consiste en una fractura de la corresponsabilidad comunitaria y la instauración de una cultura de consumo lineal acelerado, "
        "donde la comunidad universitaria externaliza las consecuencias ecológicas y laborales de su confort cotidiano hacia los sectores más "
        "vulnerables de la institución: el personal de servicios generales y los recuperadores de base.\n\n"
        "Existe una disonancia ética estructural: mientras en las aulas se imparten cátedras sobre desarrollo sostenible y bioética, "
        "en los pasillos y cafeterías prevalece el descarte masivo de polímeros que tardan hasta 450 años en degradarse, utilizados por escasos "
        "diez minutos. La infraestructura existente opera de forma pasiva, invisibilizando el residuo y generando una desconexión metabólica "
        "entre el consumo intra-campus y el pasivo ambiental descargado en el relleno sanitario regional."
    )

    resp_causas = (
        "Respuesta:\n"
        "El conflicto se originó y profundizó debido a cuatro factores socioeconómicos y tecnológicos clave:\n"
        "1. Expansión Petroquímica y Plástico Barato: El abaratamiento artificial de los polímeros termoplásticos permitió a la industria sustituir "
        "los sistemas de vidrio retornable por empaques descartables, sin que el precio de mercado internalice el pasivo de su disposición final.\n"
        "2. Aceleración Social y 'Alimentación al Paso' (On-the-go): Los ritmos académicos comprimidos y los descansos breves de 15 minutos desmantelaron "
        "el ritual de la alimentación pausada, normalizando la compra de bebidas embotelladas y comida empacada para consumir caminando al aula.\n"
        "3. Desregulación Comercial en Cafeterías: Las concesiones operan bajo contratos que evalúan el canon de arriendo sin exigir compras públicas sostenibles. "
        "Para recortar costos fijos de agua y lavado, los comerciantes migraron al 100% de vajilla descartable.\n"
        "4. Infraestructura Pasiva sin Puntos de Lavado: La ausencia de piletas de enjuague rápido obliga a arrojar envases con líquidos sobrantes, "
        "contaminando irreversiblemente el papel y cartón que yacían limpios en los contenedores de reciclaje."
    )

    resp_involucrados = (
        "Respuesta:\n"
        "En el territorio universitario intervienen seis grupos de actores con intereses en tensión:\n"
        "• Estudiantes (Pregrado/Posgrado): Usuarios mayoritarios. Demandan rapidez y precios bajos; tienen conciencia ambiental teórica pero baja disposición al esfuerzo físico de lavar envases.\n"
        "• Docentes e Investigadores: Referentes académicos. Aunque enseñan sostenibilidad, a menudo replican la inercia del descarte en congresos y eventos por practicidad.\n"
        "• Directivas Universitarias: Priorizan el cumplimiento normativo, la reducción de costos en la tarifa de aseo y la imagen de acreditación institucional.\n"
        "• Concesiones de Cafeterías: Operadores privados centrados en maximizar utilidades y agilizar el despacho en horas pico mediante empaques descartables de bajo costo.\n"
        "• Personal de Servicios Generales: Operarios de aseo que soportan la sobrecarga laboral y el riesgo biomecánico de reclasificar bolsas contaminadas sin reconocimiento social.\n"
        "• Asociaciones de Recicladores de Base: Recuperadores agremiados que dependen de material limpio y seco para el sustento de sus familias (Decreto 596 de 2016)."
    )

    resp_comportamientos = (
        "Respuesta:\n"
        "Los comportamientos colectivos que reproducen el conflicto son:\n"
        "1. Desentendimiento Moral y Transferencia de Culpa (Bandura, 2002): La creencia de que 'el aseo no me toca a mí porque pago matrícula y para eso hay empleados' despoja al ciudadano de su deber ético.\n"
        "2. Degeneración de la Norma Descriptiva (Broken Windows): Si el usuario ve que la caneca blanca ya tiene un vaso untado de salsa o cáscaras de fruta, asume que separar no tiene sentido y arroja su desecho mezclado.\n"
        "3. Heurística del Menor Esfuerzo: Separar y enjuagar toma atención y tiempo; arrojar todo junto toma medio segundo. Sin incentivos, el cerebro elige la vía de menor resistencia.\n"
        "4. Desconexión Metabólica: Una vez el residuo cruza la boca de la caneca, desaparece de la conciencia del usuario, invisibilizando el viaje hacia el relleno sanitario."
    )

    resp_consecuencias = (
        "Respuesta:\n"
        "Las consecuencias se manifiestan en tres escalas:\n"
        "• Ambientales: Colapso acelerado del Relleno Sanitario La Pradera (Antioquia), emisiones fugitivas de gas metano (CH4) por materia orgánica atrapada en plástico y polución por microplásticos.\n"
        "• Laborales y de Salud: Riesgos biomecánicos, cortes con bordes afilados y contacto con patógenos para el personal de limpieza que debe desgarrar bolsas manualmente.\n"
        "• Económicas e Institucionales: Sobrecostos en la factura del servicio público de aseo (Decreto 1077 de 2015), pérdida de ingresos para los recicladores de oficio y daño a la coherencia ética de la universidad."
    )

    # Insertamos las respuestas en los párrafos de Fase 1
    # Modificamos el párrafo de la pregunta o agregamos el texto formateado
    paragraphs[idx_p_prob].text = "¿Cuál es el problema socioambiental?\n" + resp_problema
    paragraphs[idx_p_prob].runs[0].bold = True
    paragraphs[idx_p_prob].runs[0].font.color.rgb = COLOR_BLACK

    paragraphs[idx_p_causas].text = "¿Cuáles son sus causas?\n" + resp_causas
    paragraphs[idx_p_causas].runs[0].bold = True
    paragraphs[idx_p_causas].runs[0].font.color.rgb = COLOR_BLACK

    paragraphs[idx_p_involucrados].text = "¿Quiénes están involucrados?\n" + resp_involucrados
    paragraphs[idx_p_involucrados].runs[0].bold = True
    paragraphs[idx_p_involucrados].runs[0].font.color.rgb = COLOR_BLACK

    paragraphs[idx_p_comportamientos].text = "¿Qué comportamientos sociales contribuyen al problema?\n" + resp_comportamientos
    paragraphs[idx_p_comportamientos].runs[0].bold = True
    paragraphs[idx_p_comportamientos].runs[0].font.color.rgb = COLOR_BLACK

    paragraphs[idx_p_consecuencias].text = "¿Qué consecuencias ambientales y sociales genera?\n" + resp_consecuencias
    paragraphs[idx_p_consecuencias].runs[0].bold = True
    paragraphs[idx_p_consecuencias].runs[0].font.color.rgb = COLOR_BLACK

    # Actualizamos Fase 3 con la propuesta desarrollada
    propuesta_fase3 = (
        "Propuesta Estratégica: «Campus Circular y Corresponsable»\n\n"
        "1. Objetivo General:\n"
        "Diseñar, implementar y consolidar un modelo integral de descarbonización de materiales y corresponsabilidad socioambiental en el campus, "
        "con el propósito de abatir en un 75% el volumen de plásticos y empaques descartables en un horizonte de 18 meses, transformando los hábitos "
        "de consumo de la comunidad universitaria mediante instrumentos normativos, económicos, infraestructura facilitadora y gobernanza comunitaria vinculante.\n\n"
        "Objetivos Específicos:\n"
        "• Erradicar progresivamente los plásticos descartables en cafeterías mediante vajilla institucional y esquemas de préstamo de recipientes.\n"
        "• Reacondicionar la infraestructura de disposición con puntos ecológicos inteligentes (Res. 2184/2019) y estaciones de higienización rápida «Eco-Wash».\n"
        "• Implementar un régimen de eco-incentivos y desincentivos financieros (Sistema de Depósito, Devolución y Retorno - SDDR).\n"
        "• Dignificar al personal de aseo y reciclaje mediante campañas vivenciales de empatía comunitaria.\n"
        "• Institucionalizar la Mesa Universitaria de Concertación y Veeduría Ambiental (MUCVA) con presupuesto participativo.\n\n"
        "2. Población Objetivo:\n"
        "La totalidad de la comunidad universitaria: 12.000 estudiantes de pregrado y posgrado, 450 docentes e investigadores, 280 funcionarios administrativos, "
        "14 concesionarios de alimentos y el equipo operativo de servicios generales y recicladores de base.\n\n"
        "3. Cinco (5) Acciones de Mejora Operacionales:\n"
        "• Acción 1: «Campus Cero Desechables» y Cláusulas Contractuales Vinculantes: Suscripción de un Otrosí ambiental con todos los locales comerciales, prohibiendo pitillos, icopor y cubiertos plásticos (Ley 2232 de 2022). Se exige vajilla de loza/vidrio para consumo en sitio y recipientes reutilizables de polipropileno para llevar.\n"
        "• Acción 2: Reingeniería Ergonómica de Puntos Ecológicos y Red «Eco-Wash»: Sustitución de canecas por módulos bajo el Código Nacional de Colores (Res. 2184/2019: Blanco, Verde, Negro) e instalación de piletas con grifos de pedal temporizados para enjuagar envases en 10 segundos.\n"
        "• Acción 3: Tarjeta de Eco-Incentivos «Eco-Puntos IU» y Descuento Directo: Descuento del 10% en cafeterías a quien porte su propio recipiente y asignación de puntos canjeables en matrícula o bienestar universitario.\n"
        "• Acción 4: Programa Vivencial «Rostros del Campus: Dignidad y Empatía»: Jornadas de 'Un Día con Nuestro Equipo de Aseo' para directivos y estudiantes, e instalación de mensajes en canecas con las fotografías de los operarios para desarticular el desentendimiento moral.\n"
        "• Acción 5: Red de Veedores Ambientales Estudiantiles y Presupuesto Participativo Verde: Semillero juvenil de promotores ecológicos y asignación del 2% del fondo de bienestar para microproyectos circulares votados por el alumnado.\n\n"
        "4. Dos (2) Instrumentos de Política Ambiental Seleccionados:\n"
        "• Instrumento Económico y de Mercado: Sistema de Depósito, Devolución y Retorno (SDDR) articulado con Impuestos al Descarte (Ley 2277 de 2022 y ENEC). Depósito de $2.000 COP reembolsable por envase retornable y recargo no reembolsable de $500 COP para quien exija descartable.\n"
        "• Instrumento Regulatorio / Comando y Control: Estatuto de Compras Públicas Circulares y Restricción Progresiva de Plásticos (Ley 2232 de 2022 y Dec. 1076 de 2015). Resolución Rectoral vinculante con sanciones contractuales para cafeterías que incumplan.\n\n"
        "5. Un (1) Mecanismo de Participación Ciudadana:\n"
        "• Mesa Universitaria de Concertación y Veeduría Socioambiental (MUCVA) amparada en los Artículos 79 y 270 de la Constitución Política, la Ley 1757 de 2015 y el Acuerdo de Escazú (Ley 2273 de 2022). Integra estudiantes, docentes, comerciantes y operarios de aseo para auditar residuos y ejecutar presupuestos participativos.\n\n"
        "6. Cuatro (4) Indicadores de Evaluación de Resultados:\n"
        "• Indicador 1: Tasa de Desvío de Plásticos Descartables (TDPD): [(Masa plásticos Mes 0 - Masa Mes t) / Masa Mes 0] * 100. Meta: Disminución ≥ 75% en 18 meses. Mensual.\n"
        "• Indicador 2: Índice de Pureza en la Fuente (IPEF): [(Peso reciclables limpios en caneca blanca) / Peso total en caneca blanca] * 100. Meta: Pureza ≥ 90%. Quincenal.\n"
        "• Indicador 3: Tasa de Reutilización Comercial (TREC): [(Ventas en recipientes propios o retornables) / Total transacciones] * 100. Meta: Penetración ≥ 80%. Mensual.\n"
        "• Indicador 4: Índice de Corresponsabilidad Comunitaria (ICOC): [(Encuestados que asumen el deber de separar sin delegarlo al personal de aseo) / Total muestra] * 100. Meta: Percepción activa ≥ 85%. Semestral."
    )
    paragraphs[idx_p_fase3].text = "Fase 3: Diseño de estrategia\n\n" + propuesta_fase3
    paragraphs[idx_p_fase3].runs[0].bold = True
    paragraphs[idx_p_fase3].runs[0].font.color.rgb = COLOR_BLACK

    # Actualizamos Fase 4 con la reflexión final argumentada
    reflexion_fase4 = (
        "Respuesta Crítica Argumentada:\n"
        "La pretensión de solucionar los desequilibrios ecológicos apelando de forma exclusiva a la 'conciencia moral' del consumidor individual "
        "constituye una de las trampas más paralizantes del ambientalismo tradicional. Esta perspectiva, arraigada en el individualismo metodológico, "
        "pretende hacer creer que la degradación ambiental es el fruto acumulativo de millones de malas decisiones individuales aisladas y que, por ende, "
        "bastaría con educar la mente del sujeto para que el mundo sane espontáneamente. Sin embargo, la sociología crítica (Schnaiberg, 1980; Leff, 2004) "
        "y la ecología política desmienten categóricamente esta ilusión: las personas no eligen en el vacío; sus conductas cotidianas están férreamente "
        "delimitadas, condicionadas y prefiguradas por las estructuras materiales, los marcos jurídicos y las dinámicas de poder que configuran su entorno.\n\n"
        "En el campus universitario, exigirle a un estudiante que 'no genere basura' mientras la cafetería le ofrece únicamente alimentos "
        "envueltos en plástico descartable, sin fuentes de agua potable y sin lavaderos para higienizar una taza, equivale a exigirle una heroicidad inviable. "
        "El descarte rápido no es una falla psicológica individual: es la respuesta adaptativa y racional ante una infraestructura material diseñada para el desecho.\n\n"
        "Asimismo, el comportamiento está atravesado por jerarquías culturales de clase y género que desprecian el trabajo de limpieza, asumiendo que "
        "'alguien más limpiará'. Modificar la conducta demanda alinear cuatro pilares estructurales indispensables:\n"
        "1. Pilar Regulatorio: Reglas de juego vinculantes que prohíban la compra de descartables.\n"
        "2. Pilar Económico: Señales de precio que internalicen costos mediante eco-tasas y sistemas de depósito y retorno.\n"
        "3. Pilar Físico: Espacios ergonómicos que hagan expedito y cómodo lavar un envase y clasificar.\n"
        "4. Pilar Cultural y Político: Gobernanza participativa y dignificación del trabajo de aseo.\n\n"
        "Solo cuando la estructura material, económica y cultural hace que la opción sustentable sea la más fácil, económica, respetuosa y accesible, "
        "la ética ambiental deja de ser un eslogan y se transforma en una práctica territorial viva."
    )
    paragraphs[idx_p_fase4].text = "Fase 4: Reflexión final\n\n" + reflexion_fase4
    paragraphs[idx_p_fase4].runs[0].bold = True
    paragraphs[idx_p_fase4].runs[0].font.color.rgb = COLOR_BLACK

    # Agregamos la sección de Referencias al final de la celda de desarrollo
    add_heading_p(cell, "\nReferencias Bibliográficas (Normas APA 7.ª Edición)", font_size=11, space_before=14, space_after=6)

    referencias = [
        "Bandura, A. (2002). Selective moral disengagement in the exercise of moral agency. Journal of Moral Education, 31(2), 101-119. https://doi.org/10.1080/0305724022014322",
        "Congreso de la República de Colombia. (1991). Constitución Política de Colombia. Artículos 79 y 270 (Derecho al ambiente sano y control social). Gaceta Constitucional.",
        "Congreso de la República de Colombia. (2015). Ley 1757 de 2015: Estatuto de la participación democrática en Colombia. Diario Oficial No. 49.565.",
        "Congreso de la República de Colombia. (2022). Ley 2232 de 2022: Medidas tendientes a la reducción gradual de productos plásticos de un solo uso. Diario Oficial No. 52.088.",
        "Congreso de la República de Colombia. (2022). Ley 2273 de 2022: Aprueba el Acuerdo de Escazú sobre acceso a la información y justicia ambiental. Diario Oficial No. 52.195.",
        "Congreso de la República de Colombia. (2022). Ley 2277 de 2022: Reforma tributaria (Impuesto nacional sobre plásticos de un solo uso). Diario Oficial No. 52.247.",
        "Kollmuss, A., & Agyeman, J. (2002). Mind the gap: Why do people act environmentally and what are the barriers to pro-environmental behavior? Environmental Education Research, 8(3), 239-260.",
        "Leff, E. (2004). Racionalidad ambiental: la reapropiación social de la naturaleza. Siglo XXI Editores.",
        "Ministerio de Ambiente y Desarrollo Sostenible. (2018). Estrategia Nacional de Economía Circular (ENEC). Gobierno de Colombia.",
        "Ministerio de Ambiente y Desarrollo Sostenible. (2019). Resolución 2184 de 2019: Código unificado de colores para separación en la fuente. Bogotá D.C.",
        "Schnaiberg, A. (1980). The Environment: From Surplus to Scarcity. Oxford University Press.",
        "Thaler, R. H., & Sunstein, C. R. (2008). Nudge: Improving Decisions About Health, Wealth, and Happiness. Yale University Press.",
        "Warde, A. (2005). Consumption and theories of practice. Journal of Consumer Culture, 5(2), 131-153. https://doi.org/10.1177/1469540505053090"
    ]

    for ref in referencias:
        p_ref = cell.add_paragraph()
        p_ref.alignment = WD_ALIGN_PARAGRAPH.JUSTIFY
        p_ref.paragraph_format.left_indent = Inches(0.4)
        p_ref.paragraph_format.first_line_indent = Inches(-0.4)
        p_ref.paragraph_format.space_before = Pt(0)
        p_ref.paragraph_format.space_after = Pt(4)
        p_ref.paragraph_format.line_spacing = 1.15
        r_ref = p_ref.add_run(ref)
        r_ref.font.name = "Arial"
        r_ref.font.size = Pt(8.5)
        r_ref.font.color.rgb = COLOR_BLACK

    # Actualizamos la caja de nomenclatura en cell.tables[1] si existe
    if len(cell.tables) > 1:
        cell.tables[1].rows[0].cells[0].text = "Restrepo_JairAndres_Analizando.docx"
        p_nom = cell.tables[1].rows[0].cells[0].paragraphs[0]
        p_nom.alignment = WD_ALIGN_PARAGRAPH.CENTER
        p_nom.runs[0].bold = True
        p_nom.runs[0].font.name = "Arial"
        p_nom.runs[0].font.color.rgb = COLOR_BLACK

    # Guardar en las rutas solicitadas
    dest_downloads_template = r"C:\Users\lenovo\Downloads\Plantilla Tipo Tarea_CIENCIAS SOCIALES Y AMBIENTE -ACTIVIDAD-1.docx"
    dest_desktop_template = r"C:\Users\lenovo\Desktop\trabajos andres\Plantilla Tipo Tarea_CIENCIAS SOCIALES Y AMBIENTE -ACTIVIDAD-1.docx"
    dest_desktop_official = r"C:\Users\lenovo\Desktop\trabajos andres\Restrepo_JairAndres_Analizando.docx"
    dest_desktop_secondary = r"C:\Users\lenovo\Desktop\trabajos andres\Restrepo_AndresJair_Analizando.docx"

    print("Guardando archivo directamente sobre la plantilla en Descargas...")
    doc.save(dest_downloads_template)

    print("Guardando copia de la plantilla diligenciada en trabajos andres...")
    doc.save(dest_desktop_template)

    print("Guardando con la nomenclatura oficial de entrega en trabajos andres...")
    doc.save(dest_desktop_official)
    doc.save(dest_desktop_secondary)

    print("Plantilla oficial diligenciada y guardada con éxito en todos los destinos.")

if __name__ == "__main__":
    build_filled_template()
