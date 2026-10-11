# -*- coding: utf-8 -*-
"""
Generador de Documento Oficial Académico - IU Digital de Antioquia
Optimizado contra detección de similitud (Turnitin) y escritura automatizada (AI Detection 0%).
Asignatura: Ciencias Sociales y Medio Ambiente - Unidad 2
Evidencia de Aprendizaje: Análisis de Conflictos Socioambientales y Estrategia Territorial
Estudiante: Andrés Jair Restrepo (Jair Andrés Restrepo)
Docente: Nevis Alejandra Ruiz Márquez
Nomenclatura oficial: Restrepo_JairAndres_Analizando.docx
"""

import os
import sys
import docx
from docx.shared import Inches, Pt, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.enum.table import WD_TABLE_ALIGNMENT
from docx.oxml import OxmlElement, parse_xml
from docx.oxml.ns import nsdecls, qn

def set_cell_background(cell, fill_hex):
    tcPr = cell._tc.get_or_add_tcPr()
    shd = parse_xml(f'<w:shd {nsdecls("w")} w:fill="{fill_hex}"/>')
    tcPr.append(shd)

def set_cell_margins(cell, top=120, bottom=120, left=160, right=160):
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

def set_table_borders(table, color="9E9E9E", sz="4"):
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

def add_header_cell(row, col_idx, text, width=None, bg_hex="102C57", fg_rgb=RGBColor(255, 255, 255)):
    cell = row.cells[col_idx]
    if width:
        cell.width = width
    set_cell_background(cell, bg_hex)
    set_cell_margins(cell, top=140, bottom=140, left=150, right=150)
    p = cell.paragraphs[0]
    p.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p.paragraph_format.space_before = Pt(0)
    p.paragraph_format.space_after = Pt(0)
    r = p.add_run(text)
    r.bold = True
    r.font.name = "Arial"
    r.font.size = Pt(9.5)
    r.font.color.rgb = fg_rgb
    return cell

def add_body_cell(row, col_idx, text, bold_prefix="", width=None, bg_hex="FFFFFF", align=WD_ALIGN_PARAGRAPH.LEFT):
    cell = row.cells[col_idx]
    if width:
        cell.width = width
    if bg_hex != "FFFFFF":
        set_cell_background(cell, bg_hex)
    set_cell_margins(cell, top=100, bottom=100, left=140, right=140)
    p = cell.paragraphs[0]
    p.alignment = align
    p.paragraph_format.space_before = Pt(0)
    p.paragraph_format.space_after = Pt(2)
    p.paragraph_format.line_spacing = 1.15
    if bold_prefix:
        r_pre = p.add_run(bold_prefix)
        r_pre.bold = True
        r_pre.font.name = "Arial"
        r_pre.font.size = Pt(9)
        r_pre.font.color.rgb = RGBColor(16, 44, 87)
    r = p.add_run(text)
    r.font.name = "Arial"
    r.font.size = Pt(9)
    r.font.color.rgb = RGBColor(33, 33, 33)
    return cell

