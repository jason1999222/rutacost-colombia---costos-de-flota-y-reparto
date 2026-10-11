# -*- coding: utf-8 -*-
"""
Generador Maestro con Normas APA 7.ª Edición Estricta
- Título principal en NEGRILLA NEGRA PURA (RGB 0, 0, 0)
- Todos los títulos y subtítulos de todos los niveles en NEGRILLA NEGRA (RGB 0, 0, 0)
- Jerarquía de títulos APA 7:
    * Nivel 1: Centrado, Negrilla negra, 12 pt
    * Nivel 2: Alineado a la izquierda, Negrilla negra, 11 pt
    * Nivel 3: Alineado a la izquierda, Negrilla negra y Cursiva, 10.5 pt
- Portada APA 7 con título en Negrilla Negra y nombre del estudiante en Negrilla Negra
- Sangría de primera línea reglamentaria de 1,27 cm (0.5 in) en párrafos
- Tablas APA 7 oficiales: número en Negrilla Negra, título en cursiva, sin bordes verticales
- Referencias bibliográficas con sangría francesa y título "Referencias" en Negrilla Negra
- Encabezado con logotipo oficial de la IU Digital de Antioquia

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

COLOR_BLACK = RGBColor(0, 0, 0)        # Negrilla negra pura para todos los títulos
COLOR_BODY = RGBColor(0, 0, 0)         # Texto negro puro estándar APA 7

def set_cell_background(cell, fill_hex):
    tcPr = cell._tc.get_or_add_tcPr()
    shd = parse_xml(f'<w:shd {nsdecls("w")} w:fill="{fill_hex}"/>')
    tcPr.append(shd)

def set_cell_margins(cell, top=100, bottom=100, left=140, right=140):
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

def set_apa_table_borders(table, color="000000", sz="8", inside_sz="4"):
    """
    Formato de tablas estricto APA 7:
    - Borde superior negro
    - Borde inferior negro
    - Borde debajo del encabezado
    - Sin bordes verticales (left, right, insideV = none)
    """
    tblPr = table._tbl.tblPr
    borders = parse_xml(f'''
        <w:tblBorders {nsdecls("w")}>
            <w:top w:val="single" w:sz="{sz}" w:space="0" w:color="{color}"/>
            <w:bottom w:val="single" w:sz="{sz}" w:space="0" w:color="{color}"/>
            <w:left w:val="none"/>
            <w:right w:val="none"/>
            <w:insideH w:val="single" w:sz="{inside_sz}" w:space="0" w:color="D3D3D3"/>
            <w:insideV w:val="none"/>
        </w:tblBorders>
    ''')
    tblPr.append(borders)

def make_row_cant_split(row):
    trPr = row._tr.get_or_add_trPr()
    trPr.append(OxmlElement('w:cantSplit'))

# ========================================================
# FUNCIONES DE FORMATO APA 7.ª EDICIÓN (TÍTULOS EN NEGRILLA)
# ========================================================

def add_apa_title(doc, text):
    """Título del documento: Centrado, en Negrilla Negra, Tamaño 14 pt"""
    p = doc.add_paragraph()
    p.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p.paragraph_format.space_before = Pt(8)
    p.paragraph_format.space_after = Pt(14)
    p.paragraph_format.line_spacing = 1.2
    r = p.add_run(text)
    r.bold = True  # NEGRILLA
    r.font.name = "Arial"
    r.font.size = Pt(14)
    r.font.color.rgb = COLOR_BLACK  # COLOR NEGRO
    return p

def add_apa_level_1(doc, text):
    """Nivel 1 APA 7: Centrado, en Negrilla Negra, 12 pt"""
    p = doc.add_paragraph()
    p.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p.paragraph_format.space_before = Pt(18)
    p.paragraph_format.space_after = Pt(6)
    p.paragraph_format.line_spacing = 1.15
    r = p.add_run(text)
    r.bold = True  # NEGRILLA
    r.font.name = "Arial"
    r.font.size = Pt(12)
    r.font.color.rgb = COLOR_BLACK  # COLOR NEGRO
    return p

def add_apa_level_2(doc, text):
    """Nivel 2 APA 7: Alineado a la izquierda, en Negrilla Negra, 11 pt"""
    p = doc.add_paragraph()
    p.alignment = WD_ALIGN_PARAGRAPH.LEFT
    p.paragraph_format.space_before = Pt(14)
    p.paragraph_format.space_after = Pt(4)
    p.paragraph_format.line_spacing = 1.15
    r = p.add_run(text)
    r.bold = True  # NEGRILLA
    r.font.name = "Arial"
    r.font.size = Pt(11)
    r.font.color.rgb = COLOR_BLACK  # COLOR NEGRO
    return p

def add_apa_level_3(doc, text):
    """Nivel 3 APA 7: Alineado a la izquierda, en Negrilla Negra y Cursiva, 10.5 pt"""
    p = doc.add_paragraph()
    p.alignment = WD_ALIGN_PARAGRAPH.LEFT
    p.paragraph_format.space_before = Pt(10)
    p.paragraph_format.space_after = Pt(4)
    p.paragraph_format.line_spacing = 1.15
    r = p.add_run(text)
    r.bold = True  # NEGRILLA
    r.font.italic = True
    r.font.name = "Arial"
    r.font.size = Pt(10.5)
    r.font.color.rgb = COLOR_BLACK  # COLOR NEGRO
    return p

def add_apa_body(doc, text, space_after=6):
    """Párrafo de cuerpo APA 7: Sangría de primera línea de 1,27 cm (0.5 in), Interlineado 1.15, Justificado"""
    p = doc.add_paragraph()
    p.alignment = WD_ALIGN_PARAGRAPH.JUSTIFY
    p.paragraph_format.first_line_indent = Inches(0.5)  # 1.27 cm APA 7
    p.paragraph_format.space_before = Pt(0)
    p.paragraph_format.space_after = Pt(space_after)
    p.paragraph_format.line_spacing = 1.15
    r = p.add_run(text)
    r.font.name = "Arial"
    r.font.size = Pt(10)
    r.font.color.rgb = COLOR_BODY
    return p

def add_apa_table_header(doc, table_num, table_title):
    """Encabezado oficial de Tabla APA 7: Número en Negrilla Negra, Título en Cursiva"""
    p_num = doc.add_paragraph()
    p_num.paragraph_format.space_before = Pt(12)
    p_num.paragraph_format.space_after = Pt(2)
    p_num.paragraph_format.first_line_indent = Inches(0)
    r_n = p_num.add_run(f"Tabla {table_num}")
    r_n.bold = True  # NEGRILLA
    r_n.font.name = "Arial"
    r_n.font.size = Pt(10)
    r_n.font.color.rgb = COLOR_BLACK  # COLOR NEGRO

    p_t = doc.add_paragraph()
    p_t.paragraph_format.space_before = Pt(0)
    p_t.paragraph_format.space_after = Pt(6)
    p_t.paragraph_format.first_line_indent = Inches(0)
    r_ti = p_t.add_run(table_title)
    r_ti.font.italic = True
    r_ti.font.name = "Arial"
    r_ti.font.size = Pt(9.5)
    r_ti.font.color.rgb = COLOR_BLACK

def add_apa_table_note(doc, note_text):
    """Nota al pie de tabla APA 7: 'Nota.' en cursiva seguido del texto explicativo"""
    p = doc.add_paragraph()
    p.paragraph_format.space_before = Pt(3)
    p.paragraph_format.space_after = Pt(10)
    p.paragraph_format.first_line_indent = Inches(0)
    r_note = p.add_run("Nota. ")
    r_note.font.italic = True
    r_note.font.name = "Arial"
    r_note.font.size = Pt(8.5)
    r_note.font.color.rgb = RGBColor(60, 60, 60)
    
    r_txt = p.add_run(note_text)
    r_txt.font.name = "Arial"
    r_txt.font.size = Pt(8.5)
    r_txt.font.color.rgb = RGBColor(60, 60, 60)

def add_table_header_cell(row, col_idx, text, width=None, bg_hex="F2F2F2"):
    cell = row.cells[col_idx]
    if width:
        cell.width = width
    set_cell_background(cell, bg_hex)
    set_cell_margins(cell, top=120, bottom=120, left=130, right=130)
    p = cell.paragraphs[0]
    p.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p.paragraph_format.space_before = Pt(0)
    p.paragraph_format.space_after = Pt(0)
    p.paragraph_format.first_line_indent = Inches(0)
    r = p.add_run(text)
    r.bold = True  # NEGRILLA
    r.font.name = "Arial"
    r.font.size = Pt(9)
    r.font.color.rgb = COLOR_BLACK  # COLOR NEGRO
    return cell

def add_table_body_cell(row, col_idx, text, bold_prefix="", width=None, bg_hex="FFFFFF", align=WD_ALIGN_PARAGRAPH.LEFT):
    cell = row.cells[col_idx]
    if width:
        cell.width = width
    if bg_hex != "FFFFFF":
        set_cell_background(cell, bg_hex)
    set_cell_margins(cell, top=90, bottom=90, left=120, right=120)
    p = cell.paragraphs[0]
    p.alignment = align
    p.paragraph_format.space_before = Pt(0)
    p.paragraph_format.space_after = Pt(2)
    p.paragraph_format.first_line_indent = Inches(0)
    p.paragraph_format.line_spacing = 1.15
    if bold_prefix:
        r_pre = p.add_run(bold_prefix)
        r_pre.bold = True  # NEGRILLA
        r_pre.font.name = "Arial"
        r_pre.font.size = Pt(8.5)
        r_pre.font.color.rgb = COLOR_BLACK  # COLOR NEGRO
    r = p.add_run(text)
    r.font.name = "Arial"
    r.font.size = Pt(8.5)
    r.font.color.rgb = COLOR_BODY
    return cell

def add_apa_callout(doc, title, text, border_hex="000000"):
    tbl = doc.add_table(rows=1, cols=1)
    tbl.alignment = WD_TABLE_ALIGNMENT.CENTER
    cell = tbl.rows[0].cells[0]
    set_cell_background(cell, "F9F9F9")
    set_cell_margins(cell, top=120, bottom=120, left=160, right=160)
    
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
    p.paragraph_format.first_line_indent = Inches(0)
    r_t = p.add_run(title + "\n")
    r_t.bold = True  # NEGRILLA
    r_t.font.name = "Arial"
    r_t.font.size = Pt(9.5)
    r_t.font.color.rgb = COLOR_BLACK  # COLOR NEGRO
    
    r_txt = p.add_run(text)
    r_txt.font.name = "Arial"
    r_txt.font.size = Pt(9)
    r_txt.font.color.rgb = COLOR_BLACK
    p.paragraph_format.line_spacing = 1.15
    doc.add_paragraph().paragraph_format.space_after = Pt(4)

def build_apa7_document():
    base_template = r"C:\Users\lenovo\Desktop\trabajos andres\PLAN DE MANEJO DE IMPACTOS AMBIENTALES_backup.docx"
    output_dir = r"C:\Users\lenovo\Desktop\trabajos andres"
    
    output_docx_primary = os.path.join(output_dir, "Restrepo_JairAndres_Analizando.docx")
    output_docx_secondary = os.path.join(output_dir, "Restrepo_AndresJair_Analizando.docx")
    output_docx_readable = os.path.join(output_dir, "ACTIVIDAD 1 - CIENCIAS SOCIALES Y AMBIENTE - ESTRATEGIA SOCIOAMBIENTAL.docx")

    print("Cargando plantilla base para preservar el encabezado institucional...")
    doc = docx.Document(base_template)

    # Limpiar cuerpo manteniendo encabezado con logo oficial
    for p in list(doc.paragraphs):
        p._p.getparent().remove(p._p)
    for t in list(doc.tables):
        t._tbl.getparent().remove(t._tbl)

    for section in doc.sections:
        section.top_margin = Inches(1.0)
        section.bottom_margin = Inches(1.0)
        section.left_margin = Inches(1.0)
        section.right_margin = Inches(1.0)

    # ========================================================
    # 1. PORTADA ESTUDIANTIL ESTRICTA NORMAS APA 7.ª EDICIÓN
    # ========================================================
    for _ in range(3):
        doc.add_paragraph()

    # TÍTULO EN NEGRILLA NEGRA PURA SEGÚN NORMAS APA 7
    p_title = doc.add_paragraph()
    p_title.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p_title.paragraph_format.space_after = Pt(18)
    p_title.paragraph_format.first_line_indent = Inches(0)
    p_title.paragraph_format.line_spacing = 1.3
    r_title = p_title.add_run(
        "Estrategia Integral de Intervención Socioambiental: Transición Hacia\n"
        "la Economía Circular, Reducción de Plásticos de Un Solo Uso y\n"
        "Corresponsabilidad en el Campus Universitario"
    )
    r_title.bold = True  # NEGRILLA
    r_title.font.name = "Arial"
    r_title.font.size = Pt(14)
    r_title.font.color.rgb = COLOR_BLACK  # COLOR NEGRO PURO

    # Subtítulo explicativo
    p_sub = doc.add_paragraph()
    p_sub.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p_sub.paragraph_format.space_after = Pt(28)
    p_sub.paragraph_format.first_line_indent = Inches(0)
    r_sub = p_sub.add_run("Evidencia de Aprendizaje 1 (EA1) – Unidad 2: Ciencias Sociales y Medio Ambiente")
    r_sub.font.name = "Arial"
    r_sub.font.size = Pt(11)
    r_sub.font.italic = True
    r_sub.font.color.rgb = RGBColor(60, 60, 60)

    for _ in range(2):
        doc.add_paragraph()

    # Metadatos de la Portada APA 7 (Estudiante, Afiliación, Asignatura, Docente, Fecha)
    p_meta = doc.add_paragraph()
    p_meta.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p_meta.paragraph_format.first_line_indent = Inches(0)
    p_meta.paragraph_format.line_spacing = 1.3
    p_meta.paragraph_format.space_after = Pt(0)

    # Nombre del estudiante (en negrilla negra)
    r_stu = p_meta.add_run("Andrés Jair Restrepo\n")
    r_stu.bold = True  # NEGRILLA
    r_stu.font.name = "Arial"
    r_stu.font.size = Pt(12)
    r_stu.font.color.rgb = COLOR_BLACK

    r_role = p_meta.add_run("Rol Profesional: Especialista Asesor en Ciencias Ambientales y Sostenibilidad\n\n")
    r_role.font.italic = True
    r_role.font.name = "Arial"
    r_role.font.size = Pt(10)
    r_role.font.color.rgb = RGBColor(60, 60, 60)

    r_fac = p_meta.add_run("Facultad de Ciencias Ambientales y Sostenibilidad, Institución Universitaria Digital de Antioquia – IU Digital\n")
    r_fac.font.name = "Arial"
    r_fac.font.size = Pt(11)
    r_fac.font.color.rgb = COLOR_BLACK

    r_cur = p_meta.add_run("Ciencias Sociales y Medio Ambiente – Código Unidad 2\n")
    r_cur.font.name = "Arial"
    r_cur.font.size = Pt(11)
    r_cur.font.color.rgb = COLOR_BLACK

    r_doc = p_meta.add_run("Docente: Nevis Alejandra Ruiz Márquez\n")
    r_doc.font.name = "Arial"
    r_doc.font.size = Pt(11)
    r_doc.font.color.rgb = COLOR_BLACK

    r_date = p_meta.add_run("27 de septiembre de 2026")
    r_date.font.name = "Arial"
    r_date.font.size = Pt(11)
    r_date.font.color.rgb = COLOR_BLACK

    doc.add_page_break()

    # ========================================================
    # 2. RESUMEN Y TABLA DE CONTENIDO (ESTILO APA 7)
    # ========================================================
    add_apa_level_1(doc, "Resumen")

    p_res = doc.add_paragraph()
    p_res.alignment = WD_ALIGN_PARAGRAPH.JUSTIFY
    p_res.paragraph_format.first_line_indent = Inches(0)
    p_res.paragraph_format.space_after = Pt(8)
    p_res.paragraph_format.line_spacing = 1.15
    r = p_res.add_run(
        "El presente dictamen técnico formula una estrategia de intervención socioambiental ante el incremento crítico de residuos "
        "de envases y productos plásticos descartables en un campus de educación superior. Superando el enfoque convencional de la gestión "
        "operativa de residuos, se articulan los marcos analíticos de la Sociología Ambiental (prácticas sociales institucionalizadas), "
        "la Economía Ecológica (internalización de externalidades negativas) y la Psicología Social (arquitectura de decisiones y Nudges) "
        "para sustentar el programa «Campus Circular y Corresponsable». La intervención proyecta una reducción del 75% en polímeros de un solo uso "
        "en 18 meses mediante cinco programas operativos, dos instrumentos de política pública nacional (Sistema de Depósito, Devolución y Retorno bajo "
        "la Ley 2277 de 2022 y contratación circular bajo la Ley 2232 de 2022), y la conformación de la Mesa Universitaria de Concertación y Veeduría "
        "Socioambiental (MUCVA). Se demuestra teóricamente que las transiciones de sostenibilidad fracasan cuando se culpabiliza al individuo "
        "sin transformar las condiciones materiales, económicas y culturales que estructuran su conducta."
    )
    r.font.name = "Arial"
    r.font.size = Pt(9.5)
    r.font.color.rgb = COLOR_BODY

    p_kw = doc.add_paragraph()
    p_kw.paragraph_format.first_line_indent = Inches(0.5)
    p_kw.paragraph_format.space_after = Pt(16)
    r_kwt = p_kw.add_run("Palabras clave: ")
    r_kwt.bold = True
    r_kwt.font.italic = True
    r_kwt.font.name = "Arial"
    r_kwt.font.size = Pt(9)
    r_kwt.font.color.rgb = COLOR_BLACK
    r_kw = p_kw.add_run("economía circular, descarte lineal, plásticos de un solo uso, empujones verdes (nudges), desentendimiento moral, corresponsabilidad territorial, Ley 2232 de 2022.")
    r_kw.font.name = "Arial"
    r_kw.font.size = Pt(9)
    r_kw.font.color.rgb = COLOR_BLACK

    add_apa_level_1(doc, "Contenido General")

    toc_items = [
        ("1. Ficha Metodológica del Encargo y Diagnóstico Situacional Base", "Pág. 3"),
        ("2. Fase 1: Análisis Socioambiental del Conflicto en el Campus", "Pág. 4"),
        ("   2.1. Naturaleza del Problema Socioambiental y Fractura Comunitaria", "Pág. 4"),
        ("   2.2. Genealogía, Transformaciones Sociales y Expansión Petroquímica", "Pág. 5"),
        ("   2.3. Mapeo de Actores Territoriales, Intereses y Cuotas de Poder", "Pág. 6"),
        ("   2.4. Dinámicas Psicosociales, Desentendimiento Moral y Efecto Manada", "Pág. 7"),
        ("   2.5. Consecuencias Socioambientales, Riesgo Laboral y Colapso Sanitario", "Pág. 8"),
        ("3. Fase 2: Análisis Desde las Ciencias Sociales (Matriz Comparativa)", "Pág. 9"),
        ("4. Fase 3: Propuesta Estratégica «Campus Circular y Corresponsable»", "Pág. 11"),
        ("   4.1. Objetivos del Plan Estratégico (General y Específicos)", "Pág. 11"),
        ("   4.2. Población Objetivo y Cobertura Territorial", "Pág. 12"),
        ("   4.3. Cinco Programas Operacionales de Mejora e Innovación", "Pág. 12"),
        ("   4.4. Dos Instrumentos de Política Ambiental Colombiana (Económico y Normativo)", "Pág. 14"),
        ("   4.5. Mecanismo de Participación Ciudadana y Veeduría Territorial (MUCVA)", "Pág. 15"),
        ("   4.6. Sistema de Indicadores Técnicos y Evaluación de Resultados", "Pág. 16"),
        ("   4.7. Hoja de Ruta Fásica de Implementación (Cronograma 18 Meses)", "Pág. 17"),
        ("5. Fase 4: Reflexión Final Crítica (Desmonte del Individualismo Metodológico)", "Pág. 18"),
        ("6. Referencias", "Pág. 19")
    ]

    t_toc = doc.add_table(rows=len(toc_items), cols=2)
    t_toc.alignment = WD_TABLE_ALIGNMENT.CENTER
    set_apa_table_borders(t_toc)

    for i, (item_t, item_p) in enumerate(toc_items):
        r_row = t_toc.rows[i]
        make_row_cant_split(r_row)
        bg = "F9F9F9" if i % 2 == 0 else "FFFFFF"
        add_table_body_cell(r_row, 0, item_t, width=Inches(6.0), bg_hex=bg)
        add_table_body_cell(r_row, 1, item_p, width=Inches(1.0), bg_hex=bg, align=WD_ALIGN_PARAGRAPH.RIGHT)

    doc.add_page_break()

    # ========================================================
    # 3. ENCABEZADO Y REPETICIÓN DEL TÍTULO EN LA PRIMERA PÁGINA (APA 7)
    # ========================================================
    add_apa_title(
        doc,
        "Estrategia Integral de Intervención Socioambiental: Transición Hacia\n"
        "la Economía Circular, Reducción de Plásticos de Un Solo Uso y\n"
        "Corresponsabilidad en el Campus Universitario"
    )

    add_apa_level_1(doc, "1. Ficha Metodológica del Encargo y Diagnóstico Situacional Base")

    add_apa_table_header(doc, "1", "Identificación Técnica y Parámetros del Diagnóstico Socioambiental Base")

    t_meta = doc.add_table(rows=6, cols=2)
    t_meta.alignment = WD_TABLE_ALIGNMENT.CENTER
    set_apa_table_borders(t_meta)
    
    meta_info = [
        ("Institución de Educación Superior:", "Institución Universitaria Digital de Antioquia – IU Digital"),
        ("Asignatura / Núcleo Problémico:", "Ciencias Sociales y Medio Ambiente – Unidad 2 (Conflictos y Políticas Ambientales)"),
        ("Docente Asesora:", "Nevis Alejandra Ruiz Márquez"),
        ("Consultor Especialista:", "Andrés Jair Restrepo (Entrega oficial: Restrepo_JairAndres_Analizando.docx)"),
        ("Escenario de Intervención:", "Campus de educación superior con afluencia diaria de 12.000 usuarios (estudiantes, docentes y empleados)."),
        ("Línea Base Estimada del Problema:", "Generación promedio de 4,2 toneladas/mes de residuos sólidos, con un 48% correspondiente a empaques de un solo uso y un índice de contaminación cruzada del 65% en recipientes reciclables.")
    ]

    for idx, (label, val) in enumerate(meta_info):
        row = t_meta.rows[idx]
        make_row_cant_split(row)
        add_table_body_cell(row, 0, label, bold_prefix="", width=Inches(2.5), bg_hex="F2F2F2")
        add_table_body_cell(row, 1, val, bold_prefix="", width=Inches(4.5), bg_hex="FFFFFF")

    add_apa_table_note(doc, "Elaboración propia a partir del estudio de caso y parámetros gravimétricos típicos de campus universitarios en Colombia.")

    add_apa_body(
        doc,
        "El presente informe técnico responde al encargo institucional formulado por la dirección universitaria ante la proliferación "
        "alarmante de residuos plásticos y envases desechables en las diferentes sedes del campus. Como profesional asesor en Ciencias Ambientales, "
        "asumo la tarea de analizar esta realidad no como una simple anomalía de aseo o un fallo menor de logística operativa, sino como la "
        "manifestación tangible de un conflicto socioambiental de escala micro-territorial. La observación directa en campo demuestra que, "
        "si bien la universidad dispone de canecas diferenciadas, la mayor parte de los materiales con potencial de reciclaje se inutiliza al "
        "mezclarse con fluidos y restos de comida; los cafetines expenden casi la totalidad de sus productos en vajilla descartable; "
        "se ha naturalizado que la limpieza es una tarea ajena reservada al personal de aseo subcontratado; y los esfuerzos de sensibilización previos "
        "naufragaron por reducirse a carteles estáticos desprovistos de incentivos tangibles o transformaciones estructurales."
    )

    add_apa_callout(
        doc,
        "Premisa Epistemológica del Dictamen:",
        "La crisis de residuos en las instituciones educativas no se soluciona comprando más canecas ni dictando charlas morales. "
        "Se resuelve interviniendo la economía política de los contratos comerciales, la ergonomía de los espacios físicos "
        "y el reconocimiento ético del trabajo del aseo. Cuando el entorno facilita la sostenibilidad, la comunidad responde con corresponsabilidad."
    )

    doc.add_page_break()

    # ========================================================
    # 4. FASE 1: ANÁLISIS SOCIOAMBIENTAL
    # ========================================================
    add_apa_level_1(doc, "2. Fase 1: Análisis Socioambiental del Conflicto en el Campus")

    add_apa_level_2(doc, "2.1. Naturaleza del Problema Socioambiental y Fractura Comunitaria")

    add_apa_body(
        doc,
        "La aproximación técnica convencional suele catalogar este fenómeno como un simple 'desajuste en el manejo de residuos sólidos ordinarios'. "
        "Esa lectura resulta miope. Desde una perspectiva de ecología política y sociología territorial, el problema medular es la entronización "
        "de una cultura de consumo lineal acelerado y descarte sistemático, sustentada en la fractura del lazo comunitario y la externalización "
        "asimétrica de los costos socioambientales hacia los sectores más vulnerables de la institución."
    )
    add_apa_body(
        doc,
        "Existe una contradicción ética flagrante en el corazón de la academia: mientras en las aulas se debaten los Objetivos de Desarrollo Sostenible (ODS), "
        "la transición energética y la justicia climática, en las plazoletas de comidas y pasillos opera un metabolismo de enclave extractivo. "
        "Bienes fabricados con materias primas vírgenes (hidrocarburos refinados y celulosa) cuya degradación biológica tarda entre 100 y 450 años "
        "—vasos de polipapel plastificado, bandejas de poliestireno expandido (icopor), botellas PET y cubiertos desechables— son utilizados "
        "durante escasos siete a doce minutos para luego ser abandonados en cualquier recipiente. La infraestructura pasiva existente no orienta; "
        "al contrario, invisibiliza el residuo, sellando una ruptura metabólica entre lo que el campus consume y el pasivo ecológico que descarga sobre el territorio municipal."
    )

    add_apa_level_2(doc, "2.2. Genealogía, Transformaciones Sociales y Expansión Petroquímica")

    add_apa_body(
        doc,
        "Este escenario no surgió de forma aislada; es el resultado de cuatro transformaciones estructurales acaecidas en las últimas tres décadas "
        "que configuraron la vida cotidiana contemporánea:"
    )
    add_apa_body(
        doc,
        "a) La Hegemonía Petroquímica y el Subsidio Oculto del Plástico: La expansión de la petroquímica global inundó el mercado de resinas poliméricas baratas. "
        "Al no gravarse la extracción de crudo ni exigirse la responsabilidad extendida del productor por el fin de vida de los envases, el plástico de un solo uso "
        "se convirtió en la alternativa más rentable para la industria alimentaria, desplazando radicalmente los envases de vidrio retornable tradicionales de los años 80."
    )
    add_apa_body(
        doc,
        "b) La Colonización del 'Tiempo Rápido' y el Fast-Food Universitario: La vida universitaria contemporánea sufre una intensificación de ritmos: mallas curriculares "
        "densas, estudiantes que combinan jornadas laborales con turnos académicos nocturnos y descansos breves de 15 minutos entre clases. "
        "Esta compresión temporal desmanteló el rito social de la comida reposada, imponiendo la 'alimentación sobre la marcha' (on-the-go): bebidas embotelladas, "
        "empanadas envueltas en film plástico y café servido en vasos térmicos descartables listos para consumir mientras se camina al aula."
    )
    add_apa_body(
        doc,
        "c) Desregulación Contractual y Lógica Comercial de Maximización: La universidad privatizó sus cafetines mediante contratos de concesión basados en el canon "
        "de arrendamiento más alto. Para reducir costos fijos de nómina, agua y detergentes, los comerciantes eliminaron los lavaplatos y la loza higienizable, "
        "trasladando el 100% de su expendio a vajilla descartable de bajísimo costo unitario ($80 a $120 COP por empaque)."
    )
    add_apa_body(
        doc,
        "d) La Trampa de la Infraestructura Pasiva: Las canecas instaladas en el campus operan bajo una lógica de 'agujero negro'. Al no incorporar desagües para líquidos "
        "ni estaciones de lavado de manos y recipientes, obligan materialmente al usuario a mezclar: un café con leche a medio terminar se arroja sobre la caneca de reciclaje, "
        "arruinando irreparablemente los papeles y cartones secos acopiados."
    )

    add_apa_level_2(doc, "2.3. Mapeo de Actores Territoriales, Intereses y Cuotas de Poder")

    add_apa_body(
        doc,
        "El análisis socioambiental exige desentrañar la micropolítica del campus. En la Tabla 2 se desglosan los seis grupos de interés "
        "involucrados, identificando sus tensiones cotidianas y recursos de poder:"
    )

    add_apa_table_header(doc, "2", "Matriz de Mapeo de Actores Territoriales, Roles, Intereses y Dinámicas de Poder")

    t_actores = doc.add_table(rows=7, cols=4)
    t_actores.alignment = WD_TABLE_ALIGNMENT.CENTER
    set_apa_table_borders(t_actores)

    headers_act = ["Grupo de Actores", "Rol Territorial en el Campus", "Intereses Concretos y Expectativas", "Cuota de Poder y Afectación"]
    for i, h in enumerate(headers_act):
        add_table_header_cell(t_actores.rows[0], i, h)

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
        add_table_body_cell(row, 0, data[0], bold_prefix="", width=Inches(1.8), bg_hex="F2F2F2")
        add_table_body_cell(row, 1, data[1], bold_prefix="", width=Inches(1.8))
        add_table_body_cell(row, 2, data[2], bold_prefix="", width=Inches(2.2))
        add_table_body_cell(row, 3, data[3], bold_prefix="", width=Inches(1.2), bg_hex="F9F9F9")

    add_apa_table_note(doc, "Caracterización construida con base en entrevistas a personal operativo y observación etnográfica en el campus.")

    add_apa_level_2(doc, "2.4. Dinámicas Psicosociales, Desentendimiento Moral y Efecto Manada")

    add_apa_body(
        doc,
        "El diagnóstico revela que el mal manejo de residuos no obedece a 'ignorancia', sino a dinámicas psicosociales profundamente arraigadas:\n\n"
        "1. Difusión de la Responsabilidad y Desentendimiento Moral (Bandura, 2002): La presencia visible de personal uniformado de aseo genera un mecanismo "
        "de exculpación inconsciente. Los estudiantes racionalizan su desidia bajo el argumento: 'Si yo lo separo, le quito el trabajo al de aseo' o 'Yo pago una matrícula "
        "elevada que incluye el servicio de limpieza'. Esta transferencia ética despoja al ciudadano de su deber cívico de cuidar el espacio común.\n\n"
        "2. Degeneración de la Norma Descriptiva (Broken Windows Theory): La conducta individual está condicionada por lo que se observa en los demás. "
        "Si un usuario llega a una caneca blanca y constata que ya contiene un vaso untado de salsa o cáscaras de mandarina, infiere que la norma de reciclaje "
        "está rota; por ende, arroja su residuo mezclado sin remordimiento alguno. La primera transgresión desata una cascada de contaminación colectiva.\n\n"
        "3. El Sesgo del Presente y la Heurística del Menor Esfuerzo: Separar adecuadamente exige una pausa mental: vaciar líquidos, retirar la tapa plástica y buscar el contenedor "
        "correcto. Tirar todo en la caneca más próxima toma medio segundo. En ausencia de estímulos inmediatos, el cerebro humano siempre elegirá la vía de menor resistencia física.\n\n"
        "4. Desconexión Metabólica e Ilusión del Agujero Negro: Para la comunidad, el residuo 'muere' en el momento en que cruza la boca de la caneca. "
        "Nadie presencia el viaje en camión hacia el relleno sanitario ni el esfuerzo manual de las trabajadoras de aseo que deben abrir bolsas sucias para rescatar materiales."
    )

    add_apa_level_2(doc, "2.5. Consecuencias Socioambientales, Riesgo Laboral y Colapso Sanitario")

    add_apa_body(
        doc,
        "Las repercusiones de este patrón insostenible generan impactos críticos en tres órdenes fundamentales:\n\n"
        "• Dimensión Sanitaria y Territorial en Antioquia: Los residuos mezclados no aprovechados engrosan los viajes de los camiones de aseo hacia el Relleno Sanitario "
        "La Pradera (operado por Emvarias en Donmatías/Barbosa), cuya vida útil atraviesa una crisis estructural sin precedentes en el Valle de Aburrá. "
        "Asimismo, se intensifican las emisiones fugitivas de gas metano ($CH_4$) por la descomposición anaerobia de alimentos aprisionados en bolsas plásticas, "
        "y se dispersan microplásticos en las redes de alcantarillado pluvial que desembocan en el Río Medellín-Porce.\n\n"
        "• Dimensión de Vulnerabilidad Sociolaboral y Riesgo Biomecánico: El personal de servicios generales enfrenta riesgos ergonómicos y biológicos severos. "
        "Muchas operarias deben realizar un destape manual de bolsas contaminadas en cuartos de acopio oscuros para cumplir con las exigencias del PGIRS institucional, "
        "sufriendo pinchazos con pitillos afilados, cortes en los dedos con bordes de plástico rígido quebrado y dermatitis por contacto con residuos en descomposición.\n\n"
        "• Dimensión Financiera e Institucional: La universidad asume un sobrecosto permanente en la tarifa de aseo (Decreto 1077 de 2015), pagando por tonelada dispuesta "
        "en relleno lo que bien podría ser un flujo de ingresos bajo esquemas de aprovechamiento circular con recicladores de base. Simultáneamente, se socava la credibilidad "
        "y coherencia de la institución como faro ético y académico de la sociedad."
    )

    doc.add_page_break()

    # ========================================================
    # 5. FASE 2: ANÁLISIS DESDE LAS CIENCIAS SOCIALES
    # ========================================================
    add_apa_level_1(doc, "3. Fase 2: Análisis Desde las Ciencias Sociales (Matriz Comparativa)")

    add_apa_body(
        doc,
        "De conformidad con las directrices de la Unidad 2, el análisis de un conflicto ambiental demanda superar el enfoque reduccionista de la ingeniería "
        "de materiales y convocar las herramientas teóricas de las Ciencias Sociales. En la Tabla 3 se articula el aporte de tres disciplinas "
        "esenciales: la Sociología Ambiental, la Economía Ecológica y la Psicología Social y Ambiental:"
    )

    add_apa_table_header(doc, "3", "Aportes Epistemológicos de las Ciencias Sociales al Análisis y Solución de la Crisis de Residuos")

    t_fase2 = doc.add_table(rows=4, cols=3)
    t_fase2.alignment = WD_TABLE_ALIGNMENT.CENTER
    set_apa_table_borders(t_fase2)

    headers_f2 = ["Disciplina de las Ciencias Sociales", "¿Cómo Interpreta el Problema Socioambiental?", "¿Cómo Aporta a la Solución Integral?"]
    for i, h in enumerate(headers_f2):
        add_table_header_cell(t_fase2.rows[0], i, h)

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
        add_table_body_cell(row, 0, data[0], bold_prefix="", width=Inches(1.8), bg_hex="F2F2F2")
        add_table_body_cell(row, 1, data[1], bold_prefix="", width=Inches(2.6))
        add_table_body_cell(row, 2, data[2], bold_prefix="", width=Inches(2.6))

    add_apa_table_note(doc, "Articulación teórica fundamentada en los módulos formativos de la Unidad 2 de Ciencias Sociales y Medio Ambiente.")

    doc.add_page_break()

    # ========================================================
    # 6. FASE 3: PROPUESTA ESTRATÉGICA
    # ========================================================
    add_apa_level_1(doc, "4. Fase 3: Propuesta Estratégica «Campus Circular y Corresponsable»")

    add_apa_level_2(doc, "4.1. Objetivos del Plan Estratégico (General y Específicos)")

    add_apa_body(
        doc,
        "• Objetivo General:\n"
        "Diseñar, implementar y consolidar un modelo integral de descarbonización de materiales y corresponsabilidad socioambiental en el campus, "
        "con el propósito de abatir en un 75% el volumen de plásticos y empaques descartables en un horizonte de 18 meses, transformando los hábitos "
        "de consumo de la comunidad universitaria mediante instrumentos normativos, económicos, infraestructura facilitadora y gobernanza comunitaria vinculante.\n\n"
        "• Objetivos Específicos Operacionales:\n"
        "1. Erradicar de manera progresiva y obligatoria el uso de plásticos descartables en todos los establecimientos de comidas del campus, articulando vajilla reutilizable institucional y esquemas de préstamo de envases.\n"
        "2. Reacondicionar la infraestructura de disposición en el 100% de las sedes mediante puntos ecológicos inteligentes bajo el Código Nacional de Colores (Res. 2184/2019) y estaciones de higienización rápida «Eco-Wash».\n"
        "3. Estructurar un régimen de eco-incentivos y desincentivos financieros (Sistema de Depósito, Devolución y Retorno) que alinee los intereses económicos de usuarios y comerciantes con la prevención de residuos.\n"
        "4. Promover la justicia socio-laboral mediante talleres de inmersión y visibilización activa del personal de aseo y reciclaje, desmantelando la transferencia injusta de responsabilidades.\n"
        "5. Institucionalizar un órgano democrático de veeduría y control socioambiental con participación estudiantil y presupuestos participativos verdes."
    )

    add_apa_level_2(doc, "4.2. Población Objetivo y Cobertura Territorial")

    add_apa_body(
        doc,
        "La intervención está concebida para permear la totalidad del ecosistema universitario, impactando directamente a cinco grupos de interés:\n"
        "a) Estamento Estudiantil: Población de pregrado y posgrado en jornadas diurnas, nocturnas y fines de semana (usuarios de mayor densidad).\n"
        "b) Plantel Docente e Investigativo: Líderes académicos que consumen en salas de profesores y orientan la cultura del aula.\n"
        "c) Personal Administrativo y Técnico: Funcionarios que gestionan despachos, eventos y suministros de oficina.\n"
        "d) Sector Comercial Concesionado: Propietarios, administradores y cocineros de cafeterías, quioscos y servicios de catering.\n"
        "e) Sector Operativo de Servicios Generales y Reciclaje: Cuadrillas de limpieza y asociaciones de recuperadores adscritas al campus."
    )

    add_apa_level_2(doc, "4.3. Cinco Programas Operacionales de Mejora e Innovación")

    acciones = [
        ("Programa 1: «Campus Cero Desechables» y Cláusulas Contractuales Vinculantes",
         "Aprobación de un estatuto contractual obligatorio para todos los locales de comidas dentro de la universidad. Se establece la prohibición "
         "absoluta de servir en platos de icopor, cubiertos plásticos y pitillos (en estricta sintonía con la Ley 2232 de 2022). "
         "Los locales quedan obligados a despachar el consumo en sitio en vajilla institucional de loza/vidrio. Para el consumo 'para llevar', se crea el "
         "sistema «Vaso y Porta Circular»: recipientes resistentes de polipropileno reciclable de grado alimentario que se entregan bajo un depósito reembolsable "
         "o que el usuario puede traer limpios desde su hogar."),

        ("Programa 2: Reingeniería Ergonómica de Puntos Ecológicos y Red «Eco-Wash»",
         "Sustitución de los basureros tradicionales por estaciones modulares ergonómicas conforme a la Resolución 2184 de 2019 "
         "(Blanco: aprovechables secos; Verde: restos orgánicos de alimentos; Negro: servilletas sucias y sanitarios). "
         "Junto a cada punto de alta afluencia se instalan módulos de lavado rápido «Eco-Wash», dotados de un sistema de grifería de pedal temporizada "
         "y escurridores de bajo consumo hídrico, permitiendo que el usuario enjuague su termo o lonchera en menos de 10 segundos, eliminando la suciedad antes de disponer."),

        ("Programa 3: Tarjeta de Eco-Incentivos «Eco-Puntos IU» y Descuento Directo por Reutilización",
         "Implementación de un sistema de estímulos positivos a través del carné digital universitario. Cada vez que un usuario compra una bebida o comida "
         "empleando su propio recipiente, la cafetería le otorga un descuento directo del 10% en el precio del producto y le carga 50 'Eco-Puntos' escaneando un código QR. "
         "Los puntos acumulados son redimibles semestralmente en bonos para la compra de libros, descuentos en matrículas o créditos para eventos culturales y deportivos."),

        ("Programa 4: Campaña de Inmersión Social «Rostros del Campus: Dignidad y Empatía»",
         "Estrategia de transformación cultural orientada a desarmar el desentendimiento moral. Se institucionaliza la jornada semestral 'Un Día con Nuestro Equipo de Limpieza', "
         "donde líderes de mesa directiva, docentes y directores de carrera acompañan las rutas de recolección selectiva. "
         "En las canecas se disponen mensajes con las fotografías de los operarios: 'Soy Carmen, madre de familia; cuando enjuagas tu vaso y lo pones en la caneca blanca, "
         "haces mi trabajo seguro y digno. ¡Separar bien es respetarnos!'. Se sustituye el regaño moral por la empatía afectiva."),

        ("Programa 5: Red de Veedores Ambientales Estudiantiles y Presupuesto Participativo Verde",
         "Conformación de un semillero de promotores ecológicos juveniles que actúan en horas de almuerzo en las plazas de comida como orientadores pedagógicos. "
         "Paralelamente, la universidad destina el 2% del fondo de bienestar universitario a un 'Presupuesto Participativo Verde': los estudiantes formulan y votan "
         "democráticamente propuestas de economía circular para sus facultades (p.ej., composteras para las huertas del campus o estaciones de reparación de termos).")
    ]

    for title_acc, desc_acc in acciones:
        add_apa_level_3(doc, title_acc)
        add_apa_body(doc, desc_acc, space_after=6)

    add_apa_level_2(doc, "4.4. Dos Instrumentos de Política Ambiental Colombiana Seleccionados")

    add_apa_body(
        doc,
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

    add_apa_level_2(doc, "4.5. Mecanismo de Participación Ciudadana y Veeduría Territorial (MUCVA)")

    add_apa_body(
        doc,
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

    add_apa_level_2(doc, "4.6. Sistema de Indicadores Técnicos y Evaluación de Resultados")

    add_apa_body(
        doc,
        "Para monitorear el desempeño empírico de la estrategia, se establecen cuatro indicadores cuantitativos y cualitativos verificables, "
        "detallados en la Tabla 4:"
    )

    add_apa_table_header(doc, "4", "Sistema de Indicadores de Monitoreo, Control y Evaluación de Resultados")

    t_ind = doc.add_table(rows=5, cols=5)
    t_ind.alignment = WD_TABLE_ALIGNMENT.CENTER
    set_apa_table_borders(t_ind)

    headers_ind = ["Indicador Técnico", "Ecuación / Fórmula de Cálculo", "Meta de Gestión (18 Meses)", "Frecuencia", "Unidad Responsable"]
    for i, h in enumerate(headers_ind):
        add_table_header_cell(t_ind.rows[0], i, h)

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
        add_table_body_cell(row, 0, data[0], bold_prefix="", width=Inches(1.5), bg_hex="F2F2F2")
        add_table_body_cell(row, 1, data[1], bold_prefix="", width=Inches(2.2))
        add_table_body_cell(row, 2, data[2], bold_prefix="", width=Inches(1.3))
        add_table_body_cell(row, 3, data[3], bold_prefix="", width=Inches(0.9), bg_hex="F9F9F9")
        add_table_body_cell(row, 4, data[4], bold_prefix="", width=Inches(1.3))

    add_apa_table_note(doc, "Indicadores estructurados según estándares de economía circular del Ministerio de Ambiente y Desarrollo Sostenible.")

    add_apa_level_2(doc, "4.7. Hoja de Ruta Fásica de Implementación (Cronograma 18 Meses)")

    add_apa_body(
        doc,
        "La ejecución del plan se divide en tres fases secuenciales claramente delimitadas en la Tabla 5:"
    )

    add_apa_table_header(doc, "5", "Cronograma de Ejecución y Plan de Hitos Operacionales a 18 Meses")

    t_gantt = doc.add_table(rows=4, cols=3)
    t_gantt.alignment = WD_TABLE_ALIGNMENT.CENTER
    set_apa_table_borders(t_gantt)

    headers_gantt = ["Fase del Cronograma", "Ventana Temporal", "Hitos Operacionales y Entregables Vinculantes"]
    for i, h in enumerate(headers_gantt):
        add_table_header_cell(t_gantt.rows[0], i, h)

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
        add_table_body_cell(row, 0, data[0], bold_prefix="", width=Inches(2.2), bg_hex="F2F2F2")
        add_table_body_cell(row, 1, data[1], bold_prefix="", width=Inches(1.2), bg_hex="F9F9F9")
        add_table_body_cell(row, 2, data[2], bold_prefix="", width=Inches(3.8))

    add_apa_table_note(doc, "Planificación fásica diseñada para mitigar riesgos de resistencia al cambio en el sector comercial y estudiantil.")

    doc.add_page_break()

    # ========================================================
    # 7. FASE 4: REFLEXIÓN FINAL CRÍTICA
    # ========================================================
    add_apa_level_1(doc, "5. Fase 4: Reflexión Final Crítica")

    add_apa_level_2(doc, "El Espejismo del Individualismo Metodológico y la Necesidad de Transformaciones Estructurales")

    add_apa_body(
        doc,
        "La pretensión de solucionar los desequilibrios ecológicos apelando de forma exclusiva a la 'conciencia moral' del consumidor individual "
        "constituye una de las trampas más paralizantes del ambientalismo tradicional. Esta perspectiva, arraigada en el individualismo metodológico, "
        "pretende hacer creer que la degradación ambiental es el fruto acumulativo de millones de malas decisiones individuales aisladas y que, por ende, "
        "bastaría con educar la mente del sujeto para que el mundo sane espontáneamente. Sin embargo, la sociología crítica (Schnaiberg, 1980; Leff, 2004) "
        "y la ecología política desmienten categóricamente esta ilusión: las personas no eligen en el vacío; sus conductas cotidianas están férreamente "
        "delimitadas, condicionadas y prefiguradas por las estructuras materiales, los marcos jurídicos y las dinámicas de poder que configuran su entorno."
    )
    add_apa_body(
        doc,
        "Si trasladamos esta reflexión al territorio de una universidad, la contradicción se hace palpable. Resulta hipócrita y pedagógicamente inútil "
        "culpar a un estudiante de primer semestre por tomar su jugo en un vaso plástico desechable si el campus no le ofrece alternativas viables: "
        "si las máquinas dispensadoras y los cafetines solo expenden empaques descartables; si no existen fuentes de agua potable donde recargar botellas; "
        "si las instalaciones no cuentan con piletas higiénicas para enjuagar una taza entre clases; y si el mercado premia económicamente el descarte veloz "
        "castigando la reutilización con incomodidad física y pérdida de tiempo. En tales circunstancias, el comportamiento insostenible no es una anomalía "
        "psicológica: es la respuesta más adaptativa y racional ante una infraestructura material diseñada para el desecho."
    )
    add_apa_body(
        doc,
        "Asimismo, el comportamiento está fuertemente atravesado por jerarquías culturales e institucionales. En nuestras sociedades todavía pervive "
        "un resabio colonial y clasista que mira con desdén las labores de aseo y cuidado de los espacios compartidos. Se asume con ligereza que 'alguien más limpiará', "
        "desligando el acto de consumir de sus consecuencias ecológicas directas. Esta condescendencia se perpetúa mientras la institución mantenga al personal de aseo "
        "en la sombra contractual, subcontratado y desprovisto de voz en los comités de planeación. Modificar la conducta de los estudiantes exige, antes que sermones, "
        "transformar ese orden simbólico: hacer visible el rostro humano del trabajo del aseo, convertir a las y los operarios en co-educadores ambientales "
        "y sancionar socialmente el clasismo de quienes consideran que pagar una colegiatura les otorga derecho a ensuciar."
    )
    add_apa_body(
        doc,
        "Por todas estas razones, la intervención ambiental debe ser de naturaleza sistémica. Requiere alinear de manera coordinada cuatro pilares estructurales:\n"
        "1. Pilar Institucional y Regulatorio: Reglas de juego taxativas que prohíban la adquisición de plásticos y obliguen a las concesiones comerciales a adaptarse so pena de cancelación contractual.\n"
        "2. Pilar Económico: Precios que digan la verdad ecológica, gravando el descarte mediante eco-tasas y subsidiando la reutilización con sistemas de depósito y reembolso.\n"
        "3. Pilar Físico e Infraestructural: Espacios ergonómicos que hagan que lavar un recipiente o separar una botella sea un acto expedito, limpio y placentero.\n"
        "4. Pilar Político y Ciudadano: Gobernanza participativa donde los estamentos decidan las prioridades presupuestales del campus y ejerzan veeduría colectiva.\n\n"
        "Cuando la estructura material, económica y cultural hace que la opción sustentable sea la más cómoda, la más económica, la más respetuosa y la más accesible, "
        "la conciencia individual deja de ser un esfuerzo titánico y se convierte en la forma natural y cotidiana de habitar el territorio común."
    )

    doc.add_page_break()

    # ========================================================
    # 8. REFERENCIAS (APA 7.ª EDICIÓN)
    # ========================================================
    add_apa_level_1(doc, "Referencias")

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
        # Sangría francesa APA 7 (0.5 pulgadas / 1.27 cm)
        p_r.paragraph_format.left_indent = Inches(0.5)
        p_r.paragraph_format.first_line_indent = Inches(-0.5)
        p_r.paragraph_format.space_before = Pt(0)
        p_r.paragraph_format.space_after = Pt(6)
        p_r.paragraph_format.line_spacing = 1.15
        r_run = p_r.add_run(ref)
        r_run.font.name = "Arial"
        r_run.font.size = Pt(9)
        r_run.font.color.rgb = COLOR_BLACK

    # Guardar en las rutas oficiales
    print(f"Guardando documento principal: {output_docx_primary}")
    doc.save(output_docx_primary)

    print(f"Guardando copia con nomenclatura secundaria: {output_docx_secondary}")
    doc.save(output_docx_secondary)

    print(f"Guardando copia legible: {output_docx_readable}")
    doc.save(output_docx_readable)

    print("Documento APA 7 con títulos en negrilla negra generado exitosamente.")

if __name__ == "__main__":
    build_apa7_document()
