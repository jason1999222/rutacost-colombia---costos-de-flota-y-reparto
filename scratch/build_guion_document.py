# -*- coding: utf-8 -*-
r"""
Generador del Guion de Exposición Oficial:
'GUION DE EXPOSICIÓN: LA CULTURA DEL CUIDADO'
Presentado por: Bertha Inés Medina Hernández

Contiene el discurso completo paso a paso (qué decir diapositiva por diapositiva),
apoyo visual correspondiente, acotaciones de voz y tiempo sugerido.
"""

import docx
from docx.shared import Inches, Pt, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.enum.table import WD_TABLE_ALIGNMENT
from docx.oxml import OxmlElement, parse_xml
from docx.oxml.ns import nsdecls

COLOR_BLACK = RGBColor(0, 0, 0)
COLOR_TEXT = RGBColor(35, 35, 35)
COLOR_ROSE = RGBColor(190, 24, 93)   # Rose 700
COLOR_TEAL = RGBColor(13, 148, 136)  # Teal 600

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

def set_table_borders(table, color="FBCFE8", sz="6"):
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

def add_p(doc, text="", bold=False, italic=False, font_size=10, color=COLOR_TEXT, align=WD_ALIGN_PARAGRAPH.JUSTIFY, space_before=0, space_after=4.5):
    p = doc.add_paragraph()
    p.alignment = align
    p.paragraph_format.space_before = Pt(space_before)
    p.paragraph_format.space_after = Pt(space_after)
    p.paragraph_format.line_spacing = 1.15
    if text:
        r = p.add_run(text)
        r.bold = bold
        r.font.italic = italic
        r.font.name = "Arial"
        r.font.size = Pt(font_size)
        r.font.color.rgb = color
    return p

def add_heading_1(doc, text, space_before=16, space_after=4):
    p = doc.add_paragraph()
    p.alignment = WD_ALIGN_PARAGRAPH.LEFT
    p.paragraph_format.space_before = Pt(space_before)
    p.paragraph_format.space_after = Pt(space_after)
    p.paragraph_format.keep_with_next = True
    r = p.add_run(text)
    r.bold = True
    r.font.name = "Arial"
    r.font.size = Pt(13)
    r.font.color.rgb = COLOR_BLACK
    return p

def add_heading_2(doc, text, space_before=10, space_after=3):
    p = doc.add_paragraph()
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

def add_callout(doc, text, title=""):
    tbl = doc.add_table(rows=1, cols=1)
    tbl.alignment = WD_TABLE_ALIGNMENT.CENTER
    cell = tbl.rows[0].cells[0]
    cell.width = Inches(6.5)
    set_cell_background(cell, "FFF1F2")
    set_cell_margins(cell, top=120, bottom=120, left=160, right=160)
    
    # Border on left only
    tcPr = cell._tc.get_or_add_tcPr()
    borders = parse_xml(f'''
        <w:tcBorders {nsdecls("w")}>
            <w:top w:val="none"/>
            <w:left w:val="single" w:sz="18" w:space="0" w:color="BE185D"/>
            <w:bottom w:val="none"/>
            <w:right w:val="none"/>
        </w:tcBorders>
    ''')
    tcPr.append(borders)

    p = cell.paragraphs[0]
    p.alignment = WD_ALIGN_PARAGRAPH.JUSTIFY
    p.paragraph_format.space_before = Pt(0)
    p.paragraph_format.space_after = Pt(0)
    p.paragraph_format.line_spacing = 1.15
    if title:
        rt = p.add_run(title + "\n")
        rt.bold = True
        rt.font.name = "Arial"
        rt.font.size = Pt(10)
        rt.font.color.rgb = COLOR_ROSE
    rc = p.add_run(text)
    rc.font.italic = True
    rc.font.name = "Arial"
    rc.font.size = Pt(9.5)
    rc.font.color.rgb = COLOR_TEXT

    # Empty space after table
    p_sp = doc.add_paragraph()
    p_sp.paragraph_format.space_before = Pt(0)
    p_sp.paragraph_format.space_after = Pt(4)