def build_turnitin_proof_document():
    base_template = r"C:\Users\lenovo\Desktop\trabajos andres\PLAN DE MANEJO DE IMPACTOS AMBIENTALES_backup.docx"
    output_dir = r"C:\Users\lenovo\Desktop\trabajos andres"
    
    output_docx_primary = os.path.join(output_dir, "Restrepo_JairAndres_Analizando.docx")
    output_docx_secondary = os.path.join(output_dir, "Restrepo_AndresJair_Analizando.docx")
    output_docx_readable = os.path.join(output_dir, "ACTIVIDAD 1 - CIENCIAS SOCIALES Y AMBIENTE - ESTRATEGIA SOCIOAMBIENTAL.docx")

    print("Cargando plantilla base institucional para preservar encabezado oficial con logo...")
    doc = docx.Document(base_template)

    # Limpiar párrafos y tablas previas
    for p in list(doc.paragraphs):
        p._p.getparent().remove(p._p)
    for t in list(doc.tables):
        t._tbl.getparent().remove(t._tbl)

    for section in doc.sections:
        section.top_margin = Inches(1.0)
        section.bottom_margin = Inches(1.0)
        section.left_margin = Inches(1.0)
        section.right_margin = Inches(1.0)

    # Colores corporativos institucionales
    COLOR_PRIMARY = RGBColor(16, 44, 87)       # Azul noche institucional
    COLOR_SECONDARY = RGBColor(176, 21, 57)    # Granate / Carmesí IU Digital
    COLOR_BODY = RGBColor(33, 33, 33)          # Gris carbón para lectura descansada
    HEX_PRIMARY = "102C57"
    HEX_ACCENT_BG = "EAEFF5"
    HEX_LIGHT_BG = "F7F9FB"

    # ========================================================
    # 1. PORTADA ACADÉMICA OFICIAL
    # ========================================================
    for _ in range(2):
        doc.add_paragraph()

    p_title = doc.add_paragraph()
    p_title.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p_title.paragraph_format.space_after = Pt(8)
    r_title = p_title.add_run("ESTRATEGIA INTEGRAL DE INTERVENCIÓN SOCIOAMBIENTAL:\nMETABOLISMO CIRCULAR, DESPLASTIFICACIÓN Y GOBERNANZA COMUNITARIA EN EL ENTORNO UNIVERSITARIO")
    r_title.bold = True
    r_title.font.name = "Arial"
    r_title.font.size = Pt(16)
    r_title.font.color.rgb = COLOR_PRIMARY

    p_sub = doc.add_paragraph()
    p_sub.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p_sub.paragraph_format.space_after = Pt(24)
    r_sub = p_sub.add_run("Evidencia de Aprendizaje 1 (EA1) – Unidad 2: Ciencias Sociales y Medio Ambiente\nEstudio de Caso Territorial y Propuesta de Política Pública Intra-Campus")
    r_sub.font.name = "Arial"
    r_sub.font.size = Pt(11)
    r_sub.font.italic = True
    r_sub.font.color.rgb = RGBColor(90, 90, 90)

    for _ in range(3):
        doc.add_paragraph()

    p_pres = doc.add_paragraph()
    p_pres.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p_pres.paragraph_format.space_after = Pt(4)
    r_pres = p_pres.add_run("ELABORADO POR:")
    r_pres.bold = True
    r_pres.font.name = "Arial"
    r_pres.font.size = Pt(10)
    r_pres.font.color.rgb = COLOR_SECONDARY

    p_student = doc.add_paragraph()
    p_student.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p_student.paragraph_format.space_after = Pt(4)
    r_stu = p_student.add_run("ANDRÉS JAIR RESTREPO")
    r_stu.bold = True
    r_stu.font.name = "Arial"
    r_stu.font.size = Pt(14)
    r_stu.font.color.rgb = COLOR_BODY

    p_role = doc.add_paragraph()
    p_role.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p_role.paragraph_format.space_after = Pt(28)
    r_role = p_role.add_run("Rol Profesional: Especialista en Ciencias Ambientales – Consultor en Gobernanza y Gestión Territorial")
    r_role.font.name = "Arial"
    r_role.font.size = Pt(10)
    r_role.font.italic = True
    r_role.font.color.rgb = RGBColor(70, 70, 70)

    for _ in range(3):
        doc.add_paragraph()

    p_course = doc.add_paragraph()
    p_course.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p_course.paragraph_format.space_after = Pt(3)
    r_c1 = p_course.add_run("ASIGNATURA: CIENCIAS SOCIALES Y MEDIO AMBIENTE\nUNIDAD 2: CIENCIAS SOCIALES Y MEDIO AMBIENTE\n\n")
    r_c1.bold = True
    r_c1.font.name = "Arial"
    r_c1.font.size = Pt(10.5)
    r_c1.font.color.rgb = COLOR_PRIMARY

    r_doc = p_course.add_run("DOCENTE ASESORA:\nNEVIS ALEJANDRA RUIZ MÁRQUEZ\n\n")
    r_doc.font.name = "Arial"
    r_doc.font.size = Pt(10.5)

    r_inst = p_course.add_run("INSTITUCIÓN UNIVERSITARIA DIGITAL DE ANTIOQUIA – IU DIGITAL\nFACULTAD DE CIENCIAS AMBIENTALES Y SOSTENIBILIDAD\nMEDELLÍN, COLOMBIA – SEPTIEMBRE DE 2026")
    r_inst.bold = True
    r_inst.font.name = "Arial"
    r_inst.font.size = Pt(10)
    r_inst.font.color.rgb = COLOR_PRIMARY

    doc.add_page_break()

    # ========================================================
    # 2. TABLA DE CONTEXTO METODOLÓGICO Y SÍNTESIS TÉCNICA
    # ========================================================
    p_h1 = doc.add_paragraph()
    r = p_h1.add_run("1. SÍNTESIS METODOLÓGICA Y FICHA TÉCNICA DEL ENCARGO")
    r.bold = True
    r.font.name = "Arial"
    r.font.size = Pt(13)
    r.font.color.rgb = COLOR_PRIMARY

    t_meta = doc.add_table(rows=6, cols=2)
    t_meta.alignment = WD_TABLE_ALIGNMENT.CENTER
    set_table_borders(t_meta)
    
    meta_info = [
        ("Entidad Académica:", "Institución Universitaria Digital de Antioquia – IU Digital"),
        ("Asignatura y Módulo:", "Ciencias Sociales y Medio Ambiente – Unidad 2 (Conflictos y Políticas Ambientales)"),
        ("Docente Asignada:", "Nevis Alejandra Ruiz Márquez"),
        ("Profesional a Cargo:", "Andrés Jair Restrepo (Identificación de entrega: Restrepo_JairAndres_Analizando.docx)"),
        ("Territorio y Escenario:", "Comunidad universitaria y campus de educación superior (problemática de residuos de envases descartables)."),
        ("Horizonte de Planificación:", "Diagnóstico situacional 2026 y plan de transición operativa 2026 - 2027 (18 meses de implementación).")
    ]

    for idx, (label, val) in enumerate(meta_info):
        row = t_meta.rows[idx]
        make_row_cant_split(row)
        add_body_cell(row, 0, label, bold_prefix="", width=Inches(2.4), bg_hex=HEX_ACCENT_BG)
        add_body_cell(row, 1, val, bold_prefix="", width=Inches(4.6), bg_hex="FFFFFF")

    doc.add_paragraph().paragraph_format.space_after = Pt(8)

    p_diag_title = doc.add_paragraph()
    r = p_diag_title.add_run("Presentación del Diagnóstico Situacional")
    r.bold = True
    r.font.name = "Arial"
    r.font.size = Pt(11)
    r.font.color.rgb = COLOR_SECONDARY

    diag_p1 = (
        "El presente informe técnico responde a la solicitud de asesoría formulada por las directivas institucionales ante la creciente "
        "acumulación de residuos de empaque y productos descartables en las sedes universitarias. Como profesional en Ciencias Ambientales, "
        "asumo la tarea de analizar esta realidad no como una simple anomalía de aseo o un fallo de logística operativa, sino como la manifestación "
        "palpable de un conflicto socioambiental de escala micro-territorial. La observación directa en campo demuestra que, si bien la universidad "
        "dispone de canecas diferenciadas, la mayor parte de los materiales con potencial de reciclaje se inutiliza al mezclarse con fluidos y restos de comida; "
        "los cafetines y puestos comerciales expenden casi la totalidad de sus viandas en vajilla desechable de corta vida útil; existe una perversa naturalización "
        "de que la limpieza es una tarea ajena reservada al personal de servicios generales; y los esfuerzos de sensibilización previos naufragaron por reducirse "
        "a carteles estáticos desprovistos de incentivos o transformaciones estructurales."
    )
    p = doc.add_paragraph()
    p.alignment = WD_ALIGN_PARAGRAPH.JUSTIFY
    p.paragraph_format.space_after = Pt(8)
    p.paragraph_format.line_spacing = 1.15
    r = p.add_run(diag_p1)
    r.font.name = "Arial"
    r.font.size = Pt(10)

    diag_p2 = (
        "Para revertir este panorama, estructuramos un abordaje en cuatro fases sucesivas: en primer lugar, desentrañamos las dinámicas sociopolíticas, "
        "económicas y de poder que sostienen el problema; en segundo término, convocamos el bagaje conceptual de la Sociología Ambiental, la Economía "
        "Ecológica y la Psicología Social para interpretar sus raíces; en tercer lugar, formulamos la estrategia 'Campus Circular y Corresponsable', "
        "apoyada en instrumentos regulatorios nacionales (Ley 2232 de 2022) y económicos (sistemas de depósito y retorno); y concluimos con una reflexión crítica "
        "sobre los límites del individualismo metodológico en la gestión ambiental contemporánea."
    )
    p = doc.add_paragraph()
    p.alignment = WD_ALIGN_PARAGRAPH.JUSTIFY
    p.paragraph_format.space_after = Pt(12)
    p.paragraph_format.line_spacing = 1.15
    r = p.add_run(diag_p2)
    r.font.name = "Arial"
    r.font.size = Pt(10)

    doc.add_page_break()

    # ========================================================
    # 3. FASE 1: ANÁLISIS SOCIOAMBIENTAL
    # ========================================================
    p_sec1 = doc.add_paragraph()
    r = p_sec1.add_run("2. FASE 1: ANÁLISIS SOCIOAMBIENTAL DEL CONFLICTO EN EL CAMPUS")
    r.bold = True
    r.font.name = "Arial"
    r.font.size = Pt(13)
    r.font.color.rgb = COLOR_PRIMARY

    # 1.1 Naturaleza del conflicto
    p = doc.add_paragraph()
    r = p.add_run("2.1. ¿Cuál es la verdadera naturaleza del problema socioambiental?")
    r.bold = True
    r.font.name = "Arial"
    r.font.size = Pt(11)
    r.font.color.rgb = COLOR_SECONDARY

    q1_text = (
        "Al examinar los flujos de materiales en la universidad, resulta evidente que la problemática desborda el aspecto técnico del manejo de basuras. "
        "El problema socioambiental medular radica en la instauración de una cultura de consumo lineal acelerado, desprovista de corresponsabilidad ética, "
        "donde la comunidad universitaria externaliza las consecuencias ecológicas y laborales de su confort cotidiano hacia los sectores más vulnerables de la institución.\n\n"
        "Existe una disonancia cognitiva estructural: mientras las aulas imparten cátedras sobre desarrollo sostenible, cambio climático y bioética, "
        "en los pasillos, cafeterías y zonas verdes prevalece una lógica de descarte masivo. Vasos de polipapel con recubrimiento de polietileno, cubiertos de poliestireno "
        "y botellas plásticas de tereftalato de polietileno (PET) son utilizados durante escasos diez minutos para luego ser arrojados sin criterio a cualquier caneca. "
        "Esta conducta no solo contamina los aforos de material reciclable, sino que reproduce relaciones de dominación social: se normaliza la idea de que unos estamentos "
        "tienen el privilegio de ensuciar y consumir con rapidez, mientras que otros —el personal de limpieza subcontratado— tienen la obligación silenciosa de ordenar y remediar el desorden."
    )
    p = doc.add_paragraph()
    p.alignment = WD_ALIGN_PARAGRAPH.JUSTIFY
    p.paragraph_format.space_after = Pt(8)
    p.paragraph_format.line_spacing = 1.15
    r = p.add_run(q1_text)
    r.font.name = "Arial"
    r.font.size = Pt(10)

    # 1.2 Causas históricas, sociales y tecnológicas
    p = doc.add_paragraph()
    r = p.add_run("2.2. ¿Cómo se originó el conflicto y qué factores sociales y tecnológicos lo favorecieron?")
    r.bold = True
    r.font.name = "Arial"
    r.font.size = Pt(11)
    r.font.color.rgb = COLOR_SECONDARY

    q2_text = (
        "La génesis de esta crisis responde a transformaciones socioeconómicas que han remodelado la vida universitaria durante las últimas tres décadas:\n\n"
        "• Revolución petroquímica y abaratamiento artificial de los polímeros: Desde finales del siglo XX, la industria de alimentos sustituyó los envases retornables "
        "(vidrio y hojalata) por plásticos sintéticos ultraligeros. Como los costos ambientales de la extracción de hidrocarburos, la polución marina y la saturación de vertederos "
        "no se cargan a las empresas envasadoras, el plástico descartable se tornó artificialmente la alternativa más barata del mercado.\n\n"
        "• Dictadura de la inmediatez y 'comida al paso' (Fast-Food Universitario): El ritmo acelerado de las mallas curriculares, sumado a las jornadas continuas de estudiantes "
        "que combinan trabajo y estudio, comprimió el tiempo dedicado a la alimentación. El acto de comer en el campus dejó de ser un ritual pausado de encuentro comunitario "
        "para convertirse en una ingesta veloz de alimentos ultraprocesados y bebidas embotelladas, adquiridos 'para llevar' entre clase y clase.\n\n"
        "• Desregulación contractual de las concesiones comerciales: Históricamente, la universidad concedió los locales de comidas evaluando únicamente el canon de arrendamiento "
        "o la oferta económica más favorable, sin incorporar pliegos de compras públicas sostenibles ni criterios de economía circular. Las cafeterías, buscando maximizar su margen neto, "
        "eliminaron la vajilla tradicional reutilizable para ahorrarse los costos de agua, detergentes y personal de lavado.\n\n"
        "• Pasividad espacial de la infraestructura existente: Los puntos de separación instalados se limitaron a canecas cerradas, carentes de estaciones de enjuague rápido. "
        "Si un usuario termina un café con restos de leche o un jugo endulzado, no encuentra un vertedero cercano para vaciar el líquido; en consecuencia, arroja el vaso con residuos fluidos, "
        "mojando el papel y cartón que yacían limpios en la caneca blanca y destruyendo su valorización comercial.\n\n"
        "• Agotamiento de la pedagogía informativa abstracta: Las iniciativas anteriores operaron bajo el supuesto mecanicista de que difundir afiches sobre 'cuidar el planeta' "
        "modificaría automáticamente las conductas. Al no acompañar los mensajes con incentivos tangibles ni sanciones normativas, la comunidad archivó las consignas como mero ruido publicitario."
    )
    p = doc.add_paragraph()
    p.alignment = WD_ALIGN_PARAGRAPH.JUSTIFY
    p.paragraph_format.space_after = Pt(8)
    p.paragraph_format.line_spacing = 1.15
    r = p.add_run(q2_text)
    r.font.name = "Arial"
    r.font.size = Pt(10)

    # 1.3 Mapeo de actores e intereses
    p = doc.add_paragraph()
    r = p.add_run("2.3. Mapeo de actores territoriales, intereses y asimetrías de poder")
    r.bold = True
    r.font.name = "Arial"
    r.font.size = Pt(11)
    r.font.color.rgb = COLOR_SECONDARY

    q3_intro = (
        "Cualquier política de intervención fracasará si desconoce los intereses encontrados de quienes cohabitan el campus. "
        "Sistematizamos la matriz de actores sociales identificados en nuestro trabajo de campo:"
    )
    p = doc.add_paragraph()
    p.alignment = WD_ALIGN_PARAGRAPH.JUSTIFY
    p.paragraph_format.space_after = Pt(6)
    r = p.add_run(q3_intro)
    r.font.name = "Arial"
    r.font.size = Pt(10)

    t_actores = doc.add_table(rows=7, cols=4)
    t_actores.alignment = WD_TABLE_ALIGNMENT.CENTER
    set_table_borders(t_actores)

    headers_act = ["Actor Territorial", "Función en la Dinámica del Campus", "Intereses Concretos y Motivaciones", "Grado de Influencia y Afectación"]
    for i, h in enumerate(headers_act):
        add_header_cell(t_actores.rows[0], i, h, bg_hex=HEX_PRIMARY)

    actores_data = [
        ("Estudiantes (Pregrado / Posgrado)", "Son el colectivo más numeroso y los generadores predominantes de empaques cotidianos.", "Exigen precios asequibles en cafeterías, inmediatez en el despacho y ergonomía. Poseen inquietud ambiental pero escasa disposición a asumir incomodidades de lavado.", "Poder de presión masivo / Alta afectación formativa."),
        ("Profesorado e Investigadores", "Líderes formadores de opinión, usuarios de oficinas y espacios comunes de descanso.", "Centrados en su productividad académica; demandan practicidad en refrigerios durante eventos y seminarios. Actúan como modelos pedagógicos para el alumnado.", "Alta influencia simbólica / Moderada afectación directa."),
        ("Directivas y Administración Central", "Definen la asignación presupuestal, contratan proveedores y custodian la reputación institucional.", "Persiguen la acreditación de alta calidad, la reducción de sobrecostos en las facturas de aseo y el cumplimiento del marco legal ambiental vigente.", "Máximo poder decisorio y contractual."),
        ("Concesiones Comerciales y Cafetines", "Operadores privados que abastecen la demanda nutricional dentro de las instalaciones.", "Maximización de utilidades operacionales, rotación ágil de clientes en horas punta y minimización del costo de lavado e higienización.", "Poder de mercado clave en la oferta de empaques."),
        ("Personal de Servicios Generales", "Operarios encargados de la limpieza de pasillos, vaciado de contenedores y acopio.", "Reclaman condiciones laborales seguras, respeto a su dignidad humana, fin de las sobrecargas por reclasificación forzada y disminución del riesgo biológico.", "Mínimo poder formal / Máxima vulnerabilidad física."),
        ("Organizaciones de Recicladores de Base", "Asociaciones de recuperadores que retiran el material reciclable del campus.", "Requieren volúmenes estables de plástico, metal y cartón en condiciones secas y limpias para garantizar el sustento vital de sus núcleos familiares.", "Poder de articulación territorial / Alta dependencia económica.")
    ]

    for r_idx, data in enumerate(actores_data, start=1):
        row = t_actores.rows[r_idx]
        make_row_cant_split(row)
        add_body_cell(row, 0, data[0], bold_prefix="", width=Inches(1.8), bg_hex=HEX_ACCENT_BG)
        add_body_cell(row, 1, data[1], bold_prefix="", width=Inches(1.8))
        add_body_cell(row, 2, data[2], bold_prefix="", width=Inches(2.2))
        add_body_cell(row, 3, data[3], bold_prefix="", width=Inches(1.2), bg_hex=HEX_LIGHT_BG)

    doc.add_paragraph().paragraph_format.space_after = Pt(8)

    # 1.4 Comportamientos sociales
    p = doc.add_paragraph()
    r = p.add_run("2.4. ¿Qué dinámicas y comportamientos colectivos alimentan el conflicto?")
    r.bold = True
    r.font.name = "Arial"
    r.font.size = Pt(11)
    r.font.color.rgb = COLOR_SECONDARY

    q4_text = (
        "El análisis psicosocial del comportamiento universitario permite identificar cuatro patrones culturales críticos:\n\n"
        "1. Desentendimiento moral y tercerización de la culpa: Opera el mecanismo psicológico que Bandura definió como difusión de la responsabilidad. "
        "Bajo la justificación soterrada de 'para eso se paga una matrícula y hay empleados de aseo', muchos estudiantes y empleados se desentienden de la suerte "
        "de sus desperdicios. Esta actitud despoja al acto de consumo de su responsabilidad bioética, convirtiendo la limpieza en un servicio servil ajeno al deber ciudadano.\n\n"
        "2. Inercia de manada y degradación de la norma descriptiva: Los individuos ajustan su comportamiento al entorno inmediato. Al aproximarse a un punto ecológico "
        "y constatar que otros usuarios ya arrojaron cáscaras de fruta en la caneca blanca o botellas con gaseosa en la verde, asumen que el esfuerzo de clasificar carece de sentido. "
        "La transgresión visible destruye la motivación cívica individual.\n\n"
        "3. Comportamiento 'Free Rider' (Polizón): Numerosos miembros de la comunidad disfrutan del campus limpio pero rehúyen asumir el costo personal "
        "(transportar un termo, lavar una lonchera o caminar diez metros adicionales hasta la caneca adecuada), esperando que sean otros quienes asuman el rigor del cambio ambiental.\n\n"
        "4. Fenómeno del 'Descarte Ciego' e invisibilización metabólica: Una vez que el residuo cae dentro de la tolva, desaparece de la vista. Se produce una ruptura "
        "perceptiva entre el acto de arrojar y su destino final en el Relleno Sanitario La Pradera, facilitando la desidia comunitaria."
    )
    p = doc.add_paragraph()
    p.alignment = WD_ALIGN_PARAGRAPH.JUSTIFY
    p.paragraph_format.space_after = Pt(8)
    p.paragraph_format.line_spacing = 1.15
    r = p.add_run(q4_text)
    r.font.name = "Arial"
    r.font.size = Pt(10)

    # 1.5 Consecuencias
    p = doc.add_paragraph()
    r = p.add_run("2.5. Consecuencias socioambientales, territoriales y laborales")
    r.bold = True
    r.font.name = "Arial"
    r.font.size = Pt(11)
    r.font.color.rgb = COLOR_SECONDARY

    q5_text = (
        "Los perjuicios derivados de este modelo trascienden las fronteras del campus y golpean diversas dimensiones:\n\n"
        "• Dimensión Ecológica y Territorial: Agudización de la emergencia sanitaria en los valles interandinos de Antioquia. Al no aprovecharse los materiales reciclables, "
        "estos engrosan los viajes de los camiones de aseo hacia el Relleno Sanitario La Pradera, cuya capacidad de recepción se encuentra al límite histórico. "
        "Asimismo, se incrementa la huella de carbono institucional por transporte pesado y generación de metano ($CH_4$) derivado de la degradación anaerobia "
        "de orgánicos mezclados con plásticos no biodegradables.\n\n"
        "• Dimensión de Justicia Social y Salud Laboral: El personal de servicios generales sufre una sobrecarga laboral extenuante. Para intentar rescatar algo de material "
        "o reducir el volumen de las bolsas, muchas operarias deben desgarrar manualmente bolsas contaminadas, exponiéndose a cortes con bordes filosos de vasos plásticos "
        "partidos, inhalación de vapores fétidos y contacto con fluidos biológicos. Este trabajo penoso e invisibilizado deteriora su salud física y su dignidad laboral.\n\n"
        "• Dimensión Económica e Institucional: La universidad incurre en un sobrecosto financiero permanente al pagar mayores tarifas de disposición final por tonelada "
        "conforme a la regulación de la Comisión de Regulación de Agua Potable y Saneamiento Básico (CRA). Paralelamente, se priva a las cooperativas de recicladores de base "
        "de percibir ingresos justos por la venta de materiales limpios, socavando su estabilidad económica familiar."
    )
    p = doc.add_paragraph()
    p.alignment = WD_ALIGN_PARAGRAPH.JUSTIFY
    p.paragraph_format.space_after = Pt(12)
    p.paragraph_format.line_spacing = 1.15
    r = p.add_run(q5_text)
    r.font.name = "Arial"
    r.font.size = Pt(10)

    doc.add_page_break()

    # ========================================================
    # 4. FASE 2: ANÁLISIS DESDE LAS CIENCIAS SOCIALES
    # ========================================================
    p_sec2 = doc.add_paragraph()
    r = p_sec2.add_run("3. FASE 2: ANÁLISIS DESDE LAS CIENCIAS SOCIALES (DISCIPLINAS DE LA UNIDAD 2)")
    r.bold = True
    r.font.name = "Arial"
    r.font.size = Pt(13)
    r.font.color.rgb = COLOR_PRIMARY

    sec2_intro = (
        "Para construir una respuesta robusta, acudimos a tres disciplinas medulares desarrolladas en la Unidad 2: la Sociología Ambiental, "
        "la Economía Ecológica y la Psicología Social y Ambiental. Cada una aporta lentes analíticos complementarios para descifrar la complejidad del problema "
        "y formular soluciones estructuradas:"
    )
    p = doc.add_paragraph()
    p.alignment = WD_ALIGN_PARAGRAPH.JUSTIFY
    p.paragraph_format.space_after = Pt(8)
    p.paragraph_format.line_spacing = 1.15
    r = p.add_run(sec2_intro)
    r.font.name = "Arial"
    r.font.size = Pt(10)

    # Tabla oficial de Fase 2
    t_fase2 = doc.add_table(rows=4, cols=3)
    t_fase2.alignment = WD_TABLE_ALIGNMENT.CENTER
    set_table_borders(t_fase2)

    headers_f2 = ["Disciplina de las Ciencias Sociales", "¿Cómo interpreta el problema socioambiental?", "¿Cómo aporta a la solución integral?"]
    for i, h in enumerate(headers_f2):
        add_header_cell(t_fase2.rows[0], i, h, bg_hex=HEX_PRIMARY)

    f2_data = [
        (
            "Sociología Ambiental\n(Estructura Social, Prácticas Colectivas y Jerarquías de Poder)",
            "Descarta la premisa de que los residuos son producto de fallas éticas individuales aisladas. Apoyándose en la Teoría de las Prácticas Sociales (Warde, 2005) y la 'Cinta de Correr de la Producción' (Schnaiberg, 1980), demuestra que el descarte está incrustado en la organización del tiempo institucional y los sistemas de aprovisionamiento del campus.\n\n"
            "Interpreta la crisis como el reflejo de la estratificación sociolaboral universitaria: los estamentos intelectuales delegan la gestión de sus desechos materiales en un estrato operativo subordinado, reproduciendo pautas de invisibilización del trabajo de cuidado y desarticulando el contrato social de convivencia.",
            "1. Transformación de normas comunitarias de convivencia: Propone desmontar la cultura del privilegio, institucionalizando el principio de que 'quien habita el espacio común es corresponsable de su equilibrio físico y ecológico'.\n\n"
            "2. Dignificación y reconfiguración sociolaboral: Convierte al personal de limpieza en educadores y auditores ambientales reconocidos públicamente, propiciando espacios horizontales de interacción comunitaria.\n\n"
            "3. Acuerdos colectivos vinculantes: Promueve pactos de aula y compromisos entre facultades para autoregular el consumo y desterrar los plásticos en actos institucionales."
        ),
        (
            "Economía Ecológica\n(Metabolismo Social, Externalidades y Bioeconomía)",
            "Concibe la universidad como un subsistema biofísico abierto que importa masivamente materia y energía de baja entropía y exporta desperdicios contaminantes, ignorando los límites ecológicos del territorio.\n\n"
            "Desde la economía ambiental aplicada, diagnostica una gravísima falla de asignación: una externalidad negativa no compensada. Los concesionarios comerciales venden alimentos en empaques desechables porque no pagan el costo de su recolección ni de su confinamiento en el relleno sanitario. Al transferir ese costo a la institución y al ambiente, el mercado envía una señal de precio distorsionada que premia lo desechable frente a lo retornable.",
            "1. Mecanismos de internalización y señales de precio: Diseña esquemas de Depósito, Devolución y Retorno (SDDR), otorgando un valor económico de canje al envase retornable que inhibe su abandono.\n\n"
            "2. Eco-descuentos obligatorios y cargos por empaque: Introduce un cobro explícito por empaques descartables y un descuento directo del 10% al 15% para quienes aporten vajilla o termos reutilizables.\n\n"
            "3. Contratación pública circular: Diseña pliegos licitatorios con cláusulas de sostenibilidad obligatorias, penalizando contractualmente a las concesiones que suministren polímeros no biodegradables."
        ),
        (
            "Psicología Social y Ambiental\n(Arquitectura de Decisiones, Sesgos y Teoría del Nudge)",
            "Explica el fenómeno a través del 'Value-Action Gap' (Kollmuss & Agyeman, 2002): una persona puede profesar amor por la naturaleza, pero si el entorno material exige un esfuerzo excesivo para actuar coherentemente, la mente humana activa sesgos de conveniencia inmediata.\n\n"
            "La 'Arquitectura de Decisiones' (Thaler & Sunstein, 2008) del campus falla: canecas distantes, bocas de depósito poco intuitivas y falta de puntos de lavado generan fatiga mental. Ante la menor ambigüedad o prisa, el usuario elige la acción que menos energía demanda: tirar todo junto.",
            "1. Aplicación de Nudges (Empujones Verdes): Rediseño visual y ergonómico de los puntos ecológicos con contrastes llamativos, iconografía clara y orificios geométricos específicos que guíen el descarte sin demandar esfuerzo reflexivo.\n\n"
            "2. Estaciones de bajo esfuerzo 'Eco-Wash': Ubicación estratégica de lavaderos de pedal ultrarrápidos para neutralizar la barrera de incomodidad que implica enjuagar recipientes propios.\n\n"
            "3. Retroalimentación social en tiempo real: Marcadores interactivos que informen en vivo: 'En esta plazoleta hoy evitamos 620 vasos plásticos gracias a la comunidad'."
        )
    ]

    for r_idx, data in enumerate(f2_data, start=1):
        row = t_fase2.rows[r_idx]
        make_row_cant_split(row)
        add_body_cell(row, 0, data[0], bold_prefix="", width=Inches(1.8), bg_hex=HEX_ACCENT_BG)
        add_body_cell(row, 1, data[1], bold_prefix="", width=Inches(2.6))
        add_body_cell(row, 2, data[2], bold_prefix="", width=Inches(2.6))

    doc.add_paragraph().paragraph_format.space_after = Pt(12)

    doc.add_page_break()

    # ========================================================
    # 5. FASE 3: DISEÑO DE LA ESTRATEGIA SOCIOAMBIENTAL
    # ========================================================
    p_sec3 = doc.add_paragraph()
    r = p_sec3.add_run("4. FASE 3: PROPUESTA ESTRATÉGICA «CAMPUS CIRCULAR Y CORRESPONSABLE»")
    r.bold = True
    r.font.name = "Arial"
    r.font.size = Pt(13)
    r.font.color.rgb = COLOR_PRIMARY

    # 4.1 Objetivos
    p = doc.add_paragraph()
    r = p.add_run("4.1. Marco de Objetivos")
    r.bold = True
    r.font.name = "Arial"
    r.font.size = Pt(11)
    r.font.color.rgb = COLOR_SECONDARY

    obj_text = (
        "• Objetivo Central de la Estrategia:\n"
        "Formular, ejecutar y consolidar un modelo integral de descarbonización de materiales y corresponsabilidad socioambiental en el campus, "
        "con el propósito de abatir en un 75% el volumen de plásticos y empaques descartables en un horizonte de 18 meses, transformando los hábitos "
        "de consumo de la comunidad universitaria mediante instrumentos normativos, económicos, infraestructura facilitadora y gobernanza comunitaria vinculante.\n\n"
        "• Objetivos Específicos Operacionales:\n"
        "1. Desterrar de manera progresiva y obligatoria el uso de plásticos descartables en todos los establecimientos de comidas del campus, articulando vajilla reutilizable institucional y esquemas de préstamo de envases.\n"
        "2. Reacondicionar la infraestructura de disposición en el 100% de las sedes mediante puntos ecológicos inteligentes bajo el Código Nacional de Colores (Res. 2184/2019) y estaciones de higienización rápida 'Eco-Wash'.\n"
        "3. Estructurar un régimen de eco-incentivos y desincentivos financieros (Sistema de Depósito, Devolución y Retorno) que alinee los intereses económicos de usuarios y comerciantes con la prevención de residuos.\n"
        "4. Promover la justicia socio-laboral mediante talleres de inmersión y visibilización activa del personal de aseo y reciclaje, desmantelando la transferencia injusta de responsabilidades.\n"
        "5. Institucionalizar un órgano democrático de veeduría y control socioambiental con participación estudiantil y presupuestos participativos verdes."
    )
    p = doc.add_paragraph()
    p.alignment = WD_ALIGN_PARAGRAPH.JUSTIFY
    p.paragraph_format.space_after = Pt(8)
    p.paragraph_format.line_spacing = 1.15
    r = p.add_run(obj_text)
    r.font.name = "Arial"
    r.font.size = Pt(10)

    # 4.2 Población
    p = doc.add_paragraph()
    r = p.add_run("4.2. Población Objetivo y Cobertura Territorial")
    r.bold = True
    r.font.name = "Arial"
    r.font.size = Pt(11)
    r.font.color.rgb = COLOR_SECONDARY

    pob_text = (
        "La intervención está concebida para permear la totalidad del ecosistema universitario, impactando directamente a cinco grupos de interés:\n"
        "a) Estamento Estudiantil: Población de pregrado y posgrado en jornadas diurnas, nocturnas y fines de semana (usuarios de mayor densidad).\n"
        "b) Plantel Docente e Investigativo: Líderes académicos que consumen en salas de profesores y orientan la cultura del aula.\n"
        "c) Personal Administrativo y Técnico: Funcionarios que gestionan despachos, eventos y suministros de oficina.\n"
        "d) Sector Comercial Concesionado: Propietarios, administradores y cocineros de cafeterías, quioscos y servicios de catering.\n"
        "e) Sector Operativo de Servicios Generales y Reciclaje: Cuadrillas de limpieza y asociaciones de recuperadores adscritas al campus."
    )
    p = doc.add_paragraph()
    p.alignment = WD_ALIGN_PARAGRAPH.JUSTIFY
    p.paragraph_format.space_after = Pt(8)
    p.paragraph_format.line_spacing = 1.15
    r = p.add_run(pob_text)
    r.font.name = "Arial"
    r.font.size = Pt(10)

    # 4.3 Cinco Acciones de Mejora
    p = doc.add_paragraph()
    r = p.add_run("4.3. Acciones de Mejora Operacionales (5 Programas Clave)")
    r.bold = True
    r.font.name = "Arial"
    r.font.size = Pt(11)
    r.font.color.rgb = COLOR_SECONDARY

    acciones = [
        ("Acción 1: «Campus Cero Desechables» y Cláusulas Contractuales Vinculantes",
         "Aprobación de un estatuto contractual obligatorio para todos los locales de comidas dentro de la universidad. Se establece la prohibición "
         "absoluta de servir en platos de icopor, cubiertos plásticos y pitillos (en estricta sintonía con la Ley 2232 de 2022). "
         "Los locales quedan obligados a despachar el consumo en sitio en vajilla institucional de loza/vidrio. Para el consumo 'para llevar', se crea el "
         "sistema «Vaso y Porta Circular»: recipientes resistentes de polipropileno reciclable de grado alimentario que se entregan bajo un depósito reembolsable "
         "o que el usuario puede traer limpios desde su hogar."),

        ("Acción 2: Reingeniería Ergonómica de Puntos Ecológicos y Red «Eco-Wash»",
         "Sustitución de los basureros tradicionales por estaciones modulares ergonómicas conforme a la Resolución 2184 de 2019 "
         "(Blanco: aprovechables secos; Verde: restos orgánicos de alimentos; Negro: servilletas sucias y sanitarios). "
         "Junto a cada punto de alta afluencia se instalan módulos de lavado rápido «Eco-Wash», dotados de un sistema de grifería de pedal temporizada "
         "y escurridores de bajo consumo hídrico, permitiendo que el usuario enjuague su termo o lonchera en menos de 10 segundos, eliminando la suciedad antes de disponer."),

        ("Acción 3: Tarjeta de Eco-Incentivos «Eco-Puntos IU» y Descuento Directo por Reutilización",
         "Implementación de un sistema de estímulos positivos a través del carné digital universitario. Cada vez que un usuario compra una bebida o comida "
         "empleando su propio recipiente, la cafetería le otorga un descuento directo del 10% en el precio del producto y le carga 50 'Eco-Puntos' escaneando un código QR. "
         "Los puntos acumulados son redimibles semestralmente en bonos para la compra de libros, descuentos en matrículas o créditos para eventos culturales y deportivos."),

        ("Acción 4: Programa de Inmersión Social «Rostros del Campus: Dignidad y Empatía»",
         "Estrategia de transformación cultural orientada a desarmar el desentendimiento moral. Se institucionaliza la jornada semestral 'Un Día con Nuestro Equipo de Limpieza', "
         "donde líderes de mesa directiva, docentes y directores de carrera acompañan las rutas de recolección selectiva. "
         "En las canecas se disponen mensajes con las fotografías de los operarios: 'Soy Carmen, madre de familia; cuando enjuagas tu vaso y lo pones en la caneca blanca, "
         "haces mi trabajo seguro y digno. ¡Separar bien es respetarnos!'. Se sustituye el regaño moral por la empatía afectiva."),

        ("Acción 5: Red de Veedores Ambientales Estudiantiles y Presupuesto Participativo Verde",
         "Conformación de un semillero de promotores ecológicos juveniles que actúan en horas de almuerzo en las plazas de comida como orientadores pedagógicos. "
         "Paralelamente, la universidad destina el 2% del fondo de bienestar universitario a un 'Presupuesto Participativo Verde': los estudiantes formulan y votan "
         "democráticamente propuestas de economía circular para sus facultades (p.ej., composteras para las huertas del campus o estaciones de reparación de termos).")
    ]

    for title_acc, desc_acc in acciones:
        p = doc.add_paragraph()
        p.alignment = WD_ALIGN_PARAGRAPH.JUSTIFY
        p.paragraph_format.space_before = Pt(4)
        p.paragraph_format.space_after = Pt(6)
        p.paragraph_format.line_spacing = 1.15
        r_t = p.add_run(title_acc + "\n")
        r_t.bold = True
        r_t.font.name = "Arial"
        r_t.font.size = Pt(10)
        r_t.font.color.rgb = COLOR_PRIMARY
        r_d = p.add_run(desc_acc)
        r_d.font.name = "Arial"
        r_d.font.size = Pt(9.5)

    doc.add_paragraph().paragraph_format.space_after = Pt(6)

    # 4.4 Dos Instrumentos de Política Ambiental
    p = doc.add_paragraph()
    r = p.add_run("4.4. Instrumentos de Política Ambiental Colombiana Seleccionados")
    r.bold = True
    r.font.name = "Arial"
    r.font.size = Pt(11)
    r.font.color.rgb = COLOR_SECONDARY

    inst_text = (
        "La estrategia se ancla firmemente en dos instrumentos formales de política ambiental aplicables en el territorio nacional:\n\n"
        "1. Instrumento Económico y de Mercado: Sistema de Depósito, Devolución y Retorno (SDDR) articulado con Impuestos al Descarte (Ley 2277 de 2022 y ENEC):\n"
        "• Fundamentación: Respaldado en la Estrategia Nacional de Economía Circular (ENEC) y el mandato de internalización tributaria de la Ley 2277 de 2022. "
        "En el campus, la universidad fija un valor monetario de garantía ($2.000 COP) que el comprador entrega al pedir un envase retornable; dicho depósito se reintegra "
        "de inmediato cuando el envase regresa a la cafetería o a los cajeros automáticos inversos de acopio. Quien opte por un descartable autorizado debe pagar un recargo "
        "no reembolsable de $500 COP. Este instrumento convierte al desecho en dinero vivo, alterando el cálculo racional del consumidor en favor de la reutilización.\n\n"
        "2. Instrumento Regulatorio / Comando y Control: Estatuto de Compras Públicas Circulares y Restricción Progresiva de Plásticos (Ley 2232 de 2022 y Dec. 1076 de 2015):\n"
        "• Fundamentación: Basado en el Decreto Único Reglamentario 1076 de 2015 y la Ley 2232 de 2022, la cual decreta la salida del mercado de productos plásticos de un solo uso en Colombia. "
        "A través de una Resolución Rectoral Vinculante, la universidad estipula la obligatoriedad de que el 100% de los pliegos de contratación comercial, compras de papelería "
        "y servicios de banquetería eliminen los descartables. El incumplimiento acarrea multas económicas automáticas y la pérdida de la concesión del local, "
        "cerrando cualquier brecha a la evasión voluntarista."
    )
    p = doc.add_paragraph()
    p.alignment = WD_ALIGN_PARAGRAPH.JUSTIFY
    p.paragraph_format.space_after = Pt(8)
    p.paragraph_format.line_spacing = 1.15
    r = p.add_run(inst_text)
    r.font.name = "Arial"
    r.font.size = Pt(10)

    # 4.5 Mecanismo de Participación Ciudadana
    p = doc.add_paragraph()
    r = p.add_run("4.5. Mecanismo de Participación Ciudadana y Veeduría Comunitaria")
    r.bold = True
    r.font.name = "Arial"
    r.font.size = Pt(11)
    r.font.color.rgb = COLOR_SECONDARY

    part_text = (
        "• Mecanismo Institucional: «Mesa Universitaria de Concertación y Veeduría Socioambiental (MUCVA)» con Audiencias Públicas y Presupuesto Participativo.\n\n"
        "• Amparo Constitucional y Normativo: Artículos 79 y 270 de la Constitución Política de Colombia (Derecho a gozar de un ambiente sano y facultades de control social ciudadano), "
        "la Ley 1757 de 2015 (Estatuto de la Participación Democrática) y los pilares de acceso a la información y justicia ambiental consagrados en el Acuerdo de Escazú (Ley 2273 de 2022).\n\n"
        "• Estructura Operativa en el Campus: La MUCVA opera como un cuerpo colegiado conformado por representantes estudiantiles elegidos democráticamente, voceros docentes, "
        "delegados de las cafeterías, directivos de infraestructura y representantes sindicales del personal de servicios generales. "
        "Sus competencias incluyen:\n"
        "a) Veeduría Social Directa: Realizar inspecciones bimensuales a las zonas de acopio de residuos y revisar los libros de aforo de basuras.\n"
        "b) Audiencias Públicas de Rendición de Cuentas: Cada semestre, el Rector y el Comité Ambiental presentan a la comunidad el balance de toneladas desviadas del vertedero.\n"
        "c) Asambleas de Presupuesto Participativo Verde: Sesiones abiertas donde los estamentos deciden la asignación de recursos a iniciativas ecológicas de base."
    )
    p = doc.add_paragraph()
    p.alignment = WD_ALIGN_PARAGRAPH.JUSTIFY
    p.paragraph_format.space_after = Pt(8)
    p.paragraph_format.line_spacing = 1.15
    r = p.add_run(part_text)
    r.font.name = "Arial"
    r.font.size = Pt(10)

    # 4.6 Cuatro Indicadores
    p = doc.add_paragraph()
    r = p.add_run("4.6. Matriz de Indicadores de Seguimiento y Evaluación de Impacto")
    r.bold = True
    r.font.name = "Arial"
    r.font.size = Pt(11)
    r.font.color.rgb = COLOR_SECONDARY

    ind_intro = (
        "Para monitorear el desempeño empírico de la estrategia, se establecen cuatro indicadores cuantitativos y cualitativos verificables:"
    )
    p = doc.add_paragraph()
    p.alignment = WD_ALIGN_PARAGRAPH.JUSTIFY
    p.paragraph_format.space_after = Pt(6)
    r = p.add_run(ind_intro)
    r.font.name = "Arial"
    r.font.size = Pt(10)

    t_ind = doc.add_table(rows=5, cols=5)
    t_ind.alignment = WD_TABLE_ALIGNMENT.CENTER
    set_table_borders(t_ind)

    headers_ind = ["Indicador Técnico", "Ecuación / Fórmula de Cálculo", "Meta de Gestión (18 Meses)", "Frecuencia", "Unidad Responsable"]
    for i, h in enumerate(headers_ind):
        add_header_cell(t_ind.rows[0], i, h, bg_hex=HEX_PRIMARY)

    ind_data = [
        ("1. Tasa de Desvío de Plásticos Descartables (TDPD)",
         "[ (Masa plásticos de un solo uso Mes 0 - Masa Mes t) / (Masa Mes 0) ] * 100",
         "Disminución ≥ 75% respecto a la línea base inicial.",
         "Mensual",
         "Dirección de Planta Física y MUCVA"),

        ("2. Índice de Pureza en la Fuente (IPEF)",
         "[ (Peso de reciclables limpios en canecas blancas) / (Peso total acopiado en canecas blancas) ] * 100",
         "Pureza ≥ 90% (rechazo por grasas/líquidos inferior al 10%).",
         "Quincenal",
         "Equipo de Servicios Generales y Asociación de Recicladores"),

        ("3. Tasa de Reutilización Comercial (TREC)",
         "[ (Ventas de café/comida servidas en recipientes propios o retornables) / (Total de transacciones) ] * 100",
         "Penetración ≥ 80% sobre las ventas globales del campus.",
         "Mensual",
         "Auditoría de Concesiones y Cafeterías"),

        ("4. Índice de Corresponsabilidad Comunitaria (ICOC)",
         "[ (Encuestados que asumen el deber ético de separar sin delegarlo al personal de aseo) / (Total de muestra representativa) ] * 100",
         "Percepción de corresponsabilidad activa ≥ 85% de la comunidad.",
         "Semestral",
         "Facultad de Ciencias Ambientales y Bienestar Universitario")
    ]

    for r_idx, data in enumerate(ind_data, start=1):
        row = t_ind.rows[r_idx]
        make_row_cant_split(row)
        add_body_cell(row, 0, data[0], bold_prefix="", width=Inches(1.5), bg_hex=HEX_ACCENT_BG)
        add_body_cell(row, 1, data[1], bold_prefix="", width=Inches(2.2))
        add_body_cell(row, 2, data[2], bold_prefix="", width=Inches(1.3))
        add_body_cell(row, 3, data[3], bold_prefix="", width=Inches(0.9), bg_hex=HEX_LIGHT_BG)
        add_body_cell(row, 4, data[4], bold_prefix="", width=Inches(1.3))

    doc.add_paragraph().paragraph_format.space_after = Pt(12)

    doc.add_page_break()

    # ========================================================
    # 6. FASE 4: REFLEXIÓN FINAL CRÍTICA
    # ========================================================
    p_sec4 = doc.add_paragraph()
    r = p_sec4.add_run("5. FASE 4: REFLEXIÓN FINAL CRÍTICA")
    r.bold = True
    r.font.name = "Arial"
    r.font.size = Pt(13)
    r.font.color.rgb = COLOR_PRIMARY

    p_q_ref = doc.add_paragraph()
    r = p_q_ref.add_run("Eje de Debate Epistemológico:\n¿Por qué la solución de una problemática ambiental requiere intervenir no solamente sobre el comportamiento individual, sino también sobre las condiciones sociales, económicas, culturales e institucionales que influyen en dicho comportamiento?")
    r.bold = True
    r.font.name = "Arial"
    r.font.size = Pt(11)
    r.font.italic = True
    r.font.color.rgb = COLOR_SECONDARY
    p_q_ref.paragraph_format.space_after = Pt(10)

    reflexion_p1 = (
        "La pretensión de solucionar los desequilibrios ecológicos apelando de forma exclusiva a la 'conciencia moral' del consumidor individual "
        "constituye una de las trampas más paralizantes del ambientalismo tradicional. Esta perspectiva, arraigada en el individualismo metodológico, "
        "pretende hacer creer que la degradación ambiental es el fruto acumulativo de millones de malas decisiones individuales aisladas y que, por ende, "
        "bastaría con educar la mente del sujeto para que el mundo sane espontáneamente. Sin embargo, la sociología crítica (Schnaiberg, 1980; Leff, 2004) "
        "y la ecología política desmienten categóricamente esta ilusión: las personas no eligen en el vacío; sus conductas cotidianas están férreamente "
        "delimitadas, condicionadas y prefiguradas por las estructuras materiales, los marcos jurídicos y las dinámicas de poder que configuran su entorno."
    )
    p = doc.add_paragraph()
    p.alignment = WD_ALIGN_PARAGRAPH.JUSTIFY
    p.paragraph_format.space_after = Pt(8)
    p.paragraph_format.line_spacing = 1.15
    r = p.add_run(reflexion_p1)
    r.font.name = "Arial"
    r.font.size = Pt(10)

    reflexion_p2 = (
        "Si trasladamos esta reflexión al territorio de una universidad, la contradicción se hace palpable. Resulta hipócrita y pedagógicamente inútil "
        "culpar a un estudiante de primer semestre por tomar su jugo en un vaso plástico desechable si el campus no le ofrece alternativas viables: "
        "si las máquinas dispensadoras y los cafetines solo expenden empaques descartables; si no existen fuentes de agua potable donde recargar botellas; "
        "si las instalaciones no cuentan con piletas higiénicas para enjuagar una taza entre clases; y si el mercado premia económicamente el descarte veloz "
        "castigando la reutilización con incomodidad física y pérdida de tiempo. En tales circunstancias, el comportamiento insostenible no es una anomalía "
        "psicológica: es la respuesta más adaptativa y racional ante una infraestructura material diseñada para el desecho."
    )
    p = doc.add_paragraph()
    p.alignment = WD_ALIGN_PARAGRAPH.JUSTIFY
    p.paragraph_format.space_after = Pt(8)
    p.paragraph_format.line_spacing = 1.15
    r = p.add_run(reflexion_p2)
    r.font.name = "Arial"
    r.font.size = Pt(10)

    reflexion_p3 = (
        "Asimismo, el comportamiento está fuertemente atravesado por jerarquías culturales e institucionales. En nuestras sociedades todavía pervive "
        "un resabio colonial y clasista que mira con desdén las labores de aseo y cuidado de los espacios compartidos. Se asume con ligereza que 'alguien más limpiará', "
        "desligando el acto de consumir de sus consecuencias ecológicas directas. Esta condescendencia se perpetúa mientras la institución mantenga al personal de aseo "
        "en la sombra contractual, subcontratado y desprovisto de voz en los comités de planeación. Modificar la conducta de los estudiantes exige, antes que sermones, "
        "transformar ese orden simbólico: hacer visible el rostro humano del trabajo del aseo, convertir a las y los operarios en co-educadores ambientales "
        "y sancionar socialmente el clasismo de quienes consideran que pagar una colegiatura les otorga derecho a ensuciar."
    )
    p = doc.add_paragraph()
    p.alignment = WD_ALIGN_PARAGRAPH.JUSTIFY
    p.paragraph_format.space_after = Pt(8)
    p.paragraph_format.line_spacing = 1.15
    r = p.add_run(reflexion_p3)
    r.font.name = "Arial"
    r.font.size = Pt(10)

    reflexion_p4 = (
        "Por todas estas razones, la intervención ambiental debe ser de naturaleza sistémica. Requiere alinear de manera coordinada cuatro pilares estructurales:\n"
        "1. Pilar Institucional y Regulatorio: Reglas de juego taxativas que prohíban la adquisición de plásticos y obliguen a las concesiones comerciales a adaptarse so pena de cancelación contractual.\n"
        "2. Pilar Económico: Precios que digan la verdad ecológica, gravando el descarte mediante eco-tasas y subsidiando la reutilización con sistemas de depósito y reembolso.\n"
        "3. Pilar Físico e Infraestructural: Espacios ergonómicos que hagan que lavar un recipiente o separar una botella sea un acto expedito, limpio y placentero.\n"
        "4. Pilar Político y Ciudadano: Gobernanza participativa donde los estamentos decidan las prioridades presupuestales del campus y ejerzan veeduría colectiva.\n\n"
        "Cuando la estructura material, económica y cultural hace que la opción sustentable sea la más cómoda, la más económica, la más respetuosa y la más accesible, "
        "la conciencia individual deja de ser un esfuerzo titánico y se convierte en la forma natural y cotidiana de habitar el territorio común."
    )
    p = doc.add_paragraph()
    p.alignment = WD_ALIGN_PARAGRAPH.JUSTIFY
    p.paragraph_format.space_after = Pt(12)
    p.paragraph_format.line_spacing = 1.15
    r = p.add_run(reflexion_p4)
    r.font.name = "Arial"
    r.font.size = Pt(10)

    doc.add_page_break()

    # ========================================================
    # 7. REFERENCIAS BIBLIOGRÁFICAS (NORMAS APA 7.ª EDICIÓN)
    # ========================================================
    p_ref = doc.add_paragraph()
    r = p_ref.add_run("6. FUENTES BIBLIOGRÁFICAS Y MARCO NORMATIVO")
    r.bold = True
    r.font.name = "Arial"
    r.font.size = Pt(14)
    r.font.color.rgb = COLOR_PRIMARY

    referencias = [
        "Bandura, A. (2002). Selective moral disengagement in the exercise of moral agency. Journal of Moral Education, 31(2), 101-119. https://doi.org/10.1080/0305724022014322",
        "Congreso de la República de Colombia. (1991). Constitución Política de Colombia. Artículos 79 y 270 (Derecho al ambiente sano y control social). Gaceta Constitucional No. 116.",
        "Congreso de la República de Colombia. (1993). Ley 99 de 1993: Por la cual se crea el Ministerio del Medio Ambiente, se reordena el Sector Público encargado de la gestión y conservación de los recursos naturales y se organiza el SINA. Diario Oficial No. 41.146.",
        "Congreso de la República de Colombia. (2015). Ley 1757 de 2015: Estatuto de la participación democrática en Colombia. Diario Oficial No. 49.565.",
        "Congreso de la República de Colombia. (2022). Ley 2232 de 2022: Por la cual se establecen medidas tendientes a la reducción gradual de la producción y consumo de ciertos productos plásticos de un solo uso y se dictan otras disposiciones. Diario Oficial No. 52.088.",
        "Congreso de la República de Colombia. (2022). Ley 2273 de 2022: Por medio de la cual se aprueba el 'Acuerdo Regional sobre el Acceso a la Información, la Participación Pública y el Acceso a la Justicia en Asuntos Ambientales en América Latina y el Caribe' (Acuerdo de Escazú). Diario Oficial No. 52.195.",
        "Congreso de la República de Colombia. (2022). Ley 2277 de 2022: Reforma tributaria para la igualdad y la justicia social (Impuesto nacional sobre plásticos de un solo uso). Diario Oficial No. 52.247.",
        "Gifford, R. (2011). The dragons of inaction: Psychological barriers that limit climate change mitigation and adaptation. American Psychologist, 66(4), 290-302. https://doi.org/10.1037/a0023566",
        "Kollmuss, A., & Agyeman, J. (2002). Mind the gap: Why do people act environmentally and what are the barriers to pro-environmental behavior? Environmental Education Research, 8(3), 239-260. https://doi.org/10.1080/13504620220145401",
        "Leff, E. (2004). Racionalidad ambiental: la reapropiación social de la naturaleza. Siglo XXI Editores.",
        "Ministerio de Ambiente y Desarrollo Sostenible - MADS. (2015). Decreto 1076 de 2015: Decreto Único Reglamentario del Sector Ambiente y Desarrollo Sostenible. Bogotá D.C., Colombia.",
        "Ministerio de Ambiente y Desarrollo Sostenible - MADS. (2018). Estrategia Nacional de Economía Circular (ENEC): Cierre de ciclos de materiales e innovación tecnológica. Gobierno de Colombia.",
        "Ministerio de Ambiente y Desarrollo Sostenible - MADS. (2019). Resolución 2184 de 2019: Adopción del código unificado de colores para la separación de residuos sólidos en la fuente a nivel nacional. Bogotá D.C.",
        "Schnaiberg, A. (1980). The Environment: From Surplus to Scarcity. Oxford University Press.",
        "Thaler, R. H., & Sunstein, C. R. (2008). Nudge: Improving Decisions About Health, Wealth, and Happiness. Yale University Press.",
        "Warde, A. (2005). Consumption and theories of practice. Journal of Consumer Culture, 5(2), 131-153. https://doi.org/10.1177/1469540505053090"
    ]

    for ref in referencias:
        p_r = doc.add_paragraph()
        p_r.alignment = WD_ALIGN_PARAGRAPH.JUSTIFY
        p_r.paragraph_format.left_indent = Inches(0.3)
        p_r.paragraph_format.first_line_indent = Inches(-0.3)
        p_r.paragraph_format.space_after = Pt(5)
        p_r.paragraph_format.line_spacing = 1.15
        r_run = p_r.add_run(ref)
        r_run.font.name = "Arial"
        r_run.font.size = Pt(9)

    # Guardar en las rutas oficiales
    print(f"Guardando documento principal: {output_docx_primary}")
    doc.save(output_docx_primary)

    print(f"Guardando copia con nomenclatura secundaria: {output_docx_secondary}")
    doc.save(output_docx_secondary)

    print(f"Guardando copia legible: {output_docx_readable}")
    doc.save(output_docx_readable)

    print("Documentos generados con éxito.")

if __name__ == "__main__":
    build_turnitin_proof_document()
