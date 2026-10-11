import openpyxl
from openpyxl.styles import Font, Alignment, PatternFill, Border, Side
from openpyxl.worksheet.pagebreak import Break
import shutil
import os

template_path = r"C:\Users\lenovo\Downloads\DC_IUD_Agr_MetInv_ForProInv_EA1_U2_F.xlsx"
trabajos_andres = r"C:\Users\lenovo\Desktop\trabajos andres"
downloads_path = r"C:\Users\lenovo\Downloads"

wb = openpyxl.load_workbook(template_path)
ws = wb.active

# Typography & Fonts
font_regular = Font(name="Arial", size=9.5, bold=False, color="000000")
font_bold = Font(name="Arial", size=9.5, bold=True, color="000000")
font_header_tbl = Font(name="Arial", size=9.0, bold=True, color="000000")
font_title = Font(name="Arial", size=10.5, bold=True, color="000000")

align_left_top = Alignment(horizontal="left", vertical="top", wrap_text=True)
align_justify_top = Alignment(horizontal="justify", vertical="top", wrap_text=True)
align_center_center = Alignment(horizontal="center", vertical="center", wrap_text=True)
align_right_center = Alignment(horizontal="right", vertical="center", wrap_text=True)
align_left_center = Alignment(horizontal="left", vertical="center", wrap_text=True)

# Adjust Column Widths to balance space
column_widths = {
    'B': 17.5,
    'C': 26.5,
    'D': 6.5,
    'E': 6.5,
    'F': 6.5,
    'G': 6.5,
    'H': 6.5,
    'I': 7.5,
    'J': 7.5,
    'K': 9.5,
    'L': 9.5,
    'M': 9.5,
}
for col, width in column_widths.items():
    ws.column_dimensions[col].width = width

# --- I. DATOS DE IDENTIFICACIÓN ---
ws['B6'].value = "Jair Andrés Restrepo"
ws['B6'].font = font_title
ws['B6'].alignment = align_center_center

ws['H6'].value = "andres.restrepo63@est.iudigital.edu.co"
ws['H6'].font = font_regular
ws['H6'].alignment = align_center_center

ws['B8'].value = "Metodología de la Investigación"
ws['B8'].font = font_regular
ws['B8'].alignment = align_center_center

ws['H8'].value = "Semestre 3"
ws['H8'].font = font_regular
ws['H8'].alignment = align_center_center

ws['K8'].value = ""
ws['K8'].font = font_regular
ws['K8'].alignment = align_center_center

# --- II. INFORMACIÓN GENERAL DEL PROYECTO ---
# Row 11: Título del proyecto (15 palabras, <= 20 palabras)
ws['B11'].value = "Transición a la Economía Circular en la Gestión de Residuos Urbanos: Evidencia y Alternativas de Valorización"
ws['B11'].font = font_title
ws['B11'].alignment = align_center_center
ws.row_dimensions[11].height = 38.0

# Row 13: Resumen (221 palabras, <= 300 palabras)
resumen_text = (
    "La disposición final en vertederos afronta un agotamiento estructural en Colombia y el resto de la región, "
    "registrando tasas de aprovechamiento que difícilmente superan el 15%. Este trabajo analiza de forma sistemática "
    "la literatura reciente sobre la integración de modelos de economía circular en la gestión de residuos sólidos "
    "municipales, con miras a consolidar alternativas tecnológicas y regulatorias viables. A partir de los postulados "
    "de la jerarquía de las 9R, se evalúa el potencial de transformación de dos corrientes críticas: la biomasa orgánica "
    "(que representa entre el 50% y el 65% del volumen generado) y las resinas plásticas de un solo uso. La ruta metodológica "
    "adoptó el protocolo PRISMA para examinar seis investigaciones empíricas y cuantitativas indexadas en Scopus, "
    "ScienceDirect, MDPI y SciELO entre 2022 y 2026. Los datos analizados revelan que priorizar el compostaje y la digestión "
    "anaerobia comunitaria reduce la generación de lixiviados en más del 75% frente al enterramiento en masa, mientras "
    "que la densificación y pirólisis de poliolefinas viabiliza rendimientos energéticos superiores al 65%. Asimismo, las "
    "proyecciones globales señalan que la recuperación material sistemática mitiga hasta un 39% de los gases de efecto "
    "invernadero del sector hacia 2050. Se concluye que la efectividad técnica depende de una gobernanza inclusiva que "
    "formalice la remuneración de los recicladores de oficio y garantice la trazabilidad de los flujos de materiales."
)
ws['B13'].value = resumen_text
ws['B13'].font = font_regular
ws['B13'].alignment = align_justify_top
ws.row_dimensions[13].height = 175.0

