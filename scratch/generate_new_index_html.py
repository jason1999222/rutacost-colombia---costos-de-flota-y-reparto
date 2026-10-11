import os
import json
import base64

BUILD_DIR = r"C:\Users\lenovo\Downloads\Himnario_App_Build"
ASSETS_DIR = os.path.join(BUILD_DIR, "assets")

# Read base64 of official logo
logo_path = os.path.join(ASSETS_DIR, "logo_idmji.png")
with open(logo_path, "rb") as f:
    logo_base64 = base64.b64encode(f.read()).decode("ascii")

html_content = f"""<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover">
  <title>Himnario IDMJI & Santa Biblia</title>
  <!-- Google Fonts -->
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Playfair+Display:ital,wght@0,600;0,700;1,600&display=swap" rel="stylesheet">
  <style>
    :root {{
      --bg: #090d16;
      --bg-gradient: radial-gradient(circle at 50% 0%, #172554 0%, #090d16 70%);
      --bg-card: rgba(19, 27, 46, 0.75);
      --bg-card-hover: rgba(30, 41, 69, 0.9);
      --bg-glass: rgba(15, 23, 42, 0.88);
      --text: #f8fafc;
      --text-muted: #94a3b8;
      --primary: #38bdf8;
      --primary-gradient: linear-gradient(135deg, #38bdf8 0%, #6366f1 100%);
      --accent: #fbbf24;
      --accent-gradient: linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%);
      --border: rgba(255, 255, 255, 0.08);
      --border-focus: rgba(56, 189, 248, 0.4);
      --chip-bg: rgba(255, 255, 255, 0.06);
      --chip-active: linear-gradient(135deg, #2563eb, #4f46e5);
      --callout-bg: rgba(37, 99, 235, 0.14);
      --callout-border: rgba(56, 189, 248, 0.3);
      --font-scale: 1;
      --shadow-sm: 0 4px 12px rgba(0, 0, 0, 0.25);
      --shadow-lg: 0 12px 32px rgba(0, 0, 0, 0.45);
      --nav-height: 64px;
    }}
    
    body.light {{
      --bg: #f1f5f9;
      --bg-gradient: radial-gradient(circle at 50% 0%, #e0f2fe 0%, #f1f5f9 70%);
      --bg-card: rgba(255, 255, 255, 0.88);
      --bg-card-hover: #ffffff;
      --bg-glass: rgba(255, 255, 255, 0.9);
      --text: #0f172a;
      --text-muted: #64748b;
      --primary: #2563eb;
      --primary-gradient: linear-gradient(135deg, #2563eb 0%, #4f46e5 100%);
      --accent: #d97706;
      --accent-gradient: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
      --border: rgba(0, 0, 0, 0.08);
      --border-focus: rgba(37, 99, 235, 0.4);
      --chip-bg: rgba(0, 0, 0, 0.05);
      --chip-active: linear-gradient(135deg, #2563eb, #1d4ed8);
      --callout-bg: rgba(239, 246, 255, 0.9);
      --callout-border: rgba(59, 130, 246, 0.3);
      --shadow-sm: 0 4px 12px rgba(0, 0, 0, 0.06);
      --shadow-lg: 0 12px 32px rgba(0, 0, 0, 0.12);
    }}

    body.sepia {{
      --bg: #f7f1e5;
      --bg-gradient: radial-gradient(circle at 50% 0%, #fef3c7 0%, #f7f1e5 70%);
      --bg-card: rgba(255, 251, 245, 0.9);
      --bg-card-hover: #ffffff;
      --bg-glass: rgba(247, 241, 229, 0.92);
      --text: #382816;
      --text-muted: #826c55;
      --primary: #b45309;
      --primary-gradient: linear-gradient(135deg, #d97706 0%, #b45309 100%);
      --accent: #b45309;
      --accent-gradient: linear-gradient(135deg, #d97706 0%, #b45309 100%);
      --border: rgba(130, 108, 85, 0.15);
      --border-focus: rgba(180, 83, 9, 0.4);
      --chip-bg: rgba(130, 108, 85, 0.08);
      --chip-active: linear-gradient(135deg, #b45309, #92400e);
      --callout-bg: rgba(254, 243, 199, 0.75);
      --callout-border: rgba(180, 83, 9, 0.3);
      --shadow-sm: 0 4px 12px rgba(60, 40, 20, 0.06);
      --shadow-lg: 0 12px 32px rgba(60, 40, 20, 0.12);
    }}

    * {{ box-sizing: border-box; -webkit-tap-highlight-color: transparent; margin: 0; padding: 0; }}
    body {{
      font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      background: var(--bg);
      background-image: var(--bg-gradient);
      background-attachment: fixed;
      color: var(--text);
      display: flex;
      flex-direction: column;
      height: 100vh;
      overflow: hidden;
      font-size: calc(16px * var(--font-scale));
      user-select: none;
      -webkit-font-smoothing: antialiased;
    }}

    /* Top Glass Header */
    header {{
      background: var(--bg-glass);
      backdrop-filter: blur(20px);
      -webkit-backdrop-filter: blur(20px);
      border-bottom: 1px solid var(--border);
      padding: 10px 16px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      flex-shrink: 0;
      box-shadow: var(--shadow-sm);
      z-index: 30;
      transition: background 0.3s, border-color 0.3s;
    }}
    .header-left {{
      display: flex;
      align-items: center;
      gap: 12px;
    }}
    .header-logo-icon {{
      width: 44px;
      height: 44px;
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
      background: rgba(255, 255, 255, 0.04);
      border: 1px solid var(--border);
      padding: 2px;
    }}
    .header-logo-icon img {{
      width: 100%;
      height: 100%;
      object-fit: contain;
      border-radius: 10px;
    }}
    .header-text {{ display: flex; flex-direction: column; }}
    .header-title {{
      font-size: 1.12rem;
      font-weight: 800;
      display: flex;
      align-items: center;
      gap: 8px;
      letter-spacing: -0.3px;
    }}
    .badge-improved {{
      background: var(--accent-gradient);
      color: #000;
      font-size: 0.65rem;
      font-weight: 800;
      padding: 3px 8px;
      border-radius: 999px;
      text-transform: uppercase;
      letter-spacing: 0.8px;
      box-shadow: 0 2px 8px rgba(245, 158, 11, 0.35);
      display: inline-flex;
      align-items: center;
      gap: 3px;
    }}
    .header-sub {{
      font-size: 0.72rem;
      font-weight: 500;
      color: var(--text-muted);
    }}
    .header-actions {{
      display: flex;
      align-items: center;
      gap: 6px;
    }}
    .pill-btn-group {{
      display: flex;
      background: var(--chip-bg);
      border: 1px solid var(--border);
      border-radius: 10px;
      padding: 2px;
    }}
    .action-pill-btn {{
      background: transparent;
      border: none;
      color: var(--text);
      font-weight: 700;
      font-size: 0.8rem;
      padding: 6px 10px;
      border-radius: 8px;
      cursor: pointer;
      transition: background 0.15s, transform 0.1s;
    }}
    .action-pill-btn:active {{
      background: rgba(255, 255, 255, 0.1);
      transform: scale(0.95);
    }}
    .theme-round-btn {{
      width: 36px;
      height: 36px;
      border-radius: 50%;
      background: var(--chip-bg);
      border: 1px solid var(--border);
      color: var(--text);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1rem;
      cursor: pointer;
      transition: transform 0.2s, background 0.2s;
    }}
    .theme-round-btn:active {{
      transform: scale(0.9) rotate(20deg);
    }}

    /* Main Scroll Area */
    main {{
      flex: 1;
      overflow-y: auto;
      padding: 16px;
      padding-bottom: 95px; /* space for floating nav */
      -webkit-overflow-scrolling: touch;
    }}

    /* Floating Modern Dock Navigation */
    nav.bottom-nav {{
      position: fixed;
      bottom: 14px;
      left: 16px;
      right: 16px;
      height: var(--nav-height);
      background: var(--bg-glass);
      backdrop-filter: blur(24px);
      -webkit-backdrop-filter: blur(24px);
      border: 1px solid var(--border);
      border-radius: 24px;
      display: flex;
      justify-content: space-around;
      align-items: center;
      padding: 0 8px;
      box-shadow: var(--shadow-lg);
      z-index: 40;
    }}
    .nav-item {{
      flex: 1;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 4px;
      color: var(--text-muted);
      cursor: pointer;
      font-size: 0.72rem;
      font-weight: 600;
      transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
      height: 48px;
      border-radius: 16px;
      position: relative;
    }}
    .nav-item.active {{
      color: #fff;
      background: var(--chip-active);
      box-shadow: 0 4px 14px rgba(37, 99, 235, 0.35);
    }}
    body.light .nav-item.active {{ color: #fff; }}
    .nav-icon {{ font-size: 1.25rem; line-height: 1; }}

    /* Views */
    .view {{ display: none; }}
    .view.active {{ display: block; animation: fadeIn 0.2s ease-out; }}
    @keyframes fadeIn {{
      from {{ opacity: 0; transform: translateY(6px); }}
      to {{ opacity: 1; transform: translateY(0); }}
    }}

    /* Modern Search & Filter */
    .search-wrapper {{
      position: relative;
      margin-bottom: 14px;
    }}
    .search-icon-inside {{
      position: absolute;
      left: 14px;
      top: 50%;
      transform: translateY(-50%);
      font-size: 1.05rem;
      color: var(--text-muted);
      pointer-events: none;
    }}
    .search-input {{
      width: 100%;
      background: var(--bg-card);
      border: 1px solid var(--border);
      color: var(--text);
      padding: 13px 16px 13px 42px;
      border-radius: 16px;
      font-size: 0.95rem;
      font-family: inherit;
      outline: none;
      box-shadow: var(--shadow-sm);
      transition: all 0.2s;
    }}
    .search-input:focus {{
      border-color: var(--primary);
      box-shadow: 0 0 0 3px var(--border-focus);
    }}
    .clear-search-btn {{
      position: absolute;
      right: 14px;
      top: 50%;
      transform: translateY(-50%);
      background: transparent;
      border: none;
      color: var(--text-muted);
      font-size: 1rem;
      cursor: pointer;
      display: none;
    }}

    /* Filter Chips */
    .filter-bar {{
      display: flex;
      gap: 8px;
      margin-bottom: 16px;
      overflow-x: auto;
      padding-bottom: 4px;
      scrollbar-width: none;
    }}
    .filter-bar::-webkit-scrollbar {{ display: none; }}
    .filter-chip {{
      background: var(--chip-bg);
      border: 1px solid var(--border);
      color: var(--text-muted);
      padding: 8px 18px;
      border-radius: 999px;
      font-size: 0.85rem;
      font-weight: 700;
      font-family: inherit;
      cursor: pointer;
      white-space: nowrap;
      transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
    }}
    .filter-chip.active {{
      background: var(--chip-active);
      color: #fff;
      border-color: transparent;
      box-shadow: 0 3px 12px rgba(37, 99, 235, 0.3);
    }}

    /* Cards */
    .item-card {{
      background: var(--bg-card);
      backdrop-filter: blur(12px);
      -webkit-backdrop-filter: blur(12px);
      border: 1px solid var(--border);
      border-radius: 18px;
      padding: 14px 16px;
      margin-bottom: 12px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      cursor: pointer;
      box-shadow: var(--shadow-sm);
      transition: transform 0.15s, background 0.15s, border-color 0.15s;
    }}
    .item-card:active {{
      background: var(--bg-card-hover);
      transform: scale(0.985);
      border-color: var(--primary);
    }}
    .item-left {{ display: flex; align-items: center; gap: 14px; flex: 1; }}
    .item-badge {{
      background: var(--chip-bg);
      border: 1px solid var(--border);
      color: var(--primary);
      font-weight: 800;
      font-size: 0.88rem;
      width: 48px;
      height: 48px;
      border-radius: 14px;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
      letter-spacing: -0.2px;
    }}
    .badge-coro {{ color: #f59e0b; }}
    .item-info {{ display: flex; flex-direction: column; gap: 3px; flex: 1; }}
    .item-title {{
      font-weight: 700;
      font-size: 1.02rem;
      line-height: 1.3;
      letter-spacing: -0.2px;
    }}
    .item-preview {{
      font-size: 0.82rem;
      color: var(--text-muted);
      line-height: 1.35;
      display: -webkit-box;
      -webkit-line-clamp: 1;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }}
    .fav-btn {{
      font-size: 1.35rem;
      color: var(--text-muted);
      padding: 10px;
      cursor: pointer;
      border-radius: 50%;
      transition: transform 0.2s cubic-bezier(0.34, 1.56, 0.64, 1), color 0.2s;
    }}
    .fav-btn.is-fav {{
      color: var(--accent);
      filter: drop-shadow(0 0 6px rgba(245, 158, 11, 0.5));
    }}
    .fav-btn:active {{ transform: scale(1.35); }}

    /* Detail Modal (Hymn Full Reader) */
    .modal-overlay {{
      position: fixed;
      top: 0; left: 0; right: 0; bottom: 0;
      background: rgba(0, 0, 0, 0.75);
      backdrop-filter: blur(10px);
      -webkit-backdrop-filter: blur(10px);
      z-index: 100;
      display: none;
      align-items: flex-end;
    }}
    .modal-overlay.open {{ display: flex; }}
    .modal-content {{
      background: var(--bg);
      background-image: var(--bg-gradient);
      width: 100%;
      max-height: 92vh;
      border-radius: 28px 28px 0 0;
      border-top: 1px solid var(--border);
      display: flex;
      flex-direction: column;
      overflow: hidden;
      box-shadow: 0 -8px 40px rgba(0,0,0,0.6);
      animation: sheetUp 0.25s cubic-bezier(0.16, 1, 0.3, 1);
    }}
    @keyframes sheetUp {{
      from {{ transform: translateY(100%); }}
      to {{ transform: translateY(0); }}
    }}
    .modal-handle-bar {{
      width: 38px;
      height: 4px;
      background: rgba(255,255,255,0.2);
      border-radius: 999px;
      margin: 10px auto 4px auto;
    }}
    .modal-header {{
      padding: 14px 20px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      border-bottom: 1px solid var(--border);
    }}
    .modal-header-left {{
      display: flex;
      align-items: center;
      gap: 12px;
      flex: 1;
    }}
    .modal-song-badge {{
      background: var(--chip-active);
      color: #fff;
      font-weight: 800;
      font-size: 0.85rem;
      padding: 4px 12px;
      border-radius: 999px;
    }}
    .modal-title {{
      font-size: 1.15rem;
      font-weight: 800;
      letter-spacing: -0.3px;
    }}
    .modal-close-btn {{
      width: 36px;
      height: 36px;
      border-radius: 50%;
      background: var(--chip-bg);
      border: 1px solid var(--border);
      color: var(--text);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.2rem;
      cursor: pointer;
    }}
    .modal-body {{
      padding: 22px 24px;
      overflow-y: auto;
      flex: 1;
      font-size: calc(1.18rem * var(--font-scale));
      line-height: 1.85;
      text-align: center;
    }}
    .stanza {{
      margin-bottom: 24px;
      white-space: pre-line;
      color: var(--text);
    }}
    .coro-stanza {{
      background: var(--callout-bg);
      border: 1px solid var(--callout-border);
      border-radius: 18px;
      padding: 16px;
      margin: 20px 0;
      font-weight: 600;
      color: var(--primary);
    }}
    .modal-footer {{
      padding: 12px 20px;
      border-top: 1px solid var(--border);
      display: flex;
      justify-content: space-between;
      align-items: center;
      background: var(--bg-glass);
    }}
    .modal-nav-btn {{
      background: var(--chip-bg);
      border: 1px solid var(--border);
      color: var(--text);
      padding: 10px 18px;
      border-radius: 12px;
      font-weight: 700;
      font-size: 0.88rem;
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: 6px;
    }}
    .modal-nav-btn:active {{
      background: var(--chip-active);
      color: #fff;
    }}

    /* Bible View */
    .bible-selector-card {{
      background: var(--bg-card);
      border: 1px solid var(--border);
      border-radius: 20px;
      padding: 16px;
      margin-bottom: 16px;
      display: flex;
      gap: 12px;
    }}
    .selector-btn {{
      flex: 1;
      background: var(--chip-bg);
      border: 1px solid var(--border);
      color: var(--text);
      padding: 14px 16px;
      border-radius: 18px;
      font-size: 1rem;
      font-weight: 800;
      font-family: inherit;
      display: flex;
      align-items: center;
      justify-content: space-between;
      cursor: pointer;
      box-shadow: var(--shadow-sm);
      transition: all 0.2s;
    }}
    .selector-btn:active {{
      transform: scale(0.98);
      border-color: var(--primary);
    }}
    .chapter-nav-bar {{
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 12px 16px;
      margin-bottom: 16px;
      background: var(--bg-card);
      border: 1px solid var(--border);
      border-radius: 16px;
    }}
    .bible-heading {{
      font-family: 'Playfair Display', Georgia, serif;
      font-size: 1.35rem;
      font-weight: 700;
      color: var(--text);
      letter-spacing: -0.2px;
    }}
    .verse-list {{
      display: flex;
      flex-direction: column;
      gap: 12px;
      user-select: text;
    }}
    
    /* Section Headings (Perícopas Reina Valera) */
    .verse-section-title {{
      font-family: 'Playfair Display', Georgia, serif;
      font-size: 1.15rem;
      font-weight: 700;
      color: var(--accent);
      margin-top: 24px;
      margin-bottom: 6px;
      padding-bottom: 6px;
      border-bottom: 1px solid var(--border);
      letter-spacing: -0.2px;
    }}
    .verse-section-title:first-child {{
      margin-top: 4px;
    }}

    .verse-item {{
      line-height: 1.72;
      font-size: calc(1.08rem * var(--font-scale));
      padding: 10px 14px;
      border-radius: 12px;
      cursor: pointer;
      transition: background 0.15s, border-left 0.15s;
    }}
    .verse-item:active {{
      background: var(--bg-card);
    }}
    .verse-num {{
      color: var(--primary);
      font-weight: 800;
      font-size: 0.82rem;
      margin-right: 8px;
      background: var(--chip-bg);
      border: 1px solid var(--border);
      padding: 2px 7px;
      border-radius: 6px;
      display: inline-block;
      vertical-align: baseline;
    }}
    .verse-item.saved {{
      background: rgba(251, 191, 36, 0.12);
      border-left: 4px solid var(--accent);
      padding-left: 12px;
      box-shadow: var(--shadow-sm);
    }}

    /* Grids for Book and Chapter Selection */
    .grid-books {{
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(105px, 1fr));
      gap: 10px;
      margin-top: 14px;
    }}
    .book-btn {{
      background: var(--chip-bg);
      border: 1px solid var(--border);
      color: var(--text);
      padding: 12px 6px;
      border-radius: 12px;
      font-size: 0.88rem;
      font-weight: 700;
      text-align: center;
      cursor: pointer;
      transition: all 0.15s;
    }}
    .book-btn:active {{
      background: var(--primary-gradient);
      color: #fff;
      transform: scale(0.95);
    }}
    .grid-chapters {{
      display: grid;
      grid-template-columns: repeat(6, 1fr);
      gap: 10px;
      margin-top: 14px;
    }}
    .chapter-btn {{
      background: var(--chip-bg);
      border: 1px solid var(--border);
      color: var(--text);
      padding: 14px 4px;
      border-radius: 14px;
      font-size: 1rem;
      font-weight: 800;
      text-align: center;
      cursor: pointer;
      transition: all 0.15s;
    }}
    .chapter-btn:active {{
      background: var(--primary-gradient);
      color: #fff;
      transform: scale(0.95);
    }}

    /* Settings Components */
    .settings-group {{
      background: var(--bg-card);
      backdrop-filter: blur(12px);
      border: 1px solid var(--border);
      border-radius: 20px;
      padding: 20px;
      margin-bottom: 18px;
      box-shadow: var(--shadow-sm);
    }}
    .settings-title {{
      font-size: 0.8rem;
      text-transform: uppercase;
      letter-spacing: 0.8px;
      color: var(--text-muted);
      margin-bottom: 14px;
      font-weight: 800;
    }}
    .theme-picker {{
      display: flex;
      gap: 10px;
    }}
    .theme-card {{
      flex: 1;
      padding: 16px 8px;
      border-radius: 14px;
      border: 2px solid var(--border);
      text-align: center;
      font-weight: 800;
      font-size: 0.9rem;
      cursor: pointer;
      transition: all 0.2s;
    }}
    .theme-card.active {{
      border-color: var(--primary);
      background: var(--chip-bg);
      box-shadow: 0 4px 14px rgba(56, 189, 248, 0.2);
    }}
    .font-size-row {{
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-top: 10px;
    }}

    /* Floating Toast */
    .toast {{
      position: fixed;
      bottom: 90px;
      left: 50%;
      transform: translateX(-50%);
      background: rgba(15, 23, 42, 0.94);
      backdrop-filter: blur(12px);
      border: 1px solid var(--border);
      color: #fff;
      padding: 10px 22px;
      border-radius: 999px;
      font-size: 0.88rem;
      font-weight: 700;
      z-index: 200;
      display: none;
      box-shadow: var(--shadow-lg);
      animation: popToast 0.2s ease-out;
      white-space: nowrap;
    }}
    @keyframes popToast {{
      from {{ transform: translate(-50%, 10px); opacity: 0; }}
      to {{ transform: translate(-50%, 0); opacity: 1; }}
    }}
    .empty-state {{
      text-align: center;
      padding: 50px 20px;
      color: var(--text-muted);
    }}
    .empty-icon {{ font-size: 3.5rem; margin-bottom: 12px; }}
  </style>
</head>
<body class="dark">

  <!-- Header -->
  <header>
    <div class="header-left">
      <div class="header-logo-icon">
        <img src="data:image/png;base64,{logo_base64}" alt="IDMJI">
      </div>
      <div class="header-text">
        <div class="header-title">
          Himnario IDMJI
          <span class="badge-improved">✨ MEJORADA</span>
        </div>
        <div class="header-sub">Coros, Himnos &amp; Santa Biblia</div>
      </div>
    </div>
    <div class="header-actions">
      <div class="pill-btn-group">
        <button class="action-pill-btn" onclick="adjustFontSize(-0.1)">A-</button>
        <button class="action-pill-btn" onclick="adjustFontSize(0.1)">A+</button>
      </div>
      <button class="theme-round-btn" id="quickThemeBtn" onclick="cycleTheme()" title="Cambiar tema">🌙</button>
    </div>
  </header>

  <!-- Main Scrollable Content Area -->
  <main>
    <!-- View 1: Himnos -->
    <section id="viewHimnos" class="view active">
      <div class="search-wrapper">
        <span class="search-icon-inside">🔍</span>
        <input type="text" id="searchHimnos" class="search-input" placeholder="Buscar himno por número, título o letra..." oninput="onSearchInput('himnos')">
        <button id="clearSearchHimnos" class="clear-search-btn" onclick="clearSearch('himnos')">✕</button>
      </div>
      <div class="filter-bar">
        <button class="filter-chip active" id="chipHimnosAll" onclick="setFilter('himnos', 'all', this)">Todos (<span id="countHimnos">0</span>)</button>
        <button class="filter-chip" onclick="setFilter('himnos', 'favs', this)">⭐ Favoritos</button>
      </div>
      <div id="himnosListContainer"></div>
    </section>

    <!-- View 2: Coros -->
    <section id="viewCoros" class="view">
      <div class="search-wrapper">
        <span class="search-icon-inside">🔍</span>
        <input type="text" id="searchCoros" class="search-input" placeholder="Buscar coro por número, título o letra..." oninput="onSearchInput('coros')">
        <button id="clearSearchCoros" class="clear-search-btn" onclick="clearSearch('coros')">✕</button>
      </div>
      <div class="filter-bar">
        <button class="filter-chip active" id="chipCorosAll" onclick="setFilter('coros', 'all', this)">Todos (<span id="countCoros">0</span>)</button>
        <button class="filter-chip" onclick="setFilter('coros', 'favs', this)">⭐ Favoritos</button>
      </div>
      <div id="corosListContainer"></div>
    </section>

    <!-- View 3: Santa Biblia Reina Valera 1960 -->
    <section id="viewBiblia" class="view">
      <div class="bible-selector-card">
        <button class="selector-btn" onclick="openBookPicker()">
          <span id="currentBookName">Génesis</span>
          <span style="font-size: 0.8rem; color: var(--primary);">▼</span>
        </button>
        <button class="selector-btn" style="flex: 0 0 110px;" onclick="openChapterPicker()">
          <span>Cap. <span id="currentChapterNum">1</span></span>
          <span style="font-size: 0.8rem; color: var(--primary);">▼</span>
        </button>
      </div>
      
      <div class="chapter-nav-bar">
        <button class="modal-nav-btn" onclick="navigateChapter(-1)">‹ Anterior</button>
        <div class="bible-heading" id="navRefLabel">Génesis 1</div>
        <button class="modal-nav-btn" onclick="navigateChapter(1)">Siguiente ›</button>
      </div>

      <div class="verse-list" id="verseListContainer"></div>
    </section>

    <!-- View 4: Favoritos -->
    <section id="viewFavoritos" class="view">
      <div class="filter-bar">
        <button class="filter-chip active" onclick="setFavTab('alabanzas', this)">Alabanzas (⭐ <span id="favSongCount">0</span>)</button>
        <button class="filter-chip" onclick="setFavTab('versiculos', this)">Versículos Señalados (📖 <span id="favVerseCount">0</span>)</button>
      </div>
      <div id="favListContainer"></div>
    </section>

    <!-- View 5: Ajustes -->
    <section id="viewAjustes" class="view">
      <div class="settings-group">
        <div class="settings-title">Tema Visual</div>
        <div class="theme-picker">
          <div class="theme-card active" id="themeDark" onclick="setTheme('dark')">Oscuro 🌙</div>
          <div class="theme-card" id="themeLight" onclick="setTheme('light')">Claro ☀️</div>
          <div class="theme-card" id="themeSepia" onclick="setTheme('sepia')">Sepia 📜</div>
        </div>
      </div>

      <div class="settings-group">
        <div class="settings-title">Tamaño de Texto</div>
        <div class="font-size-row">
          <button class="modal-nav-btn" onclick="adjustFontSize(-0.1)">Reducir A-</button>
          <span id="fontSizeDisplay" style="font-weight: 800; color: var(--primary);">100%</span>
          <button class="modal-nav-btn" onclick="adjustFontSize(0.1)">Aumentar A+</button>
        </div>
      </div>

      <div class="settings-group">
        <div class="settings-title">Acerca de la App</div>
        <div style="font-size: 0.95rem; line-height: 1.6; color: var(--text-muted);">
          <strong style="color: var(--text);">Himnario IDMJI &amp; Santa Biblia (App Mejorada)</strong><br>
          • 398 Himnos oficiales completos de la IDMJI<br>
          • 254 Coros oficiales completos de la IDMJI<br>
          • Santa Biblia Reina Valera 1960 con Títulos de sección (Perícopas)<br>
          • Señalador de versículos sin interrupciones<br>
          • Funciona 100% sin conexión a internet (Offline).
        </div>
      </div>
    </section>
  </main>

  <!-- Bottom Navigation Dock -->
  <nav class="bottom-nav">
    <div class="nav-item active" onclick="switchView('viewHimnos', this)">
      <span class="nav-icon">🎵</span>
      <span>Himnos</span>
    </div>
    <div class="nav-item" onclick="switchView('viewCoros', this)">
      <span class="nav-icon">🎶</span>
      <span>Coros</span>
    </div>
    <div class="nav-item" onclick="switchView('viewBiblia', this)">
      <span class="nav-icon">📖</span>
      <span>Biblia</span>
    </div>
    <div class="nav-item" onclick="switchView('viewFavoritos', this)">
      <span class="nav-icon">⭐</span>
      <span>Favoritos</span>
    </div>
    <div class="nav-item" onclick="switchView('viewAjustes', this)">
      <span class="nav-icon">⚙️</span>
      <span>Ajustes</span>
    </div>
  </nav>

  <!-- Modal for Song Lyrics (Fullscreen Reader) -->
  <div class="modal-overlay" id="hymnModal" onclick="closeHymnModal(event)">
    <div class="modal-content">
      <div class="modal-handle-bar"></div>
      <div class="modal-header">
        <div class="modal-header-left">
          <span class="modal-song-badge" id="modalSongBadge">H-1</span>
          <span class="modal-title" id="modalSongTitle">Título de la Alabanza</span>
        </div>
        <div style="display: flex; align-items: center; gap: 8px;">
          <span class="fav-btn" id="modalFavBtn" onclick="toggleModalFav()">⭐</span>
          <button class="modal-close-btn" onclick="closeHymnModalDirect()">✕</button>
        </div>
      </div>
      <div class="modal-body" id="modalSongBody"></div>
      <div class="modal-footer">
        <button class="modal-nav-btn" onclick="navigateModalSong(-1)">‹ Anterior</button>
        <button class="modal-nav-btn" onclick="navigateModalSong(1)">Siguiente ›</button>
      </div>
    </div>
  </div>

  <!-- Modal for Book Picker -->
  <div class="modal-overlay" id="bookModal" onclick="closeBookModal(event)">
    <div class="modal-content" style="max-height: 80vh;">
      <div class="modal-handle-bar"></div>
      <div class="modal-header">
        <div class="modal-title">Libros de la Biblia</div>
        <button class="modal-close-btn" onclick="closeBookModalDirect()">✕</button>
      </div>
      <div style="padding: 12px 20px 0 20px;">
        <div class="filter-bar" style="margin-bottom: 0;">
          <button class="filter-chip active" id="btnOT" onclick="filterTestament('OT')">Antiguo Testamento (39)</button>
          <button class="filter-chip" id="btnNT" onclick="filterTestament('NT')">Nuevo Testamento (27)</button>
        </div>
      </div>
      <div class="modal-body" style="padding: 16px 20px;" id="booksGrid" class="grid-books"></div>
    </div>
  </div>

  <!-- Modal for Chapter Picker -->
  <div class="modal-overlay" id="chapterModal" onclick="closeChapterModal(event)">
    <div class="modal-content" style="max-height: 70vh;">
      <div class="modal-handle-bar"></div>
      <div class="modal-header">
        <div class="modal-title" id="chapterModalTitle">Capítulos</div>
        <button class="modal-close-btn" onclick="closeChapterModalDirect()">✕</button>
      </div>
      <div class="modal-body" style="padding: 16px 20px;" id="chaptersGrid" class="grid-chapters"></div>
    </div>
  </div>

  <!-- Toast Notification -->
  <div class="toast" id="toast"></div>

  <!-- External Data Scripts (Fast & Offline) -->
  <script src="himnos_data.js"></script>
  <script src="coros_data.js"></script>
  <script src="biblia_data.js"></script>

  <!-- Application Logic -->
  <script>
    // State
    let ALL_SONGS = [];
    let currentView = 'viewHimnos';
    let currentTheme = localStorage.getItem('theme') || 'dark';
    let fontScale = parseFloat(localStorage.getItem('fontScale')) || 1.0;
    let favSongIds = new Set(JSON.parse(localStorage.getItem('favSongIds') || '[]'));
    let favVerses = JSON.parse(localStorage.getItem('favVerses') || '[]');

    let currentBookIndex = parseInt(localStorage.getItem('currentBookIndex')) || 0;
    let currentChapterIndex = parseInt(localStorage.getItem('currentChapterIndex')) || 0;
    let currentSongInModal = null;
    let currentFavTab = 'alabanzas';

    function init() {{
      applyTheme(currentTheme);
      applyFontScale();

      // Combine songs with quick lookup
      ALL_SONGS = [...HIMNOS_DATA, ...COROS_DATA];
      document.getElementById('countHimnos').innerText = HIMNOS_DATA.length;
      document.getElementById('countCoros').innerText = COROS_DATA.length;

      renderSongList('himnos', HIMNOS_DATA);
      renderSongList('coros', COROS_DATA);
      renderBibleChapter();
      updateFavCounters();
    }}

    // Theme Management
    function setTheme(theme) {{
      currentTheme = theme;
      localStorage.setItem('theme', theme);
      applyTheme(theme);
    }}
    function applyTheme(theme) {{
      document.body.className = theme;
      document.querySelectorAll('.theme-card').forEach(c => c.classList.remove('active'));
      const activeCard = document.getElementById('theme' + theme.charAt(0).toUpperCase() + theme.slice(1));
      if (activeCard) activeCard.classList.add('active');
      const icons = {{ 'dark': '🌙', 'light': '☀️', 'sepia': '📜' }};
      document.getElementById('quickThemeBtn').innerText = icons[theme] || '🌙';
    }}
    function cycleTheme() {{
      const themes = ['dark', 'light', 'sepia'];
      let next = themes[(themes.indexOf(currentTheme) + 1) % themes.length];
      setTheme(next);
      const themeNames = {{ 'dark': 'Oscuro', 'light': 'Claro', 'sepia': 'Sepia' }};
      showToast('Tema: ' + themeNames[next]);
    }}

    // Font Size Scaling
    function adjustFontSize(delta) {{
      fontScale = Math.min(1.5, Math.max(0.8, fontScale + delta));
      localStorage.setItem('fontScale', fontScale.toFixed(2));
      applyFontScale();
    }}
    function applyFontScale() {{
      document.documentElement.style.setProperty('--font-scale', fontScale);
      const disp = document.getElementById('fontSizeDisplay');
      if (disp) disp.innerText = Math.round(fontScale * 100) + '%';
    }}

    // Toast Notification
    let toastTimer = null;
    function showToast(msg) {{
      const t = document.getElementById('toast');
      t.innerText = msg;
      t.style.display = 'block';
      clearTimeout(toastTimer);
      toastTimer = setTimeout(() => {{ t.style.display = 'none'; }}, 2200);
    }}

    // View Switching
    function switchView(viewId, navEl) {{
      document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
      document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
      document.getElementById(viewId).classList.add('active');
      if (navEl) navEl.classList.add('active');
      currentView = viewId;
      document.querySelector('main').scrollTop = 0;

      if (viewId === 'viewFavoritos') renderFavorites();
    }}

    // Rendering Songs
    function renderSongList(type, list) {{
      const container = document.getElementById(type + 'ListContainer');
      if (!list || list.length === 0) {{
        container.innerHTML = '<div class="empty-state"><div class="empty-icon">🔍</div><p>No se encontraron alabanzas con ese criterio.</p></div>';
        return;
      }}

      const html = list.map(item => {{
        const isFav = favSongIds.has(item.id);
        const prefix = item.type === 'himno' ? 'H' : 'C';
        const isCoro = item.type === 'coro';
        const preview = item.stanzas[0] ? item.stanzas[0].replace('CORO:', '').replace(/\\n/g, ' ').trim() : '';

        return `
          <div class="item-card" onclick="openHymnModal('${{item.id}}')">
            <div class="item-left">
              <div class="item-badge ${{isCoro ? 'badge-coro' : ''}}">${{prefix}}-${{item.num}}</div>
              <div class="item-info">
                <div class="item-title">${{item.title}}</div>
                <div class="item-preview">${{preview}}</div>
              </div>
            </div>
            <div class="fav-btn ${{isFav ? 'is-fav' : ''}}" onclick="toggleFavSong('${{item.id}}', event)">⭐</div>
          </div>
        `;
      }}).join('');

      container.innerHTML = html;
    }}

    // Search and Filters
    function onSearchInput(type) {{
      const input = document.getElementById('search' + type.charAt(0).toUpperCase() + type.slice(1));
      const clearBtn = document.getElementById('clearSearch' + type.charAt(0).toUpperCase() + type.slice(1));
      const val = input.value.trim().toLowerCase();
      clearBtn.style.display = val ? 'block' : 'none';

      const baseList = type === 'himnos' ? HIMNOS_DATA : COROS_DATA;
      if (!val) {{
        renderSongList(type, baseList);
        return;
      }}

      // Match number directly or text
      const filtered = baseList.filter(item => {{
        if (item.num.toString() === val || `${{item.type[0]}}${{item.num}}`.toLowerCase() === val || `${{item.type[0]}}-${{item.num}}`.toLowerCase() === val) {{
          return true;
        }}
        return item.title.toLowerCase().includes(val) || item.full_text.toLowerCase().includes(val);
      }});

      renderSongList(type, filtered);
    }}

    function clearSearch(type) {{
      const input = document.getElementById('search' + type.charAt(0).toUpperCase() + type.slice(1));
      input.value = '';
      onSearchInput(type);
    }}

    function setFilter(type, filter, el) {{
      document.querySelectorAll(`#view${{type.charAt(0).toUpperCase() + type.slice(1)}} .filter-chip`).forEach(c => c.classList.remove('active'));
      el.classList.add('active');
      const baseList = type === 'himnos' ? HIMNOS_DATA : COROS_DATA;
      if (filter === 'all') {{
        renderSongList(type, baseList);
      }} else if (filter === 'favs') {{
        renderSongList(type, baseList.filter(s => favSongIds.has(s.id)));
      }}
    }}

    // Song Modal Actions
    function openHymnModal(songId) {{
      const song = ALL_SONGS.find(s => s.id === songId);
      if (!song) return;
      currentSongInModal = song;

      const isCoro = song.type === 'coro';
      const prefix = isCoro ? 'C' : 'H';
      document.getElementById('modalSongBadge').innerText = `${{prefix}}-${{song.num}}`;
      document.getElementById('modalSongBadge').style.background = isCoro ? 'linear-gradient(135deg, #d97706, #b45309)' : 'var(--chip-active)';
      document.getElementById('modalSongTitle').innerText = song.title;

      const favBtn = document.getElementById('modalFavBtn');
      favBtn.classList.toggle('is-fav', favSongIds.has(song.id));

      const body = document.getElementById('modalSongBody');
      body.innerHTML = song.stanzas.map(st => {{
        const isCoroStanza = st.startsWith('CORO') || st.includes('CORO:');
        return `<div class="stanza ${{isCoroStanza ? 'coro-stanza' : ''}}">${{st}}</div>`;
      }}).join('');

      document.getElementById('hymnModal').classList.add('open');
      body.scrollTop = 0;
    }}

    function closeHymnModal(e) {{
      if (e.target.id === 'hymnModal') closeHymnModalDirect();
    }}
    function closeHymnModalDirect() {{
      document.getElementById('hymnModal').classList.remove('open');
      currentSongInModal = null;
    }}

    function navigateModalSong(dir) {{
      if (!currentSongInModal) return;
      const list = currentSongInModal.type === 'himno' ? HIMNOS_DATA : COROS_DATA;
      const idx = list.findIndex(s => s.id === currentSongInModal.id);
      const nextIdx = idx + dir;
      if (nextIdx >= 0 && nextIdx < list.length) {{
        openHymnModal(list[nextIdx].id);
      }}
    }}

    function toggleModalFav() {{
      if (!currentSongInModal) return;
      toggleFavSong(currentSongInModal.id);
      document.getElementById('modalFavBtn').classList.toggle('is-fav', favSongIds.has(currentSongInModal.id));
    }}

    function toggleFavSong(id, event) {{
      if (event) event.stopPropagation();
      if (favSongIds.has(id)) {{
        favSongIds.delete(id);
        showToast('Eliminado de Favoritos');
      }} else {{
        favSongIds.add(id);
        showToast('⭐ Guardado en Favoritos');
      }}
      localStorage.setItem('favSongIds', JSON.stringify([...favSongIds]));
      updateFavCounters();

      // Update visible star if in list
      document.querySelectorAll(`.item-card`).forEach(card => {{
        if (card.onclick && card.onclick.toString().includes(id)) {{
          const star = card.querySelector('.fav-btn');
          if (star) star.classList.toggle('is-fav', favSongIds.has(id));
        }}
      }});
    }}

    function updateFavCounters() {{
      document.getElementById('favSongCount').innerText = favSongIds.size;
      document.getElementById('favVerseCount').innerText = favVerses.length;
    }}

    // ==========================================
    // SANTA BIBLIA REINA VALERA 1960
    // ==========================================
    function renderBibleChapter() {{
      const book = BIBLIA[currentBookIndex];
      const chapters = book.chapters;
      if (currentChapterIndex >= chapters.length) currentChapterIndex = 0;
      const verses = chapters[currentChapterIndex];

      document.getElementById('currentBookName').innerText = book.name;
      document.getElementById('currentChapterNum').innerText = (currentChapterIndex + 1);
      document.getElementById('navRefLabel').innerText = `${{book.name}} ${{currentChapterIndex + 1}}`;

      const container = document.getElementById('verseListContainer');
      let html = '';
      for (let i = 0; i < verses.length; i++) {{
        const item = verses[i];
        const vNum = item.v;
        const text = item.t;
        const heading = item.h;
        const ref = `${{book.name}} ${{currentChapterIndex + 1}}:${{vNum}}`;
        const isSaved = favVerses.some(fv => fv.ref === ref);

        // Section Title / Perícope
        if (heading) {{
          html += `<div class="verse-section-title">${{heading}}</div>`;
        }}

        // Verse row: Pass 'this' so we toggle class directly without page scroll jump!
        const escapedText = text.replace(/'/g, "\\\\'");
        html += `
          <div class="verse-item ${{isSaved ? 'saved' : ''}}" onclick="promptVerseAction(this, '${{ref}}', '${{escapedText}}')">
            <span class="verse-num">${{vNum}}</span>${{text}}
          </div>
        `;
      }}
      container.innerHTML = html;
      localStorage.setItem('currentBookIndex', currentBookIndex);
      localStorage.setItem('currentChapterIndex', currentChapterIndex);
    }}

    // When chapter or book changes, scroll to top
    function navigateChapter(dir) {{
      const book = BIBLIA[currentBookIndex];
      let newChap = currentChapterIndex + dir;
      if (newChap >= 0 && newChap < book.chapters.length) {{
        currentChapterIndex = newChap;
        renderBibleChapter();
        document.querySelector('main').scrollTop = 0;
      }} else if (dir > 0 && currentBookIndex + 1 < BIBLIA.length) {{
        currentBookIndex++;
        currentChapterIndex = 0;
        renderBibleChapter();
        document.querySelector('main').scrollTop = 0;
      }} else if (dir < 0 && currentBookIndex - 1 >= 0) {{
        currentBookIndex--;
        currentChapterIndex = BIBLIA[currentBookIndex].chapters.length - 1;
        renderBibleChapter();
        document.querySelector('main').scrollTop = 0;
      }}
    }}

    // MARK / HIGHLIGHT VERSE IN-PLACE (NO SCROLL RESET!)
    function promptVerseAction(el, ref, text) {{
      const isSaved = favVerses.some(fv => fv.ref === ref);
      if (isSaved) {{
        favVerses = favVerses.filter(fv => fv.ref !== ref);
        if (el) el.classList.remove('saved');
        showToast('Versículo desmarcado');
      }} else {{
        favVerses.unshift({{ ref, text, date: new Date().toLocaleDateString() }});
        if (el) el.classList.add('saved');
        showToast(`⭐ Señalado: ${{ref}}`);
      }}
      localStorage.setItem('favVerses', JSON.stringify(favVerses));
      updateFavCounters();
      // Notice: NO renderBibleChapter() and NO scrollTop = 0!
      // The user stays at their exact position in the chapter!
    }}

    // Book Picker Modal
    let selectedTestament = 'OT';
    function openBookPicker() {{
      renderBooksGrid();
      document.getElementById('bookModal').classList.add('open');
    }}
    function filterTestament(testament) {{
      selectedTestament = testament;
      document.getElementById('btnOT').classList.toggle('active', testament === 'OT');
      document.getElementById('btnNT').classList.toggle('active', testament === 'NT');
      renderBooksGrid();
    }}
    function renderBooksGrid() {{
      const grid = document.getElementById('booksGrid');
      const start = selectedTestament === 'OT' ? 0 : 39;
      const end = selectedTestament === 'OT' ? 39 : 66;
      grid.innerHTML = BIBLIA.slice(start, end).map((book, idx) => {{
        const actualIdx = start + idx;
        return `<div class="book-btn" onclick="selectBook(${{actualIdx}})">${{book.name}}</div>`;
      }}).join('');
    }}
    function selectBook(idx) {{
      currentBookIndex = idx;
      currentChapterIndex = 0;
      closeBookModalDirect();
      openChapterPicker();
    }}
    function closeBookModal(e) {{ if (e.target.id === 'bookModal') closeBookModalDirect(); }}
    function closeBookModalDirect() {{ document.getElementById('bookModal').classList.remove('open'); }}

    // Chapter Picker Modal
    function openChapterPicker() {{
      const book = BIBLIA[currentBookIndex];
      document.getElementById('chapterModalTitle').innerText = `${{book.name}} - Capítulos`;
      const grid = document.getElementById('chaptersGrid');
      grid.innerHTML = book.chapters.map((_, idx) => {{
        return `<div class="chapter-btn" onclick="selectChapter(${{idx}})">${{idx + 1}}</div>`;
      }}).join('');
      document.getElementById('chapterModal').classList.add('open');
    }}
    function selectChapter(idx) {{
      currentChapterIndex = idx;
      closeChapterModalDirect();
      renderBibleChapter();
      document.querySelector('main').scrollTop = 0;
    }}
    function closeChapterModal(e) {{ if (e.target.id === 'chapterModal') closeChapterModalDirect(); }}
    function closeChapterModalDirect() {{ document.getElementById('chapterModal').classList.remove('open'); }}

    // Favorites View
    function setFavTab(tab, el) {{
      currentFavTab = tab;
      document.querySelectorAll('#viewFavoritos .filter-chip').forEach(c => c.classList.remove('active'));
      el.classList.add('active');
      renderFavorites();
    }}
    function renderFavorites() {{
      const container = document.getElementById('favListContainer');
      if (currentFavTab === 'alabanzas') {{
        const songs = ALL_SONGS.filter(s => favSongIds.has(s.id));
        if (songs.length === 0) {{
          container.innerHTML = '<div class="empty-state"><div class="empty-icon">⭐</div><p>Aún no has guardado alabanzas favoritas.<br>Toca la estrella ⭐ en cualquier himno o coro para agregarlo aquí.</p></div>';
          return;
        }}
        container.innerHTML = songs.map(item => {{
          const prefix = item.type === 'himno' ? 'H' : 'C';
          const isCoro = item.type === 'coro';
          const preview = item.stanzas[0] ? item.stanzas[0].replace('CORO:', '').replace(/\\n/g, ' ').trim() : '';
          return `
            <div class="item-card" onclick="openHymnModal('${{item.id}}')">
              <div class="item-left">
                <div class="item-badge ${{isCoro ? 'badge-coro' : ''}}">${{prefix}}-${{item.num}}</div>
                <div class="item-info">
                  <div class="item-title">${{item.title}}</div>
                  <div class="item-preview">${{preview}}</div>
                </div>
              </div>
              <div class="fav-btn is-fav" onclick="toggleFavSong('${{item.id}}', event)">⭐</div>
            </div>
          `;
        }}).join('');
      }} else {{
        if (favVerses.length === 0) {{
          container.innerHTML = '<div class="empty-state"><div class="empty-icon">📖</div><p>No tienes versículos señalados.<br>Toca cualquier versículo de la Biblia para guardarlo como favorito.</p></div>';
          return;
        }}
        container.innerHTML = favVerses.map(v => {{
          return `
            <div class="item-card" style="align-items: flex-start;">
              <div class="item-info" style="flex: 1;">
                <div class="item-title" style="color: var(--primary); font-weight: 800;">${{v.ref}}</div>
                <div style="font-size: 0.98rem; margin-top: 6px; line-height: 1.5;">${{v.text}}</div>
              </div>
              <div class="fav-btn is-fav" onclick="removeFavVerse('${{v.ref}}')">⭐</div>
            </div>
          `;
        }}).join('');
      }}
    }}
    function removeFavVerse(ref) {{
      favVerses = favVerses.filter(v => v.ref !== ref);
      localStorage.setItem('favVerses', JSON.stringify(favVerses));
      showToast('Versículo eliminado');
      updateFavCounters();
      renderFavorites();
    }}

    document.addEventListener('DOMContentLoaded', init);
    window.onload = init;
    setTimeout(init, 50);
  </script>
</body>
</html>"""

out_path = os.path.join(ASSETS_DIR, "index.html")
with open(out_path, "w", encoding="utf-8") as f:
    f.write(html_content)

print(f"Generated clean modern index.html: {out_path} ({os.path.getsize(out_path) / 1024:.2f} KB)")
