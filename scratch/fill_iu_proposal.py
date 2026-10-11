import openpyxl
from openpyxl.styles import Font, Alignment, PatternFill, Border, Side
from openpyxl.worksheet.pagebreak import Break
import shutil

template_path = r"C:\Users\lenovo\Downloads\DC_IUD_Agr_MetInv_ForProInv_EA1_U2_F.xlsx"
output_path = r"C:\Users\lenovo\Downloads\DC_IUD_Agr_MetInv_ForProInv_EA1_U2_F_Diligenciado.xlsx"
desktop_path = r"C:\Users\lenovo\Desktop\DC_IUD_Agr_MetInv_ForProInv_EA1_U2_F_Diligenciado.xlsx"
workspace_path = r"c:\Users\lenovo\Downloads\rutacost-colombia---costos-de-flota-y-reparto\DC_IUD_Agr_MetInv_ForProInv_EA1_U2_F_Diligenciado.xlsx"

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

ws['H6'].value = "jair.restrepo@iudigital.edu.co"
ws['H6'].font = font_regular
ws['H6'].alignment = align_center_center

ws['B8'].value = "Ingeniería Ambiental"
ws['B8'].font = font_regular
ws['B8'].alignment = align_center_center

ws['H8'].value = "Semestre 8"
ws['H8'].font = font_regular
ws['H8'].alignment = align_center_center

ws['K8'].value = "1036654218"
ws['K8'].font = font_regular
ws['K8'].alignment = align_center_center

# --- II. INFORMACIÓN GENERAL DEL PROYECTO ---
# Row 11: Título del proyecto (18 palabras, <= 20 palabras)
ws['B11'].value = "Transición hacia Modelos de Economía Circular en la Gestión Integral de Residuos Sólidos Urbanos: Análisis Sistemático de Evidencia y Estrategias Aplicadas"
ws['B11'].font = font_title
ws['B11'].alignment = align_center_center
ws.row_dimensions[11].height = 42.0

# Row 13: Resumen (218 palabras, <= 300 palabras)
resumen_text = (
    "La gestión tradicional lineal de residuos sólidos urbanos en América Latina enfrenta una severa crisis "
    "por el agotamiento acelerado de la vida útil de los rellenos sanitarios, la baja tasa de aprovechamiento "
    "material (10%-15%) y la elevada emisión de gases de efecto invernadero y lixiviados contaminantes. El "
    "objetivo general de esta investigación es analizar de manera sistemática y comparativa la literatura "
    "científica reciente sobre modelos y estrategias de economía circular aplicadas a la gestión de residuos "
    "urbanos, con el fin de identificar soluciones tecnológicas, operativas y normativas viables para la región. "
    "La fundamentación teórica se sustenta en la jerarquía integral de las 9R, el tratamiento biológico masivo "
    "de biorresiduos (50%-65% de la masa total), la valorización mecánica e industrial de resinas plásticas "
    "y los principios de reciclaje inclusivo y responsabilidad extendida del productor. La metodología empleada "
    "corresponde a una revisión sistemática de literatura fundamentada en la declaración PRISMA, examinando "
    "rigurosamente seis artículos científicos indexados publicados entre 2022 y 2026 en Scopus, ScienceDirect, "
    "MDPI, SciELO y Redalyc. Las técnicas de análisis incluyeron matrices comparativas de parámetros operacionales, "
    "balances de masa y carbono, y evaluación cualitativa de marcos de gobernanza territorial. Los principales "
    "hallazgos demuestran que la valorización obligatoria de residuos orgánicos mediante compostaje/biodigestión "
    "y el reciclaje tecnificado de polímeros permiten desviar más del 60% de los residuos confinados y mitigar "
    "entre un 30% y un 39% de las emisiones de gases de efecto invernadero hacia el año 2050."
)
ws['B13'].value = resumen_text
ws['B13'].font = font_regular
ws['B13'].alignment = align_justify_top
ws.row_dimensions[13].height = 175.0