# Row 15: Planteamiento del problema (224 palabras, <= 300 palabras)
problema_text = (
    "El esquema lineal de extracción, uso y enterramiento masivo de residuos sólidos urbanos ha sobrepasado los límites "
    "operativos y ecológicos en Colombia y Latinoamérica. Pese a que las cabeceras municipales reportan coberturas de "
    "recolección cercanas al 95%, menos del 15% de los residuos generados se reincorpora a ciclos productivos. El "
    "porcentaje restante termina en celdas de relleno cuya vida útil autorizada ha expirado o en vertederos no controlados. "
    "Esta dinámica provoca dos impactos críticos: por un lado, la degradación anaerobia no confinada de los biorresiduos "
    "produce lixiviados de alta toxicidad que comprometen acuíferos locales y genera metano (CH4), un gas con potencial "
    "de calentamiento veintiocho veces mayor al CO2; por otro lado, los plásticos ocupan más del 40% del volumen físico en "
    "las celdas, desintegrándose en micropartículas que contaminan suelos y cuerpos de agua. Paralelamente, la separación "
    "en la fuente en los hogares es mínima y la labor de acopio continúa descansando en recicladores de oficio que operan "
    "en condiciones precarias, mientras las entidades territoriales carecen de instrumentos sancionatorios y tarifarios "
    "para exigir el cumplimiento efectivo de la Responsabilidad Extendida del Productor. Frente a este panorama, se "
    "plantea la siguiente interrogante: ¿Cuáles son las alternativas tecnológicas, operativas y normativas de economía "
    "circular más eficientes para optimizar la gestión integral de residuos sólidos urbanos y mitigar sus pasivos "
    "ambientales en contextos metropolitanos de la región?"
)
ws['B15'].value = problema_text
ws['B15'].font = font_regular
ws['B15'].alignment = align_justify_top
ws.row_dimensions[15].height = 180.0

# Row 16: Objetivos / Objetivo general
obj_general_text = (
    "Objetivos\n"
    "Objetivo general: Analizar de forma sistemática y comparativa la producción científica reciente sobre modelos y "
    "estrategias de economía circular en la gestión integral de residuos sólidos urbanos, con el fin de formular directrices "
    "técnicas, operativas y normativas viables para contextos metropolitanos de América Latina."
)
ws['B16'].value = obj_general_text
ws['B16'].font = font_regular
ws['B16'].alignment = align_left_top
ws.row_dimensions[16].height = 65.0

# Row 17: Objetivos específicos
obj_especificos_text = (
    "Objetivos específicos:\n"
    "1. Diagnosticar la generación y composición física de los flujos críticos (fracción orgánica compostable y polímeros "
    "sintéticos), determinando su potencial de valorización biológica y mecánica.\n"
    "2. Contrastar el balance ambiental y la capacidad de mitigación de gases de efecto invernadero (GEI) de las tecnologías "
    "limpias frente al modelo lineal de enterramiento indiscriminado.\n"
    "3. Establecer directrices de gobernanza local, articulando la Responsabilidad Extendida del Productor, el reciclaje "
    "inclusivo formalizado y herramientas digitales de trazabilidad operativa."
)
ws['B17'].value = obj_especificos_text
ws['B17'].font = font_regular
ws['B17'].alignment = align_left_top
ws.row_dimensions[17].height = 95.0

# Row 19: Justificación (206 palabras, <= 300 palabras)
justificacion_text = (
    "Transformar la gestión de residuos urbanos hacia un enfoque de economía circular es un paso urgente frente a la "
    "saturación de los rellenos sanitarios y la proliferación de botaderos a cielo abierto en las periferias urbanas "
    "colombianas. Aunque el país cuenta con lineamientos nacionales como la Resolución 1407 de 2018 y la Estrategia "
    "Nacional de Economía Circular, su aplicación en el nivel local todavía muestra una desconexión severa entre las "
    "metas normativas y la realidad operativa de los municipios. Investigar este problema desde la ingeniería ambiental "
    "resulta prioritario, pues permite ofrecer criterios cuantitativos y operativos para el diseño de Planes de Gestión "
    "Integral de Residuos Sólidos (PGIRS) con base en alternativas de valorización real en lugar del simple transporte hacia "
    "vertederos.\n\n"
    "La pertinencia técnica de este análisis radica en demostrar que desviar la materia orgánica mediante digestión anaerobia "
    "y compostaje controlado frena en origen la generación de metano y lixiviados nocivos. En el plano socioeconómico, el "
    "estudio destaca la importancia del reciclaje inclusivo, reconociendo a las organizaciones de recuperadores de base como "
    "agentes formales de la cadena ambiental. Con ello, se fomenta una toma de decisiones informada, capaz de reducir los "
    "costos operativos del aseo municipal y alinear las metas territoriales con los compromisos climáticos nacionales."
)
ws['B19'].value = justificacion_text
ws['B19'].font = font_regular
ws['B19'].alignment = align_justify_top
ws.row_dimensions[19].height = 195.0

