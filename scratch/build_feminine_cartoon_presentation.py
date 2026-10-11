# -*- coding: utf-8 -*-
r"""
Script para generar la Presentación Web Interactiva HTML5
con diseño femenino, colores suaves pastel, ilustraciones cartoon integradas en Base64,
menú lateral retráctil, pestañas interactivas y modo pantalla completa.
"""

import os
import base64

img_hero_path = r"C:\Users\lenovo\.gemini\antigravity-ide\brain\1028804d-2a48-4bc7-9c53-7b9c7a021007\cultura_cuidado_hero_1790564737046.jpg"
img_auto_path = r"C:\Users\lenovo\.gemini\antigravity-ide\brain\1028804d-2a48-4bc7-9c53-7b9c7a021007\autocuidado_cartoon_1790564757178.jpg"
img_otro_path = r"C:\Users\lenovo\.gemini\antigravity-ide\brain\1028804d-2a48-4bc7-9c53-7b9c7a021007\cuidado_del_otro_cartoon_1790564777509.jpg"
img_eco_path  = r"C:\Users\lenovo\.gemini\antigravity-ide\brain\1028804d-2a48-4bc7-9c53-7b9c7a021007\ecocuidado_cartoon_1790564803549.jpg"

def get_b64(path):
    with open(path, "rb") as f:
        return "data:image/jpeg;base64," + base64.b64encode(f.read()).decode("utf-8")

b64_hero = get_b64(img_hero_path)
b64_auto = get_b64(img_auto_path)
b64_otro = get_b64(img_otro_path)
b64_eco  = get_b64(img_eco_path)

