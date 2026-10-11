# -*- coding: utf-8 -*-
import os
import re

SOURCE_PY = r"C:\Users\lenovo\Downloads\rutacost-colombia---costos-de-flota-y-reparto\scratch\build_sequential_deck.py"
OUTPUT_DOWN = r"C:\Users\lenovo\Downloads\Presentacion_Cultura_del_Cuidado.html"
OUTPUT_DESK = r"C:\Users\lenovo\Desktop\trabajos andres\Presentacion_Cultura_del_Cuidado.html"

with open(SOURCE_PY, "r", encoding="utf-8") as f:
    content = f.read()

# 1. Update viewport meta tag
content = content.replace(
    '<meta name="viewport" content="width=device-width, initial-scale=1.0">',
    '<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=5.0, viewport-fit=cover">'
)

# 2. Add classes to Slide 11, Slide 13, Slide 14 for clean responsive queries
content = content.replace(
    '<div style="display:grid; grid-template-columns: 1fr 1fr; gap:10px;">',
    '<div class="postit-grid" style="display:grid; grid-template-columns: 1fr 1fr; gap:10px;">'
)

content = content.replace(
    '<div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px;">',
    '<div class="decalogo-grid" style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px;">'
)

content = content.replace(
    '<div style="background:linear-gradient(135deg,var(--pastel-pink-card),var(--pastel-violet-card)); border-radius:24px; padding:18px 36px; border:2px solid var(--pastel-violet-border); display:inline-flex; align-items:center; gap:24px; box-shadow:var(--shadow-sm);">',
    '<div class="cierre-card" style="background:linear-gradient(135deg,var(--pastel-pink-card),var(--pastel-violet-card)); border-radius:24px; padding:18px 36px; border:2px solid var(--pastel-violet-border); display:inline-flex; align-items:center; gap:24px; box-shadow:var(--shadow-sm);">'
)

content = content.replace(
    '<div style="width:1px; height:42px; background:var(--pastel-violet-border);"></div>',
    '<div class="cierre-divider" style="width:1px; height:42px; background:var(--pastel-violet-border);"></div>'
)

# 3. Add stopPropagation to modal cards so tapping/scrolling inside modal never closes it accidentally
content = content.replace(
    '<div id="interactiveModal" class="modal-overlay" onclick="closeModalOnBackdrop(event)">\n      <div class="modal-card">',
    '<div id="interactiveModal" class="modal-overlay" onclick="closeModalOnBackdrop(event)">\n      <div class="modal-card" onclick="event.stopPropagation()">'
)

content = content.replace(
    '<div id="slideSelectorModal" class="modal-overlay" onclick="closeSlideSelectorOnBackdrop(event)">\n      <div class="modal-card" style="max-width: 820px; padding: 24px 30px;">',
    '<div id="slideSelectorModal" class="modal-overlay" onclick="closeSlideSelectorOnBackdrop(event)">\n      <div class="modal-card" onclick="event.stopPropagation()" style="max-width: 820px; padding: 24px 30px;">'
)

# 4. Add floating mobile navigation arrows inside deck-stage
mobile_arrows_html = """
      <!-- Botones Flotantes de Navegación Rápida para Móviles -->
      <button class="mobile-nav-arrow prev" id="mobilePrevBtn" title="Anterior diapositiva" aria-label="Anterior">‹</button>
      <button class="mobile-nav-arrow next" id="mobileNextBtn" title="Siguiente diapositiva" aria-label="Siguiente">›</button>
"""

content = content.replace(
    '</main>',
    mobile_arrows_html + '\n    </main>'
)