# Row 21: Fundamentación teórica (389 palabras, <= 500 palabras)
teorica_text = (
    "El marco teórico de la economía circular redefine el metabolismo de las ciudades al reemplazar el patrón lineal de "
    "descarte por ciclos cerrados donde los residuos se conciben como materias primas secundarias. Esta transformación se "
    "apoya en la jerarquía de las 9R, la cual desplaza a las tradicionales tres erres para priorizar el rediseño preventivo: "
    "rechazar productos innecesarios (R0), repensar la fabricación (R1) y reducir el consumo de recursos (R2). Posteriormente, "
    "busca conservar el valor intrínseco de los materiales mediante la reutilización (R3), reparación funcional (R4), "
    "reacondicionamiento (R5), remanufactura (R6) y readaptación (R7), confinando el reciclaje (R8) y la valorización "
    "energética (R9) únicamente a aquellas fracciones donde la reutilización física es inviable (Sondh et al., 2024).\n\n"
    "En las urbes latinoamericanas, la literatura identifica dos flujos determinantes por su volumen e impacto ambiental. La "
    "materia orgánica compostable comprende entre el 50% y el 65% del peso de los residuos diarios; cuando se sepulta sin "
    "tratamiento, su fermentación anaerobia eleva los costos de tratamiento de lixiviados y acelera las emanaciones de metano "
    "(CH4), por lo que el compostaje industrial y la biodigestión anaerobia surgen como las soluciones biológicas más "
    "costo-efectivas para desviar más del 50% de la masa confinada (Ceballos Pérez et al., 2022). Respecto a los polímeros "
    "sintéticos (PET, polietileno de alta y baja densidad, polipropileno y poliestireno), aunque representan cerca del 15% del "
    "peso, ocupan más del 40% del espacio útil en los vehículos de carga y en las celdas, requiriendo plantas de compactación "
    "local e incentivos económicos para evitar su descarte en vertederos (Nuñez Zabala, 2025).\n\n"
    "A escala global, modelos matemáticos recientes confirman que la aplicación rigurosa de estrategias circulares es capaz de "
    "mitigar entre el 30% y el 39% de las emisiones de gases de efecto invernadero del sector hacia el año 2050 (Ijimdiya et "
    "al., 2026). Por añadidura, el análisis bibliométrico contemporáneo revela una fuerte tendencia hacia la digitalización "
    "operativa, integrando sensores IoT en depósitos urbanos y plataformas de registro distribuido (blockchain) que garantizan "
    "la trazabilidad contable y ambiental de los materiales recuperados (Reis et al., 2023). Por último, la literatura regional "
    "recalca que en América Latina la circularidad no puede depender solo de tecnologías importadas, sino de una gobernanza "
    "inclusiva que remunere dignamente el trabajo de los recicladores de oficio e implemente esquemas de Responsabilidad "
    "Extendida del Productor con respaldo presupuestal constante (Najar Marín, 2024)."
)
ws['B21'].value = teorica_text
ws['B21'].font = font_regular
ws['B21'].alignment = align_justify_top
ws.row_dimensions[21].height = 240.0

# Row 23: Hipótesis (84 palabras, <= 200 palabras)
hipotesis_text = (
    "La implementación de un esquema integral de economía circular —basado en el tratamiento biológico obligatorio de la "
    "fracción orgánica, la densificación y reciclaje mecánico de plásticos articulados con la Responsabilidad Extendida del "
    "Productor, y la formalización socioeconómica de las asociaciones de recicladores de base— logra desviar más del 60% del "
    "peso de los residuos sólidos urbanos enviados a disposición final y mitiga entre un 30% y un 39% de las emisiones "
    "proyectadas de gases de efecto invernadero del sector de aseo municipal hacia 2050."
)
ws['B23'].value = hipotesis_text
ws['B23'].font = font_regular
ws['B23'].alignment = align_justify_top
ws.row_dimensions[23].height = 85.0

