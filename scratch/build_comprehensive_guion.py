# -*- coding: utf-8 -*-
r"""
Generador Maestro del Guion Oficial Expandido para Angie Gómez:
'GUION DE FACILITACIÓN Y EXPOSICIÓN VIRTUAL: LA CULTURA DEL CUIDADO'
Plataforma: Google Meet
Totalmente integrado con los ejemplos de vida real, antropología, neurociencia y casos prácticos de TODAS las tarjetas interactivas de la presentación.
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
COLOR_SAGE = RGBColor(22, 101, 52)     # Sage 800

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
    trPr.append(parse_xml(f'<w:cantSplit {nsdecls("w")}/>'))

def add_heading_1(doc, text, space_before=14, space_after=4):
    p = doc.add_paragraph()
    p.paragraph_format.space_before = Pt(space_before)
    p.paragraph_format.space_after = Pt(space_after)
    p.paragraph_format.keep_with_next = True
    r = p.add_run(text)
    r.font.name = "Arial"
    r.font.size = Pt(13)
    r.bold = True
    r.font.color.rgb = COLOR_ROSE
    return p

def add_heading_2(doc, text, space_before=8, space_after=2):
    p = doc.add_paragraph()
    p.paragraph_format.space_before = Pt(space_before)
    p.paragraph_format.space_after = Pt(space_after)
    p.paragraph_format.keep_with_next = True
    r = p.add_run(text)
    r.font.name = "Arial"
    r.font.size = Pt(11)
    r.bold = True
    r.font.color.rgb = COLOR_PURPLE
    return p

def add_p(doc, text, bold=False, italic=False, font_size=10, color=COLOR_TEXT, align=WD_ALIGN_PARAGRAPH.LEFT, space_before=0, space_after=4):
    p = doc.add_paragraph()
    p.alignment = align
    p.paragraph_format.space_before = Pt(space_before)
    p.paragraph_format.space_after = Pt(space_after)
    p.paragraph_format.line_spacing = 1.15
    r = p.add_run(text)
    r.font.name = "Arial"
    r.font.size = Pt(font_size)
    r.bold = bold
    r.italic = italic
    r.font.color.rgb = color
    return p

def add_callout(doc, text, title="💡 CONTENIDO CLAVE Y EJEMPLOS PRÁCTICOS DE LAS TARJETAS:", fill_hex="FFF5F7", border_hex="FBCFE8", title_color=COLOR_ROSE):
    tbl = doc.add_table(rows=1, cols=1)
    tbl.alignment = WD_TABLE_ALIGNMENT.CENTER
    set_table_borders(tbl, color=border_hex, sz="8")
    row = tbl.rows[0]
    make_row_cant_split(row)
    cell = row.cells[0]
    cell.width = Inches(6.5)
    set_cell_background(cell, fill_hex)
    set_cell_margins(cell, top=120, bottom=120, left=150, right=150)
    
    p = cell.paragraphs[0]
    p.paragraph_format.space_before = Pt(0)
    p.paragraph_format.space_after = Pt(4)
    r_title = p.add_run(title)
    r_title.bold = True
    r_title.font.name = "Arial"
    r_title.font.size = Pt(9.5)
    r_title.font.color.rgb = title_color
    
    for line in text.strip().split("\n"):
        line_s = line.strip()
        if not line_s:
            continue
        p_line = cell.add_paragraph()
        p_line.paragraph_format.space_before = Pt(1)
        p_line.paragraph_format.space_after = Pt(3)
        p_line.paragraph_format.line_spacing = 1.15
        
        parts = line_s.split(":", 1)
        if len(parts) == 2 and any(line_s.startswith(icon) for icon in ["•", "▪", "👉", "💎", "💌", "🤝", "☕", "🌱", "🛌", "🛑", "🌿", "💖", "👂", "✨", "🤲", "💐", "🛍️", "💧", "🏡", "🌳", "💺", "🛡️", "⏱️", "👔", "⏳", "🔕", "🥀", "🔋", "🍃", "🌙"]):
            r_b = p_line.add_run(parts[0] + ":")
            r_b.bold = True
            r_b.font.name = "Arial"
            r_b.font.size = Pt(9)
            r_b.font.color.rgb = COLOR_TEXT
            
            r_t = p_line.add_run(parts[1])
            r_t.bold = False
            r_t.font.name = "Arial"
            r_t.font.size = Pt(9)
            r_t.font.color.rgb = COLOR_TEXT
        else:
            r = p_line.add_run(line_s)
            r.font.name = "Arial"
            r.font.size = Pt(9)
            r.font.color.rgb = COLOR_TEXT

    add_p(doc, "", space_after=4)

def build_guion():
    doc = docx.Document()
    
    # Configurar márgenes estrechos
    for s in doc.sections:
        s.top_margin = Inches(0.8)
        s.bottom_margin = Inches(0.8)
        s.left_margin = Inches(1)
        s.right_margin = Inches(1)

    # ENCABEZADO PRINCIPAL
    add_heading_1(doc, "GUION MAESTRO DE FACILITACIÓN VIRTUAL EN GOOGLE MEET: LA CULTURA DEL CUIDADO", space_before=0, space_after=2)
    add_p(doc, "Guía Oficial Integral para Angie Gómez • Sesión Virtual con Alta Interacción y Profundización en Casos Prácticos", bold=True, font_size=10.5, color=COLOR_ROSE, space_after=6)
    
    # Ficha técnica
    tbl_meta = doc.add_table(rows=6, cols=2)
    tbl_meta.alignment = WD_TABLE_ALIGNMENT.CENTER
    set_table_borders(tbl_meta, color="CBD5E1", sz="4")
    
    meta_rows = [
        ("Expositora y Facilitadora:", "Angie Gómez"),
        ("Espacio y Plataforma:", "Reunión Virtual en Google Meet (Transmisión compartiendo pestaña de navegador)"),
        ("Tema Central:", "La Cultura del Cuidado en General (Bienestar Personal, Relaciones Humanas, Ámbito Laboral y Casa Común)"),
        ("Estructura de la Presentación:", "14 Diapositivas Secuenciales (Avanzan de forma fluida con el botón 'Siguiente ›' o tecla '→')"),
        ("Duración Estimada:", "35 a 45 minutos (incluye 2 dinámicas interactivas y momentos de participación por chat)"),
        ("Dinámicas Adaptadas a Adultos Mayores:", "Cero estrés tecnológico: NO requiere escribir en el teclado. Se participa con un solo clic en la barra nativa de emojis de Meet (💖 👍 🎉 👏 😂 😮 😢 🤔 👎) o levantando la mano (✋) para hablar con voz propia")
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
    add_heading_2(doc, "Protocolo de Facilitación y Manejo de Google Meet para Angie Gómez")
    add_p(doc, 
          "Las reuniones virtuales conllevan el reto de la fatiga visual y la tentación de la pasividad. "
          "Para convertir la llamada en una experiencia humana, cercana y energizante, este guion integra directamente las herramientas nativas de Google Meet:\n"
          "• Ventanas Modales Interactivas (Ejemplos de la Vida Real): En las diapositivas conceptuales (2, 4, 5, 7, 8, 9, 10, 11, 12), cada tarjeta cuenta con su ejemplo práctico (ej. el fémur de Margaret Mead, el mensaje de WhatsApp, la regla del metro cuadrado, el descanso digital, la regla 50-10). En este guion tienes todo el desarrollo detallado de cada tarjeta para enriquecer tu discurso verbal.\n"
          "• Dinámicas sin 'Spoiler' para el Público: En las Diapositivas 6 y 11, el público ve un diseño interactivo y lúdico ('Termómetro de la Batería Humana' y 'Muro de la Gratitud'), mientras que las instrucciones internas de facilitación (estiramiento físico, reacciones, micrófono) las guías tú con tu propia voz leyendo este guion.\n"
          "• Chat de Meet: Utilizado para votaciones instantáneas (escribir solo A, B, C, un número o su porcentaje de batería), permitiendo que el 100% participe sin fricción.\n"
          "• Reacciones y Emojis de Meet: Uso de corazones (❤️) y aplausos (👏) para validar y apoyar emocionalmente a los compañeros en pantalla.\n"
          "• Botón Levantar la Mano (✋): Para intervenciones habladas breves de 20-30 segundos sin desordenar el audio de la reunión.\n"
          "• Temporizadores en Pantalla: Cronómetros interactivos de 2 minutos que Angie activa en vivo para que los participantes vean la cuenta regresiva mientras escriben.", 
          font_size=9.5)

    # DESARROLLO PASO A PASO (14 DIAPOSITIVAS EXPANDIDAS)
    slides_guion = [
        # SLIDE 1
        (
            "Diapositiva 1: Portada y Bienvenida en Google Meet",
            "2 minutos",
            "Portada editorial cálida con ilustración de comunidad adulta compartiendo en una sala acogedora, con el nombre de Angie Gómez destacado, insignia '🌸 Encuentro en Vivo • Google Meet', subtítulo 'Una ética de la ternura y la corresponsabilidad para el bienestar personal, laboral y comunitario' y botón 'Siguiente ›'.",
            """• 🌸 Propósito del Encuentro: Abrir un paréntesis de respiro y desaceleración en la rutina nocturna de los participantes.