# 5. Let's replace the CSS with the enhanced responsive CSS
old_css_marker_start = "    * {\n      margin: 0;\n      padding: 0;\n      box-sizing: border-box;\n      -webkit-font-smoothing: antialiased;\n    }"
new_css = """    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
      -webkit-font-smoothing: antialiased;
    }

    html, body {
      margin: 0;
      padding: 0;
      width: 100%;
      height: 100%;
      height: 100dvh;
      min-height: -webkit-fill-available;
      overflow: hidden;
      background: #fdfafc;
      color: var(--text-body);
      font-family: 'Plus Jakarta Sans', sans-serif;
      user-select: none;
      -webkit-tap-highlight-color: transparent;
    }

    /* Marco Principal de Diapositiva */
    #deck-wrapper {
      position: relative;
      width: 100%;
      height: 100%;
      height: 100dvh;
      display: flex;
      flex-direction: column;
      overflow: hidden;
      background: #ffffff;
    }

    /* Barra Superior Elegante */
    header.deck-header {
      height: 58px;
      min-height: 58px;
      background: rgba(255, 255, 255, 0.96);
      backdrop-filter: blur(12px);
      -webkit-backdrop-filter: blur(12px);
      border-bottom: 1.5px solid #f1f5f9;
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0 28px;
      z-index: 40;
      flex-shrink: 0;
    }

    .brand-group {
      display: flex;
      align-items: center;
      gap: 10px;
      font-weight: 800;
      font-size: 15px;
      letter-spacing: -0.3px;
      color: var(--text-dark);
    }
    .brand-icon {
      width: 32px;
      height: 32px;
      border-radius: 10px;
      background: linear-gradient(135deg, var(--pastel-pink-card), var(--pastel-violet-card));
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 17px;
      border: 1px solid var(--pastel-pink-border);
      flex-shrink: 0;
    }

    .presenter-badge {
      background: linear-gradient(135deg, var(--pastel-pink-card), var(--pastel-violet-card));
      padding: 6px 18px;
      border-radius: 9999px;
      font-size: 12.5px;
      font-weight: 700;
      color: var(--violet-text);
      border: 1px solid var(--pastel-violet-border);
      display: flex;
      align-items: center;
      gap: 8px;
      box-shadow: var(--shadow-sm);
    }

    .header-tools {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .tool-btn {
      background: #ffffff;
      border: 1.5px solid #e2e8f0;
      color: var(--text-dark);
      padding: 7px 15px;
      border-radius: 12px;
      font-size: 12px;
      font-weight: 700;
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: 6px;
      transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
      touch-action: manipulation;
    }
    .tool-btn:hover {
      background: var(--pastel-pink-bg);
      border-color: var(--pastel-pink-border);
      color: var(--pink-text);
      transform: translateY(-1px);
    }

    /* Escenario de Diapositivas */
    #deck-stage {
      flex: 1;
      position: relative;
      overflow: hidden;
      padding: 16px 28px;
      background: radial-gradient(circle at 12% 18%, rgba(253, 232, 238, 0.4) 0%, transparent 40%),
                  radial-gradient(circle at 88% 82%, rgba(237, 233, 254, 0.45) 0%, transparent 40%),
                  radial-gradient(circle at 50% 50%, rgba(240, 249, 255, 0.35) 0%, transparent 55%),
                  #ffffff;
    }

    .slide {
      position: absolute;
      top: 10px;
      left: 20px;
      right: 20px;
      bottom: 10px;
      opacity: 0;
      visibility: hidden;
      transform: translateY(14px) scale(0.99);
      transition: opacity 0.3s ease, transform 0.3s cubic-bezier(0.16, 1, 0.3, 1), visibility 0.3s;
      display: flex;
      flex-direction: column;
      justify-content: flex-start;
      z-index: 1;
      pointer-events: none;
      overflow-y: auto;
      overflow-x: hidden;
      -webkit-overflow-scrolling: touch;
      overscroll-behavior-y: contain;
      padding-bottom: 50px;
    }

    .slide.active {
      opacity: 1;
      visibility: visible;
      transform: translateY(0) scale(1);
      z-index: 5;
      pointer-events: auto;
    }

    .slide::-webkit-scrollbar {
      width: 5px;
    }
    .slide::-webkit-scrollbar-track {
      background: transparent;
    }
    .slide::-webkit-scrollbar-thumb {
      background: #cbd5e1;
      border-radius: 9999px;
    }

    /* Estilos Tipográficos & Pills */
    .pill-label {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 4px 14px;
      border-radius: 9999px;
      font-size: 11.5px;
      font-weight: 800;
      text-transform: uppercase;
      letter-spacing: 0.8px;
      background: var(--pastel-pink-card);
      color: var(--pink-text);
      border: 1px solid var(--pastel-pink-border);
      margin-bottom: 8px;
      width: fit-content;
    }
    .pill-label.violet {
      background: var(--pastel-violet-card);
      color: var(--violet-text);
      border-color: var(--pastel-violet-border);
    }
    .pill-label.blue {
      background: var(--pastel-blue-card);
      color: var(--blue-text);
      border-color: var(--pastel-blue-border);
    }
    .pill-label.sage {
      background: var(--pastel-sage-card);
      color: var(--sage-text);
      border-color: var(--pastel-sage-border);
    }
    .pill-label.interactive-pill {
      background: linear-gradient(135deg, #f43f5e, #be123c);
      color: #ffffff;
      border: none;
      box-shadow: 0 4px 12px rgba(244, 63, 94, 0.3);
    }

    .slide-heading {
      font-size: 30px;
      font-weight: 800;
      color: var(--text-dark);
      letter-spacing: -0.6px;
      line-height: 1.2;
      margin-bottom: 3px;
    }
    .slide-heading span.highlight-pink { color: var(--pink-text); }
    .slide-heading span.highlight-violet { color: var(--violet-text); }
    .slide-heading span.highlight-blue { color: var(--blue-text); }

    .slide-tagline {
      font-size: 14px;
      color: var(--text-muted);
      margin-bottom: 14px;
      font-weight: 500;
    }

    /* Diseños Split */
    .layout-split {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 28px;
      align-items: center;
      flex: 1;
      width: 100%;
    }
    .layout-split.img-left { grid-template-columns: 0.95fr 1.05fr; }
    .layout-split.img-right { grid-template-columns: 1.05fr 0.95fr; }

    .editorial-img-box {
      width: 100%;
      height: 100%;
      max-height: 420px;
      border-radius: 22px;
      overflow: hidden;
      background: #ffffff;
      padding: 8px;
      border: 3px solid #ffffff;
      box-shadow: 0 18px 40px -12px rgba(30, 41, 59, 0.12);
      position: relative;
    }
    .editorial-img-box img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      border-radius: 16px;
      display: block;
      transition: transform 0.5s ease;
    }
    .editorial-img-box:hover img {
      transform: scale(1.025);
    }

    /* Tarjetas Interactivas con Poca Letra */
    .grid-interactive {
      display: grid;
      gap: 14px;
      width: 100%;
    }
    .grid-interactive.cols-2 { grid-template-columns: 1fr 1fr; }
    .grid-interactive.cols-3 { grid-template-columns: repeat(3, 1fr); }
    .grid-interactive.cols-4 { grid-template-columns: repeat(4, 1fr); }

    .quick-card {
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
      position: relative;
      touch-action: manipulation;
    }
    .quick-card.violet { border-color: var(--pastel-violet-border); }
    .quick-card.blue { border-color: var(--pastel-blue-border); }
    .quick-card.sage { border-color: var(--pastel-sage-border); }

    .quick-card:hover {
      transform: translateY(-4px) scale(1.015);
      box-shadow: var(--shadow-hover);
      border-color: var(--pink-accent);
      background: linear-gradient(180deg, #ffffff 0%, var(--pastel-pink-bg) 100%);
    }
    .quick-card.violet:hover {
      border-color: var(--violet-accent);
      background: linear-gradient(180deg, #ffffff 0%, var(--pastel-violet-bg) 100%);
    }
    .quick-card.blue:hover {
      border-color: var(--blue-accent);
      background: linear-gradient(180deg, #ffffff 0%, var(--pastel-blue-bg) 100%);
    }
    .quick-card.sage:hover {
      border-color: var(--sage-text);
      background: linear-gradient(180deg, #ffffff 0%, var(--pastel-sage-bg) 100%);
    }

    .quick-card:active {
      transform: scale(0.985);
      opacity: 0.94;
    }

    .card-badge-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
    }
    .card-icon-circle {
      width: 38px;
      height: 38px;
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 19px;
      background: var(--pastel-pink-bg);
      border: 1px solid var(--pastel-pink-border);
      flex-shrink: 0;
    }
    .quick-card.violet .card-icon-circle {
      background: var(--pastel-violet-bg);
      border-color: var(--pastel-violet-border);
    }
    .quick-card.blue .card-icon-circle {
      background: var(--pastel-blue-bg);
      border-color: var(--pastel-blue-border);
    }
    .quick-card.sage .card-icon-circle {
      background: var(--pastel-sage-bg);
      border-color: var(--pastel-sage-border);
    }

    .card-num {
      font-size: 11px;
      font-weight: 800;
      color: var(--text-muted);
      letter-spacing: 0.5px;
    }

    .card-title {
      font-size: 15px;
      font-weight: 800;
      color: var(--text-dark);
      letter-spacing: -0.2px;
      margin-top: 1px;
    }

    .card-body {
      font-size: 12.8px;
      color: var(--text-body);
      line-height: 1.45;
    }

    /* Botón pill dentro de cada tarjeta para indicar clic */
    .card-interactive-action {
      margin-top: auto;
      padding-top: 8px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      font-size: 11.5px;
      font-weight: 800;
      color: var(--pink-text);
      border-top: 1px dashed var(--pastel-pink-border);
    }
    .quick-card.violet .card-interactive-action {
      color: var(--violet-text);
      border-top-color: var(--pastel-violet-border);
    }
    .quick-card.blue .card-interactive-action {
      color: var(--blue-text);
      border-top-color: var(--pastel-blue-border);
    }
    .quick-card.sage .card-interactive-action {
      color: var(--sage-text);
      border-top-color: var(--pastel-sage-border);
    }

    .quote-editorial {
      font-family: 'Playfair Display', serif;
      font-style: italic;
      font-size: 15.5px;
      color: #334155;
      line-height: 1.45;
      padding: 10px 18px;
      border-left: 3px solid var(--pink-accent);
      background: linear-gradient(90deg, var(--pastel-pink-bg) 0%, rgba(255,255,255,0) 100%);
      border-radius: 0 14px 14px 0;
      margin-top: 12px;
    }

    /* Estilos Especiales para Preguntas Interactivas */
    .interactive-stage-card {
      background: #ffffff;
      border-radius: 24px;
      border: 2px solid var(--pastel-violet-border);
      padding: 22px 28px;
      box-shadow: var(--shadow-card);
      display: flex;
      flex-direction: column;
      gap: 12px;
      width: 100%;
    }

    .poll-option-row {
      background: var(--pastel-pink-bg);
      border: 1.5px solid var(--pastel-pink-border);
      border-radius: 16px;
      padding: 14px 20px;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: space-between;
      transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
      touch-action: manipulation;
    }
    .poll-option-row:hover {
      background: #ffffff;
      border-color: var(--pink-accent);
      transform: translateX(4px);
      box-shadow: var(--shadow-sm);
    }
    .poll-option-row.selected {
      background: linear-gradient(135deg, var(--pastel-pink-card), var(--pastel-violet-card));
      border-color: var(--violet-accent);
      box-shadow: var(--shadow-hover);
    }
    .poll-option-title {
      font-size: 14.5px;
      font-weight: 700;
      color: var(--text-dark);
      display: flex;
      align-items: center;
      gap: 12px;
    }
    .poll-badge {
      font-size: 11.5px;
      font-weight: 800;
      color: var(--pink-text);
      background: #ffffff;
      padding: 5px 14px;
      border-radius: 9999px;
      border: 1px solid var(--pastel-pink-border);
      white-space: nowrap;
      flex-shrink: 0;
    }

    /* Termómetro de Batería Humana (Dinámica 1) */
    .battery-level-card {
      background: #ffffff;
      border-radius: 16px;
      padding: 12px 16px;
      border: 1.5px solid #e2e8f0;
      display: flex;
      align-items: center;
      justify-content: space-between;
      cursor: pointer;
      transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
      touch-action: manipulation;
    }
    .battery-level-card:hover {
      transform: translateX(4px);
      border-color: var(--violet-accent);
      background: var(--pastel-violet-bg);
    }
    .battery-level-card.selected {
      background: linear-gradient(135deg, var(--pastel-pink-card), var(--pastel-violet-card));
      border-color: var(--pink-accent);
      box-shadow: var(--shadow-sm);
    }

    /* Post-Its Virtuales de Gratitud (Dinámica 2) */
    .postit-card {
      background: #fef9c3;
      border-radius: 18px;
      padding: 16px 18px;
      box-shadow: 0 8px 18px rgba(0, 0, 0, 0.06);
      border: 1px solid #fde047;
      display: flex;
      flex-direction: column;
      gap: 8px;
      cursor: pointer;
      transition: all 0.25s ease;
      position: relative;
      touch-action: manipulation;
    }
    .postit-card:nth-child(2) { background: #fce7f3; border-color: #fbcfe8; }
    .postit-card:nth-child(3) { background: #ede9fe; border-color: #ddd6fe; }
    .postit-card:nth-child(4) { background: #dcfce7; border-color: #bbf7d0; }

    .postit-card:hover {
      transform: translateY(-4px) scale(1.02);
      box-shadow: 0 14px 26px rgba(0, 0, 0, 0.12);
    }

    .dynamic-timer-box {
      background: linear-gradient(135deg, var(--pastel-violet-bg), #ffffff);
      border: 2px solid var(--pastel-violet-border);
      border-radius: 22px;
      padding: 22px;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      text-align: center;
      box-shadow: var(--shadow-card);
      height: 100%;
    }
    .dynamic-timer-num {
      font-size: 52px;
      font-weight: 800;
      color: var(--violet-text);
      letter-spacing: 2px;
      font-variant-numeric: tabular-nums;
      margin: 8px 0;
    }
    .btn-timer-action {
      background: linear-gradient(135deg, var(--violet-accent), #4f46e5);
      color: #ffffff;
      border: none;
      padding: 9px 20px;
      border-radius: 14px;
      font-size: 13.5px;
      font-weight: 800;
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      gap: 7px;
      box-shadow: 0 4px 14px rgba(124, 58, 237, 0.3);
      transition: all 0.2s;
      touch-action: manipulation;
    }
    .btn-timer-action:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 20px rgba(124, 58, 237, 0.45);
    }

    /* Barra Inferior de Control */
    footer.deck-footer {
      height: 60px;
      min-height: 60px;
      background: rgba(255, 255, 255, 0.98);
      backdrop-filter: blur(14px);
      -webkit-backdrop-filter: blur(14px);
      border-top: 1.5px solid #f1f5f9;
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0 24px;
      padding-bottom: max(6px, env(safe-area-inset-bottom));
      z-index: 50;
      position: relative;
      flex-shrink: 0;
      box-shadow: 0 -4px 16px rgba(0, 0, 0, 0.03);
    }

    .footer-left {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .slide-step-counter {
      font-size: 13px;
      font-weight: 800;
      color: var(--text-dark);
      background: #f8fafc;
      padding: 5px 14px;
      border-radius: 9999px;
      border: 1px solid #e2e8f0;
      white-space: nowrap;
    }

    .progress-bar-container {
      flex: 1;
      max-width: 400px;
      height: 6px;
      background: #f1f5f9;
      border-radius: 9999px;
      overflow: hidden;
      margin: 0 20px;
    }
    .progress-fill-line {
      height: 100%;
      width: 7%;
      background: linear-gradient(90deg, #f43f5e 0%, #8b5cf6 50%, #38bdf8 100%);
      border-radius: 9999px;
      transition: width 0.35s ease;
    }

    .footer-actions {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .action-nav-btn {
      background: linear-gradient(135deg, #f43f5e, #e11d48);
      color: #ffffff;
      border: none;
      padding: 10px 22px;
      border-radius: 14px;
      font-size: 13px;
      font-weight: 800;
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: 8px;
      box-shadow: 0 6px 16px -4px rgba(225, 29, 72, 0.35);
      transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
      touch-action: manipulation;
      min-height: 40px;
    }
    .action-nav-btn:hover {
      transform: translateY(-2px);
      box-shadow: 0 10px 20px -4px rgba(225, 29, 72, 0.45);
    }
    .action-nav-btn.secondary {
      background: #ffffff;
      color: var(--text-dark);
      border: 1.5px solid #e2e8f0;
      box-shadow: none;
    }
    .action-nav-btn.secondary:hover {
      background: #f8fafc;
      border-color: #cbd5e1;
      transform: translateY(-1px);
    }

    /* Botones de Navegación Flotantes para Móvil */
    .mobile-nav-arrow {
      display: none;
      position: absolute;
      bottom: 20px;
      width: 44px;
      height: 44px;
      border-radius: 50%;
      background: rgba(255, 255, 255, 0.95);
      border: 2px solid var(--pastel-pink-border);
      color: var(--pink-text);
      font-size: 24px;
      font-weight: 800;
      box-shadow: 0 6px 18px rgba(225, 29, 72, 0.2);
      z-index: 45;
      align-items: center;
      justify-content: center;
      transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
      touch-action: manipulation;
    }
    .mobile-nav-arrow.prev { left: 12px; }
    .mobile-nav-arrow.next { right: 12px; }
    .mobile-nav-arrow:active {
      transform: scale(0.92);
      background: var(--pastel-pink-card);
    }

    /* MODAL UNIVERSAL PARA EJEMPLOS Y SELECTOR DE DIAPOSITIVAS */
    .modal-overlay {
      position: fixed !important;
      inset: 0 !important;
      width: 100vw !important;
      height: 100vh !important;
      height: 100dvh !important;
      background: rgba(15, 23, 42, 0.7) !important;
      backdrop-filter: blur(8px);
      -webkit-backdrop-filter: blur(8px);
      z-index: 99999 !important;
      display: none;
      align-items: center;
      justify-content: center;
      padding: 16px;
      box-sizing: border-box;
    }
    .modal-overlay.active {
      display: flex !important;
    }

    .modal-card {
      background: #ffffff;
      border-radius: 24px;
      padding: 24px 28px;
      max-width: 640px;
      width: 100%;
      max-height: 86dvh;
      overflow-y: auto;
      -webkit-overflow-scrolling: touch;
      overscroll-behavior: contain;
      border: 2px solid var(--pastel-violet-border);
      box-shadow: 0 30px 70px -15px rgba(30, 41, 59, 0.45);
      display: flex;
      flex-direction: column;
      gap: 14px;
      margin: auto;
      box-sizing: border-box;
    }
    .modal-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
    }
    .modal-badge {
      font-size: 11px;
      font-weight: 800;
      text-transform: uppercase;
      letter-spacing: 1px;
      color: var(--violet-text);
      background: var(--pastel-violet-bg);
      border: 1px solid var(--pastel-violet-border);
      padding: 4px 14px;
      border-radius: 9999px;
    }
    .modal-close-btn {
      width: 40px;
      height: 40px;
      border-radius: 50%;
      background: #f1f5f9;
      border: none;
      color: #64748b;
      font-size: 20px;
      font-weight: bold;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.2s;
      touch-action: manipulation;
      flex-shrink: 0;
    }
    .modal-close-btn:hover {
      background: var(--pastel-pink-bg);
      color: var(--pink-text);
      transform: rotate(90deg);
    }
    .modal-icon-circle {
      width: 48px;
      height: 48px;
      border-radius: 14px;
      background: linear-gradient(135deg, var(--pastel-pink-card), var(--pastel-violet-card));
      border: 1.5px solid var(--pastel-violet-border);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 24px;
      flex-shrink: 0;
    }
    .modal-title {
      font-size: 20px;
      font-weight: 800;
      color: var(--text-dark);
      letter-spacing: -0.3px;
      line-height: 1.25;
    }
    .modal-subtitle {
      font-size: 13px;
      color: var(--text-muted);
      font-weight: 600;
      margin-top: 2px;
    }
    .modal-body {
      font-size: 14px;
      color: var(--text-body);
      line-height: 1.55;
      display: flex;
      flex-direction: column;
      gap: 12px;
    }
    .modal-example-box {
      background: var(--pastel-pink-bg);
      border: 1.5px solid var(--pastel-pink-border);
      border-radius: 16px;
      padding: 14px 18px;
    }
    .modal-action-btn {
      background: linear-gradient(135deg, var(--pink-accent), var(--violet-accent));
      color: #ffffff;
      border: none;
      padding: 12px 24px;
      border-radius: 15px;
      font-size: 13.5px;
      font-weight: 800;
      cursor: pointer;
      width: 100%;
      box-shadow: 0 6px 18px -4px rgba(225, 29, 72, 0.35);
      transition: all 0.2s;
      touch-action: manipulation;
      min-height: 46px;
    }
    .modal-action-btn:hover {
      transform: translateY(-2px);
      box-shadow: 0 10px 22px -4px rgba(225, 29, 72, 0.45);
    }

    /* Tarjetas del Selector de Diapositivas */
    .slide-thumb-card {
      background: #ffffff;
      border: 1.5px solid #e2e8f0;
      border-radius: 14px;
      padding: 12px 14px;
      cursor: pointer;
      transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      touch-action: manipulation;
    }
    .slide-thumb-card:hover {
      border-color: var(--pink-accent);
      background: var(--pastel-pink-bg);
      transform: translateY(-2px);
      box-shadow: var(--shadow-sm);
    }
    .slide-thumb-card.active {
      border-color: var(--pink-accent);
      background: var(--pastel-pink-card);
      box-shadow: 0 4px 14px rgba(225, 29, 72, 0.2);
    }

    /* ==========================================
       OPTIMIZACIONES MÓVILES Y RESPONSIVE (CELULAR)
       ========================================== */
    @media (max-width: 900px) {
      header.deck-header {
        padding: 0 16px;
        height: 52px;
        min-height: 52px;
      }
      .presenter-badge {
        padding: 4px 12px;
        font-size: 11.5px;
      }
      #deck-stage {
        padding: 12px 16px;
      }
      .slide {
        top: 6px;
        left: 10px;
        right: 10px;
        bottom: 6px;
        padding-bottom: 55px;
      }
      .layout-split,
      .layout-split.img-left,
      .layout-split.img-right,
      .layout-split[style*="grid-template-columns"] {
        grid-template-columns: 1fr !important;
        gap: 16px !important;
      }
      .editorial-img-box {
        max-height: 240px !important;
        height: 220px !important;
      }
      .grid-interactive.cols-3,
      .grid-interactive.cols-4 {
        grid-template-columns: 1fr 1fr;
        gap: 10px;
      }
      footer.deck-footer {
        padding: 0 16px;
        height: 56px;
        min-height: 56px;
      }
    }

    @media (max-width: 680px) {
      header.deck-header {
        padding: 0 10px;
        height: 48px;
        min-height: 48px;
      }
      .brand-group {
        font-size: 12.5px;
        gap: 6px;
      }
      .brand-icon {
        width: 26px;
        height: 26px;
        font-size: 14px;
        border-radius: 8px;
      }
      .presenter-badge {
        display: none; /* Se oculta para dar prioridad a los controles */
      }
      .tool-btn {
        padding: 5px 9px;
        font-size: 11px;
        border-radius: 9px;
      }
      #btnFullscreen {
        display: none;
      }

      #deck-stage {
        padding: 8px 8px;
      }
      .slide {
        top: 4px;
        left: 4px;
        right: 4px;
        bottom: 4px;
        padding-bottom: 75px !important; /* Vital para que ningún contenido sea tapado por el footer */
      }

      .slide-heading {
        font-size: 21px !important;
        line-height: 1.25 !important;
        margin-bottom: 2px !important;
      }
      .slide-tagline {
        font-size: 12px !important;
        margin-bottom: 10px !important;
        line-height: 1.4 !important;
      }
      .pill-label {
        font-size: 10px !important;
        padding: 3px 9px !important;
        margin-bottom: 6px !important;
      }

      .layout-split,
      .layout-split.img-left,
      .layout-split.img-right,
      .layout-split[style*="grid-template-columns"] {
        grid-template-columns: 1fr !important;
        gap: 12px !important;
      }

      .editorial-img-box {
        max-height: 180px !important;
        height: 170px !important;
        border-radius: 14px !important;
        padding: 4px !important;
      }

      .grid-interactive.cols-2,
      .grid-interactive.cols-3,
      .grid-interactive.cols-4 {
        grid-template-columns: 1fr !important;
        gap: 9px !important;
      }

      .quick-card {
        padding: 12px 14px !important;
        border-radius: 15px !important;
        gap: 5px !important;
      }
      .card-icon-circle {
        width: 32px !important;
        height: 32px !important;
        font-size: 16px !important;
        border-radius: 9px !important;
      }
      .card-title {
        font-size: 13.5px !important;
      }
      .card-body {
        font-size: 11.8px !important;
        line-height: 1.4 !important;
      }
      .card-interactive-action {
        font-size: 10.5px !important;
        padding-top: 5px !important;
      }

      .quote-editorial {
        font-size: 12.5px !important;
        padding: 8px 12px !important;
        margin-top: 8px !important;
        border-radius: 0 10px 10px 0 !important;
      }

      /* Slide 3 & 8 Options */
      .interactive-stage-card {
        padding: 14px 14px !important;
        border-radius: 18px !important;
        gap: 9px !important;
      }
      .poll-option-row {
        padding: 10px 12px !important;
        border-radius: 12px !important;
        flex-direction: column !important;
        align-items: flex-start !important;
        gap: 6px !important;
      }
      .poll-option-title {
        font-size: 12.5px !important;
        gap: 8px !important;
      }
      .poll-badge {
        font-size: 10px !important;
        padding: 3px 8px !important;
        align-self: flex-start !important;
      }

      /* Slide 6 Battery */
      .battery-level-card {
        padding: 9px 12px !important;
        flex-direction: column !important;
        align-items: flex-start !important;
        gap: 5px !important;
        border-radius: 12px !important;
      }

      /* Slide 8 Display Panel */
      #balsamo-display-panel {
        padding: 14px 16px !important;
        border-radius: 18px !important;
      }
      #balsamoTitle {
        font-size: 15px !important;
      }

      /* Slide 11 Post-its */
      .postit-grid {
        grid-template-columns: 1fr !important;
        gap: 8px !important;
      }
      .postit-card {
        padding: 12px 14px !important;
        border-radius: 14px !important;
      }

      /* Slide 13 Decálogo */
      .decalogo-grid {
        grid-template-columns: 1fr !important;
        gap: 6px !important;
      }

      /* Slide 14 Cierre */
      .cierre-card {
        padding: 14px 16px !important;
        flex-direction: column !important;
        gap: 10px !important;
        text-align: center !important;
      }
      .cierre-divider {
        display: none !important;
      }

      /* Footer en Móvil */
      footer.deck-footer {
        height: 52px;
        min-height: 52px;
        padding: 0 8px;
        padding-bottom: max(4px, env(safe-area-inset-bottom));
      }
      .slide-step-counter {
        font-size: 11px !important;
        padding: 3px 8px !important;
      }
      .progress-bar-container {
        margin: 0 6px !important;
        max-width: 100px !important;
      }
      .action-nav-btn {
        padding: 7px 12px !important;
        font-size: 11.5px !important;
        border-radius: 10px !important;
      }

      /* Modales en Móvil */
      .modal-overlay {
        padding: 8px !important;
      }
      .modal-card {
        padding: 16px 14px 18px 14px !important;
        max-height: 90dvh !important;
        border-radius: 18px !important;
        gap: 10px !important;
        width: 96% !important;
      }
      .modal-title {
        font-size: 16px !important;
      }
      .modal-subtitle {
        font-size: 11.5px !important;
      }
      .modal-body {
        font-size: 12.5px !important;
        line-height: 1.45 !important;
        gap: 8px !important;
      }
      .modal-example-box {
        padding: 12px 14px !important;
        border-radius: 14px !important;
      }
      .modal-close-btn {
        width: 38px !important;
        height: 38px !important;
        font-size: 18px !important;
      }
      .modal-action-btn {
        padding: 10px 16px !important;
        font-size: 12.5px !important;
        border-radius: 12px !important;
      }

      /* Botones flotantes móviles visibles */
      .mobile-nav-arrow {
        display: flex;
      }
    }"""

