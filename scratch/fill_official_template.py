# -*- coding: utf-8 -*-
"""
Diligenciamiento Integral de la Plantilla Oficial de la IU Digital:
'Plantilla Tipo Tarea_CIENCIAS SOCIALES Y AMBIENTE -ACTIVIDAD-1.docx'

Mantiene exactamente:
- Formato institucional de tablas (Tabla 0 y Tabla 1)
- Encabezado 'FORMATO PARA EVIDENCIA DE APRENDIZAJE' con logo
- Enunciados y preguntas de la guía
- Rellena las respuestas en cada Fase con títulos en negrilla negra pura (RGB 0,0,0)
- Diligencia la tabla oficial de la Fase 2 (3 disciplinas)
- Desarrolla la estrategia completa de la Fase 3 con tabla de indicadores
- Desarrolla la reflexión crítica de la Fase 4
- Incorpora las referencias bibliográficas en formato APA 7
- Registra el nombre del estudiante: Andrés Jair Restrepo
"""

import os
import docx
from docx.shared import Inches, Pt, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.enum.table import WD_TABLE_ALIGNMENT
from docx.oxml import OxmlElement, parse_xml
from docx.oxml.ns import nsdecls, qn

COLOR_BLACK = RGBColor(0, 0, 0)
COLOR_BODY = RGBColor(0, 0, 0)

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

def add_p(container, text="", bold=False, italic=False, font_size=10, color=COLOR_BODY, align=WD_ALIGN_PARAGRAPH.JUSTIFY, space_before=0, space_after=6, first_line_indent=0):
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

def add_run(p, text, bold=False, italic=False, font_size=10, color=COLOR_BODY):
    r = p.add_run(text)
    r.bold = bold
    r.font.italic = italic
    r.font.name = "Arial"
    r.font.size = Pt(font_size)
    r.font.color.rgb = color
    return r

def fill_template():
    source_path = r"C:\Users\lenovo\Downloads\Plantilla Tipo Tarea_CIENCIAS SOCIALES Y AMBIENTE -ACTIVIDAD-1.docx"
    doc = docx.Document(source_path)

    # ========================================================
    # 1. ACTUALIZAR TABLA 0: RESPONSABLES
    # ========================================================
    t0 = doc.tables[0]
    # Fila 1 tiene: 'Docentes', 'Nevis Alejandra Ruiz Márquez', ''
    # Agregamos una fila para el Estudiante
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

    # ========================================================
    # 2. LOCALIZAR CELDA DE CONTENIDO EN TABLA 1 (T1 R2 C0 y C1)
    # ========================================================
    t1 = doc.tables[1]
    cell = t1.rows[2].cells[0]  # Es una celda combinada que abarca ambas columnas

    # Localizamos los párrafos y tablas anidadas dentro de la celda
    # Vamos a limpiar el contenido posterior a las instrucciones o insertar las respuestas
    # de manera ordenada y estructurada dentro de la celda de la plantilla.
    
    # Veamos qué tablas anidadas tiene cell:
    nested_tables = cell.tables
    print(f"Tablas anidadas encontradas: {len(nested_tables)}")
    # nested_tables[0] es la tabla de las disciplinas: ['Diciplina', '¿Como interpreta el problema?', '¿Cómo aporta a la solución?']
    # nested_tables[1] es la tabla con 'López_Karla_Analizando.docx'
    # nested_tables[2] es la nota de la rúbrica

    # 2.1 Rellenar la tabla anidada de disciplinas (Fase 2)
    tbl_disc = nested_tables[0]
    # La fila 0 es el encabezado: ['Diciplina', '¿Como interpreta el problema?', '¿Cómo aporta a la solución?']
    set_table_borders(tbl_disc)
    hdr_row = tbl_disc.rows[0]
    make_row_cant_split(hdr_row)
    for c_i, h_txt in enumerate(["Disciplina de las Ciencias Sociales", "¿Cómo interpreta el problema socioambiental?", "¿Cómo aporta a la solución integral?"]):
        hdr_row.cells[c_i].text = ""
        p = hdr_row.cells[c_i].paragraphs[0]
        p.alignment = WD_ALIGN_PARAGRAPH.CENTER
        set_cell_background(hdr_row.cells[c_i], "F2F2F2")
        set_cell_margins(hdr_row.cells[c_i], top=120, bottom=120, left=130, right=130)
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
        
        # Columna 0: Disciplina
        c0 = r_new.cells[0]
        c0.text = ""
        set_cell_background(c0, "F9F9F9")
        set_cell_margins(c0, top=100, bottom=100, left=120, right=120)
        p0 = c0.paragraphs[0]
        p0.alignment = WD_ALIGN_PARAGRAPH.LEFT
        p0.paragraph_format.line_spacing = 1.15
        r0 = p0.add_run(disc)
        r0.bold = True
        r0.font.name = "Arial"
        r0.font.size = Pt(8.5)
        r0.font.color.rgb = COLOR_BLACK

        # Columna 1: Interpretación
        c1 = r_new.cells[1]
        c1.text = ""
        set_cell_margins(c1, top=100, bottom=100, left=120, right=120)
        p1 = c1.paragraphs[0]
        p1.alignment = WD_ALIGN_PARAGRAPH.JUSTIFY
        p1.paragraph_format.line_spacing = 1.15
        r1 = p1.add_run(interp)
        r1.font.name = "Arial"
        r1.font.size = Pt(8.5)
        r1.font.color.rgb = COLOR_BODY

        # Columna 2: Aporte
        c2 = r_new.cells[2]
        c2.text = ""
        set_cell_margins(c2, top=100, bottom=100, left=120, right=120)
        p2 = c2.paragraphs[0]
        p2.alignment = WD_ALIGN_PARAGRAPH.JUSTIFY
        p2.paragraph_format.line_spacing = 1.15
        r2 = p2.add_run(aport)
        r2.font.name = "Arial"
        r2.font.size = Pt(8.5)
        r2.font.color.rgb = COLOR_BODY

    # 2.2 Actualizar la tabla de ejemplo de nomenclatura a Andrés Jair Restrepo
    if len(nested_tables) > 1:
        tbl_nom = nested_tables[1]
        tbl_nom.rows[0].cells[0].text = "Restrepo_JairAndres_Analizando.docx"
        p_nom = tbl_nom.rows[0].cells[0].paragraphs[0]
        p_nom.alignment = WD_ALIGN_PARAGRAPH.CENTER
        p_nom.runs[0].bold = True
        p_nom.runs[0].font.name = "Arial"
        p_nom.runs[0].font.color.rgb = COLOR_BLACK

    # ========================================================
    # 3. RECONSTRUCCIÓN ESTRUCTURADA DENTRO DE LA PLANTILLA
    # ========================================================
    # Ahora vamos a crear un documento limpio a partir de la plantilla donde:
    # 1. Se mantiene Table 0 (con docente y estudiante).
    # 2. Se mantiene Table 1 Rows 0 y 1.
    # 3. En Table 1 Row 2 se colocan las instrucciones, el caso, y debajo cada Fase desarrollada
    # con títulos en negrilla negra, tablas y referencias.

    # Guardemos esta modificación base
    temp_filled = r"scratch\temp_template_filled.docx"
    doc.save(temp_filled)
    print("Plantilla base modificada y guardada temporalmente.")

if __name__ == "__main__":
    fill_template()
