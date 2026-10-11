# -*- coding: utf-8 -*-
"""
Actualiza build_comprehensive_guion.py para adaptar todas las dinámicas a personas mayores
utilizando los emojis nativos de la barra de Google Meet (💖 👍 🎉 👏 😂 😮 😢 🤔 👎).
"""

with open('scratch/build_comprehensive_guion.py', 'r', encoding='utf-8') as f:
    text = f.read()

# 1. Actualizar Ficha Técnica
text = text.replace(
    '("Herramientas en Meet:", "Chat para votaciones rápidas | Reacciones (❤️, 👏) para recargar energía | Opción \'Levantar la mano\' (✋) para intervenciones habladas")',
    '("Dinámicas Adaptadas a Adultos Mayores:", "Cero estrés tecnológico: NO requiere escribir en el teclado. Se participa con un solo clic en la barra nativa de emojis de Meet (💖 👍 🎉 👏 😂 😮 😢 🤔 👎) o levantando la mano (✋) para hablar con voz propia")'
)

# 2. Actualizar Protocolo de Facilitación
old_proto = """    # PROTOCOLO DE FACILITACIÓN EN GOOGLE MEET
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
          font_size=9.5)"""

new_proto = """    # PROTOCOLO DE FACILITACIÓN EN GOOGLE MEET PARA ADULTOS MAYORES
    add_heading_2(doc, "Protocolo de Facilitación y Manejo de Emojis de Google Meet para Personas Mayores (Angie Gómez)")
    add_p(doc, 
          "Dado que los participantes son personas mayores y adultas con poca familiaridad tecnológica, pedirles que escriban en el teclado o busquen el chat genera frustración, ansiedad y desconexión. "
          "Por esta razón, todas las dinámicas de este guion han sido rediseñadas para resolverse con un SOLO CLIC sobre la barra flotante de reacciones que Google Meet pone a la mano (el botón de la carita feliz 😃):\n"
          "• La Barra Flotante de Emojis de Meet (A la mano): Explica con mucha dulzura y paciencia dónde está el botón: en la parte inferior de la pantalla, al lado del micrófono y la cámara, hay un círculo con una carita feliz 😃. Al tocarla, se despliegan de inmediato los 9 emojis oficiales de Google Meet: Corazón con brillos (💖), Pulgar arriba (👍), Fiesta/Confeti (🎉), Aplausos (👏), Risa (😂), Sorpresa (😮), Tristeza/Lágrima (😢), Pensativo (🤔) y Pulgar abajo (👎).\n"
          "• Participación Sin Escribir: Para votar o compartir su estado de energía, los adultos mayores solo tienen que hacer un clic con su ratón sobre el emoji que elijan. El emoji flotará en la pantalla de todos como magia, haciéndolos sentir escuchados y protagonistas sin ninguna dificultad técnica.\n"
          "• Recarga Colectiva con Corazones (💖) y Aplausos (👏): Quienes tengan más energía pueden presionar varias veces el corazón y los aplausos para inundar la llamada de afecto visible y animar a los compañeros que se sientan cansados.\n"
          "• Botón de la Manito (✋): Quien desee compartir una anécdota o agradecer, solo debe tocar la mano en la barra para que Angie le dé la palabra y hable con su propia voz sin teclear nada.\n"
          "• Ventanas Modales con Historias: Angie cuenta en su guion con todas las historias y casos de las tarjetas (Margaret Mead, el descanso digital, la regla 50-10) para narrarlas de forma amena y pedagógica.", 
          font_size=9.5)"""

text = text.replace(old_proto, new_proto)

