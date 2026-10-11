# -*- coding: utf-8 -*-
r"""
Generador de la Presentación Web Interactiva Innovadora:
'LA CULTURA DEL CUIDADO' - Bertha Inés Medina Hernández

Diseño:
- Colores suaves y luminosos: Rosado pastel, blanco, violeta suave, azul cielo.
- Estilo femenino, acogedor y moderno.
- Mucho apoyo visual gráfico tipo cartoon (6 ilustraciones de alta calidad en Base64).
- Texto mínimo en pantalla: tarjetas visuales, palabras clave, insignias redondeadas e iconos.
- Controles de presentación estilo PowerPoint/Canva: barra inferior flotante, miniaturas visuales, pantalla completa y atajos de teclado.
"""

import os
import base64

img_hero_path = r"C:\Users\lenovo\.gemini\antigravity-ide\brain\1028804d-2a48-4bc7-9c53-7b9c7a021007\cultura_cuidado_hero_1790564737046.jpg"
img_auto_path = r"C:\Users\lenovo\.gemini\antigravity-ide\brain\1028804d-2a48-4bc7-9c53-7b9c7a021007\autocuidado_cartoon_1790564757178.jpg"
img_otro_path = r"C:\Users\lenovo\.gemini\antigravity-ide\brain\1028804d-2a48-4bc7-9c53-7b9c7a021007\cuidado_del_otro_cartoon_1790564777509.jpg"
img_eco_path  = r"C:\Users\lenovo\.gemini\antigravity-ide\brain\1028804d-2a48-4bc7-9c53-7b9c7a021007\ecocuidado_cartoon_1790564803549.jpg"
img_lab_path  = r"C:\Users\lenovo\.gemini\antigravity-ide\brain\1028804d-2a48-4bc7-9c53-7b9c7a021007\cuidado_laboral_cartoon_1790565296596.jpg"
img_arb_path  = r"C:\Users\lenovo\.gemini\antigravity-ide\brain\1028804d-2a48-4bc7-9c53-7b9c7a021007\arbol_cuidado_cartoon_1790565331811.jpg"

def get_b64(path):
    with open(path, "rb") as f:
        return "data:image/jpeg;base64," + base64.b64encode(f.read()).decode("utf-8")

b64_hero = get_b64(img_hero_path)
b64_auto = get_b64(img_auto_path)
b64_otro = get_b64(img_otro_path)
b64_eco  = get_b64(img_eco_path)
b64_lab  = get_b64(img_lab_path)
b64_arb  = get_b64(img_arb_path)

