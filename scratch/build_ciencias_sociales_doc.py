# -*- coding: utf-8 -*-
"""
Generador de Documento Oficial Académico - IU Digital de Antioquia
Asignatura: Ciencias Sociales y Medio Ambiente - Unidad 2
Actividad Final: Diseño de una estrategia de intervención socioambiental para promover cambios en el consumo y la participación ciudadana
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

def add_header_cell(row, col_idx, text, width=None, bg_hex="102C57", fg_rgb=RGBColor(255, 255, 255)):
    cell = row.cells[col_idx]
    if width:
        cell.width = width
    set_cell_background(cell, bg_hex)
    set_cell_margins(cell, top=140, bottom=140, left=160, right=160)
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

def build_document():
    base_template = r"C:\Users\lenovo\Desktop\trabajos andres\PLAN DE MANEJO DE IMPACTOS AMBIENTALES_backup.docx"
    output_dir = r"C:\Users\lenovo\Desktop\trabajos andres"
    
    output_docx_primary = os.path.join(output_dir, "Restrepo_JairAndres_Analizando.docx")
    output_docx_secondary = os.path.join(output_dir, "Restrepo_AndresJair_Analizando.docx")
    output_docx_readable = os.path.join(output_dir, "ACTIVIDAD 1 - CIENCIAS SOCIALES Y AMBIENTE - ESTRATEGIA SOCIOAMBIENTAL.docx")

    print("Cargando plantilla base institucional para preservar encabezado oficial...")
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

    # Paleta de colores
    COLOR_PRIMARY = RGBColor(16, 44, 87)       # Azul oscuro corporativo IU Digital
    COLOR_SECONDARY = RGBColor(176, 21, 57)    # Vino tinto / carmesí institucional
    COLOR_BODY = RGBColor(33, 33, 33)          # Gris carbón para texto base
    HEX_PRIMARY = "102C57"
    HEX_SECONDARY = "B01539"
    HEX_LIGHT_BG = "F4F7FA"
    HEX_ACCENT_BG = "EAEFF5"

    # ========================================================
    # 1. PORTADA ACADÉMICA OFICIAL
    # ========================================================
    for _ in range(2):
        doc.add_paragraph()

    p_title = doc.add_paragraph()
    p_title.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p_title.paragraph_format.space_after = Pt(6)
    r_title = p_title.add_run("ESTRATEGIA DE INTERVENCIÓN SOCIOAMBIENTAL:\nTRANSICIÓN HACIA LA ECONOMÍA CIRCULAR, REDUCCIÓN DE PLÁSTICOS DE UN SOLO USO Y CORRESPONSABILIDAD UNIVERSITARIA")
    r_title.bold = True
    r_title.font.name = "Arial"
    r_title.font.size = Pt(17)
    r_title.font.color.rgb = COLOR_PRIMARY

    p_sub = doc.add_paragraph()
    p_sub.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p_sub.paragraph_format.space_after = Pt(24)
    r_sub = p_sub.add_run("Unidad 2: Ciencias Sociales y Medio Ambiente – Evidencia de Aprendizaje 1 (EA1)\nAnálisis de Conflictos Socioambientales y Formulación de Estrategias Territoriales")
    r_sub.font.name = "Arial"
    r_sub.font.size = Pt(11)
    r_sub.font.italic = True
    r_sub.font.color.rgb = RGBColor(100, 100, 100)

    for _ in range(3):
        doc.add_paragraph()

    p_pres = doc.add_paragraph()
    p_pres.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p_pres.paragraph_format.space_after = Pt(4)
    r_pres = p_pres.add_run("ELABORADO POR:")
    r_pres.bold = True
    r_pres.font.name = "Arial"
    r_pres.font.size = Pt(10.5)
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
    p_role.paragraph_format.space_after = Pt(24)
    r_role = p_role.add_run("Rol Asumido: Profesional en Ciencias Ambientales – Consultor en Gestión y Política Socioambiental")
    r_role.font.name = "Arial"
    r_role.font.size = Pt(10)
    r_role.font.italic = True
    r_role.font.color.rgb = RGBColor(80, 80, 80)

    for _ in range(3):
        doc.add_paragraph()

    p_course = doc.add_paragraph()
    p_course.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p_course.paragraph_format.space_after = Pt(2)
    r_c1 = p_course.add_run("ASIGNATURA: CIENCIAS SOCIALES Y MEDIO AMBIENTE\nUNIDAD 2: CIENCIAS SOCIALES Y MEDIO AMBIENTE\n\n")
    r_c1.bold = True
    r_c1.font.name = "Arial"
    r_c1.font.size = Pt(10.5)
    r_c1.font.color.rgb = COLOR_PRIMARY

    r_doc = p_course.add_run("DOCENTE:\nNEVIS ALEJANDRA RUIZ MÁRQUEZ\n\n")
    r_doc.font.name = "Arial"
    r_doc.font.size = Pt(10.5)

    r_inst = p_course.add_run("INSTITUCIÓN UNIVERSITARIA DIGITAL DE ANTIOQUIA – IU DIGITAL\nFACULTAD DE CIENCIAS AMBIENTALES Y SOSTENIBILIDAD\nSEPTIEMBRE DE 2026")
    r_inst.bold = True
    r_inst.font.name = "Arial"
    r_inst.font.size = Pt(10.5)
    r_inst.font.color.rgb = COLOR_PRIMARY

    doc.add_page_break()

    # ========================================================
    # 2. CUADRO METADATOS INSTITUCIONAL Y RESUMEN EJECUTIVO
    # ========================================================
    p_h1 = doc.add_paragraph()
    r = p_h1.add_run("FICHA METODOLÓGICA Y CONTEXTO DEL ENCARGO PROFESIONAL")
    r.bold = True
    r.font.name = "Arial"
    r.font.size = Pt(13)
    r.font.color.rgb = COLOR_PRIMARY

    # Tabla institucional de encargo
    t_meta = doc.add_table(rows=6, cols=2)
    t_meta.alignment = WD_TABLE_ALIGNMENT.CENTER
    set_table_borders(t_meta)
    
    meta_data = [
        ("Institución Educativa:", "Institución Universitaria Digital de Antioquia – IU Digital"),
        ("Programa Académico y Asignatura:", "Ciencias Ambientales / Cátedra de Ciencias Sociales y Medio Ambiente (Unidad 2)"),
        ("Docente Asesora:", "Nevis Alejandra Ruiz Márquez"),
        ("Estudiante Investigador:", "Andrés Jair Restrepo (Nomenclatura: Restrepo_JairAndres_Analizando.docx)"),
        ("Caso de Estudio Seleccionado:", "Crisis socioambiental por proliferación de residuos de envases y productos de un solo uso en campus de educación superior."),
        ("Propósito de la Intervención:", "Diseñar una estrategia socioambiental integral que supere el enfoque meramente técnico, articulando las ciencias sociales, la educación ambiental transformadora, la economía ecológica y la participación ciudadana vinculante.")
    ]

    for idx, (label, val) in enumerate(meta_data):
        row = t_meta.rows[idx]
        make_row_cant_split(row)
        add_body_cell(row, 0, label, bold_prefix="", width=Inches(2.5), bg_hex=HEX_ACCENT_BG)
        add_body_cell(row, 1, val, bold_prefix="", width=Inches(4.5), bg_hex="FFFFFF")

    doc.add_paragraph().paragraph_format.space_after = Pt(6)

    # Introducción / Justificación
    p_intro_title = doc.add_paragraph()
    r = p_intro_title.add_run("INTRODUCCIÓN Y DIAGNÓSTICO PRELIMINAR")
    r.bold = True
    r.font.name = "Arial"
    r.font.size = Pt(11.5)
    r.font.color.rgb = COLOR_PRIMARY

    intro_p1 = (
        "El presente informe técnico-académico ha sido formulado asumiendo el rol de un profesional en Ciencias Ambientales, "
        "integrante de un equipo asesor interdisciplinar encomendado por la dirección de una institución de educación superior para diagnosticar "
        "y resolver de manera estructural la problemática socioambiental asociada al incremento exponencial en la generación y descarte de residuos "
        "de envases y productos de un solo uso en sus instalaciones. La situación observada revela una falla multicausal profunda: a pesar de contar "
        "con infraestructura física básica de separación (puntos ecológicos), gran cantidad de residuos potencialmente aprovechables termina "
        "irreversiblemente contaminada con residuos ordinarios; los usuarios recurren masivamente a productos desechables; existe un desentendimiento "
        "moral generalizado que traslada indebidamente la responsabilidad del aseo al personal de servicios generales; los concesionarios comerciales "
        "operan bajo una lógica extractiva de empaque descartable; y las campañas previas han fracasado al limitarse a discursos informativos "
        "breves desprovistos de arraigo cultural y sin incentivos estructurales."
    )
    p = doc.add_paragraph()
    p.alignment = WD_ALIGN_PARAGRAPH.JUSTIFY
    p.paragraph_format.space_after = Pt(8)
    p.paragraph_format.line_spacing = 1.15
    r = p.add_run(intro_p1)
    r.font.name = "Arial"
    r.font.size = Pt(10)

    intro_p2 = (
        "Para dar respuesta a este desafío, este documento supera el reduccionismo técnico y aborda la problemática desde una perspectiva "
        "sociotécnica y territorial, integrando el análisis social, los aportes disciplinarios de la Unidad 2 (Sociología Ambiental, Economía Ecológica "
        "y Psicología Social/Ambiental), el diseño de una estrategia integral y participativa ('Campus Circular y Corresponsable'), y una reflexión "
        "crítica sobre la indisociable interdependencia entre el comportamiento de los individuos y las condiciones socioeconómicas e institucionales que lo moldean."
    )
    p = doc.add_paragraph()
    p.alignment = WD_ALIGN_PARAGRAPH.JUSTIFY
    p.paragraph_format.space_after = Pt(12)
    p.paragraph_format.line_spacing = 1.15
    r = p.add_run(intro_p2)
    r.font.name = "Arial"
    r.font.size = Pt(10)

    doc.add_page_break()

    # ========================================================
    # 3. FASE 1: ANÁLISIS SOCIOAMBIENTAL
    # ========================================================
    p_sec1 = doc.add_paragraph()
    r = p_sec1.add_run("FASE 1: ANÁLISIS SOCIOAMBIENTAL DEL CASO DE ESTUDIO")
    r.bold = True
    r.font.name = "Arial"
    r.font.size = Pt(14)
    r.font.color.rgb = COLOR_PRIMARY

    # 1.1 ¿Cuál es el problema socioambiental?
    p_q1 = doc.add_paragraph()
    r = p_q1.add_run("1.1. Delimitación y Naturaleza del Problema Socioambiental")
    r.bold = True
    r.font.name = "Arial"
    r.font.size = Pt(11.5)
    r.font.color.rgb = COLOR_SECONDARY

    q1_text = (
        "El problema socioambiental analizado trasciende con creces la mera acumulación física de basura en canecas: constituye un "
        "conflicto socioecológico estructural y una fractura de la corresponsabilidad comunitaria, caracterizado por el consumo hegemónico "
        "y descarte masivo de plásticos y empaques de un solo uso dentro de la institución universitaria, articulado a la ineficacia del sistema de separación en la fuente, "
        "la normalización de una cultura de consumo lineal ('extraer, fabricar, usar y tirar') y la externalización asimétrica de los costos ambientales "
        "y laborales hacia el eslabón más vulnerable de la jerarquía universitaria: el personal de servicios generales y los recuperadores ambientales.\n\n"
        "No se trata simplemente de un déficit de infraestructura física, sino de una desconexión metabólica y social: la comunidad universitaria "
        "(estudiantes, docentes, trabajadores y comerciantes) consume bajo una lógica de inmediatez y comodidad que invisibiliza el ciclo de vida de los materiales, "
        "transformando bienes de vida útil de escasos minutos (vasos, cubiertos, envolturas, botellas PET) en pasivos ambientales persistentes por siglos. "
        "Esta dinámica evidencia una marcada brecha entre el discurso académico de sostenibilidad y la praxis cotidiana intra-campus."
    )
    p = doc.add_paragraph()
    p.alignment = WD_ALIGN_PARAGRAPH.JUSTIFY
    p.paragraph_format.space_after = Pt(8)
    p.paragraph_format.line_spacing = 1.15
    r = p.add_run(q1_text)
    r.font.name = "Arial"
    r.font.size = Pt(10)

    # 1.2 ¿Cuáles son sus causas?
    p_q2 = doc.add_paragraph()
    r = p_q2.add_run("1.2. Genealogía, Transformaciones Sociales y Causas Estructurales")
    r.bold = True
    r.font.name = "Arial"
    r.font.size = Pt(11.5)
    r.font.color.rgb = COLOR_SECONDARY

    q2_text = (
        "El origen de este conflicto no es fortuito ni exclusivo del campus; responde a transformaciones macro-sociales, tecnológicas e institucionales "
        "que han colonizado los espacios cotidianos en las últimas décadas:\n\n"
        "a) Transformaciones Tecnológicas y Expansión Petroquímica: La masificación del plástico sintético y los polímeros termoplásticos de un solo uso "
        "abarató artificialmente el empaque de alimentos y bebidas. Al no internalizarse en su precio de venta el pasivo ambiental de su extracción fósil y disposición final, "
        "la industria sustituyó los sistemas tradicionales de envases de vidrio retornable por empaques plásticos descartables y multicapa.\n\n"
        "b) Aceleración Social y Cultura de la Conveniencia ('Convenience Lifestyle'): El ritmo académico y laboral contemporáneo privilegia la rapidez, "
        "el consumo 'al paso' (on-the-go) y la portabilidad inmediata de alimentos. Lavar una taza o portar un recipiente reutilizable se percibe como una carga de tiempo, "
        "mientras que el descarte se normaliza como símbolo de eficiencia y modernidad.\n\n"
        "c) Modelo Comercial Lineal y Contratación Desarticulada: Los establecimientos de alimentos y cafeterías dentro de la universidad operan con contratos "
        "que no contemplan cláusulas de responsabilidad extendida ni compras públicas sostenibles, prefiriendo la vajilla plástica desechable para recortar "
        "costos de lavado, agua y mano de obra.\n\n"
        "d) Falla en la Arquitectura de Decisiones Institucionales: La infraestructura de separación existente opera de forma pasiva; los puntos ecológicos "
        "no cuentan con estaciones de desagüe o enjuague rápido para que los envases no contaminen los residuos secos, y carecen de estímulos que premien el comportamiento virtuoso.\n\n"
        "e) Enfoque Educativo Tradicional Inoperante: Las campañas previas han sido meramente transmisionistas de información estática y de corta duración, "
        "asumiendo ingenuamente que el conocimiento abstracto del problema genera mecánicamente un cambio automático de hábitos (falacia del déficit cognitivo)."
    )
    p = doc.add_paragraph()
    p.alignment = WD_ALIGN_PARAGRAPH.JUSTIFY
    p.paragraph_format.space_after = Pt(8)
    p.paragraph_format.line_spacing = 1.15
    r = p.add_run(q2_text)
    r.font.name = "Arial"
    r.font.size = Pt(10)

    # 1.3 ¿Quiénes están involucrados? (Matriz de actores e intereses)
    p_q3 = doc.add_paragraph()
    r = p_q3.add_run("1.3. Mapeo Integral de Actores Sociales, Roles e Intereses en Conflicto")
    r.bold = True
    r.font.name = "Arial"
    r.font.size = Pt(11.5)
    r.font.color.rgb = COLOR_SECONDARY

    q3_intro = (
        "El abordaje socioambiental exige mapear a todos los grupos de interés que interactúan en el territorio del campus, "
        "identificando sus expectativas, tensiones y recursos de poder para construir acuerdos duraderos:"
    )
    p = doc.add_paragraph()
    p.alignment = WD_ALIGN_PARAGRAPH.JUSTIFY
    p.paragraph_format.space_after = Pt(6)
    r = p.add_run(q3_intro)
    r.font.name = "Arial"
    r.font.size = Pt(10)

    # Tabla de actores
    t_actores = doc.add_table(rows=7, cols=4)
    t_actores.alignment = WD_TABLE_ALIGNMENT.CENTER
    set_table_borders(t_actores)

    headers_act = ["Grupo de Actores", "Rol en el Territorio / Campus", "Intereses y Expectativas Principales", "Nivel de Afectación / Poder"]
    for i, h in enumerate(headers_act):
        add_header_cell(t_actores.rows[0], i, h, bg_hex=HEX_PRIMARY)

    actores_data = [
        ("Estudiantes (Pregrado / Posgrado)", "Usuarios mayoritarios y principales generadores de residuos de empaque diario.", "Comodidad, rapidez, bajo costo en cafeterías, tiempo libre escaso. Conciencia ambiental teórica pero disociada de su práctica cotidiana.", "Alta afectación / Alto poder colectivo (actores clave)."),
        ("Docentes e Investigadores", "Líderes de aula, formadores de opinión y consumidores en salas de profesores.", "Eficiencia académica, calidad de vida en el campus. Algunos comprometidos con proyectos verdes; otros replican la inercia del descarte.", "Media afectación / Alto poder pedagógico y simbólico."),
        ("Personal Administrativo y Directivo", "Gestión operativa, contratación de proveedores y regulación institucional del campus.", "Cumplimiento normativo, imagen y acreditación universitaria, control presupuestal y reducción de costos de aseo y recolección.", "Alta afectación reputacional / Muy alto poder de decisión."),
        ("Concesiones Comerciales y Cafeterías", "Proveedores de alimentos, bebidas y productos empaquetados en el campus.", "Rentabilidad económica, velocidad de servicio en horas pico, minimización de costos operativos de lavado y vajilla higienizable.", "Media afectación / Alto poder en la oferta de mercado."),
        ("Personal de Servicios Generales", "Operarios de limpieza, vaciado de canecas, acopio y clasificación forzosa.", "Condiciones dignas de trabajo, seguridad y salud ocupacional, reconocimiento social de su labor y reducción de sobrecargas injustas.", "Máxima afectación directa / Bajo poder formal (vulnerabilidad sociolaboral)."),
        ("Recicladores de Oficio y Gestores RCD", "Organizaciones de reciclaje de base que recolectan el material aprovechable.", "Acceso a material limpio, seco y no contaminado con restos orgánicos para garantizar su ingreso económico familiar y dignificar su oficio.", "Alta afectación económica / Medio poder de articulación externa.")
    ]

    for r_idx, data in enumerate(actores_data, start=1):
        row = t_actores.rows[r_idx]
        make_row_cant_split(row)
        add_body_cell(row, 0, data[0], bold_prefix="", width=Inches(1.8), bg_hex=HEX_ACCENT_BG)
        add_body_cell(row, 1, data[1], bold_prefix="", width=Inches(1.8))
        add_body_cell(row, 2, data[2], bold_prefix="", width=Inches(2.2))
        add_body_cell(row, 3, data[3], bold_prefix="", width=Inches(1.2), bg_hex=HEX_LIGHT_BG)

    doc.add_paragraph().paragraph_format.space_after = Pt(8)

    # 1.4 ¿Qué comportamientos sociales contribuyen al problema?
    p_q4 = doc.add_paragraph()
    r = p_q4.add_run("1.4. Comportamientos Sociales y Dinámicas Psicosociales que Reproducen el Conflicto")
    r.bold = True
    r.font.name = "Arial"
    r.font.size = Pt(11.5)
    r.font.color.rgb = COLOR_SECONDARY

    q4_text = (
        "El diagnóstico evidencia patrones de conducta fuertemente arraigados que perpetúan el problema:\n\n"
        "1. Desentendimiento Moral y Transferencia de Responsabilidad: La creencia manifiesta de que 'la basura es asunto exclusivo de los señores y señoras de aseo' "
        "revela una distorsión ética de clase y una jerarquización del trabajo manual. Los usuarios delegan la carga de sus propias elecciones de consumo en quienes "
        "consideran contratados para 'limpiar lo que yo tire', eximiéndose de todo deber cívico.\n\n"
        "2. Efecto de Contagio Social y la Teoría de las Ventanas Rotas: Cuando un estudiante se acerca a un punto ecológico y observa que la caneca blanca (reciclables) "
        "ya contiene vasos de café untados de leche o restos de comida, experimenta una anulación del incentivo moral: 'si ya está contaminada, no sirve de nada que yo separe bien'. "
        "La transgresión previa legitima la conducta irresponsable colectiva.\n\n"
        "3. Sesgo del Presente y Heurística del Menor Esfuerzo: Arrojar todo el empaque en la caneca más cercana toma un segundo; separar minuciosamente, retirar la tapa plástica "
        "y verter el líquido sobrante exige atención y esfuerzo motriz. En ausencia de un diseño espacial intuitivo, triunfa sistemáticamente la conveniencia inmediata.\n\n"
        "4. El 'Efecto Agujero Negro' y la Desconexión Metabólica: Una vez que el residuo cae dentro de la bolsa plástica del contenedor, desaparece del campo visual y de la "
        "conciencia del individuo. El campus actúa como una máquina que oculta el metabolismo de sus desechos, impidiendo que el consumidor experimente el impacto territorial de sus hábitos."
    )
    p = doc.add_paragraph()
    p.alignment = WD_ALIGN_PARAGRAPH.JUSTIFY
    p.paragraph_format.space_after = Pt(8)
    p.paragraph_format.line_spacing = 1.15
    r = p.add_run(q4_text)
    r.font.name = "Arial"
    r.font.size = Pt(10)

    # 1.5 ¿Qué consecuencias ambientales y sociales genera?
    p_q5 = doc.add_paragraph()
    r = p_q5.add_run("1.5. Consecuencias Socioambientales, Económicas y Sanitarias")
    r.bold = True
    r.font.name = "Arial"
    r.font.size = Pt(11.5)
    r.font.color.rgb = COLOR_SECONDARY

    q5_text = (
        "Las repercusiones de este patrón de insostenibilidad se manifiestan en múltiples escalas:\n\n"
        "• Consecuencias Ambientales Territoriales: Saturación acelerada de la capacidad de disposición final en el relleno sanitario regional (como La Pradera en Antioquia); "
        "emisiones indirectas de gases de efecto invernadero (metano $CH_4$ y dióxido de carbono $CO_2$) derivadas del transporte y descomposición anaerobia de material mezclado; "
        "presión innecesaria sobre los ecosistemas por extracción continua de hidrocarburos y celulosa virgen para producir bienes de uso efímero; y dispersión de microplásticos en fuentes hídricas y suelos.\n\n"
        "• Consecuencias Sociales y de Justicia Ambiental: Sobrecarga biomecánica y riesgos laborales para el personal de servicios generales, quienes deben realizar manualmente "
        "el destape y reclasificación de bolsas con materiales contaminados, exponiéndose a cortes y patógenos; estigmatización de su labor frente a la comunidad académica; "
        "y disminución de los ingresos vitales de las familias recicladoras de base, quienes ven arruinada la calidad comercial del cartón y plástico que se mezcla con jugos o grasas.\n\n"
        "• Consecuencias Económicas e Institucionales: Incremento sustancial en la factura del servicio público de aseo para la institución por pesaje de toneladas de residuos "
        "ordinarios en disposición final; pérdida de oportunidades de valorización económica bajo esquemas de economía circular; y erosión de la coherencia y credibilidad "
        "institucional de la universidad como formadora de profesionales con compromiso bioético y ciudadano."
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
    r = p_sec2.add_run("FASE 2: ANÁLISIS DESDE LAS CIENCIAS SOCIALES (DISCIPLINAS DE LA UNIDAD 2)")
    r.bold = True
    r.font.name = "Arial"
    r.font.size = Pt(14)
    r.font.color.rgb = COLOR_PRIMARY

    sec2_intro = (
        "De conformidad con las directrices metodológicas de la Unidad 2, la comprensión y resolución de un conflicto socioambiental "
        "exige una mirada interdisciplinar. A continuación, se articula el aporte de tres disciplinas fundamentales trabajadas en la unidad: "
        "la Sociología Ambiental, la Economía Ecológica y la Psicología Social y Ambiental, estructuradas en la matriz comparativa oficial:"
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
            "Sociología Ambiental\n(Teoría de las Prácticas Sociales y Estructura Socio-laboral)",
            "Interpreta la crisis no como una sumatoria de fallas morales individuales, sino como el resultado de 'Sistemas de Provisión' y 'Prácticas Sociales' colectivamente institucionalizadas (Warde, 2005). Los individuos consumen desechables porque las rutinas del campus están organizadas en torno a la prisa y la falta de tiempo.\n\n"
            "Asimismo, analiza la división social del trabajo y la jerarquización dentro del campus: las élites académicas (docentes y estudiantes) externalizan el 'trabajo sucio' hacia los estratos laborales subordinados (personal de limpieza), reproduciendo relaciones de poder asimétricas y un desentendimiento moral amparado en la invisibilización del otro.",
            "1. Desnormalización cultural del consumo desechable: Construir nuevas normas sociales compartidas donde portar un termo y separar residuos sea visto como un rasgo de pertenencia e identidad positiva en el campus.\n\n"
            "2. Democratización y justicia socio-laboral interna: Diseñar espacios de encuentro y reconocimiento horizontal que visibilicen al personal de aseo como educadores ambientales y co-gestores del territorio, desarticulando el clasismo institucional.\n\n"
            "3. Acuerdos colectivos de campus: Impulsar pactos comunitarios vinculantes entre facultades y estamentos para institucionalizar la corresponsabilidad en el ordenamiento del espacio común."
        ),
        (
            "Economía Ecológica\n(Metabolismo Social, Externalidades y Bioeconomía)",
            "Interpreta la proliferación de residuos como una manifestación de la 'Falla Metabólica' de la institución universitaria, que opera como un sistema lineal abierto dependiente de flujos incesantes de materia y energía virgen que terminan como entropía y basura.\n\n"
            "Desde la economía ambiental, diagnostica una gravísima falla de mercado: la existencia de 'externalidades negativas no internalizadas'. Los establecimientos comerciales expenden plásticos de un solo uso porque su precio de mercado no incorpora el costo del tratamiento del desecho, de la recolección municipal ni del daño ecosistémico, abaratando artificialmente la opción más insostenible y penalizando la reutilización.",
            "1. Instrumentos de internalización económica: Diseñar sistemas de 'Depósito, Devolución y Retorno' (SDDR) para recipientes y vajilla en cafeterías, haciendo que el envase reutilizable tenga un valor monetario recuperable.\n\n"
            "2. Esquema de precios transparentes y eco-descuentos: Establecer un cobro visible por el empaque desechable y otorgar un descuento directo obligatorio del 10% al 15% en bebidas o alimentos a los usuarios que aporten sus propios recipientes.\n\n"
            "3. Contratación y compras públicas circulares: Rediseñar los pliegos de licitación de las concesiones de cafeterías, obligando a los contratistas a asumir metas de cero empaques de un solo uso so pena de sanciones económicas."
        ),
        (
            "Psicología Ambiental y Social\n(Arquitectura de Decisiones, Sesgos y Teoría del Nudge)",
            "Interpreta el problema a través de la 'Brecha entre Valores y Acción' (Value-Action Gap; Kollmuss & Agyeman, 2002): los estudiantes pueden tener una alta sensibilidad ecológica declarada en encuestas, pero en su cotidianidad actúan bajo heurísticas de menor esfuerzo físico y cognitivo.\n\n"
            "Si la 'Arquitectura de Decisiones' (Thaler & Sunstein, 2008) del campus hace que tirar la basura mezclada sea más fácil, rápido y ergonómicamente accesible que separar (porque los orificios de las canecas son confusos o están sucios), el cerebro humano automatiza el descarte no diferenciado. Adicionalmente, la falta de retroalimentación inmediata diluye la motivación intrínseca.",
            "1. Aplicación de la 'Teoría del Nudge' (Empujones Verdes): Modificar el entorno físico mediante señales visuales salientes, colores contrastantes (Código Nacional Res. 2184/2019) y disposición ergonómica a la altura de la vista que guíen intuitivamente la elección correcta sin coerción.\n\n"
            "2. Estaciones de lavado 'Eco-Wash' de bajo esfuerzo: Instalar lavaderos rápidos automáticos junto a los puntos ecológicos para eliminar la fricción que genera enjuagar un termo o un vaso reutilizable.\n\n"
            "3. Retroalimentación inmediata y refuerzo social positivo: Pantallas interactivas y contadores digitales en tiempo real que muestren: 'Hoy la comunidad de esta facultad evitó 850 botellas plásticas'."
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
    r = p_sec3.add_run("FASE 3: PROPUESTA ESTRATÉGICA DE INTERVENCIÓN SOCIOAMBIENTAL\n«CAMPUS CIRCULAR Y CORRESPONSABLE»")
    r.bold = True
    r.font.name = "Arial"
    r.font.size = Pt(14)
    r.font.color.rgb = COLOR_PRIMARY

    # 3.1 Objetivos
    p_o = doc.add_paragraph()
    r = p_o.add_run("3.1. Objetivos del Programa")
    r.bold = True
    r.font.name = "Arial"
    r.font.size = Pt(11.5)
    r.font.color.rgb = COLOR_SECONDARY

    obj_text = (
        "• Objetivo General:\n"
        "Diseñar, implementar y consolidar un modelo integral de gestión socioambiental y cambio conductual en el campus universitario, "
        "orientado a reducir en un 75% la generación y descarte de residuos plásticos y envases de un solo uso en un periodo de 18 meses, "
        "fortaleciendo la corresponsabilidad comunitaria, dignificando el rol del personal de servicios generales y articulando instrumentos "
        "económicos, normativos y mecanismos de participación ciudadana vinculante.\n\n"
        "• Objetivos Específicos:\n"
        "1. Reestructurar la oferta comercial interna de alimentos y bebidas, eliminando progresivamente la vajilla plástica descartable e implementando un sistema de envases reutilizables y retornables.\n"
        "2. Reconfigurar la arquitectura física y espacial del campus mediante el rediseño ergonómico de puntos ecológicos (Res. 2184/2019) y la instalación de una red institucional de estaciones de hidratación y lavado rápido ('Eco-Wash').\n"
        "3. Establecer un sistema permanente de eco-incentivos y desincentivos económicos que premie las prácticas de reutilización y penalice el uso de descartables.\n"
        "4. Fomentar la justicia socio-laboral y la empatía comunitaria a través del reconocimiento explícito y articulación activa del personal de aseo y recicladores en el gobierno ambiental del campus.\n"
        "5. Institucionalizar un mecanismo participativo y de veeduría ambiental estudiantil que garantice la sostenibilidad y monitoreo continuo de las metas trazadas."
    )
    p = doc.add_paragraph()
    p.alignment = WD_ALIGN_PARAGRAPH.JUSTIFY
    p.paragraph_format.space_after = Pt(8)
    p.paragraph_format.line_spacing = 1.15
    r = p.add_run(obj_text)
    r.font.name = "Arial"
    r.font.size = Pt(10)

    # 3.2 Población Objetivo
    p_pob = doc.add_paragraph()
    r = p_pob.add_run("3.2. Población Objetivo y Alcance Comunitario")
    r.bold = True
    r.font.name = "Arial"
    r.font.size = Pt(11.5)
    r.font.color.rgb = COLOR_SECONDARY

    pob_text = (
        "La estrategia abarca el 100% de la comunidad que habita e interactúa en el territorio universitario, segmentada en cuatro núcleos de intervención:\n"
        "a) Estudiantes: Comunidad de pregrado y posgrado en jornadas diurna, nocturna y mixta (actores masivos de consumo cotidiano).\n"
        "b) Cuerpo Docente e Investigadores: Referentes pedagógicos y usuarios de salas de profesores, eventos y cafeterías.\n"
        "c) Personal Administrativo y Directivo: Gestores de compras, directores de programa y personal de soporte en oficinas.\n"
        "d) Concesionarios Comerciales, Cafeterías y Proveedores de Eventos: Operadores económicos intra-campus encargados del despacho de alimentos.\n"
        "e) Personal de Servicios Generales y Recuperadores de Oficio: Agentes clave de la economía circular y la operación de limpieza."
    )
    p = doc.add_paragraph()
    p.alignment = WD_ALIGN_PARAGRAPH.JUSTIFY
    p.paragraph_format.space_after = Pt(8)
    p.paragraph_format.line_spacing = 1.15
    r = p.add_run(pob_text)
    r.font.name = "Arial"
    r.font.size = Pt(10)

    # 3.3 Mínimo 5 Acciones de Mejora
    p_acc = doc.add_paragraph()
    r = p_acc.add_run("3.3. Acciones de Mejora Operacionales (5 Programas Estratégicos)")
    r.bold = True
    r.font.name = "Arial"
    r.font.size = Pt(11.5)
    r.font.color.rgb = COLOR_SECONDARY

    acciones = [
        ("Acción 1: Programa «Tu Campus, Tu Recipiente» y Cláusulas Contractuales Verdes en Cafeterías",
         "Consiste en la suscripción obligatoria de un Otrosí Ambiental con todos los concesionarios de alimentos del campus, prohibiendo la entrega de "
         "pitillos, cubiertos plásticos, platos de icopor (poliestireno expandido) y bolsas plásticas de un solo uso (alineado con la Ley 2232 de 2022). "
         "Se implementa la política 'Trae tu termo y táper': los establecimientos están obligados a servir en los recipientes limpios provistos por los "
         "usuarios y a disponer de una vajilla institucional de loza/vidrio retornable para consumo en sitio. Para bebidas para llevar, la universidad "
         "provee un stock inicial de 'Vasos Circulares Universitarios' bajo un sistema de comodato/préstamo."),

        ("Acción 2: Reingeniería Ergonómica de Puntos Ecológicos e Infraestructura «Eco-Wash»",
         "Transformación radical de la infraestructura de disposición. Se sustituyen las canecas tradicionales por módulos de separación inteligente bajo el "
         "Código Nacional de Colores (Blanco: aprovechables limpios y secos; Verde: orgánicos compostables; Negro: no aprovechables, según Res. 2184/2019). "
         "Crucialmente, se instalan estaciones de lavado rápido 'Eco-Wash' dotadas de grifos de pedal con pulsador ahorrador de agua y desagüe directo al alcantarillado, "
         "permitiendo que en menos de 10 segundos el usuario enjuague su envase antes de depositarlo en la caneca blanca o en su bolso, eliminando el principal factor de contaminación cruzada."),

        ("Acción 3: Sistema Permanente de Eco-Incentivos «Eco-Puntos IU» y Descuentos Cruzados",
         "Creación de una aplicación móvil / tarjeta institucional que gamifica la sostenibilidad. Cada vez que un usuario compra con su recipiente reutilizable "
         "o deposita material reciclable de alta calidad en las estaciones receptoras, escanea un código QR que acredita 'Eco-Puntos'. Estos puntos son redimibles "
         "en descuentos en la matrícula, cupones de compra en librerías, horas de estacionamiento o créditos para servicios de bienestar universitario. "
         "Simultáneamente, las cafeterías aplican un descuento directo del 10% en el valor de la bebida a quien no exija envase descartable."),

        ("Acción 4: Campaña Vivencial «Rostros del Cuidado: Dignificación y Co-responsabilidad»",
         "Superación del modelo informativo pasivo mediante una estrategia de comunicación transformadora y empatía social. Se implementan jornadas de "
         "'Un Día con el Equipo de Servicios Generales', donde directivos, profesores y líderes estudiantiles acompañan las rutas de aseo del campus. "
         "Asimismo, se instalan gigantografías en los puntos ecológicos con las fotografías y testimonios reales de los trabajadores de limpieza: "
         "'Mi nombre es Gloria; cuando mezclas tus sobras de comida con el plástico, me toca meter las manos para limpiarlo. ¡Separa bien por ti y por mí!'. "
         "Se desarticula el desentendimiento moral visibilizando el rostro humano del trabajo del aseo."),

        ("Acción 5: Red de Gestores Ambientales Estudiantiles y Presupuesto Participativo Verde",
         "Conformación de un colectivo voluntario de estudiantes becarios y de práctica social que actúan como 'Nudgers' o promotores ambientales en horas pico en zonas de comida, "
         "resolviendo dudas y orientando a sus pares de forma cercana y horizontal. La universidad asigna un fondo concursable de 'Presupuesto Participativo Verde' "
         "(1% del presupuesto de bienestar) para que los estudiantes propongan y voten democráticamente microproyectos de sostenibilidad y circularidad en sus facultades.")
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

    # 3.4 Dos Instrumentos de Política Ambiental
    p_inst = doc.add_paragraph()
    r = p_inst.add_run("3.4. Instrumentos de Política Ambiental Seleccionados (Marco Jurídico y Económico Nacional)")
    r.bold = True
    r.font.name = "Arial"
    r.font.size = Pt(11.5)
    r.font.color.rgb = COLOR_SECONDARY

    inst_p = (
        "Para dotar de solidez técnica y legal a la propuesta, se articulan dos instrumentos reconocidos en la política ambiental colombiana:\n\n"
        "1. Instrumento Económico y de Mercado: Sistema de Depósito, Devolución y Retorno (SDDR) articulado con Impuestos Internos de Desincentivo (Ley 2277 de 2022 y ENEC):\n"
        "• Justificación y Funcionamiento: Fundamentado en el principio 'quien contamina paga' y en la Estrategia Nacional de Economía Circular (ENEC). "
        "En el campus, al adquirir una bebida o alimento servido en vajilla o envase retornable del campus, el usuario abona un 'depósito monetario reembolsable' "
        "(ej. $2.000 COP). Al devolver el recipiente en cualquiera de las cafeterías o estaciones automatizadas de retorno, el valor se reembolsa íntegramente "
        "o se abona a su carné. Para quienes insistan en solicitar envases desechables permitidos, se aplica un cargo o ecotasa adicional visible no reembolsable ($500 COP), "
        "desincentivando el consumo descartable mediante señales de precio directas en el bolsillo del consumidor.\n\n"
        "2. Instrumento Regulatorio / Comando y Control: Política Institucional Vinculante de Compras Públicas Sostenibles y Prohibición Escalonada de Plásticos (Ley 2232 de 2022 y Decreto 1076 de 2015):\n"
        "• Justificación y Funcionamiento: Emisión de una Resolución Rectoral de estricto cumplimiento que adopta los mandatos de la Ley 2232 de 2022 "
        "(Ley de reducción de plásticos de un solo uso en Colombia). La norma prohíbe de forma taxativa el ingreso, venta, suministro y uso de plásticos de un solo uso no biodegradables "
        "en todos los contratos de concesión comercial, eventos académicos, recepciones institucionales y compras de suministros de oficina en el campus. "
        "Establece un régimen de sanciones contractuales (multas y rescisión de concesión) para los comerciantes que incumplan la norma, fijando un estándar de comando y control indiscutible."
    )
    p = doc.add_paragraph()
    p.alignment = WD_ALIGN_PARAGRAPH.JUSTIFY
    p.paragraph_format.space_after = Pt(8)
    p.paragraph_format.line_spacing = 1.15
    r = p.add_run(inst_p)
    r.font.name = "Arial"
    r.font.size = Pt(10)

    # 3.5 Mecanismo de Participación Ciudadana
    p_part = doc.add_paragraph()
    r = p_part.add_run("3.5. Mecanismo de Participación Ciudadana y Gobernanza Territorial")
    r.bold = True
    r.font.name = "Arial"
    r.font.size = Pt(11.5)
    r.font.color.rgb = COLOR_SECONDARY

    part_text = (
        "• Mecanismo Seleccionado: «Mesa Universitaria de Concertación y Veeduría Socioambiental (MUCVA)» con Audiencias Públicas de Rendición de Cuentas y Presupuesto Participativo.\n\n"
        "• Fundamentación Normativa y Operativa: Amparado constitucionalmente en los Artículos 79 (Derecho a un ambiente sano y participación de la comunidad en las decisiones ambientales) "
        "y 270 (Veedurías ciudadanas) de la Constitución Política de Colombia de 1991, la Ley 1757 de 2015 (Estatuto de la Participación Democrática) y los principios del Acuerdo de Escazú (Ley 2273 de 2022).\n\n"
        "• Estructura y Funcionamiento en el Campus: La MUCVA se constituye como un órgano permanente de gobernanza ambiental con representación paritaria de estudiantes electos por voto popular, "
        "representantes docentes, delegados de las concesiones comerciales, líderes del sindicato/empresa de servicios generales y las directivas de infraestructura. "
        "Esta mesa ejerce tres funciones vitales:\n"
        "a) Veeduría Ciudadana Continua: Monitorear el cumplimiento de la prohibición de plásticos y la calidad del pesaje de residuos.\n"
        "b) Audiencias Públicas Semestrales: Espacios abiertos de rendición de cuentas donde se publican las cifras de residuos evitados y las ganancias distribuidas.\n"
        "c) Asambleas de Presupuesto Participativo: Convocatorias anuales donde los estudiantes debaten y deciden democráticamente en qué mejoras ambientales intra-campus "
        "se reinvierten los fondos recaudados por concepto de eco-tasas y comercialización de material reciclable."
    )
    p = doc.add_paragraph()
    p.alignment = WD_ALIGN_PARAGRAPH.JUSTIFY
    p.paragraph_format.space_after = Pt(8)
    p.paragraph_format.line_spacing = 1.15
    r = p.add_run(part_text)
    r.font.name = "Arial"
    r.font.size = Pt(10)

    # 3.6 Cuatro Indicadores de Evaluación
    p_ind = doc.add_paragraph()
    r = p_ind.add_run("3.6. Sistema de Indicadores de Monitoreo y Evaluación de Resultados")
    r.bold = True
    r.font.name = "Arial"
    r.font.size = Pt(11.5)
    r.font.color.rgb = COLOR_SECONDARY

    ind_intro = (
        "Para garantizar un control empírico riguroso sobre la eficacia de la estrategia, se formulan cuatro indicadores multidimensionales:"
    )
    p = doc.add_paragraph()
    p.alignment = WD_ALIGN_PARAGRAPH.JUSTIFY
    p.paragraph_format.space_after = Pt(6)
    r = p.add_run(ind_intro)
    r.font.name = "Arial"
    r.font.size = Pt(10)

    # Tabla de indicadores
    t_ind = doc.add_table(rows=5, cols=5)
    t_ind.alignment = WD_TABLE_ALIGNMENT.CENTER
    set_table_borders(t_ind)

    headers_ind = ["Nombre del Indicador", "Fórmula de Cálculo", "Meta Esperada (18 meses)", "Periodicidad", "Actor Responsable"]
    for i, h in enumerate(headers_ind):
        add_header_cell(t_ind.rows[0], i, h, bg_hex=HEX_PRIMARY)

    ind_data = [
        ("1. Tasa de Reducción de Plásticos Desechables (TRPD)",
         "[ (Peso total plásticos desechables Mes 0 - Mes t) / (Peso Mes 0) ] * 100",
         "Reducción ≥ 75% respecto a la línea base inicial.",
         "Mensual",
         "Dirección de Infraestructura y MUCVA"),

        ("2. Índice de Pureza en Separación en la Fuente (IPSF)",
         "[ (Peso de material reciclable limpio y seco en canecas blancas) / (Peso total acopiado en canecas blancas) ] * 100",
         "Efectividad ≥ 90% (menos del 10% de rechazo por contaminación orgánica).",
         "Quincenal",
         "Personal de Servicios Generales y Asociación de Recicladores"),

        ("3. Tasa de Adopción de Envases Reutilizables (TAER)",
         "[ (Número de transacciones en cafeterías servidas en envases propios o retornables) / (Total de transacciones de alimentos y bebidas) ] * 100",
         "Adopción ≥ 80% del total de despachos comerciales.",
         "Mensual",
         "Concesionarios de Cafeterías y Auditoría de Compras"),

        ("4. Índice de Corresponsabilidad y Cultura Ambiental (ICCA)",
         "[ (N.° de usuarios que reconocen su deber cívico de separar y asear sin transferir la culpa al personal de aseo) / (Total encuestados en muestra representativa) ] * 100",
         "Percepción positiva y corresponsable ≥ 85% de la comunidad.",
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
    # 6. FASE 4: REFLEXIÓN FINAL
    # ========================================================
    p_sec4 = doc.add_paragraph()
    r = p_sec4.add_run("FASE 4: REFLEXIÓN FINAL CRÍTICA")
    r.bold = True
    r.font.name = "Arial"
    r.font.size = Pt(14)
    r.font.color.rgb = COLOR_PRIMARY

    p_q_ref = doc.add_paragraph()
    r = p_q_ref.add_run("Pregunta Orientadora:\n¿Por qué la solución de una problemática ambiental requiere intervenir no solamente sobre el comportamiento individual, sino también sobre las condiciones sociales, económicas, culturales e institucionales que influyen en dicho comportamiento?")
    r.bold = True
    r.font.name = "Arial"
    r.font.size = Pt(11)
    r.font.italic = True
    r.font.color.rgb = COLOR_SECONDARY
    p_q_ref.paragraph_format.space_after = Pt(10)

    reflexion_p1 = (
        "La pretensión de resolver la crisis ecológica contemporánea apelando exclusivamente a la 'conciencia moral' o a la 'voluntad' del individuo "
        "aislado constituye una de las falacias más extendidas y estériles del ambientalismo convencional: la falacia del individualismo metodológico. "
        "Como bien advierte la sociología ambiental (Schnaiberg, 1980; Leff, 2004), los seres humanos no operamos en un vacío social; nuestras decisiones "
        "cotidianas no son actos de libre albedrío puro, sino elecciones constreñidas y estructuradas por un entramado denso de condiciones materiales, "
        "normas culturales, reglas económicas y arreglos institucionales."
    )
    p = doc.add_paragraph()
    p.alignment = WD_ALIGN_PARAGRAPH.JUSTIFY
    p.paragraph_format.space_after = Pt(8)
    p.paragraph_format.line_spacing = 1.15
    r = p.add_run(reflexion_p1)
    r.font.name = "Arial"
    r.font.size = Pt(10)

    reflexion_p2 = (
        "En el contexto de un campus universitario, exigirle a un estudiante que 'no genere basura' mientras la cafetería le ofrece únicamente alimentos "
        "ultaprocesados envueltos en triple capa plástica, mientras no existen bebederos públicos para rellenar su termo, y mientras carece de un lavadero rápido "
        "donde higienizar su vajilla antes de ingresar a su siguiente clase de laboratorio, equivale a exigirle una heroicidad individual que desafía la física "
        "y el tiempo cotidiano. La 'arquitectura de las opciones' impone la insostenibilidad. Si el sistema económico premia lo descartable mediante subsidios implícitos "
        "y castiga la reutilización con incomodidad y sobrecostos, el comportamiento racional del individuo terminará amoldándose a la opción más accesible: usar y tirar."
    )
    p = doc.add_paragraph()
    p.alignment = WD_ALIGN_PARAGRAPH.JUSTIFY
    p.paragraph_format.space_after = Pt(8)
    p.paragraph_format.line_spacing = 1.15
    r = p.add_run(reflexion_p2)
    r.font.name = "Arial"
    r.font.size = Pt(10)

    reflexion_p3 = (
        "Adicionalmente, el comportamiento está anclado en dimensiones culturales y simbólicas de clase y género. En muchas instituciones, el acto de 'no limpiar' "
        "o 'tirar el envase donde sea' opera como una demostración inconsciente de estatus: se asume que las tareas de limpieza corresponden a una clase trabajadora "
        "subalterna cuya labor ya está 'pagada'. Este desentendimiento moral se reproduce porque la institución no ha cuestionado la jerarquía interna de los cuidados. "
        "Transformar el comportamiento individual demanda, por consiguiente, desmitificar esas estructuras de dominación y construir una cultura de la corresponsabilidad "
        "donde el cuidado del espacio común sea un deber cívico irrenunciable de todos los estamentos."
    )
    p = doc.add_paragraph()
    p.alignment = WD_ALIGN_PARAGRAPH.JUSTIFY
    p.paragraph_format.space_after = Pt(8)
    p.paragraph_format.line_spacing = 1.15
    r = p.add_run(reflexion_p3)
    r.font.name = "Arial"
    r.font.size = Pt(10)

    reflexion_p4 = (
        "En conclusión, la intervención socioambiental debe ser sistémica y estructural. Requiere intervenir simultáneamente en cuatro niveles interconectados:\n"
        "1. Nivel Económico: Modificando los incentivos de precios a través de la internalización de costos (tasas ecológicas a desechables y bonificaciones a retornables).\n"
        "2. Nivel Institucional y Normativo: Estableciendo reglas claras, vinculantes y exigibles (resoluciones rectorales de compras públicas sostenibles y prohibición de plásticos de un solo uso).\n"
        "3. Nivel Físico e Infraestructural: Diseñando un entorno facilitador que reduzca la fricción motriz (puntos ecológicos ergonómicos y red de estaciones 'Eco-Wash').\n"
        "4. Nivel Cultural y Político: Democratizando la toma de decisiones a través de mecanismos de veeduría y participación que empoderen a la comunidad y dignifiquen al personal operativo.\n\n"
        "Solo cuando las condiciones institucionales, económicas y culturales hacen que el comportamiento ecológico sea el más fácil, el más digno, el más económico y el socialmente más deseable, "
        "la ética de la sostenibilidad deja de ser un eslogan publicitario y se transforma en una práctica territorial viva y duradera."
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
    r = p_ref.add_run("REFERENCIAS BIBLIOGRÁFICAS Y MARCO NORMATIVO")
    r.bold = True
    r.font.name = "Arial"
    r.font.size = Pt(14)
    r.font.color.rgb = COLOR_PRIMARY

    referencias = [
        "Congreso de la República de Colombia. (1991). Constitución Política de Colombia. Artículos 79 y 270 (Participación ciudadana y derecho al ambiente sano). Gaceta Constitucional.",
        "Congreso de la República de Colombia. (1993). Ley 99 de 1993: Por la cual se crea el Ministerio del Medio Ambiente, se reordena el Sector Público encargado de la gestión y conservación del medio ambiente y los recursos naturales renovables, se organiza el SINA y se dictan otras disposiciones. Diario Oficial No. 41.146.",
        "Congreso de la República de Colombia. (2015). Ley 1757 de 2015: Por la cual se dictan disposiciones en materia de promoción y protección del derecho a la participación democrática. Diario Oficial No. 49.565.",
        "Congreso de la República de Colombia. (2022). Ley 2232 de 2022: Por la cual se establecen medidas tendientes a la reducción gradual de la producción y consumo de ciertos productos plásticos de un solo uso y se dictan otras disposiciones. Diario Oficial No. 52.088.",
        "Congreso de la República de Colombia. (2022). Ley 2273 de 2022: Por medio de la cual se aprueba el 'Acuerdo Regional sobre el Acceso a la Información, la Participación Pública y el Acceso a la Justicia en Asuntos Ambientales en América Latina y el Caribe' (Acuerdo de Escazú). Diario Oficial No. 52.195.",
        "Congreso de la República de Colombia. (2022). Ley 2277 de 2022: Por medio de la cual se adopta una reforma tributaria para la igualdad y la justicia social y se dictan otras disposiciones (Impuesto nacional sobre productos plásticos de un solo uso utilizados para envasar, embalar o empacar bienes). Diario Oficial No. 52.247.",
        "Gifford, R. (2011). The dragons of inaction: Psychological barriers that limit climate change mitigation and adaptation. American Psychologist, 66(4), 290-302. https://doi.org/10.1037/a0023566",
        "Kollmuss, A., & Agyeman, J. (2002). Mind the gap: Why do people act environmentally and what are the barriers to pro-environmental behavior? Environmental Education Research, 8(3), 239-260. https://doi.org/10.1080/13504620220145401",
        "Leff, E. (2004). Racionalidad ambiental: la reapropiación social de la naturaleza. Siglo XXI Editores.",
        "Max-Neef, M. A. (1998). Desarrollo a escala humana: Conceptos, reflexiones y algunas aplicaciones. Editorial Nordan-Comunidad.",
        "Ministerio de Ambiente y Desarrollo Sostenible - MADS. (2015). Decreto 1076 de 2015: Por medio del cual se expide el Decreto Único Reglamentario del Sector Ambiente y Desarrollo Sostenible. Bogotá D.C., Colombia.",
        "Ministerio de Ambiente y Desarrollo Sostenible - MADS. (2018). Estrategia Nacional de Economía Circular (ENEC): Cierre de ciclos de materiales, innovación tecnológica y nuevos modelos de negocio. Gobierno de Colombia.",
        "Ministerio de Ambiente y Desarrollo Sostenible - MADS. (2019). Resolución 2184 de 2019: Por la cual se modifica la Resolución 668 de 2016 sobre uso racional de bolsas plásticas y se adoptan los colores del código unificado para la separación de residuos sólidos en la fuente. Bogotá D.C.",
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

    # Guardar en las rutas solicitadas
    print(f"Guardando documento principal: {output_docx_primary}")
    doc.save(output_docx_primary)

    print(f"Guardando copia con nomenclatura secundaria: {output_docx_secondary}")
    doc.save(output_docx_secondary)

    print(f"Guardando copia con título legible: {output_docx_readable}")
    doc.save(output_docx_readable)

    print("Documentos Word generados exitosamente.")

if __name__ == "__main__":
    build_document()
