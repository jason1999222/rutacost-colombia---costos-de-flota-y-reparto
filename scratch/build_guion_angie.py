# -*- coding: utf-8 -*-
r"""
Generador del Guion de Exposición Oficial para Sesión Virtual en Microsoft Teams (Horario Nocturno):
'GUION DE FACILITACIÓN Y EXPOSICIÓN VIRTUAL: LA CULTURA DEL CUIDADO'
Expositora y Facilitadora: Angie Gómez
Espacio: Reunión Virtual en Microsoft Teams
SINCRONIZADO 100% CON LAS 14 DIAPOSITIVAS SECUENCIALES

Estructura de 14 pasos exactos:
1. Portada y Bienvenida Virtual en Teams (Cámaras y Saludo Cálido)
2. ¿Qué es realmente Cuidar? (Fundamento de Boff)
3. Momento de Interacción N° 1: Votación en el Chat de Teams («¿Cómo llegas hoy?»)
4. Las Tres Dimensiones del Cuidado (El Triángulo de Sostenibilidad)
5. Dimensión 1: El Autocuidado Consciente (Soltar la Sobrecarga)
6. Dinámica Virtual N° 1: «La Batería del Autocuidado en Microsoft Teams» (Cámaras, Estiramiento, Lluvia de % en Chat y Reacciones ❤️)
7. Dimensión 2: Cuidado del Otro (La Ética de los Vínculos y Carol Gilligan)
8. Momento de Interacción N° 2: Termómetro y «Palabras que Sanan» en el Chat de Teams
9. Dimensión 3: El Ecocuidado (Nuestra Casa Común y el Metro Cuadrado)
10. El Cuidado en el Trabajo (Salud Laboral, Ergonomía y Seguridad Psicológica)
11. Dinámica Virtual N° 2: «El Muro Virtual de la Gratitud y el Buen Trato» (Lluvia de Agradecimientos en Chat, Lectura en Vivo y Micrófono ✋)
12. ¿Qué Daña la Cultura del Cuidado? (Reflexión Crítica: Prisa, Pantallas y Burnout)
13. El Decálogo del Cuidado (10 Principios de Oro para la Vida Diaria)
14. Cierre Inspirador, Micrófonos Abiertos y Despedida Reparadora
"""

import docx
from docx.shared import Inches, Pt, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.enum.table import WD_TABLE_ALIGNMENT
from docx.oxml import OxmlElement, parse_xml
from docx.oxml.ns import nsdecls

COLOR_BLACK = RGBColor(0, 0, 0)
COLOR_TEXT = RGBColor(30, 41, 59)
COLOR_ROSE = RGBColor(225, 29, 72)     # Rose 600
COLOR_PURPLE = RGBColor(109, 40, 217)  # Violet 700
COLOR_TEAL = RGBColor(13, 148, 136)    # Teal 600
COLOR_BLUE = RGBColor(37, 99, 235)     # Blue 600

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

def add_callout(doc, text, title="", bg="FFF5F7", border="FBCFE8", color=COLOR_PURPLE):
    tbl = doc.add_table(rows=1, cols=1)
    tbl.alignment = WD_TABLE_ALIGNMENT.CENTER
    cell = tbl.cell(0, 0)
    cell.width = Inches(6.5)
    set_cell_background(cell, bg)
    set_cell_margins(cell, top=80, bottom=80, left=120, right=120)
    set_table_borders(tbl, color=border, sz="6")
    
    p = cell.paragraphs[0]
    p.paragraph_format.space_before = Pt(2)
    p.paragraph_format.space_after = Pt(2)
    p.paragraph_format.line_spacing = 1.15
    if title:
        r_t = p.add_run(title + "\n")
        r_t.bold = True
        r_t.font.name = "Arial"
        r_t.font.size = Pt(9.5)
        r_t.font.color.rgb = color
    r_b = p.add_run(text)
    r_b.italic = True
    r_b.font.name = "Arial"
    r_b.font.size = Pt(9.5)
    r_b.font.color.rgb = COLOR_TEXT
    add_p(doc, "", space_after=2)