html_template = f"""<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>La Cultura del Cuidado - Bertha Inés Medina Hernández</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Caveat:wght@600;700&display=swap" rel="stylesheet">
  <style>
    :root {{
      --pastel-pink-bg: #fff0f5;
      --pastel-pink-card: #ffe4ec;
      --pastel-pink-border: #fbcfe8;
      --pink-accent: #f43f5e;
      --pink-text: #be123c;
      
      --pastel-violet-bg: #f5f3ff;
      --pastel-violet-card: #ede9fe;
      --pastel-violet-border: #ddd6fe;
      --violet-accent: #8b5cf6;
      --violet-text: #6d28d9;

      --pastel-blue-bg: #f0f9ff;
      --pastel-blue-card: #e0f2fe;
      --pastel-blue-border: #bae6fd;
      --blue-accent: #38bdf8;
      --blue-text: #0284c7;

      --white: #ffffff;
      --text-dark: #332d42;
      --text-muted: #64748b;
      --shadow-sm: 0 4px 12px rgba(244, 63, 94, 0.06);
      --shadow-card: 0 10px 25px -5px rgba(139, 92, 246, 0.08), 0 8px 10px -6px rgba(0, 0, 0, 0.03);
      --shadow-hover: 0 20px 30px -10px rgba(244, 63, 94, 0.16);
    }}

    * {{
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }}

    body {{
      font-family: 'Plus Jakarta Sans', sans-serif;
      background: linear-gradient(135deg, #ffd1dc 0%, #e0c3fc 50%, #8ec5fc 100%);
      color: var(--text-dark);
      min-height: 100vh;
      display: flex;
      justify-content: center;
      align-items: center;
      padding: 12px;
      overflow: hidden;
    }}

    /* Contenedor Principal Panorámico (16:9) */
    #deck-wrapper {{
      width: 100%;
      max-width: 1360px;
      height: 94vh;
      max-height: 790px;
      aspect-ratio: 16 / 9;
      background: #ffffff;
      border-radius: 28px;
      box-shadow: 0 25px 60px -15px rgba(109, 40, 217, 0.25), 0 0 0 1px rgba(255, 255, 255, 0.9) inset;
      position: relative;
      display: flex;
      flex-direction: column;
      overflow: hidden;
      border: 4px solid #ffffff;
    }}

    /* Barra Superior Ligeramente Translúcida */
    header.deck-header {{
      height: 60px;
      background: rgba(255, 255, 255, 0.9);
      backdrop-filter: blur(12px);
      border-bottom: 2px solid #fce7f3;
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0 28px;
      z-index: 20;
    }}

    .brand-group {{
      display: flex;
      align-items: center;
      gap: 10px;
      font-size: 15px;
      font-weight: 800;
      color: var(--pink-text);
    }}
    .heart-anim {{
      font-size: 20px;
      display: inline-block;
      animation: pulse 1.6s infinite ease-in-out;
    }}
    @keyframes pulse {{
      0%, 100% {{ transform: scale(1); }}
      50% {{ transform: scale(1.18); }}
    }}

    .presenter-badge {{
      background: linear-gradient(135deg, var(--pastel-pink-card), var(--pastel-violet-card));
      padding: 6px 18px;
      border-radius: 9999px;
      font-size: 13px;
      font-weight: 700;
      color: var(--violet-text);
      border: 1px solid var(--pastel-violet-border);
      display: flex;
      align-items: center;
      gap: 8px;
      box-shadow: var(--shadow-sm);
    }}

    .header-tools {{
      display: flex;
      align-items: center;
      gap: 10px;
    }}

    .tool-btn {{
      background: #ffffff;
      border: 1px solid var(--pastel-pink-border);
      color: var(--pink-text);
      padding: 6px 14px;
      border-radius: 12px;
      font-size: 12px;
      font-weight: 700;
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: 6px;
      transition: all 0.2s;
    }}
    .tool-btn:hover {{
      background: var(--pastel-pink-bg);
      transform: translateY(-1px);
    }}

    /* Escenario de Diapositivas */
    #deck-stage {{
      flex: 1;
      position: relative;
      overflow: hidden;
      padding: 24px 44px;
      background: radial-gradient(circle at 10% 20%, rgba(254, 205, 211, 0.35) 0%, transparent 40%),
                  radial-gradient(circle at 90% 80%, rgba(221, 214, 254, 0.35) 0%, transparent 40%),
                  radial-gradient(circle at 50% 50%, rgba(224, 242, 254, 0.3) 0%, transparent 60%),
                  #ffffff;
    }}

    .slide {{
      position: absolute;
      top: 20px;
      left: 44px;
      right: 44px;
      bottom: 20px;
      display: none;
      flex-direction: column;
      opacity: 0;
      transform: scale(0.97) translateY(14px);
      transition: opacity 0.4s ease, transform 0.4s cubic-bezier(0.16, 1, 0.3, 1);
    }}

    .slide.active {{
      display: flex;
      opacity: 1;
      transform: scale(1) translateY(0);
    }}

    /* Tipografía y Etiquetas */
    .pill-label {{
      display: inline-flex;
      align-items: center;
      gap: 6px;
      background: linear-gradient(135deg, var(--pastel-pink-card), #ffffff);
      color: var(--pink-text);
      padding: 4px 14px;
      border-radius: 9999px;
      font-size: 11.5px;
      font-weight: 800;
      letter-spacing: 0.5px;
      text-transform: uppercase;
      border: 1px solid var(--pastel-pink-border);
      width: fit-content;
      margin-bottom: 6px;
    }}
    .pill-label.violet {{
      background: linear-gradient(135deg, var(--pastel-violet-card), #ffffff);
      color: var(--violet-text);
      border-color: var(--pastel-violet-border);
    }}
    .pill-label.blue {{
      background: linear-gradient(135deg, var(--pastel-blue-card), #ffffff);
      color: var(--blue-text);
      border-color: var(--pastel-blue-border);
    }}

    .slide-heading {{
      font-size: 32px;
      font-weight: 800;
      color: var(--text-dark);
      letter-spacing: -0.5px;
      line-height: 1.2;
      margin-bottom: 4px;
    }}
    .slide-heading span.highlight-pink {{
      color: var(--pink-text);
    }}
    .slide-heading span.highlight-violet {{
      color: var(--violet-text);
    }}
    .slide-heading span.highlight-blue {{
      color: var(--blue-text);
    }}

    .slide-tagline {{
      font-size: 15px;
      color: var(--text-muted);
      margin-bottom: 18px;
      font-weight: 600;
    }}

    /* Diseños Split: Imagen Cartoon + Tarjetas Gráficas */
    .layout-split {{
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 32px;
      align-items: center;
      flex: 1;
    }}

    .layout-split.img-left {{
      grid-template-columns: 0.95fr 1.05fr;
    }}

    .layout-split.img-right {{
      grid-template-columns: 1.05fr 0.95fr;
    }}

    .cartoon-card-box {{
      width: 100%;
      height: 100%;
      max-height: 440px;
      border-radius: 24px;
      overflow: hidden;
      background: #ffffff;
      padding: 8px;
      border: 3px solid #ffffff;
      box-shadow: 0 16px 36px -10px rgba(109, 40, 217, 0.18);
      position: relative;
    }}
    .cartoon-card-box img {{
      width: 100%;
      height: 100%;
      object-fit: cover;
      border-radius: 18px;
      display: block;
      transition: transform 0.5s ease;
    }}
    .cartoon-card-box:hover img {{
      transform: scale(1.03);
    }}

    /* Tarjetas Interactivas con Poca Letra y Mucho Icono */
    .grid-interactive {{
      display: grid;
      gap: 14px;
    }}
    .grid-interactive.cols-2 {{ grid-template-columns: 1fr 1fr; }}
    .grid-interactive.cols-3 {{ grid-template-columns: repeat(3, 1fr); }}
    .grid-interactive.cols-4 {{ grid-template-columns: repeat(4, 1fr); }}

    .quick-card {{
      background: #ffffff;
      border-radius: 18px;
      padding: 16px 20px;
      border: 1px solid var(--pastel-pink-border);
      box-shadow: var(--shadow-sm);
      display: flex;
      flex-direction: column;
      gap: 8px;
      transition: all 0.25s ease;
      cursor: pointer;
    }}
    .quick-card.violet {{
      border-color: var(--pastel-violet-border);
    }}
    .quick-card.blue {{
      border-color: var(--pastel-blue-border);
    }}

    .quick-card:hover {{
      transform: translateY(-4px) scale(1.01);
      box-shadow: var(--shadow-hover);
      border-color: var(--pink-accent);
      background: linear-gradient(180deg, #ffffff 0%, var(--pastel-pink-bg) 100%);
    }}
    .quick-card.violet:hover {{
      border-color: var(--violet-accent);
      background: linear-gradient(180deg, #ffffff 0%, var(--pastel-violet-bg) 100%);
    }}
    .quick-card.blue:hover {{
      border-color: var(--blue-accent);
      background: linear-gradient(180deg, #ffffff 0%, var(--pastel-blue-bg) 100%);
    }}

    .card-badge-row {{
      display: flex;
      align-items: center;
      justify-content: space-between;
    }}

    .card-emoji {{
      font-size: 26px;
      width: 44px;
      height: 44px;
      border-radius: 14px;
      background: var(--pastel-pink-bg);
      display: flex;
      align-items: center;
      justify-content: center;
    }}
    .quick-card.violet .card-emoji {{ background: var(--pastel-violet-bg); }}
    .quick-card.blue .card-emoji {{ background: var(--pastel-blue-bg); }}

    .card-number-tag {{
      font-size: 13px;
      font-weight: 800;
      color: var(--pink-text);
      opacity: 0.6;
    }}

    .card-concept-title {{
      font-size: 16px;
      font-weight: 800;
      color: var(--text-dark);
      line-height: 1.25;
    }}

    .card-punchline {{
      font-size: 13px;
      color: var(--text-muted);
      line-height: 1.5;
    }}

    /* Frases Script de Amor y Calidez */
    .quote-handwritten {{
      font-family: 'Caveat', cursive;
      font-size: 26px;
      color: var(--pink-text);
      margin-top: 10px;
    }}

    /* Barra Inferior de Control Estilo Presentación */
    footer.deck-footer {{
      height: 68px;
      background: rgba(255, 255, 255, 0.95);
      backdrop-filter: blur(12px);
      border-top: 2px solid #fce7f3;
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0 32px;
      z-index: 20;
    }}

    .footer-left {{
      display: flex;
      align-items: center;
      gap: 12px;
    }}

    .slide-step-counter {{
      font-size: 14px;
      font-weight: 800;
      color: var(--pink-text);
      background: var(--pastel-pink-bg);
      padding: 4px 14px;
      border-radius: 9999px;
      border: 1px solid var(--pastel-pink-border);
    }}

    .progress-bar-container {{
      flex: 1;
      max-width: 480px;
      height: 8px;
      background: #f1f5f9;
      border-radius: 9999px;
      overflow: hidden;
      margin: 0 20px;
    }}

    .progress-fill-line {{
      height: 100%;
      width: 10%;
      background: linear-gradient(90deg, #f43f5e 0%, #a855f7 50%, #38bdf8 100%);
      border-radius: 9999px;
      transition: width 0.3s cubic-bezier(0.16, 1, 0.3, 1);
    }}

    .footer-actions {{
      display: flex;
      align-items: center;
      gap: 10px;
    }}

    .action-nav-btn {{
      background: linear-gradient(135deg, #f43f5e, #e11d48);
      color: #ffffff;
      border: none;
      padding: 10px 24px;
      border-radius: 14px;
      font-size: 14px;
      font-weight: 800;
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: 8px;
      box-shadow: 0 4px 14px rgba(225, 29, 72, 0.25);
      transition: all 0.2s;
    }}
    .action-nav-btn:hover {{
      transform: translateY(-2px);
      box-shadow: 0 6px 20px rgba(225, 29, 72, 0.35);
    }}
    .action-nav-btn.secondary {{
      background: #ffffff;
      color: var(--text-dark);
      border: 1px solid #e2e8f0;
      box-shadow: none;
    }}
    .action-nav-btn.secondary:hover {{
      background: #f8fafc;
      border-color: var(--pastel-pink-border);
      color: var(--pink-text);
    }}

    /* Carrusel de Miniaturas Interactivo */
    #thumb-tray {{
      position: absolute;
      bottom: 68px;
      left: 0;
      right: 0;
      height: 110px;
      background: rgba(255, 255, 255, 0.96);
      backdrop-filter: blur(16px);
      border-top: 2px solid var(--pastel-pink-border);
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 0 24px;
      overflow-x: auto;
      transform: translateY(120%);
      transition: transform 0.3s cubic-bezier(0.16, 1, 0.3, 1);
      z-index: 25;
      box-shadow: 0 -10px 25px rgba(0, 0, 0, 0.05);
    }}
    #thumb-tray.open {{
      transform: translateY(0);
    }}

    .thumb-item {{
      flex: 0 0 130px;
      height: 78px;
      border-radius: 12px;
      border: 2px solid #e2e8f0;
      background: var(--pastel-pink-bg);
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      padding: 6px;
      cursor: pointer;
      text-align: center;
      transition: all 0.2s;
    }}
    .thumb-item:hover, .thumb-item.active {{
      border-color: var(--pink-accent);
      background: #ffffff;
      transform: scale(1.05);
      box-shadow: var(--shadow-sm);
    }}
    .thumb-item-num {{
      font-size: 11px;
      font-weight: 800;
      color: var(--pink-text);
    }}
    .thumb-item-name {{
      font-size: 11px;
      font-weight: 700;
      color: var(--text-dark);
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      max-width: 110px;
      margin-top: 2px;
    }}
  </style>
</head>
<body>

  <div id="deck-wrapper">

    <!-- Top Header -->
    <header class="deck-header">
      <div class="brand-group">
        <span class="heart-anim">🌸</span>
        <span>Cultura del Cuidado</span>
      </div>

      <div class="presenter-badge">
        <span>🌷 Expositora:</span>
        <strong>Bertha Inés Medina Hernández</strong>
      </div>

      <div class="header-tools">
        <button class="tool-btn" id="btnToggleThumbs">
          🗂️ Diapositivas
        </button>
        <button class="tool-btn" id="btnFullscreen">
          ⛶ Pantalla Completa
        </button>
      </div>
    </header>

    <!-- Main Stage of Slides -->
    <main id="deck-stage">

      <!-- SLIDE 1: PORTADA -->
      <section class="slide active" data-name="1. Portada">
        <div class="layout-split img-right">
          <div>
            <div class="pill-label">🌸 Bienvenida y Apertura</div>
            <h1 class="slide-heading" style="font-size: 44px; margin-bottom: 8px;">
              La Cultura del <span class="highlight-pink">Cuidado</span>
            </h1>
            <p class="slide-tagline" style="font-size: 18px;">
              Una ética tierna para la vida, el buen trato y la comunidad.
            </p>

            <div style="background: linear-gradient(135deg, #ffffff, var(--pastel-pink-bg)); border: 2px solid var(--pastel-pink-border); border-radius: 20px; padding: 18px 24px; box-shadow: var(--shadow-sm); max-width: 460px; margin-bottom: 14px;">
              <div style="font-size: 11px; font-weight: 800; color: var(--pink-text); text-transform: uppercase; letter-spacing: 1px;">
                PRESENTADO CON AMOR POR:
              </div>
              <div style="font-size: 24px; font-weight: 800; color: var(--text-dark); margin: 3px 0;">
                Bertha Inés Medina Hernández
              </div>
              <div style="font-size: 13px; color: var(--text-muted); font-weight: 600;">
                Cátedra de Ética, Ciencias Sociales y Salud • 2026
              </div>
            </div>

            <!-- 3 Pill Badges -->
            <div style="display: flex; gap: 8px; flex-wrap: wrap;">
              <span class="pill-label">💖 Amor Propio</span>
              <span class="pill-label violet">👭 Empatía Mutua</span>
              <span class="pill-label blue">🌱 Casa Común</span>
            </div>

            <div class="quote-handwritten">
              «Cuidar es el acto más dulce para transformar el mundo»
            </div>
          </div>

          <div class="cartoon-card-box">
            <img src="{b64_hero}" alt="Ilustración Comunitaria del Cuidado">
          </div>
        </div>
      </section>

      <!-- SLIDE 2: ¿QUÉ ES EL CUIDADO? -->
      <section class="slide" data-name="2. ¿Qué es Cuidar?">
        <div>
          <div class="pill-label violet">✨ Concepto Central</div>
          <h2 class="slide-heading">¿Qué es realmente <span class="highlight-violet">Cuidar</span>?</h2>
          <p class="slide-tagline">Más que cumplir una tarea o hacer un favor: es una actitud ante la vida.</p>
        </div>

        <div class="grid-interactive cols-3" style="flex: 1; align-items: stretch;">
          <div class="quick-card violet">
            <div class="card-badge-row">
              <div class="card-emoji">🌿</div>
              <span class="card-number-tag">01</span>
            </div>
            <h3 class="card-concept-title">Modo de Ser Humano</h3>
            <p class="card-punchline">
              Como dice Leonardo Boff, el cuidado es lo que nos hace humanos. Sin alguien que nos cuidara con paciencia de bebés, ninguno estaría hoy aquí.
            </p>
          </div>

          <div class="quick-card">
            <div class="card-badge-row">
              <div class="card-emoji">👁️</div>
              <span class="card-number-tag">02</span>
            </div>
            <h3 class="card-concept-title">Vencer la Indiferencia</h3>
            <p class="card-punchline">
              Detener el afán diario para mirar a los ojos a quien tenemos al lado. Reconocer que la otra persona también siente, se cansa y necesita una mano.
            </p>
          </div>

          <div class="quick-card blue">
            <div class="card-badge-row">
              <div class="card-emoji">🤝</div>
              <span class="card-number-tag">03</span>
            </div>
            <h3 class="card-concept-title">Corresponsabilidad</h3>
            <p class="card-punchline">
              El cuidado no es solo de la mamá o de quien limpia. Es un pacto compartido donde cada uno aporta para que todos vivamos bien.
            </p>
          </div>
        </div>
      </section>

      <!-- SLIDE 3: EL TRIÁNGULO DEL CUIDADO -->
      <section class="slide" data-name="3. Tres Dimensiones">
        <div>
          <div class="pill-label blue">🔺 Modelo Sistémico</div>
          <h2 class="slide-heading">El <span class="highlight-blue">Triángulo</span> del Cuidado</h2>
          <p class="slide-tagline">Tres dimensiones inseparables: si una se descuida, la vida pierde el equilibrio.</p>
        </div>

        <div class="grid-interactive cols-3" style="flex: 1;">
          <div class="quick-card" style="border-top: 5px solid var(--pink-accent);">
            <div class="card-badge-row">
              <div class="card-emoji">💖</div>
              <span class="pill-label">1. Raíz</span>
            </div>
            <h3 class="card-concept-title" style="color: var(--pink-text); font-size: 20px;">Autocuidado</h3>
            <p class="card-punchline">
              <strong>Cuidar de Sí Misma:</strong><br>
              Descanso, límites saludables, salud física y paz mental sin culpas.
            </p>
            <div style="font-size: 12px; font-weight: 700; color: var(--pink-text); margin-top: auto;">
              «Nadie da lo que no tiene en su corazón»
            </div>
          </div>

          <div class="quick-card violet" style="border-top: 5px solid var(--violet-accent);">
            <div class="card-badge-row">
              <div class="card-emoji">👭</div>
              <span class="pill-label violet">2. Vínculo</span>
            </div>
            <h3 class="card-concept-title" style="color: var(--violet-text); font-size: 20px;">Cuidado del Otro</h3>
            <p class="card-punchline">
              <strong>Relaciones Humanas:</strong><br>
              Escucha activa, palabras de aliento, empatía y valorar el esfuerzo ajeno.
            </p>
            <div style="font-size: 12px; font-weight: 700; color: var(--violet-text); margin-top: auto;">
              «Tratar a cada persona como un ser sagrado»
            </div>
          </div>

          <div class="quick-card blue" style="border-top: 5px solid var(--blue-accent);">
            <div class="card-badge-row">
              <div class="card-emoji">🌻</div>
              <span class="pill-label blue">3. Hábitat</span>
            </div>
            <h3 class="card-concept-title" style="color: var(--blue-text); font-size: 20px;">Ecocuidado</h3>
            <p class="card-punchline">
              <strong>Nuestra Casa Común:</strong><br>
              Respeto por la Tierra, ahorro de agua, menos basura y amor a la naturaleza.
            </p>
            <div style="font-size: 12px; font-weight: 700; color: var(--blue-text); margin-top: auto;">
              «La Tierra merece ternura y gratitud»
            </div>
          </div>
        </div>
      </section>

      <!-- SLIDE 4: AUTOCUIDADO -->
      <section class="slide" data-name="4. Autocuidado">
        <div class="layout-split img-left">
          <div class="cartoon-card-box">
            <img src="{b64_auto}" alt="Ilustración Autocuidado Té y Descanso">
          </div>

          <div>
            <div class="pill-label">💖 Dimensión 1</div>
            <h2 class="slide-heading">El <span class="highlight-pink">Autocuidado</span></h2>
            <p class="slide-tagline">Amarse a sí misma para poder florecer y cuidar a otros.</p>

            <div class="grid-interactive cols-2">
              <div class="quick-card">
                <div class="card-badge-row">
                  <div class="card-emoji">🫖</div>
                  <span class="card-number-tag">01</span>
                </div>
                <h4 class="card-concept-title">Descanso sin Culpa</h4>
                <p class="card-punchline">Dormir bien y tomarse pausas para un té. Parar no es perder el tiempo: es recargar el alma.</p>
              </div>

              <div class="quick-card">
                <div class="card-badge-row">
                  <div class="card-emoji">🛑</div>
                  <span class="card-number-tag">02</span>
                </div>
                <h4 class="card-concept-title">Decir "NO" a Tiempo</h4>
                <p class="card-punchline">Poner límites saludables. Decir 'no' a sobrecargas innecesarias es decirte 'sí' a tu salud.</p>
              </div>

              <div class="quick-card">
                <div class="card-badge-row">
                  <div class="card-emoji">🕯️</div>
                  <span class="card-number-tag">03</span>
                </div>
                <h4 class="card-concept-title">Paz Mental Diaria</h4>
                <p class="card-punchline">Regalarte cinco minutos de silencio, alejar el celular y respirar hondo para serenar el corazón.</p>
              </div>

              <div class="quick-card">
                <div class="card-badge-row">
                  <div class="card-emoji">🌸</div>
                  <span class="card-number-tag">04</span>
                </div>
                <h4 class="card-concept-title">Autocompasión</h4>
                <p class="card-punchline">Tratarte con la misma dulzura y paciencia con la que tratas a tus mejores amigos.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- SLIDE 5: CUIDADO DEL OTRO -->
      <section class="slide" data-name="5. Cuidado del Otro">
        <div class="layout-split img-right">
          <div>
            <div class="pill-label violet">👭 Dimensión 2</div>
            <h2 class="slide-heading">Cuidado del <span class="highlight-violet">Otro</span></h2>
            <p class="slide-tagline">Construir relaciones basadas en la calidez, la escucha y el respeto.</p>

            <div class="grid-interactive cols-2">
              <div class="quick-card violet">
                <div class="card-badge-row">
                  <div class="card-emoji">👂</div>
                  <span class="card-number-tag">01</span>
                </div>
                <h4 class="card-concept-title">Escucha con el Corazón</h4>
                <p class="card-punchline">Escuchar sin juzgar y sin mirar el celular. Estar presente para validar lo que el otro siente.</p>
              </div>

              <div class="quick-card violet">
                <div class="card-badge-row">
                  <div class="card-emoji">💬</div>
                  <span class="card-number-tag">02</span>
                </div>
                <h4 class="card-concept-title">Palabras que Unen</h4>
                <p class="card-punchline">Cuidar el tono al hablar. Una palabra dulce sana; una palabra hiriente destruye la confianza.</p>
              </div>

              <div class="quick-card violet">
                <div class="card-badge-row">
                  <div class="card-emoji">🥪</div>
                  <span class="card-number-tag">03</span>
                </div>
                <h4 class="card-concept-title">Valorar a Quien Cuida</h4>
                <p class="card-punchline">Agradecer de corazón a quienes cocinan, limpian y atienden a nuestros enfermos y abuelitos.</p>
              </div>

              <div class="quick-card violet">
                <div class="card-badge-row">
                  <div class="card-emoji">🤗</div>
                  <span class="card-number-tag">04</span>
                </div>
                <h4 class="card-concept-title">El Abrazo a Tiempo</h4>
                <p class="card-punchline">Hacer compañía en los momentos difíciles. Nadie debería atravesar el dolor en soledad.</p>
              </div>
            </div>
          </div>

          <div class="cartoon-card-box">
            <img src="{b64_otro}" alt="Ilustración Cuidado del Otro y Abrazo">
          </div>
        </div>
      </section>

      <!-- SLIDE 6: ECOCUIDADO -->
      <section class="slide" data-name="6. Ecocuidado">
        <div class="layout-split img-left">
          <div class="cartoon-card-box">
            <img src="{b64_eco}" alt="Ilustración Ecocuidado y Flores">
          </div>

          <div>
            <div class="pill-label blue">🌻 Dimensión 3</div>
            <h2 class="slide-heading">El <span class="highlight-blue">Ecocuidado</span></h2>
            <p class="slide-tagline">El cuidado del planeta comienza en nuestras acciones de todos los días.</p>

            <div class="grid-interactive cols-2">
              <div class="quick-card blue">
                <div class="card-badge-row">
                  <div class="card-emoji">💧</div>
                  <span class="card-number-tag">01</span>
                </div>
                <h4 class="card-concept-title">Cada Gota Cuenta</h4>
                <p class="card-punchline">Cerrar la llave a tiempo y no desperdiciar el agua limpia: es el mayor tesoro para el mañana.</p>
              </div>

              <div class="quick-card blue">
                <div class="card-badge-row">
                  <div class="card-emoji">🛍️</div>
                  <span class="card-number-tag">02</span>
                </div>
                <h4 class="card-concept-title">Menos Desechables</h4>
                <p class="card-punchline">Cargar termo y bolsa de tela. Evitar plásticos de un solo uso que duran 400 años contaminando.</p>
              </div>

              <div class="quick-card blue">
                <div class="card-badge-row">
                  <div class="card-emoji">♻️</div>
                  <span class="card-number-tag">03</span>
                </div>
                <h4 class="card-concept-title">Separar Limpio</h4>
                <p class="card-punchline">Enjuagar botellas antes de reciclarlas para que las familias recicladoras no se lastimen.</p>
              </div>

              <div class="quick-card blue">
                <div class="card-badge-row">
                  <div class="card-emoji">🐝</div>
                  <span class="card-number-tag">04</span>
                </div>
                <h4 class="card-concept-title">Amar la Vida</h4>
                <p class="card-punchline">Sembrar flores, cuidar los árboles y proteger con ternura a los animalitos de la calle.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- SLIDE 7: CUIDADO EN EL TRABAJO -->
      <section class="slide" data-name="7. En el Trabajo">
        <div class="layout-split img-right">
          <div>
            <div class="pill-label">💼 Ámbito Laboral</div>
            <h2 class="slide-heading">Cuidado en el <span class="highlight-pink">Trabajo</span></h2>
            <p class="slide-tagline">Pasamos la mayor parte del día trabajando: hagámoslo con calidez y respeto.</p>

            <div class="grid-interactive cols-2">
              <div class="quick-card">
                <div class="card-badge-row">
                  <div class="card-emoji">🪑</div>
                  <span class="card-number-tag">01</span>
                </div>
                <h4 class="card-concept-title">Ergonomía y Postura</h4>
                <p class="card-punchline">Pausas activas para estirar los brazos y relajar la vista. Cuidar la espalda es amarse.</p>
              </div>

              <div class="quick-card violet">
                <div class="card-badge-row">
                  <div class="card-emoji">🌈</div>
                  <span class="card-number-tag">02</span>
                </div>
                <h4 class="card-concept-title">Cero Hostilidad</h4>
                <p class="card-punchline">Desterrar los chismes y las descalificaciones. El buen trato hace ligero el trabajo.</p>
              </div>

              <div class="quick-card blue">
                <div class="card-badge-row">
                  <div class="card-emoji">🩺</div>
                  <span class="card-number-tag">03</span>
                </div>
                <h4 class="card-concept-title">Seguridad Mutua</h4>
                <p class="card-punchline">Avisar si hay un piso mojado o un riesgo. Cuidar al compañero es proteger a todo el equipo.</p>
              </div>

              <div class="quick-card">
                <div class="card-badge-row">
                  <div class="card-emoji">☕</div>
                  <span class="card-number-tag">04</span>
                </div>
                <h4 class="card-concept-title">Preguntar con Cariño</h4>
                <p class="card-punchline">Preguntar '¿cómo estás hoy?' antes de exigir resultados. La empatía multiplica la armonía.</p>
              </div>
            </div>
          </div>

          <div class="cartoon-card-box">
            <img src="{b64_lab}" alt="Ilustración Compañerismo y Cuidado en Oficina">
          </div>
        </div>
      </section>

      <!-- SLIDE 8: BARRERAS -->
      <section class="slide" data-name="8. ¿Qué Daña el Cuidado?">
        <div>
          <div class="pill-label">⚠️ Diagnóstico Sincero</div>
          <h2 class="slide-heading">¿Qué <span class="highlight-pink">Daña</span> la Cultura del Cuidado?</h2>
          <p class="slide-tagline">Actitudes cotidianas que rompen la empatía y nos alejan de los demás:</p>
        </div>

        <div class="grid-interactive cols-4" style="flex: 1; align-items: stretch; margin-top: 10px;">
          <div class="quick-card" style="border-top: 4px solid #f43f5e;">
            <div class="card-emoji">🧊</div>
            <h4 class="card-concept-title" style="color: var(--pink-text);">El Individualismo</h4>
            <p class="card-punchline">Pensar 'a mí no me importa mientras yo esté bien'. El egoísmo nos aísla y nos hace infelices.</p>
          </div>

          <div class="quick-card" style="border-top: 4px solid #fb923c;">
            <div class="card-emoji">⏳</div>
            <h4 class="card-concept-title" style="color: #c2410c;">La Prisa Extrema</h4>
            <p class="card-punchline">Vivir corriendo todo el día. Quien vive con afán no tiene tiempo para sonreír ni escuchar.</p>
          </div>

          <div class="quick-card violet" style="border-top: 4px solid #8b5cf6;">
            <div class="card-emoji">🙈</div>
            <h4 class="card-concept-title" style="color: var(--violet-text);">El Desentendimiento</h4>
            <p class="card-punchline">Decir 'para eso le pagan a otros'. Justificar dejar el reguero porque alguien más lo limpiará.</p>
          </div>

          <div class="quick-card blue" style="border-top: 4px solid #38bdf8;">
            <div class="card-emoji">🥀</div>
            <h4 class="card-concept-title" style="color: var(--blue-text);">La Indiferencia</h4>
            <p class="card-punchline">Ver a alguien sufriendo o sobrecargado y pasar de largo. La indiferencia es lo opuesto al amor.</p>
          </div>
        </div>
      </section>

      <!-- SLIDE 9: EL DECÁLOGO -->
      <section class="slide" data-name="9. Decálogo">
        <div class="layout-split img-left">
          <div class="cartoon-card-box">
            <img src="{b64_arb}" alt="Ilustración Árbol de la Vida y Cuidado">
          </div>

          <div>
            <div class="pill-label violet">📜 10 Compromisos</div>
            <h2 class="slide-heading">Decálogo del <span class="highlight-violet">Cuidado</span></h2>
            <p class="slide-tagline">Principios sencillos para guardar en el corazón:</p>

            <div class="grid-interactive cols-2" style="gap: 10px;">
              <div class="quick-card" style="padding: 10px 14px;">
                <div style="font-size: 13px; font-weight: 800; color: var(--pink-text);">1. La vida es sagrada</div>
                <div style="font-size: 12px; color: var(--text-dark);">Honrar a toda persona y ser vivo.</div>
              </div>
              <div class="quick-card violet" style="padding: 10px 14px;">
                <div style="font-size: 13px; font-weight: 800; color: var(--violet-text);">6. Corresponsabilidad</div>
                <div style="font-size: 12px; color: var(--text-dark);">Lo que hago afecta a los demás.</div>
              </div>
              <div class="quick-card" style="padding: 10px 14px;">
                <div style="font-size: 13px; font-weight: 800; color: var(--pink-text);">2. Cuidarme es cuidarte</div>
                <div style="font-size: 12px; color: var(--text-dark);">Estar bien para dar bienestar.</div>
              </div>
              <div class="quick-card violet" style="padding: 10px 14px;">
                <div style="font-size: 13px; font-weight: 800; color: var(--violet-text);">7. Gratitud sincera</div>
                <div style="font-size: 12px; color: var(--text-dark);">Valorar a quienes limpian y cuidan.</div>
              </div>
              <div class="quick-card" style="padding: 10px 14px;">
                <div style="font-size: 13px; font-weight: 800; color: var(--pink-text);">3. La palabra construye</div>
                <div style="font-size: 12px; color: var(--text-dark);">Hablar con dulzura y respeto.</div>
              </div>
              <div class="quick-card violet" style="padding: 10px 14px;">
                <div style="font-size: 13px; font-weight: 800; color: var(--violet-text);">8. Respetar la Tierra</div>
                <div style="font-size: 12px; color: var(--text-dark);">Consumir lo necesario con amor.</div>
              </div>
              <div class="quick-card" style="padding: 10px 14px;">
                <div style="font-size: 13px; font-weight: 800; color: var(--pink-text);">4. Escuchar con el alma</div>
                <div style="font-size: 12px; color: var(--text-dark);">Prestar atención de verdad.</div>
              </div>
              <div class="quick-card violet" style="padding: 10px 14px;">
                <div style="font-size: 13px; font-weight: 800; color: var(--violet-text);">9. Paz en el conflicto</div>
                <div style="font-size: 12px; color: var(--text-dark);">Dialogar sin guardar rencores.</div>
              </div>
              <div class="quick-card" style="padding: 10px 14px;">
                <div style="font-size: 13px; font-weight: 800; color: var(--pink-text);">5. Aceptar la fragilidad</div>
                <div style="font-size: 12px; color: var(--text-dark);">Todos necesitamos ayuda a veces.</div>
              </div>
              <div class="quick-card violet" style="padding: 10px 14px;">
                <div style="font-size: 13px; font-weight: 800; color: var(--violet-text);">10. Cuidar es trascender</div>
                <div style="font-size: 12px; color: var(--text-dark);">Dejar una huella de ternura.</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- SLIDE 10: CIERRE -->
      <section class="slide" data-name="10. Cierre">
        <div style="flex:1; display:flex; flex-direction:column; justify-content:center; align-items:center; text-align:center;">
          <div style="font-size: 64px; margin-bottom: 8px; animation: pulse 1.6s infinite ease-in-out;">💐</div>
          <h2 class="slide-heading" style="font-size: 48px; color: var(--pink-text); margin-bottom: 8px;">
            ¡Muchas Gracias!
          </h2>

          <p style="font-size: 19px; color: #4b5563; max-width: 650px; line-height: 1.5; margin-bottom: 24px; font-style: italic;">
            «El cuidado es la fuerza tierna que evita que el mundo se desmorone. Cuidar de nosotras, del otro y de la Tierra es el mayor acto de amor»
          </p>

          <div style="background: linear-gradient(135deg, var(--pastel-pink-bg), #ffffff); padding: 14px 34px; border-radius: 9999px; border: 2px solid var(--pastel-pink-border); box-shadow: var(--shadow-sm); margin-bottom: 18px;">
            <span style="font-size: 20px; font-weight: 800; color: var(--text-dark);">
              Bertha Inés Medina Hernández
            </span>
          </div>

          <div style="display:flex; gap:10px;">
            <span class="pill-label">🌸 Preguntas y Reflexiones</span>
            <span class="pill-label violet">🌷 Diálogo Abierto</span>
          </div>
        </div>
      </section>

    </main>

    <!-- Bottom Controls Deck Bar -->
    <footer class="deck-footer">
      <div class="footer-left">
        <button class="action-nav-btn secondary" id="prevSlideBtn">
          ‹ Anterior
        </button>
        <span class="slide-step-counter" id="slideIndicator">
          1 / 10
        </span>
      </div>

      <div class="progress-bar-container">
        <div class="progress-fill-line" id="progressFill"></div>
      </div>

      <div class="footer-actions">
        <button class="action-nav-btn" id="nextSlideBtn">
          Siguiente ›
        </button>
      </div>
    </footer>

    <!-- Thumbnails Tray (Interactive visual carousel) -->
    <div id="thumb-tray">
      <!-- Generated via JS -->
    </div>

  </div>

  <script>
    const slides = document.querySelectorAll('.slide');
    const prevBtn = document.getElementById('prevSlideBtn');
    const nextBtn = document.getElementById('nextSlideBtn');
    const indicator = document.getElementById('slideIndicator');
    const progressFill = document.getElementById('progressFill');
    const thumbTray = document.getElementById('thumb-tray');
    const btnToggleThumbs = document.getElementById('btnToggleThumbs');
    const btnFullscreen = document.getElementById('btnFullscreen');
    const deckWrapper = document.getElementById('deck-wrapper');

    let currentIndex = 0;

    // Build Thumbnails Tray
    slides.forEach((s, idx) => {{
      const name = s.getAttribute('data-name') || `Slide ${{idx + 1}}`;
      const div = document.createElement('div');
      div.className = 'thumb-item' + (idx === 0 ? ' active' : '');
      div.innerHTML = `<span class="thumb-item-num">${{idx + 1}}</span><span class="thumb-item-name">${{name}}</span>`;
      div.addEventListener('click', () => {{
        goTo(idx);
        thumbTray.classList.remove('open');
      }});
      thumbTray.appendChild(div);
    }});

    function updateDeck() {{
      slides.forEach((s, idx) => {{
        s.classList.toggle('active', idx === currentIndex);
      }});

      // Update thumbnail active
      const thumbs = document.querySelectorAll('.thumb-item');
      thumbs.forEach((t, idx) => {{
        t.classList.toggle('active', idx === currentIndex);
      }});

      indicator.textContent = `${{currentIndex + 1}} / ${{slides.length}}`;
      const pct = ((currentIndex + 1) / slides.length) * 100;
      progressFill.style.width = `${{pct}}%`;

      prevBtn.style.opacity = currentIndex === 0 ? '0.4' : '1';
      prevBtn.style.pointerEvents = currentIndex === 0 ? 'none' : 'auto';

      if (currentIndex === slides.length - 1) {{
        nextBtn.innerHTML = 'Reiniciar ↻';
      }} else {{
        nextBtn.innerHTML = 'Siguiente ›';
      }}
    }}

    function goTo(idx) {{
      if (idx < 0) idx = 0;
      if (idx >= slides.length) idx = 0;
      currentIndex = idx;
      updateDeck();
    }}

    prevBtn.addEventListener('click', () => goTo(currentIndex - 1));
    nextBtn.addEventListener('click', () => goTo(currentIndex + 1));

    // Keyboard Shortcuts (Arrow keys, Spacebar)
    document.addEventListener('keydown', (e) => {{
      if (e.key === 'ArrowRight' || e.key === ' ' || e.key === 'PageDown') {{
        goTo(currentIndex + 1);
      }} else if (e.key === 'ArrowLeft' || e.key === 'PageUp') {{
        goTo(currentIndex - 1);
      }} else if (e.key === 'Escape') {{
        thumbTray.classList.remove('open');
      }}
    }});

    // Toggle thumbnails tray
    btnToggleThumbs.addEventListener('click', () => {{
      thumbTray.classList.toggle('open');
    }});

    // Fullscreen Toggle
    btnFullscreen.addEventListener('click', () => {{
      if (!document.fullscreenElement) {{
        deckWrapper.requestFullscreen().catch(err => alert(`Error pantalla completa: ${{err.message}}`));
      }} else {{
        document.exitFullscreen();
      }}
    }});

    updateDeck();
  </script>

</body>
</html>
"""

# Guardar en Desktop y Descargas
path_desk = r"C:\Users\lenovo\Desktop\trabajos andres\Presentacion_Cultura_del_Cuidado.html"
path_down = r"C:\Users\lenovo\Downloads\Presentacion_Cultura_del_Cuidado.html"

with open(path_desk, "w", encoding="utf-8") as f:
    f.write(html_template)

with open(path_down, "w", encoding="utf-8") as f:
    f.write(html_template)

print("Presentación web interactiva innovadora generada exitosamente con 10 diapositivas limpias y colores pastel.")