# 3. Actualizar Diapositiva 3 (Discurso con Emojis)
old_d3_discurso = """«Quiero ver el chat de este Google Meet activo. Miren la pregunta que tenemos en pantalla: '¿Cuándo fue la última vez que te detuviste a cuidar de ti?'. Les voy a pedir que escriban en el chat de la llamada la letra con la que más se identifiquen esta noche:

• Escriban A: Quienes hoy se regalaron unos minutos de silencio, respiración y calma.
• Escriban B: Quienes sienten que llevan semanas enteras corriendo en piloto automático sin parar.
• Escriban C: Quienes se sienten culpables o ansiosos cada vez que se detienen a descansar, porque sienten la presión interna de que 'deberían estar produciendo algo'.

[Hacer clic en las opciones para mostrar las reflexiones mientras se lee el chat en vivo]

¡Miren ese chat! Veo muchas B y muchísimas C. Veo a Marcela diciendo B, a Carlos con C, a Sandra, a Javier... Para todos los que marcaron B y C, quiero decirles algo que deben grabarse en el alma esta noche:

Descansar no es un premio que se gana cuando el cuerpo ya no da más y colapsa en una cama; descansar es una necesidad biológica tan sagrada como respirar o beber agua. El descanso restaura tu cerebro, equilibra tus emociones y te devuelve la lucidez. ¡Gracias infinitas por su sinceridad en el chat!»"""

new_d3_discurso = """«Para esta primera pregunta, les tengo una sorpresa maravillosa: ¡no tenemos que escribir nada en el teclado! 

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

text = text.replace(old_d3_discurso, new_d3_discurso)

# 4. Actualizar Diapositiva 6 (Discurso de la Batería con Emojis)
old_d6_discurso = """«¡Atención a todos los conectados en Google Meet! Sé que es de noche y que estar frente a la pantalla cansa la vista. Así que vamos a hacer nuestra primera dinámica en vivo: 'El Termómetro de la Batería Humana'.

[Paso 1: Dinámica física de descompresión]
Antes de escribir en el chat, les voy a pedir a todos que suelten el mouse o el teclado. Pongan las dos plantas de los pies bien apoyadas en el piso. Vamos a inhalar profundo por la nariz inflando el abdomen... 1, 2, 3, 4... y soltamos el aire por la boca con un suspiro largo: ¡aaaaah!... Una vez más: inhalamos calma... y soltamos todo el estrés del día. Roten los hombros suavemente hacia atrás. ¡Qué bien se siente estirarse!

[Paso 2: Activación del temporizador de 2 minutos]
Ahora sí, acabo de activar nuestro temporizador de 2 minutos en pantalla. Miren los 4 niveles del termómetro: 100% verde, 75% azul, 50% amarillo o 25% rojo. Quiero que todos vayan al chat de Teams en este momento y escriban su porcentaje real.

[Paso 3: Lectura empática del chat y reacciones en Teams]
¡Empiezan a llegar los porcentajes! Veo a Patricia con 50%, a Juan con 25%, a Viviana con 75%, a Felipe con 25%... A todos los que pusieron 25% y 50%: gracias por su valentía. No están solos. 
Ahora los invito a usar la barra de reacciones de Teams: vamos a inundar la pantalla de corazones (❤️) y aplausos (👏) para arropar y recargar a todos los compañeros que hoy llegaron en reserva. ¡Miren cómo suben esos corazones! Eso es cultura del cuidado en vivo.»"""

new_d6_discurso = """«¡Llegó el momento de nuestra primera gran dinámica: 'El Termómetro de la Batería Humana'! Y la vamos a hacer de la forma más fácil y divertida del mundo, con los emojis de Google Meet que tenemos a la mano.

[Paso 1: Dinámica física de descompresión sentados]
Antes de tocar nada, soltemos las manos. Apoyen bien los pies en el piso. Vamos a respirar juntos: tomamos aire despacito por la nariz... inflando la pancita... 1, 2, 3... y lo soltamos por la boca como un suspiro suave: ¡aaaaah!... Qué delicia. Ahora suban los hombros hacia las orejas y déjenlos caer pesados hacia atrás... Una vez más: arriba hombros... y sueltan. El cuerpo agradece cada respiro.

[Paso 2: Dinámica de la Batería con la Barra de Emojis]
Ahora miren la pantalla: tenemos los 4 niveles de la batería humana asociados a los emojis de Google Meet:
• Si tu batería está en el suelo, te sientes agotado o adolorido (Batería 25%): toca en la barrita la Carita con Lágrima 😢.
• Si estás a mitad de pila, cansado pero aguantando el día (Batería 50%): toca la Carita Pensativa 🤔.
• Si tienes buena energía y ánimo estable (Batería 75%): toca los Aplausos 👏.
• Y si estás lleno de vitalidad y ánimo (Batería 100%): toca la Fiesta 🎉 o el Pulgar arriba 👍.