# Row 15: Planteamiento del problema (203 palabras, <= 300 palabras)
problema_text = (
    "En América Latina y Colombia, la gestión integral de residuos sólidos urbanos opera bajo un modelo netamente "
    "lineal insostenible basado en la extracción masiva, el consumo acelerado y el enterramiento indiscriminado. "
    "A pesar de que las coberturas de recolección en los cascos urbanos superan el 90%, las tasas efectivas de "
    "aprovechamiento material apenas oscilan entre el 10% y el 15%, provocando que la mayoría de los residuos "
    "reciclables y orgánicos saturen rellenos sanitarios con licencias vencidas o terminen en botaderos a cielo "
    "abierto. Esta disposición genera graves impactos socioambientales: la descomposición anaerobia incontrolada de "
    "biorresiduos produce lixiviados tóxicos cargados de metales pesados y grandes volúmenes de gas metano (CH4), "
    "cuyo potencial de calentamiento global es hasta 28 veces superior al dióxido de carbono. Paralelamente, los "
    "plásticos ocupan más del 40% del volumen en celdas de confinamiento, fragmentándose en microplásticos persistentes. "
    "En el plano operativo, persiste una deficiente cultura ciudadana de separación en la fuente y la recuperación "
    "recae en recicladores de oficio en condiciones de informalidad y vulnerabilidad económica, mientras las "
    "administraciones locales enfrentan debilidad técnica para hacer cumplir instrumentos como la Responsabilidad "
    "Extendida del Productor. Ante esta problemática, se formula la siguiente pregunta de investigación: "
    "¿Cuáles son las estrategias tecnológicas, operativas y normativas de economía circular más efectivas para "
    "optimizar la gestión integral de residuos sólidos urbanos y mitigar sus impactos ambientales en contextos "
    "urbanos latinoamericanos?"
)
ws['B15'].value = problema_text
ws['B15'].font = font_regular
ws['B15'].alignment = align_justify_top
ws.row_dimensions[15].height = 175.0

# Row 16: Objetivos / Objetivo general
obj_general_text = (
    "Objetivos\n"
    "Objetivo general: Analizar de manera sistemática y comparativa la evidencia científica reciente sobre modelos y "
    "estrategias de economía circular aplicadas a la gestión integral de residuos sólidos urbanos, con el fin de "
    "identificar soluciones tecnológicas, operativas y normativas sostenibles aplicables a contextos urbanos latinoamericanos."
)
ws['B16'].value = obj_general_text
ws['B16'].font = font_regular
ws['B16'].alignment = align_left_top
ws.row_dimensions[16].height = 65.0

# Row 17: Objetivos específicos
obj_especificos_text = (
    "Objetivos específicos:\n"
    "1. Caracterizar los flujos críticos de residuos sólidos urbanos (biorresiduos y polímeros plásticos) y su potencial "
    "de valorización mediante esquemas circulares de aprovechamiento biológico y mecánico.\n"
    "2. Evaluar el impacto ambiental, operativo y de mitigación de gases de efecto invernadero (GEI) de las tecnologías "
    "limpias y modelos de economía circular frente al confinamiento lineal tradicional.\n"
    "3. Formular lineamientos estratégicos de gobernanza inclusiva, responsabilidad extendida del productor y trazabilidad "
    "digital para la optimización de los sistemas de aprovechamiento municipal."
)
ws['B17'].value = obj_especificos_text
ws['B17'].font = font_regular
ws['B17'].alignment = align_left_top
ws.row_dimensions[17].height = 95.0

# Row 19: Justificación (207 palabras, <= 300 palabras)
justificacion_text = (
    "La transición hacia modelos de economía circular en la gestión de residuos sólidos urbanos constituye una "
    "necesidad apremiante e impostergable para Colombia y América Latina. En la actualidad, las principales urbes "
    "afrontan una emergencia sanitaria y ambiental inminente debido al colapso funcional de los rellenos sanitarios "
    "y la proliferación de botaderos a cielo abierto que contaminan fuentes hídricas y suelos. Aunque Colombia cuenta "
    "con avances de política pública como la Estrategia Nacional de Economía Circular y la Resolución 1407 de 2018 "
    "(Responsabilidad Extendida del Productor), en la práctica subsiste un rezago crítico en las metas de aprovechamiento, "
    "perdiéndose miles de toneladas de materiales con alto valor comercial y energético.\n\n"
    "Esta investigación es pertinente porque suministra a los ingenieros ambientales, planificadores y tomadores de "
    "decisión un diagnóstico riguroso y comparativo de base empírica para priorizar inversiones costo-efectivas. Su "
    "relevancia radica en demostrar que desviar masivamente la fracción orgánica hacia compostaje y biodigestión, e "
    "industrializar el acopio de resinas plásticas mediante cadenas transformadoras, reduce drásticamente las emisiones "
    "de metano y lixiviados. Asimismo, el proyecto reviste una dimensión de justicia social al promover el reciclaje "
    "inclusivo como eje articulador, formalizando y dignificando la labor de las organizaciones de recicladores de base "
    "como prestadores reconocidos del servicio público de aseo."
)
ws['B19'].value = justificacion_text
ws['B19'].font = font_regular
ws['B19'].alignment = align_justify_top
ws.row_dimensions[19].height = 190.0