• 🌷 Posicionamiento de Angie Gómez: Facilitadora empática y cercana en Desarrollo Humano y Bienestar.
• 💡 Conexión inicial: Invitar a encender cámaras y validar el cansancio acumulado del día como punto de partida legítimo.""",
            """[Sonreír con calidez frente a la cámara web, voz modulada, vibrante, empática y cercana]

«Muy buenas noches a todas y todos los que ya están conectados en esta sala de Google Meet. Mi nombre es Angie Gómez, y quiero comenzar dándoles las gracias de corazón por regalarse este tiempo esta noche.

Sé perfectamente lo que significa para cada uno de ustedes conectarse a esta hora: venimos de una jornada larga de trabajo, de atender la casa, la familia, llamadas, correos y mil pendientes. Y la tentación al terminar el día siempre es desconectarse o quedarse en automático. Pero les aseguro algo: este espacio no será una reunión pesada ni una clase magistral teórica. Esta noche es un respiro para ustedes.

[Hacer un gesto afectuoso con las manos hacia la cámara]

A quienes les sea posible y se sientan cómodos, los invito a encender su cámara para vernos las caras en la cuadrícula de Meet y sentirnos cerquita. Hoy venimos a hablar y a vivir la Cultura del Cuidado: una ética de la ternura y la corresponsabilidad para nuestro bienestar personal, nuestras relaciones familiares y laborales, y nuestro entorno común. ¡Sean todos muy bienvenidos a este encuentro!»"""
        ),

        # SLIDE 2
        (
            "Diapositiva 2: ¿Qué es realmente Cuidar? (Fundamento de Leonardo Boff)",
            "2.5 minutos",
            "Tres tarjetas conceptuales enriquecidas y equilibradas (Modo de Ser Humano, Vencer la Indiferencia, Corresponsabilidad Activa) con puntos clave y botones interactivos para abrir los ejemplos prácticos.",
            """💎 TARJETA 1: Modo de Ser Humano (Condición Vital):
• Ejemplo Antropológico de Margaret Mead: A la gran antropóloga le preguntaron cuál era el primer signo de civilización en la historia humana (¿un anzuelo de pesca?, ¿una vasija de barro?). Ella respondió: «Un fémur humano roto y cicatrizado». En el reino animal, un ser con una pierna fracturada muere cazado o de hambre. Que un fémur cicatrizara significó que otra persona se quedó a su lado, le vendó la pierna, lo cargó a un lugar seguro, compartió su comida y lo cuidó durante meses hasta sanar. La civilización humana nació cuando el cuidado derrotó al abandono.
• En tu vida hoy: Nadie es autosuficiente. Reconocer que necesitamos de los demás no es debilidad: es nuestra condición más sagrada.

💌 TARJETA 2: Vencer la Indiferencia (Conexión Humana):
• Caso del Mensaje de WhatsApp que rescata un día: En una reunión o en la oficina, notas a un compañero especialmente silencioso, con la cámara apagada o con la mirada perdida. La prisa e indiferencia dicen: «No me meto, cada quien con sus problemas». La cultura del cuidado actúa enviándole un mensaje privado de 10 palabras: «Hola Carlos, te noté cansado hoy. Solo paso a decirte que aquí estoy si necesitas desahogarte o apoyo con algo». Ese simple gesto de 15 segundos desactiva la soledad y le devuelve a esa persona la certeza de que su existencia importa.

🤝 TARJETA 3: Corresponsabilidad Activa (Pacto Comunitario):
• La Regla del Metro Cuadrado: Históricamente, el cuidado ha recaído casi en un 80% sobre las mujeres en el hogar o sobre la misma colaboradora servicial en la oficina (servir el café, recordar cumpleaños, lavar la losa, cuidar al enfermo). La práctica de la corresponsabilidad dice: Si ves la cafetera vacía, prepárala tú. Si ves la losa sucia, lávala sin que te lo pidan. Si un compañero está colapsado con una entrega, toma una parte de su tarea. Cuidar no es ayudar a quien le toca: es asumir que nos toca a todos.""",
            """[Presionar 'Siguiente ›' o flecha derecha '→'. Mantener el contacto visual con la cámara. Opcionalmente hacer clic en una tarjeta para mostrar el ejemplo flotante]

«Para empezar, quiero que nos hagamos una pregunta profunda: ¿qué es realmente cuidar? Muchas veces en el trabajo o en el hogar creemos que cuidar es solo una obligación médica, un trámite de enfermería o algo que hacemos únicamente cuando alguien enferma de gravedad.

[Señalar la cita en pantalla compartida y narrar con emoción la historia de Margaret Mead]

El filósofo Leonardo Boff nos recuerda una verdad hermosa: 'El cuidado no es un acto aislado ni una técnica; es el modo esencial de ser del ser humano'. Pensemos en esto: a la famosa antropóloga Margaret Mead le preguntaron una vez cuál era el primer signo de civilización humana. Muchos esperaban que dijera una rueda, un anzuelo o una olla de barro. ¿Saben qué respondió? 'Un fémur roto y cicatrizado'. 

Porque en la naturaleza salvaje, si un animal se quiebra una pata, muere devorado o de hambre. Para que un fémur humano cicatrizara, tuvo que existir otra persona que se quedó a su lado, que lo protegió de los depredadores, que le llevó agua y comida día tras día durante meses. La civilización no comenzó con las herramientas de hierro; comenzó con el cuidado mutuo.