def build_guion():
    doc = docx.Document()

    # Márgenes de página estándar
    sections = doc.sections
    for s in sections:
        s.top_margin = Inches(1)
        s.bottom_margin = Inches(1)
        s.left_margin = Inches(1)
        s.right_margin = Inches(1)

    # PORTADA / ENCABEZADO
    add_heading_1(doc, "GUION DE FACILITACIÓN VIRTUAL EN GOOGLE MEET: LA CULTURA DEL CUIDADO", space_before=0, space_after=2)
    add_p(doc, "Guía Oficial para Angie Gómez • Sesión Virtual Nocturna con Alta Interacción y Dinámicas en Teams", bold=True, font_size=10.5, color=COLOR_ROSE, space_after=6)
    
    # Ficha técnica
    tbl_meta = doc.add_table(rows=6, cols=2)
    tbl_meta.alignment = WD_TABLE_ALIGNMENT.CENTER
    set_table_borders(tbl_meta, color="CBD5E1", sz="4")
    
    meta_rows = [
        ("Expositora y Facilitadora:", "Angie Gómez"),
        ("Espacio y Modalidad:", "Reunión Virtual en Microsoft Teams (Transmisión compartiendo pestaña de navegador)"),
        ("Horario y Audiencia:", "Sesión Nocturna con público adulto profesional (enfocada en dinamismo y combate a la fatiga virtual)"),
        ("Estructura de la Presentación:", "14 Diapositivas Secuenciales (Avanzan de forma fluida con el botón 'Siguiente ›' o tecla '→')"),
        ("Duración Estimada:", "35 a 45 minutos (incluye 2 dinámicas virtuales y momentos de participación por chat)"),
        ("Dinámicas en Microsoft Teams:", "1. «La Batería del Autocuidado» (Slide 6 - Chat y Reacciones) | 2. «El Muro Virtual de la Gratitud» (Slide 11 - Chat y Micrófono ✋)")
    ]
    for i, (k, v) in enumerate(meta_rows):
        row = tbl_meta.rows[i]
        make_row_cant_split(row)
        c0, c1 = row.cells
        c0.width = Inches(2.4)
        c1.width = Inches(4.1)
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

    # PROTOCOLO DE FACILITACIÓN EN GOOGLE MEET
    add_heading_2(doc, "Protocolo de Facilitación y Manejo de Microsoft Teams para Angie Gómez")
    add_p(doc, 
          "Las reuniones virtuales nocturnas en Microsoft Teams conllevan el reto de la fatiga visual y la tentación de la pasividad. "
          "Para convertir la llamada en una experiencia humana, cercana y energizante, este guion integra directamente las herramientas nativas de Microsoft Teams:\n"
          "• Ventanas Modales Interactivas (Ejemplos de la Vida Real): En las diapositivas conceptuales (2, 4, 5, 7, 8, 9, 10, 11, 12), cada tarjeta cuenta con un botón '💡 Clic para ver ejemplo'. Al hacer clic, se abre una elegante ventana flotante con una historia o ejemplo práctico (ej. el fémur de Margaret Mead, el mensaje de WhatsApp, la regla del metro cuadrado, el descanso digital). Puedes abrirla en vivo o avanzar fluidamente con 'Siguiente ›'.\n"
          "• Dinámicas sin 'Spoiler' para el Público: En las Diapositivas 6 y 11, el público ve un diseño interactivo y lúdico ('Termómetro de la Batería Humana' y 'Muro Digital de Post-Its'), mientras que las instrucciones internas de facilitación (estiramiento físico, reacciones, micrófono) las guías tú con tu propia voz leyendo este guion.\n"
          "• Chat de la Llamada: Utilizado para votaciones instantáneas (escribir solo A, B, C, un número o su porcentaje de batería), permitiendo que el 100% participe sin fricción.\n"
          "• Reacciones y Emojis de Teams: Uso de corazones (❤️) y aplausos (👏) para validar y apoyar emocionalmente a los compañeros en pantalla.\n"
          "• Cámaras y Cuadrícula: Momentos guiados de estiramiento visual y físico donde se invita a encender la cámara para conectar miradas.\n"
          "• Botón Levantar la Mano (✋): Para intervenciones habladas breves de 20-30 segundos sin desordenar el audio de la llamada.\n"
          "• Temporizadores en Pantalla: Cronómetros interactivos de 2 minutos que Angie activa en vivo para que los participantes vean la cuenta regresiva mientras escriben.", 
          font_size=9.5)

    # DESARROLLO PASO A PASO (14 DIAPOSITIVAS)
    slides_guion = [
        (
            "Diapositiva 1: Portada y Bienvenida en Microsoft Teams",
            "2 minutos",
            "Portada editorial cálida con ilustración de comunidad adulta tomando café en sala acogedora, con el nombre de Angie Gómez destacado, insignia 'Modalidad Virtual • Microsoft Teams' y botón animado 'Siguiente ›'.",
            "[Sonreír con calidez frente a la cámara web, voz modulada, vibrante, empática y cercana]\n\n"
            "«Muy buenas noches a todas y todos los que ya están conectados en esta sala de Microsoft Teams. Mi nombre es Angie Gómez, y quiero comenzar dándoles las gracias de corazón por regalarse este tiempo esta noche.\n\n"
            "Sé perfectamente lo que significa para cada uno de ustedes conectarse a esta hora: vienen de una jornada larga de trabajo, de atender la casa, la familia, correos y mil pendientes. Y la tentación al llegar la noche siempre es desconectarse o quedarse en silencio. Pero les aseguro algo: este espacio no será una reunión pesada ni una clase magistral teórica. Esta noche es un respiro para ustedes.\n\n"
            "[Hacer un gesto afectuoso con las manos hacia la cámara]\n\n"
            "A quienes les sea posible y se sientan cómodos, los invito a encender su cámara para vernos las caras en la cuadrícula de Teams y sentirnos cerquita a pesar de la distancia física. Hoy venimos a hablar y a vivir la Cultura del Cuidado: cómo cuidarnos a nosotras mismas, cómo cuidar a nuestros compañeros y cómo cuidar nuestra Casa Común. ¡Sean todos muy bienvenidos a este encuentro!»"
        ),
        (
            "Diapositiva 2: ¿Qué es realmente Cuidar? (Fundamento de Leonardo Boff)",
            "2 minutos",
            "Tres tarjetas conceptuales enriquecidas y equilibradas (Modo de Ser Humano, Vencer la Indiferencia, Corresponsabilidad Activa) con puntos clave y botones interactivos. Al hacer clic en cualquiera de ellas, se abre una ventana modal flotante con su ejemplo real (ej. la lección del fémur de Margaret Mead, el mensaje de WhatsApp que salva un día, o la regla del metro cuadrado).",
            "[Presionar 'Siguiente ›' o flecha derecha '→'. Mantener el contacto visual con la cámara. Opcionalmente hacer clic en una tarjeta para mostrar el ejemplo flotante]\n\n"
            "«Para empezar, quiero que nos hagamos una pregunta profunda: ¿qué es realmente cuidar? Muchas veces en el trabajo o en el hogar creemos que cuidar es solo una obligación médica, un trámite de enfermería o algo que hacemos únicamente cuando alguien enferma de gravedad.\n\n"
            "[Señalar la cita en pantalla compartida y el fémur de Margaret Mead]\n\n"
            "El filósofo Leonardo Boff nos recuerda una verdad hermosa: 'El cuidado no es un acto aislado ni una técnica; es el modo esencial de ser del ser humano'. Pensemos un segundo: ninguno de los que estamos conectados en esta sesión de Teams estaría hoy aquí si de bebés no hubiésemos recibido el cuidado paciente de una madre, un padre o unos abuelos que nos arroparon, nos alimentaron y nos enseñaron a caminar. Existimos porque alguien cuidó de nosotros.\n\n"
            "Por eso, la cultura del cuidado es el antídoto contra la mayor epidemia de nuestro siglo: la indiferencia. Es aprender a mirar al compañero a través de la pantalla, reconocer su cansancio y asumir una corresponsabilidad activa: el bienestar del equipo es tarea de todos.»"
        ),
        (
            "Diapositiva 3: Momento de Interacción N° 1 (Votación en el Chat de Teams)",
            "2.5 minutos",
            "Pantalla interactiva completa: «¿Cómo llegas a este espacio hoy?» con 3 opciones grandes (A: Consciente y en calma, B: Sobrecargado en piloto automático, C: Autoexigente con culpa al frenar) y badge de instrucción para el chat de Teams.",
            "[Al avanzar con 'Siguiente ›', se proyecta la pantalla de participación comunitaria]\n\n"
            "[Invitar al grupo con tono cálido, relajado y participativo]\n\n"
            "«Quiero ver el chat de este Microsoft Teams activo. Miren la pregunta que tenemos en pantalla: '¿Cómo llegas a este espacio hoy?'. Les voy a pedir que escriban en el chat de la llamada la letra con la que más se identifiquen en este momento:\n\n"
            "• Escriban A: Quienes hoy lograron regalarse al menos 10 minutos de pausa consciente, un té con calma o respiración profunda.\n"
            "• Escriban B: Quienes sienten que llevan semanas en 'modo supervivencia', corriendo de afán y apagando incendios.\n"
            "• Escriban C: Quienes sienten culpa o ansiedad cada vez que se sientan a descansar porque sienten que 'deberían estar produciendo'.\n\n"
            "[Hacer clic en las opciones para mostrar las reflexiones mientras se lee el chat en vivo]\n\n"
            "¡Miren ese chat! Veo muchas B y varias C. Veo a Marcela diciendo B, a Carlos con C, a Andrea... Para todos ustedes va este mensaje en pantalla: Descansar no es un premio que se gana cuando el cuerpo ya no da más; descansar es una necesidad biológica y un derecho innegociable. ¡Gracias por su sinceridad en el chat!»"
        ),
        (
            "Diapositiva 4: Las Tres Dimensiones del Cuidado (El Triángulo de Sostenibilidad)",
            "2 minutos",
            "Diagrama editorial con equilibrio armónico conectando Autocuidado (Mente/Cuerpo), Cuidado del Otro (Vínculos) y Ecocuidado (Entorno), con tarjetas explicativas y cita de síntesis.",
            "[Avanzar con 'Siguiente ›'. Voz serena, estructurada y pedagógica]\n\n"
            "«Para que el cuidado no sea solo un deseo pasajero, debemos entenderlo en su totalidad. Por eso les presento este modelo: El Triángulo del Cuidado Sostenible.\n\n"
            "Imaginen un trípode de cámara: si le quitamos una de las tres patas, la cámara se viene al piso. Lo mismo ocurre en nuestras vidas adultas:\n\n"
            "1. La base es el Autocuidado: la relación conmigo misma, mi sueño, mi alimentación y mi paz mental.\n"
            "2. El segundo pilar es el Cuidado del Otro: la ternura, el respeto y la escucha activa con mi familia y mis compañeros de trabajo.\n"
            "3. El tercer pilar es el Ecocuidado: el respeto por nuestro entorno físico, los recursos del planeta y nuestra Casa Común.\n\n"
            "Esta noche vamos a profundizar en cada una de estas dimensiones, comenzando por la que más solemos postergar por atender a los demás: nosotras mismas.»"
        ),
        (
            "Diapositiva 5: Dimensión I - El Autocuidado Consciente",
            "2 minutos",
            "Ilustración editorial sofisticada de mujer madura descansando plácidamente en sillón con té caliente y libro, con 4 tarjetas de hábitos de autocuidado.",
            "[Avanzar con 'Siguiente ›'. Tono íntimo, suave y reflexivo]\n\n"
            "«Miren la ilustración que comparto en pantalla: qué sensación de paz transmite esa mujer disfrutando de una aromática caliente, con su lectura y rodeada de plantas.\n\n"
            "¿Cuántas veces nos sentimos egoístas por regalarnos un momento así? Solemos pensar: 'no tengo tiempo para sentarme a descansar'. Pero grábense esta frase: nadie puede servir agua fresca de un cántaro que está completamente seco. Si llegamos a casa agotadas, irritables, con dolor de cabeza y sin energía, ¿qué calidad de presencia le podemos dar a quienes más queremos?\n\n"
            "El autocuidado en adultos se fundamenta en cuatro prácticas conscientes: priorizar un sueño reparador; aprender a decir 'NO' a demandas excesivas sin sentirnos culpables; regalarse momentos diarios de desconexión de pantallas; y practicar la autocompasión: hablarnos a nosotras mismas con la misma suavidad con la que le hablaríamos a una buena amiga.»"
        ),
        (
            "Diapositiva 6: Dinámica Virtual N° 1 («La Batería del Autocuidado en Microsoft Teams»)",
            "3 a 4 minutos",
            "Pantalla interactiva limpia para el público: 'El Termómetro de la Batería Humana' con 4 niveles interactivos (10%-20%, 25%-45%, 50%-75%, 80%-100%), llamado visual para escribir en el chat de Teams y el Temporizador oficial de 2 minutos. (Nota de facilitación: Las instrucciones de estiramiento y reacciones NO aparecen en pantalla para no 'spoilear' la dinámica al público; tú las guías espontáneamente con tu propia voz desde este guion).",
            "[Avanzar con 'Siguiente ›'. Cambiar a un tono sumamente alegre, enérgico y dinámico]\n\n"
            "«¡Atención a todos los conectados en Microsoft Teams! Sé que es de noche y que estar frente a la pantalla cansa los ojos y la espalda. Por eso, llegó el momento de nuestra primera dinámica virtual: 'La Batería del Autocuidado'.\n\n"
            "[Invitar al grupo con las manos y el cuerpo frente a la cámara]\n\n"
            "Paso 1: Quienes puedan, enciendan su cámara un momento para vernos. Suelten el mouse, suelten el teclado, sacudamos los brazos... giremos los hombros hacia atrás... estiremos los brazos bien arriba frente a la cámara como si quisiéramos tocar el techo... inhalamos hondo por la nariz... y soltamos el aire por la boca con un suspiro sonoro: ¡Aaaaah!\n\n"
            "[Hacer clic en el botón '▶ Iniciar 2 Minutos' del temporizador en pantalla compartida]\n\n"
            "Paso 2: Acabo de activar nuestro temporizador de 2 minutos. Quiero que todos vayan al chat de Microsoft Teams y respondan con total honestidad: 'Si tu energía en este momento fuera la batería de un celular, ¿con qué porcentaje llegas a esta noche?'. Escríbanlo en el chat: ¿10%? ¿15% en modo ahorro? ¿40%? ¡Los leo ya mismo!\n\n"
            "[Angie lee los mensajes del chat en voz alta con empatía y risas compartidas]\n\n"
            "¡Uy, miren este chat! Veo a Sandra con el 12% en rojo total; a Carlos con el 20% pidiendo cargador; a Patricia con el 30%; a Felipe que dice 50% gracias al tinto de la tarde... ¡Gracias por su sinceridad!\n\n"
            "Paso 3: Ahora todos vamos al botón de reacciones de Microsoft Teams —el que está en la barra inferior— y vamos a enviar una lluvia de corazones ❤️ y aplausos 👏 para recargar la batería de los compañeros que están en modo ahorro. ¡Miren esa pantalla llena de corazones flotando! Se vale estar cansados, y este aplauso virtual es para reconocer todo lo que entregaron hoy. ¡Excelente energía!»"
        ),
        (
            "Diapositiva 7: Dimensión II - Cuidado del Otro (La Ética de los Vínculos)",
            "2 minutos",
            "Ilustración de dos mujeres adultas en un sofá compartiendo una conversación empática y comprensiva, junto a 4 tarjetas de vínculos saludables. Cada tarjeta incluye botón interactivo que abre ventana modal con ejemplos reales (escucha activa, palabras constructivas, apoyo en fragilidad, visibilizar el cuidado).",
            "[Avanzar con 'Siguiente ›'. Voz cercana, cálida y reflexiva. Opcionalmente hacer clic en una tarjeta para ilustrar el ejemplo]\n\n"
            "«Con la energía recargada, pasamos a la segunda dimensión: El Cuidado del Otro. La imagen que ven refleja lo que ocurre cuando dos personas se encuentran en el buen trato: un apretón de manos sincero, mirada atenta y palabras que abrigan.\n\n"
            "La psicóloga Carol Gilligan demostró que la madurez de una sociedad no se mide por la fuerza o la competencia agresiva, sino por la capacidad de tejer vínculos protectores basados en la empatía y la ternura.\n\n"
            "Cuidar al otro se vive en cuatro gestos cotidianos: escuchar con el alma sin revisar el celular mientras alguien nos habla; regalar palabras que edifiquen; ser un refugio de apoyo cuando un compañero pasa por un momento difícil; y valorar visiblemente las labores de cuidado que muchas veces son invisibles en el hogar o en la oficina.»"
        ),
        (
            "Diapositiva 8: Momento de Interacción N° 2 (Termómetro y Bálsamo Emocional en Teams)",
            "2.5 minutos",
            "Pantalla completa en 2 columnas equilibradas y sin vacíos: a la izquierda las 4 frases con botones para el chat de Teams; a la derecha el panel interactivo 'Bálsamo Emocional de la Noche'. Al hacer clic en cualquiera de las frases, el panel derecho muestra la explicación psicológica y el botón para abrir la ventana modal interactiva con la reflexión y el micro-ejercicio.",
            "[Al avanzar con 'Siguiente ›', aparece la pantalla interactiva de resonancia emocional]\n\n"
            "[Tono suave, íntimo y acogedor]\n\n"
            "«A todos los que estamos conectados en esta sesión de Teams nos pasa: a veces terminamos el día con el corazón cargado y lo único que necesitamos es una palabra reconfortante.\n\n"
            "Miren las cuatro frases en pantalla y escriban en el chat de Teams el número (1, 2, 3 o 4) de la frase que más calma traería a su noche hoy:\n\n"
            "1. 'Vas bien, no te sobreexijas tanto hoy' (Alivio)\n"
            "2. 'Cuenta conmigo, aquí estoy para ti si me necesitas' (Apoyo)\n"
            "3. 'Gracias por todo lo que haces con tanto amor y dedicación' (Gratitud)\n"
            "4. 'Descansa sin culpa, te has ganado esta noche de paz' (Serenidad)\n\n"
            "[Hacer clic en las opciones en pantalla para desplegar los aprendizajes en el panel derecho mientras se observa el chat]\n\n"
            "¡Qué belleza de respuestas en el chat! Veo que la número 4 y la número 1 están muy votadas. Fíjense: muchas veces pasamos meses esperando que otros nos regalen estas palabras. ¿Qué tal si a partir de mañana somos nosotros los primeros en regalárselas a nuestros hijos, a nuestra pareja o a ese compañero de trabajo que vemos abrumado?»"
        ),
        (
            "Diapositiva 9: Dimensión III - El Ecocuidado (Nuestra Casa Común)",
            "2 minutos",
            "Ilustración de personas adultas cuidando huerto e invernadero luminoso con amor, junto a 4 tarjetas de sostenibilidad cotidiana. Cada tarjeta abre una ventana modal con micro-acciones prácticas para el hogar.",
            "[Avanzar con 'Siguiente ›'. Voz firme, inspiradora y comprometida con el entorno]\n\n"
            "«Llegamos a la tercera dimensión: El Ecocuidado. A veces pensamos que la ecología es un asunto lejano que le corresponde a los científicos o a las cumbres internacionales. Pero la verdadera ecología empieza en nuestro metro cuadrado: en la cocina, en la llave del agua y en cómo apagamos las luces al terminar la jornada.\n\n"
            "Consumo consciente es preguntarnos antes de comprar si de verdad lo necesitamos; cuidar el agua es recordar que cada gota sostiene nuestra salud; y mantener limpios nuestros espacios de trabajo y nuestro barrio es un acto de respeto hacia la comunidad.\n\n"
            "La Tierra no es una bodega de recursos inagotables: es nuestro hogar sagrado, y cuidarla es el acto de amor más generoso que podemos dejar a las futuras generaciones.»"
        ),
        (
            "Diapositiva 10: El Cuidado en el Trabajo (Salud Laboral y Humana)",
            "2 minutos",
            "Ilustración de equipo profesional adulto colaborando en mesa luminosa con respeto, ergonomía y bienestar, con 4 pilares organizacionales interactivos que abren ventanas modales con casos de trabajo.",
            "[Avanzar con 'Siguiente ›'. Tono profesional, constructivo y motivador]\n\n"
            "«El trabajo es el lugar donde dejamos la mitad de nuestras vidas adultas. ¿Por qué tolerar ambientes laborales desgastantes, llenos de hostilidad, chismes o sobrecarga destructiva?\n\n"
            "Cuidar en el ámbito laboral abarca la ergonomía física —hacer pausas activas, cuidar la postura frente al computador para no llegar adoloridos a casa—, pero sobre todo implica la seguridad psicológica: saber que puedo expresar una duda sin ser ridiculizado, colaborar en equipo y tener líderes que pregunten '¿cómo estás?' antes de exigir una cifra.\n\n"
            "Cuando una empresa o institución cuida la salud y la dignidad de su gente, la gente cuida a la organización y a sus usuarios con verdadera vocación y compromiso.»"
        ),
        (
            "Diapositiva 11: Dinámica Virtual N° 2 («El Muro Virtual de la Gratitud y el Buen Trato»)",
            "3 a 4 minutos",
            "Muro digital de 4 Post-Its de colores pastel con dedicatorias de gratitud (paciencia, auxilio en emergencias, escucha sin juicio, trabajo silencioso). Al hacer clic en cualquier post-it, se abre una ventana modal con una plantilla emotiva de agradecimiento. Cuenta con temporizador interactivo oficial de 2 minutos. (Tú guías verbalmente la introspección, la lluvia en el chat y las manos levantadas ✋).",
            "[Avanzar con 'Siguiente ›'. Tono cálido, emotivo y movilizador]\n\n"
            "«Para que esta noche no se quede en conceptos teóricos, vamos a tejer un lazo real en nuestra reunión con nuestra segunda dinámica: 'El Muro Virtual de la Gratitud y el Buen Trato'.\n\n"
            "Paso 1: Les voy a pedir que cierren los ojos 5 segundos frente a su pantalla. Piensen en una persona de su entorno laboral o familiar —un compañero, una persona de servicios generales, un familiar— que siempre cuida de todos con discreción y entrega.\n\n"
            "[Hacer clic en el botón '▶ Iniciar 2 Minutos' del temporizador en pantalla compartida]\n\n"
            "Paso 2: Acabo de iniciar nuestro temporizador de 2 minutos. Vamos a convertir el chat de Microsoft Teams en un muro de gratitud. Escriban un mensaje breve: '🌸 Agradezco a [Nombre] por su apoyo incondicional' o '☕ Mañana me comprometo a tener un gesto de cuidado con [Nombre] diciéndole...'. ¡Tienen 2 minutos para llenar el chat!\n\n"
            "[Angie lee con mucha emoción y calidez varios de los mensajes que van apareciendo en el chat de Teams]\n\n"
            "«¡Qué mensajes tan conmovedores están escribiendo! Escuchen este: 'Gracias a María por su paciencia infinita en el equipo', 'Agradezco a mi compañero Pedro que siempre me cubre cuando me siento mal', 'Mañana le llevaré un café a mi compañera y le preguntaré cómo amaneció'...\n\n"
            "Paso 3: Si alguien desea dedicar su agradecimiento en voz alta, ¡levante la mano con el botón de Microsoft Teams ✋ y le abrimos el micrófono por 20 segundos! [Dar la palabra a 1 o 2 voluntarios que levanten la mano en Teams]. ¡Eso es humanizar la virtualidad y tejer comunidad real a través de una pantalla!»"
        ),
        (
            "Diapositiva 12: ¿Qué Daña la Cultura del Cuidado? (Reflexión Crítica)",
            "2 minutos",
            "Cuatro tarjetas de alerta crítica (La Prisa Crónica, La Indiferencia, El Aislamiento Individualista, Sobrecarga/Burnout) con banner de síntesis sobre desaceleración.",
            "[Avanzar con 'Siguiente ›'. Voz solemne, empática y reflexiva]\n\n"
            "«Para sanar y cuidarnos, también es vital reconocer las cuatro trampas que amenazan nuestra tranquilidad cotidiana:\n\n"
            "1. La prisa mental: irnos a la cama pensando en los correos y las alarmas del día siguiente.\n"
            "2. La indiferencia: pensar 'a mí no me corresponde, que lo resuelva otro'.\n"
            "3. El individualismo: creer falsamente que pedir ayuda es un signo de debilidad.\n"
            "4. La sobrecarga: asumir el rol de superhéroes que tienen que cargarlo todo a solas.\n\n"
            "Esta noche los invito a soltar esa pesada armadura. Nadie tiene que resolver el mundo hoy a las diez de la noche. Cuidar comienza por darnos el permiso de parar y respirar con serenidad.»"
        ),
        (
            "Diapositiva 13: El Decálogo del Cuidado (Principios de Oro)",
            "2 minutos",
            "Ilustración del Árbol de la Vida y la Sostenibilidad junto a los 10 Principios de Oro organizados en dos columnas armoniosas.",
            "[Avanzar con 'Siguiente ›'. Voz solemne, clara y pausada]\n\n"
            "«Como brújula ética para llevarnos de esta reunión virtual, les comparto este Decálogo del Cuidado:\n\n"
            "1. La vida es sagrada: todo ser vivo merece dignidad y respeto.\n"
            "2. Cuidarme primero: no puedo sostener a nadie si yo me desplomo.\n"
            "3. La palabra edifica: que de nuestra boca salgan alientos y no heridas.\n"
            "4. Escuchar con el alma: regalar presencia real y libre de pantallas.\n"
            "5. Aceptar la vulnerabilidad: reconocer con humildad que todos somos frágiles.\n"
            "6. Corresponsabilidad: el bienestar de la casa y del equipo es tarea de todos.\n"
            "7. Gratitud sincera: valorar el esfuerzo silencioso de quienes nos rodean.\n"
            "8. Respetar la Tierra: consumir con moderación y cuidar el entorno.\n"
            "9. Resolver en paz: desarmar el resentimiento a través del diálogo sincero.\n"
            "10. Trascender con amor: dejar una huella de ternura por donde pasemos.»"
        ),
        (
            "Diapositiva 14: Cierre Inspirador, Micrófonos Abiertos y Despedida",
            "3 minutos",
            "Pantalla limpia con emblema floral animado, cita de cierre en tipografía editorial serif, firma destacada de Angie Gómez y etiquetas para preguntas y diálogo final.",
            "[Avanzar con 'Siguiente ›'. Mirar directo al lente de la cámara con una sonrisa amplia, serena y gratificante]\n\n"
            "«Para concluir este hermoso encuentro en Microsoft Teams, quiero dejarles esta certeza en el corazón:\n\n"
            "[Leer con profunda convicción y pausa]\n\n"
            "'El cuidado no es debilidad ni ingenuidad: es la fuerza más sabia, valiente y transformadora para sanar nuestras vidas, nuestros equipos de trabajo y nuestro planeta.'\n\n"
            "Gracias infinitas a cada una y cada uno de ustedes por encender sus cámaras, por compartir sus porcentajes en el chat, por inundar la pantalla de corazones y por regalarse este momento de bienestar.\n\n"
            "Mi nombre es Angie Gómez, y los invito a abrir sus micrófonos libremente para saludarnos, aplaudirnos y cerrar esta noche con la mejor energía. ¡Que tengan un descanso profundamente reparador! ¡Muy buenas noches!»"
        )
    ]

    for title, dur, visual, discurso in slides_guion:
        add_heading_1(doc, title, space_before=16, space_after=3)
        add_p(doc, f"⏱️ Tiempo estimado: {dur}", bold=True, font_size=9.5, color=COLOR_ROSE, space_after=3)
        
        # Cuadro de apoyo visual
        add_callout(doc, visual, title="🖼️ QUÉ SE PROYECTA EN LA PANTALLA COMPARTIDA DE MEET:")

        # Discurso para hablar
        add_heading_2(doc, "🗣️ GUION VERBAL DE FACILITACIÓN EN MEET (Angie Gómez):", space_before=6, space_after=3)
        
        paragraphs = discurso.split("\n\n")
        for p_txt in paragraphs:
            if p_txt.startswith("[") and p_txt.endswith("]"):
                # Acotación de facilitación virtual
                p_acot = add_p(doc, p_txt, italic=True, bold=True, font_size=9.5, color=COLOR_TEAL, space_after=3)
                p_acot.paragraph_format.left_indent = Inches(0.2)
            else:
                add_p(doc, p_txt, font_size=10, space_after=4.5)

        # Línea divisoria suave
        add_p(doc, "―" * 45, bold=False, font_size=8, color=RGBColor(226, 232, 240), align=WD_ALIGN_PARAGRAPH.CENTER, space_before=4, space_after=8)

    # RECOMENDACIONES TÉCNICAS Y METODOLÓGICAS PARA GOOGLE MEET
    add_heading_1(doc, "CONSEJOS DE ORO PARA FACILITAR EN GOOGLE MEET (ANGIE GÓMEZ)", space_before=18, space_after=4)
    tips = [
        ("Compartir la Pestaña Correcta en Teams:", "Al iniciar la videollamada, haz clic en 'Presentar ahora' y selecciona la opción 'Una pestaña de Chrome' eligiendo el archivo de la presentación. Esto garantiza máxima nitidez, animación fluida y transmisión de audio si lo requieres."),
        ("Navegación Intuitiva con 'Siguiente ›':", "Solo debes presionar 'Siguiente ›' o la tecla flecha derecha '→' de tu teclado. La presentación avanzará por las 14 diapositivas sin necesidad de abrir ventanas emergentes ni popups molestos."),
        ("Uso de los Temporizadores en Vivo:", "En las Diapositivas 6 y 11, haz clic directamente en '▶ Iniciar 2 Minutos'. Todos los asistentes verán el cronómetro grande en la pantalla compartida de Teams, lo que genera expectativa y dinamismo."),
        ("Lectura Cálida del Chat en Tiempo Real:", "El secreto de una facilitadora de alto nivel en Microsoft Teams es leer los nombres y comentarios de la gente en voz alta (ej. '¡Gracias Marcela por tu mensaje!', 'Veo que Carlos dice 20%...'). Esto combate la sensación de frialdad de la pantalla y hace sentir a cada participante plenamente valorado."),
        ("Gestión de Micrófonos y Manos Levantadas:", "En la Diapositiva 11, utiliza la función nativa de Teams 'Levantar la mano' (✋) para dar la palabra ordenada a 1 o 2 personas, evitando interrupciones o audios cruzados."),
        ("Puntualidad y Respeto al Descanso:", "Finalizar la sesión en los 35-40 minutos estipulados demuestra un profundo respeto por el descanso nocturno de los participantes, cerrando el encuentro con una altísima percepción de valor y profesionalismo.")
    ]
    for k, v in tips:
        add_p(doc, f"• {k} {v}", bold=False, font_size=9.5, space_after=3.5)

    # Guardar documento en Desktop y Descargas
    path_desk = r"C:\Users\lenovo\Desktop\trabajos andres\Guion_Exposicion_Cultura_del_Cuidado_Angie_Gomez.docx"
    path_down = r"C:\Users\lenovo\Downloads\Guion_Exposicion_Cultura_del_Cuidado_Angie_Gomez.docx"

    print("Guardando guion virtual de 14 pasos de Angie Gómez en Escritorio...")
    doc.save(path_desk)
    print("Guardando guion virtual de 14 pasos de Angie Gómez en Descargas...")
    doc.save(path_down)
    print("Guion DOCX para Microsoft Teams generado exitosamente.")

if __name__ == "__main__":
    build_guion()