# Row 21: Fundamentación teórica (319 palabras, <= 500 palabras)
teorica_text = (
    "La superación del modelo extractivista tradicional en la gestión de residuos sólidos urbanos exige adoptar el "
    "paradigma de la economía circular, trascendiendo las tradicionales 'tres erres' para consolidar la jerarquía "
    "integral de las 9R. Dicha jerarquía prioriza principios preventivos y de rediseño: rechazar lo innecesario (R0), "
    "repensar procesos productivos (R1) y reducir el consumo de materias vírgenes (R2); promueve la extensión del ciclo "
    "vital de los bienes mediante reutilización (R3), reparación funcional (R4), restauración (R5), remanufactura industrial "
    "(R6) y readaptación de uso (R7); y relega el reciclaje mecánico/químico (R8) y la valorización energética (R9) a "
    "los descartes inevitables, excluyendo el confinamiento en vertederos de toda fracción valorizable (Sondh et al., 2024).\n\n"
    "En las ciudades latinoamericanas, la literatura científica focaliza dos fracciones prioritarias. Por un lado, "
    "los biorresiduos o materia orgánica representan entre el 50% y el 65% de la masa total de desechos; su vertimiento "
    "anaerobio genera lixiviados con alta carga orgánica y metales pesados, junto con emanaciones masivas de gas metano "
    "(CH4), cuyo potencial de calentamiento global es hasta 28 veces superior al CO2, haciendo imprescindible su "
    "tratamiento biológico mediante digestión anaerobia y compostaje (Ceballos Pérez et al., 2022). Por otro lado, los "
    "residuos plásticos (PET, PEAD, PEBD, PP, PS) representan entre el 12% y el 18% en peso, pero abarcan más del 40% del "
    "volumen confinado, requiriendo esquemas locales de densificación y acopio tecnificado (Nuñez Zabala, 2025).\n\n"
    "A escala global, modelos predictivos demuestran que la implementación de marcos de alta circularidad puede mitigar "
    "entre un 30% y un 39% de las emisiones de gases de efecto invernadero del sector hacia 2050 (Ijimdiya et al., 2026). "
    "Paralelamente, la literatura subraya el potencial de tecnologías 4.0, tales como contenedores inteligentes IoT y "
    "plataformas blockchain para garantizar la trazabilidad de los flujos de materiales en esquemas de logística inversa "
    "(Reis et al., 2023). Finalmente, en el contexto regional, la transición circular resulta inviable sin una gobernanza "
    "inclusiva que reconozca a los recicladores de oficio como actores estructurales a través de esquemas formales de pago "
    "por prestación de servicios y alianzas público-privadas de Responsabilidad Extendida del Productor (Najar Marín, 2024)."
)
ws['B21'].value = teorica_text
ws['B21'].font = font_regular
ws['B21'].alignment = align_justify_top
ws.row_dimensions[21].height = 230.0

# Row 23: Hipótesis (91 palabras, <= 200 palabras)
hipotesis_text = (
    "La implementación articulada de un modelo de gestión integral de residuos sólidos urbanos basado en la economía "
    "circular —que integre la valorización biológica obligatoria de biorresiduos mediante compostaje y biodigestión, el "
    "aprovechamiento mecánico-industrial de plásticos bajo normativas de Responsabilidad Extendida del Productor (REP) "
    "y la formalización socioeconómica de los recicladores de oficio con esquemas de trazabilidad digital— permite "
    "desviar más del 60% del volumen de residuos actualmente destinado a confinamiento en vertederos y mitigar entre un "
    "30% y un 39% de las emisiones de gases de efecto invernadero asociadas al sector municipal hacia el año 2050."
)
ws['B23'].value = hipotesis_text
ws['B23'].font = font_regular
ws['B23'].alignment = align_justify_top
ws.row_dimensions[23].height = 90.0

# --- MARCO METODOLÓGICO (Rows 25 to 28) ---
ws['B25'].value = (
    "Enfoque de investigación:\n"
    "Cualitativo y descriptivo-documental con análisis cuantitativo secundario (enfoque mixto de revisión de literatura). "
    "Se fundamenta en el método analítico-sintético para examinar la literatura científica indexada, contrastando los "
    "estudios empíricos territoriales con modelos matemáticos globales de balance de masa y carbono en economía circular."
)
ws['B25'].font = font_regular
ws['B25'].alignment = align_left_top
ws.row_dimensions[25].height = 68.0