# --- MARCO METODOLÓGICO (Rows 25 to 28) ---
ws['B25'].value = (
    "Enfoque de investigación:\n"
    "Cualitativo y descriptivo-documental con análisis cuantitativo secundario a partir de fuentes documentales. Se aplica "
    "el método analítico-sintético para comparar variables físico-químicas, operativas y de emisión extraídas de literatura "
    "científica reciente, articulando diagnósticos territoriales con modelos matemáticos de circularidad."
)
ws['B25'].font = font_regular
ws['B25'].alignment = align_left_top
ws.row_dimensions[25].height = 68.0

ws['B26'].value = (
    "Diseño y alcance de la investigación:\n"
    "Diseño no experimental, transversal y documental, bajo la modalidad de revisión sistemática estructurada según las "
    "directrices internacionales de la declaración PRISMA. El alcance es de tipo descriptivo, analítico-comparativo y "
    "propositivo, orientado a establecer lineamientos técnicos y regulatorios aplicables a municipios de la región."
)
ws['B26'].font = font_regular
ws['B26'].alignment = align_left_top
ws.row_dimensions[26].height = 75.0

ws['B27'].value = (
    "Técnicas para la recolección de la información:\n"
    "Rastreo bibliográfico sistemático en repositorios indexados (Scopus, ScienceDirect, MDPI, SciELO, Redalyc) mediante "
    "operadores booleanos combinados ('circular economy', 'municipal solid waste', 'organic waste valorization', 'plastic recycling', "
    "'waste pickers'). La sistematización se efectúa mediante matrices de extracción de datos, fichas de análisis crítico (RAE) y "
    "cuadros de contraste de rendimientos operacionales, balances de masa y marcos regulatorios."
)
ws['B27'].font = font_regular
ws['B27'].alignment = align_left_top
ws.row_dimensions[27].height = 85.0

ws['B28'].value = (
    "Población: criterios de inclusión y exclusión participante en la investigación:\n"
    "• Universo documental: Publicaciones científicas arbitradas y reportes técnicos de organismos multilaterales (Banco Mundial, "
    "PNUMA) sobre aprovechamiento de residuos urbanos y economía circular entre 2022 y 2026.\n"
    "• Criterios de inclusión: Artículos originales y de revisión en inglés o español con datos cuantitativos de caracterización "
    "gravimétrica, balances de reducción de emisiones, tecnologías de valorización y análisis de gobernanza en Colombia, América Latina o escala global.\n"
    "• Criterios de exclusión: Documentos previos a 2022, literatura gris sin rigor metodológico comprobable o artículos centrados "
    "en residuos peligrosos, industriales o de construcción. Muestra final: 6 investigaciones científicas nucleares (3 en inglés y 3 en español)."
)
ws['B28'].font = font_regular
ws['B28'].alignment = align_left_top
ws.row_dimensions[28].height = 105.0

# --- CRONOGRAMA DE ACTIVIDADES (Rows 31 to 40) ---
cronograma_data = [
    (31, "Objetivo 1", "Búsqueda y selección sistemática de literatura científica en Scopus, SciELO y MDPI bajo PRISMA.", [4, 5], "Matriz documental PRISMA"),
    (32, "Objetivo 1", "Extracción y sistematización de datos de generación y composición gravimétrica de residuos.", [5, 6], "Fichas analíticas de caracterización"),
    (33, "Objetivo 1", "Análisis comparativo del potencial de valorización de biorresiduos y polímeros plásticos críticos.", [6, 7], "Diagnóstico de flujos de materiales"),
    (34, "Objetivo 2", "Evaluación técnico-ambiental comparada de tecnologías de valorización biológica y termoquímica.", [7, 8], "Cuadro comparativo de tecnologías"),
    (35, "Objetivo 2", "Cuantificación de tasas de desvío de vertederos y coeficientes de mitigación de GEI al 2050.", [8, 9], "Matriz de balance de masa y GEI"),
    (36, "Objetivo 3", "Revisión analítica de marcos de Responsabilidad Extendida del Productor (REP) y reciclaje inclusivo.", [9, 10], "Diagnóstico institucional y legal"),
    (37, "Objetivo 3", "Formulación de lineamientos de gobernanza, trazabilidad digital (IoT/blockchain) y gestión PGIRS.", [10, 11], "Propuesta de modelo circular"),
    (38, "General", "Integración de resultados, discusión analítica comparada y redacción del informe final del proyecto.", [10, 11], "Documento final de investigación"),
    (39, "General", "Preparación y edición de manuscrito de artículo científico para divulgación académica.", [11], "Manuscrito de artículo para arbitraje"),
    (40, "General", "Socialización de resultados, preparación de diapositivas y sustentación del proyecto de grado.", [11], "Acta y presentación de sustentación"),
]