Por eso, cuidar es vencer la indiferencia. Es notar cuando un compañero de trabajo o un familiar está callado y enviarle un mensaje corto de apoyo. Y es vivir la corresponsabilidad: el cuidado no es tarea exclusiva de las madres o de una sola persona en la oficina; es un pacto comunitario donde todos nos hacemos cargo de nuestro metro cuadrado.»"""
        ),

        # SLIDE 3
        (
            "Diapositiva 3: Momento de Interacción N° 1 (Votación en el Chat de Meet)",
            "2.5 minutos",
            "Pantalla interactiva completa: «¿Cuándo fue la última vez que te detuviste a cuidar de ti?» con 3 opciones grandes (A, B y C) con insignias de instrucción para escribir en el chat de Meet.",
            """☕ OPCIÓN A: Hoy me regalé unos minutos de silencio, respiración y calma.
• Feedback al hacer clic: «🌱 ¡Maravilloso! Mantener un espacio propio diario es la clave para llegar a la noche en equilibrio y no agotados».
• Análisis para Angie: Celebrar a quienes logran esto e invitarlos a compartir en el chat qué pequeña rutina hacen (un café sin afán, una oración, una caminata corta).

🏃 OPCIÓN B: Llevo semanas enteras corriendo en piloto automático sin parar.
• Feedback al hacer clic: «⚡ ¡Estás en el lugar indicado! Este espacio es el momento perfecto para soltar el afán y respirar».
• Análisis para Angie: Validar que el piloto automático anestesia nuestras emociones y nos desconecta de las señales de dolor del cuerpo.

🛑 OPCIÓN C: Me siento culpable o ansioso cada vez que me detengo a descansar.
• Feedback al hacer clic: «🤍 Regla de oro de esta noche: Descansar no es un premio que se gana, es una necesidad vital que se respeta».
• Análisis para Angie: Desmontar la creencia tóxica de que la valía personal depende de la hiperproductividad ininterrumpida.""",
            """[Al avanzar con 'Siguiente ›', se proyecta la pantalla de participación comunitaria]

[Invitar al grupo con tono cálido, relajado y participativo]

«Para esta primera pregunta, les tengo una sorpresa maravillosa: ¡no tenemos que escribir nada en el teclado! 

[Angie señala con su dedo hacia la parte inferior de la pantalla compartida con una sonrisa muy cálida]

Quiero que todos miren abajo en su pantalla de Google Meet, donde están los botones del micrófono y la camarita. Justo al ladito hay un botón redondo con una carita feliz sonriente: 😃. 
Si le hacen clic a esa carita, se abre una barrita con emojis muy bonitos que ustedes tienen ahí mismo a la mano: un corazón con brillos 💖, un pulgar arriba 👍, una fiesta 🎉, unos aplausos 👏, una carita pensativa 🤔 y una carita con lágrima 😢.

Miren la pregunta en pantalla: '¿Cuándo fue la última vez que te detuviste a cuidar de ti?'. Solo toquen con el ratón el emoji que sientan esta noche:

• Si hoy se regalaron unos minutos de silencio, café con calma o respiración profunda: toquen el Corazón con brillos 💖 o el Pulgar arriba 👍.
• Si sienten que llevan semanas enteras corriendo en piloto automático, sin parar de hacer cosas: toquen la Carita Pensativa 🤔 o de Sorpresa 😮.
• Y si sienten culpa o ansiedad cada vez que se sientan a descansar: toquen la Carita Triste 😢.

[Angie mira la pantalla y celebra con mucha alegría al ver flotar los emojis]

¡Miren cómo flotan esos emojis por toda la pantalla! ¡Qué hermoso se ve! Veo muchas caritas pensativas 🤔 y varias caritas tristes 😢 subiendo en la llamada... A todos los que pusieron esa carita pensativa o con lágrima, quiero regalarles este mensaje en pantalla:
Descansar no es un pecado ni es una pérdida de tiempo; el descanso es una necesidad biológica sagrada. El cuerpo humano no es una máquina de trabajar sin pausa; el descanso restaura nuestra memoria y nos devuelve la paz. ¡Un aplauso para todos por esa sinceridad tan hermosa!»"""
        ),

        # SLIDE 4
        (
            "Diapositiva 4: Las Tres Dimensiones del Cuidado (El Triángulo de Sostenibilidad)",
            "2 minutos",
            "Diagrama editorial interactivo conectando Autocuidado (Mente/Cuerpo - La Raíz), Cuidado del Otro (Vínculos - El Tronco) y Ecocuidado (Entorno - Las Ramas), con botones para abrir cada dimensión.",
            """💖 DIMENSIÓN I: Autocuidado (Conmigo - La Raíz):
• La analogía del avión y la mascarilla de oxígeno: En las instrucciones de vuelo siempre se indica: «En caso de despresurización, colóquese usted primero la mascarilla antes de intentar ayudar a sus hijos o acompañantes». Si te quedas sin oxígeno, te desmayas y no salvas a nadie. Si tú te enfermas de agotamiento crónico, tu familia y tu equipo se quedan sin timón. Cuidarte no es egoísmo: es tu primer deber ético.

💜 DIMENSIÓN II: Cuidado del Otro (Comunidad - El Tronco):
• La validación emocional: Cuando alguien te cuente que está agotado o triste, resiste la tentación de responderle de inmediato: «Eso no es nada, mira lo mío...» o «Tienes que tomar vitaminas». El cuidado del otro dice: «Te escucho, entiendo por qué te sientes así y es completamente válido que estés cansado. Tómate tu tiempo». Validar sana más que dar consejos apresurados.

🌱 DIMENSIÓN III: Ecocuidado (Naturaleza - Las Ramas):
• El respeto por el espacio común: El ecocuidado no es solo salvar glaciares lejanos; es no tirar una colilla en la acera, apagar la luz de la habitación que no usamos y separar el plástico limpio para que el reciclador de nuestro barrio trabaje con dignidad y seguridad.""",
            """[Avanzar con 'Siguiente ›'. Voz serena, estructurada y pedagógica]

«Para que la cultura del cuidado no sea solo una frase bonita de afiche, debemos comprenderla en su totalidad. Por eso les presento este modelo: El Triángulo del Cuidado Sostenible.

Imaginen un trípode de madera: si le quitamos una sola de sus tres patas, todo se derrumba. Lo mismo ocurre en nuestras vidas adultas:

1. La raíz es el Autocuidado: la relación conmigo misma, mi salud física, mi descanso y mi paz mental. Recuerden la analogía del avión: cuando la cabina se despresuriza, la azafata no te dice que le pongas la mascarilla a tu hijo primero; te ordena que te la pongas tú, porque si te desmayas por asfixia, no podrás salvar a nadie.
2. El tronco es el Cuidado del Otro: la calidad de nuestros vínculos, la capacidad de escuchar sin juzgar y validar los sentimientos de nuestra familia y compañeros.
3. Las ramas son el Ecocuidado: el respeto sagrado por nuestra Casa Común, empezando por nuestro metro cuadrado más inmediato.