[Paso 3: Lluvia de Recarga Colectiva con Corazones]
¡Acabo de activar el reloj de 2 minutos! Miren cómo empiezan a subir los emojis en la llamada... 
¡Atención al grupo! Veo a varios compañeros con la carita con lágrima 😢 y la pensativa 🤔. 
Ahora viene la misión de amor del equipo: todos los que tengan un poquito de energía, toquen sin parar el Corazón con brillos 💖 y los Aplausos 👏. ¡Inundemos la llamada de corazones flotantes para abrazar y recargar de energía a quienes llegaron agotados hoy! 
¡Miren esa lluvia hermosa de corazones 💖💖💖! Eso es cuidarnos en comunidad. ¡Gracias por ese cariño tan grande!»"""

text = text.replace(old_d6_discurso, new_d6_discurso)

# 5. Actualizar Diapositiva 8 (Discurso Bálsamos con Emojis)
old_d8_discurso = """Miren las cuatro frases en pantalla y escriban en el chat de Meet el número (1, 2, 3 o 4) de la frase que más necesitaría escuchar su corazón esta noche:

• La 1: «Vas bien, no te sobreexijas tanto hoy».
• La 2: «Cuenta conmigo, aquí estoy para ti si me necesitas».
• La 3: «Gracias por todo lo que haces con tanto amor».
• O la 4: «Descansa sin culpa, te has ganado esta noche de paz»."""

new_d8_discurso = """Miren las cuatro frases sanadoras en pantalla. Vamos a elegir cuál necesita nuestro corazón esta noche tocando el emoji correspondiente en la barrita de Google Meet:

• Si necesitas escuchar «Vas bien, no te sobreexijas tanto hoy»: toca el Corazón con brillos 💖.
• Si necesitas escuchar «Cuenta conmigo, aquí estoy para ti»: toca el Pulgar arriba 👍 o los Aplausos 👏.
• Si necesitas escuchar «Gracias por todo lo que haces con tanto amor»: toca la Fiesta 🎉.
• Si necesitas escuchar «Descansa sin culpa, te has ganado esta noche de paz»: toca la Carita Pensativa 🤔 o el Corazón 💖."""

text = text.replace(old_d8_discurso, new_d8_discurso)

# 6. Actualizar Diapositiva 11 (Discurso Muro de Gratitud con Emojis)
old_d11_discurso = """[Paso 2: Llamado a la acción en el chat de Teams]
Quiero que todos vayan al chat de Teams y escriban un mensaje con esta estructura:
'Agradezco a [Nombre de un compañero, familiar o líder] por [una cualidad o apoyo específico]'. ¡Inunden ese chat de aprecio genuino!"""

new_d11_discurso = """[Paso 2: Expresar la Gratitud de forma Fácil con Emojis o con la Voz]
Como no queremos que nadie se preocupe por teclear en el computador, vamos a expresar nuestro agradecimiento de la forma más linda y directa:

1. Quienes quieran enviar su aprecio en silencio: toquen los emojis de Google Meet pensando en esa persona especial:
   • El Corazón 💖: para decirle «te agradezco con todo el cariño».
   • Los Aplausos 👏: para reconocer el esfuerzo diario de un compañero.
   • La Fiesta 🎉: para celebrar a quien siempre nos alegra el día.
   • El Pulgar arriba 👍: para decirle «¡gracias por estar siempre ahí!».

2. Y quien quiera dedicarle unas palabritas con su propia voz: miren en la barrita abajo al lado de los emojis, hay una Manito levantada ✋. Toquen esa manito y yo con muchísimo gusto les abro el micrófono para que saluden y agradezcan en vivo a esa persona querida."""

text = text.replace(old_d11_discurso, new_d11_discurso)

with open('scratch/build_comprehensive_guion.py', 'w', encoding='utf-8') as f:
    f.write(text)

print("build_comprehensive_guion.py actualizado con dinámica de emojis para adultos mayores.")