for row_idx, obj, act, meses, prod in cronograma_data:
    ws.cell(row=row_idx, column=2, value=obj).alignment = align_center_center
    ws.cell(row=row_idx, column=2).font = font_bold
    
    ws.cell(row=row_idx, column=3, value=act).alignment = align_left_center
    ws.cell(row=row_idx, column=3).font = font_regular
    
    for m in range(4, 12):
        cell_m = ws.cell(row=row_idx, column=m)
        if m in meses:
            cell_m.value = "X"
            cell_m.font = font_bold
        else:
            cell_m.value = ""
        cell_m.alignment = align_center_center
        
    ws.cell(row=row_idx, column=12, value=prod).alignment = align_left_center
    ws.cell(row=row_idx, column=12).font = font_regular
    ws.row_dimensions[row_idx].height = 26.0

# --- PRESUPUESTO (Rows 43 to 51) ---
presupuesto_data = [
    (43, "Personal", "Investigador principal (Jair Restrepo - dedicación 20h/sem)", 1, 8, 500000, 4000000),
    (44, "Personal", "Docente asesor temático / Tutor metodológico", 1, 8, 300000, 2400000),
    (45, "Equipos", "Equipo de cómputo y estación de trabajo para procesamiento", 1, 8, 200000, 1600000),
    (46, "Software", "Suscripción a gestores bibliográficos y software estadístico", 1, 8, 100000, 800000),
    (47, "Servicios técnicos", "Acceso a bases de datos científicas indexadas de pago", 1, 8, 150000, 1200000),
    (48, "Materiales", "Material bibliográfico digital, suministros y papelería", 1, 8, 50000, 400000),
    (49, "Conectividad", "Conexión a internet banda ancha y almacenamiento en nube", 1, 8, 120000, 960000),
    (50, "Socialización", "Costos de edición, traducción y divulgación científica", 1, 8, 100000, 800000),
    (51, "Imprevistos", "Fondo para contingencias operativas del proyecto (5%)", 1, 8, 75000, 600000),
]

for row_idx, rubro, desc, cant, meses, v_mes, v_tot in presupuesto_data:
    ws.cell(row=row_idx, column=2, value=rubro).alignment = align_left_center
    ws.cell(row=row_idx, column=2).font = font_bold
    
    ws.cell(row=row_idx, column=3, value=desc).alignment = align_left_center
    ws.cell(row=row_idx, column=3).font = font_regular
    
    ws.cell(row=row_idx, column=4, value=cant).alignment = align_center_center
    ws.cell(row=row_idx, column=4).font = font_regular
    
    ws.cell(row=row_idx, column=6, value=meses).alignment = align_center_center
    ws.cell(row=row_idx, column=6).font = font_regular
    
    c_vmes = ws.cell(row=row_idx, column=9, value=v_mes)
    c_vmes.alignment = align_right_center
    c_vmes.font = font_regular
    c_vmes.number_format = '$#,##0'
    
    c_tot = ws.cell(row=row_idx, column=11, value=v_tot)
    c_tot.alignment = align_right_center
    c_tot.font = font_bold
    c_tot.number_format = '$#,##0'
    
    ws.row_dimensions[row_idx].height = 22.0

# Total row format in row 52
c_tot_global = ws.cell(row=52, column=11)
c_tot_global.number_format = '$#,##0'
c_tot_global.font = Font(name="Arial", size=10.5, bold=True, color="000000")
c_tot_global.alignment = align_right_center