Esta noche vamos a profundizar en cada una de estas tres dimensiones, comenzando por la que más solemos descuidar por atender a los demás: nosotras mismas.»"""
        ),

        # SLIDE 5
        (
            "Diapositiva 5: Dimensión I - El Arte del Autocuidado (Los 4 Hábitos)",
            "2.5 minutos",
            "Ilustración editorial sofisticada de mujer madura descansando plácidamente en sillón con aromática tibia, con 4 tarjetas de hábitos interactivos.",
            """🌙 HÁBITO 1: Descanso Reparador (El Toque de Queda Digital a las 9:30 PM):
• Cómo apagar el cerebro: La luz azul de las pantallas engaña al cerebro haciéndole creer que aún es mediodía, bloqueando la melatonina. Además, revisar correos o chats de trabajo de noche activa el cortisol (hormona del estrés). Práctica concreta: Deja el celular cargando fuera del alcance de la mano 30 minutos antes de acostarte. Reemplázalo por una aromática tibia y 5 respiraciones profundas con las manos en el pecho.

🛑 HÁBITO 2: Límites Amorosos (Decir NO sin Culpa ni Agresión):
• Fórmula asertiva: Cuando te pidan un compromiso que sobrepasa tus fuerzas físicas o emocionales, utiliza esta frase: «Agradezco mucho que pienses en mí, pero en este momento mis energías y tiempos están al límite y no podría entregarte la calidad que mereces. Por salud propia, debo declinar esta vez». Decirle NO a otros cuando estás al límite es decirte SÍ a ti misma.

🌿 HÁBITO 3: Pausa Mental (Los 5 Minutos Sagrados de la Tarde):
• Micro-práctica diaria: A las 4:00 PM, en lugar de tomarte el café trabajando frente al computador, levántate, ve a la ventana o al patio, siente el calor de la taza en tus manos y solo mira el cielo durante 5 minutos sin pantalla alguna. Tu sistema nervioso parasimpático se activará de inmediato.

💖 HÁBITO 4: Autocompasión (Desarmar el Látigo del Crítico Interno):
• Pregunta de oro: ¿Le hablarías a tu mejor amiga con la misma dureza con la que te hablas a ti misma cuando cometes un error? Nunca le dirías: «Qué incompetente eres, no sirves para nada». Aprende a decirte frente al espejo: «Hoy fue un día difícil, hiciste lo que pudiste con lo que tenías. Mañana será otro día y mereces descansar en paz». Hablarnos con ternura es la base de la salud mental.""",
            """[Avanzar con 'Siguiente ›'. Tono íntimo, suave y reflexivo]

«Miren la ilustración que comparto en pantalla: qué sensación de paz transmite esa mujer disfrutando de una aromática caliente, con su libro y rodeada de plantas.

¿Cuántas veces nos sentimos culpables por regalarnos un momento así? Solemos decirnos: 'no tengo tiempo para sentarme a descansar'. Pero grábense esta frase: nadie puede dar agua fresca si su propio cántaro está completamente seco. Si llegamos a la noche agotadas, irritables y con dolor de cabeza, ¿qué calidad de presencia le podemos dar a nuestros seres queridos?

Por eso, el autocuidado se cultiva en cuatro hábitos diarios muy concretos:
Primero, el descanso reparador: establecer un toque de queda digital antes de dormir para que el cerebro no se sature de luz azul ni de cortisol.
Segundo, el arte de poner límites amorosos: aprender a decir 'NO' con elegancia y sin culpa cuando nuestras fuerzas están al límite.
Tercero, la pausa consciente de la tarde: cinco minutos para tomarse un café mirando el cielo y respirando, sin responder mensajes.
Y cuarto, la autocompasión: dejar de tratarnos con el látigo del juicio interno y empezar a hablarnos como le hablaríamos a nuestra mejor amiga.»"""
        ),

        # SLIDE 6
        (
            "Diapositiva 6: Dinámica Virtual N° 1 («La Batería del Autocuidado en Meet»)",
            "3 minutos",
            "Pantalla interactiva limpia para el público: 'Termómetro de la Batería Humana' con 4 niveles interactivos (100% Verde, 75% Azul, 50% Amarillo, 25% Rojo), temporizador de 2 minutos y retroalimentación instantánea.",
            """🔋 NIVELES DE LA BATERÍA HUMANA Y ACCIÓN FACILITADORA:
• Nivel 100% (Verde - Plena Energía): Asistentes que llegan con vigor y entusiasmo. Acción: Invitarlos a ser faros de calma y apoyo para quienes están bajos de pila.
• Nivel 75% (Azul - Funcional con Cansancio Físico): Buen ánimo mental, pero el cuerpo empieza a pedir reposo. Acción: Validar su esfuerzo diario.
• Nivel 50% (Amarillo - Mitad de Carga): Sobreesfuerzo cognitivo, fatiga visual y dispersión. Acción: Enviarles corazones de apoyo.
• Nivel 25% (Rojo - Reserva Crítica): Personas al borde del agotamiento extremo o burnout. Acción: Felicitar su valentía de conectarse y recordarles que esta noche es para soltar toda exigencia.

🧘 EJERCICIO CORPORAL EN VIVO:
• Pausa de descompresión física: Guiar 3 respiraciones profundas (inhalar en 4 tiempos inflando el abdomen, retener en 2, exhalar despacio en 6 soltando el aire por la boca con un suspiro audible).
• Liberación cervical: Rotar hombros hacia atrás 3 veces y dejar caer suavemente la oreja derecha hacia el hombro derecho, luego hacia el izquierdo.""",
            """[Presionar 'Siguiente ›'. Elevar el tono de energía, calidez y entusiasmo dinámico]

«¡Atención a todos los conectados en Google Meet! Sé que es de noche y que estar frente a la pantalla cansa la vista. Así que vamos a hacer nuestra primera dinámica en vivo: 'El Termómetro de la Batería Humana'.

[Paso 1: Dinámica física de descompresión]
Antes de escribir en el chat, les voy a pedir a todos que suelten el mouse o el teclado. Pongan las dos plantas de los pies bien apoyadas en el piso. Vamos a inhalar profundo por la nariz inflando el abdomen... 1, 2, 3, 4... y soltamos el aire por la boca con un suspiro largo: ¡aaaaah!... Una vez más: inhalamos calma... y soltamos todo el estrés del día. Roten los hombros suavemente hacia atrás. ¡Qué bien se siente estirarse!

[Paso 2: Activación del temporizador de 2 minutos]
Ahora sí, acabo de activar nuestro temporizador de 2 minutos en pantalla. Miren los 4 niveles del termómetro: 100% verde, 75% azul, 50% amarillo o 25% rojo. Quiero que todos vayan al chat de Meet en este momento y escriban su porcentaje real.

[Paso 3: Lectura empática del chat y reacciones en Meet]
¡Empiezan a llegar los porcentajes! Veo a Patricia con 50%, a Juan con 25%, a Viviana con 75%, a Felipe con 25%... A todos los que pusieron 25% y 50%: gracias por su valentía. No están solos. 
Ahora los invito a usar la barra de reacciones de Meet: vamos a inundar la pantalla de corazones (❤️) y aplausos (👏) para arropar y recargar a todos los compañeros que hoy llegaron en reserva. ¡Miren cómo suben esos corazones! Eso es cultura del cuidado en vivo.»"""
        ),

        # SLIDE 7
        (
            "Diapositiva 7: Dimensión II - El Cuidado del Otro (Vínculos que Sanan)",
            "2.5 minutos",
            "Ilustración editorial sofisticada de un grupo diverso de adultos conversando con calidez en un espacio comunitario con plantas, acompañada de 4 tarjetas de vínculos interactivos.",
            """👂 VÍNCULO 1: Escucha Activa (La Regla de los Ojos y la Pantalla Abajo):