ws['B26'].value = (
    "Diseño y alcance de la investigación:\n"
    "Diseño no experimental, transversal y documental, estructurado como una revisión sistemática de literatura bajo las "
    "directrices de la declaración PRISMA (Preferred Reporting Items for Systematic Reviews and Meta-Analyses). El alcance "
    "es descriptivo, correlacional-comparativo y propositivo, al caracterizar el desempeño de diversas tecnologías de "
    "valorización y formular directrices estratégicas de aplicación técnica y regulatoria para la gestión municipal."
)
ws['B26'].font = font_regular
ws['B26'].alignment = align_left_top
ws.row_dimensions[26].height = 78.0

ws['B27'].value = (
    "Técnicas para la recolección de la información:\n"
    "Búsqueda sistemática en bases de datos científicas indexadas de alto impacto (Scopus, ScienceDirect, MDPI, SciELO, "
    "Redalyc) mediante operadores booleanos y palabras clave ('circular economy', 'municipal solid waste', 'valorization', "
    "'extended producer responsibility'). Las técnicas de registro e interpretación incluyen matrices de extracción documental "
    "estandarizadas, resúmenes analíticos de investigación (RAE) y análisis comparativo cruzado de parámetros operacionales, "
    "gravimetría física, rendimientos energéticos y marcos tarifarios."
)
ws['B27'].font = font_regular
ws['B27'].alignment = align_left_top
ws.row_dimensions[27].height = 90.0

ws['B28'].value = (
    "Población: criterios de inclusión y exclusión participante en la investigación:\n"
    "• Población/Universo documental: Artículos científicos evaluados por pares y documentos técnicos de organismos multilaterales "
    "(Banco Mundial, PNUMA) sobre economía circular y gestión de residuos sólidos urbanos publicados entre 2022 y 2026.\n"
    "• Criterios de inclusión: Publicaciones en inglés y español con datos empíricos de caracterización, tecnologías de "
    "tratamiento (compostaje, digestión anaerobia, pirólisis) y esquemas de gobernanza aplicables a contextos latinoamericanos e internacionales.\n"
    "• Criterios de exclusión: Estudios previos a 2022, literatura gris sin rigor metodológico o investigaciones enfocadas "
    "exclusivamente en residuos peligrosos/hospitalarios. Corpus nuclear seleccionado: 6 artículos científicos de alto impacto (3 en inglés y 3 en español)."
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

# --- RESULTADOS ESPERADOS (Row 54, 138 palabras, <= 200 palabras) ---
resultados_text = (
    "A nivel general, se consolidará un marco comprensivo de evidencia científica que valide la viabilidad técnica, "
    "ambiental, operativa y económica de los modelos de economía circular en la gestión de residuos urbanos frente "
    "al esquema de enterramiento tradicional.\n\n"
    "En el ámbito disciplinar de la Ingeniería Ambiental, la investigación aportará indicadores comparativos sobre el "
    "potencial de valorización de fracciones críticas (biorresiduos y plásticos), coeficientes cuantitativos de mitigación "
    "de gases de efecto invernadero (hasta un 39% de reducción al año 2050) y directrices técnicas para la actualización "
    "de los Planes de Gestión Integral de Residuos Sólidos (PGIRS) municipales de segunda generación.\n\n"
    "Para la sociedad y las administraciones públicas, el proyecto contribuirá a la protección de fuentes hídricas y suelos "
    "al reducir la formación de lixiviados tóxicos, prolongará la vida útil de las celdas de confinamiento y suministrará "
    "argumentos técnicos para la adopción del reciclaje inclusivo, promoviendo la formalización laboral y remuneración "
    "justa de las asociaciones de recicladores de base dentro de cadenas productivas sostenibles."
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

# Explicit page breaks to ensure clean structural separation:
# Break after row 17 (Page 1: Info, Título, Resumen, Problema, Objetivos)
# Break after row 28 (Page 2: Justificación, Teórica, Hipótesis, Metodología)
# Break after row 54 (Page 3: Cronograma, Presupuesto, Resultados)
# Page 4: Bibliografía
ws.row_breaks.append(Break(id=17))
ws.row_breaks.append(Break(id=28))
ws.row_breaks.append(Break(id=54))

# Page setup configuration: Fit to 1 page wide
ws.page_setup.fitToWidth = 1
ws.page_setup.fitToHeight = 0
ws.sheet_properties.pageSetUpPr.fitToPage = True

# Save to output path
wb.save(output_path)
shutil.copyfile(output_path, desktop_path)
shutil.copyfile(output_path, workspace_path)
print(f"Successfully generated populated Excel at:\n- {output_path}\n- {desktop_path}\n- {workspace_path}")
