# -*- coding: utf-8 -*-
"""
Generador de Documento Maestro - Nivel Máxima Excelencia (100/100 - 5.0)
IU Digital de Antioquia - Cátedra Ciencias Sociales y Medio Ambiente (Unidad 2)
Estudiante: Andrés Jair Restrepo
Docente: Nevis Alejandra Ruiz Márquez
Nomenclatura: Restrepo_JairAndres_Analizando.docx
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

def set_cell_margins(cell, top=120, bottom=120, left=150, right=150):
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
    set_cell_margins(cell, top=140, bottom=140, left=140, right=140)
    p = cell.paragraphs[0]
    p.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p.paragraph_format.space_before = Pt(0)
    p.paragraph_format.space_after = Pt(0)
    r = p.add_run(text)
    r.bold = True
    r.font.name = "Arial"
    r.font.size = Pt(9)
    r.font.color.rgb = fg_rgb
    return cell

def add_body_cell(row, col_idx, text, bold_prefix="", width=None, bg_hex="FFFFFF", align=WD_ALIGN_PARAGRAPH.LEFT):
    cell = row.cells[col_idx]
    if width:
        cell.width = width
    if bg_hex != "FFFFFF":
        set_cell_background(cell, bg_hex)
    set_cell_margins(cell, top=100, bottom=100, left=130, right=130)
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
        r_pre.font.color.rgb = RGBColor(16, 44, 87)
    r = p.add_run(text)
    r.font.name = "Arial"
    r.font.size = Pt(8.5)
    r.font.color.rgb = RGBColor(33, 33, 33)
    return cell

def add_callout(doc, title, text, bg_hex="F0F4F8", border_hex="102C57"):
    tbl = doc.add_table(rows=1, cols=1)
    tbl.alignment = WD_TABLE_ALIGNMENT.CENTER
    cell = tbl.rows[0].cells[0]
    set_cell_background(cell, bg_hex)
    set_cell_margins(cell, top=140, bottom=140, left=180, right=180)
    
    # Borde grueso a la izquierda
    tcPr = cell._tc.get_or_add_tcPr()
    borders = parse_xml(f'''
        <w:tcBorders {nsdecls("w")}>
            <w:top w:val="none"/>
            <w:left w:val="single" w:sz="24" w:space="0" w:color="{border_hex}"/>
            <w:bottom w:val="none"/>
            <w:right w:val="none"/>
        </w:tcBorders>
    ''')
    tcPr.append(borders)
    
    p = cell.paragraphs[0]
    p.paragraph_format.space_before = Pt(0)
    p.paragraph_format.space_after = Pt(3)
    r_t = p.add_run(title + "\n")
    r_t.bold = True
    r_t.font.name = "Arial"
    r_t.font.size = Pt(9.5)
    r_t.font.color.rgb = RGBColor(16, 44, 87)
    
    r_txt = p.add_run(text)
    r_txt.font.name = "Arial"
    r_txt.font.size = Pt(9)
    r_txt.font.color.rgb = RGBColor(40, 40, 40)
    p.paragraph_format.line_spacing = 1.15
    doc.add_paragraph().paragraph_format.space_after = Pt(4)

def build_masterpiece_document():
    base_template = r"C:\Users\lenovo\Desktop\trabajos andres\PLAN DE MANEJO DE IMPACTOS AMBIENTALES_backup.docx"
    output_dir = r"C:\Users\lenovo\Desktop\trabajos andres"
    
    output_docx_primary = os.path.join(output_dir, "Restrepo_JairAndres_Analizando.docx")
    output_docx_secondary = os.path.join(output_dir, "Restrepo_AndresJair_Analizando.docx")
    output_docx_readable = os.path.join(output_dir, "ACTIVIDAD 1 - CIENCIAS SOCIALES Y AMBIENTE - ESTRATEGIA SOCIOAMBIENTAL.docx")

    print("Cargando plantilla base para preservar el encabezado oficial con logo...")
    doc = docx.Document(base_template)

    # Limpiar cuerpo manteniendo encabezado con logo institucional
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
    COLOR_PRIMARY = RGBColor(16, 44, 87)       # Azul noche corporativo
    COLOR_SECONDARY = RGBColor(176, 21, 57)    # Granate / Carmesí IU Digital
    COLOR_BODY = RGBColor(33, 33, 33)          # Gris carbón para texto base
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
    r_role = p_role.add_run("Rol Asumido: Profesional en Ciencias Ambientales – Consultor en Gobernanza y Gestión Territorial")
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
    # 2. RESUMEN EJECUTIVO Y TABLA DE CONTENIDO GENERAL
    # ========================================================
    p_sum_title = doc.add_paragraph()
    r = p_sum_title.add_run("RESUMEN EJECUTIVO / ABSTRACT")
    r.bold = True
    r.font.name = "Arial"
    r.font.size = Pt(12)
    r.font.color.rgb = COLOR_PRIMARY

    p_res = doc.add_paragraph()
    p_res.alignment = WD_ALIGN_PARAGRAPH.JUSTIFY
    p_res.paragraph_format.space_after = Pt(6)
    p_res.paragraph_format.line_spacing = 1.15
    r = p_res.add_run(
        "El presente dictamen profesional aborda de manera estructural el conflicto socioambiental derivado del descarte "
        "masivo de envases y plásticos de un solo uso en un campus de educación superior en Colombia. A partir de una lectura "
        "interdisciplinar que integra la Sociología Ambiental (prácticas sociales y desmantelamiento de jerarquías de cuidado), "
        "la Economía Ecológica (internalización de externalidades y metabolismo social) y la Psicología Social (arquitectura de "
        "decisiones y teoría del Nudge), se formula la estrategia «Campus Circular y Corresponsable». La propuesta articula un "
        "horizonte de 18 meses para reducir en un 75% los polímeros descartables mediante cinco programas operativos, dos instrumentos "
        "de política ambiental nacional (Sistema de Depósito, Devolución y Retorno bajo la Ley 2277 de 2022 y contratación circular bajo "
        "la Ley 2232 de 2022), y la conformación de la Mesa Universitaria de Concertación y Veeduría Ambiental (MUCVA). "
        "El estudio concluye que las transiciones ecológicas genuinas son inviables si se apela únicamente a la culpa individual sin transformar "
        "las condiciones materiales, económicas e institucionales que obligan al desecho."
    )
    r.font.name = "Arial"
    r.font.size = Pt(9.5)

    p_kw = doc.add_paragraph()
    p_kw.paragraph_format.space_after = Pt(14)
    r_kwt = p_kw.add_run("Palabras Clave: ")
    r_kwt.bold = True
    r_kwt.font.name = "Arial"
    r_kwt.font.size = Pt(9)
    r_kwt.font.color.rgb = COLOR_PRIMARY
    r_kw = p_kw.add_run("Socioecología Universitaria, Metabolismo Circular, Plásticos de Un Solo Uso, Nudge Ambiental, Desentendimiento Moral, Ley 2232 de 2022, Veeduría Comunitaria.")
    r_kw.font.name = "Arial"
    r_kw.font.size = Pt(9)
    r_kw.font.italic = True

    # Tabla de Contenido Formal
    p_toc_t = doc.add_paragraph()
    r = p_toc_t.add_run("TABLA DE CONTENIDO GENERAL")
    r.bold = True
    r.font.name = "Arial"
    r.font.size = Pt(12)
    r.font.color.rgb = COLOR_PRIMARY

    t_toc = doc.add_table(rows=8, cols=2)
    t_toc.alignment = WD_TABLE_ALIGNMENT.CENTER
    set_table_borders(t_toc, color="D0D7DE", sz="2")

    toc_items = [
        ("1. FICHA TÉCNICA INSTITUCIONAL Y DIAGNÓSTICO METABÓLICO BASE", "Pág. 3"),
        ("2. FASE 1: ANÁLISIS SOCIOAMBIENTAL INTEGRAL DEL ESTUDIO DE CASO", "Pág. 4"),
        ("   2.1. Naturaleza del Problema Socioambiental y Fractura Comunitaria", "Pág. 4"),
        ("   2.2. Genealogía, Transformaciones Sociales y Expansión Petroquímica", "Pág. 5"),
        ("   2.3. Matriz de Actores Territoriales, Intereses y Cuotas de Poder", "Pág. 6"),
        ("   2.4. Dinámicas Psicosociales, Desentendimiento Moral y Efecto Manada", "Pág. 7"),
        ("   2.5. Consecuencias Socioambientales, Riesgo Laboral y Colapso Sanitario", "Pág. 8"),
        ("3. FASE 2: ANÁLISIS DESDE LAS CIENCIAS SOCIALES (MATRIZ COMPARATIVA)", "Pág. 9"),
        ("4. FASE 3: PROPUESTA ESTRATÉGICA «CAMPUS CIRCULAR Y CORRESPONSABLE»", "Pág. 11"),
        ("   4.1. Objetivos Estratégicos (General y Específicos)", "Pág. 11"),
        ("   4.2. Población Objetivo y Alcance Comunitario", "Pág. 12"),
        ("   4.3. Cinco Programas Operacionales de Mejora e Innovación", "Pág. 12"),
        ("   4.4. Dos Instrumentos de Política Ambiental Colombiana (Económico y Normativo)", "Pág. 14"),
        ("   4.5. Mecanismo de Participación Ciudadana y Veeduría Territorial (MUCVA)", "Pág. 15"),
        ("   4.6. Sistema de Indicadores Técnicos y Matriz de Riesgos", "Pág. 16"),
        ("   4.7. Cronograma Fásico de Implementación (Gantt 18 Meses)", "Pág. 17"),
        ("5. FASE 4: REFLEXIÓN FINAL CRÍTICA (DESMONTE DEL INDIVIDUALISMO METODOLÓGICO)", "Pág. 18"),
        ("6. FUENTES BIBLIOGRÁFICAS Y MARCO NORMATIVO (APA 7.ª EDICIÓN)", "Pág. 19")
    ]

    # Reestructuramos la tabla para que sea concisa
    t_toc = doc.add_table(rows=len(toc_items), cols=2)
    t_toc.alignment = WD_TABLE_ALIGNMENT.CENTER
    set_table_borders(t_toc, color="D0D7DE", sz="2")

    for i, (title_toc, page_toc) in enumerate(toc_items):
        r_row = t_toc.rows[i]
        make_row_cant_split(r_row)
        bg = HEX_LIGHT_BG if i % 2 == 0 else "FFFFFF"
        add_body_cell(r_row, 0, title_toc, bold_prefix="", width=Inches(6.0), bg_hex=bg)
        add_body_cell(r_row, 1, page_toc, bold_prefix="", width=Inches(1.0), bg_hex=bg, align=WD_ALIGN_PARAGRAPH.RIGHT)

    doc.add_page_break()

    # ========================================================
    # 3. FICHA TÉCNICA Y DIAGNÓSTICO METABÓLICO BASE
    # ========================================================
    p_h1 = doc.add_paragraph()
    r = p_h1.add_run("1. FICHA TÉCNICA INSTITUCIONAL Y DIAGNÓSTICO METABÓLICO BASE")
    r.bold = True
    r.font.name = "Arial"
    r.font.size = Pt(13)
    r.font.color.rgb = COLOR_PRIMARY

    t_meta = doc.add_table(rows=6, cols=2)
    t_meta.alignment = WD_TABLE_ALIGNMENT.CENTER
    set_table_borders(t_meta)
    
    meta_info = [
        ("Institución de Educación Superior:", "Institución Universitaria Digital de Antioquia – IU Digital"),
        ("Asignatura / Núcleo Problémico:", "Ciencias Sociales y Medio Ambiente – Unidad 2 (Conflictos y Políticas Ambientales)"),
        ("Docente Asesora:", "Nevis Alejandra Ruiz Márquez"),
        ("Consultor Especialista:", "Andrés Jair Restrepo (Entrega: Restrepo_JairAndres_Analizando.docx)"),
        ("Escenario de Intervención:", "Campus de educación superior con afluencia diaria de 12.000 usuarios (estudiantes, docentes y empleados)."),
        ("Línea Base Estimada del Problema:", "Generación promedio de 4,2 toneladas/mes de residuos sólidos, con un 48% correspondiente a empaques de un solo uso y un índice de contaminación cruzada del 65% en recipientes reciclables.")
    ]

    for idx, (label, val) in enumerate(meta_info):
        row = t_meta.rows[idx]
        make_row_cant_split(row)
        add_body_cell(row, 0, label, bold_prefix="", width=Inches(2.5), bg_hex=HEX_ACCENT_BG)
        add_body_cell(row, 1, val, bold_prefix="", width=Inches(4.5), bg_hex="FFFFFF")

    doc.add_paragraph().paragraph_format.space_after = Pt(8)

    add_callout(
        doc,
        "Premisa Epistemológica del Dictamen:",
        "La crisis de residuos en las universidades no se soluciona comprando más canecas ni dictando charlas morales. "
        "Se resuelve interviniendo la economía política de los contratos comerciales, la ergonomía de los espacios físicos "
        "y el reconocimiento ético del trabajo del aseo. Cuando el entorno facilita la sostenibilidad, la comunidad responde con corresponsabilidad."
    )

    doc.add_page_break()

    # ========================================================
    # 4. FASE 1: ANÁLISIS SOCIOAMBIENTAL
    # ========================================================
    p_sec1 = doc.add_paragraph()
    r = p_sec1.add_run("2. FASE 1: ANÁLISIS SOCIOAMBIENTAL DEL CONFLICTO EN EL CAMPUS")
    r.bold = True
    r.font.name = "Arial"
    r.font.size = Pt(13)
    r.font.color.rgb = COLOR_PRIMARY

    # 2.1 Naturaleza del problema
    p = doc.add_paragraph()
    r = p.add_run("2.1. ¿Cuál es la verdadera naturaleza del problema socioambiental?")
    r.bold = True
    r.font.name = "Arial"
    r.font.size = Pt(11)
    r.font.color.rgb = COLOR_SECONDARY

    q1_text = (
        "La aproximación técnica convencional suele catalogar este fenómeno como un simple 'desajuste en el manejo de residuos sólidos ordinarios'. "
        "Esa lectura resulta miope. Desde una perspectiva de ecología política y sociología territorial, el problema medular es la entronización "
        "de una cultura de consumo lineal acelerado y descarte sistemático, sustentada en la fractura del lazo comunitario y la externalización "
        "asimétrica de los costos socioambientales hacia los sectores más vulnerables de la institución.\n\n"
        "Existe una contradicción ética flagrante en el corazón de la academia: mientras en las aulas se debaten los Objetivos de Desarrollo Sostenible (ODS), "
        "la transición energética y la justicia climática, en las plazoletas de comidas y pasillos opera un metabolismo de enclave extractivo. "
        "Bienes fabricados con materias primas vírgenes (hidrocarburos refinados y celulosa) cuya degradación biológica tarda entre 100 y 450 años "
        "—vasos de polipapel plastificado, bandejas de poliestireno expandido (icopor), botellas PET y cubiertos desechables— son utilizados "
        "durante escasos siete a doce minutos para luego ser abandonados en cualquier recipiente. La infraestructura pasiva existente no orienta; "
        "al contrario, invisibiliza el residuo, sellando una ruptura metabólica entre lo que el campus consume y el pasivo ecológico que descarga sobre el territorio municipal."
    )
    p = doc.add_paragraph()
    p.alignment = WD_ALIGN_PARAGRAPH.JUSTIFY
    p.paragraph_format.space_after = Pt(8)
    p.paragraph_format.line_spacing = 1.15
    r = p.add_run(q1_text)
    r.font.name = "Arial"
    r.font.size = Pt(10)

    # 2.2 Causas históricas, sociales y tecnológicas
    p = doc.add_paragraph()
    r = p.add_run("2.2. ¿Cómo se originó el conflicto y qué transformaciones sociales y tecnológicas lo favorecieron?")
    r.bold = True
    r.font.name = "Arial"
    r.font.size = Pt(11)
    r.font.color.rgb = COLOR_SECONDARY

    q2_text = (
        "Este escenario no surgió de la noche a la mañana; es el resultado de cuatro transformaciones estructurales acaecidas en las últimas tres décadas:\n\n"
        "1. La Hegemonía Petroquímica y el Subsidio Oculto del Plástico: La expansión de la petroquímica global inundó el mercado de resinas poliméricas baratas. "
        "Al no gravarse la extracción de crudo ni exigirse la responsabilidad extendida del productor por el fin de vida de los envases, el plástico de un solo uso "
        "se convirtió en la alternativa más rentable para la industria alimentaria, desplazando radicalmente los envases de vidrio retornable tradicionales de los años 80.\n\n"
        "2. La Colonización del 'Tiempo Rápido' y el Fast-Food Universitario: La vida universitaria contemporánea sufre una intensificación de ritmos: mallas curriculares "
        "densas, estudiantes que combinan jornadas laborales con turnos académicos nocturnos y descansos breves de 15 minutos entre clases. "
        "Esta compresión temporal desmanteló el rito social de la comida reposada, imponiendo la 'alimentación sobre la marcha' (on-the-go): bebidas embotelladas, "
        "empanadas envueltas en film plástico y café servido en vasos térmicos descartables listos para consumir mientras se camina al aula.\n\n"
        "3. Desregulación Contractual y Lógica Comercial de Maximización: La universidad privatizó sus cafetines mediante contratos de concesión basados en el canon "
        "de arrendamiento más alto. Para reducir costos fijos de nómina, agua y detergentes, los comerciantes eliminaron los lavaplatos y la loza higienizable, "
        "trasladando el 100% de su expendio a vajilla descartable de bajísimo costo unitario ($80 a $120 COP por empaque).\n\n"
        "4. La Trampa de la Infraestructura Pasiva: Las canecas instaladas en el campus operan bajo una lógica de 'agujero negro'. Al no incorporar desagües para líquidos "
        "ni estaciones de lavado de manos y recipientes, obligan materialmente al usuario a mezclar: un café con leche a medio terminar se arroja sobre la caneca de reciclaje, "
        "arruinando irreparablemente los papeles y cartones secos acopiados."
    )
    p = doc.add_paragraph()
    p.alignment = WD_ALIGN_PARAGRAPH.JUSTIFY
    p.paragraph_format.space_after = Pt(8)
    p.paragraph_format.line_spacing = 1.15
    r = p.add_run(q2_text)
    r.font.name = "Arial"
    r.font.size = Pt(10)

    # 2.3 Matriz de Actores
    p = doc.add_paragraph()
    r = p.add_run("2.3. Mapeo Integral de Actores Sociales, Roles e Intereses en Conflicto")
    r.bold = True
    r.font.name = "Arial"
    r.font.size = Pt(11)
    r.font.color.rgb = COLOR_SECONDARY

    q3_intro = (
        "El análisis socioambiental exige desentrañar la micropolítica del campus. En la siguiente matriz se desglosan los seis grupos de interés "
        "involucrados, identificando sus tensiones cotidianas y recursos de poder:"
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

    headers_act = ["Grupo de Actores", "Rol Territorial en el Campus", "Intereses Concretos y Expectativas", "Cuota de Poder y Nivel de Afectación"]
    for i, h in enumerate(headers_act):
        add_header_cell(t_actores.rows[0], i, h, bg_hex=HEX_PRIMARY)

    actores_data = [
        ("Estudiantes de Pregrado y Posgrado", "Masa crítica de usuarios diarios; principales generadores de empaques en horarios de almuerzo y recesos.", "Demandan alimentos económicos, rapidez extrema en el servicio y comodidad. Manifiestan alta conciencia discursiva pero baja tolerancia al esfuerzo físico de higienizar envases.", "Alto poder de movilización colectiva / Alta afectación formativa y ética."),
        ("Profesorado e Investigadores", "Líderes de opinión académica, usuarios de cafetines y anfitriones de refrigerios en eventos institucionales.", "Priorizan la eficacia en sus cátedras y eventos. A menudo justifican el uso de desechables en congresos por 'higiene y rapidez', replicando modelos de consumo insostenibles.", "Alta influencia simbólica / Moderada afectación directa."),
        ("Equipo Directivo y Administrativo", "Custodios del presupuesto general, gestores contractuales y responsables de la acreditación universitaria.", "Persiguen la reducción de costos operativos en la factura de aseo, evitar sanciones ambientales y proyectar una imagen de 'Campus Verde' para captar matrículas.", "Máximo poder formal y normativo / Alta afectación reputacional."),
        ("Concesiones Comerciales y Cafeterías", "Empresas privadas que explotan la oferta alimentaria dentro de las instalaciones universitarias.", "Buscan maximizar la rentabilidad financiera por metro cuadrado, agilizar las filas en horas punta y eludir costos laborales asociados a la higienización de vajilla.", "Alto poder sobre la oferta material de empaques en el campus."),
        ("Personal Operativo de Servicios Generales", "Cuadrillas subcontratadas de limpieza, encargadas del vaciado de canecas y acopio general.", "Exigen condiciones de salud y seguridad en el trabajo, respeto a su dignidad humana, fin de las sobrecargas laborales y reducción del riesgo por cortes con plásticos rotos.", "Mínimo poder formal / Máxima vulnerabilidad física y laboral."),
        ("Asociaciones de Recicladores de Oficio", "Recuperadores ambientales que retiran los residuos aprovechables del campus para su venta.", "Requieren materiales secos, limpios y clasificados para garantizar ingresos dignos a sus familias, amparados en el Decreto 596 de 2016 de formalización tarifaria.", "Poder de articulación territorial / Alta dependencia económica.")
    ]

    for r_idx, data in enumerate(actores_data, start=1):
        row = t_actores.rows[r_idx]
        make_row_cant_split(row)
        add_body_cell(row, 0, data[0], bold_prefix="", width=Inches(1.8), bg_hex=HEX_ACCENT_BG)
        add_body_cell(row, 1, data[1], bold_prefix="", width=Inches(1.8))
        add_body_cell(row, 2, data[2], bold_prefix="", width=Inches(2.2))
        add_body_cell(row, 3, data[3], bold_prefix="", width=Inches(1.2), bg_hex=HEX_LIGHT_BG)

    doc.add_paragraph().paragraph_format.space_after = Pt(8)

    # 2.4 Comportamientos sociales
    p = doc.add_paragraph()
    r = p.add_run("2.4. ¿Qué dinámicas psicosociales y comportamientos reproducen el problema?")
    r.bold = True
    r.font.name = "Arial"
    r.font.size = Pt(11)
    r.font.color.rgb = COLOR_SECONDARY

    q4_text = (
        "El diagnóstico revela que el mal manejo de residuos no obedece a 'ignorancia', sino a dinámicas psicosociales profundamente arraigadas:\n\n"
        "• Difusión de la Responsabilidad y Desentendimiento Moral (Bandura, 2002): La presencia visible de personal uniformado de aseo genera un mecanismo "
        "de exculpación inconsciente. Los estudiantes racionalizan su desidia bajo el argumento: 'Si yo lo separo, le quito el trabajo al de aseo' o 'Yo pago una matrícula "
        "elevada que incluye el servicio de limpieza'. Esta transferencia ética despoja al ciudadano de su deber cívico de cuidar el espacio común.\n\n"
        "• Degeneración de la Norma Descriptiva (Broken Windows Theory): La conducta individual está condicionada por lo que se observa en los demás. "
        "Si un usuario llega a una caneca blanca y constata que ya contiene un vaso untado de salsa o cáscaras de mandarina, infiere que la norma de reciclaje "
        "está rota; por ende, arroja su residuo mezclado sin remordimiento alguno. La primera transgresión desata una cascada de contaminación colectiva.\n\n"
        "• El Sesgo del Presente y la Heurística del Menor Esfuerzo: Separar adecuadamente exige una pausa mental: vaciar líquidos, retirar la tapa plástica y buscar el contenedor "
        "correcto. Tirar todo en la caneca más próxima toma medio segundo. En ausencia de estímulos inmediatos, el cerebro humano siempre elegirá la vía de menor resistencia física.\n\n"
        "• Desconexión Metabólica e Ilusión del Agujero Negro: Para la comunidad, el residuo 'muere' en el momento en que cruza la boca de la caneca. "
        "Nadie presencia el viaje en camión hacia el relleno sanitario ni el esfuerzo manual de las trabajadoras de aseo que deben abrir bolsas sucias para rescatar materiales."
    )
    p = doc.add_paragraph()
    p.alignment = WD_ALIGN_PARAGRAPH.JUSTIFY
    p.paragraph_format.space_after = Pt(8)
    p.paragraph_format.line_spacing = 1.15
    r = p.add_run(q4_text)
    r.font.name = "Arial"
    r.font.size = Pt(10)

    # 2.5 Consecuencias
    p = doc.add_paragraph()
    r = p.add_run("2.5. Consecuencias Socioambientales, Riesgo Laboral y Colapso Sanitario")
    r.bold = True
    r.font.name = "Arial"
    r.font.size = Pt(11)
    r.font.color.rgb = COLOR_SECONDARY

    q5_text = (
        "Las repercusiones de este patrón insostenible generan impactos críticos en tres órdenes:\n\n"
        "1. Impacto Sanitario y Territorial en Antioquia: Los residuos mezclados no aprovechados engrosan los viajes de los camiones de aseo hacia el Relleno Sanitario "
        "La Pradera (operado por Emvarias en Donmatías/Barbosa), cuya vida útil atraviesa una crisis estructural sin precedentes en el Valle de Aburrá. "
        "Asimismo, se intensifican las emisiones fugitivas de gas metano ($CH_4$) por la descomposición anaerobia de alimentos aprisionados en bolsas plásticas, "
        "y se dispersan microplásticos en las redes de alcantarillado pluvial que desembocan en el Río Medellín-Porce.\n\n"
        "2. Vulneración Sociolaboral y Riesgo Biomecánico: El personal de servicios generales enfrenta riesgos ergonómicos y biológicos severos. "
        "Muchas operarias deben realizar un destape manual de bolsas contaminadas en cuartos de acopio oscuros para cumplir con las exigencias del PGIRS institucional, "
        "sufriendo pinchazos con pitillos afilados, cortes en los dedos con bordes de plástico rígido quebrado y dermatitis por contacto con residuos en descomposición.\n\n"
        "3. Impacto Financiero e Institucional: La universidad asume un sobrecosto permanente en la tarifa de aseo (Decreto 1077 de 2015), pagando por tonelada dispuesta "
        "en relleno lo que bien podría ser un flujo de ingresos bajo esquemas de aprovechamiento circular con recicladores de base. Simultáneamente, se socava la credibilidad "
        "y coherencia de la institución como faro ético y académico de la sociedad."
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
    # 5. FASE 2: ANÁLISIS DESDE LAS CIENCIAS SOCIALES
    # ========================================================
    p_sec2 = doc.add_paragraph()
    r = p_sec2.add_run("3. FASE 2: ANÁLISIS DESDE LAS CIENCIAS SOCIALES (DISCIPLINAS DE LA UNIDAD 2)")
    r.bold = True
    r.font.name = "Arial"
    r.font.size = Pt(13)
    r.font.color.rgb = COLOR_PRIMARY

    sec2_intro = (
        "De conformidad con las directrices de la Unidad 2, el análisis de un conflicto ambiental demanda superar el enfoque reduccionista de la ingeniería "
        "de materiales y convocar las herramientas teóricas de las Ciencias Sociales. En la siguiente tabla comparativa se articula el aporte de tres disciplinas "
        "esenciales: la Sociología Ambiental, la Economía Ecológica y la Psicología Social y Ambiental:"
    )
    p = doc.add_paragraph()
    p.alignment = WD_ALIGN_PARAGRAPH.JUSTIFY
    p.paragraph_format.space_after = Pt(8)
    p.paragraph_format.line_spacing = 1.15
    r = p.add_run(sec2_intro)
    r.font.name = "Arial"
    r.font.size = Pt(10)

    t_fase2 = doc.add_table(rows=4, cols=3)
    t_fase2.alignment = WD_TABLE_ALIGNMENT.CENTER
    set_table_borders(t_fase2)

    headers_f2 = ["Disciplina de las Ciencias Sociales", "¿Cómo interpreta el problema socioambiental?", "¿Cómo aporta a la solución integral?"]
    for i, h in enumerate(headers_f2):
        add_header_cell(t_fase2.rows[0], i, h, bg_hex=HEX_PRIMARY)

    f2_data = [
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

    for r_idx, data in enumerate(f2_data, start=1):
        row = t_fase2.rows[r_idx]
        make_row_cant_split(row)
        add_body_cell(row, 0, data[0], bold_prefix="", width=Inches(1.8), bg_hex=HEX_ACCENT_BG)
        add_body_cell(row, 1, data[1], bold_prefix="", width=Inches(2.6))
        add_body_cell(row, 2, data[2], bold_prefix="", width=Inches(2.6))

    doc.add_paragraph().paragraph_format.space_after = Pt(12)

    doc.add_page_break()

    # ========================================================
    # 6. FASE 3: PROPUESTA ESTRATÉGICA
    # ========================================================
    p_sec3 = doc.add_paragraph()
    r = p_sec3.add_run("4. FASE 3: PROPUESTA ESTRATÉGICA «CAMPUS CIRCULAR Y CORRESPONSABLE»")
    r.bold = True
    r.font.name = "Arial"
    r.font.size = Pt(13)
    r.font.color.rgb = COLOR_PRIMARY

    # 4.1 Objetivos
    p = doc.add_paragraph()
    r = p.add_run("4.1. Marco de Objetivos del Plan Estratégico")
    r.bold = True
    r.font.name = "Arial"
    r.font.size = Pt(11)
    r.font.color.rgb = COLOR_SECONDARY

    obj_text = (
        "• Objetivo General:\n"
        "Diseñar, implementar y consolidar un modelo integral de descarbonización de materiales y corresponsabilidad socioambiental en el campus, "
        "con el propósito de abatir en un 75% el volumen de plásticos y empaques descartables en un horizonte de 18 meses, transformando los hábitos "
        "de consumo de la comunidad universitaria mediante instrumentos normativos, económicos, infraestructura facilitadora y gobernanza comunitaria vinculante.\n\n"
        "• Objetivos Específicos:\n"
        "1. Erradicar de manera progresiva y obligatoria el uso de plásticos descartables en todos los establecimientos de comidas del campus, articulando vajilla reutilizable institucional y esquemas de préstamo de envases.\n"
        "2. Reacondicionar la infraestructura de disposición en el 100% de las sedes mediante puntos ecológicos inteligentes bajo el Código Nacional de Colores (Res. 2184/2019) y estaciones de higienización rápida «Eco-Wash».\n"
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

    doc.add_paragraph().paragraph_format.space_after = Pt(10)

    # 4.7 Cronograma y Gestión de Riesgos (Nivel Master)
    p_cron = doc.add_paragraph()
    r = p_cron.add_run("4.7. Hoja de Ruta Fásica (Cronograma 18 Meses) y Matriz de Riesgos")
    r.bold = True
    r.font.name = "Arial"
    r.font.size = Pt(11)
    r.font.color.rgb = COLOR_SECONDARY

    t_gantt = doc.add_table(rows=4, cols=3)
    t_gantt.alignment = WD_TABLE_ALIGNMENT.CENTER
    set_table_borders(t_gantt)

    headers_gantt = ["Fase del Cronograma", "Ventana Temporal", "Hitos Operacionales y Entregables Vinculantes"]
    for i, h in enumerate(headers_gantt):
        add_header_cell(t_gantt.rows[0], i, h, bg_hex=HEX_PRIMARY)

    gantt_data = [
        ("Fase I: Alistamiento Normativo y Acuerdos Comerciales",
         "Meses 1 al 4",
         "Suscripción del Otrosí ambiental con cafeterías; emisión de la Resolución Rectoral de compras verdes; conformación legal de la MUCVA y caracterización gravimétrica inicial."),
        ("Fase II: Despliegue de Infraestructura y Sistema SDDR",
         "Meses 5 al 10",
         "Instalación de las estaciones «Eco-Wash»; renovación de puntos ecológicos (Res. 2184/2019); activación de la app «Eco-Puntos IU» y reparto del stock de vajilla retornable."),
        ("Fase III: Consolidación, Auditoría y Veeduría Continua",
         "Meses 11 al 18",
         "Ejecución de auditorías quincenales de pureza; primera audiencia pública semestral de rendición de cuentas; votación del presupuesto participativo verde y evaluación del 75% de reducción.")
    ]

    for r_idx, data in enumerate(gantt_data, start=1):
        row = t_gantt.rows[r_idx]
        make_row_cant_split(row)
        add_body_cell(row, 0, data[0], bold_prefix="", width=Inches(2.2), bg_hex=HEX_ACCENT_BG)
        add_body_cell(row, 1, data[1], bold_prefix="", width=Inches(1.2), bg_hex=HEX_LIGHT_BG)
        add_body_cell(row, 2, data[2], bold_prefix="", width=Inches(3.8))

    doc.add_paragraph().paragraph_format.space_after = Pt(12)

    doc.add_page_break()

    # ========================================================
    # 7. FASE 4: REFLEXIÓN FINAL CRÍTICA
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
    # 8. REFERENCIAS BIBLIOGRÁFICAS (NORMAS APA 7.ª EDICIÓN)
    # ========================================================
    p_ref = doc.add_paragraph()
    r = p_ref.add_run("6. FUENTES BIBLIOGRÁFICAS Y MARCO NORMATIVO")
    r.bold = True
    r.font.name = "Arial"
    r.font.size = Pt(14)
    r.font.color.rgb = COLOR_PRIMARY

    referencias = [
        "Ajzen, I. (1991). The theory of planned behavior. Organizational Behavior and Human Decision Processes, 50(2), 179-211. https://doi.org/10.1016/0749-5978(91)90020-T",
        "Bandura, A. (2002). Selective moral disengagement in the exercise of moral agency. Journal of Moral Education, 31(2), 101-119. https://doi.org/10.1080/0305724022014322",
        "Beck, U. (1998). La sociedad del riesgo: Hacia una nueva modernidad. Editorial Paidós.",
        "Congreso de la República de Colombia. (1991). Constitución Política de Colombia. Artículos 79 y 270 (Derecho al ambiente sano y control social ciudadano). Gaceta Constitucional No. 116.",
        "Congreso de la República de Colombia. (1993). Ley 99 de 1993: Por la cual se crea el Ministerio del Medio Ambiente, se reordena el Sector Público encargado de la gestión y conservación de los recursos naturales y se organiza el SINA. Diario Oficial No. 41.146.",
        "Congreso de la República de Colombia. (2015). Ley 1757 de 2015: Estatuto de la participación democrática en Colombia. Diario Oficial No. 49.565.",
        "Congreso de la República de Colombia. (2022). Ley 2232 de 2022: Por la cual se establecen medidas tendientes a la reducción gradual de la producción y consumo de ciertos productos plásticos de un solo uso y se dictan otras disposiciones. Diario Oficial No. 52.088.",
        "Congreso de la República de Colombia. (2022). Ley 2273 de 2022: Por medio de la cual se aprueba el 'Acuerdo Regional sobre el Acceso a la Información, la Participación Pública y el Acceso a la Justicia en Asuntos Ambientales en América Latina y el Caribe' (Acuerdo de Escazú). Diario Oficial No. 52.195.",
        "Congreso de la República de Colombia. (2022). Ley 2277 de 2022: Reforma tributaria para la igualdad y la justicia social (Impuesto nacional sobre plásticos de un solo uso). Diario Oficial No. 52.247.",
        "Daly, H. E. (1991). Steady-State Economics (2nd ed.). Island Press.",
        "Georgescu-Roegen, N. (1971). The Entropy Law and the Economic Process. Harvard University Press.",
        "Gifford, R. (2011). The dragons of inaction: Psychological barriers that limit climate change mitigation and adaptation. American Psychologist, 66(4), 290-302. https://doi.org/10.1037/a0023566",
        "Kollmuss, A., & Agyeman, J. (2002). Mind the gap: Why do people act environmentally and what are the barriers to pro-environmental behavior? Environmental Education Research, 8(3), 239-260. https://doi.org/10.1080/13504620220145401",
        "Leff, E. (2004). Racionalidad ambiental: la reapropiación social de la naturaleza. Siglo XXI Editores.",
        "Max-Neef, M. A. (1998). Desarrollo a escala humana: Conceptos, reflexiones y algunas aplicaciones. Editorial Nordan-Comunidad.",
        "Ministerio de Ambiente y Desarrollo Sostenible - MADS. (2015). Decreto 1076 de 2015: Decreto Único Reglamentario del Sector Ambiente y Desarrollo Sostenible. Bogotá D.C., Colombia.",
        "Ministerio de Ambiente y Desarrollo Sostenible - MADS. (2016). Decreto 596 de 2016: Esquema operativo de la actividad de aprovechamiento del servicio público de aseo y régimen transitorio para la formalización de recicladores de oficio. Bogotá D.C.",
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

    print("Documentos maestros generados exitosamente.")

if __name__ == "__main__":
    build_masterpiece_document()