• Regalar presencia real: Cuando alguien te hable, voltea el celular boca abajo sobre la mesa o suelta el teclado. Mírale a los ojos. Tres minutos de presencia plena equivalen a dos horas de conversación a medias con el celular en la mano. La atención es la forma más pura de generosidad.

💬 VÍNCULO 2: Lenguaje Nutritivo (El Poder de una Frase Constructiva):
• Cambiar el reproche por la alianza: En vez de «Esto te quedó mal y tardaste mucho», di: «Valoro el esfuerzo que le pusiste a esta entrega; revisemos juntos estos dos detalles para que quede impecable». Desactiva la actitud defensiva y multiplica la motivación y el compromiso.

🤲 VÍNCULO 3: Solidaridad en la Fragilidad (Tender la Mano Cuando Alguien Falla):
• En el entorno laboral o familiar: Si un colega comete una equivocación insólita, no vayas a acusarlo con el jefe ni a exponerlo en público. Acércate en privado: «Oye, tú no sueles cometer estos errores, ¿estás bien?, ¿pasó algo en tu casa?, ¿cómo te ayudo a solucionarlo?». Eso es crear verdadera seguridad psicológica.

💐 VÍNCULO 4: Gratitud Invisible (Dignificar el Trabajo que Sostiene la Vida):
• El valor del aseo, la cocina y el soporte: Saluda por su nombre a la persona que limpia tu oficina, al celador de tu edificio o a quien cocinó en tu casa. Míralo a los ojos y dile: «Muchas gracias por cuidar de nosotros todos los días». Cambia el clima humano al instante.""",
            """[Avanzar con 'Siguiente ›'. Voz dulce, empática y conectora]

«Pasamos a la segunda dimensión: El Cuidado del Otro. Miren esa ilustración tan humana: personas mirándose a los ojos, compartiendo una charla sincera y creando comunidad.

La filósofa Carol Gilligan descubrió que los seres humanos nos desarrollamos plenamente cuando entendemos que nadie es una isla independiente. Vivimos en una red viva de relaciones. Pero en la sociedad moderna solemos tratarnos desde la prisa, la exigencia y la frialdad.

Cuidar al otro se manifiesta en cuatro actos profundamente transformadores:
El primero es la presencia real: la regla de bajar el celular cuando alguien nos habla. Mirar a los ojos a un hijo, a la pareja o al compañero de trabajo durante tres minutos de atención plena vale más que dos horas de conversación distraída.
El segundo es el lenguaje nutritivo: cambiar la crítica hiriente por palabras que construyen y reconocen el esfuerzo.
El tercero es el apoyo en la fragilidad: tenderle la mano al compañero que comete un error, preguntándole '¿cómo te ayudo?' en lugar de señalarlo o juzgarlo.
Y el cuarto es la gratitud con el trabajo invisible: saludar por su nombre y agradecer con el alma a las personas de servicios generales, vigilancia y soporte que sostienen nuestro día a día.»"""
        ),

        # SLIDE 8
        (
            "Diapositiva 8: Momento de Interacción N° 2 (Termómetro y Bálsamo Emocional en Meet)",
            "2.5 minutos",
            "Pantalla interactiva en 2 columnas: a la izquierda las 4 frases sanadoras con botones para votar en el chat de Meet, y a la derecha la tarjeta ampliada del Bálsamo Emocional con su fundamento psicológico.",
            """🍃 BÁLSAMO 1: «Vas bien, no te sobreexijas tanto hoy» (Autocompasión):
• Fundamento neurológico: El cerebro de un adulto moderno está programado para enfocarse en lo que «faltó por hacer» en lugar de celebrar lo que sí se logró. Esta frase le envía una señal química de seguridad al sistema nervioso: «La batalla de hoy terminó, estás a salvo». Cierra los ojos, pon una mano sobre tu corazón y repítete en silencio 3 veces: «Vas bien, hiciste lo mejor que pudiste, ahora descansa».

🤝 BÁLSAMO 2: «Cuenta conmigo, aquí estoy para ti si me necesitas» (Presencia y Sostén):
• El antídoto contra la soledad: No necesitamos que nos resuelvan los problemas; necesitamos saber que no estamos solos en la trinchera. Saber que hay un hombro donde apoyarse reduce la presión arterial y la ansiedad nocturna.

💐 BÁLSAMO 3: «Gracias por todo lo que haces con tanto amor» (Reconocimiento):
• El alimento emocional que renueva las fuerzas: Pasamos la vida dando lo mejor en la casa y en el trabajo, y muchas veces sentimos que se toma como una obligación fría. Un agradecimiento sincero le devuelve el brillo a los ojos y reconecta con el sentido de la vida.

🌙 BÁLSAMO 4: «Descansa sin culpa, te has ganado esta noche de paz» (Permiso para Soltar):
• El derecho innegociable a dormir en paz: Muchas personas se van a la cama sintiendo culpa por no haber contestado el último correo o no haber limpiado hasta el último rincón. Esta noche te damos el permiso sagrado de soltar. El mundo seguirá girando; tú mereces paz.""",
            """[Avanzar con 'Siguiente ›'. Tono íntimo, reconfortante y acogedor]

«A todos los que estamos conectados en este encuentro nos pasa: a veces terminamos el día con el corazón cargado y la mente llena de preocupaciones. Por eso diseñamos este espacio: 'Las 4 Heridas Modernas y sus Bálsamos'.

Miren las cuatro frases sanadoras en pantalla. Vamos a elegir cuál necesita nuestro corazón esta noche tocando el emoji correspondiente en la barrita de Google Meet:

• Si necesitas escuchar «Vas bien, no te sobreexijas tanto hoy»: toca el Corazón con brillos 💖.
• Si necesitas escuchar «Cuenta conmigo, aquí estoy para ti»: toca el Pulgar arriba 👍 o los Aplausos 👏.
• Si necesitas escuchar «Gracias por todo lo que haces con tanto amor»: toca la Fiesta 🎉.
• Si necesitas escuchar «Descansa sin culpa, te has ganado esta noche de paz»: toca la Carita Pensativa 🤔 o el Corazón 💖.

[Hacer clic en cada frase para mostrar cómo cambia el bálsamo en pantalla]

Miren los números en el chat: la 1 y la 4 están llenando la pantalla.
A quienes eligieron la 1: Su cerebro está agotado de exigirse perfección. Hoy hicieron lo mejor que pudieron con los recursos que tenían. Celébrenlo.
Y a quienes eligieron la 4: Esta noche tienen permiso oficial para soltar los pendientes. El trabajo no se va a ir, el mundo no se va a acabar. Cierren los ojos con la certeza de que su descanso es sagrado.»"""
        ),

        # SLIDE 9
        (
            "Diapositiva 9: Dimensión III - El Ecocuidado (Nuestra Casa Común)",
            "2 minutos",
            "Ilustración editorial sofisticada de un parque urbano con adultos cuidando huertas, árboles y reciclando con alegría, con 4 tarjetas de acciones ecológicas cotidianas.",
            """🛍️ ACCIÓN 1: Consumo Consciente (La Pausa de las 24 Horas):
