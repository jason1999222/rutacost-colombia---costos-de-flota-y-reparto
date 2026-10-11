# -*- coding: utf-8 -*-
r"""
Generador de la Presentación Web Interactiva Innovadora:
'LA CULTURA DEL CUIDADO' - Expositora: Angie Gómez
VERSIÓN NOCTURNA PROFESIONAL E INTERACTIVA:
- Estética Editorial para Adultos con Colores Claros (Rosado pastel, Blanco puro, Violeta suave, Azul cielo).
- Subpáginas / Modales Interactivos para interactuar en vivo con el público.
- 2 Dinámicas Vivenciales en vivo integradas con temporizador interactivo en pantalla:
  1. «La Batería del Autocuidado» (Activación física suave, respiración y chequeo en parejas).
  2. «El Telar del Cuidado y la Gratitud» (Dinámica colectiva de reconocimiento y compromiso mutuo).
- Preguntas desplegables para mantener al público despierto y participativo.
- Controles de presentación: Pantalla completa, miniaturas, barra de progreso y teclado.
"""

import os
import base64

IMG_DIR = r"C:\Users\lenovo\.gemini\antigravity-ide\brain\1028804d-2a48-4bc7-9c53-7b9c7a021007"

def get_b64(filename):
    path = os.path.join(IMG_DIR, filename)
    with open(path, "rb") as f:
        return "data:image/jpeg;base64," + base64.b64encode(f.read()).decode("utf-8")

b64_hero     = get_b64("hero_cuidado_adulto_1790565707489.jpg")
b64_triang   = get_b64("triangulo_cuidado_adulto_1790565821228.jpg")
b64_auto     = get_b64("autocuidado_adulto_1790565724497.jpg")
b64_otro     = get_b64("cuidado_otro_adulto_1790565743652.jpg")
b64_eco      = get_b64("ecocuidado_adulto_1790565769319.jpg")
b64_trabajo  = get_b64("trabajo_adulto_cuidado_1790565794882.jpg")
b64_arbol    = get_b64("arbol_cuidado_cartoon_1790565331811.jpg")

