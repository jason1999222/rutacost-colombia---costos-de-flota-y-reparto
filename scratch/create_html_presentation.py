# -*- coding: utf-8 -*-
r"""
Generador de Presentación Web Interactiva Estilo Canva:
'LA CULTURA DEL CUIDADO' - Bertha Inés Medina Hernández
HTML5 + CSS Moderno + Vanilla JS para Navegación en Pantalla Completa.
"""

html_content = """<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>La Cultura del Cuidado - Bertha Inés Medina Hernández</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&family=Playfair+Display:ital,wght@0,600;0,700;1,600&display=swap" rel="stylesheet">
  <style>
    :root {
      --bg-dark: #0f172a;
      --card-dark: #1e293b;
      --bg-light: #f8fafc;
      --card-light: #ffffff;
      --teal-600: #0d9488;
      --teal-700: #0f766e;
      --teal-100: #ccfbf1;
      --coral-600: #e11d48;
      --amber-600: #d97706;
      --slate-800: #1e293b;
      --slate-600: #475569;
      --slate-400: #94a3b8;
      --slate-200: #e2e8f0;
      --font-sans: 'Plus Jakarta Sans', system-ui, -apple-system, sans-serif;
      --font-serif: 'Playfair Display', Georgia, serif;
    }

    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }

    body {
      font-family: var(--font-sans);
      background-color: #020617;
      color: var(--slate-800);
      overflow: hidden;
      height: 100vh;
      width: 100vw;
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
    }

    #stage {
      width: 100vw;
      height: 100vh;
      max-width: 1440px;
      max-height: 810px;
      aspect-ratio: 16 / 9;
      position: relative;
      background: var(--bg-light);
      box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.7);
      border-radius: 12px;
      overflow: hidden;
    }

    .slide {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      padding: 50px 70px;
      display: none;
      flex-direction: column;
      opacity: 0;
      transition: opacity 0.4s ease-in-out, transform 0.4s ease;
      transform: scale(0.98);
      background-color: var(--bg-light);
    }

    .slide.active {
      display: flex;
      opacity: 1;
      transform: scale(1);
    }

    /* Dark Slide Variants */
    .slide.dark {
      background-color: var(--bg-dark);
      color: #ffffff;
    }

    /* Header Components */
    .badge {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 6px 14px;
      background: var(--teal-600);
      color: #ffffff;
      font-size: 11px;
      font-weight: 700;
      letter-spacing: 1px;
      text-transform: uppercase;
      border-radius: 9999px;
      width: fit-content;
      margin-bottom: 12px;
    }
    .badge.coral { background: var(--coral-600); }
    .badge.amber { background: var(--amber-600); }

    .slide-title {
      font-size: 32px;
      font-weight: 800;
      color: var(--slate-800);
      letter-spacing: -0.5px;
      line-height: 1.2;
    }
    .slide.dark .slide-title {
      color: #ffffff;
    }

    .slide-subtitle {
      font-size: 15px;
      color: var(--slate-600);
      margin-top: 6px;
      margin-bottom: 24px;
    }
    .slide.dark .slide-subtitle {
      color: var(--slate-400);
    }

    /* Grids & Cards */
    .grid-3 {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 22px;
      flex: 1;
    }

    .grid-4 {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 18px;
      flex: 1;
    }

    .grid-2 {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 24px;
      flex: 1;
    }

    .card {
      background: var(--card-light);
      border: 1px solid var(--slate-200);
      border-radius: 14px;
      padding: 24px;
      display: flex;
      flex-direction: column;
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
      position: relative;
      overflow: hidden;
    }

    .slide.dark .card {
      background: var(--card-dark);
      border-color: rgba(255, 255, 255, 0.1);
      box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.3);
    }

    .card-top-bar {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      height: 4px;
      background: var(--teal-600);
    }
    .card-top-bar.coral { background: var(--coral-600); }
    .card-top-bar.amber { background: var(--amber-600); }

    .card-number {
      font-size: 28px;
      font-weight: 800;
      color: var(--teal-600);
      margin-bottom: 6px;
    }
    .card-number.coral { color: var(--coral-600); }
    .card-number.amber { color: var(--amber-600); }

    .card-title {
      font-size: 17px;
      font-weight: 700;
      color: var(--slate-800);
      margin-bottom: 10px;
    }
    .slide.dark .card-title {
      color: #ffffff;
    }

    .card-body {
      font-size: 13px;
      line-height: 1.55;
      color: var(--slate-600);
      flex: 1;
    }
    .slide.dark .card-body {
      color: #cbd5e1;
    }

    .card-list {
      margin-top: 14px;
      font-size: 12px;
      line-height: 1.6;
      color: var(--slate-600);
      border-top: 1px dashed var(--slate-200);
      padding-top: 10px;
    }
    .slide.dark .card-list {
      border-color: rgba(255, 255, 255, 0.15);
      color: var(--slate-400);
    }

    /* Cover Slide Specifics */
    .cover-container {
      display: flex;
      flex-direction: column;
      justify-content: center;
      height: 100%;
      padding-left: 20px;
      border-left: 6px solid var(--teal-600);
    }

    .cover-title {
      font-family: var(--font-sans);
      font-size: 54px;
      font-weight: 900;
      color: #ffffff;
      line-height: 1.1;
      letter-spacing: -1px;
      margin: 14px 0;
    }

    .cover-subtitle {
      font-size: 20px;
      color: #cbd5e1;
      max-width: 820px;
      line-height: 1.45;
      margin-bottom: 32px;
    }

    .cover-author-box {
      background: rgba(30, 41, 59, 0.8);
      border: 1px solid var(--teal-600);
      border-radius: 12px;
      padding: 18px 26px;
      width: fit-content;
      backdrop-filter: blur(8px);
    }

    .cover-author-tag {
      font-size: 11px;
      font-weight: 700;
      color: var(--teal-600);
      letter-spacing: 1px;
      text-transform: uppercase;
    }

    .cover-author-name {
      font-size: 26px;
      font-weight: 800;
      color: #ffffff;
      margin: 4px 0;
    }

    .cover-author-course {
      font-size: 13px;
      color: var(--slate-400);
    }

    /* Decalogo List */
    .decalogo-item {
      margin-bottom: 12px;
      font-size: 13.5px;
      line-height: 1.5;
    }
    .decalogo-item strong {
      color: var(--teal-600);
      font-weight: 700;
    }

    /* Controls Bottom Bar */
    #controls {
      position: absolute;
      bottom: 20px;
      right: 30px;
      display: flex;
      align-items: center;
      gap: 12px;
      z-index: 50;
      background: rgba(15, 23, 42, 0.85);
      backdrop-filter: blur(10px);
      padding: 8px 16px;
      border-radius: 9999px;
      border: 1px solid rgba(255, 255, 255, 0.15);
      color: #ffffff;
      font-size: 13px;
      font-weight: 600;
    }

    .btn-nav {
      background: var(--teal-600);
      color: #ffffff;
      border: none;
      border-radius: 50%;
      width: 32px;
      height: 32px;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      font-weight: 800;
      transition: transform 0.15s, background 0.15s;
    }
    .btn-nav:hover {
      background: var(--teal-700);
      transform: scale(1.08);
    }

    .btn-fs {
      background: transparent;
      color: #cbd5e1;
      border: 1px solid rgba(255, 255, 255, 0.2);
      border-radius: 6px;
      padding: 4px 10px;
      font-size: 11px;
      cursor: pointer;
      margin-left: 8px;
    }
    .btn-fs:hover {
      color: #ffffff;
      border-color: #ffffff;
    }
  </style>
</head>
<body>

  <div id="stage">

    <!-- SLIDE 1: PORTADA -->
    <div class="slide dark active">
      <div class="cover-container">
        <div class="badge">ÉTICA, BIENESTAR Y SOSTENIBILIDAD</div>
        <h1 class="cover-title">LA CULTURA<br>DEL CUIDADO</h1>
        <p class="cover-subtitle">Una propuesta para la preservación de la vida, las relaciones humanas y la corresponsabilidad colectiva.</p>
        <div class="cover-author-box">
          <div class="cover-author-tag">PRESENTADO POR:</div>
          <div class="cover-author-name">Bertha Inés Medina Hernández</div>
          <div class="cover-author-course">Cátedra de Ética, Ciencias Sociales y Desarrollo Humano • 2026</div>
        </div>
      </div>
    </div>

    <!-- SLIDE 2: DEFINICIÓN -->
    <div class="slide">
      <div class="badge">CONCEPTOS FUNDAMENTALES</div>
      <h2 class="slide-title">¿Qué es la Cultura del Cuidado?</h2>
      <p class="slide-subtitle">Fundamentos éticos para comprender el cuidado como el soporte indispensable de la vida.</p>
      
      <div class="grid-3">
        <div class="card">
          <div class="card-top-bar"></div>
          <div class="card-number">01</div>
          <h3 class="card-title">Modo Esencial de Ser</h3>
          <p class="card-body">Para el filósofo Leonardo Boff, el cuidado no es un acto aislado ni una técnica accesoria; es la estructura primordial que nos hace humanos. Sin cuidado, el ser humano se deshumaniza y perece desde su nacimiento.</p>
          <div class="card-list">
            • Dimensión ontológica del ser humano.<br>
            • Más que una tarea: una actitud vital.<br>
            • Conexión afectiva con todo lo vivo.
          </div>
        </div>

        <div class="card">
          <div class="card-top-bar coral"></div>
          <div class="card-number coral">02</div>
          <h3 class="card-title">Superar la Indiferencia</h3>
          <p class="card-body">Vivimos en sociedades apresuradas que normalizan el descarte y la soledad. La cultura del cuidado rompe la ceguera cotidiana y nos invita a prestar atención sensible a la fragilidad propia y de quienes nos rodean.</p>
          <div class="card-list">
            • Atención activa y sensible.<br>
            • Desarticulación del egoísmo.<br>
            • Reconocimiento de la vulnerabilidad.
          </div>
        </div>

        <div class="card">
          <div class="card-top-bar amber"></div>
          <div class="card-number amber">03</div>
          <h3 class="card-title">Corresponsabilidad Viva</h3>
          <p class="card-body">El cuidado no puede recaer exclusivamente en una persona, en el médico o en el personal de limpieza. Constituye un pacto social donde cada miembro asume su cuota en la preservación de la armonía comunitaria.</p>
          <div class="card-list">
            • Deber cívico compartido.<br>
            • Acción recíproca y solidaria.<br>
            • Sostenibilidad del tejido social.
          </div>
        </div>
      </div>
    </div>

    <!-- SLIDE 3: 3 DIMENSIONES -->
    <div class="slide">
      <div class="badge">MODELO SISTÉMICO</div>
      <h2 class="slide-title">Las Tres Dimensiones del Cuidado</h2>
      <p class="slide-subtitle">El cuidado integral opera en tres planos inseparables y mutuamente dependientes.</p>
      
      <div class="grid-3">
        <div class="card">
          <div class="card-top-bar"></div>
          <div class="badge">DIMENSIÓN 1</div>
          <h3 class="card-title">Autocuidado (Cuidado de Sí)</h3>
          <p class="card-body">La raíz indispensable. Es la capacidad de reconocer nuestras propias necesidades físicas, mentales y emocionales. No es vanidad ni egoísmo: es la base que permite estar en condiciones de brindar apoyo al prójimo.</p>
          <div class="card-list">
            <strong>Claves prácticas:</strong><br>
            • Sueño reparador y alimentación consciente.<br>
            • Poner límites claros y aprender a decir 'no'.<br>
            • Gestión del estrés y pausas restaurativas.
          </div>
        </div>

        <div class="card">
          <div class="card-top-bar coral"></div>
          <div class="badge coral">DIMENSIÓN 2</div>
          <h3 class="card-title">Cuidado del Otro (Interpersonal)</h3>
          <p class="card-body">La dimensión vincular. Se apoya en la empatía, la compasión y el reconocimiento del prójimo como un legítimo otro. Se fundamenta en la Ética del Cuidado de Carol Gilligan, situando los afectos y la dignidad en el centro.</p>
          <div class="card-list">
            <strong>Claves prácticas:</strong><br>
            • Escucha atenta sin juzgar apresuradamente.<br>
            • Buen trato verbal y comunicación asertiva.<br>
            • Apoyo mutuo en momentos de dificultad.
          </div>
        </div>

        <div class="card">
          <div class="card-top-bar amber"></div>
          <div class="badge amber">DIMENSIÓN 3</div>
          <h3 class="card-title">Ecocuidado (Entorno y Planeta)</h3>
          <p class="card-body">La dimensión ecológica y comunitaria. Reconoce que habitamos una 'Casa Común' finita y vulnerable. Implica asumir hábitos que protejan el hábitat compartido y garanticen un futuro digno para las próximas generaciones.</p>
          <div class="card-list">
            <strong>Claves prácticas:</strong><br>
            • Consumo responsable y reducción de residuos.<br>
            • Protección de las zonas verdes y el agua.<br>
            • Participación en iniciativas socioambientales.
          </div>
        </div>
      </div>
    </div>

    <!-- SLIDE 4: AUTOCUIDADO -->
    <div class="slide">
      <div class="badge">DIMENSIÓN 1</div>
      <h2 class="slide-title">El Autocuidado: Cuidarse para Trascender</h2>
      <p class="slide-subtitle">«Nadie puede ofrecer bienestar si su propia vida se encuentra agotada o desatendida»</p>
      
      <div class="grid-2">
        <div class="card">
          <div class="card-top-bar"></div>
          <h3 class="card-title">1. Salud Física y Vitalidad</h3>
          <p class="card-body">Garantizar descanso suficiente (7-8 horas), alimentación equilibrada y pausas activas durante jornadas prolongadas. El cuerpo siempre avisa antes de colapsar físicamente.</p>
        </div>
        <div class="card">
          <div class="card-top-bar coral"></div>
          <h3 class="card-title">2. Gestión Emocional Consciente</h3>
          <p class="card-body">Validar lo que sentimos: el cansancio, la tristeza o la frustración no son defectos de carácter. Aprender a procesar las emociones sin reprimirlas ni desbordarse.</p>
        </div>
        <div class="card">
          <div class="card-top-bar amber"></div>
          <h3 class="card-title">3. Establecimiento de Límites</h3>
          <p class="card-body">El poder restaurativo de decir 'NO'. Proteger el tiempo personal frente a la hiperconexión digital y evitar sobrecargarse de compromisos ajenos.</p>
        </div>
        <div class="card">
          <div class="card-top-bar"></div>
          <h3 class="card-title">4. Autoestima y Autocompasión</h3>
          <p class="card-body">Tratarse a uno mismo con la misma bondad y paciencia que solemos brindar a un buen amigo. Erradicar la autocrítica destructiva y el perfeccionismo tóxico.</p>
        </div>
      </div>
    </div>

    <!-- SLIDE 5: CUIDADO DEL OTRO -->
    <div class="slide">
      <div class="badge coral">DIMENSIÓN 2</div>
      <h2 class="slide-title">El Cuidado del Otro: Ética del Buen Trato</h2>
      <p class="slide-subtitle">Construir comunidades compasivas donde la dignidad humana sea innegociable.</p>
      
      <div class="grid-4">
        <div class="card">
          <div class="card-top-bar coral"></div>
          <h3 class="card-title">Escucha Activa</h3>
          <p class="card-body">En un mundo hiperconectado pero incomunicado, escuchar sin interrumpir es un acto de cuidado revolucionario. Estar presente para validar la vivencia del otro.</p>
        </div>
        <div class="card">
          <div class="card-top-bar"></div>
          <h3 class="card-title">Comunicación Asertiva</h3>
          <p class="card-body">Las palabras tienen poder: pueden construir puentes o levantar muros. La cultura del cuidado exige desterrar el maltrato sutil y el sarcasmo hiriente.</p>
        </div>
        <div class="card">
          <div class="card-top-bar amber"></div>
          <h3 class="card-title">Economía del Cuidado</h3>
          <p class="card-body">Históricamente, las labores de crianza, alimentación y apoyo han recaído sobre las mujeres de forma no remunerada. Cuidar exige visibilizar y valorar estas tareas.</p>
        </div>
        <div class="card">
          <div class="card-top-bar coral"></div>
          <h3 class="card-title">Solidaridad Real</h3>
          <p class="card-body">Acompañar en el duelo, la enfermedad o la crisis económica. La red comunitaria de apoyo mutuo es el verdadero escudo frente a la incertidumbre.</p>
        </div>
      </div>
    </div>

    <!-- SLIDE 6: ECOCUIDADO -->
    <div class="slide">
      <div class="badge amber">DIMENSIÓN 3</div>
      <h2 class="slide-title">El Cuidado del Entorno: Nuestra Casa Común</h2>
      <p class="slide-subtitle">Armonía entre la actividad humana y los límites biofísicos de la naturaleza.</p>
      
      <div class="grid-3">
        <div class="card">
          <div class="card-top-bar amber"></div>
          <h3 class="card-title">Consumo Consciente y Sobriedad</h3>
          <p class="card-body">Cuestionar la necesidad real de lo que compramos. Reducir plásticos de un solo uso, combatir el desperdicio de comida y preferir productos locales, limpios y duraderos.</p>
        </div>
        <div class="card">
          <div class="card-top-bar"></div>
          <h3 class="card-title">Corresponsabilidad Territorial</h3>
          <p class="card-body">El espacio público no es de 'nadie': es de todos. Separar residuos en la fuente, cuidar las fuentes hídricas y dignificar la labor fundamental de los recicladores de oficio.</p>
        </div>
        <div class="card">
          <div class="card-top-bar coral"></div>
          <h3 class="card-title">Justicia Intergeneracional</h3>
          <p class="card-body">La ética del cuidado mira hacia adelante: ¿qué mundo le heredaremos a las futuras generaciones? Actuar hoy para frenar la pérdida de biodiversidad y el colapso ecológico.</p>
        </div>
      </div>
    </div>

    <!-- SLIDE 7: EN EL TRABAJO -->
    <div class="slide">
      <div class="badge">ORGANIZACIONES SALUDABLES</div>
      <h2 class="slide-title">La Cultura del Cuidado en el Trabajo</h2>
      <p class="slide-subtitle">De la prevención obligatoria a un compromiso colectivo por la vida y el bienestar.</p>
      
      <div class="grid-2">
        <div class="card">
          <div class="card-top-bar"></div>
          <h3 class="card-title">Seguridad y Salud en el Trabajo (SST)</h3>
          <p class="card-body">La prevención de riesgos no es un conjunto de formatos archivados: es la certeza de que cada persona regrese sana y salva a su hogar. Exige ergonomía, orden y protección activa.</p>
        </div>
        <div class="card">
          <div class="card-top-bar amber"></div>
          <h3 class="card-title">Ambientes Libres de Acoso</h3>
          <p class="card-body">La salud mental laboral se destruye ante el maltrato o la sobrecarga desmedida. Las organizaciones del cuidado promueven la seguridad psicológica para opinar y equivocarse.</p>
        </div>
        <div class="card">
          <div class="card-top-bar coral"></div>
          <h3 class="card-title">Liderazgo Cercano y Empático</h3>
          <p class="card-body">Líderes que preguntan '¿cómo estás hoy?' antes de exigir resultados numéricos. La empatía fomenta mayor compromiso, productividad y lealtad que la presión autoritaria.</p>
        </div>
        <div class="card">
          <div class="card-top-bar"></div>
          <h3 class="card-title">Cuidado Mutuo entre Colegas</h3>
          <p class="card-body">Si observamos a un compañero sobrecargado, enfermo o cometiendo un acto inseguro, intervenimos con respeto. Cuidar al colega es proteger la seguridad de todo el equipo.</p>
        </div>
      </div>
    </div>

    <!-- SLIDE 8: BARRERAS -->
    <div class="slide">
      <div class="badge coral">DIAGNÓSTICO CRÍTICO</div>
      <h2 class="slide-title">¿Qué Obstaculiza la Cultura del Cuidado?</h2>
      <p class="slide-subtitle">Identificar las trampas cotidianas que fracturan nuestra capacidad de cuidar.</p>
      
      <div class="grid-4">
        <div class="card">
          <div class="card-top-bar coral"></div>
          <h3 class="card-title">1. Individualismo y Apatía</h3>
          <p class="card-body">La mentalidad del 'sálvese quien pueda'. Desentenderse del sufrimiento o la sobrecarga ajena asumiendo falsamente que 'no es mi problema'.</p>
        </div>
        <div class="card">
          <div class="card-top-bar amber"></div>
          <h3 class="card-title">2. Culto a la Prisa Extrema</h3>
          <p class="card-body">Normalizar el estrés extremo y la falta de sueño como si fueran medallas de éxito profesional. La prisa destruye la capacidad de empatía.</p>
        </div>
        <div class="card">
          <div class="card-top-bar coral"></div>
          <h3 class="card-title">3. Desentendimiento Moral</h3>
          <p class="card-body">Pensar 'para eso le pagan a otros'. Justificar el desorden o la falta de respeto delegando la responsabilidad en terceros.</p>
        </div>
        <div class="card">
          <div class="card-top-bar amber"></div>
          <h3 class="card-title">4. Desprecio del Cuidado</h3>
          <p class="card-body">Invisibilizar a las personas que limpian, curan, cocinan y cuidan niños o ancianos, negándoles salario digno y reconocimiento social.</p>
        </div>
      </div>
    </div>

    <!-- SLIDE 9: ESTRATEGIAS -->
    <div class="slide">
      <div class="badge">HERRAMIENTAS DE ACCIÓN</div>
      <h2 class="slide-title">Estrategias para Vivir la Cultura del Cuidado</h2>
      <p class="slide-subtitle">Pequeñas acciones cotidianas que generan grandes transformaciones colectivas.</p>
      
      <div class="grid-3">
        <div class="card">
          <div class="card-top-bar"></div>
          <h3 class="card-title">Nivel Personal</h3>
          <p class="card-body">
            • Pausas conscientes de respiración.<br>
            • Horarios fijos de desconexión nocturna.<br>
            • Hidratación y alimentación nutritiva.<br>
            • Expresar emociones sin juzgarse.
          </p>
        </div>
        <div class="card">
          <div class="card-top-bar coral"></div>
          <h3 class="card-title">Nivel Relacional</h3>
          <p class="card-body">
            • Saludar con calidez y mirar a los ojos.<br>
            • Preguntar genuinamente '¿cómo estás?'.<br>
            • Practicar el agradecimiento explícito.<br>
            • Brindar ayuda sin esperar retribución.
          </p>
        </div>
        <div class="card">
          <div class="card-top-bar amber"></div>
          <h3 class="card-title">Nivel Comunitario</h3>
          <p class="card-body">
            • Respetar normas de convivencia y silencio.<br>
            • Cuidar las instalaciones y bienes comunes.<br>
            • Separar residuos y apoyar al reciclador.<br>
            • Participar en comités de bienestar social.
          </p>
        </div>
      </div>
    </div>

    <!-- SLIDE 10: DECÁLOGO -->
    <div class="slide">
      <div class="badge">PRINCIPIOS GUÍA</div>
      <h2 class="slide-title">Decálogo de la Cultura del Cuidado</h2>
      <p class="slide-subtitle">Diez compromisos esenciales para cultivar y practicar en el día a día.</p>
      
      <div class="grid-2">
        <div class="card">
          <div class="decalogo-item"><strong>1. La vida es sagrada:</strong> Proteger la integridad física, mental y espiritual de todo ser vivo.</div>
          <div class="decalogo-item"><strong>2. El autocuidado es la base:</strong> Cuidarse a sí mismo es el primer requisito para poder cuidar a otros.</div>
          <div class="decalogo-item"><strong>3. La palabra edifica:</strong> Usar un lenguaje respetuoso, constructivo y libre de agresiones.</div>
          <div class="decalogo-item"><strong>4. Escuchar es abrazar:</strong> Prestar atención plena sin juzgar ni apresurar conclusiones.</div>
          <div class="decalogo-item"><strong>5. La vulnerabilidad une:</strong> Aceptar que todos necesitamos ayuda en algún momento de la vida.</div>
        </div>

        <div class="card">
          <div class="decalogo-item"><strong>6. Corresponsabilidad activa:</strong> Asumir las consecuencias de nuestras acciones y desidias.</div>
          <div class="decalogo-item"><strong>7. Gratitud y reconocimiento:</strong> Valorar y dignificar a quienes realizan tareas de cuidado.</div>
          <div class="decalogo-item"><strong>8. Habitar la Tierra con respeto:</strong> Consumir con sobriedad y no agotar los recursos naturales.</div>
          <div class="decalogo-item"><strong>9. Paz en el conflicto:</strong> Resolver diferencias mediante el diálogo sincero y no violento.</div>
          <div class="decalogo-item"><strong>10. Cuidar es trascender:</strong> Dejar una huella de bienestar y amor por donde pasemos.</div>
        </div>
      </div>
    </div>

    <!-- SLIDE 11: CONCLUSIÓN -->
    <div class="slide dark">
      <div class="badge">REFLEXIÓN FINAL</div>
      <h2 class="slide-title">El Cuidado como Fuerza Transformadora</h2>
      <p class="slide-subtitle">Hacia una sociedad que pone la vida y el corazón en el centro de todas sus decisiones.</p>
      
      <div style="flex: 1; display: flex; flex-direction: column; justify-content: center; max-width: 960px; margin: 0 auto; text-align: center;">
        <p style="font-family: var(--font-serif); font-size: 24px; line-height: 1.6; font-style: italic; color: #f8fafc; margin-bottom: 30px;">
          «El cuidado no es una opción secundaria ni un gesto caritativo ocasional: constituye la condición irrenunciable para que la sociedad no se desmorone. Cuidar de nosotros mismos, abrazar la fragilidad del otro y sanar nuestra relación con la Tierra es el mayor acto de madurez ética al que podemos aspirar.»
        </p>
        <div style="font-size: 20px; font-weight: 800; color: var(--teal-600);">Bertha Inés Medina Hernández</div>
        <div style="font-size: 13px; color: var(--slate-400); margin-top: 4px;">La Cultura del Cuidado • Un compromiso ético para vivir con dignidad y esperanza</div>
      </div>
    </div>

    <!-- SLIDE 12: CIERRE -->
    <div class="slide dark">
      <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100%; text-align: center;">
        <h2 style="font-size: 56px; font-weight: 900; color: #ffffff; margin-bottom: 16px;">¡Muchas Gracias!</h2>
        <p style="font-size: 20px; font-style: italic; color: #cbd5e1; max-width: 750px; line-height: 1.5; margin-bottom: 36px;">
          «Quien cuida, transforma su entorno y deja una huella imborrable en la vida de los demás»
        </p>
        <div style="font-size: 24px; font-weight: 800; color: var(--teal-600); margin-bottom: 6px;">
          Bertha Inés Medina Hernández
        </div>
        <div style="font-size: 14px; color: var(--slate-400);">
          Espacio abierto para reflexiones, preguntas y aportes colectivos
        </div>
      </div>
    </div>

    <!-- CONTROLES -->
    <div id="controls">
      <button class="btn-nav" id="btnPrev" title="Anterior (Flecha izquierda)">‹</button>
      <span id="slideIndicator">1 / 12</span>
      <button class="btn-nav" id="btnNext" title="Siguiente (Flecha derecha / Espacio)">›</button>
      <button class="btn-fs" id="btnFullscreen">Pantalla Completa</button>
    </div>

  </div>

  <script>
    const slides = document.querySelectorAll('.slide');
    const indicator = document.getElementById('slideIndicator');
    const btnPrev = document.getElementById('btnPrev');
    const btnNext = document.getElementById('btnNext');
    const btnFullscreen = document.getElementById('btnFullscreen');
    let current = 0;

    function showSlide(index) {
      if (index < 0) index = 0;
      if (index >= slides.length) index = slides.length - 1;
      current = index;

      slides.forEach((s, i) => {
        s.classList.toggle('active', i === current);
      });
      indicator.textContent = `${current + 1} / ${slides.length}`;
    }

    btnPrev.addEventListener('click', () => showSlide(current - 1));
    btnNext.addEventListener('click', () => showSlide(current + 1));

    document.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowRight' || e.key === ' ' || e.key === 'PageDown') {
        showSlide(current + 1);
      } else if (e.key === 'ArrowLeft' || e.key === 'PageUp') {
        showSlide(current - 1);
      }
    });

    btnFullscreen.addEventListener('click', () => {
      const stage = document.getElementById('stage');
      if (!document.fullscreenElement) {
        stage.requestFullscreen().catch(err => alert(`Error al iniciar pantalla completa: ${err.message}`));
      } else {
        document.exitFullscreen();
      }
    });
  </script>

</body>
</html>
"""

dest_desktop = r"C:\Users\lenovo\Desktop\trabajos andres\Presentacion_Cultura_del_Cuidado_Bertha_Medina.html"
dest_downloads = r"C:\Users\lenovo\Downloads\Presentacion_Cultura_del_Cuidado_Bertha_Medina.html"

with open(dest_desktop, "w", encoding="utf-8") as f:
    f.write(html_content)

with open(dest_downloads, "w", encoding="utf-8") as f:
    f.write(html_content)

print("Presentación interactiva HTML5 generada exitosamente en Desktop y Descargas.")