# Replace CSS block
css_pattern = re.compile(r'    \* \{\s*margin: 0;\s*padding: 0;.*?\.slide-thumb-card\.active \{\s*border-color: var\(--pink-accent\);\s*background: var\(--pastel-pink-card\);\s*box-shadow: 0 4px 14px rgba\(225, 29, 72, 0\.2\);\s*\}', re.DOTALL)
if css_pattern.search(content):
    content = css_pattern.sub(new_css, content)
    print("CSS actualizado exitosamente.")
else:
    print("ADVERTENCIA: No se pudo encontrar el patrón CSS exacto.")

# 6. Enhance JavaScript with Touch Gestures, Slide Reset on Change, and Mobile Arrows
old_js_update = """    function goTo(idx) {
      if (idx < 0) idx = 0;
      if (idx >= slides.length) idx = 0;
      currentIndex = idx;
      updateDeck();
    }"""

new_js_update = """    function goTo(idx) {
      if (idx < 0) idx = 0;
      if (idx >= slides.length) idx = 0;
      currentIndex = idx;
      updateDeck();
      // En móvil, devolver el scroll de la diapositiva arriba al cambiar
      if (slides[currentIndex]) {
        slides[currentIndex].scrollTop = 0;
      }
    }"""

content = content.replace(old_js_update, new_js_update)