• Hábito de sobriedad: Antes de comprar algo en internet o en una tienda, pregúntate: «¿De verdad lo necesito o solo estoy buscando calmar la ansiedad o el vacío del día?». Espera 24 horas. El 70% de las compras impulsivas desaparecen al día siguiente, ahorrando dinero y reduciendo basura.

💧 ACCIÓN 2: Agua y Vida (Cerrar la Llave y Respetar el Recurso):
• Práctica concreta: Cierra la llave mientras te enjabonas o te cepillas los dientes. Nunca arrojes aceites usados de cocina por el sifón (un solo litro de aceite contamina hasta 1.000 litros de agua pura). Cuidar el agua es cuidar a las familias que sufren sequía.

🏡 ACCIÓN 3: Entorno Limpio (El Andén Impecable como Respeto Vecinal):
• Buen vecino: Barrer el frente de tu casa, recoger los residuos de tu mascota y no dejar bolsas de basura en horarios indebidos es la ecología más cercana: el respeto por la vista, la higiene y la salud de la comunidad.

🌳 ACCIÓN 4: Legado Verde (Sembrar una Planta o Cuidar un Árbol en Familia):
• Educación con el ejemplo: Enseñar a un niño o compartir en familia el riego de una planta aromática enseña la paciencia de los ciclos naturales frente a la inmediatez efímera de las pantallas.""",
            """[Avanzar con 'Siguiente ›'. Voz inspiradora, enérgica y reflexiva]

«Llegamos a la tercera dimensión del triángulo: El Ecocuidado, nuestra relación con la naturaleza y el espacio común. Miren esa ilustración tan viva y luminosa.

Muchas veces pensamos que la ecología es algo exclusivo de científicos en el Polo Norte o de grandes cumbres internacionales. Pero el teólogo Leonardo Boff nos enseñó algo revolucionario: la Tierra no es un depósito de recursos para saquear; es nuestra Casa Común viva, y su cuidado empieza en nuestro metro cuadrado.

El ecocuidado cotidiano se traduce en cuatro compromisos muy simples:
Primero, el consumo consciente: hacer una pausa de 24 horas antes de comprar por impulso para no llenar la casa de objetos innecesarios que terminarán siendo basura.
Segundo, el cuidado sagrado del agua: cerrar el grifo y jamás verter aceite de cocina por el sifón, recordando que un solo litro contamina mil litros de agua potable.
Tercero, el respeto por el espacio común: mantener limpio el frente de nuestra vivienda y ser vecinos impecables.
Y cuarto, el legado verde: reconectar con la tierra cuidando una planta o sembrando un árbol, enseñando a las nuevas generaciones que la vida requiere tiempo, abono y paciencia.»"""
        ),

        # SLIDE 10
        (
            "Diapositiva 10: El Cuidado en el Entorno Laboral (Salud y Bienestar)",
            "2.5 minutos",
            "Ilustración editorial sofisticada de oficina moderna y luminosa con profesionales interactuando con empatía, ergonomía y pausas activas, acompañada de 4 tarjetas laborales interactivas.",
            """💺 TRABAJO 1: Ergonomía Real y Salud Física (La Regla 50-10):
• Volver sano a casa: Por cada 50 minutos sentado frente al computador, levántate 60 segundos. Estira los brazos, rota los tobillos y mira por la ventana a un punto lejano para descansar el músculo ocular. El trabajo pasa, pero tu cuerpo es tu única casa.

🛡️ TRABAJO 2: Seguridad Psicológica (Desarmar el Chisme y la Burla):
• Práctica de cero hostilidad: Cuando en un pasillo o chat de WhatsApp empiecen a hablar mal de alguien ausente, frena la cadena diciendo amablemente: «Mejor hablemos con él directamente cuando esté presente para apoyarlo». Crear un entorno donde se pueda preguntar sin miedo a parecer tonto es el mayor activo de un equipo.

⏱️ TRABAJO 3: Ritmos Sostenibles (Prevenir el Burnout en el Equipo):
• Salud organizacional: Un equipo que trabaja permanentemente en emergencia rinde un 40% menos y sufre rotación y ausentismo. Distribuir fechas de entrega realistas y respetar los horarios de descanso y vacaciones protege la salud mental de todos.

👔 TRABAJO 4: Liderazgo del Cuidado (Preguntar «¿Cómo estás?» Antes de Pedir Cifras):
• Liderar desde la cercanía y el respeto: Inicia cada conversación preguntando: «¿Cómo estás hoy?, ¿cómo está tu familia?». Cuando las personas se sienten cuidadas y valoradas como seres humanos, cuidan su trabajo con amor y lealtad.""",
            """[Avanzar con 'Siguiente ›'. Tono profesional, asertivo y de liderazgo consciente]

«Hablemos ahora del lugar donde pasamos la mayor parte de nuestras horas adultas: el trabajo. Miren esa escena de trabajo saludable, luminosa y colaborativa.

Durante décadas se nos enseñó erróneamente que el ámbito laboral debía ser un campo de batalla implacable donde el estrés extremo era sinónimo de compromiso. Hoy la neurociencia y la psicología organizacional han demostrado exactamente lo contrario: los equipos más productivos, innovadores y leales son aquellos donde existe una sólida Cultura del Cuidado.

En el trabajo, cuidar significa cuatro cosas fundamentales:
1. Cuidar el cuerpo: aplicar la regla 50-10, levantarse a estirar y descansar la vista. Nuestra primera meta laboral siempre debe ser regresar sanos a casa con nuestra familia.
2. Construir seguridad psicológica: desterrar la burla, el chisme de pasillo y el miedo a equivocarse.
3. Ritmos sostenibles: entender que trabajar permanentemente en modo de emergencia quema a la gente y destruye la creatividad.
4. Y un liderazgo con corazón: empezar las reuniones preguntando por la persona antes de exigir los números. Cuando la gente se siente cuidada, cuida el trabajo con el alma.»"""
        ),

        # SLIDE 11
        (
            "Diapositiva 11: Dinámica Virtual N° 2 («El Muro de la Gratitud y el Buen Trato»)",
            "3.5 minutos",
            "Pantalla interactiva en 2 columnas: a la izquierda el Muro con 4 notas adhesivas interactivas de agradecimiento (Post-Its) y a la derecha el panel de facilitación con temporizador de 2 minutos y banner de llamado a la acción.",
            """💌 PLANTILLAS DE AGRADECIMIENTO EN LOS POST-ITS:
• Post-It 1 (Paciencia en Días Difíciles): «Hola [Nombre], hoy quiero agradecerte de corazón por la paciencia y calma que tuviste cuando todo estaba enredado. Tu serenidad me ayudó a no desesperar. ¡Valoro mucho tenerte en mi equipo!».
• Post-It 2 (Solidaridad en Emergencias): «[Nombre], gracias por haber asumido mis pendientes cuando tuve esa emergencia familiar. Saber que me cubrías con cariño me dio una paz infinita. Cuenta conmigo siempre».
• Post-It 3 (Escucha sin Juicio): «[Nombre], gracias por el café de hoy y por escucharme con tanta empatía. Necesitaba desahogarme sin sentirme juzgado. Eres un regalo de persona en mi vida».
• Post-It 4 (Dedicación Silenciosa): «[Nombre], hoy quiero decirte que noto todo lo que haces cada día para que las cosas salgan bien, incluso lo que nadie aplaude. Gracias por tu entrega y por tu calidez humana».