# --- RESULTADOS ESPERADOS (Row 54, 142 palabras, <= 200 palabras) ---
resultados_text = (
    "A nivel general, el proyecto consolidará un compendio analítico de evidencia empírica que demuestre la viabilidad "
    "técnica, ambiental y económica de los esquemas circulares frente al enterramiento en masa en vertederos urbanos.\n\n"
    "En el campo de la ingeniería ambiental, la investigación proporcionará coeficientes cuantitativos de mitigación de "
    "gases de efecto invernadero (con un potencial de hasta 39% de reducción al 2050), parámetros operacionales para el "
    "tratamiento de biorresiduos y plásticos, y directrices aplicables a la modernización de los Planes de Gestión Integral "
    "de Residuos Sólidos (PGIRS).\n\n"
    "Para la sociedad y la administración pública, la propuesta impulsará la reducción de lixiviados tóxicos en cuencas "
    "hídricas, la prolongación de la vida útil de los rellenos sanitarios y la consolidación de esquemas de reciclaje inclusivo, "
    "asegurando el reconocimiento formal y una compensación justa para las asociaciones de recicladores de base dentro "
    "del servicio de aseo."
)
ws['B54'].value = resultados_text
ws['B54'].font = font_regular
ws['B54'].alignment = align_justify_top
ws.row_dimensions[54].height = 140.0

# --- BIBLIOGRAFÍA (Row 55, Normas APA) ---
bibliografia_text = (
    "Bibliografía (Normas APA 7ma Edición):\n\n"
    "1. Ceballos Pérez, S. G., Brambila Paz, J. de J., & Pérez Cerecedo, V. (2022). Residuos sólidos urbanos y economía circular en Pachuca, Hidalgo, México. Acta Universitaria, 32, Article e3437. https://doi.org/10.15174/au.2022.3437\n\n"
    "2. Ijimdiya, S. J., Kumarasamy, M. V., Adu, J. T., & Pandi, D. (2026). Role of the Circular Economy Framework for Sustainable Waste Management and Climate Change Mitigation. Sustainability, 18(4), Article 1946. https://doi.org/10.3390/su18041946\n\n"
    "3. Najar Marín, E. (2024). Manejo de residuos sólidos en zonas urbanas en América Latina. Visión de Futuro, 28(2), 1-18. https://doi.org/10.36995/j.visiondefuturo.2024.28.02.001.es\n\n"
    "4. Nuñez Zabala, G. L. (2025). Potencial de aprovechamiento de residuos plásticos urbanos en el municipio de Sincelejo. Revista Luna Azul, 60, 25-42. https://doi.org/10.17151/luaz.2025.60.2\n\n"
    "5. Reis, W. F., Barreto, C. G., & Capelari, M. G. M. (2023). Circular Economy and Solid Waste Management: Connections from a Bibliometric Analysis. Sustainability, 15(22), Article 15715. https://doi.org/10.3390/su152215715\n\n"
    "6. Sondh, S., Upadhyay, D. S., Patel, S., & Patel, R. N. (2024). Strategic approach towards sustainability by promoting circular economy-based municipal solid waste management system—A review. Sustainable Chemistry and Pharmacy, 37, Article 101337. https://doi.org/10.1016/j.scp.2023.101337"
)
ws['B55'].value = bibliografia_text
ws['B55'].font = font_regular
ws['B55'].alignment = align_left_top
ws.row_dimensions[55].height = 230.0

# Ensure proper wrapping across all text cells
for r in [6, 8, 11, 13, 15, 16, 17, 19, 21, 23, 25, 26, 27, 28, 54, 55]:
    cell = ws.cell(row=r, column=2)
    if cell.alignment:
        cell.alignment = Alignment(
            horizontal=cell.alignment.horizontal,
            vertical=cell.alignment.vertical,
            wrap_text=True
        )

# Explicit page breaks:
ws.row_breaks.append(Break(id=17))
ws.row_breaks.append(Break(id=28))
ws.row_breaks.append(Break(id=54))

# Page setup: Fit to 1 page wide
ws.page_setup.fitToWidth = 1
ws.page_setup.fitToHeight = 0
ws.sheet_properties.pageSetUpPr.fitToPage = True

# Target file paths
target_files = [
    os.path.join(downloads_path, "DC_IUD_Agr_MetInv_ForProInv_EA1_U2_F_Diligenciado.xlsx"),
    os.path.join(trabajos_andres, "DC_IUD_Agr_MetInv_ForProInv_EA1_U2_F_Diligenciado.xlsx"),
    os.path.join(trabajos_andres, "Propuesta_Proyecto_Investigacion_Jair_Restrepo_TURNITIN.xlsx"),
]

# Save primary file
wb.save(target_files[0])

# Copy to other destinations
for dest in target_files[1:]:
    shutil.copyfile(target_files[0], dest)
    print(f"Saved: {dest}")

print("Excel files successfully generated and distributed.")