# Update arrows in updateDeck
old_update_deck_btns = """      if (nextBtn) {
        if (currentIndex === slides.length - 1) {
          nextBtn.innerHTML = 'Reiniciar ↻';
        } else {
          nextBtn.innerHTML = 'Siguiente ›';
        }
      }"""

new_update_deck_btns = """      if (nextBtn) {
        if (currentIndex === slides.length - 1) {
          nextBtn.innerHTML = 'Reiniciar ↻';
        } else {
          nextBtn.innerHTML = 'Siguiente ›';
        }
      }

      const mPrev = document.getElementById('mobilePrevBtn');
      const mNext = document.getElementById('mobileNextBtn');
      if (mPrev) {
        mPrev.style.opacity = currentIndex === 0 ? '0.25' : '1';
        mPrev.style.pointerEvents = currentIndex === 0 ? 'none' : 'auto';
      }
      if (mNext) {
        mNext.innerHTML = currentIndex === slides.length - 1 ? '↻' : '›';
      }"""

content = content.replace(old_update_deck_btns, new_update_deck_btns)

# Add Mobile Touch and Arrow listeners before // Inicializar
touch_js = """    // BOTONES MÓVILES FLOTANTES
    const mPrev = document.getElementById('mobilePrevBtn');
    const mNext = document.getElementById('mobileNextBtn');
    if (mPrev) mPrev.addEventListener('click', () => goTo(currentIndex - 1));
    if (mNext) mNext.addEventListener('click', () => goTo(currentIndex + 1));

    // SOPORTE DE GESTOS TÁCTILES (SWIPE EN CELULARES)
    let touchStartX = 0;
    let touchStartY = 0;
    let touchStartTime = 0;
    const stageEl = document.getElementById('deck-stage');

    if (stageEl) {
      stageEl.addEventListener('touchstart', (e) => {
        if (e.touches.length !== 1) return;
        const activeModal = document.querySelector('.modal-overlay.active');
        if (activeModal) return; // Si hay un modal abierto, no cambiar de diapositiva

        touchStartX = e.touches[0].clientX;
        touchStartY = e.touches[0].clientY;
        touchStartTime = Date.now();
      }, { passive: true });

      stageEl.addEventListener('touchend', (e) => {
        if (e.changedTouches.length !== 1) return;
        const activeModal = document.querySelector('.modal-overlay.active');
        if (activeModal) return;

        const touchEndX = e.changedTouches[0].clientX;
        const touchEndY = e.changedTouches[0].clientY;
        const diffX = touchEndX - touchStartX;
        const diffY = touchEndY - touchStartY;
        const elapsed = Date.now() - touchStartTime;

        // Deslizar horizontalmente con claridad (más horizontal que vertical y al menos 40px)
        if (Math.abs(diffX) > Math.abs(diffY) * 1.25 && Math.abs(diffX) > 40 && elapsed < 600) {
          if (diffX < 0) {
            goTo(currentIndex + 1); // Deslizó hacia la izquierda -> Siguiente
          } else {
            goTo(currentIndex - 1); // Deslizó hacia la derecha -> Anterior
          }
        }
      }, { passive: true });
    }
"""

content = content.replace("    // Inicializar\n    updateDeck();", touch_js + "\n    // Inicializar\n    updateDeck();")

# Save updated generator script
with open(SOURCE_PY, "w", encoding="utf-8") as f:
    f.write(content)

print("build_sequential_deck.py modificado y guardado con éxito. Ejecutando generación...")

# Now execute the script to write both HTML files
os.system(f'python "{SOURCE_PY}"')
print("Proceso completado exitosamente.")