✋ PROTOCOLO DE INTERVENCIÓN POR VOZ:
• Invitar a 1 o 2 personas a utilizar la función 'Levantar la mano' de Meet para leer su mensaje con su propia voz en vivo durante 30 segundos.""",
            """[Presionar 'Siguiente ›'. Voz entusiasta, cálida y de profunda conexión humana]

«Llegamos a nuestro segundo momento dinámico en vivo: 'El Muro de la Gratitud y el Buen Trato'. 

La gratitud es el pegamento invisible que une a las familias y a los equipos de trabajo. Cuando agradecemos a alguien, el cerebro de esa persona libera oxitocina y dopamina, reduciendo el estrés y renovando sus ganas de seguir adelante.

[Paso 1: Activación del temporizador de 2 minutos]
Acabo de iniciar nuestro temporizador en pantalla. Miren los cuatro post-its de ejemplo: agradecimiento por paciencia, por cubrirnos en una emergencia, por escucharnos sin juzgar o por el trabajo silencioso de todos los días.

[Paso 2: Llamado a la acción en el chat de Meet]
Quiero que todos vayan al chat de Meet y escriban un mensaje con esta estructura:
'Agradezco a [Nombre de un compañero, familiar o líder] por [una cualidad o apoyo específico]'. ¡Inunden ese chat de aprecio genuino!

[Paso 3: Lectura en vivo de los mensajes con profunda emoción]
¡Qué belleza de mensajes están apareciendo!
[Angie lee en voz alta con nombre propio varios de los agradecimientos que van saliendo en el chat de Meet]
'Claudia le agradece a Roberto por su paciencia infinita enseñándole el sistema...'
'Andrés le agradece a Diana por cubrirlo cuando su hijo enfermó...'

[Paso 4: Abrir micrófono a 1 mano levantada]
¿Quién se anima a dedicar su agradecimiento en voz alta? Si alguien quiere decirlo con su propia voz, levante la mano con el botón de Meet... ¡Adelante María, abre tu micrófono y compártenos tu agradecimiento! [Escucharla con atención y aplaudir al final]. ¡Qué momento tan conmovedor!»"""
        ),

        # SLIDE 12
        (
            "Diapositiva 12: ¿Qué Daña la Cultura del Cuidado? (Reflexión Crítica y Antídotos)",
            "2.5 minutos",
            "Cuadrícula interactiva de 4 tarjetas con las grandes amenazas modernas (Prisa Crónica, Indiferencia, Individualismo, Burnout) y sus antídotos prácticos desplegables.",
            """🛑 BARRERA 1: La Prisa Crónica:
• El problema: Confundir velocidad con efectividad. Vivir acelerados nos hace torpes emocionalmente y nos impide mirar a quienes nos rodean.
• Antídoto práctico: La pausa de los 30 segundos. Cuando sientas que estás corriendo en automático, para 30 segundos, baja los hombros y respira. Pregúntate: «¿Se va a acabar el mundo si esto espera 15 minutos?». La respuesta casi siempre es NO.

👁️ BARRERA 2: La Indiferencia Cotidiana:
• El problema: Acostumbrarnos a la frialdad y tratar a las personas como objetos utilitarios.
• Antídoto práctico: El saludo cálido y llamar por el nombre. Saluda mirando a los ojos al celador, al cajero, al conductor y al compañero nuevo. Nombrar a una persona la rescata de la invisibilidad.

🤝 BARRERA 3: El Individualismo y la Falsa Autosuficiencia:
• El problema: El mito de que 'yo no necesito de nadie y puedo con todo solo'. Aísla y debilita.
• Antídoto práctico: La valentía de pedir ayuda. Decir con humildad: «Amigo, hoy no alcanzo solo, ¿me puedes dar una mano?» crea un lazo más fuerte que aparentar que todo está bajo control. La vulnerabilidad compartida es la madre de la confianza.

🛡️ BARRERA 4: El Burnout y el Síndrome del Superhéroe:
• El problema: Creer que si uno no lo hace, nadie lo hará bien. Cargar con culpas ajenas.
• Antídoto práctico: Soltar la armadura y delegar. Deja que tus hijos recojan sus cosas, deja que tus compañeros hagan su parte aunque no lo hagan exactamente a tu manera. Tu salud mental vale más que la perfección obsesiva.""",
            """[Avanzar con 'Siguiente ›'. Tono reflexivo, firme, lúcido y orientador]

«Para proteger la Cultura del Cuidado, debemos ser conscientes de los enemigos silenciosos que intentan destruirla todos los días. En pantalla vemos cuatro barreras cotidianas:

La primera es la Prisa Crónica: ese afán de correr todo el día que nos vuelve ciegos ante el dolor del otro. Su antídoto es aprender a pausar 30 segundos, respirar hondo y preguntarnos: '¿se va a acabar el mundo si esto espera 15 minutos?'. Casi nunca se acaba.

La segunda es la Indiferencia: caminar por la vida como zombis sin mirar a nadie. Su antídoto es el saludo cálido llamando a la gente por su nombre. Nombrar a alguien con cariño es recordarle que su existencia importa.

La tercera es el Individualismo: esa falsa creencia de que pedir ayuda es signo de debilidad. Su antídoto es la humildad valiente de decir: 'amigo, hoy no alcanzo solo, ¿me das una mano?'. Pedir ayuda une a los seres humanos.

Y la cuarta es el Burnout y el síndrome del superhéroe: querer cargarlo todo solas en el hogar o en la oficina. Su antídoto es soltar la armadura, delegar y confiar en los demás. La salud de ustedes vale más que la obsesión por el control.»"""
        ),

        # SLIDE 13
        (
            "Diapositiva 13: El Decálogo de la Cultura del Cuidado (Los 10 Principios)",
            "2.5 minutos",
            "Muro editorial de 10 principios numerados, organizados en 2 columnas elegantes (Autocuidado, Convivencia, Entorno), con tipografía destacada y llamados a la acción para la vida diaria.",
            """📜 LOS 10 PRINCIPIOS DE ORO DE LA CULTURA DEL CUIDADO:
1. El descanso no es un premio, es una necesidad vital innegociable.
2. Colocarte la mascarilla de oxígeno primero es un acto de amor y responsabilidad.
3. Hablarte con ternura frente al espejo y desactivar el látigo del crítico interno.
4. Regalar presencia plena: mirada limpia y pantallas abajo cuando alguien te habla.
5. Validar las emociones del otro antes de apresurarse a dar consejos fríos.
6. Corresponsabilidad activa: cuidar de los espacios y las cargas nos toca a todos.
7. Construir seguridad psicológica en el trabajo, desarmando la burla y el chisme.
8. Hacer florecer nuestro metro cuadrado: cuidar el agua, la energía y el entorno común.
9. Agradecer a diario el trabajo invisible de quienes sostienen nuestra cotidianidad.
10. Cuidar es el modo más sabio y valiente de existir: hacer que la vida florezca.""",
            """[Avanzar con 'Siguiente ›'. Voz solemne, inspiradora y contundente]

«Como síntesis de todo lo vivido esta noche, quiero presentarles nuestro Decálogo de la Cultura del Cuidado: diez principios fundamentales para llevar en el corazón y aplicar a partir de mañana:

[Leer con ritmo cadencioso y seguro los puntos más representativos]
1. Mi descanso es sagrado e innegociable.
2. Cuidarme primero no es egoísmo; es asegurar que podré cuidar a los que amo.
3. Me hablaré a mí misma con la misma compasión y ternura con la que le hablo a mi mejor amiga.
4. Cuando alguien me hable, voltearé mi celular y le regalaré mi mirada atenta.
5. Validaré los sentimientos de los demás antes de juzgar o dar consejos rápidos.
6. Asumiré la corresponsabilidad en mi casa y en mi trabajo sin esperar a que me lo pidan.
7. Protegeré a mi equipo de trabajo, desarmando chismes y creando seguridad.
8. Cuidaré mi metro cuadrado de naturaleza, ahorrando agua y respetando los espacios comunes.
9. Daré las gracias a quienes realizan las labores invisibles que sostienen mi día.
10. Y recordaré siempre que cuidar es el modo supremo de ser humanos.

¿Cuál de estos 10 principios resuena más con ustedes hoy? Escriban el número en el chat mientras nos preparamos para el cierre.»"""
        ),

        # SLIDE 14
        (
            "Diapositiva 14: Cierre Inspirador, Micrófonos Abiertos y Despedida",
            "3 minutos",
            "Pantalla limpia con emblema floral animado, cita de cierre en tipografía editorial serif, firma destacada de Angie Gómez y etiquetas para preguntas y diálogo final.",
            """🌿 METÁFORA DEL ÁRBOL DEL CUIDADO:
• La analogía del árbol frondoso: Para que un árbol dé sombra generosa, flores hermosas y frutos dulces a la comunidad, necesita tener sus raíces profundamente regadas y nutridas en la tierra. Las raíces son nuestro autocuidado; el tronco son nuestras relaciones; y las ramas que dan sombra son nuestro trabajo y nuestro legado en el mundo. Si secamos la raíz, el árbol entero se marchita.

🌷 MENSAJE FINAL Y APERTURA DE MICRÓFONOS:
• Agradecer a los asistentes por su presencia, empatía y participación activa.
• Desear una noche de descanso profundamente reparador y libre de culpas.
• Abrir micrófonos en Meet para un aplauso colectivo y despedida en vivo.""",
            """[Avanzar con 'Siguiente ›'. Mirar directo al lente de la cámara con una sonrisa amplia, serena y gratificante]

«Para concluir este hermoso encuentro en Google Meet, quiero dejarles esta certeza en el corazón:

[Leer con profunda convicción y pausa]

'El cuidado no es debilidad ni ingenuidad: es la fuerza más sabia, valiente y transformadora para sanar nuestras vidas, nuestros equipos de trabajo y nuestro planeta.'

Miren la metáfora del árbol que nos acompaña: para que un árbol pueda regalarle sombra y frutos a los demás, necesita tener sus raíces bien regadas. Ustedes son esa raíz. Cuiden de sí mismos, cuiden sus descansos, trátense con amor y cuiden a quienes caminan a su lado.

Gracias infinitas a cada una y cada uno de ustedes por encender sus cámaras, por compartir sus porcentajes en el chat, por inundar la pantalla de corazones y por regalarse este momento de bienestar.

Mi nombre es Angie Gómez, y los invito a abrir sus micrófonos libremente para saludarnos, regalarnos un aplauso colectivo y cerrar esta noche con la mejor energía. ¡Que tengan un descanso profundamente reparador! ¡Muy buenas noches a todos!»"""
        )
    ]

    for title, dur, visual, tarjetas, discurso in slides_guion:
        add_heading_1(doc, title, space_before=16, space_after=3)
        add_p(doc, f"⏱️ Tiempo estimado: {dur}", bold=True, font_size=9.5, color=COLOR_ROSE, space_after=3)
        
        # Cuadro de apoyo visual
        add_callout(doc, visual, title="🖼️ QUÉ SE PROYECTA EN LA PANTALLA COMPARTIDA DE GOOGLE MEET:", fill_hex="F0F9FF", border_hex="BAE6FD", title_color=COLOR_BLUE)

        # Cuadro de tarjetas interactivas y ejemplos prácticos
        add_callout(doc, tarjetas, title="💡 CONTENIDO CLAVE Y EJEMPLOS PRÁCTICOS DE LAS TARJETAS (Para profundizar con el público):", fill_hex="FFF5F7", border_hex="FBCFE8", title_color=COLOR_ROSE)

        # Discurso para hablar
        add_heading_2(doc, "🗣️ GUION VERBAL DE FACILITACIÓN EN GOOGLE MEET (Angie Gómez):", space_before=6, space_after=3)
        
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
        ("Compartir la Pestaña Correcta en Meet:", "Al iniciar la videollamada, haz clic en 'Compartir' y selecciona la opción de ventana o pestaña de navegador con la presentación abierta. Esto garantiza nitidez de alta definición y animación fluida."),
        ("Navegación Fluida con 'Siguiente ›':", "Solo debes presionar el botón 'Siguiente ›' en la barra inferior o la tecla flecha derecha '→' de tu teclado. Las 14 diapositivas avanzan de forma continua."),
        ("Uso de los Ejemplos en Vivo:", "Cada tarjeta de la presentación web tiene un botón interactivo que abre una ventana emergente. Puedes apoyarte en el contenido de este guion para narrar esos ejemplos con soltura y naturalidad."),
        ("Uso de los Temporizadores en Vivo:", "En las Diapositivas 6 y 11, haz clic directamente en '▶ Iniciar 2 Minutos'. Todos los asistentes verán el cronómetro grande en la pantalla compartida de Meet, lo que genera expectativa y dinamismo."),
        ("Lectura Cálida del Chat en Tiempo Real:", "El secreto de una facilitadora de alto nivel en Meet es leer los nombres y comentarios de la gente en voz alta (ej. '¡Gracias Marcela por tu mensaje!', 'Veo que Carlos dice 25%...'). Esto combate la frialdad de la pantalla y hace sentir a cada participante plenamente escuchado."),
        ("Gestión de Micrófonos y Manos Levantadas:", "En la Diapositiva 11, utiliza la función nativa de Meet 'Levantar la mano' (✋) para dar la palabra ordenada a 1 o 2 personas, evitando interrupciones o audios cruzados."),
        ("Puntualidad y Respeto al Descanso:", "Finalizar la sesión en los 35-40 minutos estipulados demuestra un profundo respeto por el descanso nocturno de los participantes, cerrando el encuentro con una altísima percepción de valor y profesionalismo.")
    ]
    for k, v in tips:
        add_p(doc, f"• {k} {v}", bold=False, font_size=9.5, space_after=3.5)

    # Guardar documento en Desktop y Descargas
    path_desk = r"C:\Users\lenovo\Desktop\trabajos andres\Guion_Exposicion_Cultura_del_Cuidado_Angie_Gomez.docx"
    path_down = r"C:\Users\lenovo\Downloads\Guion_Exposicion_Cultura_del_Cuidado_Angie_Gomez.docx"

    print("Guardando guion maestro expandido de Angie Gómez en Escritorio...")
    doc.save(path_desk)
    print("Guardando guion maestro expandido de Angie Gómez en Descargas...")
    doc.save(path_down)
    print("Guion DOCX expandido generado exitosamente.")

if __name__ == "__main__":
    build_guion()