html_template = f"""<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>La Cultura del Cuidado - Bertha Inés Medina Hernández</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Quicksand:wght@400;500;600;700&family=Nunito:ital,wght@0,400;0,600;0,700;0,800;1,600&family=Caveat:wght@600;700&display=swap" rel="stylesheet">
  <style>
    :root {{
      --rose-50: #fff1f2;
      --rose-100: #ffe4e6;
      --rose-200: #fecdd3;
      --rose-400: #fb7185;
      --rose-500: #f43f5e;
      --rose-600: #e11d48;
      --rose-700: #be123c;
      --lavender-50: #f5f3ff;
      --lavender-100: #ede9fe;
      --lavender-400: #a78bfa;
      --lavender-600: #7c3aed;
      --peach-50: #fff7ed;
      --peach-100: #ffedd5;
      --peach-400: #fb923c;
      --mint-50: #f0fdf4;
      --mint-100: #dcfce7;
      --mint-500: #22c55e;
      --mint-600: #16a34a;
      --cream: #fdfbf7;
      --text-dark: #374151;
      --text-muted: #6b7280;
      --shadow-soft: 0 10px 25px -5px rgba(244, 63, 94, 0.08), 0 8px 10px -6px rgba(0, 0, 0, 0.04);
      --shadow-hover: 0 20px 30px -10px rgba(244, 63, 94, 0.18);
    }}

    * {{
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }}

    body {{
      font-family: 'Nunito', sans-serif;
      background: linear-gradient(135deg, #fce7f3 0%, #ede9fe 50%, #e0f2fe 100%);
      color: var(--text-dark);
      min-height: 100vh;
      display: flex;
      justify-content: center;
      align-items: center;
      padding: 15px;
      overflow: hidden;
    }}

    /* Main Presentation Frame (16:9 Aspect Ratio) */
    #pres-container {{
      width: 100%;
      max-width: 1380px;
      height: 92vh;
      max-height: 820px;
      aspect-ratio: 16 / 9;
      background: var(--cream);
      border-radius: 28px;
      box-shadow: 0 25px 60px -15px rgba(124, 58, 237, 0.2), 0 0 0 1px rgba(255, 255, 255, 0.8) inset;
      position: relative;
      display: flex;
      flex-direction: column;
      overflow: hidden;
      border: 4px solid #ffffff;
    }}

    /* Top Bar */
    header.top-bar {{
      height: 64px;
      background: rgba(255, 255, 255, 0.85);
      backdrop-filter: blur(12px);
      border-bottom: 2px solid var(--rose-100);
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0 28px;
      z-index: 20;
    }}

    .logo-badge {{
      display: flex;
      align-items: center;
      gap: 10px;
      font-family: 'Quicksand', sans-serif;
      font-weight: 700;
      font-size: 16px;
      color: var(--rose-600);
    }}
    .logo-heart {{
      font-size: 20px;
      animation: heartbeat 1.8s infinite;
    }}

    @keyframes heartbeat {{
      0%, 100% {{ transform: scale(1); }}
      50% {{ transform: scale(1.2); }}
    }}

    .author-chip {{
      background: linear-gradient(135deg, var(--rose-100), var(--lavender-100));
      padding: 6px 16px;
      border-radius: 9999px;
      font-size: 13px;
      font-weight: 700;
      color: var(--rose-700);
      border: 1px solid var(--rose-200);
      display: flex;
      align-items: center;
      gap: 6px;
    }}

    .top-actions {{
      display: flex;
      align-items: center;
      gap: 12px;
    }}

    .btn-top {{
      background: #ffffff;
      border: 1px solid var(--rose-200);
      color: var(--rose-600);
      padding: 6px 14px;
      border-radius: 12px;
      font-size: 12.5px;
      font-weight: 700;
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: 6px;
      transition: all 0.2s ease;
    }}
    .btn-top:hover {{
      background: var(--rose-50);
      transform: translateY(-1px);
      box-shadow: 0 4px 12px rgba(244, 63, 94, 0.15);
    }}

    /* Slide Stage */
    #slide-stage {{
      flex: 1;
      position: relative;
      overflow: hidden;
      padding: 30px 48px;
      background: radial-gradient(circle at top right, rgba(254, 205, 211, 0.25), transparent 50%),
                  radial-gradient(circle at bottom left, rgba(221, 214, 254, 0.25), transparent 50%),
                  var(--cream);
    }}

    .slide {{
      position: absolute;
      top: 30px;
      left: 48px;
      right: 48px;
      bottom: 30px;
      display: none;
      flex-direction: column;
      opacity: 0;
      transform: translateY(12px) scale(0.99);
      transition: opacity 0.45s ease, transform 0.45s cubic-bezier(0.16, 1, 0.3, 1);
    }}

    .slide.active {{
      display: flex;
      opacity: 1;
      transform: translateY(0) scale(1);
    }}

    /* Slide Components */
    .pill-tag {{
      display: inline-flex;
      align-items: center;
      gap: 6px;
      background: var(--rose-100);
      color: var(--rose-700);
      padding: 4px 14px;
      border-radius: 9999px;
      font-size: 12px;
      font-weight: 700;
      letter-spacing: 0.5px;
      text-transform: uppercase;
      margin-bottom: 8px;
      width: fit-content;
    }}
    .pill-tag.lavender {{ background: var(--lavender-100); color: var(--lavender-600); }}
    .pill-tag.mint {{ background: var(--mint-100); color: var(--mint-600); }}
    .pill-tag.peach {{ background: var(--peach-100); color: var(--peach-400); }}

    .title-h1 {{
      font-family: 'Quicksand', sans-serif;
      font-size: 34px;
      font-weight: 700;
      color: var(--rose-700);
      line-height: 1.2;
      margin-bottom: 4px;
    }}

    .sub-text {{
      font-size: 15px;
      color: var(--text-muted);
      margin-bottom: 20px;
      font-weight: 600;
    }}

    /* Card Grids */
    .grid-cards {{
      display: grid;
      gap: 20px;
      flex: 1;
    }}
    .grid-cards.cols-3 {{ grid-template-columns: repeat(3, 1fr); }}
    .grid-cards.cols-2 {{ grid-template-columns: repeat(2, 1fr); }}
    .grid-cards.cols-4 {{ grid-template-columns: repeat(4, 1fr); }}

    .card-item {{
      background: #ffffff;
      border-radius: 20px;
      padding: 22px;
      border: 1px solid rgba(244, 63, 94, 0.12);
      box-shadow: var(--shadow-soft);
      display: flex;
      flex-direction: column;
      position: relative;
      overflow: hidden;
      transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
    }}
    .card-item:hover {{
      transform: translateY(-5px);
      box-shadow: var(--shadow-hover);
      border-color: var(--rose-400);
    }}

    .card-icon-badge {{
      width: 48px;
      height: 48px;
      border-radius: 14px;
      background: var(--rose-100);
      color: var(--rose-600);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 24px;
      margin-bottom: 12px;
    }}
    .card-icon-badge.lavender {{ background: var(--lavender-100); color: var(--lavender-600); }}
    .card-icon-badge.mint {{ background: var(--mint-100); color: var(--mint-600); }}
    .card-icon-badge.peach {{ background: var(--peach-100); color: var(--peach-400); }}

    .card-title {{
      font-family: 'Quicksand', sans-serif;
      font-size: 18px;
      font-weight: 700;
      color: #1f2937;
      margin-bottom: 8px;
    }}

    .card-p {{
      font-size: 13.5px;
      line-height: 1.6;
      color: var(--text-dark);
      flex: 1;
    }}

    .card-highlight {{
      margin-top: 12px;
      padding-top: 10px;
      border-top: 1px dashed var(--rose-200);
      font-size: 12.5px;
      font-weight: 600;
      color: var(--rose-700);
    }}

    /* Split with Cartoon Image */
    .split-layout {{
      display: grid;
      grid-template-columns: 1.15fr 0.85fr;
      gap: 32px;
      align-items: center;
      flex: 1;
    }}

    .split-layout.reverse {{
      grid-template-columns: 0.85fr 1.15fr;
    }}

    .cartoon-img-frame {{
      width: 100%;
      height: 100%;
      max-height: 460px;
      border-radius: 24px;
      overflow: hidden;
      box-shadow: 0 16px 36px -8px rgba(225, 29, 72, 0.2);
      border: 5px solid #ffffff;
      background: #ffffff;
      position: relative;
    }}
    .cartoon-img-frame img {{
      width: 100%;
      height: 100%;
      object-fit: cover;
      display: block;
      transition: transform 0.6s ease;
    }}
    .cartoon-img-frame:hover img {{
      transform: scale(1.03);
    }}

    /* Interactive Stepper / Tabs inside Slide */
    .interactive-pills {{
      display: flex;
      gap: 10px;
      margin-bottom: 18px;
    }}
    .int-btn {{
      padding: 8px 18px;
      border-radius: 9999px;
      border: 1px solid var(--rose-200);
      background: #ffffff;
      color: var(--rose-600);
      font-size: 13px;
      font-weight: 700;
      cursor: pointer;
      transition: all 0.2s;
    }}
    .int-btn.active {{
      background: var(--rose-500);
      color: #ffffff;
      border-color: var(--rose-500);
      box-shadow: 0 4px 12px rgba(244, 63, 94, 0.25);
    }}

    /* Decalogo List */
    .decalogo-grid {{
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 14px 20px;
      background: #ffffff;
      padding: 24px;
      border-radius: 20px;
      border: 1px solid var(--rose-100);
      box-shadow: var(--shadow-soft);
    }}
    .dec-item {{
      display: flex;
      gap: 12px;
      align-items: flex-start;
      font-size: 13.5px;
      line-height: 1.5;
    }}
    .dec-num {{
      width: 26px;
      height: 26px;
      border-radius: 50%;
      background: var(--rose-100);
      color: var(--rose-600);
      font-weight: 800;
      font-size: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }}

    /* Bottom Navigation Bar */
    footer.bottom-bar {{
      height: 72px;
      background: #ffffff;
      border-top: 2px solid var(--rose-100);
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0 32px;
      z-index: 20;
    }}

    .progress-track {{
      flex: 1;
      max-width: 450px;
      height: 8px;
      background: var(--rose-100);
      border-radius: 9999px;
      overflow: hidden;
      margin: 0 24px;
    }}
    .progress-fill {{
      height: 100%;
      width: 8.33%;
      background: linear-gradient(90deg, var(--rose-400), var(--lavender-600));
      border-radius: 9999px;
      transition: width 0.35s ease;
    }}

    .nav-controls {{
      display: flex;
      align-items: center;
      gap: 12px;
    }}

    .nav-btn {{
      background: linear-gradient(135deg, var(--rose-500), var(--rose-600));
      color: #ffffff;
      border: none;
      padding: 10px 22px;
      border-radius: 14px;
      font-size: 14px;
      font-weight: 700;
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: 8px;
      box-shadow: 0 4px 14px rgba(225, 29, 72, 0.25);
      transition: all 0.2s;
    }}
    .nav-btn:hover {{
      transform: translateY(-2px);
      box-shadow: 0 6px 20px rgba(225, 29, 72, 0.35);
    }}
    .nav-btn.secondary {{
      background: #ffffff;
      color: var(--rose-600);
      border: 1px solid var(--rose-200);
      box-shadow: none;
    }}
    .nav-btn.secondary:hover {{
      background: var(--rose-50);
    }}

    .counter-badge {{
      font-size: 14px;
      font-weight: 800;
      color: var(--rose-700);
      font-family: 'Quicksand', sans-serif;
    }}

    /* Side Drawer Menu */
    #side-drawer {{
      position: absolute;
      top: 64px;
      left: 0;
      width: 320px;
      bottom: 0;
      background: rgba(255, 255, 255, 0.95);
      backdrop-filter: blur(16px);
      border-right: 2px solid var(--rose-100);
      box-shadow: 10px 0 30px rgba(0, 0, 0, 0.05);
      z-index: 30;
      transform: translateX(-100%);
      transition: transform 0.3s cubic-bezier(0.16, 1, 0.3, 1);
      display: flex;
      flex-direction: column;
      padding: 20px;
    }}
    #side-drawer.open {{
      transform: translateX(0);
    }}

    .drawer-title {{
      font-family: 'Quicksand', sans-serif;
      font-size: 16px;
      font-weight: 700;
      color: var(--rose-700);
      margin-bottom: 14px;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }}
    .drawer-menu-list {{
      list-style: none;
      overflow-y: auto;
      flex: 1;
      padding-right: 6px;
    }}
    .drawer-menu-item {{
      padding: 10px 14px;
      border-radius: 10px;
      font-size: 13.5px;
      font-weight: 600;
      color: var(--text-dark);
      cursor: pointer;
      margin-bottom: 6px;
      transition: all 0.15s;
      display: flex;
      align-items: center;
      gap: 10px;
    }}
    .drawer-menu-item:hover, .drawer-menu-item.active {{
      background: var(--rose-100);
      color: var(--rose-700);
      font-weight: 700;
    }}

    /* Quote bubble in feminine script */
    .script-quote {{
      font-family: 'Caveat', cursive;
      font-size: 26px;
      color: var(--rose-600);
      line-height: 1.3;
      margin-top: 10px;
    }}
  </style>
</head>
<body>

  <div id="pres-container">

    <!-- Top Navigation Header -->
    <header class="top-bar">
      <div class="logo-badge">
        <button class="btn-top" id="toggleDrawerBtn" title="Índice de Diapositivas">
          ☰ Menú
        </button>
        <span class="logo-heart">🌸</span>
        <span>Cultura del Cuidado</span>
      </div>

      <div class="author-chip">
        <span>Expositora:</span>
        <strong>Bertha Inés Medina Hernández</strong>
      </div>

      <div class="top-actions">
        <button class="btn-top" id="btnFullscreen">
          ⛶ Pantalla Completa
        </button>
      </div>
    </header>

    <!-- Side Drawer Menu for quick jumping -->
    <div id="side-drawer">
      <div class="drawer-title">
        <span>Índice de la Presentación</span>
        <span id="closeDrawer" style="cursor:pointer; font-size:20px;">✕</span>
      </div>
      <ul class="drawer-menu-list" id="drawerList">
        <!-- Will be populated by JS -->
      </ul>
    </div>

    <!-- Main Stage containing the Slides -->
    <main id="slide-stage">

      <!-- SLIDE 1: PORTADA -->
      <section class="slide active" data-title="1. Bienvenida y Portada">
        <div class="split-layout">
          <div>
            <div class="pill-tag">🌸 Ética • Bienestar • Corresponsabilidad</div>
            <h1 class="title-h1" style="font-size: 44px; margin-bottom: 12px; color: var(--rose-600);">
              La Cultura del Cuidado
            </h1>
            <p class="sub-text" style="font-size: 18px; line-height: 1.5; color: #4b5563;">
              Una mirada sensible hacia la preservación de la vida, el buen trato y la armonía comunitaria.
            </p>

            <div style="background: #ffffff; border-radius: 18px; padding: 20px 24px; border: 2px solid var(--rose-100); box-shadow: var(--shadow-soft); margin-top: 20px; max-width: 480px;">
              <div style="font-size: 11px; font-weight: 800; text-transform: uppercase; color: var(--rose-500); letter-spacing: 1px;">
                PRESENTADO CON AMOR POR:
              </div>
              <div style="font-size: 24px; font-weight: 800; color: var(--rose-700); margin: 4px 0;">
                Bertha Inés Medina Hernández
              </div>
              <div style="font-size: 13.5px; color: var(--text-muted); font-weight: 600;">
                Seminario de Ciencias Sociales, Ética y Desarrollo Humano • 2026
              </div>
            </div>

            <div class="script-quote">
              «Cuidar es el acto más dulce y valiente para sanar el mundo»
            </div>
          </div>

          <div class="cartoon-img-frame">
            <img src="{b64_hero}" alt="Cultura del Cuidado Ilustración">
          </div>
        </div>
      </section>

      <!-- SLIDE 2: ¿QUÉ ES EL CUIDADO? -->
      <section class="slide" data-title="2. ¿Qué es la Cultura del Cuidado?">
        <div>
          <div class="pill-tag lavender">✨ Fundamento Ético</div>
          <h2 class="title-h1">¿Qué es realmente la Cultura del Cuidado?</h2>
          <p class="sub-text">Más que cumplir una norma o hacer un favor: es una manera amorosa de habitar el mundo.</p>
        </div>

        <div class="grid-cards cols-3" style="margin-top: 10px;">
          <div class="card-item">
            <div class="card-icon-badge">🌿</div>
            <h3 class="card-title">Modo Esencial de Ser</h3>
            <p class="card-p">
              Como nos enseña Leonardo Boff, el cuidado no es algo que hacemos de vez en cuando; es la condición misma que nos permite estar vivos. Sin el cuidado amoroso en nuestros primeros años, ninguno de nosotros habría sobrevivido.
            </p>
            <div class="card-highlight">
              • Nace del afecto y la ternura<br>
              • Sostiene la dignidad humana
            </div>
          </div>

          <div class="card-item">
            <div class="card-icon-badge lavender">👁️</div>
            <h3 class="card-title">Vencer la Indiferencia</h3>
            <p class="card-p">
              Vivimos en un mundo acelerado donde muchas veces no nos miramos a los ojos. Cuidar significa detener la prisa, abrir el corazón y prestar atención a la fragilidad de quien está a nuestro lado.
            </p>
            <div class="card-highlight" style="color: var(--lavender-600); border-color: var(--lavender-200);">
              • Escucha atenta y sensible<br>
              • Romper con el individualismo
            </div>
          </div>

          <div class="card-item">
            <div class="card-icon-badge peach">🤝</div>
            <h3 class="card-title">Corresponsabilidad Viva</h3>
            <p class="card-p">
              El cuidado no puede recaer solo en una persona, en la madre de familia o en quien limpia. Es un pacto compartido donde cada uno cuida de sí, protege a su compañero y cuida los espacios que todos usamos.
            </p>
            <div class="card-highlight" style="color: var(--peach-400); border-color: var(--peach-200);">
              • Todos nos necesitamos<br>
              • Solidaridad en acción
            </div>
          </div>
        </div>
      </section>

      <!-- SLIDE 3: EL TRIÁNGULO DEL CUIDADO -->
      <section class="slide" data-title="3. El Triángulo del Cuidado">
        <div>
          <div class="pill-tag mint">🌱 Modelo Integral</div>
          <h2 class="title-h1">Las Tres Dimensiones del Cuidado</h2>
          <p class="sub-text">El cuidado auténtico florece cuando armonizamos tres planos inseparables:</p>
        </div>

        <div class="grid-cards cols-3">
          <div class="card-item" style="border-top: 5px solid var(--rose-400);">
            <div class="card-icon-badge">💖</div>
            <div class="pill-tag">Dimensión 1</div>
            <h3 class="card-title" style="color: var(--rose-700);">El Autocuidado</h3>
            <p class="card-p">
              <strong>El Cuidado de Sí Misma:</strong> La raíz de todo. Aprender a descansar, comer bien, poner límites y atender la propia salud física y emocional sin culpa.
            </p>
            <div class="card-highlight">
              «No puedes dar agua fresca si tu propio cántaro está vacío»
            </div>
          </div>

          <div class="card-item" style="border-top: 5px solid var(--lavender-400);">
            <div class="card-icon-badge lavender">👭</div>
            <div class="pill-tag lavender">Dimensión 2</div>
            <h3 class="card-title" style="color: var(--lavender-600);">El Cuidado del Otro</h3>
            <p class="card-p">
              <strong>El Cuidado Interpersonal:</strong> La ética del buen trato, la empatía y la compasión. Reconocer el valor de la familia, los compañeros y los vecinos.
            </p>
            <div class="card-highlight" style="color: var(--lavender-600); border-color: var(--lavender-200);">
              «Tratar a cada persona como un tesoro sagrado»
            </div>
          </div>

          <div class="card-item" style="border-top: 5px solid var(--mint-500);">
            <div class="card-icon-badge mint">🌻</div>
            <div class="pill-tag mint">Dimensión 3</div>
            <h3 class="card-title" style="color: var(--mint-600);">El Ecocuidado</h3>
            <p class="card-p">
              <strong>El Cuidado del Entorno:</strong> Respetar a la Madre Tierra y cuidar los espacios comunes. Consumir con sobriedad y no malgastar el agua ni generar basuras innecesarias.
            </p>
            <div class="card-highlight" style="color: var(--mint-600); border-color: var(--mint-200);">
              «Nuestra Casa Común merece ternura y respeto»
            </div>
          </div>
        </div>
      </section>

      <!-- SLIDE 4: AUTOCUIDADO DETALLE -->
      <section class="slide" data-title="4. Dimensión 1: Autocuidado">
        <div class="split-layout reverse">
          <div class="cartoon-img-frame">
            <img src="{b64_auto}" alt="Autocuidado Ilustración Cómoda">
          </div>

          <div>
            <div class="pill-tag">💖 Cuidado de Sí Misma</div>
            <h2 class="title-h1">El Autocuidado: Amarse para Poder Amar</h2>
            <p class="sub-text">El autocuidado no es un capricho ni egoísmo; es la base de nuestra salud integral.</p>

            <div class="grid-cards cols-2" style="gap: 14px;">
              <div class="card-item" style="padding: 16px;">
                <div style="font-size: 20px; margin-bottom: 4px;">🫖</div>
                <h4 style="font-size: 15px; font-weight: 700; color: var(--rose-700);">1. Descanso Reparador</h4>
                <p style="font-size: 12.5px; color: #4b5563;">Dormir las horas necesarias, tomarse pausas para un té caliente y escuchar cuando el cuerpo pide detenerse.</p>
              </div>

              <div class="card-item" style="padding: 16px;">
                <div style="font-size: 20px; margin-bottom: 4px;">🌷</div>
                <h4 style="font-size: 15px; font-weight: 700; color: var(--rose-700);">2. Decir "NO" a Tiempo</h4>
                <p style="font-size: 12.5px; color: #4b5563;">Poner límites saludables. Decir 'no' a las sobrecargas excesivas es decirte 'SÍ' a tu propia salud mental.</p>
              </div>

              <div class="card-item" style="padding: 16px;">
                <div style="font-size: 20px; margin-bottom: 4px;">🕯️</div>
                <h4 style="font-size: 15px; font-weight: 700; color: var(--rose-700);">3. Paz Interior y Mimo</h4>
                <p style="font-size: 12.5px; color: #4b5563;">Buscar momentos de silencio, una lectura agradable o una caminata tranquila para calmar el corazón.</p>
              </div>

              <div class="card-item" style="padding: 16px;">
                <div style="font-size: 20px; margin-bottom: 4px;">🦋</div>
                <h4 style="font-size: 15px; font-weight: 700; color: var(--rose-700);">4. Cero Culpa al Parar</h4>
                <p style="font-size: 12.5px; color: #4b5563;">Desterrar la idea de que descansar es perder el tiempo. Parar es recargar la energía para seguir adelante.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- SLIDE 5: CUIDADO DEL OTRO DETALLE -->
      <section class="slide" data-title="5. Dimensión 2: Cuidado del Otro">
        <div class="split-layout">
          <div>
            <div class="pill-tag lavender">👭 Ética del Buen Trato</div>
            <h2 class="title-h1">El Cuidado del Otro: Tejer Lazos de Amor</h2>
            <p class="sub-text">La ética del cuidado (Carol Gilligan) nos recuerda que la vida cobra sentido en la relación con los demás.</p>

            <div class="grid-cards cols-2" style="gap: 14px;">
              <div class="card-item" style="padding: 16px;">
                <div style="font-size: 20px; margin-bottom: 4px;">👂</div>
                <h4 style="font-size: 15px; font-weight: 700; color: var(--lavender-600);">Escuchar de Corazón</h4>
                <p style="font-size: 12.5px; color: #4b5563;">Escuchar sin mirar el celular, sin interrumpir y sin juzgar. Regalarle a alguien nuestra atención es un bálsamo.</p>
              </div>

              <div class="card-item" style="padding: 16px;">
                <div style="font-size: 20px; margin-bottom: 4px;">💬</div>
                <h4 style="font-size: 15px; font-weight: 700; color: var(--lavender-600);">Palabras que Acarician</h4>
                <p style="font-size: 12.5px; color: #4b5563;">Cuidar el tono y la intención. Una palabra dulce consuela y alivia; una palabra dura destruye la confianza.</p>
              </div>

              <div class="card-item" style="padding: 16px;">
                <div style="font-size: 20px; margin-bottom: 4px;">🥪</div>
                <h4 style="font-size: 15px; font-weight: 700; color: var(--lavender-600);">Valorar el Trabajo de Cuido</h4>
                <p style="font-size: 12.5px; color: #4b5563;">Agradecer a las madres, abuelas, enfermeras y operarias que preparan la comida y mantienen limpio nuestro entorno.</p>
              </div>

              <div class="card-item" style="padding: 16px;">
                <div style="font-size: 20px; margin-bottom: 4px;">🤗</div>
                <h4 style="font-size: 15px; font-weight: 700; color: var(--lavender-600);">El Abrazo Solidario</h4>
                <p style="font-size: 12.5px; color: #4b5563;">Hacer presencia en los días difíciles de un compañero o familiar. Nadie debería enfrentar el dolor en soledad.</p>
              </div>
            </div>
          </div>

          <div class="cartoon-img-frame">
            <img src="{b64_otro}" alt="Cuidado del Otro Ilustración Cálida">
          </div>
        </div>
      </section>

      <!-- SLIDE 6: ECOCUIDADO DETALLE -->
      <section class="slide" data-title="6. Dimensión 3: Ecocuidado">
        <div class="split-layout reverse">
          <div class="cartoon-img-frame">
            <img src="{b64_eco}" alt="Ecocuidado Ilustración Jardín">
          </div>

          <div>
            <div class="pill-tag mint">🌻 Amor a la Naturaleza</div>
            <h2 class="title-h1">Ecocuidado: Sanar Nuestra Casa Común</h2>
            <p class="sub-text">La Tierra no nos pertenece; nosotros pertenecemos a la Tierra.</p>

            <div class="grid-cards cols-2" style="gap: 14px;">
              <div class="card-item" style="padding: 16px;">
                <div style="font-size: 20px; margin-bottom: 4px;">💧</div>
                <h4 style="font-size: 15px; font-weight: 700; color: var(--mint-600);">Gratitud por el Agua</h4>
                <p style="font-size: 12.5px; color: #4b5563;">Cerrar la llave a tiempo, no contaminar los ríos y recordar que cada gota de agua es un milagro que hace posible la vida.</p>
              </div>

              <div class="card-item" style="padding: 16px;">
                <div style="font-size: 20px; margin-bottom: 4px;">🛍️</div>
                <h4 style="font-size: 15px; font-weight: 700; color: var(--mint-600);">Menos Plástico, Más Amor</h4>
                <p style="font-size: 12.5px; color: #4b5563;">Llevar bolsa de tela y termo propio. Evitar botar desechables que tardan 400 años en desaparecer.</p>
              </div>

              <div class="card-item" style="padding: 16px;">
                <div style="font-size: 20px; margin-bottom: 4px;">♻️</div>
                <h4 style="font-size: 15px; font-weight: 700; color: var(--mint-600);">Separar con Cariño</h4>
                <p style="font-size: 12.5px; color: #4b5563;">Limpiar las botellas antes de reciclarlas para que las familias recicladoras de base no se lastimen ni se ensucien.</p>
              </div>

              <div class="card-item" style="padding: 16px;">
                <div style="font-size: 20px; margin-bottom: 4px;">🐝</div>
                <h4 style="font-size: 15px; font-weight: 700; color: var(--mint-600);">Proteger lo Verde</h4>
                <p style="font-size: 12.5px; color: #4b5563;">Sembrar flores, cuidar a los animalitos de la calle y respetar a cada ser que comparte el ecosistema con nosotros.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- SLIDE 7: EN EL TRABAJO -->
      <section class="slide" data-title="7. Cuidado en el Trabajo">
        <div>
          <div class="pill-tag peach">💼 Espacios Saludables</div>
          <h2 class="title-h1">La Cultura del Cuidado en el Trabajo</h2>
          <p class="sub-text">Pasamos la mayor parte del día trabajando: cuidémonos unos a otros en el entorno laboral.</p>
        </div>

        <div class="grid-cards cols-4" style="margin-top: 10px;">
          <div class="card-item">
            <div class="card-icon-badge">🪑</div>
            <h3 class="card-title">Ergonomía y Postura</h3>
            <p class="card-p">Cuidar la espalda, hacer pausas activas cada dos horas, estirar los brazos y no forzar la vista ante las pantallas.</p>
            <div class="card-highlight">Prevención es amor propio</div>
          </div>

          <div class="card-item">
            <div class="card-icon-badge lavender">🌈</div>
            <h3 class="card-title">Clima de Respeto</h3>
            <p class="card-p">Trabajar en un lugar donde no haya chismes, descalificaciones ni gritos. El respeto hace que el trabajo sea ligero y feliz.</p>
            <div class="card-highlight" style="color: var(--lavender-600);">Paz en la oficina</div>
          </div>

          <div class="card-item">
            <div class="card-icon-badge mint">🩺</div>
            <h3 class="card-title">Seguridad Colectiva</h3>
            <p class="card-p">Si ves un piso mojado o un cable suelto, avisa. Cuidar la seguridad de un compañero es cuidar a todo el equipo.</p>
            <div class="card-highlight" style="color: var(--mint-600);">Compromiso de todos</div>
          </div>

          <div class="card-item">
            <div class="card-icon-badge peach">☕</div>
            <h3 class="card-title">Compañerismo Real</h3>
            <p class="card-p">Preguntar al colega '¿cómo estás hoy?' antes de pedir un informe. La calidez humana rinde más que la presión.</p>
            <div class="card-highlight" style="color: var(--peach-400);">Liderazgo con corazón</div>
          </div>
        </div>
      </section>

      <!-- SLIDE 8: BARRERAS -->
      <section class="slide" data-title="8. ¿Qué Obstaculiza el Cuidado?">
        <div>
          <div class="pill-tag">⚠️ Diagnóstico Sincero</div>
          <h2 class="title-h1">Los Enemigos de la Cultura del Cuidado</h2>
          <p class="sub-text">Para sanar nuestras relaciones, primero debemos reconocer qué actitudes nos están alejando:</p>
        </div>

        <div class="grid-cards cols-4" style="margin-top: 10px;">
          <div class="card-item" style="border-top: 4px solid var(--rose-500);">
            <div style="font-size: 28px; margin-bottom: 8px;">🧊</div>
            <h3 class="card-title" style="color: var(--rose-700);">El Individualismo</h3>
            <p class="card-p">La idea egoísta de 'a mí no me importa lo que le pase a los demás mientras yo esté bien'. El aislamiento nos empobrece.</p>
          </div>

          <div class="card-item" style="border-top: 4px solid var(--peach-400);">
            <div style="font-size: 28px; margin-bottom: 8px;">⏳</div>
            <h3 class="card-title" style="color: var(--peach-400);">La Prisa Constante</h3>
            <p class="card-p">Correr todo el día sin detenerse a respirar. Quien vive con afán no tiene tiempo para mirar a los ojos ni ser amable.</p>
          </div>

          <div class="card-item" style="border-top: 4px solid var(--lavender-400);">
            <div style="font-size: 28px; margin-bottom: 8px;">🙈</div>
            <h3 class="card-title" style="color: var(--lavender-600);">El Desentendimiento</h3>
            <p class="card-p">Pensar 'eso no me toca a mí, para eso le pagan a otros'. Justificar dejar el desorden porque alguien más lo limpiará.</p>
          </div>

          <div class="card-item" style="border-top: 4px solid var(--rose-400);">
            <div style="font-size: 28px; margin-bottom: 8px;">🥀</div>
            <h3 class="card-title" style="color: var(--rose-700);">La Indiferencia</h3>
            <p class="card-p">Ver a alguien sufriendo o sobrecargado y pasar de largo como si nada. La indiferencia es lo opuesto al amor.</p>
          </div>
        </div>
      </section>

      <!-- SLIDE 9: ESTRATEGIAS COTIDIANAS -->
      <section class="slide" data-title="9. Estrategias Cotidianas">
        <div>
          <div class="pill-tag lavender">✨ Prácticas Sencillas</div>
          <h2 class="title-h1">¿Cómo Practicar el Cuidado Todos los Días?</h2>
          <p class="sub-text">No necesitamos grandes discursos; el cuidado se demuestra en los pequeños detalles:</p>
        </div>

        <div class="grid-cards cols-3" style="margin-top: 10px;">
          <div class="card-item">
            <div class="pill-tag">En Casa y Personal</div>
            <p class="card-p" style="margin-top: 10px; font-size: 14px;">
              🌸 <strong>Tomarse 5 minutos:</strong> Respirar hondo y agradecer por el día.<br><br>
              🍵 <strong>Comer con calma:</strong> Sin pantallas ni noticias estresantes.<br><br>
              🛌 <strong>Dormir bien:</strong> Dejar el celular fuera de la cama por la noche.<br><br>
              💬 <strong>Tratarte con cariño:</strong> Hablarte a ti misma con ternura.
            </p>
          </div>

          <div class="card-item">
            <div class="pill-tag lavender">Con los Demás</div>
            <p class="card-p" style="margin-top: 10px; font-size: 14px;">
              👋 <strong>Saludar con alegría:</strong> Mirar a los ojos y sonreír.<br><br>
              🤝 <strong>Dar las gracias:</strong> Al chofer del bus, a la cajera, a quien limpia.<br><br>
              ☕ <strong>Compartir un cafecito:</strong> Preguntar de corazón '¿cómo estás?'.<br><br>
              🕊️ <strong>Pedir perdón:</strong> Tener la humildad de sanar los disgustos.
            </p>
          </div>

          <div class="card-item">
            <div class="pill-tag mint">En el Entorno</div>
            <p class="card-p" style="margin-top: 10px; font-size: 14px;">
              🌱 <strong>Cuidar una plantita:</strong> Regarla y verla florecer da alegría.<br><br>
              🚮 <strong>No botar basura:</strong> Guardar el papelito en el bolsillo si no hay caneca.<br><br>
              🚰 <strong>Ahorrar el agua:</strong> Recordar que es un tesoro para nuestros hijos.<br><br>
              ☀️ <strong>Cuidar la energía:</strong> Apagar las luces que no se estén usando.
            </p>
          </div>
        </div>
      </section>

      <!-- SLIDE 10: EL DECÁLOGO -->
      <section class="slide" data-title="10. El Decálogo del Cuidado">
        <div>
          <div class="pill-tag">📜 Mandamientos del Amor</div>
          <h2 class="title-h1">Decálogo de la Cultura del Cuidado</h2>
          <p class="sub-text">Diez compromisos para llevar en el corazón y practicar en la vida cotidiana:</p>
        </div>

        <div class="decalogo-grid" style="margin-top: 10px;">
          <div class="dec-item">
            <div class="dec-num">1</div>
            <div><strong>La vida es sagrada:</strong> Proteger y honrar la vida de todo ser humano, animal y planta.</div>
          </div>
          <div class="dec-item">
            <div class="dec-num">6</div>
            <div><strong>Corresponsabilidad activa:</strong> Lo que yo hago o dejo de hacer nos afecta a todos.</div>
          </div>
          <div class="dec-item">
            <div class="dec-num">2</div>
            <div><strong>Cuidarme es cuidarte:</strong> Si yo estoy bien y en paz, puedo dar lo mejor de mí a los míos.</div>
          </div>
          <div class="dec-item">
            <div class="dec-num">7</div>
            <div><strong>Gratitud sincera:</strong> Valorar siempre el esfuerzo invisible de quienes cuidan y limpian.</div>
          </div>
          <div class="dec-item">
            <div class="dec-num">3</div>
            <div><strong>La palabra construye:</strong> Usar palabras que alienten, unan y transmitan serenidad.</div>
          </div>
          <div class="dec-item">
            <div class="dec-num">8</div>
            <div><strong>Respetar la Madre Tierra:</strong> Consumir lo necesario y no malgastar los recursos del planeta.</div>
          </div>
          <div class="dec-item">
            <div class="dec-num">4</div>
            <div><strong>Escuchar con el alma:</strong> Regalar tiempo sincero para escuchar las penas y alegrías del prójimo.</div>
          </div>
          <div class="dec-item">
            <div class="dec-num">9</div>
            <div><strong>Paz y reconciliación:</strong> Sanar las diferencias hablando con dulzura y sin rencores.</div>
          </div>
          <div class="dec-item">
            <div class="dec-num">5</div>
            <div><strong>Todos somos frágiles:</strong> Aceptar con ternura que en algún momento todos necesitamos ayuda.</div>
          </div>
          <div class="dec-item">
            <div class="dec-num">10</div>
            <div><strong>El amor trasciende:</strong> Dejar un rastro de bondad, respeto y caricias por donde pasemos.</div>
          </div>
        </div>
      </section>

      <!-- SLIDE 11: REFLEXIÓN FINAL -->
      <section class="slide" data-title="11. Reflexión Final">
        <div style="flex:1; display:flex; flex-direction:column; justify-content:center; align-items:center; text-align:center; padding: 20px 60px;">
          <div class="pill-tag lavender" style="margin-bottom: 20px;">🌸 Mensaje para el Alma</div>
          
          <h2 style="font-family: 'Quicksand', sans-serif; font-size: 38px; color: var(--rose-700); margin-bottom: 24px; font-weight: 700;">
            El Cuidado como Fuerza que Sostiene el Mundo
          </h2>

          <div style="background:#ffffff; border-radius: 24px; padding: 36px 48px; border: 2px solid var(--rose-100); box-shadow: var(--shadow-hover); max-width: 900px; position:relative;">
            <div style="font-size: 54px; position:absolute; top:-24px; left:30px;">“</div>
            <p style="font-size: 21px; line-height: 1.6; color: #374151; font-weight: 600;">
              El cuidado no es un detalle secundario ni una tarea opcional: es la fuerza tierna y silenciosa que evita que la sociedad se desmorone. Cuidar de nosotras mismas, abrazar la fragilidad de quienes amamos y sanar nuestro lazo con la naturaleza es el regalo más hermoso que podemos ofrecerle a la vida.
            </p>
            <div style="font-size: 54px; position:absolute; bottom:-40px; right:30px;">”</div>
          </div>

          <div style="margin-top: 32px; font-size: 22px; font-weight: 800; color: var(--rose-600); font-family: 'Quicksand', sans-serif;">
            Bertha Inés Medina Hernández
          </div>
          <div style="font-size: 14px; color: var(--text-muted); font-weight: 600;">
            Cátedra de Ética, Salud y Humanidades • 2026
          </div>
        </div>
      </section>

      <!-- SLIDE 12: CIERRE Y PREGUNTAS -->
      <section class="slide" data-title="12. Cierre y Agradecimientos">
        <div style="flex:1; display:flex; flex-direction:column; justify-content:center; align-items:center; text-align:center;">
          <div style="font-size: 64px; margin-bottom: 12px; animation: heartbeat 1.6s infinite;">💐</div>
          <h2 style="font-family: 'Quicksand', sans-serif; font-size: 52px; font-weight: 800; color: var(--rose-600); margin-bottom: 14px;">
            ¡Muchas Gracias!
          </h2>

          <p style="font-size: 20px; color: #4b5563; max-width: 680px; line-height: 1.6; margin-bottom: 28px; font-style: italic;">
            «Quien cuida con amor deja una semilla de esperanza en cada corazón que toca»
          </p>

          <div style="background: #ffffff; padding: 16px 36px; border-radius: 9999px; border: 2px solid var(--rose-200); box-shadow: var(--shadow-soft);">
            <span style="font-size: 18px; font-weight: 800; color: var(--rose-700);">
              Bertha Inés Medina Hernández
            </span>
          </div>

          <p style="font-size: 15px; color: var(--text-muted); margin-top: 24px; font-weight: 700;">
            🌷 Espacio abierto para compartir reflexiones, preguntas y vivencias colectivas.
          </p>
        </div>
      </section>

    </main>

    <!-- Bottom Controls & Navigation -->
    <footer class="bottom-bar">
      <button class="nav-btn secondary" id="prevBtn">
        ‹ Anterior
      </button>

      <div style="display:flex; align-items:center; gap: 14px; flex: 1; justify-content:center;">
        <span class="counter-badge" id="slideNumber">1 / 12</span>
        <div class="progress-track">
          <div class="progress-fill" id="progressBar"></div>
        </div>
      </div>

      <div class="nav-controls">
        <button class="nav-btn" id="nextBtn">
          Siguiente ›
        </button>
      </div>
    </footer>

  </div>

  <script>
    const slides = document.querySelectorAll('.slide');
    const prevBtn = document.getElementById('prevBtn');
    const nextBtn = document.getElementById('nextBtn');
    const slideNumber = document.getElementById('slideNumber');
    const progressBar = document.getElementById('progressBar');
    const drawerList = document.getElementById('drawerList');
    const sideDrawer = document.getElementById('sideDrawer');
    const toggleDrawerBtn = document.getElementById('toggleDrawerBtn');
    const closeDrawer = document.getElementById('closeDrawer');
    const btnFullscreen = document.getElementById('btnFullscreen');
    const container = document.getElementById('pres-container');

    let currentSlide = 0;

    // Populate drawer menu
    slides.forEach((slide, index) => {{
      const title = slide.getAttribute('data-title') || `Diapositiva ${{index + 1}}`;
      const li = document.createElement('li');
      li.className = 'drawer-menu-item' + (index === 0 ? ' active' : '');
      li.innerHTML = `<span>${{index + 1}}.</span> ${{title.replace(/^\d+\.\s*/, '')}}`;
      li.addEventListener('click', () => {{
        goToSlide(index);
        document.getElementById('side-drawer').classList.remove('open');
      }});
      drawerList.appendChild(li);
    }});

    function updateSlide() {{
      slides.forEach((s, idx) => {{
        s.classList.toggle('active', idx === currentSlide);
      }});

      // Update drawer active item
      const drawerItems = document.querySelectorAll('.drawer-menu-item');
      drawerItems.forEach((item, idx) => {{
        item.classList.toggle('active', idx === currentSlide);
      }});

      // Update counters & progress
      slideNumber.textContent = `${{currentSlide + 1}} / ${{slides.length}}`;
      const progressPercent = ((currentSlide + 1) / slides.length) * 100;
      progressBar.style.width = `${{progressPercent}}%`;

      // Disable/Enable buttons
      prevBtn.style.opacity = currentSlide === 0 ? '0.5' : '1';
      prevBtn.style.pointerEvents = currentSlide === 0 ? 'none' : 'auto';

      if (currentSlide === slides.length - 1) {{
        nextBtn.innerHTML = 'Reiniciar ↻';
      }} else {{
        nextBtn.innerHTML = 'Siguiente ›';
      }}
    }}

    function goToSlide(index) {{
      if (index < 0) index = 0;
      if (index >= slides.length) index = 0;
      currentSlide = index;
      updateSlide();
    }}

    prevBtn.addEventListener('click', () => goToSlide(currentSlide - 1));
    nextBtn.addEventListener('click', () => goToSlide(currentSlide + 1));

    // Keyboard navigation
    document.addEventListener('keydown', (e) => {{
      if (e.key === 'ArrowRight' || e.key === ' ' || e.key === 'PageDown') {{
        goToSlide(currentSlide + 1);
      }} else if (e.key === 'ArrowLeft' || e.key === 'PageUp') {{
        goToSlide(currentSlide - 1);
      }} else if (e.key === 'Escape') {{
        document.getElementById('side-drawer').classList.remove('open');
      }}
    }});

    // Drawer toggling
    toggleDrawerBtn.addEventListener('click', () => {{
      document.getElementById('side-drawer').classList.toggle('open');
    }});
    closeDrawer.addEventListener('click', () => {{
      document.getElementById('side-drawer').classList.remove('open');
    }});

    // Fullscreen toggle
    btnFullscreen.addEventListener('click', () => {{
      if (!document.fullscreenElement) {{
        container.requestFullscreen().catch(err => alert(`Error al iniciar pantalla completa: ${{err.message}}`));
      }} else {{
        document.exitFullscreen();
      }}
    }});

    updateSlide();
  </script>

</body>
</html>
"""

# Destinos
path_desk = r"C:\Users\lenovo\Desktop\trabajos andres\Presentacion_Cultura_del_Cuidado.html"
path_down = r"C:\Users\lenovo\Downloads\Presentacion_Cultura_del_Cuidado.html"

with open(path_desk, "w", encoding="utf-8") as f:
    f.write(html_template)

with open(path_down, "w", encoding="utf-8") as f:
    f.write(html_template)

print("Presentación HTML5 generada exitosamente con imágenes en base64.")