html_content = f"""<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>La Cultura del Cuidado - Angie Gómez</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&family=Playfair+Display:ital,wght@0,600;0,700;1,500;1,600&display=swap" rel="stylesheet">
  <style>
    :root {{
      --pastel-pink-bg: #fff5f7;
      --pastel-pink-card: #ffe8ef;
      --pastel-pink-border: #fbcfe8;
      --pink-accent: #e11d48;
      --pink-text: #be123c;
      
      --pastel-violet-bg: #f8f7ff;
      --pastel-violet-card: #f1edff;
      --pastel-violet-border: #e0d7fe;
      --violet-accent: #7c3aed;
      --violet-text: #6d28d9;

      --pastel-blue-bg: #f0f9ff;
      --pastel-blue-card: #e0f2fe;
      --pastel-blue-border: #bae6fd;
      --blue-accent: #0284c7;
      --blue-text: #0369a1;

      --pastel-sage-bg: #f4fbf7;
      --pastel-sage-card: #e8f7ee;
      --pastel-sage-border: #c6ebd2;
      --sage-text: #15803d;

      --white: #ffffff;
      --text-dark: #1e293b;
      --text-body: #475569;
      --text-muted: #64748b;
      
      --shadow-sm: 0 4px 14px rgba(109, 40, 217, 0.05);
      --shadow-card: 0 10px 24px -6px rgba(15, 23, 42, 0.06), 0 4px 8px -4px rgba(15, 23, 42, 0.03);
      --shadow-hover: 0 20px 32px -10px rgba(225, 29, 72, 0.12), 0 8px 16px -6px rgba(109, 40, 217, 0.08);
      --radius-card: 20px;
    }}

    * {{
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }}

    body {{
      font-family: 'Plus Jakarta Sans', sans-serif;
      background: linear-gradient(135deg, #fce7f3 0%, #ede9fe 50%, #e0f2fe 100%);
      color: var(--text-dark);
      min-height: 100vh;
      display: flex;
      justify-content: center;
      align-items: center;
      padding: 14px;
      overflow: hidden;
    }}

    /* Contenedor Panorámico 16:9 */
    #deck-wrapper {{
      width: 100%;
      max-width: 1380px;
      height: 94vh;
      max-height: 800px;
      aspect-ratio: 16 / 9;
      background: #ffffff;
      border-radius: 26px;
      box-shadow: 0 30px 70px -15px rgba(30, 41, 59, 0.18), 0 0 0 1px rgba(255, 255, 255, 0.8) inset;
      position: relative;
      display: flex;
      flex-direction: column;
      overflow: hidden;
      border: 3px solid #ffffff;
    }}

    /* Barra Superior */
    header.deck-header {{
      height: 62px;
      background: rgba(255, 255, 255, 0.94);
      backdrop-filter: blur(16px);
      border-bottom: 1.5px solid #f1f5f9;
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0 32px;
      z-index: 20;
    }}

    .brand-group {{
      display: flex;
      align-items: center;
      gap: 12px;
      font-size: 15px;
      font-weight: 800;
      letter-spacing: -0.2px;
      color: var(--pink-text);
    }}
    .brand-icon {{
      font-size: 19px;
      display: inline-block;
      animation: soft-pulse 2.2s infinite ease-in-out;
    }}
    @keyframes soft-pulse {{
      0%, 100% {{ transform: scale(1); }}
      50% {{ transform: scale(1.12); }}
    }}

    .presenter-badge {{
      background: linear-gradient(135deg, var(--pastel-pink-card), var(--pastel-violet-card));
      padding: 6px 20px;
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
      border: 1.5px solid #e2e8f0;
      color: var(--text-dark);
      padding: 7px 15px;
      border-radius: 12px;
      font-size: 12.5px;
      font-weight: 700;
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: 7px;
      transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
    }}
    .tool-btn:hover {{
      background: var(--pastel-pink-bg);
      border-color: var(--pastel-pink-border);
      color: var(--pink-text);
      transform: translateY(-1px);
    }}

    /* Escenario de Diapositivas */
    #deck-stage {{
      flex: 1;
      position: relative;
      overflow: hidden;
      padding: 24px 44px;
      background: radial-gradient(circle at 12% 18%, rgba(253, 232, 238, 0.4) 0%, transparent 40%),
                  radial-gradient(circle at 88% 82%, rgba(237, 233, 254, 0.45) 0%, transparent 40%),
                  radial-gradient(circle at 50% 50%, rgba(240, 249, 255, 0.35) 0%, transparent 55%),
                  #ffffff;
    }}

    .slide {{
      position: absolute;
      top: 22px;
      left: 44px;
      right: 44px;
      bottom: 22px;
      display: none;
      flex-direction: column;
      opacity: 0;
      transform: scale(0.98) translateY(12px);
      transition: opacity 0.38s ease, transform 0.38s cubic-bezier(0.16, 1, 0.3, 1);
    }}

    .slide.active {{
      display: flex;
      opacity: 1;
      transform: scale(1) translateY(0);
    }}

    /* Botón Especial de Interacción en Vivo */
    .interactive-trigger-btn {{
      display: inline-flex;
      align-items: center;
      gap: 8px;
      background: linear-gradient(135deg, #f43f5e, #8b5cf6);
      color: #ffffff;
      padding: 7px 18px;
      border-radius: 9999px;
      font-size: 12.5px;
      font-weight: 800;
      cursor: pointer;
      border: none;
      box-shadow: 0 4px 14px rgba(225, 29, 72, 0.28);
      transition: all 0.22s cubic-bezier(0.16, 1, 0.3, 1);
      width: fit-content;
      margin-top: 10px;
    }}
    .interactive-trigger-btn:hover {{
      transform: translateY(-2px) scale(1.03);
      box-shadow: 0 8px 22px rgba(225, 29, 72, 0.4);
    }}
    .interactive-trigger-btn.pulse-anim {{
      animation: button-glow 2s infinite ease-in-out;
    }}
    @keyframes button-glow {{
      0%, 100% {{ box-shadow: 0 4px 14px rgba(225, 29, 72, 0.28); }}
      50% {{ box-shadow: 0 6px 22px rgba(139, 92, 246, 0.55); }}
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
      letter-spacing: 0.6px;
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
    .pill-label.sage {{
      background: linear-gradient(135deg, var(--pastel-sage-card), #ffffff);
      color: var(--sage-text);
      border-color: var(--pastel-sage-border);
    }}

    .slide-heading {{
      font-size: 32px;
      font-weight: 800;
      color: var(--text-dark);
      letter-spacing: -0.6px;
      line-height: 1.22;
      margin-bottom: 4px;
    }}
    .slide-heading span.highlight-pink {{ color: var(--pink-text); }}
    .slide-heading span.highlight-violet {{ color: var(--violet-text); }}
    .slide-heading span.highlight-blue {{ color: var(--blue-text); }}

    .slide-tagline {{
      font-size: 15px;
      color: var(--text-muted);
      margin-bottom: 16px;
      font-weight: 500;
    }}

    /* Diseños Split */
    .layout-split {{
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 34px;
      align-items: center;
      flex: 1;
      height: 100%;
    }}
    .layout-split.img-left {{ grid-template-columns: 0.95fr 1.05fr; }}
    .layout-split.img-right {{ grid-template-columns: 1.05fr 0.95fr; }}

    .editorial-img-box {{
      width: 100%;
      height: 100%;
      max-height: 440px;
      border-radius: 22px;
      overflow: hidden;
      background: #ffffff;
      padding: 8px;
      border: 3px solid #ffffff;
      box-shadow: 0 18px 40px -12px rgba(30, 41, 59, 0.12);
      position: relative;
    }}
    .editorial-img-box img {{
      width: 100%;
      height: 100%;
      object-fit: cover;
      border-radius: 16px;
      display: block;
      transition: transform 0.5s ease;
    }}
    .editorial-img-box:hover img {{
      transform: scale(1.025);
    }}

    /* Tarjetas Interactivas con Poca Letra */
    .grid-interactive {{
      display: grid;
      gap: 13px;
    }}
    .grid-interactive.cols-2 {{ grid-template-columns: 1fr 1fr; }}
    .grid-interactive.cols-3 {{ grid-template-columns: repeat(3, 1fr); }}
    .grid-interactive.cols-4 {{ grid-template-columns: repeat(4, 1fr); }}

    .quick-card {{
      background: #ffffff;
      border-radius: var(--radius-card);
      padding: 16px 20px;
      border: 1.5px solid var(--pastel-pink-border);
      box-shadow: var(--shadow-sm);
      display: flex;
      flex-direction: column;
      gap: 7px;
      transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
      cursor: pointer;
    }}
    .quick-card.violet {{ border-color: var(--pastel-violet-border); }}
    .quick-card.blue {{ border-color: var(--pastel-blue-border); }}
    .quick-card.sage {{ border-color: var(--pastel-sage-border); }}

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
    .quick-card.sage:hover {{
      border-color: var(--sage-text);
      background: linear-gradient(180deg, #ffffff 0%, var(--pastel-sage-bg) 100%);
    }}

    .card-badge-row {{
      display: flex;
      align-items: center;
      justify-content: space-between;
    }}
    .card-icon-circle {{
      width: 38px;
      height: 38px;
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 19px;
      background: var(--pastel-pink-bg);
      border: 1px solid var(--pastel-pink-border);
    }}
    .quick-card.violet .card-icon-circle {{
      background: var(--pastel-violet-bg);
      border-color: var(--pastel-violet-border);
    }}
    .quick-card.blue .card-icon-circle {{
      background: var(--pastel-blue-bg);
      border-color: var(--pastel-blue-border);
    }}
    .quick-card.sage .card-icon-circle {{
      background: var(--pastel-sage-bg);
      border-color: var(--pastel-sage-border);
    }}

    .card-num {{
      font-size: 11px;
      font-weight: 800;
      color: var(--text-muted);
      letter-spacing: 0.5px;
    }}

    .card-title {{
      font-size: 15.5px;
      font-weight: 800;
      color: var(--text-dark);
      letter-spacing: -0.2px;
      margin-top: 2px;
    }}

    .card-body {{
      font-size: 13px;
      color: var(--text-body);
      line-height: 1.45;
    }}

    .quote-editorial {{
      font-family: 'Playfair Display', serif;
      font-style: italic;
      font-size: 16.5px;
      color: #334155;
      line-height: 1.45;
      padding: 12px 18px;
      border-left: 3px solid var(--pink-accent);
      background: linear-gradient(90deg, var(--pastel-pink-bg) 0%, rgba(255,255,255,0) 100%);
      border-radius: 0 14px 14px 0;
      margin-top: 12px;
    }}

    /* Barra Inferior de Control */
    footer.deck-footer {{
      height: 66px;
      background: rgba(255, 255, 255, 0.95);
      backdrop-filter: blur(14px);
      border-top: 1.5px solid #f1f5f9;
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0 32px;
      z-index: 20;
    }}

    .footer-left {{
      display: flex;
      align-items: center;
      gap: 16px;
    }}

    .slide-step-counter {{
      font-size: 14px;
      font-weight: 800;
      color: var(--text-dark);
      background: #f8fafc;
      padding: 5px 16px;
      border-radius: 9999px;
      border: 1px solid #e2e8f0;
    }}

    .progress-bar-container {{
      flex: 1;
      max-width: 440px;
      height: 6px;
      background: #f1f5f9;
      border-radius: 9999px;
      overflow: hidden;
      margin: 0 24px;
    }}
    .progress-fill-line {{
      height: 100%;
      width: 10%;
      background: linear-gradient(90deg, #f43f5e 0%, #8b5cf6 50%, #38bdf8 100%);
      border-radius: 9999px;
      transition: width 0.35s ease;
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
      padding: 9px 22px;
      border-radius: 14px;
      font-size: 13.5px;
      font-weight: 800;
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: 8px;
      box-shadow: 0 8px 18px -4px rgba(225, 29, 72, 0.35);
      transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
    }}
    .action-nav-btn:hover {{
      transform: translateY(-2px);
      box-shadow: 0 12px 22px -4px rgba(225, 29, 72, 0.45);
    }}
    .action-nav-btn.secondary {{
      background: #ffffff;
      color: var(--text-dark);
      border: 1.5px solid #e2e8f0;
      box-shadow: none;
    }}
    .action-nav-btn.secondary:hover {{
      background: #f8fafc;
      border-color: #cbd5e1;
      transform: translateY(-1px);
    }}

    /* Bandeja de Miniaturas */
    #thumb-tray {{
      position: absolute;
      bottom: 66px;
      left: 0;
      right: 0;
      background: rgba(255, 255, 255, 0.98);
      backdrop-filter: blur(20px);
      border-top: 2px solid #e2e8f0;
      padding: 14px 28px;
      display: none;
      gap: 12px;
      overflow-x: auto;
      z-index: 30;
      box-shadow: 0 -10px 25px rgba(0,0,0,0.06);
    }}
    #thumb-tray.open {{
      display: flex;
    }}
    .thumb-item {{
      flex: 0 0 125px;
      height: 74px;
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
      transform: scale(1.04);
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
      max-width: 105px;
      margin-top: 2px;
    }}

    /* ============================================================== */
    /* SUBPÁGINAS Y MODALES INTERACTIVOS PARA LA AUDIENCIA NOCTURNA */
    /* ============================================================== */
    .modal-overlay {{
      position: fixed;
      top: 0;
      left: 0;
      width: 100vw;
      height: 100vh;
      background: rgba(15, 23, 42, 0.55);
      backdrop-filter: blur(8px);
      display: none;
      justify-content: center;
      align-items: center;
      z-index: 999;
      opacity: 0;
      transition: opacity 0.3s ease;
    }}
    .modal-overlay.open {{
      display: flex;
      opacity: 1;
    }}

    .modal-sheet {{
      background: #ffffff;
      width: 90%;
      max-width: 680px;
      border-radius: 28px;
      border: 3px solid #ffffff;
      box-shadow: 0 25px 60px -10px rgba(109, 40, 217, 0.35);
      padding: 32px 36px;
      position: relative;
      transform: scale(0.95) translateY(20px);
      transition: transform 0.35s cubic-bezier(0.16, 1, 0.3, 1);
    }}
    .modal-overlay.open .modal-sheet {{
      transform: scale(1) translateY(0);
    }}

    .modal-close-btn {{
      position: absolute;
      top: 20px;
      right: 22px;
      background: #f1f5f9;
      border: none;
      width: 36px;
      height: 36px;
      border-radius: 50%;
      font-size: 16px;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #64748b;
      transition: all 0.2s;
    }}
    .modal-close-btn:hover {{
      background: #e11d48;
      color: #ffffff;
      transform: rotate(90deg);
    }}

    .modal-tag {{
      display: inline-flex;
      align-items: center;
      gap: 6px;
      background: linear-gradient(135deg, var(--pastel-pink-card), var(--pastel-violet-card));
      padding: 4px 14px;
      border-radius: 9999px;
      font-size: 11.5px;
      font-weight: 800;
      color: var(--violet-text);
      border: 1px solid var(--pastel-violet-border);
      text-transform: uppercase;
      margin-bottom: 8px;
    }}

    .modal-title {{
      font-size: 24px;
      font-weight: 800;
      color: var(--text-dark);
      margin-bottom: 8px;
      letter-spacing: -0.3px;
    }}

    .modal-desc {{
      font-size: 14.5px;
      color: var(--text-body);
      line-height: 1.5;
      margin-bottom: 20px;
    }}

    /* Botones de Opciones Interactivas en Modal */
    .interactive-options-grid {{
      display: grid;
      gap: 10px;
      margin-bottom: 18px;
    }}

    .opt-interactive-card {{
      background: var(--pastel-pink-bg);
      border: 1.5px solid var(--pastel-pink-border);
      border-radius: 16px;
      padding: 14px 18px;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: space-between;
      transition: all 0.2s;
    }}
    .opt-interactive-card:hover {{
      background: #ffffff;
      border-color: var(--pink-accent);
      transform: translateX(4px);
      box-shadow: var(--shadow-sm);
    }}
    .opt-interactive-card.selected {{
      background: linear-gradient(135deg, var(--pastel-pink-card), var(--pastel-violet-card));
      border-color: var(--violet-accent);
    }}
    .opt-title {{
      font-size: 14.5px;
      font-weight: 700;
      color: var(--text-dark);
    }}
    .opt-badge {{
      font-size: 12px;
      font-weight: 800;
      color: var(--pink-text);
      background: #ffffff;
      padding: 3px 10px;
      border-radius: 9999px;
      border: 1px solid var(--pastel-pink-border);
    }}

    .modal-feedback-box {{
      background: #ffffff;
      border-radius: 16px;
      padding: 16px 20px;
      border: 2px dashed var(--pastel-violet-border);
      font-size: 14px;
      color: var(--violet-text);
      font-weight: 600;
      line-height: 1.5;
      display: none;
    }}

    /* Estilos del Temporizador de Dinámicas */
    .timer-display-box {{
      display: flex;
      flex-direction: column;
      align-items: center;
      background: linear-gradient(135deg, var(--pastel-violet-bg), #ffffff);
      border: 2px solid var(--pastel-violet-border);
      border-radius: 20px;
      padding: 18px;
      margin: 16px 0;
    }}
    .timer-digits {{
      font-size: 42px;
      font-weight: 800;
      color: var(--violet-text);
      letter-spacing: 2px;
      font-variant-numeric: tabular-nums;
    }}
    .timer-controls-row {{
      display: flex;
      gap: 12px;
      margin-top: 10px;
    }}
    .btn-timer {{
      background: linear-gradient(135deg, var(--violet-accent), #4f46e5);
      color: #ffffff;
      border: none;
      padding: 7px 18px;
      border-radius: 12px;
      font-weight: 800;
      font-size: 13px;
      cursor: pointer;
      transition: all 0.2s;
    }}
    .btn-timer:hover {{
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(124, 58, 237, 0.3);
    }}
  </style>
</head>
<body>

  <div id="deck-wrapper">

    <!-- Top Header -->
    <header class="deck-header">
      <div class="brand-group">
        <span class="brand-icon">🌿</span>
        <span>CULTURA DEL CUIDADO</span>
      </div>

      <div class="presenter-badge">
        <span>🌷 Expositora:</span>
        <strong>Angie Gómez</strong>
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
            <div class="pill-label">🌸 Encuentro Nocturno de Reflexión</div>
            <h1 class="slide-heading" style="font-size: 44px; margin-bottom: 8px;">
              La Cultura del <span class="highlight-pink">Cuidado</span>
            </h1>
            <p class="slide-tagline" style="font-size: 17px;">
              Una ética tierna para la vida, el descanso consciente y la comunidad.
            </p>

            <div style="background: linear-gradient(135deg, #ffffff, var(--pastel-pink-bg)); border: 2px solid var(--pastel-pink-border); border-radius: 20px; padding: 18px 24px; box-shadow: var(--shadow-sm); max-width: 480px; margin-bottom: 16px;">
              <div style="font-size: 11px; font-weight: 800; color: var(--pink-text); text-transform: uppercase; letter-spacing: 1px;">
                CONFERENCIA & TALLER VIVENCIAL CON:
              </div>
              <div style="font-size: 26px; font-weight: 800; color: var(--text-dark); margin: 3px 0;">
                Angie Gómez
              </div>
              <div style="font-size: 13px; color: var(--text-muted); font-weight: 600;">
                Desarrollo Humano, Bienestar y Convivencia • Sesión Nocturna 2026
              </div>
            </div>

            <!-- 3 Pill Badges -->
            <div style="display: flex; gap: 8px; flex-wrap: wrap;">
              <span class="pill-label">💖 Amor Propio</span>
              <span class="pill-label violet">🤝 Vínculos que Sanan</span>
              <span class="pill-label blue">🌱 Casa Común</span>
            </div>

            <div class="quote-editorial">
              «Cuidar no es un accesorio: es la fuerza silenciosa que evita que nuestro mundo se desmorone»
            </div>
          </div>

          <div class="editorial-img-box">
            <img src="{b64_hero}" alt="Comunidad de adultos compartiendo en un ambiente cálido y sereno">
          </div>
        </div>
      </section>

      <!-- SLIDE 2: ¿QUÉ ES CUIDAR? (CON PREGUNTA INTERACTIVA) -->
      <section class="slide" data-name="2. ¿Qué es Cuidar?">
        <div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom: 12px;">
          <div>
            <div class="pill-label violet">🌱 Concepto y Fundamento</div>
            <h2 class="slide-heading">
              ¿Qué es realmente <span class="highlight-violet">Cuidar</span>?
            </h2>
            <p class="slide-tagline" style="margin-bottom:0;">
              Más que una tarea médica o doméstica, es el modo esencial de ser humano.
            </p>
          </div>

          <!-- Botón de Interacción -->
          <button class="interactive-trigger-btn pulse-anim" onclick="openModal('modal-q1')">
            💬 Pregunta al Auditorio
          </button>
        </div>

        <div class="grid-interactive cols-3" style="flex: 1; align-items: stretch;">
          <div class="quick-card">
            <div class="card-badge-row">
              <div class="card-icon-circle">💎</div>
              <span class="card-num">01 / CONDICIÓN VITAL</span>
            </div>
            <div class="card-title">Modo de Ser Humano</div>
            <div class="card-body">
              Nadie sobrevive solo. Desde nuestro primer respiro hasta la vejez, existimos porque alguien nos alimentó, abrigó y cuidó con paciencia.
            </div>
            <div style="margin-top:auto; font-size:11.5px; font-weight:700; color:var(--pink-text);">
              ✓ Ética de la existencia
            </div>
          </div>

          <div class="quick-card violet">
            <div class="card-badge-row">
              <div class="card-icon-circle">👁️</div>
              <span class="card-num">02 / CONEXIÓN</span>
            </div>
            <div class="card-title">Vencer la Indiferencia</div>
            <div class="card-body">
              Frenar el afán nocturno para mirar a los ojos al otro, reconocer su cansancio diario y recordarle que no camina en soledad.
            </div>
            <div style="margin-top:auto; font-size:11.5px; font-weight:700; color:var(--violet-text);">
              ✓ Presencia consciente
            </div>
          </div>

          <div class="quick-card blue">
            <div class="card-badge-row">
              <div class="card-icon-circle">🌐</div>
              <span class="card-num">03 / COMPROMISO</span>
            </div>
            <div class="card-title">Corresponsabilidad</div>
            <div class="card-body">
              El cuidado no puede recaer en una sola persona. Es un acuerdo vivo donde cada uno asume su parte con gratitud y alegría.
            </div>
            <div style="margin-top:auto; font-size:11.5px; font-weight:700; color:var(--blue-text);">
              ✓ Pacto de comunidad
            </div>
          </div>
        </div>

        <div class="quote-editorial" style="margin-top: 12px; padding: 10px 18px; font-size: 15px;">
          «Cuidar de las personas y los espacios es hacer que duren, florezcan y alcancen su plenitud» — Leonardo Boff
        </div>
      </section>

      <!-- SLIDE 3: TRES DIMENSIONES -->
      <section class="slide" data-name="3. Tres Dimensiones">
        <div class="layout-split img-left">
          <div class="editorial-img-box">
            <img src="{b64_triang}" alt="Diagrama de las Tres Dimensiones del Cuidado para adultos">
          </div>

          <div>
            <div class="pill-label blue">📐 Modelo de Equilibrio</div>
            <h2 class="slide-heading">
              Las Tres <span class="highlight-blue">Dimensiones</span> del Cuidado
            </h2>
            <p class="slide-tagline">
              Un triángulo armónico: si descuidamos un vértice, la estructura se quiebra.
            </p>

            <div class="grid-interactive" style="gap: 12px;">
              <div class="quick-card" style="padding: 12px 18px;">
                <div class="card-badge-row">
                  <span style="font-weight: 800; color: var(--pink-text); font-size: 14px;">1. Autocuidado (Conmigo)</span>
                  <span class="pill-label" style="margin:0; font-size:10px;">La Raíz</span>
                </div>
                <div class="card-body" style="font-size: 12.5px;">
                  Paz mental, descanso digno y salud integral. Cuidarse no es egoísmo, es el punto de partida indispensable.
                </div>
              </div>

              <div class="quick-card violet" style="padding: 12px 18px;">
                <div class="card-badge-row">
                  <span style="font-weight: 800; color: var(--violet-text); font-size: 14px;">2. Cuidado del Otro (Con la Comunidad)</span>
                  <span class="pill-label violet" style="margin:0; font-size:10px;">El Tronco</span>
                </div>
                <div class="card-body" style="font-size: 12.5px;">
                  Escucha profunda, calidez en los vínculos y apoyo solidario ante la vulnerabilidad cotidiana.
                </div>
              </div>

              <div class="quick-card blue" style="padding: 12px 18px;">
                <div class="card-badge-row">
                  <span style="font-weight: 800; color: var(--blue-text); font-size: 14px;">3. Ecocuidado (Con la Naturaleza)</span>
                  <span class="pill-label blue" style="margin:0; font-size:10px;">Las Ramas</span>
                </div>
                <div class="card-body" style="font-size: 12.5px;">
                  Consumo consciente y respeto sagrado por los recursos de nuestra única Casa Común.
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- SLIDE 4: AUTOCUIDADO (CON DINÁMICA 1 EN VIVO) -->
      <section class="slide" data-name="4. Autocuidado">
        <div class="layout-split img-right">
          <div>
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:6px;">
              <div class="pill-label">🌸 Dimensión I</div>
              <!-- Botón Dinámica 1 -->
              <button class="interactive-trigger-btn pulse-anim" onclick="openModal('modal-dinamica1')">
                ⚡ Dinámica En Vivo: La Batería
              </button>
            </div>

            <h2 class="slide-heading">
              El Arte del <span class="highlight-pink">Autocuidado</span>
            </h2>
            <p class="slide-tagline">
              «Nadie puede regalar agua fresca si su propio cántaro está vacío».
            </p>

            <div class="grid-interactive cols-2" style="gap: 12px;">
              <div class="quick-card">
                <div class="card-badge-row">
                  <span style="font-size: 20px;">☕</span>
                  <span class="card-num">HÁBITO 1</span>
                </div>
                <div class="card-title" style="font-size: 14px;">Descanso Reparador</div>
                <div class="card-body" style="font-size: 12px;">
                  Dormir con calidad y desconectar pantallas antes de acostarse.
                </div>
              </div>

              <div class="quick-card">
                <div class="card-badge-row">
                  <span style="font-size: 20px;">🛡️</span>
                  <span class="card-num">HÁBITO 2</span>
                </div>
                <div class="card-title" style="font-size: 14px;">Aprender a Decir «NO»</div>
                <div class="card-body" style="font-size: 12px;">
                  Poner límites firmes y amorosos a la sobreexigencia externa.
                </div>
              </div>

              <div class="quick-card">
                <div class="card-badge-row">
                  <span style="font-size: 20px;">📖</span>
                  <span class="card-num">HÁBITO 3</span>
                </div>
                <div class="card-title" style="font-size: 14px;">Salud Emocional</div>
                <div class="card-body" style="font-size: 12px;">
                  Espacios de silencio, lectura y aromática que devuelven la serenidad.
                </div>
              </div>

              <div class="quick-card">
                <div class="card-badge-row">
                  <span style="font-size: 20px;">🤍</span>
                  <span class="card-num">HÁBITO 4</span>
                </div>
                <div class="card-title" style="font-size: 14px;">Autocompasión</div>
                <div class="card-body" style="font-size: 12px;">
                  Perdonarnos los tropiezos diarios y hablarnos con amabilidad interior.
                </div>
              </div>
            </div>

            <div class="quote-editorial" style="margin-top: 14px; font-size: 14px;">
              «Cuidarme esta noche no es un premio: es mi primer acto de responsabilidad hacia mí y hacia los míos»
            </div>
          </div>

          <div class="editorial-img-box">
            <img src="{b64_auto}" alt="Mujer madura disfrutando del autocuidado consciente y sereno">
          </div>
        </div>
      </section>

      <!-- SLIDE 5: CUIDADO DEL OTRO (CON PREGUNTA INTERACTIVA) -->
      <section class="slide" data-name="5. Cuidado del Otro">
        <div class="layout-split img-left">
          <div class="editorial-img-box">
            <img src="{b64_otro}" alt="Mujeres adultas en diálogo empático y solidario">
          </div>

          <div>
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:6px;">
              <div class="pill-label violet">💜 Dimensión II</div>
              <!-- Botón Pregunta 2 -->
              <button class="interactive-trigger-btn" onclick="openModal('modal-q2')">
                💬 Palabras que Sanan
              </button>
            </div>

            <h2 class="slide-heading">
              Cuidado del <span class="highlight-violet">Otro</span>
            </h2>
            <p class="slide-tagline">
              La ética de los vínculos: compasión, ternura y validación emocional.
            </p>

            <div class="grid-interactive cols-2" style="gap: 12px;">
              <div class="quick-card violet">
                <div class="card-badge-row">
                  <span style="font-size: 20px;">👂</span>
                  <span class="card-num">VÍNCULO 1</span>
                </div>
                <div class="card-title" style="font-size: 14px;">Escucha Atenta</div>
                <div class="card-body" style="font-size: 12px;">
                  Escuchar con los ojos y el alma, sin mirar el celular mientras nos hablan.
                </div>
              </div>

              <div class="quick-card violet">
                <div class="card-badge-row">
                  <span style="font-size: 20px;">💬</span>
                  <span class="card-num">VÍNCULO 2</span>
                </div>
                <div class="card-title" style="font-size: 14px;">Palabras que Alientan</div>
                <div class="card-body" style="font-size: 12px;">
                  El lenguaje construye realidades: elegir expresiones que unan y acaricien.
                </div>
              </div>

              <div class="quick-card violet">
                <div class="card-badge-row">
                  <span style="font-size: 20px;">🤝</span>
                  <span class="card-num">VÍNCULO 3</span>
                </div>
                <div class="card-title" style="font-size: 14px;">Apoyo en la Fragilidad</div>
                <div class="card-body" style="font-size: 12px;">
                  Tender la mano cuando el otro tiene un día pesado, sin juzgarlo.
                </div>
              </div>

              <div class="quick-card violet">
                <div class="card-badge-row">
                  <span style="font-size: 20px;">✨</span>
                  <span class="card-num">VÍNCULO 4</span>
                </div>
                <div class="card-title" style="font-size: 14px;">Dignificar el Cuidado</div>
                <div class="card-body" style="font-size: 12px;">
                  Agradecer las labores silenciosas del hogar, la comida y la limpieza.
                </div>
              </div>
            </div>

            <div class="quote-editorial" style="border-left-color: var(--violet-accent); margin-top: 14px; font-size: 14px;">
              «La madurez humana se mide por nuestra capacidad de tejer relaciones basadas en el buen trato» — Carol Gilligan
            </div>
          </div>
        </div>
      </section>

      <!-- SLIDE 6: ECOCUIDADO -->
      <section class="slide" data-name="6. Ecocuidado">
        <div class="layout-split img-right">
          <div>
            <div class="pill-label blue">🌱 Dimensión III</div>
            <h2 class="slide-heading">
              El <span class="highlight-blue">Ecocuidado</span>
            </h2>
            <p class="slide-tagline">
              Nuestra Casa Común: la ecología comienza en nuestro metro cuadrado.
            </p>

            <div class="grid-interactive cols-2" style="gap: 12px;">
              <div class="quick-card blue">
                <div class="card-badge-row">
                  <span style="font-size: 20px;">🛍️</span>
                  <span class="card-num">ACCIÓN 1</span>
                </div>
                <div class="card-title" style="font-size: 14px;">Consumo Consciente</div>
                <div class="card-body" style="font-size: 12px;">
                  Preguntarnos si de verdad lo necesitamos antes de generar plástico innecesario.
                </div>
              </div>

              <div class="quick-card blue">
                <div class="card-badge-row">
                  <span style="font-size: 20px;">💧</span>
                  <span class="card-num">ACCIÓN 2</span>
                </div>
                <div class="card-title" style="font-size: 14px;">Cuidar el Agua</div>
                <div class="card-body" style="font-size: 12px;">
                  Proteger cada gota con gratitud; el agua limpia sostiene nuestra salud.
                </div>
              </div>

              <div class="quick-card blue">
                <div class="card-badge-row">
                  <span style="font-size: 20px;">🪴</span>
                  <span class="card-num">ACCIÓN 3</span>
                </div>
                <div class="card-title" style="font-size: 14px;">Espacios Limpios</div>
                <div class="card-body" style="font-size: 12px;">
                  Mantener andenes y salones impecables como muestra de respeto vecinal.
                </div>
              </div>

              <div class="quick-card blue">
                <div class="card-badge-row">
                  <span style="font-size: 20px;">🕊️</span>
                  <span class="card-num">ACCIÓN 4</span>
                </div>
                <div class="card-title" style="font-size: 14px;">Herencia de Amor</div>
                <div class="card-body" style="font-size: 12px;">
                  Dejar un entorno fértil, arbolado y sano para nuestras familias.
                </div>
              </div>
            </div>

            <div class="quote-editorial" style="border-left-color: var(--blue-accent); margin-top: 14px; font-size: 14px;">
              «La Tierra no es una despensa inagotable: es un ser vivo que requiere nuestra caricia y respeto»
            </div>
          </div>

          <div class="editorial-img-box">
            <img src="{b64_eco}" alt="Adultos cuidando plantas y huerto en invernadero luminoso">
          </div>
        </div>
      </section>

      <!-- SLIDE 7: EN EL TRABAJO (CON DINÁMICA 2 EN VIVO) -->
      <section class="slide" data-name="7. En el Trabajo">
        <div class="layout-split img-left">
          <div class="editorial-img-box">
            <img src="{b64_trabajo}" alt="Equipo profesional adulto colaborando en armonía y respeto">
          </div>

          <div>
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:6px;">
              <div class="pill-label sage">💼 Entornos Profesionales</div>
              <!-- Botón Dinámica 2 -->
              <button class="interactive-trigger-btn pulse-anim" onclick="openModal('modal-dinamica2')">
                🤝 Dinámica En Vivo: El Telar
              </button>
            </div>

            <h2 class="slide-heading">
              Cuidado en el <span class="highlight-pink">Trabajo</span>
            </h2>
            <p class="slide-tagline">
              El ámbito laboral como espacio de crecimiento, salud y dignidad humana.
            </p>

            <div class="grid-interactive cols-2" style="gap: 12px;">
              <div class="quick-card sage">
                <div class="card-badge-row">
                  <span style="font-size: 20px;">💺</span>
                  <span class="card-num">PILAR 1</span>
                </div>
                <div class="card-title" style="font-size: 14px;">Ergonomía y Salud</div>
                <div class="card-body" style="font-size: 12px;">
                  Cuidar la postura física y hacer pausas activas para volver sanos a casa.
                </div>
              </div>

              <div class="quick-card sage">
                <div class="card-badge-row">
                  <span style="font-size: 20px;">🛡️</span>
                  <span class="card-num">PILAR 2</span>
                </div>
                <div class="card-title" style="font-size: 14px;">Cero Hostilidad</div>
                <div class="card-body" style="font-size: 12px;">
                  Desterrar el chisme y el maltrato sutil; construir seguridad psicológica.
                </div>
              </div>

              <div class="quick-card sage">
                <div class="card-badge-row">
                  <span style="font-size: 20px;">⏱️</span>
                  <span class="card-num">PILAR 3</span>
                </div>
                <div class="card-title" style="font-size: 14px;">Ritmos Sostenibles</div>
                <div class="card-body" style="font-size: 12px;">
                  Prevenir el síndrome de agotamiento (burnout) mediante cargas justas.
                </div>
              </div>

              <div class="quick-card sage">
                <div class="card-badge-row">
                  <span style="font-size: 20px;">🤝</span>
                  <span class="card-num">PILAR 4</span>
                </div>
                <div class="card-title" style="font-size: 14px;">Liderazgo Cercano</div>
                <div class="card-body" style="font-size: 12px;">
                  Preguntar «¿cómo estás hoy?» antes de exigir resultados: las personas primero.
                </div>
              </div>
            </div>

            <div class="quote-editorial" style="border-left-color: var(--sage-text); margin-top: 14px; font-size: 14px;">
              «Una organización saludable cuida la vida, el descanso y la energía de su gente»
            </div>
          </div>
        </div>
      </section>

      <!-- SLIDE 8: ¿QUÉ DAÑA EL CUIDADO? (CON DIAGNÓSTICO EN VIVO) -->
      <section class="slide" data-name="8. ¿Qué Daña el Cuidado?">
        <div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom: 12px;">
          <div>
            <div class="pill-label">⚠️ Reflexión Crítica</div>
            <h2 class="slide-heading">
              ¿Qué <span class="highlight-pink">Daña</span> la Cultura del Cuidado?
            </h2>
            <p class="slide-tagline" style="margin-bottom:0;">
              Obstáculos silenciosos que nos roban la paz al final de la jornada.
            </p>
          </div>

          <!-- Botón de Diagnóstico -->
          <button class="interactive-trigger-btn" onclick="openModal('modal-q3')">
            📊 Termómetro en Vivo
          </button>
        </div>

        <div class="grid-interactive cols-4" style="flex: 1; align-items: stretch;">
          <div class="quick-card" style="border-top: 4px solid var(--pink-accent);">
            <div class="card-badge-row">
              <span style="font-size: 24px;">⏳</span>
              <span class="card-num">BARRERA 1</span>
            </div>
            <div class="card-title">La Prisa Crónica</div>
            <div class="card-body">
              Vivir corriendo en automático sin tiempo para respirar, sonreír o escuchar al otro con calma.
            </div>
            <div style="margin-top:auto; font-size:11.5px; font-weight:700; color:var(--pink-text);">
              Erosiona la empatía
            </div>
          </div>

          <div class="quick-card violet" style="border-top: 4px solid var(--violet-accent);">
            <div class="card-badge-row">
              <span style="font-size: 24px;">🔕</span>
              <span class="card-num">BARRERA 2</span>
            </div>
            <div class="card-title">La Indiferencia</div>
            <div class="card-body">
              La trampa del «a mí qué me importa» o «para eso le pagan a otros», evadiendo la tarea común.
            </div>
            <div style="margin-top:auto; font-size:11.5px; font-weight:700; color:var(--violet-text);">
              Rompe la comunidad
            </div>
          </div>

          <div class="quick-card blue" style="border-top: 4px solid var(--blue-accent);">
            <div class="card-badge-row">
              <span style="font-size: 24px;">🥀</span>
              <span class="card-num">BARRERA 3</span>
            </div>
            <div class="card-title">Individualismo</div>
            <div class="card-body">
              La creencia errónea de que el éxito es solitario y que pedir ayuda es signo de debilidad.
            </div>
            <div style="margin-top:auto; font-size:11.5px; font-weight:700; color:var(--blue-text);">
              Aísla y enferma
            </div>
          </div>

          <div class="quick-card sage" style="border-top: 4px solid var(--sage-text);">
            <div class="card-badge-row">
              <span style="font-size: 24px;">🔋</span>
              <span class="card-num">BARRERA 4</span>
            </div>
            <div class="card-title">Sobrecarga y Culpa</div>
            <div class="card-body">
              Exigir a una sola persona que cargue con todo el peso del hogar o trabajo hasta agotarse.
            </div>
            <div style="margin-top:auto; font-size:11.5px; font-weight:700; color:var(--sage-text);">
              Genera burnout
            </div>
          </div>
        </div>

        <div style="background: linear-gradient(135deg, var(--pastel-pink-card), var(--pastel-violet-card)); border-radius: 16px; padding: 14px 24px; border: 1.5px solid var(--pastel-violet-border); margin-top: 14px; display: flex; align-items: center; justify-content: space-between;">
          <div style="font-size: 14px; font-weight: 700; color: var(--text-dark);">
            💡 <em>«El antídoto contra estas trampas es la desaceleración consciente y la ternura en los acuerdos»</em>
          </div>
          <span class="pill-label violet" style="margin:0;">Vencer el desapego</span>
        </div>
      </section>

      <!-- SLIDE 9: DECÁLOGO -->
      <section class="slide" data-name="9. Decálogo">
        <div class="layout-split img-left">
          <div class="editorial-img-box">
            <img src="{b64_arbol}" alt="Árbol de la Vida y los 10 Principios del Cuidado">
          </div>

          <div>
            <div class="pill-label violet">📜 Principios de Oro</div>
            <h2 class="slide-heading" style="font-size: 28px;">
              Decálogo del <span class="highlight-violet">Cuidado</span>
            </h2>
            <p class="slide-tagline" style="margin-bottom: 12px; font-size: 14px;">
              Diez compromisos éticos para transformar nuestra convivencia diaria.
            </p>

            <div class="grid-interactive cols-2" style="gap: 8px;">
              <div class="quick-card" style="padding: 9px 12px;">
                <div style="font-size: 12.5px; font-weight: 800; color: var(--pink-text);">1. La vida es sagrada</div>
                <div style="font-size: 11.5px; color: var(--text-dark);">Respetar la dignidad de todo ser vivo.</div>
              </div>
              <div class="quick-card violet" style="padding: 9px 12px;">
                <div style="font-size: 12.5px; font-weight: 800; color: var(--violet-text);">6. Corresponsabilidad</div>
                <div style="font-size: 11.5px; color: var(--text-dark);">El bienestar común es tarea de todos.</div>
              </div>
              <div class="quick-card" style="padding: 9px 12px;">
                <div style="font-size: 12.5px; font-weight: 800; color: var(--pink-text);">2. Cuidarme primero</div>
                <div style="font-size: 11.5px; color: var(--text-dark);">Estar bien para poder dar lo mejor.</div>
              </div>
              <div class="quick-card violet" style="padding: 9px 12px;">
                <div style="font-size: 12.5px; font-weight: 800; color: var(--violet-text);">7. Gratitud sincera</div>
                <div style="font-size: 11.5px; color: var(--text-dark);">Valorar el esfuerzo de quien limpia y cuida.</div>
              </div>
              <div class="quick-card" style="padding: 9px 12px;">
                <div style="font-size: 12.5px; font-weight: 800; color: var(--pink-text);">3. La palabra edifica</div>
                <div style="font-size: 11.5px; color: var(--text-dark);">Hablar con serenidad y aliento.</div>
              </div>
              <div class="quick-card violet" style="padding: 9px 12px;">
                <div style="font-size: 12.5px; font-weight: 800; color: var(--violet-text);">8. Respetar la Tierra</div>
                <div style="font-size: 11.5px; color: var(--text-dark);">Consumir con sobriedad y no agotar el entorno.</div>
              </div>
              <div class="quick-card" style="padding: 9px 12px;">
                <div style="font-size: 12.5px; font-weight: 800; color: var(--pink-text);">4. Escuchar con el alma</div>
                <div style="font-size: 11.5px; color: var(--text-dark);">Regalar presencia genuina y atención.</div>
              </div>
              <div class="quick-card violet" style="padding: 9px 12px;">
                <div style="font-size: 12.5px; font-weight: 800; color: var(--violet-text);">9. Resolver en paz</div>
                <div style="font-size: 11.5px; color: var(--text-dark);">Tender puentes mediante el diálogo sincero.</div>
              </div>
              <div class="quick-card" style="padding: 9px 12px;">
                <div style="font-size: 12.5px; font-weight: 800; color: var(--pink-text);">5. Aceptar la fragilidad</div>
                <div style="font-size: 11.5px; color: var(--text-dark);">Todos necesitamos ayuda en algún momento.</div>
              </div>
              <div class="quick-card violet" style="padding: 9px 12px;">
                <div style="font-size: 12.5px; font-weight: 800; color: var(--violet-text);">10. Trascender con amor</div>
                <div style="font-size: 11.5px; color: var(--text-dark);">Dejar una huella de bondad por donde pasemos.</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- SLIDE 10: CIERRE -->
      <section class="slide" data-name="10. Cierre">
        <div style="flex:1; display:flex; flex-direction:column; justify-content:center; align-items:center; text-align:center;">
          <div style="font-size: 54px; margin-bottom: 10px; animation: soft-pulse 2s infinite ease-in-out;">🌸</div>
          <h2 class="slide-heading" style="font-size: 46px; color: var(--pink-text); margin-bottom: 12px;">
            ¡Muchas Gracias por su Presencia y Compromiso!
          </h2>

          <p style="font-family: 'Playfair Display', serif; font-size: 21px; color: #334155; max-width: 720px; line-height: 1.55; margin-bottom: 24px; font-style: italic;">
            «El cuidado no es una debilidad: es la fuerza más sabia, tierna y revolucionaria capaz de sanar nuestras familias, comunidades y el planeta»
          </p>

          <div style="background: linear-gradient(135deg, var(--pastel-pink-card), var(--pastel-violet-card)); padding: 14px 38px; border-radius: 9999px; border: 2px solid var(--pastel-violet-border); box-shadow: var(--shadow-sm); margin-bottom: 22px;">
            <span style="font-size: 22px; font-weight: 800; color: var(--text-dark); letter-spacing: -0.3px;">
              Angie Gómez
            </span>
          </div>

          <div style="display:flex; gap:12px;">
            <span class="pill-label" style="font-size: 12px; padding: 6px 18px;">🌿 Espacio Abierto para Preguntas</span>
            <span class="pill-label violet" style="font-size: 12px; padding: 6px 18px;">💬 Experiencias y Reflexiones del Público</span>
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

  <!-- ============================================================== -->
  <!-- MODALES / SUBPÁGINAS INTERACTIVAS DESPLEGABLES -->
  <!-- ============================================================== -->

  <!-- MODAL 1: PREGUNTA DIAPOSITIVA 2 -->
  <div class="modal-overlay" id="modal-q1">
    <div class="modal-sheet">
      <button class="modal-close-btn" onclick="closeModal('modal-q1')">✕</button>
      <div class="modal-tag">💬 Pregunta al Auditorio</div>
      <h3 class="modal-title">¿Cuándo fue la última vez que te detuviste a cuidar de ti?</h3>
      <p class="modal-desc">Angie Gómez invita a los asistentes a elegir la opción que mejor represente su momento actual con sinceridad:</p>
      
      <div class="interactive-options-grid">
        <div class="opt-interactive-card" onclick="selectOption(this, 'feedback-q1', '🌱 ¡Excelente! Mantener un espacio propio diario es la clave para no llegar agotados a la noche.')">
          <span class="opt-title">A. Hoy me regalé unos minutos de silencio y calma.</span>
          <span class="opt-badge">Consciente</span>
        </div>
        <div class="opt-interactive-card" onclick="selectOption(this, 'feedback-q1', '☕ Estás en el lugar indicado. Esta charla nocturna es el momento perfecto para desacelerar y respirar.')">
          <span class="opt-title">B. Llevo días enteros corriendo en piloto automático.</span>
          <span class="opt-badge">Sobrecarga</span>
        </div>
        <div class="opt-interactive-card" onclick="selectOption(this, 'feedback-q1', '🤍 Recuerda la regla de oro: descansar no es un premio que se gana, es una necesidad vital que se respeta.')">
          <span class="opt-title">C. Me siento culpable cuando no estoy siendo productivo.</span>
          <span class="opt-badge">Exigencia</span>
        </div>
      </div>

      <div class="modal-feedback-box" id="feedback-q1"></div>
    </div>
  </div>

  <!-- MODAL 2: DINÁMICA 1 (SLIDE 4) - LA BATERÍA DEL AUTOCUIDADO -->
  <div class="modal-overlay" id="modal-dinamica1">
    <div class="modal-sheet">
      <button class="modal-close-btn" onclick="closeModal('modal-dinamica1')">✕</button>
      <div class="modal-tag" style="background:linear-gradient(135deg,#fee2e2,#fed7aa); color:#b91c1c;">⚡ Dinámica Vivencial N° 1</div>
      <h3 class="modal-title">«La Batería del Autocuidado»</h3>
      <p class="modal-desc">
        <strong>Objetivo:</strong> Despertar el cuerpo, romper el letargo de la noche y conectar con el estado real de nuestra energía.
      </p>

      <div style="background:var(--pastel-pink-bg); border-radius:18px; padding:16px 20px; border:1px solid var(--pastel-pink-border); margin-bottom:14px;">
        <div style="font-size:13.5px; font-weight:700; color:var(--pink-text); margin-bottom:6px;">PASO A PASO GUIADO POR ANGIE GÓMEZ:</div>
        <ol style="font-size:13px; color:var(--text-body); margin-left:18px; line-height:1.6;">
          <li><strong>Ponerse de pie y estirar:</strong> Todos nos levantamos, inhalamos hondo llevando brazos arriba y soltamos el aire como un suspiro liberador.</li>
          <li><strong>Chequeo de batería:</strong> Miramos a la persona de al lado y le decimos: <em>«Mi batería hoy llegó al ___%»</em>.</li>
          <li><strong>Palabra de recarga:</strong> El compañero le responde con afecto: <em>«Gracias por estar aquí, te mereces recargar tu energía hoy»</em>.</li>
        </ol>
      </div>

      <div class="timer-display-box">
        <div style="font-size:12px; font-weight:800; color:var(--violet-text); text-transform:uppercase;">TEMPORIZADOR DE LA DINÁMICA</div>
        <div class="timer-digits" id="timerCount1">02:00</div>
        <div class="timer-controls-row">
          <button class="btn-timer" onclick="startTimer(120, 'timerCount1')">▶ Iniciar 2 Minutos</button>
          <button class="btn-timer" style="background:#64748b;" onclick="resetTimer('timerCount1', '02:00')">↻ Reiniciar</button>
        </div>
      </div>
    </div>
  </div>

  <!-- MODAL 3: PREGUNTA DIAPOSITIVA 5 (PALABRAS QUE SANAN) -->
  <div class="modal-overlay" id="modal-q2">
    <div class="modal-sheet">
      <button class="modal-close-btn" onclick="closeModal('modal-q2')">✕</button>
      <div class="modal-tag" style="background:var(--pastel-violet-card); color:var(--violet-text);">💬 Momento de Empatía</div>
      <h3 class="modal-title">¿Qué frase necesitabas escuchar hoy al terminar el día?</h3>
      <p class="modal-desc">Haz clic en la palabra que más resuena con lo que tu corazón o tu cuerpo necesitaban:</p>

      <div class="interactive-options-grid">
        <div class="opt-interactive-card" onclick="selectOption(this, 'feedback-q2', '✨ «Lo hiciste lo mejor que pudiste hoy. Suelta el control y felicítate por tu esfuerzo».')">
          <span class="opt-title">1. «Vas bien, no te sobreexijas tanto»</span>
          <span class="opt-badge">Alivio</span>
        </div>
        <div class="opt-interactive-card" onclick="selectOption(this, 'feedback-q2', '🤝 «No estás en soledad. Siempre hay manos dispuestas a sostenerte cuando lo pides con humildad».')">
          <span class="opt-title">2. «Cuenta conmigo, aquí estoy para ti»</span>
          <span class="opt-badge">Apoyo</span>
        </div>
        <div class="opt-interactive-card" onclick="selectOption(this, 'feedback-q2', '🌷 «Tu presencia hace la diferencia en tu familia y en tu trabajo, aunque a veces sientas que pasa desapercibido».')">
          <span class="opt-title">3. «Gracias por todo lo que haces con amor»</span>
          <span class="opt-badge">Gratitud</span>
        </div>
        <div class="opt-interactive-card" onclick="selectOption(this, 'feedback-q2', '🌙 «El mundo no se detendrá si hoy descansas. Date permiso de cerrar el día en paz».')">
          <span class="opt-title">4. «Descansa sin culpa, te lo has ganado»</span>
          <span class="opt-badge">Serenidad</span>
        </div>
      </div>

      <div class="modal-feedback-box" id="feedback-q2"></div>
    </div>
  </div>

  <!-- MODAL 4: DINÁMICA 2 (SLIDE 7) - EL TELAR DEL CUIDADO -->
  <div class="modal-overlay" id="modal-dinamica2">
    <div class="modal-sheet">
      <button class="modal-close-btn" onclick="closeModal('modal-dinamica2')">✕</button>
      <div class="modal-tag" style="background:linear-gradient(135deg,#dcfce7,#e0f2fe); color:#0f766e;">🤝 Dinámica Colectiva N° 2</div>
      <h3 class="modal-title">«El Telar del Cuidado y la Gratitud»</h3>
      <p class="modal-desc">
        <strong>Objetivo:</strong> Pasar de la teoría a un compromiso concreto de buen trato en el trabajo y la familia para el día de mañana.
      </p>

      <div style="background:var(--pastel-sage-bg); border-radius:18px; padding:16px 20px; border:1px solid var(--pastel-sage-border); margin-bottom:14px;">
        <div style="font-size:13.5px; font-weight:700; color:var(--sage-text); margin-bottom:6px;">PASO A PASO GUIADO POR ANGIE GÓMEZ:</div>
        <ol style="font-size:13px; color:var(--text-body); margin-left:18px; line-height:1.6;">
          <li><strong>Evocar a una persona:</strong> En silencio, trae a tu mente a un compañero de trabajo o familiar que cuida de todos silenciosamente.</li>
          <li><strong>Pacto de reciprocidad:</strong> Con tu pareja al lado, comparte: <em>«Mañana voy a agradecer o tener un gesto de cuidado con [Nombre] haciendo [Acción concreta]»</em>.</li>
          <li><strong>Sello del acuerdo:</strong> Se dan un apretón de manos cálido o un choque de puños como guardianes del cuidado mutuo.</li>
        </ol>
      </div>

      <div class="timer-display-box">
        <div style="font-size:12px; font-weight:800; color:var(--sage-text); text-transform:uppercase;">TIEMPO DE COMPARTIR EN PAREJAS</div>
        <div class="timer-digits" id="timerCount2" style="color:var(--sage-text);">02:00</div>
        <div class="timer-controls-row">
          <button class="btn-timer" style="background:linear-gradient(135deg,#16a34a,#0d9488);" onclick="startTimer(120, 'timerCount2')">▶ Iniciar 2 Minutos</button>
          <button class="btn-timer" style="background:#64748b;" onclick="resetTimer('timerCount2', '02:00')">↻ Reiniciar</button>
        </div>
      </div>
    </div>
  </div>

  <!-- MODAL 5: DIAGNÓSTICO EN VIVO (SLIDE 8) -->
  <div class="modal-overlay" id="modal-q3">
    <div class="modal-sheet">
      <button class="modal-close-btn" onclick="closeModal('modal-q3')">✕</button>
      <div class="modal-tag" style="background:#fee2e2; color:#be123c;">⚠️ Termómetro Nocturno</div>
      <h3 class="modal-title">¿Cuál de estos enemigos te acecha más al llegar la noche?</h3>
      <p class="modal-desc">Angie Gómez pide levantar la mano al mencionar cada opción para ver el termómetro del salón:</p>

      <div class="interactive-options-grid">
        <div class="opt-interactive-card" onclick="selectOption(this, 'feedback-q3', '⏳ La mente sigue acelerada aunque el cuerpo pida cama. Solución: 10 minutos sin pantallas antes de dormir.')">
          <span class="opt-title">1. La Prisa Mental: «No logro desconectarme del afán»</span>
          <span class="opt-badge">Aceleración</span>
        </div>
        <div class="opt-interactive-card" onclick="selectOption(this, 'feedback-q3', '🔋 Sentir que si tú no lo haces, nadie más lo hará. Solución: Delegar y pedir ayuda con amor.')">
          <span class="opt-title">2. La Sobrecarga: «Siento que todo el peso recae en mí»</span>
          <span class="opt-badge">Agotamiento</span>
        </div>
        <div class="opt-interactive-card" onclick="selectOption(this, 'feedback-q3', '🥀 Creer que debes ser fuerte siempre. Solución: Permitirte ser vulnerable y abrazar a los tuyos.')">
          <span class="opt-title">3. El Aislamiento: «Me guardo todo para no molestar»</span>
          <span class="opt-badge">Silencio</span>
        </div>
      </div>

      <div class="modal-feedback-box" id="feedback-q3"></div>
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

    // Keyboard Shortcuts
    document.addEventListener('keydown', (e) => {{
      if (e.key === 'ArrowRight' || e.key === ' ' || e.key === 'PageDown') {{
        goTo(currentIndex + 1);
      }} else if (e.key === 'ArrowLeft' || e.key === 'PageUp') {{
        goTo(currentIndex - 1);
      }} else if (e.key === 'Escape') {{
        thumbTray.classList.remove('open');
        closeAllModals();
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

    // Modal Control Functions
    function openModal(modalId) {{
      const m = document.getElementById(modalId);
      if (m) m.classList.add('open');
    }}

    function closeModal(modalId) {{
      const m = document.getElementById(modalId);
      if (m) m.classList.remove('open');
    }}

    function closeAllModals() {{
      document.querySelectorAll('.modal-overlay').forEach(m => m.classList.remove('open'));
    }}

    window.addEventListener('click', (e) => {{
      if (e.target.classList.contains('modal-overlay')) {{
        e.target.classList.remove('open');
      }}
    }});

    function selectOption(el, feedbackId, text) {{
      const parent = el.closest('.interactive-options-grid');
      parent.querySelectorAll('.opt-interactive-card').forEach(c => c.classList.remove('selected'));
      el.classList.add('selected');

      const fb = document.getElementById(feedbackId);
      if (fb) {{
        fb.innerHTML = text;
        fb.style.display = 'block';
      }}
    }}

    // Timer Functions
    let timerInterval = null;
    function startTimer(durationSec, elementId) {{
      clearInterval(timerInterval);
      let remaining = durationSec;
      const el = document.getElementById(elementId);

      timerInterval = setInterval(() => {{
        const mins = Math.floor(remaining / 60);
        const secs = remaining % 60;
        el.textContent = `${{mins.toString().padStart(2, '0')}}:${{secs.toString().padStart(2, '0')}}`;

        if (remaining <= 0) {{
          clearInterval(timerInterval);
          el.textContent = "¡Tiempo! 🔔";
        }}
        remaining--;
      }}, 1000);
    }}

    function resetTimer(elementId, defaultText) {{
      clearInterval(timerInterval);
      document.getElementById(elementId).textContent = defaultText;
    }}

    updateDeck();
  </script>

</body>
</html>
"""

# Guardar en Desktop y Descargas
path_desk = r"C:\Users\lenovo\Desktop\trabajos andres\Presentacion_Cultura_del_Cuidado.html"
path_down = r"C:\Users\lenovo\Downloads\Presentacion_Cultura_del_Cuidado.html"

with open(path_desk, "w", encoding="utf-8") as f:
    f.write(html_content)

with open(path_down, "w", encoding="utf-8") as f:
    f.write(html_content)

print("Presentación interactiva nocturna generada exitosamente con dinámicas y preguntas para Angie Gómez.")