def build_guion():
    doc = docx.Document()

    # Configuración de márgenes estándar 2.54 cm
    for section in doc.sections:
        section.top_margin = Inches(1.0)
        section.bottom_margin = Inches(1.0)
        section.left_margin = Inches(1.0)
        section.right_margin = Inches(1.0)

    # PORTADA / ENCABEZADO
    add_heading_1(doc, "GUION DE EXPOSICIÓN ORAL: LA CULTURA DEL CUIDADO", space_before=0, space_after=2)
    add_p(doc, "Documento de Apoyo para la Presentación Visual Interactiva Paso a Paso", bold=True, font_size=10.5, color=COLOR_ROSE, space_after=6)
    
    # Ficha técnica
    tbl_meta = doc.add_table(rows=4, cols=2)
    tbl_meta.alignment = WD_TABLE_ALIGNMENT.CENTER
    set_table_borders(tbl_meta, color="CBD5E1", sz="4")
    
    meta_rows = [
        ("Expositora:", "Bertha Inés Medina Hernández"),
        ("Tema:", "La Cultura del Cuidado: Ética, Bienestar y Corresponsabilidad"),
        ("Duración Estimada:", "15 a 20 minutos (aprox. 1.5 a 2 minutos por diapositiva)"),
        ("Recurso de Apoyo:", "Presentación Interactiva HTML5 con Ilustraciones Cartoon")
    ]
    for i, (k, v) in enumerate(meta_rows):
        row = tbl_meta.rows[i]
        make_row_cant_split(row)
        c0, c1 = row.cells
        c0.width = Inches(2.2)
        c1.width = Inches(4.3)
        set_cell_background(c0, "F8FAFC")
        set_cell_margins(c0, top=60, bottom=60, left=100, right=100)
        set_cell_margins(c1, top=60, bottom=60, left=100, right=100)
        
        p0 = c0.paragraphs[0]
        r0 = p0.add_run(k)
        r0.bold = True
        r0.font.name = "Arial"
        r0.font.size = Pt(9.5)
        
        p1 = c1.paragraphs[0]
        r1 = p1.add_run(v)
        r1.font.name = "Arial"
        r1.font.size = Pt(9.5)

    add_p(doc, "", space_after=6)

    # INTRODUCCIÓN GENERAL Y RECOMENDACIONES
    add_heading_2(doc, "Instrucciones de Oratoria y Manejo del Espacio")
    add_p(doc, 
          "Este guion contiene las palabras exactas y la ruta narrativa que Bertha Inés Medina Hernández seguirá durante la presentación. "
          "Cada diapositiva cuenta con su objetivo comunicativo, la descripción del apoyo gráfico en pantalla, las acotaciones corporales y de voz "
          "(entre corchetes en cursiva) y el discurso sugerido para conectar emocionalmente con el auditorio.", 
          font_size=9.5)

    # DESARROLLO DIAPOSITIVA POR DIAPOSITIVA
    slides_guion = [
        (
            "Diapositiva 1: Portada y Bienvenida",
            "1.5 minutos",
            "Ilustración editorial moderna para adultos de una comunidad diversa y elegante reunida en una sala acogedora bajo guirnaldas botánicas y luces cálidas en tonos pastel rosado, lavanda y crema, con el nombre de Bertha Inés Medina Hernández destacado.",
            "[Sonreír con calidez, mirar al auditorio con serenidad y abrir las manos en señal de bienvenida]\n\n"
            "«Muy buenos días a todas y todos los presentes. Mi nombre es Bertha Inés Medina Hernández, y hoy tengo el profundo honor y la inmensa alegría de compartir con ustedes una reflexión que no solo toca nuestra mente, sino que interpela directamente nuestro corazón: La Cultura del Cuidado.\n\n"
            "[Hacer una pausa breve y señalar la ilustración en pantalla]\n\n"
            "Como pueden observar en la imagen que nos acompaña, el cuidado no es una teoría fría ni un listado de tareas pendientes; el cuidado es ese hilo invisible y dorado que nos une como seres humanos, que nos permite sonreír, protegernos y construir comunidades donde nadie se quede solo. Hoy los invito a realizar un recorrido sensible por tres dimensiones fundamentales: el cuidado de nosotras mismas, el cuidado de quienes nos rodean y el cuidado de nuestra hermosa Casa Común. Sean todos bienvenidos a este espacio de encuentro y aprendizaje mutuo.»"
        ),
        (
            "Diapositiva 2: ¿Qué es la Cultura del Cuidado?",
            "1.5 a 2 minutos",
            "Tres tarjetas interactivas en tonos pastel con iconografía moderna: Modo de Ser Humano (01), Vencer la Indiferencia (02) y Corresponsabilidad (03), acompañadas de la cita célebre de Leonardo Boff.",
            "[Cambiar de diapositiva, modular la voz en tono reflexivo y pausado]\n\n"
            "«Para comenzar a adentrarnos en este tema, quiero hacerles una pregunta sencilla: ¿qué significa realmente cuidar? Muchas veces pensamos que cuidar es solo una obligación médica, o algo que hacemos cuando alguien se enferma. Pero el filósofo Leonardo Boff nos enseña algo mucho más profundo: el cuidado es el modo esencial de ser del ser humano.\n\n"
            "[Enfatizar con convicción]\n\n"
            "Pensemos por un instante: ninguno de los que estamos aquí sentados habría sobrevivido si al nacer no hubiésemos recibido el cuidado constante, amoroso y paciente de una madre, de una abuela o de una familia que nos alimentó y nos abrigó. Por eso, el cuidado no es algo que hacemos de vez en cuando; es la condición misma que nos mantiene vivos.\n\n"
            "En segundo lugar, la cultura del cuidado es el antídoto contra el peor mal de nuestro tiempo: la indiferencia. Vivimos corriendo, pegados a una pantalla, muchas veces sin mirar a los ojos a la persona que tenemos al lado. Cuidar es detener el afán y reconocer que la otra persona también siente, se cansa y necesita una mano amiga.\n\n"
            "Y en tercer lugar, el cuidado es una corresponsabilidad viva. No podemos esperar a que 'alguien más' solucione las cosas o que la mamá o la persona del aseo carguen con todo. El cuidado es un pacto comunitario donde todos ponemos nuestra parte.»"
        ),
        (
            "Diapositiva 3: El Triángulo del Cuidado (Las Tres Dimensiones)",
            "1.5 minutos",
            "Diagrama editorial conceptual para adultos mostrando el equilibrio armónico entre Autocuidado (Mente y Descanso), Cuidado del Otro (Conexión humana) y Ecocuidado (Cuidado de la Naturaleza), junto a 3 tarjetas descriptivas.",
            "[Señalar los tres bloques con un gesto armónico]\n\n"
            "«Para entender cómo poner en práctica esta cultura en nuestra vida cotidiana, les propongo este modelo que llamamos El Triángulo del Cuidado. Como todo triángulo, si una de sus partes se rompe o se descuida, la estructura completa pierde su equilibrio.\n\n"
            "La primera dimensión es el Autocuidado, es decir, el cuidado de sí misma. Es la raíz, el punto de partida indispensable.\n\n"
            "La segunda dimensión es el Cuidado del Otro, que representa nuestras relaciones interpersonales, la familia, los amigos y los compañeros de trabajo.\n\n"
            "Y la tercera dimensión es el Ecocuidado, que abarca el respeto y la preservación de nuestro entorno natural y los espacios comunes que compartimos.\n\n"
            "[Mirar al público y enfatizar con dulzura]\n\n"
            "A continuación, vamos a profundizar en cada una de estas tres dimensiones, porque cuando aprendemos a cuidarnos por dentro, cuidar a los demás y al planeta se vuelve un acto natural de amor.»"
        ),
        (
            "Diapositiva 4: Dimensión 1 - El Autocuidado",
            "2 minutos",
            "Ilustración editorial sofisticada de una mujer madura descansando plácidamente en un sillón con té caliente, libro y plantas de interior, acompañada de 4 tarjetas de hábitos conscientes: Descanso Reparador, Aprender a Decir «NO», Salud Emocional y Autocompasión.",
            "[Bajar levemente el tono, adoptando una voz íntima y comprensiva]\n\n"
            "«Entremos en la primera dimensión: El Autocuidado. Miren con atención la imagen en pantalla: nos muestra a una mujer disfrutando de una taza de té, abrigada, rodeada de sus plantas, en total calma.\n\n"
            "¿Cuántas veces nos sentimos culpables por detenernos a descansar? A muchas de nosotras nos enseñaron que descansar es 'perder el tiempo' o que una mujer buena debe sacrificarse hasta quedar exhausta. Hoy quiero decirles con total claridad: el autocuidado no es egoísmo ni es vanidad; es una necesidad vital.\n\n"
            "[Hacer una pausa de 2 segundos para permitir que la frase cale]\n\n"
            "Nadie puede dar agua fresca si su propio cántaro está vacío. Si nosotras estamos agotadas, enfermas, estresadas y sin energía, ¿qué calidad de paciencia y cariño le vamos a ofrecer a nuestros hijos, a nuestra pareja o en nuestro trabajo?\n\n"
            "Cuidarse a sí misma implica cuatro compromisos muy concretos: primero, respetar las horas de sueño y descanso del cuerpo; segundo, aprender el poder sanador de decir 'NO' a compromisos que sobrepasan nuestras fuerzas sin sentirnos malas personas; tercero, buscar momentos diarios de silencio y paz interior; y cuarto, tratarnos a nosotras mismas con la misma compasión y ternura con la que solemos tratar a quienes amamos.»"
        ),
        (
            "Diapositiva 5: Dimensión 2 - El Cuidado del Otro",
            "2 minutos",
            "Ilustración editorial de dos mujeres adultas en un sofá compartiendo una conversación empática tomadas de las manos, con 4 tarjetas sobre escucha atenta, palabras que sanan, apoyo en la fragilidad y dignificación del cuidado.",
            "[Señalar la imagen del abrazo con una sonrisa empática]\n\n"
            "«Pasemos ahora a la segunda dimensión: El Cuidado del Otro. La imagen que ven refleja lo que ocurre cuando dos almas se encuentran en el buen trato: un abrazo sincero donde sobran las palabras duras y abunda la aceptación.\n\n"
            "La psicóloga Carol Gilligan revolucionó las ciencias sociales al formular la Ética del Cuidado. Ella nos demostró que la verdadera madurez humana no consiste en competir para ver quién es más fuerte o quién tiene más poder, sino en la capacidad de tejer relaciones basadas en la empatía y la compasión.\n\n"
            "[Detallar los puntos clave]\n\n"
            "¿Cómo cuidamos al otro en el día a día? Cuidamos al otro cuando lo escuchamos de verdad, mirándolo a los ojos, sin estar revisando el teléfono celular mientras nos habla. Cuidamos al otro cuando usamos palabras que acarician y edifican en lugar de palabras que hieren o descalifican.\n\n"
            "Y algo muy importante: cuidar al otro exige visibilizar y agradecer las tareas de cuidado en el hogar y en la sociedad. La comida servida, la ropa limpia, el cuidado de los abuelitos y de los niños no ocurren por arte de magia; son horas de amor y esfuerzo que sostienen al mundo todos los días.»"
        ),
        (
            "Diapositiva 6: Dimensión 3 - El Ecocuidado",
            "2 minutos",
            "Ilustración editorial de una mujer y un hombre adultos en un invernadero y terraza cuidando plantas y flores, con 4 ejes: Consumo Consciente, Cuidar el Agua, Espacios Limpios y Herencia de Amor.",
            "[Inspirar con energía y tono esperanzador]\n\n"
            "«La tercera dimensión es el Ecocuidado: el amor y el respeto por nuestra Madre Tierra. Observen la ilustración: esa alegría de regar una planta, de ver brotar una flor, de convivir en armonía con las aves y las mariposas.\n\n"
            "A veces pensamos que el medio ambiente es algo lejano, que está por allá en los polos o en la selva del Amazonas. Pero el medio ambiente empieza en nuestra cocina, en la llave del agua, en el andén de nuestra casa y en la calle por donde caminamos.\n\n"
            "[Plantear la reflexión de consumo]\n\n"
            "Ecocuidado significa consumir con sobriedad y conciencia: preguntarnos antes de comprar algo si realmente lo necesitamos o si en quince minutos se convertirá en basura plástica que durará cuatrocientos años contaminando el suelo. Significa no malgastar el agua, proteger los árboles de nuestro barrio y separar los residuos con amor para que las personas recicladoras puedan trabajar con dignidad y sin cortarse. La Tierra es nuestra única casa, y cuidarla es cuidar el futuro de nuestros hijos y nietos.»"
        ),
        (
            "Diapositiva 7: El Cuidado en el Trabajo",
            "1.5 a 2 minutos",
            "Ilustración editorial de un equipo profesional adulto colaborando en una mesa luminosa con café y portátiles en un clima de respeto y bienestar psicológico, junto a 4 pilares: Ergonomía, Cero Hostilidad, Ritmos Sostenibles y Liderazgo Cercano.",
            "[Adoptar un tono profesional, pero muy cercano y amigable]\n\n"
            "«Hablemos ahora de un lugar donde pasamos la mayor parte de nuestros días: el trabajo. ¿Cómo se vive la cultura del cuidado en una oficina, en un taller o en un hospital?\n\n"
            "Como ven en la ilustración, el trabajo no tiene por qué ser un campo de batalla frío. Cuidar en el trabajo empieza por la Seguridad y Salud en el Trabajo: ergonomía, pausas activas y autocuidado físico para regresar sanas y salvas a casa.\n\n"
            "Pero también pasa por el clima emocional: cero chismes, cero maltrato verbal, y líderes que escuchan antes de exigir. Cuando una empresa cuida a su gente, la gente cuida a la empresa y a sus usuarios con amor.»"
        ),
        (
            "Diapositiva 8: ¿Qué Daña la Cultura del Cuidado?",
            "1.5 minutos",
            "Cuatro tarjetas interactivas de alerta para adultos: La Prisa Crónica, La Indiferencia, El Individualismo y la Sobrecarga/Burnout, rematadas con un banner de síntesis sobre desaceleración consciente.",
            "[Poner un tono más serio y reflexivo para generar conciencia]\n\n"
            "«Para sanar nuestras relaciones, también debemos ser valientes y reconocer qué actitudes nos están impidiendo cuidar. En pantalla tenemos los cuatro grandes obstáculos cotidianos:\n\n"
            "Primero, la indiferencia: ver que alguien sufre o que un espacio está sucio y mirar hacia otro lado diciendo 'a mí no me pagan por eso'.\n\n"
            "Segundo, la sobrecarga y el agotamiento: cuando una sola persona carga con todo el peso del hogar o de la oficina sin apoyo.\n\n"
            "Tercero, el individualismo extremo de creer que nos salvamos solos; y cuarto, la falta de valoración social hacia quienes limpian, cocinan y cuidan. Reconocer estas trampas es el primer paso para cambiarlas.»"
        ),
        (
            "Diapositiva 9: El Decálogo del Cuidado",
            "2 minutos",
            "Ilustración del árbol de la vida y sostenibilidad junto a los 10 Principios de Oro del Cuidado organizados en dos columnas elegantes con insignias pastel.",
            "[Leer con voz pausada, solemne y emotiva]\n\n"
            "«Como síntesis de esta propuesta ética, quiero compartirles este Decálogo del Cuidado, diez compromisos para llevar grabados en el corazón:\n\n"
            "1. La vida es sagrada: valorar la dignidad de cada ser vivo.\n"
            "2. Cuidarme primero: no puedo dar agua limpia si mi cántaro está vacío.\n"
            "3. La palabra edifica: hablar con dulzura y evitar el juicio.\n"
            "4. Escuchar con el alma: regalar presencia sin distracciones.\n"
            "5. Aceptar la fragilidad: reconocer con humildad que todos necesitamos ayuda.\n"
            "6. Corresponsabilidad: el bienestar común es tarea de todos.\n"
            "7. Gratitud activa: valorar el esfuerzo de quienes nos cuidan.\n"
            "8. Respetar la Tierra: consumir con conciencia y no agotar el planeta.\n"
            "9. Resolver en paz: perdonar y tender puentes ante el conflicto.\n"
            "10. Cuidar es trascender: dejar una huella de ternura y bondad por donde pasemos.»"
        ),
        (
            "Diapositiva 10: Cierre, Reflexión y Agradecimientos",
            "1.5 minutos",
            "Pantalla editorial sofisticada con emblema floral animado, la cita filosófica de síntesis, el nombre de Bertha Inés Medina Hernández y botones interactivos para el diálogo abierto con el auditorio.",
            "[Mirar con cariño al público, llevar las manos al pecho con una sonrisa serena]\n\n"
            "«Llegando al cierre de nuestra exposición, quiero que nos llevemos esta certeza en el alma:\n\n"
            "[Leer con emoción pausada la frase que acompaña la pantalla]\n\n"
            "'El cuidado no es un detalle secundario ni una tarea opcional: es la fuerza tierna y silenciosa que evita que la sociedad se desmorone. Cuidar de nosotras mismas, abrazar la fragilidad de quienes amamos y sanar nuestro lazo con la naturaleza es el regalo más hermoso que podemos ofrecerle a la vida.'\n\n"
            "A cada una y a cada uno de ustedes, muchísimas gracias por su atención, por su cariño y por abrir sus corazones a este mensaje. Quedo muy atenta a sus preguntas, aportes o reflexiones personales que deseen compartir. ¡Muchas gracias!»"
        )
    ]

    for title, dur, visual, discurso in slides_guion:
        add_heading_1(doc, title, space_before=16, space_after=3)
        add_p(doc, f"⏱️ Tiempo estimado: {dur}", bold=True, font_size=9.5, color=COLOR_ROSE, space_after=3)
        
        # Cuadro de apoyo visual
        add_callout(doc, visual, title="🖼️ QUÉ SE PROYECTA EN PANTALLA:")

        # Discurso para hablar
        add_heading_2(doc, "🗣️ QUÉ DECIR (Discurso de Bertha Inés Medina Hernández):", space_before=6, space_after=3)
        
        paragraphs = discurso.split("\n\n")
        for p_txt in paragraphs:
            if p_txt.startswith("[") and p_txt.endswith("]"):
                # Acotación de oratoria
                p_acot = add_p(doc, p_txt, italic=True, bold=True, font_size=9.5, color=COLOR_TEAL, space_after=3)
                p_acot.paragraph_format.left_indent = Inches(0.2)
            else:
                add_p(doc, p_txt, font_size=10, space_after=4.5)

        # Línea divisoria suave
        add_p(doc, "―" * 45, bold=False, font_size=8, color=RGBColor(226, 232, 240), align=WD_ALIGN_PARAGRAPH.CENTER, space_before=4, space_after=8)

    # RECOMENDACIONES FINALES DE ORATORIA
    add_heading_1(doc, "CONSEJOS CLAVE DE ORATORIA PARA BERTHA INÉS", space_before=18, space_after=4)
    tips = [
        ("Postura y Respiración:", "Antes de comenzar, toma tres respiraciones profundas. Mantén la espalda erguida pero relajada, los hombros sueltos y una sonrisa serena en el rostro."),
        ("Contacto Visual:", "No mires al suelo ni fijes la vista en una sola persona. Realiza un barrido suave mirando a la izquierda, al centro y a la derecha del auditorio para que todos se sientan incluidos."),
        ("Uso del Apoyo Visual:", "La presentación en pantalla es tu aliada, no tu enemiga. No necesitas leerla al pie de la letra; las ilustraciones amigables y los títulos son la guía para que tus palabras fluyan con naturalidad."),
        ("Manejo del Tiempo:", "Si notas que el tiempo se acorta, puedes resumir los ejemplos de la Diapositiva 9 y pasar directamente al Decálogo (Diapositiva 10) y la Reflexión Final (Diapositiva 11)."),
        ("Preguntas del Auditorio:", "Si alguien hace una pregunta, agradécele con amabilidad: 'Muchas gracias por tu valioso aporte...'. Si no tienes un dato exacto, responde con sinceridad: 'Es un punto sumamente interesante que nos invita a seguir profundizando en esta ética del cuidado'.")
    ]
    for k, v in tips:
        add_p(doc, f"• {k} {v}", bold=False, font_size=9.5, space_after=3.5)

    # Guardar documento en Desktop y Descargas
    path_desk = r"C:\Users\lenovo\Desktop\trabajos andres\Guion_Exposicion_Cultura_del_Cuidado_Bertha_Medina.docx"
    path_down = r"C:\Users\lenovo\Downloads\Guion_Exposicion_Cultura_del_Cuidado_Bertha_Medina.docx"

    print("Guardando guion en Escritorio...")
    doc.save(path_desk)
    print("Guardando guion en Descargas...")
    doc.save(path_down)
    print("Guion DOCX generado exitosamente.")

if __name__ == "__main__":
    build_guion()
