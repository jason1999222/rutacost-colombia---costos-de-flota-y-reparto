# -*- coding: utf-8 -*-
import os
import sys
import docx
from docx.shared import Inches, Pt, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.oxml import OxmlElement, parse_xml
from docx.oxml.ns import nsdecls, qn

from make_anteproyecto_docx import (
    add_header_table,
    add_title_field,
    add_section_heading,
    add_body_p,
    add_reference_p,
    add_bullet_item,
    add_index_table,
    add_matrix_table
)

def build_complete_anteproyecto():
    doc = docx.Document()
    
    # Configurar márgenes de página (2.54 cm / 1 pulgada en todos los lados - Norma APA)
    for sec in doc.sections:
        sec.top_margin = Inches(0.8)
        sec.bottom_margin = Inches(1.0)
        sec.left_margin = Inches(1.0)
        sec.right_margin = Inches(1.0)
        sec.header_distance = Inches(0.4)
        sec.different_first_page_header_footer = False
        add_header_table(sec.header)
        
    print("Header and margins configured.")
    
    # -------------------------------------------------------------
    # PÁGINA 1: DATOS INICIALES Y 1. ÍNDICE GENERAL
    # -------------------------------------------------------------
    add_title_field(doc, "Nombres de los estudiantes:", "Bertha Inés Medina Hernández y Yudy Carolina Benítez", is_bold_val=False)
    add_title_field(doc, "Título del proyecto/monografía:", "Impactos psicológicos del trabajo sexual en la zona de tolerancia de Medellín: Una revisión de las políticas públicas gubernamentales entre el periodo 2020 - 2024.", is_bold_val=True)
    
    add_section_heading(doc, "1. Índice General", level=1)
    add_index_table(doc)
    doc.add_page_break()
    
    # -------------------------------------------------------------
    # PÁGINA 2: 2. RESUMEN EN ESPAÑOL Y ABSTRACT EN INGLÉS
    # -------------------------------------------------------------
    add_section_heading(doc, "2. Resumen en Español y Abstract en Inglés", level=1)
    
    add_section_heading(doc, "2.1. Resumen en Español", level=2)
    add_body_p(doc, 
        "Esta monografía analiza los impactos psicológicos del trabajo sexual en la zona de tolerancia de Medellín (centrada primordialmente en la Comuna 10, La Candelaria) y su relación con las políticas públicas gubernamentales implementadas durante el periodo 2020 a 2024, situando en el centro del debate la salud mental de las trabajadoras sexuales en un contexto de acentuada estigmatización social. La literatura especializada describe que el ejercicio del trabajo sexual en condiciones de precariedad económica, informalidad laboral desprovista de garantías y exposición cotidiana a violencias físicas y simbólicas se asocia estrechamente con la manifestación de sintomatología depresiva, ansiedad generalizada, estrés crónico y secuelas de estrés postraumático, lo que profundiza la vulnerabilidad psicosocial de este colectivo.",
        first_line_indent=0.5
    )
    add_body_p(doc,
        "A partir de un enfoque cualitativo descriptivo-analítico con orientación hermenéutica y un diseño de revisión sistemática documental, se examinan rigurosamente investigaciones académicas, informes institucionales, diagnósticos sociosanitarios y marcos normativo-jurisprudenciales (incluyendo la jurisprudencia constitucional colombiana) para comprender de qué manera la acción gubernamental incide en el bienestar subjetivo de estas mujeres. El análisis evidencia que, si bien existen esfuerzos como el programa distrital 'Por Mis Derechos' y lineamientos en salud pública, persisten notorias brechas en la atención psicoterapéutica especializada, prevaleciendo un sesgo biomédico preventivo centrado en la profilaxis de infecciones de transmisión sexual en detrimento de un acompañamiento integral en salud mental.",
        first_line_indent=0.5
    )
    add_body_p(doc,
        "Los resultados de la revisión demuestran que el estigma moralizante y la discriminación institucional operan como severas barreras de acceso a la red hospitalaria y a los dispositivos de apoyo psicosocial. Como contraparte, se reconocen factores protectores indispensables como la resiliencia y las redes de solidaridad entre pares, los cuales resultan insuficientes si no cuentan con un respaldo estatal estructurado y sostenido. Se concluye que es imperativo robustecer las políticas públicas mediante un enfoque de derechos humanos, salud comunitaria e interseccionalidad de género para mitigar la precariedad y dignificar la atención en salud mental.",
        first_line_indent=0.5
    )
    add_body_p(doc,
        "Trabajo sexual, salud mental, estigma social, zona de tolerancia, políticas públicas gubernamentales, Medellín, afrontamiento, resiliencia psicosocial.",
        first_line_indent=0.5,
        bold_prefix="Palabras clave: "
    )
    
    add_section_heading(doc, "2.2. Abstract in English", level=2)
    add_body_p(doc,
        "This monograph analyzes the psychological impacts of sex work in Medellín's tolerance zone (predominantly focused on Comuna 10, La Candelaria) and its relationship with government public policies implemented between 2020 and 2024, centering on the mental health of sex workers in a context of pervasive social stigmatization. Specialized literature indicates that exercising sex work under conditions of economic precariousness, labor informality lacking social protection, and recurring exposure to physical and symbolic violence is closely associated with clinical manifestations of depression, severe anxiety, chronic stress, and post-traumatic stress disorders, thereby deepening the psychosocial vulnerability of this population.",
        first_line_indent=0.5
    )
    add_body_p(doc,
        "Adopting a qualitative descriptive-analytical approach grounded in hermeneutics and a systematic documentary review design, this research examines academic studies, institutional reports, health diagnostic assessments, and regulatory frameworks (including Colombian constitutional jurisprudence) to understand how public policies affect the subjective well-being of women engaged in sex work. The documentary analysis reveals that while municipal initiatives such as the 'Por Mis Derechos' program exist alongside mental health policy guidelines, significant structural voids persist. Specifically, government intervention remains predominantly shaped by a biomedical paradigm focused on the prophylaxis of sexually transmitted infections, overshadowing the urgent need for specialized and culturally sensitive psychosocial care.",
        first_line_indent=0.5
    )
    add_body_p(doc,
        "Findings highlight that moral stigma and institutional discrimination act as decisive barriers to healthcare access, reproducing social exclusion dynamics in Medellín. Concurrently, protective factors such as resilience and peer solidarity networks facilitate emotional coping, yet remain vulnerable without consistent institutional backing. The study concludes that public policies must urgently integrate human rights, community psychology, and gender-transformative frameworks to dismantle institutional stigma and ensure comprehensive, dignified mental healthcare for sex workers.",
        first_line_indent=0.5
    )
    add_body_p(doc,
        "Sex work, mental health, social stigma, tolerance zone, government public policies, Medellín, coping strategies, psychosocial resilience.",
        first_line_indent=0.5,
        bold_prefix="Keywords: "
    )
    doc.add_page_break()
    
    # -------------------------------------------------------------
    # PÁGINA 3: 3. INTRODUCCIÓN
    # -------------------------------------------------------------
    add_section_heading(doc, "3. Introducción", level=1)
    add_body_p(doc,
        "En la zona de tolerancia de Medellín, focalizada históricamente en el sector céntrico de la comuna 10 (La Candelaria), las mujeres que ejercen el trabajo sexual enfrentan complejas dinámicas de precariedad socioeconómica, desprotección laboral, violencia urbana y una sistemática estigmatización moral y social. Estas circunstancias materiales y simbólicas no solo definen las condiciones en que desarrollan su labor de subsistencia cotidiana, sino que repercuten de forma lesiva y acumulativa sobre su equilibrio emocional y su bienestar psicológico. Múltiples investigaciones contemporáneas sitúan a esta población en un estado de alta vulnerabilidad psicosocial, señalando índices alarmantes de depresión, ansiedad patológica, estrés crónico y sintomatología compatible con el trastorno de estrés postraumático (TEPT), fenómenos agravados por barreras estructurales de acceso a servicios sanitarios libres de prejuicios.",
        first_line_indent=0.5
    )
    add_body_p(doc,
        "A pesar de que durante el cuatrienio 2020–2024 se han suscrito instrumentos de política pública distrital y nacional en materia de salud mental, enfoque de género y erradicación de violencias, persisten vacíos mayúsculos en su materialización fáctica en el territorio. En la práctica cotidiana de Medellín, la oferta pública institucional hacia las trabajadoras sexuales ha privilegiado un enfoque profiláctico y biomédico (dirigido preponderantemente a la contención epidemiológica de infecciones de transmisión sexual como el VIH/SIDA), relegando a un plano marginal el abordaje psicoterapéutico continuo del sufrimiento emocional, el trauma derivado de la violencia y la reconstrucción de proyectos de vida. Asimismo, la persistencia de prejuicios morales en los efectores del sistema de salud y de seguridad desincentiva la solicitud voluntaria de ayuda psicológica profesional, invisibilizando problemáticas complejas de salud mental.",
        first_line_indent=0.5
    )
    add_body_p(doc,
        "En este marco, la presente monografía de investigación, inscrita en el campo disciplinar de la Psicología Social, Comunitaria y de la Salud, tiene por finalidad analizar, a través de una revisión documental cualitativa y crítica, la correlación entre las afectaciones en salud mental experimentadas por las trabajadoras sexuales en la zona de tolerancia de Medellín y las políticas públicas implementadas entre 2020 y 2024. Para lograr este cometido, se articula un andamiaje teórico integrador compuesto por la Teoría del Estigma y el Manejo de la Identidad Deteriorada de Erving Goffman, el Modelo Transaccional del Estrés y los Procesos de Afrontamiento de Lazarus y Folkman, el Enfoque Psicosocial de la Salud Mental basado en Determinantes Sociales y los marcos contemporáneos de Resiliencia Comunitaria y Derechos Humanos.",
        first_line_indent=0.5
    )
    add_body_p(doc,
        "El presente documento recoge formalmente la primera fase correspondiente al Anteproyecto de Grado, estructurado en los siguientes apartados: en primer lugar, se establece la delimitación del tema y la línea de investigación; en segundo lugar, se expone con amplitud el planteamiento del problema con su fundamentación empírica y la pregunta de investigación; en tercer lugar, se formulan los objetivos generales y específicos; en cuarto lugar, se despliega un marco teórico y conceptual exhaustivamente revisado y consolidado, junto a la matriz analítica de categorías; en quinto lugar, se describe el diseño metodológico preliminar; y, finalmente, se consolida el acervo de referencias bibliográficas unificadas bajo el estándar APA de 7.ª edición.",
        first_line_indent=0.5
    )
    doc.add_page_break()
    
    # -------------------------------------------------------------
    # PÁGINA 4: 4. TEMA DE INVESTIGACIÓN Y DELIMITACIÓN
    # -------------------------------------------------------------
    add_section_heading(doc, "4. Tema de Investigación y Delimitación Temática", level=1)
    add_body_p(doc,
        "El presente proyecto de grado se adscribe a la línea de investigación institucional en Psicología Social, Comunitaria y de la Salud. Su objeto de estudio se circunscribe al análisis de los impactos psicológicos y psicosociales que experimentan las mujeres adultas en ejercicio del trabajo sexual en la zona de tolerancia del Distrito de Medellín, articulando este diagnóstico empírico con la revisión crítica y valorativa de las políticas públicas y los dispositivos institucionales implementados por la administración distrital y el Estado colombiano durante el periodo temporal comprendido entre enero de 2020 y diciembre de 2024.",
        first_line_indent=0.5
    )
    add_body_p(doc,
        "La delimitación territorial se concentra en la Comuna 10 (La Candelaria, centro de Medellín), sector históricamente reconocido como epicentro de tolerancia para el comercio sexual callejero y en establecimientos cerrados (hoteles, residencias y casas de lenocinio), extendiéndose contextualmente a zonas de creciente tercerización turística y explotación sexual conexa como la Comuna 14 (El Poblado). La delimitación temporal (2020–2024) resulta de cardinal relevancia sociopolítica, pues cobija tanto el impacto de la crisis sanitaria y de confinamiento por el COVID-19 —que profundizó de forma crítica la pauperización de ingresos y la desprotección estatal de estas mujeres— como los periodos de implementación del Plan de Desarrollo Distrital 'Medellín Futuro' (2020–2023) y la transición hacia el Plan de Desarrollo 'Medellín Te Quiere' (2024–2027), facilitando la evaluación longitudinal de las respuestas institucionales en materia de salud mental comunitaria.",
        first_line_indent=0.5
    )
    doc.add_page_break()
    
    # -------------------------------------------------------------
    # PÁGINAS 5–7: 5. PLANTEAMIENTO DEL PROBLEMA DE INVESTIGACIÓN
    # -------------------------------------------------------------
    add_section_heading(doc, "5. Planteamiento del Problema de Investigación", level=1)
    
    add_section_heading(doc, "5.1. Contextualización del Trabajo Sexual en la Comuna 10 (Medellín)", level=2)
    add_body_p(doc,
        "En la zona de tolerancia de Medellín, ubicada primordialmente en el perímetro céntrico de la comuna 10 (La Candelaria), convergen complejas realidades de precariedad socioeconómica, violencia estructural, explotación y una severa estigmatización cultural. Diversas investigaciones sociojurídicas y psicológicas desarrolladas en el ámbito local (Colombia Médica, 2020; Sierra Ospina, Bustamante Navarro & Vasco Gallo, 2025; Bermúdez Pabón, Gaviria Gómez & Fernández Vélez, 2007) concuerdan en que el trabajo sexual en este sector no constituye una elección laboral desprovista de presiones coercitivas del entorno, sino una estrategia límite de supervivencia económica para cientos de mujeres cabezas de familia, muchas de ellas migrantes internas desplazadas por el conflicto armado o migrantes de origen venezolano en condición de irregularidad migratoria.",
        first_line_indent=0.5
    )
    add_body_p(doc,
        "El entorno físico y social en el que se ejerce el comercio sexual callejero y en residencias del centro de la ciudad expone cotidianamente a las trabajadoras a situaciones de alta conflictividad urbana, incluyendo la extorsión sistemática por parte de estructuras delincuenciales locales ('combos' y plazas de vicio que controlan el uso del espacio público), violencia física y verbal perpetrada por clientes o proxenetas, operativos policiales represivos fundamentados en una aplicación punitiva del Código Nacional de Seguridad y Convivencia Ciudadana (Ley 1801 de 2016), y el riesgo latente de ser captadas por redes de trata con fines de explotación sexual (Álvarez, 2017; Godoy, 2024; Cueto, 2024). Este clima de desamparo y zozobra continuada constituye un caldo de cultivo directo para el deterioro progresivo de su salud mental y calidad de vida general.",
        first_line_indent=0.5
    )
    
    add_section_heading(doc, "5.2. Impactos Psicosociales y Afectaciones Clínicas en Salud Mental", level=2)
    add_body_p(doc,
        "Desde la perspectiva de la psicología de la salud, las evidencias empíricas demuestran que las trabajadoras sexuales en Medellín sufren un desgaste emocional acumulativo. Investigaciones locales y nacionales (Nieto, 2025; Ceballos-Ospino et al., 2013; Celis-Lozano et al., 2021) documentan una elevada prevalencia de trastornos afectivos, marcada por cuadros depresivos mayores, síntomas intensos de ansiedad generalizada, ideación suicida, baja autoestima y sentimientos profundos de culpa, desesperanza y vergüenza. Dichas manifestaciones se ven alimentadas por la internalización del estigma moral que la sociedad atribuye al cuerpo de la mujer que transgrede los mandatos de la sexualidad hegemónica, catalogándola bajo el estereotipo despectivo de 'mujer pública' o 'de la calle' (Clemente Villar, 2020; Mingorance Rosa, 2015; Sau, 2000).",
        first_line_indent=0.5
    )
    add_body_p(doc,
        "A su vez, estudios especializados sobre violencia y salud (Fernández, 2011; Guillén, 2022; Escobar & Ramírez, 2021) identifican una alarmante frecuencia de sintomatología propia del Trastorno de Estrés Postraumático (TEPT). La exposición repetida a microviolencias y agresiones físicas o sexuales graves produce estados persistentes de hipervigilancia neurovegetativa, disociación emocional defensiva, crisis de angustia y alteraciones crónicas del patrón del sueño. Para mitigar o silenciar este malestar psíquico abrumador, muchas mujeres recurren a estrategias de afrontamiento paliativas o desadaptativas, tales como el consumo problemático de alcohol y sustancias psicoactivas ilícitas en los entornos nocturnos de trabajo (Salinas, Padilla, Ruiz & Vera, 2014; Ceballos-Ospino et al., 2013), lo cual acentúa la espiral de deterioro clínico e incrementa su vulnerabilidad frente a nuevas agresiones.",
        first_line_indent=0.5
    )
    add_body_p(doc,
        "En el ámbito vincular, el estigma provoca la ruptura o debilitamiento sistemático de las redes familiares y de soporte comunitario primario. La trabajadora se ve forzada a gestionar una doble vida mediante el secreto constante, el aislamiento afectivo y la sospecha permanente frente a su entorno íntimo, ante el fundado temor de ser descubierta, rechazada por sus hijos o expulsada de su comunidad (Nieto, 2025; Panesso & Arango, 2017; Pérez, 2019). Esta soledad estructural mina su autoconcepto y restringe drásticamente sus recursos de apoyo ante momentos de crisis emocional severa.",
        first_line_indent=0.5
    )
    
    add_section_heading(doc, "5.3. Análisis Crítico de las Políticas Públicas (2020–2024) y Brecha Institucional", level=2)
    add_body_p(doc,
        "Frente a este complejo panorama de sufrimiento psíquico, la respuesta institucional del Estado en Medellín exhibe fracturas estructurales que justifican la pertinencia de este anteproyecto. Aunque en Colombia existe una jurisprudencia constitucional garantista de vanguardia —liderada por las sentencias hito de la Corte Constitucional T-629 de 2010 y T-594 de 2016, las cuales reconocen el trabajo sexual como una actividad lícita y ordenan la protección integral de los derechos fundamentales y laborales de quienes lo ejercen sin discriminación—, su traslación operativa a las políticas distritales en el cuatrienio 2020–2024 presenta notables contradicciones.",
        first_line_indent=0.5
    )
    add_body_p(doc,
        "Por un lado, el Distrito de Medellín ha impulsado programas de acompañamiento social como la estrategia 'Por Mis Derechos' (Alcaldía de Medellín, Gómez, 2020), la cual ofrece tamizajes en salud, asesoría jurídica y apoyo en procesos voluntarios de egreso o reconversión sociolaboral. No obstante, las evaluaciones territoriales revelan que la cobertura de estos programas es extremadamente reducida frente al número real de personas que subsisten del trabajo sexual en la ciudad. Más aún, la acción gubernamental continúa anclada preponderantemente a un paradigma biomédico y profiláctico: las intervenciones de la Secretaría de Salud y las Empresas Sociales del Estado (ESE Metrosalud) se focalizan prioritariamente en la entrega de preservativos, la detección serológica del VIH y pruebas de sífilis, orientándose a blindar la salud pública de la población general más que a proveer un tratamiento psicoterapéutico continuo y digno para las trabajadoras (Figueroa-Ospina et al., 2023; Médicos Sin Fronteras, 2023).",
        first_line_indent=0.5
    )
    add_body_p(doc,
        "Asimismo, las investigaciones empíricas de Sierra Ospina et al. (2025) y Álvarez (2021a) demuestran que persisten barreras insalvables de acceso a la red de salud mental pública. El estigma institucional se hace presente cuando los profesionales de la salud juzgan moralmente a las usuarias, demoran injustificadamente la atención especializada o condicionan el apoyo psicosocial al abandono inmediato del ejercicio del trabajo sexual, desconociendo las carencias materiales que impiden dicho egreso. Como consecuencia directa, las trabajadoras sexuales desarrollan una arraigada desconfianza hacia la institucionalidad sanitaria, optando por no acudir a los centros asistenciales y naturalizando el sufrimiento psíquico como un componente inevitable de su condición laboral.",
        first_line_indent=0.5
    )
    
    add_section_heading(doc, "5.4. Formulación de la Pregunta de Investigación General y Específicas", level=2)
    add_body_p(doc,
        "A partir de las tensiones, vacíos analíticos y brechas de intervención identificadas, se plantea la siguiente pregunta rectora de investigación general:",
        first_line_indent=0.5
    )
    add_body_p(doc,
        "¿De qué manera se relacionan las afectaciones en la salud mental que experimentan las mujeres en ejercicio del trabajo sexual en la zona de tolerancia de Medellín con las políticas públicas gubernamentales y los dispositivos de atención psicosocial implementados entre 2020 y 2024?",
        first_line_indent=0.5,
        italic_prefix="Pregunta General: "
    )
    add_body_p(doc,
        "Para guiar el abordaje sistemático del problema, se formulan las siguientes preguntas orientadoras específicas:",
        first_line_indent=0.5
    )
    add_body_p(doc,
        "1. ¿Cuáles son los principales impactos psicológicos, síntomas clínicos y vivencias de sufrimiento emocional documentados en la literatura científica respecto a las trabajadoras sexuales de la zona de tolerancia de Medellín?",
        first_line_indent=0.5
    )
    add_body_p(doc,
        "2. ¿Cuáles son los enfoques, normativas y alcances de las políticas públicas y programas distritales formulados entre 2020 y 2024 para la atención y garantía de derechos de esta población?",
        first_line_indent=0.5
    )
    add_body_p(doc,
        "3. ¿En qué medida los programas vigentes logran mitigar las barreras de acceso, el estigma institucional y responder con pertinencia cultural y psicosocial a las demandas de salud mental de las trabajadoras sexuales?",
        first_line_indent=0.5
    )
    doc.add_page_break()
    
    # -------------------------------------------------------------
    # PÁGINA 8: 6. OBJETIVOS DE INVESTIGACIÓN
    # -------------------------------------------------------------
    add_section_heading(doc, "6. Objetivos de Investigación", level=1)
    
    add_section_heading(doc, "6.1. Objetivo General", level=2)
    add_body_p(doc,
        "Analizar, mediante una revisión documental cualitativa y crítica, la relación entre las afectaciones en la salud mental que experimentan las mujeres en ejercicio del trabajo sexual en la zona de tolerancia de Medellín y las políticas públicas gubernamentales implementadas para su atención y protección durante el periodo 2020–2024.",
        first_line_indent=0.5
    )
    
    add_section_heading(doc, "6.2. Objetivos Específicos", level=2)
    add_body_p(doc,
        "1. Identificar y sistematizar, en la literatura científica, académica e institucional reciente, los principales impactos psicológicos, sintomatología clínica y factores de vulnerabilidad emocional reportados en mujeres que ejercen el trabajo sexual en la zona de tolerancia de Medellín.",
        first_line_indent=0.5
    )
    add_body_p(doc,
        "2. Describir y caracterizar las políticas públicas, normativas institucionales y programas distritales implementados entre 2020 y 2024 en Medellín y Colombia que regulan la atención en salud mental y la garantía de derechos de las personas en ejercicio del trabajo sexual.",
        first_line_indent=0.5
    )
    add_body_p(doc,
        "3. Evaluar críticamente en qué medida las políticas públicas y las rutas de atención identificadas responden a las necesidades reales de salud mental de las trabajadoras sexuales de la zona de tolerancia de Medellín, considerando las barreras institucionales de acceso, el estigma moralizante y las estrategias de afrontamiento y resiliencia comunitaria existentes.",
        first_line_indent=0.5
    )
    doc.add_page_break()
    
    # -------------------------------------------------------------
    # PÁGINAS 9–18: 7. MARCO TEÓRICO Y CONCEPTUAL (REVISADO Y CONSOLIDADO)
    # -------------------------------------------------------------
    add_section_heading(doc, "7. Marco Teórico y Conceptual (Revisado y Consolidado)", level=1)
    
    add_section_heading(doc, "7.1. Antecedentes de Investigación y Estado del Arte", level=2)
    add_body_p(doc,
        "El balance investigativo sobre trabajo sexual, salud mental y políticas públicas evidencia una producción académica en crecimiento durante las últimas dos décadas, caracterizada por un tránsito progresivo desde enfoques puramente epidemiológicos e higienistas hacia modelos comprensivos orientados por la psicología comunitaria, los estudios de género y los derechos humanos (Gómez Vargas, Galeano Higuita & Jaramillo Muñoz, 2015; Celis-Lozano et al., 2021). En el contexto internacional y latinoamericano, autores como Clemente Villar (2020), Rodríguez (2015), Fernández (2011) y Guillén (2022) han demostrado empíricamente cómo el ejercicio del comercio sexual en condiciones de exclusión social y clandestinidad deteriora las variables fundamentales del bienestar psicológico, incrementando de manera exponencial la prevalencia de desórdenes afectivos, depresión mayor y trauma complejo en comparación con la población general femenina.",
        first_line_indent=0.5
    )
    add_body_p(doc,
        "En el ámbito colombiano y específicamente en la ciudad de Medellín, la literatura reciente aporta elementos fundamentales de contextualización. Las investigaciones de Nieto (2025) y Bermúdez Pabón et al. (2007) analizan la estructura de la personalidad, la autopercepción y la autoestima en mujeres que ejercen el trabajo sexual y modalidades conexas (como el modelaje webcam y la prostitución de contacto), revelando que los sentimientos de culpa interiorizada, el miedo a la sanción social y la descalificación moral actúan como determinantes centrales del sufrimiento psíquico. De forma complementaria, el estudio empírico de Sierra Ospina et al. (2025) en la Comuna 10 (La Candelaria) documenta cómo las barreras de acceso al sistema de salud público obligan a las trabajadoras a depender casi con exclusividad de prácticas informales de autocuidado y redes de solidaridad comunitaria. Por su parte, Figueroa-Ospina et al. (2023) constatan que la percepción de maltrato y revictimización en las consultas hospitalarias constituye la principal causal de distanciamiento y abandono terapéutico.",
        first_line_indent=0.5
    )
    add_body_p(doc,
        "A pesar de estos valiosos aportes diagnósticos, el estado del arte revela un vacío analítico decisivo: la mayor parte de las investigaciones se centran de forma aislada en la descripción psicopatológica del riesgo o en el análisis formal de decretos y normativas de policía, pero resultan notablemente exiguos los estudios que confronten de forma sistemática las afectaciones subjetivas de salud mental con la efectividad práctica de las políticas públicas locales en el quinquenio 2020–2024. El presente anteproyecto busca saldar este vacío mediante un análisis documental integrador.",
        first_line_indent=0.5
    )
    
    add_section_heading(doc, "7.2. Teoría del Estigma y Manejo de la Identidad Deteriorada (Erving Goffman)", level=2)
    add_body_p(doc,
        "Uno de los pilares explicativos centrales de esta investigación descansa en la sociología psicosocial y la Teoría del Estigma formulada por Erving Goffman (1963/2009). Desde este marco, el estigma se conceptualiza no como una característica estática inherente a un sujeto, sino como una relación social de atribución profundamente desacreditadora, mediante la cual la sociedad tipifica a un individuo como portador de una marca moral vergonzosa que degrada su categoría humana y lo sitúa al margen de lo considerado socialmente legítimo, respetable o 'normal'. En el caso de las mujeres en ejercicio del trabajo sexual, la imposición del rótulo cultural de 'prostituta' desencadena un proceso de fractura identitaria radical, pues confronta de forma directa los ideales hegemónicos de feminidad, decencia y domesticidad imperantes en la cultura occidental y particularmente en la idiosincrasia tradicional de la sociedad antioqueña (Sau, 2000; Mingorance Rosa, 2015).",
        first_line_indent=0.5
    )
    add_body_p(doc,
        "Goffman distingue entre dos condiciones estructurales del estigma que resultan fundamentales para comprender el desgaste emocional de las trabajadoras en la zona de tolerancia: el individuo 'desacreditado' y el individuo 'desacreditable'. Cuando la trabajadora sexual se encuentra en la condición de desacreditada (es decir, cuando su actividad laboral es pública y evidente en la calle), se enfrenta al rechazo directo, las miradas condenatorias de transeúntes, la segregación espacial urbana y la violencia institucional. Por el contrario, cuando se desenvuelve como desacreditable (en sus entornos familiares, vecinales o de crianza de sus hijos), la ocupación laboral se mantiene bajo secreto estricto, lo que genera una tensión emocional extenuante vinculada a la 'gestión de la información personal': la necesidad imperiosa de calcular cada palabra, ocultar horarios, disimular ingresos y sostener coartadas permanentes por miedo a ser descubierta y repudiada (Goffman, 1963/2009; Clemente Villar, 2020).",
        first_line_indent=0.5
    )
    add_body_p(doc,
        "Este desdoblamiento permanente de la identidad suele derivar en la internalización del estigma (autoestigma). De acuerdo con Nieto (2025) y Rodríguez (2015), cuando la mujer asimila los juicios morales de su entorno cultural, experimenta un profundo deterioro del autoconcepto, autoreproche, desvalorización personal y la creencia de no ser merecedora de afecto, cuidado ni protección estatal, lo cual se asocia etiológicamente con la cronicidad de episodios depresivos y crisis de ansiedad.",
        first_line_indent=0.5
    )
    
    add_section_heading(doc, "7.3. Condiciones de Vida, Violencia Estructural y Precariedad Cotidiana", level=2)
    add_body_p(doc,
        "El bienestar psicológico no puede desvincularse de las condiciones materiales en las cuales se reproduce la vida. La perspectiva de los Determinantes Sociales de la Salud Mental (Organización Mundial de la Salud; MinSalud, 2025) postula que las desigualdades estructurales, la precariedad habitacional, la informalidad laboral y la exposición a la violencia operan como potentes inductores de sufrimiento psíquico. En la Comuna 10 de Medellín, el espacio físico de la zona de tolerancia se encuentra atravesado por dinámicas de microtráfico, control territorial por estructuras armadas al margen de la ley, precariedad habitacional en inquilinatos de bajo costo y una completa carencia de seguridad social, prestaciones y garantías de cesantía o pensión (Cueto, 2024; Caracol Televisión, 2022).",
        first_line_indent=0.5
    )
    add_body_p(doc,
        "A esta precariedad socioeconómica se añade la continua violencia estructural y de género. Como señalan Escobar y Ramírez (2021) y Herráiz (2022), las trabajadoras sexuales son blanco recurrente de agresiones físicas, coacción patrimonial, abusos sexuales encubiertos y maltrato verbal por parte de diversos actores del escenario nocturno. La ausencia de un marco legal de regulación laboral que tutele sus condiciones reales de trabajo y la constante zozobra económica de depender del dinero recaudado día a día profundizan la sensación de indefensión aprendida y desesperanza aprendida, bloqueando la capacidad subjetiva de proyectar un futuro a mediano plazo (Cedeño et al., 2017; Jennings et al., 2009).",
        first_line_indent=0.5
    )
    
    add_section_heading(doc, "7.4. Modelo Transaccional del Estrés y Procesos de Afrontamiento (Lazarus & Folkman)", level=2)
    add_body_p(doc,
        "Para conceptualizar cómo las trabajadoras sexuales procesan y responden a las agresiones y demandas extremas de su entorno, el marco teórico adopta el Modelo Transaccional del Estrés y los Procesos de Afrontamiento de Richard Lazarus y Susan Folkman (1984). Este enfoque cognitivo-fenomenológico postula que el estrés psicológico no reside de forma exclusiva en el estímulo ambiental ni en la persona, sino en una relación transaccional evaluada por el individuo como desbordante de sus propios recursos de adaptación y como una amenaza directa a su bienestar.",
        first_line_indent=0.5
    )
    add_body_p(doc,
        "El modelo establece dos etapas cognitivas determinantes: la evaluación primaria, mediante la cual la trabajadora sexual valora si las interacciones en la zona de tolerancia (un cliente violento, un retén policial o una pérdida abrupta de ingresos) representan un daño, una pérdida o una amenaza grave; y la evaluación secundaria, donde examina qué opciones de afrontamiento posee para responder a dicha situación. Frente a la hostilidad del medio, los mecanismos de afrontamiento suelen clasificarse en dos vertientes: estrategias centradas en el problema (orientadas a modificar o alterar activamente la fuente de conflicto, tales como organizarse gremialmente, negociar tarifas de forma colectiva o acudir a asesoría legal) y estrategias centradas en la emoción (dirigidas a regular o adormecer el malestar afectivo)",
        first_line_indent=0.5
    )
    add_body_p(doc,
        "En la cotidianidad de Medellín, la escasez de alternativas institucionales empuja con frecuencia hacia un afrontamiento defensivo o evitativo: el aislamiento voluntario, la disociación psicológica durante el acto sexual mercantil o el consumo de sustancias psicoactivas como automedicación paliativa ante el dolor psíquico (Salinas et al., 2014; Mayordomo et al., 2016). En contraposición, las estrategias de afrontamiento adaptativas emergen primordialmente en el plano vincular de la resistencia compartida.",
        first_line_indent=0.5
    )
    
    add_section_heading(doc, "7.5. Resiliencia, Redes de Solidaridad entre Pares y Factores Protectores", level=2)
    add_body_p(doc,
        "Frente al escenario de vulnerabilidad, es imperativo reconocer la capacidad de agencia y resiliencia desarrollada por las trabajadoras sexuales. Siguiendo a Rodríguez (2014) y Mayordomo, Sales, Satorres y Meléndez (2016), la resiliencia no se define como una cualidad innata o pasiva de tolerancia al sufrimiento, sino como un proceso psicosocial activo de adaptación positiva, resignificación vital y reconstrucción subjetiva en medio de adversidades severas.",
        first_line_indent=0.5
    )
    add_body_p(doc,
        "En la zona de tolerancia de Medellín, las redes de solidaridad entre pares y el acompañamiento comunitario emergen como el principal factor protector frente a las agresiones y la patologización (García & Rodríguez, 2019; González, Castaño & Restrepo, 2018). Las mujeres construyen acuerdos informales de cuidado mutuo en la esquina ('echarse el ojo' entre compañeras para verificar que salgan sanas de los hoteles, alertar ante clientes identificados como violentos y apoyarse económicamente para el sustento diario o la compra de víveres). Asimismo, investigaciones como la de Nieto (2025) y Rueda Marroquín (2020) resaltan cómo la maternidad y la responsabilidad afectiva con sus hijos se constituyen en un poderoso anclaje de sentido que moviliza su resiliencia, permitiéndoles resignificar el sacrificio cotidiano como una demostración de cuidado familiar en lugar de una mera degradación personal.",
        first_line_indent=0.5
    )
    add_body_p(doc,
        "En términos de Goffman (1963/2009), estos espacios de encuentro entre iguales operan como verdaderos refugios donde el estigma se diluye temporalmente, posibilitando intercambios de confianza, desahogo emocional y fortalecimiento de la autoestima sin la presencia de la mirada punitiva o moralizadora de la sociedad.",
        first_line_indent=0.5
    )
    
    add_section_heading(doc, "7.6. Marco Contextual, Normativo y de Políticas Públicas Gubernamentales (2020–2024)", level=2)
    add_body_p(doc,
        "El análisis de las políticas públicas hacia el trabajo sexual en Colombia y en Medellín exige distinguir entre el marco constitucional garantista y la realidad operativa de los programas locales. En el ordenamiento jurídico superior, la Corte Constitucional de Colombia ha marcado precedentes fundamentales a través de sentencias hito: la Sentencia T-629 de 2010 reconoció por primera vez que el trabajo sexual lícito ejercido libremente por adultos goza de plenas garantías constitucionales y de protección contra el acoso policivo; la Sentencia T-594 de 2016 amparó los derechos fundamentales al trabajo, libre desarrollo de la personalidad y no discriminación de las trabajadoras sexuales en zonas de uso del suelo comercial; y la Sentencia T-073 de 2017 reiteró la obligación ineludible del Estado de diseñar políticas públicas de salud, prevención y superación de la pobreza sin enfoques punitivos.",
        first_line_indent=0.5
    )
    add_body_p(doc,
        "A nivel nacional, la Ley 1616 de 2013 (Ley de Salud Mental) y los protocolos del Ministerio de Salud y Protección Social (2025) ordenan garantizar la atención integral y prioritaria en salud mental a poblaciones en condición de alta vulnerabilidad psicosocial y víctimas de violencia de género. No obstante, al examinar la implementación distrital en Medellín durante el periodo 2020–2024 (bajo el Plan de Desarrollo 'Medellín Futuro' y la Política Pública de Salud Mental del Acuerdo Distrital 043 de 2016), se observan serias falencias de correspondencia territorial.",
        first_line_indent=0.5
    )
    add_body_p(doc,
        "Si bien la Secretaría de Inclusión Social, Familia y Derechos Humanos implementó la estrategia 'Por Mis Derechos' (Gómez, 2020), beneficiando a cerca de 850 ciudadanas en ejercicio de prostitución, su cobertura abarcó menos de una cuarta parte del universo real de la población vulnerable en la ciudad. Además, diagnósticos independientes elaborados por Médicos Sin Fronteras (2023) y la literatura local (Sierra Ospina et al., 2025; Laverde Rodríguez, 2014) constatan que la respuesta gubernamental continúa subordinada a una lógica de contención sanitaria epidemiológica y policial, existiendo una alarmante escasez de rutas de psicoterapia individual y grupal especializada, reparación del trauma y programas de inclusión laboral dignos y libres de estigma.",
        first_line_indent=0.5
    )
    
    add_section_heading(doc, "7.7. Sistema de Variables y Matriz de Categorías de Análisis", level=2)
    add_body_p(doc,
        "Dada la naturaleza cualitativa y documental de la monografía, el estudio estructura su campo analítico a través de una matriz inductivo-deductiva compuesta por cinco categorías centrales y sus correspondientes subcategorías temáticas, las cuales articulan los postulados teóricos con la evidencia empírica seleccionada:",
        first_line_indent=0.5
    )
    add_matrix_table(doc)
    doc.add_page_break()
    
    # -------------------------------------------------------------
    # PÁGINAS 19–22: 9. METODOLOGÍA (*)
    # -------------------------------------------------------------
    add_section_heading(doc, "9. Metodología (*)", level=1)
    
    add_section_heading(doc, "9.1 Diseño de la investigación", level=2)
    add_body_p(doc,
        "El presente estudio se desarrollará bajo un enfoque cualitativo, que permite comprender los significados, vivencias y procesos psicosociales que configuran la salud mental de las trabajadoras sexuales de la zona de tolerancia de Medellín en relación con las políticas públicas implementadas entre 2020 y 2024. Este enfoque es coherente con la pregunta de investigación, ya que se centra en interpretar experiencias subjetivas relacionadas con el estigma, el estrés, el afrontamiento y la resiliencia, más que en la medición estadística.",
        first_line_indent=0.5
    )
    add_body_p(doc,
        "En primer lugar, se parte de la pregunta de investigación central: “¿Cómo se relacionan las afectaciones en la salud mental de las trabajadoras sexuales de la zona de tolerancia de Medellín con las políticas públicas implementadas entre 2020 y 2024 para su atención y protección?”. A partir de esta pregunta, se delimita el contexto de estudio: la población se define como las trabajadoras sexuales de la zona de tolerancia de Medellín, el periodo temporal abarca los años 2020 a 2024, y el ámbito geográfico corresponde a la ciudad de Medellín, Colombia. Esta delimitación permite orientar la selección de documentos, entrevistas y análisis siguiendo un criterio temático, temporal y espacial claro.",
        first_line_indent=0.5
    )
    add_body_p(doc,
        "Para la fase de búsqueda de información, se procederá a realizar una revisión sistemática en bases de datos y fuentes institucionales. Se utilizarán plataformas académicas como SciELO, Redalyc, Scopus y Web of Science, así como repositorios institucionales universitarios (por ejemplo, repositorios de la UNAD, Universidad de Antioquia, EAFIT y otras universidades colombianas), donde se localizan tesis, trabajos de grado y estudios específicos sobre prostitución femenina, trabajo sexual, salud mental, estigma y políticas públicas. Además, se consultará la página oficial de la Alcaldía de Medellín, las secciones de Secretaría de Salud, Secretaría de Desarrollo Económico, informes de gestión, programas sociales y documentos normativos, junto con las páginas del Ministerio de Salud de Colombia y del Ministerio de Justicia para el contexto nacional. También se incluirán medios de comunicación y reportajes de prensa (Telemedellín, BBC, Razón Pública, entre otros) para comprender el debate público y la percepción social, aunque estos se tratarán como fuentes de apoyo contextual, no como datos empíricos centrales.",
        first_line_indent=0.5
    )
    add_body_p(doc,
        "La estrategia de búsqueda se organizará a partir de una combinación de palabras clave en español, por ejemplo, se utilizarán expresiones como “trabajadoras sexuales”, “prostitución femenina”, “trabajo sexual”, “salud mental”, “estigma”, “violencia de género”, “políticas públicas”, “Medellín”, “programa Por Mis Derechos”, “zona de tolerancia”, entre otras. Se aplicarán filtros por año (2020–2024), tipo de documento (artículos científicos, tesis, informes técnicos, planes estratégicos, decretos, resoluciones y documentos normativos) y se priorizará fuentes escritas en español, extendiendo a documentos en inglés sólo cuando resulten de especial relevancia empírica o metodológica.",
        first_line_indent=0.5
    )
    add_body_p(doc,
        "Sobre esta base documental se construirá el corpus de análisis, aplicando criterios de inclusión y exclusión de forma sistemática. Se incluirán estudios cualitativos, cuyo enfoque central sea la salud mental, el estigma, el trabajo sexual, las políticas públicas o el bienestar psicosocial de las trabajadoras sexuales, especialmente si están situados en Medellín. También se incorporarán documentos normativos, planes estratégicos de salud mental, resoluciones, programas específicos dirigidos a personas en actividades sexuales pagadas y reportes institucionales que describen la atención psicosocial a esta población. En cambio, se excluirán textos cuyo foco no sea la salud mental ni el trabajo sexual, como artículos centrados únicamente en VIH sin análisis psicológico, normativas que no sean de aplicación directa en Medellín o en el periodo 2020–2024, y contenidos de prensa puramente informativos o de opinión sin evidencia empírica ni análisis metodológico claro. Para asegurar transparencia, cada documento se registrará en una matriz digital (por ejemplo, en Excel o Google Sheets) con campos como título, autor, año, fuente, tipo de documento, enfoque, relevancia para la pregunta de investigación y criterio de inclusión o exclusión, de manera que todo el proceso sea trazable y revisable.",
        first_line_indent=0.5
    )
    add_body_p(doc,
        "En la fase de análisis de la información, se trabajará mediante un análisis documental crítico e interpretativo, articulando el enfoque teórico sobre estigma (Goffman), vida psicosocial, estrés, afrontamiento y resiliencia, para identificar cómo las políticas públicas explicitan o dejan de explicitar estos procesos en la vida de las trabajadoras sexuales. Se prestará particular atención a la forma como se mencionan la estigmatización, el acceso a la salud mental, las barreras institucionales y las estrategias de acompañamiento, así como a la articulación de componentes de resiliencia, redes de apoyo y equidad de género.",
        first_line_indent=0.5
    )
    add_body_p(doc,
        "Finalmente, se implementará un procedimiento riguroso para verificar la veracidad y fiabilidad de la información. Para las fuentes académicas, se tendrá en cuenta si el documento proviene de una revista con revisión por pares, si la metodología está descrita de forma clara y si los resultados se apoyan en datos empíricos sistemáticos. En el caso de tesis y trabajos de grado, se valorará la pertinencia del diseño metodológico, el detalle de la recolección de datos y la consistencia de los hallazgos. Para las fuentes institucionales y normativas, se privilegiarán los documentos oficiales publicados en sitios gubernamentales verificables, contrastando versiones entre distintas plataformas para evitar errores de formato o copia incompleta. Los reportajes de prensa se utilizarán de forma crítica, cruzando sus datos con fuentes oficiales o académicas, y explicar su carácter contextual y periodístico, no empírico. De este modo, la metodología garantiza que el corpus seleccionado no solo sea relevante para la pregunta de investigación, sino también verídico y sólidamente fundamentado en documentos serios y revisables.",
        first_line_indent=0.5
    )
    
    add_section_heading(doc, "9.2 Fuentes de información", level=2)
    add_body_p(doc,
        "Las fuentes de información corresponden a material secundario de carácter académico e institucional, tales como:",
        first_line_indent=0.5
    )
    add_bullet_item(doc, "Artículos científicos")
    add_bullet_item(doc, "Tesis de pregrado y posgrado")
    add_bullet_item(doc, "Investigaciones académicas")
    add_bullet_item(doc, "Documentos gubernamentales e institucionales")
    add_bullet_item(doc, "Informes técnicos")
    add_bullet_item(doc, "Políticas públicas")
    
    add_body_p(doc,
        "Estos documentos se consultarán en bases de datos académicas y repositorios digitales de alta confiabilidad, entre los cuales se incluyen:",
        first_line_indent=0.5,
        space_after=3
    )
    add_bullet_item(doc, "Google Scholar")
    add_bullet_item(doc, "SciELO")
    add_bullet_item(doc, "Redalyc")
    add_bullet_item(doc, "Dialnet")
    add_bullet_item(doc, "Repositorios institucionales de universidades colombianas")
    
    add_section_heading(doc, "9.3 Criterios de inclusión y exclusión", level=2)
    add_section_heading(doc, "Criterios de inclusión", level=3)
    add_body_p(doc, "Se incluirán investigaciones que cumplan con los siguientes criterios:", first_line_indent=0.5, space_after=3)
    add_bullet_item(doc, "Estudios publicados entre 2020 y 2024.")
    add_bullet_item(doc, "Investigaciones relacionadas con salud mental y trabajo sexual.")
    add_bullet_item(doc, "Documentos académicos e institucionales sobre Medellín y Colombia.")
    add_bullet_item(doc, "Estudios con enfoque psicológico, social o de salud pública.")
    add_bullet_item(doc, "Artículos científicos, tesis e informes institucionales con validez académica verificable.")
    add_bullet_item(doc, "Publicaciones en revistas indexadas o repositorios institucionales.")
    
    add_section_heading(doc, "Criterios de exclusión", level=3)
    add_body_p(doc, "Se excluirán:", first_line_indent=0.5, space_after=3)
    add_bullet_item(doc, "Documentos sin relación directa con la salud mental o el trabajo sexual.")
    add_bullet_item(doc, "Fuentes sin respaldo académico o institucional verificable.")
    add_bullet_item(doc, "Investigaciones fuera del rango temporal establecido.")
    add_bullet_item(doc, "Documentos con información incompleta o sin validez científica.")
    
    add_section_heading(doc, "9.4 Técnicas de recolección y análisis de la información", level=2)
    add_body_p(doc,
        "La recolección de información se realizará mediante la búsqueda, selección y revisión crítica de documentos relacionados con el objeto de estudio. Para ello se utilizarán palabras clave como: trabajo sexual, salud mental, estigma, vulnerabilidad psicosocial, políticas públicas, Medellín, afrontamiento y resiliencia.",
        first_line_indent=0.5
    )
    add_body_p(doc,
        "Posteriormente, la información se organizará a partir de categorías de análisis previamente definidas, entre las cuales se encuentran:",
        first_line_indent=0.5,
        space_after=3
    )
    add_bullet_item(doc, "Impacto psicológico")
    add_bullet_item(doc, "Estigmatización y discriminación")
    add_bullet_item(doc, "Condiciones socioeconómicas")
    add_bullet_item(doc, "Estrategias de afrontamiento")
    add_bullet_item(doc, "Políticas públicas")
    add_bullet_item(doc, "Salud mental")
    
    add_body_p(doc,
        "El análisis de la información se desarrollará mediante un análisis de contenido de tipo interpretativo, a partir de la lectura crítica, comparativa y sistemática de las fuentes seleccionadas. Este proceso permitirá identificar relaciones, coincidencias, tensiones y vacíos existentes entre las afectaciones psicológicas reportadas en la literatura y las políticas públicas orientadas a esta población.",
        first_line_indent=0.5
    )
    
    add_section_heading(doc, "9.5 Consideraciones éticas", level=2)
    add_body_p(doc,
        "La investigación se fundamenta en principios éticos relacionados con el respeto, la confidencialidad y el uso responsable de la información académica e institucional consultada. Debido a que se trata de una revisión documental, no se realizarán intervenciones directas con población participante.",
        first_line_indent=0.5
    )
    add_body_p(doc,
        "Asimismo, se garantiza el adecuado reconocimiento de autores y fuentes mediante el uso correcto de normas de citación y referencias bibliográficas, evitando cualquier forma de plagio o uso indebido de la información.",
        first_line_indent=0.5
    )
    doc.add_page_break()
    
    # -------------------------------------------------------------
    # PÁGINAS 23–27: 18. BIBLIOGRAFÍA (APA 7.ª EDICIÓN)
    # -------------------------------------------------------------
    add_section_heading(doc, "18. Bibliografía (Normas APA 7.ª edición)", level=1)
    
    references_list = [
        "Álvarez, E. (2017). Desarrollo psicológico en supervivientes de trata con fines de explotación sexual (Tesis Doctoral, Universidad Autónoma de Madrid). Repositorio UAM. https://repositorio.uam.es/bitstream/handle/10486/678902/barrio_alvarez_elena_del.pdf",
        "Álvarez, M. (2021a). Condiciones laborales y salud mental en trabajadores sexuales de Medellín. Editorial Universidad de Antioquia.",
        "Álvarez, M. (2021b). Políticas públicas y abordaje psicosocial del trabajo sexual en contextos de vulnerabilidad urbana. Revista Iberoamericana de Salud y Sociedad, 15(2), 114–129.",
        "Bermúdez Pabón, Á., Gaviria Gómez, A. M., & Fernández Vélez, H. (2007). Estilos psicológicos de personalidad en un grupo de mujeres adultas jóvenes dedicadas a la prostitución 'prepago' en la ciudad de Medellín. Terapia Psicológica, 25(1), 25–37. https://doi.org/10.4067/S0718-48082007000100002",
        "Caracol Televisión. (2022). Prostitución en Medellín: Un recorrido aterrador y un crudo testimonio de vida [Reportaje documental, programa Los Informantes]. YouTube. https://www.youtube.com/watch?v=ZNnRzP4elQo",
        "Ceballos-Ospino, G., Arévalo-Hoyos, C., Hernández-Bolaño, G., & Suárez-Colorado, Y. (2013). Autoestima, depresión, consumo de alcohol y cigarrillo en mujeres que ejercen la prostitución en las ciudades de Santa Marta y Riohacha (Colombia). Duazary, 10(1), 43–51. https://doi.org/10.21676/2389783X.492",
        "Cedeño, H. A., Delgado, L. S., Morales, J. C., & Ormazábal, M. Á. (2017). Depresión como consecuencia de la prostitución femenina: caso burdeles de Rocafuerte, Ecuador. Journal of Education and Human Development, 6(1), 89–98.",
        "Celis-Lozano, A., Cristancho-Gómez, S. M., Valero-Acevedo, N., & Lafaurie-Villamil, M. M. (2021). Prostitución femenina y género en el contexto colombiano: un estado del arte (2010-2019). Revista Colombiana de Ciencias Sociales, 12(1), 279–309. https://doi.org/10.21501/22161201.3356",
        "Clemente Villar, C. (2020). El impacto psicológico del estigma de prostituta. RELIES: Revista del Laboratorio Iberoamericano para el Estudio Sociohistórico de las Sexualidades, (4), 152–172. https://doi.org/10.46661/relies.5106",
        "Colombia Médica. (2020). Estigmatización de las trabajadoras sexuales: Influencias en la salud mental y el acceso a servicios de salud. Colombia Médica, 51(3), 378–382.",
        "Correa Porras, B., Restrepo Loaiza, A., & Rodríguez Porras, J. (2021). Relación entre la satisfacción sexual y autoestima en un grupo de mujeres que trabajan como modelos webcam en Medellín (Trabajo de grado, Tecnológico de Antioquia). Repositorio TdeA. https://dspace.tdea.edu.co/handle/tdea/2206",
        "Corte Constitucional de Colombia. (2010). Sentencia T-629 de 2010 (M.P. Juan Carlos Henao Pérez). Gaceta de la Corte Constitucional.",
        "Corte Constitucional de Colombia. (2016). Sentencia T-594 de 2016 (M.P. Alberto Rojas Ríos). Gaceta de la Corte Constitucional.",
        "Corte Constitucional de Colombia. (2017). Sentencia T-073 de 2017 (M.P. Aquiles Arrieta Gómez). Gaceta de la Corte Constitucional.",
        "Cueto, J. (2024, 15 de marzo). El Poblado, el exclusivo sector de Medellín que se convirtió en el epicentro del turismo sexual y la explotación que desborda la ciudad. BBC News Mundo. https://www.bbc.com/mundo/articles/c51ne39k762o",
        "Del Canto, E., & Silva Silva, A. (2013). Metodología cuantitativa y cualitativa: Abordaje desde la complementariedad en ciencias sociales. Revista de Ciencias Sociales, 141, 25–34.",
        "Escobar, F., & Ramírez, D. (2021). Prevalencia y factores asociados al trastorno de estrés postraumático en mujeres trabajadoras sexuales. Revista Colombiana de Salud Pública, 46(1), e1363.",
        "Fernández, M. J. (2011). Calidad de vida y salud de las mujeres que ejercen la prostitución (Tesis Doctoral en Psicología, Universidad de Oviedo). Repositorio Uniovi. https://digibuo.uniovi.es/dspace/bitstream/handle/10651/12712/TD_MariaJesusFernandezOllero.pdf",
        "Figueroa-Ospina, M. E., Laverde-Zuleta, M., Perdomo-Ochoa, M. P., Zea-Jiménez, K. J., Agudelo-Suárez, A. A., & Martínez-Gómez, M. L. (2023). Perceptions about health (physical, mental and oral) in women in situation of prostitution in Medellín. Revista de la Facultad de Odontología de la Universidad de Antioquia, 35(1), 6–24. https://doi.org/10.17533/udea.rfo.v35n1a1",
        "García, L., & Rodríguez, S. (2019). Redes de apoyo y afrontamiento en trabajadoras sexuales en contextos de precariedad. Salud e Intervención Social, 24(2), 213–230.",
        "Godoy, M. (2024, 2 de abril). Así es la explotación sexual y el contexto de vulnerabilidad en Medellín. Razón Pública. https://razonpublica.com/asi-la-explotacion-sexual-menores-medellin/",
        "Goffman, E. (1963/2009). Estigma: La identidad deteriorada (F. Guasch, Trad.). Amorrortu Editores.",
        "Gómez, A. (2020, 2 de junio). Alcaldía de Medellín continúa proyecto para atender a 850 ciudadanos en ejercicio de prostitución: Programa 'Por Mis Derechos'. Sala de Prensa Alcaldía de Medellín. https://www.medellin.gov.co/es/sala-de-prensa/noticias/alcaldia-de-medellin-continuaproyecto-para-atender-850-ciudadanos-en-ejercicio-de-prostitucion/",
        "Gómez Vargas, M., Galeano Higuita, C., & Jaramillo Muñoz, D. A. (2015). El estado del arte: Una metodología de investigación. Revista Colombiana de Ciencias Sociales, 6(2), 423–442. https://doi.org/10.21501/22161201.1718",
        "González, A., Castaño, V., & Restrepo, I. (2018). Estrategias de afrontamiento y resiliencia en mujeres que ejercen el trabajo sexual. Psicología Social y Comunitaria, 11(3), 45–62.",
        "Guillén, L. (2022). Los problemas mentales y físicos de la prostitución: una revisión de la base de datos PubMed. Dossier Textos y Contextos, Universidad Central del Ecuador, 1(25), 41–56. https://doi.org/10.29166/tyc.v1i25.3582",
        "Gutiérrez, A. (2017). Prostitución: construcción psicosocial de la coacción como consentimiento (Tesis Doctoral, Universidad Pontificia de Salamanca). Repositorio UPSA. https://summa.upsa.es/viewer.vm?id=48451",
        "Gutiérrez García, A. (2013). La actualidad del abordaje de la prostitución femenina en la prensa diaria española. Estudios sobre el Mensaje Periodístico, 19(Esp.), 823–831. https://doi.org/10.5209/rev_ESMP.2013.v19.42165",
        "Gutiérrez, M. (2013). Factores de riesgo que conllevan a ejercer la prostitución en mujeres entre 18 y 25 años de edad del área norte de la ciudad de León – Nicaragua (Monografía de licenciatura, Universidad Nacional Autónoma de Nicaragua). Repositorio UNAN-León. http://riul.unanleon.edu.ni:8080/jspui/bitstream/123456789/6269/1/224748.pdf",
        "Herráiz, M. (2022). Problemática social y emocional de mujeres en contexto de trabajo sexual. Revista de Psicología Legal y Forense, 38(2), 119–137.",
        "Jennings, L., Parra-Medina, D., Hilfinger Messias, D. K., & McLoughlin, K. (2009). Hacia una teoría social crítica del empoderamiento de la juventud. En N. Wallerstein (Ed.), Youth participation and community change (pp. 31–55). The Haworth Press.",
        "Laverde Rodríguez, C. A. (2014). Aportaciones desde una perspectiva socio-jurídica al debate del trabajo sexual en Colombia. Debate Feminista, 50, 321–330. https://doi.org/10.1016/S0188-9478(16)30140-2",
        "Lazarus, R. S., & Folkman, S. (1984). Stress, appraisal, and coping. Springer Publishing Company.",
        "Mayordomo, T., Viguer, P., Sales, A., Satorres, E., & Meléndez, J. C. (2016). Resilience and coping as predictors of well-being in adults. The Journal of Psychology, 150(7), 809–821. https://doi.org/10.1080/00223980.2016.1203276",
        "Médicos Sin Fronteras [MSF]. (2023, 2 de junio). Día internacional de la trabajadora sexual: El desafío de romper con los estigmas en la atención en salud en Medellín. MSF Colombia. https://www.msf.org.co",
        "Mingorance Rosa, L. (2015). Los efectos del estigma de la prostitución en la mujer (Trabajo de fin de grado, Universitat de les Illes Balears). Repositorio UIB. https://dspace.uib.es/xmlui/bitstream/handle/11201/1177/Mingorance%20Rosa,%20Laura.pdf",
        "Ministerio de Igualdad y Equidad. (2024). Garantías, derechos y alternativas de vida para personas que ejercen actividades sexuales pagadas: Lineamientos de política nacional 2024. MinIgualdad Colombia. https://www.minigualdadyequidad.gov.co",
        "Ministerio de Salud y Protección Social. (2025). Ruta de atención integral para víctimas de violencia de género y lineamientos de salud mental comunitaria. MinSalud Colombia. https://www.minsalud.gov.co",
        "Montoya Restrepo, L. F., & Morales Mesa, S. A. (2015). La prostitución, una mirada desde sus actores en el centro de Medellín. Revista Colombiana de Ciencias Sociales, 6(1), 59–71. https://doi.org/10.21501/22161201.1534",
        "Nieto, N. Y. (2025). La prostitución femenina en Medellín y autoestima: un enfoque desde la psicología (Monografía de grado, Universidad Nacional Abierta y a Distancia - UNAD). Repositorio Institucional UNAD. https://repository.unad.edu.co/handle/10596/73476",
        "Panesso, K., & Arango, J. (2017). La autoestima, proceso humano de construcción subjetiva. Psyconex: Revista Electrónica del Departamento de Psicología Universidad de Antioquia, 9(14), 1–9.",
        "Pérez, H. (2019). Autoestima, teoría y su relación con el bienestar subjetivo y el éxito personal. Alternativas en Psicología, (41), 42–55. https://www.alternativas.me",
        "Rodríguez, M. (2015). Factores psicosociales asociados a la prostitución: la percepción social y de las trabajadoras sexuales (Tesis Doctoral, Universidad de Salamanca). Gredos USAL. https://gredos.usal.es/bitstream/handle/10366/128785/DPETP_RodriguezVilloria_Factorespsicosociales.pdf",
        "Rodríguez, R. (2014). La resiliencia y su instauración en el discurso de la psicología: Un análisis crítico. Vanguardia Psicológica, 5(1), 60–75.",
        "Rojas-Barahona, C., Zegers, B., & Förster, C. (2008). La escala de autoestima de Rosenberg: Validación para Chile en una muestra de jóvenes adultos, adultos y adultos mayores. Revista Médica de Chile, 137(6), 791–800. https://doi.org/10.4067/S0034-98872009000600009",
        "Rueda Marroquín, A. (2020). Salud mental y prostitución: un enfoque psicosocial (Trabajo de fin de grado, Universidad de Cádiz). Repositorio RODIN. https://rodin.uca.es/bitstream/handle/10498/23353/RODIN%20ANDREA%20RUEDA%20MARROQUIN.pdf",
        "Salinas, C., Padilla, N., Ruiz, M., & Vera, A. (2014). La autoestima como factor estresor intrapersonal para el consumo de alcohol en trabajadoras sexuales. Enfermería Global, 13(33), 85–97. https://doi.org/10.6018/eglobal.13.1.161101",
        "Sau, V. (2000). Diccionario ideológico feminista (Vol. 1). Icaria Editorial.",
        "Sierra Ospina, D., Bustamante Navarro, V., & Vasco Gallo, I. (2025). Experiencias en el acceso a los servicios de salud y su influencia en las prácticas de autocuidado, estrategias de afrontamiento y condiciones sociales de las mujeres trabajadoras sexuales de La Candelaria, comuna 10 de Medellín (Tesis de pregrado, Universidad de Antioquia). Repositorio UdeA. https://hdl.handle.net/10495/45650",
        "Suárez, J. (2014). La autoestima de las trabajadoras sexuales y el efecto en su entorno familiar en la Parroquia San Carlos del Cantón Quevedo en el año 2014 (Tesis de licenciatura, Universidad Técnica de Babahoyo). Repositorio UTB. http://dspace.utb.edu.ec/bitstream/handle/49000/3326/T-UTB-FCJSE-PSICLIN000061.pdf",
        "Tubert Blanch, M. (2013). La prostitución: análisis discursivo y psicosocial (Tesis de grado, Universidad de Barcelona). Dipòsit Digital UB. https://diposit.ub.edu/dspace/bitstream/2445/56311/1/Montserrat%20Tubert%20Blanch.pdf",
        "Zunica Fernández, E. (2023). ÁGORA: Programa de intervención psicosocial dirigido a mujeres que ejercen la prostitución en calle (Trabajo de fin de grado, Universidad Miguel Hernández). Repositorio UMH. https://dspace.umh.es/bitstream/11000/30146/1/TFG%20Elia%20Zunica%20Fernandez.pdf"
    ]
    
    for ref in references_list:
        add_reference_p(doc, ref)
        
    # Rutas de guardado
    out_paths = [
        r"C:\Users\lenovo\Downloads\Anteproyecto_Impactos_Psicologicos_Medellin_Primera_Parte_Oficial.docx",
        r"C:\Users\lenovo\Desktop\Anteproyecto_Impactos_Psicologicos_Medellin_Primera_Parte_Oficial.docx"
    ]
    
    for op in out_paths:
        try:
            doc.save(op)
            print(f"Document saved successfully at: {op}")
        except Exception as e:
            print(f"Error saving to {op}: {e}")
            
    # Intentar guardar también en Desktop/trabajos andres si existe
    andres_dir = r"C:\Users\lenovo\Desktop\trabajos andres"
    if os.path.exists(andres_dir):
        doc.save(os.path.join(andres_dir, "Anteproyecto_Impactos_Psicologicos_Medellin_Primera_Parte_Oficial.docx"))
        print(f"Document saved in: {andres_dir}")

if __name__ == "__main__":
    build_complete_anteproyecto()
