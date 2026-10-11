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
  <meta name="apple-mobile-web-app-capable" content="yes">
  <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
  <meta name="apple-mobile-web-app-title" content="Himnario IDMJI">
  <meta name="theme-color" content="#172554">
  <link rel="apple-touch-icon" href="icon-192.png">
  <link rel="icon" type="image/png" href="icon-192.png">
  <link rel="manifest" href="manifest.json">
  <title>Himnario &amp; Santa Biblia IDMJI</title>
  <!-- Google Fonts -->
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Playfair+Display:ital,wght@0,600;0,700;1,600&display=swap" rel="stylesheet">
  <style>
    :root {{
      --bg: #090d16;
      --bg-gradient: radial-gradient(circle at 50% 0%, #172554 0%, #090d16 75%);
      --bg-card: rgba(19, 27, 46, 0.75);
      --bg-card-hover: rgba(30, 41, 69, 0.9);
      --bg-glass: rgba(15, 23, 42, 0.92);
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
      --shadow-lg: 0 12px 32px rgba(0, 0, 0, 0.5);
      --nav-height: 64px;
    }}
    
    body.light {{
      --bg: #f8fafc;
      --bg-gradient: radial-gradient(circle at 50% 0%, #e2e8f0 0%, #f8fafc 75%);
      --bg-card: rgba(255, 255, 255, 0.95);
      --bg-card-hover: #ffffff;
      --bg-glass: rgba(255, 255, 255, 0.94);
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
      --bg-gradient: radial-gradient(circle at 50% 0%, #fef3c7 0%, #f7f1e5 75%);
      --bg-card: rgba(255, 251, 245, 0.95);
      --bg-card-hover: #ffffff;
      --bg-glass: rgba(247, 241, 229, 0.95);
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
      padding: 10px 14px;
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
      gap: 10px;
      min-width: 0;
      flex: 1;
    }}
    .header-logo-icon {{
      width: 48px;
      height: 32px;
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
      background: #1f2e85;
      border: 1px solid rgba(255, 255, 255, 0.18);
      padding: 0;
      overflow: hidden;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.25);
    }}
    .header-logo-icon img {{
      width: 100%;
      height: 100%;
      object-fit: cover;
      display: block;
    }}
    .header-text {{
      display: flex;
      flex-direction: column;
      min-width: 0;
      overflow: hidden;
    }}
    .header-title {{
      font-size: 1.05rem;
      font-weight: 800;
      letter-spacing: -0.2px;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      color: var(--text);
    }}
    .header-sub {{
      font-size: 0.70rem;
      font-weight: 600;
      color: var(--text-muted);
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }}
    .header-actions {{
      display: flex;
      align-items: center;
      gap: 5px;
      flex-shrink: 0;
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
      font-size: 0.78rem;
      padding: 5px 8px;
      border-radius: 7px;
      cursor: pointer;
      transition: background 0.15s, transform 0.1s;
    }}
    .action-pill-btn:active {{
      background: rgba(255, 255, 255, 0.12);
      transform: scale(0.95);
    }}
    .theme-round-btn {{
      width: 34px;
      height: 34px;
      border-radius: 50%;
      background: var(--chip-bg);
      border: 1px solid var(--border);
      color: var(--text);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 0.95rem;
      cursor: pointer;
      transition: transform 0.2s, background 0.2s;
    }}
    .theme-round-btn:active {{
      transform: scale(0.9) rotate(20deg);
    }}

    /* Active Teaching Banner */
    .active-note-banner {{
      background: linear-gradient(135deg, rgba(37, 99, 235, 0.18), rgba(99, 102, 241, 0.18));
      border-bottom: 1px solid rgba(56, 189, 248, 0.25);
      padding: 8px 14px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 8px;
      font-size: 0.8rem;
      color: var(--primary);
      cursor: pointer;
      flex-shrink: 0;
      animation: fadeIn 0.3s ease;
    }}
    .active-note-badge {{
      background: var(--primary-gradient);
      color: #fff;
      font-size: 0.65rem;
      font-weight: 800;
      padding: 2px 7px;
      border-radius: 999px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      flex-shrink: 0;
    }}
    .active-note-title {{
      font-weight: 700;
      color: var(--text);
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      flex: 1;
    }}
    .active-note-count {{
      font-weight: 700;
      font-size: 0.75rem;
      color: var(--accent);
      flex-shrink: 0;
    }}

    /* Main Scroll Area */
    main {{
      flex: 1;
      overflow-y: auto;
      overflow-x: hidden;
      padding: 14px 14px 24px 14px;
      -webkit-overflow-scrolling: touch;
      position: relative;
    }}

    .view {{ display: none; }}
    .view.active {{ display: block; animation: fadeIn 0.2s ease-out; }}
    @keyframes fadeIn {{
      from {{ opacity: 0; transform: translateY(4px); }}
      to {{ opacity: 1; transform: translateY(0); }}
    }}

    /* Search Bar */
    .search-wrapper {{
      position: relative;
      margin-bottom: 12px;
    }}
    .search-input {{
      width: 100%;
      background: var(--bg-card);
      border: 1px solid var(--border);
      border-radius: 14px;
      padding: 12px 40px 12px 42px;
      font-size: 0.95rem;
      color: var(--text);
      outline: none;
      transition: all 0.2s ease;
      font-family: inherit;
      box-shadow: var(--shadow-sm);
    }}
    .search-input:focus {{
      border-color: var(--border-focus);
      box-shadow: 0 0 0 3px rgba(56, 189, 248, 0.15);
      background: var(--bg-card-hover);
    }}
    .search-icon-inside {{
      position: absolute;
      left: 14px;
      top: 50%;
      transform: translateY(-50%);
      color: var(--text-muted);
      font-size: 1rem;
      pointer-events: none;
    }}
    .clear-search-btn {{
      position: absolute;
      right: 12px;
      top: 50%;
      transform: translateY(-50%);
      background: rgba(255, 255, 255, 0.1);
      border: none;
      color: var(--text-muted);
      width: 22px;
      height: 22px;
      border-radius: 50%;
      display: none;
      align-items: center;
      justify-content: center;
      font-size: 0.75rem;
      cursor: pointer;
    }}

    /* Filter Chips Bar */
    .filter-bar {{
      display: flex;
      gap: 8px;
      margin-bottom: 14px;
      overflow-x: auto;
      padding-bottom: 4px;
      scrollbar-width: none;
    }}
    .filter-bar::-webkit-scrollbar {{ display: none; }}
    .filter-chip {{
      background: var(--chip-bg);
      border: 1px solid var(--border);
      color: var(--text-muted);
      padding: 7px 14px;
      border-radius: 999px;
      font-size: 0.82rem;
      font-weight: 700;
      white-space: nowrap;
      cursor: pointer;
      transition: all 0.2s ease;
      display: inline-flex;
      align-items: center;
      gap: 6px;
    }}
    .filter-chip.active {{
      background: var(--chip-active);
      color: #ffffff;
      border-color: transparent;
      box-shadow: 0 2px 8px rgba(37, 99, 235, 0.3);
    }}

    /* Card List (Himnos & Coros) */
    .item-card {{
      background: var(--bg-card);
      backdrop-filter: blur(10px);
      border: 1px solid var(--border);
      border-radius: 14px;
      padding: 12px 14px;
      margin-bottom: 9px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 10px;
      cursor: pointer;
      transition: all 0.18s cubic-bezier(0.4, 0, 0.2, 1);
      box-shadow: var(--shadow-sm);
    }}
    .item-card:active {{
      transform: scale(0.985);
      background: var(--bg-card-hover);
    }}
    .item-left {{
      display: flex;
      align-items: center;
      gap: 12px;
      flex: 1;
      min-width: 0;
    }}
    .item-badge {{
      width: 44px;
      height: 44px;
      border-radius: 12px;
      background: var(--primary-gradient);
      color: #ffffff;
      font-weight: 800;
      font-size: 0.82rem;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
      box-shadow: 0 4px 10px rgba(56, 189, 248, 0.25);
    }}
    .badge-coro {{
      background: var(--accent-gradient);
      color: #000000;
      box-shadow: 0 4px 10px rgba(245, 158, 11, 0.25);
    }}
    .item-info {{
      display: flex;
      flex-direction: column;
      min-width: 0;
      flex: 1;
    }}
    .item-title {{
      font-size: 0.96rem;
      font-weight: 700;
      color: var(--text);
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      margin-bottom: 2px;
    }}
    .item-preview {{
      font-size: 0.78rem;
      color: var(--text-muted);
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      line-height: 1.3;
    }}
    .fav-btn {{
      font-size: 1.25rem;
      color: var(--text-muted);
      padding: 6px;
      border-radius: 50%;
      cursor: pointer;
      transition: transform 0.15s, color 0.15s;
    }}
    .fav-btn:active {{ transform: scale(1.25); }}
    .fav-btn.is-fav {{ color: #fbbf24; text-shadow: 0 0 10px rgba(251, 191, 36, 0.5); }}

    /* Bottom Navigation Dock (5 Tabs) */
    .bottom-nav {{
      background: var(--bg-glass);
      backdrop-filter: blur(20px);
      -webkit-backdrop-filter: blur(20px);
      border-top: 1px solid var(--border);
      height: var(--nav-height);
      display: flex;
      align-items: center;
      justify-content: space-around;
      flex-shrink: 0;
      z-index: 25;
      padding: 0 6px;
      box-shadow: 0 -4px 16px rgba(0, 0, 0, 0.2);
    }}
    .nav-item {{
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 3px;
      color: var(--text-muted);
      font-size: 0.68rem;
      font-weight: 700;
      cursor: pointer;
      padding: 6px 8px;
      border-radius: 12px;
      transition: all 0.2s ease;
      flex: 1;
      text-align: center;
    }}
    .nav-item.active {{
      color: var(--primary);
    }}
    .nav-icon {{
      font-size: 1.18rem;
      transition: transform 0.2s ease;
    }}
    .nav-item.active .nav-icon {{
      transform: translateY(-2px) scale(1.1);
    }}

    /* Song Modal / Fullscreen Reader */
    #hymnModal.song-reader-overlay {{
      position: fixed;
      inset: 0;
      width: 100vw;
      height: 100vh;
      background: var(--bg);
      backdrop-filter: none;
      -webkit-backdrop-filter: none;
      z-index: 100;
      display: none;
      flex-direction: column;
      align-items: stretch;
      justify-content: stretch;
      animation: fadeIn 0.15s ease-out;
    }}
    #hymnModal.song-reader-overlay.open {{
      display: flex;
    }}
    #hymnModal .song-reader-content {{
      width: 100%;
      height: 100%;
      max-height: 100vh;
      border-radius: 0;
      border: none;
      background: var(--bg);
      box-shadow: none;
      display: flex;
      flex-direction: column;
      animation: none;
    }}
    #hymnModal .song-reader-header {{
      padding: 10px 14px;
      background: var(--bg-card);
      border-bottom: 1px solid var(--border);
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 6px;
      flex-shrink: 0;
    }}
    #hymnModal .song-reader-body {{
      padding: 24px 20px 80px 20px;
      overflow-y: auto;
      flex: 1;
      -webkit-overflow-scrolling: touch;
    }}
    #hymnModal .song-reader-footer {{
      padding: 12px 18px;
      background: var(--bg-card);
      border-top: 1px solid var(--border);
      flex-shrink: 0;
      display: flex;
      align-items: center;
      justify-content: space-between;
    }}
    .song-hero-banner {{
      text-align: center;
      margin: 6px 0 24px 0;
      padding-bottom: 12px;
    }}
    .song-hero-badge {{
      display: inline-block;
      padding: 4px 14px;
      background: var(--chip-active);
      color: #ffffff;
      font-size: 0.8rem;
      font-weight: 800;
      border-radius: 999px;
      letter-spacing: 0.8px;
      text-transform: uppercase;
      margin-bottom: 12px;
      box-shadow: 0 2px 8px rgba(37, 99, 235, 0.35);
    }}
    .song-hero-title {{
      font-family: 'Playfair Display', Georgia, serif;
      font-size: calc(1.55rem * var(--font-scale));
      font-weight: 700;
      color: var(--text);
      line-height: 1.3;
      margin: 0 0 14px 0;
      padding: 0 10px;
      letter-spacing: -0.3px;
    }}
    .song-hero-divider {{
      width: 44px;
      height: 3px;
      background: var(--accent-gradient);
      border-radius: 999px;
      margin: 0 auto;
    }}

    /* Generic Bottom Sheet Modals */
    .modal-overlay {{
      position: fixed;
      inset: 0;
      background: rgba(0, 0, 0, 0.65);
      backdrop-filter: blur(8px);
      -webkit-backdrop-filter: blur(8px);
      z-index: 50;
      display: none;
      align-items: flex-end;
      animation: fadeIn 0.2s ease;
    }}
    .modal-overlay.open {{ display: flex; }}
    .modal-content {{
      width: 100%;
      max-height: 88vh;
      background: var(--bg-glass);
      backdrop-filter: blur(25px);
      -webkit-backdrop-filter: blur(25px);
      border-top-left-radius: 26px;
      border-top-right-radius: 26px;
      border-top: 1px solid var(--border);
      display: flex;
      flex-direction: column;
      animation: slideUp 0.25s cubic-bezier(0.16, 1, 0.3, 1);
      box-shadow: var(--shadow-lg);
    }}
    @keyframes slideUp {{
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
      padding: 12px 18px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      border-bottom: 1px solid var(--border);
    }}
    .modal-header-left {{
      display: flex;
      align-items: center;
      gap: 10px;
      flex: 1;
      min-width: 0;
    }}
    .modal-song-badge {{
      background: var(--chip-active);
      color: #fff;
      font-weight: 800;
      font-size: 0.82rem;
      padding: 4px 10px;
      border-radius: 999px;
      flex-shrink: 0;
    }}
    .modal-title {{
      font-size: 1.1rem;
      font-weight: 800;
      letter-spacing: -0.3px;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }}
    .modal-close-btn {{
      width: 34px;
      height: 34px;
      border-radius: 50%;
      background: var(--chip-bg);
      border: 1px solid var(--border);
      color: var(--text);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.1rem;
      cursor: pointer;
    }}
    .modal-body {{
      padding: 20px 22px;
      overflow-y: auto;
      flex: 1;
      font-size: calc(1.15rem * var(--font-scale));
      line-height: 1.85;
      text-align: center;
    }}
    .stanza {{
      margin-bottom: 22px;
      white-space: pre-line;
      color: var(--text);
    }}
    .coro-stanza {{
      background: var(--callout-bg);
      border: 1px solid var(--callout-border);
      border-radius: 16px;
      padding: 14px;
      margin: 18px 0;
      font-weight: 600;
      color: var(--primary);
    }}

    /* =========================================
       SONG REPETITION & (x2) HIGHLIGHTS
       ========================================= */
    .song-repeat-block {{
      background: rgba(251, 191, 36, 0.10);
      border-left: 3px solid var(--accent);
      border-radius: 10px;
      padding: 8px 14px;
      margin: 10px auto;
      line-height: 1.8;
      display: inline-block;
      max-width: 96%;
      text-align: center;
      color: var(--text);
      font-weight: 600;
    }}
    .repeat-badge {{
      background: var(--accent-gradient);
      color: #000;
      font-size: 0.72rem;
      font-weight: 800;
      padding: 2px 7px;
      border-radius: 6px;
      margin-left: 8px;
      display: inline-block;
      vertical-align: middle;
      box-shadow: 0 2px 6px rgba(245, 158, 11, 0.35);
    }}
    .repeat-icon {{
      color: var(--accent);
      font-weight: 800;
      font-size: 0.95em;
    }}

    .modal-footer {{
      padding: 12px 18px;
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
      padding: 9px 16px;
      border-radius: 12px;
      font-weight: 700;
      font-size: 0.85rem;
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: 6px;
    }}
    .modal-nav-btn:active {{
      background: var(--chip-active);
      color: #fff;
    }}

    /* =========================================
       BIBLE VIEW & SECTION HEADINGS WITH CROSS-REFS
       ========================================= */
    .bible-selector-card {{
      background: var(--bg-card);
      border: 1px solid var(--border);
      border-radius: 16px;
      padding: 12px;
      margin-bottom: 12px;
      display: flex;
      gap: 10px;
    }}
    .selector-btn {{
      flex: 1;
      background: var(--chip-bg);
      border: 1px solid var(--border);
      color: var(--text);
      padding: 12px 14px;
      border-radius: 14px;
      font-size: 0.95rem;
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
      padding: 10px 14px;
      margin-bottom: 14px;
      background: var(--bg-card);
      border: 1px solid var(--border);
      border-radius: 14px;
    }}
    .bible-heading {{
      font-family: 'Playfair Display', Georgia, serif;
      font-size: 1.25rem;
      font-weight: 700;
      color: var(--text);
      letter-spacing: -0.2px;
    }}
    .verse-list {{
      display: flex;
      flex-direction: column;
      gap: 10px;
      user-select: text;
    }}
    
    /* Section Headings & Parallel Notations */
    .verse-section-title {{
      font-family: 'Playfair Display', Georgia, serif;
      font-size: 1.15rem;
      font-weight: 700;
      color: var(--accent);
      margin-top: 22px;
      margin-bottom: 2px;
      letter-spacing: -0.2px;
    }}
    .verse-section-crossref {{
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      font-style: italic;
      font-size: 0.84rem;
      color: var(--accent);
      background: rgba(251, 191, 36, 0.08);
      border-left: 3px solid var(--accent);
      padding: 6px 12px;
      border-radius: 6px;
      margin-bottom: 10px;
      line-height: 1.45;
      display: block;
    }}
    .verse-section-title:first-child {{
      margin-top: 2px;
    }}

    @keyframes versePulseAnim {{
      0% {{ background: rgba(56, 189, 248, 0.45); transform: scale(1.02); box-shadow: 0 0 16px rgba(56, 189, 248, 0.5); }}
      50% {{ background: rgba(251, 191, 36, 0.45); transform: scale(1.02); box-shadow: 0 0 20px rgba(251, 191, 36, 0.6); }}
      100% {{ background: transparent; transform: scale(1); box-shadow: none; }}
    }}
    .verse-pulse-highlight {{
      animation: versePulseAnim 3s ease-in-out forwards !important;
      border-left: 4px solid var(--accent) !important;
      border-radius: 8px;
    }}

    .verse-item {{
      line-height: 1.72;
      font-size: calc(1.06rem * var(--font-scale));
      padding: 9px 12px;
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
      font-size: 0.80rem;
      margin-right: 8px;
      background: var(--chip-bg);
      border: 1px solid var(--border);
      padding: 2px 6px;
      border-radius: 6px;
      display: inline-block;
      vertical-align: baseline;
    }}
    .verse-item.saved {{
      background: rgba(251, 191, 36, 0.12);
      border-left: 4px solid var(--accent);
      padding-left: 10px;
      box-shadow: var(--shadow-sm);
    }}
    .verse-item.in-active-note {{
      border-right: 3px solid var(--primary);
    }}

    .chapter-bottom-nav {{
      display: flex;
      justify-content: space-between;
      gap: 12px;
      margin-top: 24px;
      padding-top: 16px;
      border-top: 1px solid var(--border);
    }}
    .chapter-bottom-btn {{
      flex: 1;
      background: var(--bg-card);
      border: 1px solid var(--border);
      color: var(--text);
      padding: 14px 16px;
      border-radius: 14px;
      font-weight: 700;
      font-size: 0.9rem;
      cursor: pointer;
      text-align: center;
      transition: all 0.15s;
    }}
    .chapter-bottom-btn:active {{
      background: var(--chip-active);
      color: #fff;
    }}

    /* =========================================
       VERSE ACTION SHEET (MODAL DE VERSÍCULO)
       ========================================= */
    .verse-action-sheet {{
      padding: 18px 20px 24px 20px;
    }}
    .sheet-verse-ref {{
      font-family: 'Playfair Display', Georgia, serif;
      font-size: 1.35rem;
      font-weight: 700;
      color: var(--accent);
      margin-bottom: 8px;
    }}
    .sheet-verse-text {{
      font-size: 1rem;
      line-height: 1.6;
      color: var(--text);
      background: var(--chip-bg);
      border: 1px solid var(--border);
      border-radius: 12px;
      padding: 12px 14px;
      margin-bottom: 18px;
      max-height: 140px;
      overflow-y: auto;
      font-style: italic;
    }}
    .sheet-btn-list {{
      display: flex;
      flex-direction: column;
      gap: 10px;
    }}
    .sheet-action-btn {{
      background: var(--bg-card);
      border: 1px solid var(--border);
      color: var(--text);
      padding: 14px 16px;
      border-radius: 14px;
      font-size: 0.95rem;
      font-weight: 700;
      display: flex;
      align-items: center;
      gap: 12px;
      cursor: pointer;
      transition: all 0.15s;
    }}
    .sheet-action-btn:active {{
      background: var(--primary-gradient);
      color: #fff;
      border-color: transparent;
      transform: scale(0.98);
    }}
    .sheet-action-icon {{
      font-size: 1.3rem;
      flex-shrink: 0;
    }}

    /* =========================================
       NOTAS & ENSEÑANZAS VIEW & READ/STUDY MODE
       ========================================= */
    .note-item-card {{
      background: var(--bg-card);
      border: 1px solid var(--border);
      border-radius: 16px;
      padding: 14px 16px;
      margin-bottom: 12px;
      cursor: pointer;
      transition: all 0.2s;
      box-shadow: var(--shadow-sm);
    }}
    .note-item-card:active {{
      transform: scale(0.985);
      background: var(--bg-card-hover);
    }}
    .note-card-top {{
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 6px;
    }}
    .note-card-type {{
      font-size: 0.72rem;
      font-weight: 800;
      text-transform: uppercase;
      letter-spacing: 0.6px;
      color: var(--primary);
      background: var(--callout-bg);
      border: 1px solid var(--callout-border);
      padding: 3px 9px;
      border-radius: 999px;
    }}
    .note-card-date {{
      font-size: 0.74rem;
      color: var(--text-muted);
      font-weight: 600;
    }}
    .note-card-title {{
      font-size: 1.05rem;
      font-weight: 800;
      color: var(--text);
      margin-bottom: 6px;
      letter-spacing: -0.2px;
    }}
    .note-card-preview {{
      font-size: 0.85rem;
      color: var(--text-muted);
      line-height: 1.45;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
      margin-bottom: 10px;
    }}
    .note-verses-pills {{
      display: flex;
      flex-wrap: wrap;
      gap: 6px;
    }}
    .note-verse-pill {{
      font-size: 0.74rem;
      font-weight: 700;
      color: var(--accent);
      background: rgba(251, 191, 36, 0.1);
      border: 1px solid rgba(251, 191, 36, 0.25);
      padding: 2px 8px;
      border-radius: 8px;
    }}

    /* Note Editor & Study Mode Switcher */
    .note-mode-bar {{
      display: flex;
      background: var(--chip-bg);
      border: 1px solid var(--border);
      border-radius: 12px;
      padding: 3px;
      margin-bottom: 14px;
    }}
    .note-mode-btn {{
      flex: 1;
      padding: 8px 12px;
      border: none;
      background: transparent;
      color: var(--text-muted);
      font-weight: 700;
      font-size: 0.85rem;
      border-radius: 9px;
      cursor: pointer;
      transition: all 0.2s;
    }}
    .note-mode-btn.active {{
      background: var(--chip-active);
      color: #fff;
      box-shadow: 0 2px 8px rgba(37, 99, 235, 0.3);
    }}

    .note-input-title {{
      width: 100%;
      background: transparent;
      border: none;
      border-bottom: 2px solid var(--border);
      padding: 8px 4px 12px 4px;
      font-size: 1.25rem;
      font-weight: 800;
      color: var(--text);
      outline: none;
      font-family: inherit;
      margin-bottom: 14px;
    }}
    .note-input-title:focus {{
      border-color: var(--primary);
    }}
    .note-textarea {{
      width: 100%;
      min-height: 120px;
      background: var(--chip-bg);
      border: 1px solid var(--border);
      border-radius: 12px;
      padding: 12px 14px;
      font-size: 0.95rem;
      line-height: 1.6;
      color: var(--text);
      outline: none;
      font-family: inherit;
      resize: vertical;
    }}
    .note-textarea:focus {{
      border-color: var(--border-focus);
    }}

    /* Auto-expanding multi-line comment field */
    .note-linked-comment {{
      width: 100%;
      min-height: 52px;
      background: var(--bg-card);
      border: 1px solid var(--border);
      border-radius: 10px;
      padding: 8px 12px;
      font-size: 0.90rem;
      line-height: 1.5;
      color: var(--text);
      outline: none;
      font-family: inherit;
      resize: none;
      white-space: pre-wrap;
      word-break: break-word;
      overflow-y: hidden;
      margin-top: 6px;
    }}
    .note-linked-comment:focus {{
      border-color: var(--primary);
    }}

    /* Study Mode Display for User Notes */
    .study-user-note {{
      background: rgba(56, 189, 248, 0.08);
      border-left: 3px solid var(--primary);
      border-radius: 8px;
      padding: 8px 12px;
      margin-top: 8px;
      font-size: 0.92rem;
      color: var(--text);
      line-height: 1.6;
      white-space: pre-wrap;
      word-break: break-word;
    }}
    .study-general-content {{
      background: var(--chip-bg);
      border: 1px solid var(--border);
      border-radius: 12px;
      padding: 14px 16px;
      font-size: 0.98rem;
      line-height: 1.65;
      color: var(--text);
      white-space: pre-wrap;
      word-break: break-word;
      margin-bottom: 16px;
    }}

    .note-linked-verse-card {{
      background: var(--chip-bg);
      border: 1px solid var(--border);
      border-radius: 12px;
      padding: 12px 14px;
      margin-bottom: 10px;
      position: relative;
    }}
    .note-linked-ref {{
      font-family: 'Playfair Display', Georgia, serif;
      font-weight: 700;
      font-size: 1rem;
      color: var(--accent);
      margin-bottom: 4px;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }}
    .note-linked-text {{
      font-size: 0.92rem;
      line-height: 1.5;
      color: var(--text);
      margin-bottom: 6px;
      font-style: italic;
    }}

    /* Floating Action Button (New Note) */
    .fab-btn {{
      background: var(--primary-gradient);
      color: #fff;
      border: none;
      padding: 12px 20px;
      border-radius: 999px;
      font-weight: 800;
      font-size: 0.95rem;
      display: flex;
      align-items: center;
      gap: 8px;
      cursor: pointer;
      box-shadow: 0 6px 18px rgba(37, 99, 235, 0.35);
      margin-bottom: 14px;
      width: 100%;
      justify-content: center;
      transition: all 0.2s;
    }}
    .fab-btn:active {{
      transform: scale(0.98);
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
      padding: 14px 8px;
      border-radius: 14px;
      border: 2px solid var(--border);
      text-align: center;
      font-weight: 800;
      font-size: 0.88rem;
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
      bottom: 85px;
      left: 50%;
      transform: translateX(-50%);
      background: rgba(15, 23, 42, 0.95);
      backdrop-filter: blur(12px);
      border: 1px solid var(--border);
      color: #fff;
      padding: 10px 22px;
      border-radius: 999px;
      font-size: 0.86rem;
      font-weight: 600;
      box-shadow: var(--shadow-lg);
      z-index: 9999;
      display: none;
      white-space: nowrap;
      pointer-events: none;
      animation: toastIn 0.2s ease;
    }}
    @keyframes toastIn {{
      from {{ opacity: 0; transform: translate(-50%, 12px); }}
      to {{ opacity: 1; transform: translate(-50%, 0); }}
    }}

    .empty-state {{
      text-align: center;
      padding: 40px 20px;
      color: var(--text-muted);
    }}
    .empty-icon {{ font-size: 2.8rem; margin-bottom: 12px; }}
  </style>
</head>
<body>

  <!-- Top Glass Header (Balanced & Clean, No Descuadre) -->
  <header>
    <div class="header-left">
      <div class="header-logo-icon">
        <img src="data:image/png;base64,{logo_base64}" alt="IDMJI">
      </div>
      <div class="header-text">
        <div class="header-title">Himnario &amp; Biblia</div>
        <div class="header-sub">IDMJI • No oficial</div>
      </div>
    </div>
    <div class="header-actions">
      <div class="pill-btn-group">
        <button class="action-pill-btn" onclick="adjustFontSize(-0.1)" title="Reducir fuente">A-</button>
        <button class="action-pill-btn" onclick="adjustFontSize(0.1)" title="Aumentar fuente">A+</button>
      </div>
      <button class="theme-round-btn" id="quickThemeBtn" onclick="cycleTheme()" title="Cambiar tema">🌙</button>
      <button class="theme-round-btn" onclick="openSettingsModal()" title="Ajustes">⚙️</button>
    </div>
  </header>

  <!-- Active Teaching Floating Notification Banner (If active) -->
  <div id="activeNoteBanner" class="active-note-banner" style="display: none;" onclick="openActiveNote()">
    <span class="active-note-badge">Enseñanza Activa</span>
    <span class="active-note-title" id="activeNoteBannerTitle">Enseñanza de hoy</span>
    <span class="active-note-count" id="activeNoteBannerCount">0 versículos 📝</span>
  </div>

  <!-- Main Scrollable Content Views -->
  <main id="mainContainer">
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

      <!-- Quick Chapter Bottom Navigation -->
      <div class="chapter-bottom-nav">
        <button class="chapter-bottom-btn" onclick="navigateChapter(-1)">‹ Capítulo Anterior</button>
        <button class="chapter-bottom-btn" onclick="navigateChapter(1)">Capítulo Siguiente ›</button>
      </div>
    </section>

    <!-- View 4: Enseñanzas & Notas -->
    <section id="viewNotas" class="view">
      <button class="fab-btn" onclick="createNewNote()">
        <span style="font-size: 1.2rem;">➕</span> Nueva Enseñanza / Meditación
      </button>

      <div class="search-wrapper">
        <span class="search-icon-inside">🔍</span>
        <input type="text" id="searchNotas" class="search-input" placeholder="Buscar en mis notas o versículos..." oninput="renderNotesList()">
      </div>

      <div class="filter-bar">
        <button class="filter-chip active" id="chipNotesAll" onclick="filterNotesCategory('all', this)">Todas (<span id="countNotes">0</span>)</button>
        <button class="filter-chip" onclick="filterNotesCategory('Enseñanza', this)">📖 Enseñanzas</button>
        <button class="filter-chip" onclick="filterNotesCategory('Meditación', this)">🕊️ Meditaciones</button>
        <button class="filter-chip" onclick="filterNotesCategory('Estudio', this)">📜 Estudios</button>
      </div>

      <div id="notesListContainer"></div>
    </section>

    <!-- View 5: Favoritos -->
    <section id="viewFavoritos" class="view">
      <div class="filter-bar">
        <button class="filter-chip active" onclick="setFavTab('alabanzas', this)">Alabanzas (⭐ <span id="favSongCount">0</span>)</button>
        <button class="filter-chip" onclick="setFavTab('versiculos', this)">Versículos Señalados (📖 <span id="favVerseCount">0</span>)</button>
      </div>
      <div id="favListContainer"></div>
    </section>
  </main>

  <!-- Bottom Navigation Dock (5 Clean Tabs) -->
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
    <div class="nav-item" onclick="switchView('viewNotas', this)">
      <span class="nav-icon">📝</span>
      <span>Notas</span>
    </div>
    <div class="nav-item" onclick="switchView('viewFavoritos', this)">
      <span class="nav-icon">⭐</span>
      <span>Favoritos</span>
    </div>
  </nav>

  <!-- Modal for Song Lyrics (Dedicated Fullscreen Reader) -->
  <div class="modal-overlay song-reader-overlay" id="hymnModal">
    <div class="modal-content song-reader-content">
      <div class="modal-header song-reader-header">
        <button class="modal-nav-btn back-btn" onclick="closeHymnModalDirect()" style="font-weight: 700; gap: 4px; padding: 6px 12px; font-size: 0.85rem; border-radius: 999px; flex-shrink: 0;">
          <span style="font-size: 1.15rem; line-height: 1;">‹</span> Volver
        </button>
        <div class="reader-header-title-box" style="flex: 1; min-width: 0; display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center; padding: 0 6px;">
          <span class="reader-header-badge" id="modalSongBadge" style="font-size: 0.72rem; font-weight: 800; color: var(--primary); text-transform: uppercase; letter-spacing: 0.6px; line-height: 1.1;">Himno 1</span>
          <span class="modal-title reader-header-title" id="modalSongTitle" style="font-size: 0.88rem; font-weight: 700; color: var(--text); width: 100%; line-height: 1.18; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; white-space: normal; text-align: center;">Título de la Alabanza</span>
        </div>
        <div style="display: flex; align-items: center; gap: 6px; flex-shrink: 0;">
          <span class="fav-btn" id="modalFavBtn" onclick="toggleModalFav()" title="Marcar favorito" style="font-size: 1.25rem;">⭐</span>
          <button class="modal-close-btn" onclick="closeHymnModalDirect()" title="Cerrar">✕</button>
        </div>
      </div>
      <div class="modal-body song-reader-body" id="modalSongBody"></div>
      <div class="modal-footer song-reader-footer">
        <button class="modal-nav-btn" onclick="navigateModalSong(-1)">‹ Anterior</button>
        <div class="pill-btn-group" style="margin: 0 4px;">
          <button class="action-pill-btn" onclick="adjustFontSize(-0.1)" title="Reducir letra" style="padding: 6px 12px; font-size: 0.82rem; font-weight: 700;">A-</button>
          <button class="action-pill-btn" onclick="adjustFontSize(0.1)" title="Aumentar letra" style="padding: 6px 12px; font-size: 0.82rem; font-weight: 700;">A+</button>
        </div>
        <button class="modal-nav-btn" onclick="navigateModalSong(1)">Siguiente ›</button>
      </div>
    </div>
  </div>

  <!-- Modal for Verse Action (Bottom Sheet) -->
  <div class="modal-overlay" id="verseActionModal" onclick="closeVerseModal(event)">
    <div class="modal-content verse-action-sheet">
      <div class="modal-handle-bar"></div>
      <div class="sheet-verse-ref" id="sheetVerseRef">Génesis 1:1</div>
      <div class="sheet-verse-text" id="sheetVerseText">En el principio creó Dios los cielos y la tierra.</div>
      <div class="sheet-btn-list">
        <button class="sheet-action-btn" onclick="addVerseToActiveNoteAction()">
          <span class="sheet-action-icon">📝</span>
          <div style="text-align: left;">
            <div id="btnAddToNoteTitle">Añadir a Enseñanza / Nota</div>
            <div style="font-size: 0.76rem; font-weight: 500; color: var(--text-muted);" id="btnAddToNoteSub">Relacionar con enseñanza actual o crear nueva</div>
          </div>
        </button>
        <button class="sheet-action-btn" onclick="toggleVerseFavAction()">
          <span class="sheet-action-icon">⭐</span>
          <div style="text-align: left;">
            <div id="btnFavVerseLabel">Marcar como Favorito / Destacado</div>
            <div style="font-size: 0.76rem; font-weight: 500; color: var(--text-muted);">Resaltar en dorado y guardar en favoritos</div>
          </div>
        </button>
        <button class="sheet-action-btn" onclick="copyVerseAction()">
          <span class="sheet-action-icon">📋</span>
          <div style="text-align: left;">
            <div>Copiar Versículo con Referencia</div>
            <div style="font-size: 0.76rem; font-weight: 500; color: var(--text-muted);">Listo para pegar en WhatsApp o notas</div>
          </div>
        </button>
      </div>
    </div>
  </div>

  <!-- Modal for Note Editor & Study Mode -->
  <div class="modal-overlay" id="noteEditorModal" onclick="closeNoteEditorModal(event)">
    <div class="modal-content" style="max-height: 94vh;">
      <div class="modal-handle-bar"></div>
      <div class="modal-header">
        <div style="display: flex; align-items: center; gap: 8px;">
          <select id="editNoteCategory" style="background: var(--chip-bg); border: 1px solid var(--border); color: var(--text); padding: 5px 8px; border-radius: 8px; font-weight: 700; font-family: inherit;">
            <option value="Enseñanza">📖 Enseñanza</option>
            <option value="Meditación">🕊️ Meditación</option>
            <option value="Estudio">📜 Estudio Bíblico</option>
          </select>
          <span id="editNoteDate" style="font-size: 0.75rem; color: var(--text-muted);"></span>
        </div>
        <div style="display: flex; align-items: center; gap: 8px;">
          <button class="modal-close-btn" onclick="closeNoteEditorDirect()">✕</button>
        </div>
      </div>
      <div class="modal-body" style="text-align: left; padding: 14px 18px;">
        
        <!-- Mode Switcher: Study Mode vs Edit Mode -->
        <div class="note-mode-bar">
          <button id="btnModeStudy" class="note-mode-btn active" onclick="setNoteMode(true)">📖 Modo Estudio (Lectura Completa)</button>
          <button id="btnModeEdit" class="note-mode-btn" onclick="setNoteMode(false)">✏️ Editar y Anotar</button>
        </div>

        <!-- Title Container (Display in Study, Input in Edit) -->
        <div id="noteTitleContainer"></div>

        <!-- Action Toolbar -->
        <div style="display: flex; gap: 8px; margin-bottom: 14px;">
          <button id="btnToggleActiveNote" class="modal-nav-btn" style="flex: 1; justify-content: center;" onclick="toggleCurrentNoteActive()">
            📌 Fijar como Enseñanza de Hoy
          </button>
          <button class="modal-nav-btn" onclick="shareCurrentNote()" title="Copiar todo al portapapeles">
            📤 Copiar
          </button>
          <button class="modal-nav-btn" style="color: #ef4444;" onclick="deleteCurrentNote()" title="Eliminar nota">
            🗑️
          </button>
        </div>

        <!-- General Notes Section -->
        <div id="noteGeneralContentContainer"></div>

        <!-- Verses Section Header -->
        <div style="margin-top: 18px; margin-bottom: 10px; display: flex; justify-content: space-between; align-items: center;">
          <label style="font-size: 0.8rem; font-weight: 800; color: var(--text-muted); text-transform: uppercase;">
            Versículos Relacionados (<span id="editNoteVerseCount">0</span>):
          </label>
          <button class="modal-nav-btn" style="padding: 4px 10px; font-size: 0.78rem;" onclick="jumpToBibleFromNote()">
            ➕ Buscar en la Biblia
          </button>
        </div>

        <!-- Verses List (Study or Edit cards) -->
        <div id="editNoteVersesContainer"></div>
      </div>
    </div>
  </div>

  <!-- Modal for Settings -->
  <div class="modal-overlay" id="settingsModal" onclick="closeSettingsModal(event)">
    <div class="modal-content" style="max-height: 85vh;">
      <div class="modal-handle-bar"></div>
      <div class="modal-header">
        <div class="modal-title">Ajustes &amp; Personalización</div>
        <button class="modal-close-btn" onclick="closeSettingsModalDirect()">✕</button>
      </div>
      <div class="modal-body" style="text-align: left; padding: 18px;">
        <div class="settings-group">
          <div class="settings-title">Tema Visual</div>
          <div class="theme-picker">
            <div class="theme-card active" id="themeDark" onclick="setTheme('dark')">Oscuro 🌙</div>
            <div class="theme-card" id="themeLight" onclick="setTheme('light')">Claro ☀️</div>
            <div class="theme-card" id="themeSepia" onclick="setTheme('sepia')">Sepia 📜</div>
          </div>
        </div>

        <div class="settings-group">
          <div class="settings-title">Tamaño de Texto General</div>
          <div class="font-size-row">
            <button class="modal-nav-btn" onclick="adjustFontSize(-0.1)">Reducir A-</button>
            <span id="fontSizeDisplay" style="font-weight: 800; color: var(--primary);">100%</span>
            <button class="modal-nav-btn" onclick="adjustFontSize(0.1)">Aumentar A+</button>
          </div>
        </div>

        <div class="settings-group">
          <div class="settings-title">Copia de Seguridad de Notas</div>
          <p style="font-size: 0.85rem; color: var(--text-muted); margin-bottom: 12px;">
            Tus notas y enseñanzas se guardan automáticamente en tu dispositivo. Puedes copiarlas para guardarlas en otra parte.
          </p>
          <button class="modal-nav-btn" style="width: 100%; justify-content: center;" onclick="exportAllNotes()">
            📋 Copiar Todas mis Notas al Portapapeles
          </button>
        </div>

        <div class="settings-group">
          <div class="settings-title">Acerca de la App</div>
          <div style="font-size: 0.88rem; line-height: 1.6; color: var(--text-muted);">
            <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 6px;">
              <strong style="color: var(--text); font-size: 0.95rem;">Himnario &amp; Santa Biblia</strong>
              <span style="background: var(--chip-active); color: #fff; font-size: 0.74rem; font-weight: 800; padding: 2px 10px; border-radius: 999px;">v4.0 (Mejorada)</span>
            </div>
            <div style="color: var(--primary); font-size: 0.8rem; margin-bottom: 8px; font-weight: 600;">IDMJI • No oficial</div>
            • 233 Himnos en español de la IDMJI con resaltado (x2)<br>
            • 168 Coros en español de la IDMJI con resaltado (x2)<br>
            • Santa Biblia Reina Valera 1960 con Títulos y Pasajes Paralelos<br>
            • Cuaderno de Enseñanzas, Meditaciones y Notas bíblicas<br>
            • Modo Estudio con lectura completa de apuntes sin desbordamientos<br>
            • Compatible con Android (APK) e iOS (Safari Web App Standalone)<br>
            • Funciona 100% sin conexión a internet (Offline).
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- Modal for Book Picker -->
  <div class="modal-overlay" id="bookModal" onclick="closeBookModal(event)">
    <div class="modal-content" style="max-height: 82vh;">
      <div class="modal-handle-bar"></div>
      <div class="modal-header">
        <div class="modal-title">Libros de la Biblia</div>
        <button class="modal-close-btn" onclick="closeBookModalDirect()">✕</button>
      </div>
      <div style="padding: 12px 18px 0 18px;">
        <div class="filter-bar" style="margin-bottom: 0;">
          <button class="filter-chip active" id="btnOT" onclick="filterTestament('OT')">Antiguo Testamento (39)</button>
          <button class="filter-chip" id="btnNT" onclick="filterTestament('NT')">Nuevo Testamento (27)</button>
        </div>
      </div>
      <div class="modal-body" style="padding: 16px 18px;" id="booksGrid" class="grid-books"></div>
    </div>
  </div>

  <!-- Modal for Chapter Picker -->
  <div class="modal-overlay" id="chapterModal" onclick="closeChapterModal(event)">
    <div class="modal-content" style="max-height: 72vh;">
      <div class="modal-handle-bar"></div>
      <div class="modal-header">
        <div class="modal-title" id="chapterModalTitle">Capítulos</div>
        <button class="modal-close-btn" onclick="closeChapterModalDirect()">✕</button>
      </div>
      <div class="modal-body" style="padding: 16px 18px;" id="chaptersGrid" class="grid-chapters"></div>
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
    let userNotes = JSON.parse(localStorage.getItem('idmji_notes') || '[]');
    let activeNoteId = localStorage.getItem('idmji_active_note_id') || null;

    let currentBookIndex = parseInt(localStorage.getItem('currentBookIndex')) || 0;
    let currentChapterIndex = parseInt(localStorage.getItem('currentChapterIndex')) || 0;
    let currentSongInModal = null;
    let currentFavTab = 'alabanzas';
    let currentNotesFilter = 'all';

    // Temporary verse selected for action sheet
    let selectedVerseRef = '';
    let selectedVerseText = '';
    let selectedVerseEl = null;

    // Currently edited note & mode
    let currentEditingNote = null;
    let isNoteStudyMode = true; // default to clean reading study mode!

    function init() {{
      applyTheme(currentTheme);
      applyFontScale();

      ALL_SONGS = [...HIMNOS_DATA, ...COROS_DATA];
      document.getElementById('countHimnos').innerText = HIMNOS_DATA.length;
      document.getElementById('countCoros').innerText = COROS_DATA.length;

      renderSongList('himnos', HIMNOS_DATA);
      renderSongList('coros', COROS_DATA);
      renderBibleChapter();
      renderNotesList();
      updateFavCounters();
      updateActiveNoteBanner();
    }}

    // ==========================================
    // THEME & DISPLAY
    // ==========================================
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

    // Toast
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
      const target = document.getElementById(viewId);
      if (target) {{
        target.classList.add('active');
        currentView = viewId;
      }}
      if (navEl) navEl.classList.add('active');

      if (viewId === 'viewFavoritos') renderFavorites();
      if (viewId === 'viewNotas') renderNotesList();
    }}

    // ==========================================
    // HIMNOS & COROS + REPETITION (x2) PARSER
    // ==========================================
    function formatSongText(rawText) {{
      let lines = rawText.split('\\n');
      let result = [];
      let inRepeat = false;
      let repeatLines = [];
      let repeatCount = 'x2';

      function renderRepeat(arr, count) {{
        let content = arr.join('<br>');
        return '<div class="song-repeat-block"><span class="repeat-icon">//</span> ' + content + ' <span class="repeat-icon">//</span> <span class="repeat-badge">' + count + '</span></div>';
      }}

      for (let line of lines) {{
        let l = line.trim();
        if (!l) {{
          if (inRepeat) {{
            result.push(renderRepeat(repeatLines, repeatCount));
            repeatLines = [];
            inRepeat = false;
          }}
          result.push('');
          continue;
        }}

        // Single line starting and ending with III or ///
        if ((l.startsWith('III ') || l.startsWith('/// ')) && (l.endsWith(' III') || l.endsWith(' ///') || l.endsWith(' II'))) {{
          let inner = l.substring(4, l.length - 3).trim();
          result.push(renderRepeat([inner], 'x3'));
          continue;
        }}

        // Single line starting and ending with II or //
        if ((l.startsWith('II ') || l.startsWith('// ')) && (l.endsWith(' II') || l.endsWith(' //'))) {{
          let inner = l.substring(3, l.length - 3).trim();
          result.push(renderRepeat([inner], 'x2'));
          continue;
        }}

        // Multi-line repeat start
        if (l.startsWith('II ') || l === 'II' || l.startsWith('// ') || l === '//') {{
          if (inRepeat) {{
            result.push(renderRepeat(repeatLines, repeatCount));
            repeatLines = [];
          }}
          inRepeat = true;
          repeatCount = 'x2';
          let c = (l === 'II' || l === '//') ? '' : l.substring(3).trim();
          if (c) repeatLines.push(c);
          continue;
        }}

        // Multi-line repeat end
        if (inRepeat && (l.endsWith(' II') || l === 'II' || l.endsWith(' //') || l === '//')) {{
          let c = (l === 'II' || l === '//') ? '' : l.substring(0, l.length - 3).trim();
          if (c) repeatLines.push(c);
          result.push(renderRepeat(repeatLines, repeatCount));
          repeatLines = [];
          inRepeat = false;
          continue;
        }}

        if (inRepeat) {{
          repeatLines.push(l);
        }} else {{
          let cleaned = l.replace(/\\((?:bis|x2)\\)/gi, '<span class="repeat-badge">x2</span>');
          result.push(cleaned);
        }}
      }}

      if (inRepeat && repeatLines.length > 0) {{
        result.push(renderRepeat(repeatLines, repeatCount));
      }}

      return result.join('\\n');
    }}

    function renderSongList(type, list) {{
      const container = document.getElementById(type + 'ListContainer');
      const prefix = type === 'himnos' ? 'H' : 'C';
      const isCoro = type === 'coros';

      if (!list || list.length === 0) {{
        container.innerHTML = '<div class="empty-state"><div class="empty-icon">🔍</div><p>No se encontraron alabanzas con ese criterio</p></div>';
        return;
      }}

      container.innerHTML = list.map(item => {{
        const isFav = favSongIds.has(item.id);
        const preview = item.stanzas[0] ? item.stanzas[0].replace('CORO:', '').replace(/\\n/g, ' ').replace(/II/g, '').replace(/\\/\\//g, '').trim() : '';
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
    }}

    function onSearchInput(type) {{
      const input = document.getElementById('search' + (type === 'himnos' ? 'Himnos' : 'Coros'));
      const clearBtn = document.getElementById('clearSearch' + (type === 'himnos' ? 'Himnos' : 'Coros'));
      const q = input.value.trim().toLowerCase();
      clearBtn.style.display = q ? 'flex' : 'none';

      const baseList = type === 'himnos' ? HIMNOS_DATA : COROS_DATA;
      if (!q) {{
        renderSongList(type, baseList);
        return;
      }}
      const numMatch = parseInt(q);
      const filtered = baseList.filter(item => {{
        if (!isNaN(numMatch) && item.num === numMatch) return true;
        if (item.title.toLowerCase().includes(q)) return true;
        return item.stanzas.some(st => st.toLowerCase().includes(q));
      }});
      renderSongList(type, filtered);
    }}

    function clearSearch(type) {{
      const input = document.getElementById('search' + (type === 'himnos' ? 'Himnos' : 'Coros'));
      input.value = '';
      onSearchInput(type);
    }}

    function setFilter(type, filter, btn) {{
      btn.parentElement.querySelectorAll('.filter-chip').forEach(c => c.classList.remove('active'));
      btn.classList.add('active');
      const baseList = type === 'himnos' ? HIMNOS_DATA : COROS_DATA;
      if (filter === 'all') {{
        renderSongList(type, baseList);
      }} else {{
        const favs = baseList.filter(s => favSongIds.has(s.id));
        renderSongList(type, favs);
      }}
    }}

    function toggleFavSong(id, e) {{
      if (e) e.stopPropagation();
      if (favSongIds.has(id)) {{
        favSongIds.delete(id);
        showToast('Eliminado de favoritos');
      }} else {{
        favSongIds.add(id);
        showToast('⭐ Guardado en favoritos');
      }}
      localStorage.setItem('favSongIds', JSON.stringify([...favSongIds]));
      updateFavCounters();
      renderSongList('himnos', HIMNOS_DATA);
      renderSongList('coros', COROS_DATA);
      if (currentSongInModal && currentSongInModal.id === id) {{
        updateModalFavBtn();
      }}
    }}

    // Song Modal / Dedicated Fullscreen Reader
    function openHymnModal(id) {{
      const song = ALL_SONGS.find(s => s.id === id);
      if (!song) return;
      currentSongInModal = song;
      const prefix = song.type === 'himno' ? 'Himno' : 'Coro';
      document.getElementById('modalSongBadge').innerText = `${{prefix}} ${{song.num}}`;
      document.getElementById('modalSongTitle').innerText = song.title;

      const body = document.getElementById('modalSongBody');
      const heroHtml = `
        <div class="song-hero-banner">
          <div class="song-hero-badge">${{prefix.toUpperCase()}} ${{song.num}}</div>
          <h1 class="song-hero-title">${{song.title}}</h1>
          <div class="song-hero-divider"></div>
        </div>
      `;
      body.innerHTML = heroHtml + song.stanzas.map(st => {{
        const isCoro = st.startsWith('CORO:');
        const text = isCoro ? st.replace('CORO:', '').trim() : st.trim();
        const formatted = formatSongText(text);
        return `<div class="${{isCoro ? 'coro-stanza' : 'stanza'}}">${{formatted}}</div>`;
      }}).join('');

      updateModalFavBtn();
      document.getElementById('hymnModal').classList.add('open');
      body.scrollTop = 0;
      try {{
        history.pushState({{ readerOpen: true }}, '');
      }} catch (e) {{}}
    }}
    function closeHymnModal(e) {{
      // Do nothing: accidental taps outside or on margins DO NOT close the song
    }}
    function closeHymnModalDirect() {{
      document.getElementById('hymnModal').classList.remove('open');
      currentSongInModal = null;
    }}
    function updateModalFavBtn() {{
      const btn = document.getElementById('modalFavBtn');
      if (!currentSongInModal) return;
      btn.className = 'fav-btn ' + (favSongIds.has(currentSongInModal.id) ? 'is-fav' : '');
    }}
    function toggleModalFav() {{
      if (currentSongInModal) toggleFavSong(currentSongInModal.id);
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

    // ==========================================
    // SANTA BIBLIA REINA VALERA 1960 WITH CROSS-REFS
    // ==========================================
    function renderBibleChapter() {{
      const book = BIBLIA[currentBookIndex];
      const chapters = book.chapters;
      if (currentChapterIndex >= chapters.length) currentChapterIndex = 0;
      const verses = chapters[currentChapterIndex];

      document.getElementById('currentBookName').innerText = book.name;
      document.getElementById('currentChapterNum').innerText = (currentChapterIndex + 1);
      document.getElementById('navRefLabel').innerText = `${{book.name}} ${{currentChapterIndex + 1}}`;

      const activeNote = userNotes.find(n => n.id === activeNoteId);
      const activeNoteRefs = activeNote ? new Set(activeNote.verses.map(v => v.ref)) : new Set();

      const container = document.getElementById('verseListContainer');
      let html = '';
      for (let i = 0; i < verses.length; i++) {{
        const item = verses[i];
        const vNum = item.v;
        const text = item.t;
        const heading = item.h;
        const crossref = item.xr;
        const ref = `${{book.name}} ${{currentChapterIndex + 1}}:${{vNum}}`;
        const isSaved = favVerses.some(fv => fv.ref === ref);
        const inActive = activeNoteRefs.has(ref);

        if (heading) {{
          html += `<div class="verse-section-title">${{heading}}</div>`;
        }}
        if (crossref) {{
          html += `<div class="verse-section-crossref">📖 Pasajes paralelos: ${{crossref}}</div>`;
        }}

        // Clean text for onclick attributes and display (ensure no bracketed numbers or tags remain)
        const plainText = text.replace(/<[^>]+>/g, '').replace(/\[\s*\d+\s*†?\s*\]/g, '').replace(/'/g, "\\\\'").replace(/"/g, '&quot;').trim();
        const displayVText = text.replace(/<[^>]+>/g, '').replace(/\[\s*\d+\s*†?\s*\]/g, '').trim();
        html += `
          <div class="verse-item ${{isSaved ? 'saved' : ''}} ${{inActive ? 'in-active-note' : ''}}" 
               id="verse-${{vNum}}" data-verse="${{vNum}}"
               onclick="openVerseActionSheet(this, '${{ref}}', '${{plainText}}')">
            <span class="verse-num">${{vNum}}</span>${{displayVText}}
          </div>
        `;
      }}
      container.innerHTML = html;
      localStorage.setItem('currentBookIndex', currentBookIndex);
      localStorage.setItem('currentChapterIndex', currentChapterIndex);
    }}

    function navigateChapter(dir) {{
      const book = BIBLIA[currentBookIndex];
      let newChap = currentChapterIndex + dir;
      if (newChap >= 0 && newChap < book.chapters.length) {{
        currentChapterIndex = newChap;
        renderBibleChapter();
        document.getElementById('mainContainer').scrollTop = 0;
      }} else if (dir > 0 && currentBookIndex + 1 < BIBLIA.length) {{
        currentBookIndex++;
        currentChapterIndex = 0;
        renderBibleChapter();
        document.getElementById('mainContainer').scrollTop = 0;
      }} else if (dir < 0 && currentBookIndex - 1 >= 0) {{
        currentBookIndex--;
        currentChapterIndex = BIBLIA[currentBookIndex].chapters.length - 1;
        renderBibleChapter();
        document.getElementById('mainContainer').scrollTop = 0;
      }}
    }}

    // ==========================================
    // VERSE ACTION SHEET (MENU CONTEXTUAL)
    // ==========================================
    function openVerseActionSheet(el, ref, text) {{
      selectedVerseRef = ref;
      selectedVerseText = text.replace(/\\'/g, "'").replace(/&quot;/g, '"');
      selectedVerseEl = el;

      document.getElementById('sheetVerseRef').innerText = ref;
      document.getElementById('sheetVerseText').innerText = `"${{selectedVerseText}}"`;

      const isSaved = favVerses.some(fv => fv.ref === ref);
      document.getElementById('btnFavVerseLabel').innerText = isSaved ? 'Desmarcar de Favoritos' : 'Marcar como Favorito / Destacado';

      const activeNote = userNotes.find(n => n.id === activeNoteId);
      if (activeNote) {{
        const alreadyIn = activeNote.verses.some(v => v.ref === ref);
        document.getElementById('btnAddToNoteTitle').innerText = alreadyIn ? 'Ya está en la enseñanza de hoy' : `Añadir a: "${{activeNote.title}}"`;
        document.getElementById('btnAddToNoteSub').innerText = 'Toca para vincular a tu sesión de enseñanza activa';
      }} else {{
        document.getElementById('btnAddToNoteTitle').innerText = 'Añadir a Enseñanza / Meditación';
        document.getElementById('btnAddToNoteSub').innerText = 'Crear nueva nota o seleccionar una existente';
      }}

      document.getElementById('verseActionModal').classList.add('open');
    }}

    function closeVerseModal(e) {{
      if (e.target.id === 'verseActionModal') closeVerseModalDirect();
    }}
    function closeVerseModalDirect() {{
      document.getElementById('verseActionModal').classList.remove('open');
    }}

    function addVerseToActiveNoteAction() {{
      closeVerseModalDirect();
      if (!activeNoteId || !userNotes.some(n => n.id === activeNoteId)) {{
        const now = new Date();
        const dateStr = now.toLocaleDateString('es-ES', {{ day: 'numeric', month: 'short', year: 'numeric' }});
        const newNote = {{
          id: 'note_' + Date.now(),
          title: 'Enseñanza del ' + dateStr,
          category: 'Enseñanza',
          date: dateStr,
          content: '',
          verses: [{{
            ref: selectedVerseRef,
            text: selectedVerseText,
            bookIndex: currentBookIndex,
            chapterIndex: currentChapterIndex,
            note: ''
          }}]
        }};
        userNotes.unshift(newNote);
        activeNoteId = newNote.id;
        saveNotesToStorage();
        updateActiveNoteBanner();
        showToast(`📝 Creada y vinculada: "${{newNote.title}}"`);
        if (selectedVerseEl) selectedVerseEl.classList.add('in-active-note');
      }} else {{
        const note = userNotes.find(n => n.id === activeNoteId);
        if (!note.verses.some(v => v.ref === selectedVerseRef)) {{
          note.verses.push({{
            ref: selectedVerseRef,
            text: selectedVerseText,
            bookIndex: currentBookIndex,
            chapterIndex: currentChapterIndex,
            note: ''
          }});
          saveNotesToStorage();
          updateActiveNoteBanner();
          showToast(`📝 Versículo añadido a: "${{note.title}}"`);
          if (selectedVerseEl) selectedVerseEl.classList.add('in-active-note');
        }} else {{
          showToast('El versículo ya estaba vinculado a esta nota');
        }}
      }}
    }}

    function toggleVerseFavAction() {{
      closeVerseModalDirect();
      const ref = selectedVerseRef;
      const text = selectedVerseText;
      const isSaved = favVerses.some(fv => fv.ref === ref);
      if (isSaved) {{
        favVerses = favVerses.filter(fv => fv.ref !== ref);
        if (selectedVerseEl) selectedVerseEl.classList.remove('saved');
        showToast('Versículo desmarcado');
      }} else {{
        favVerses.unshift({{ ref, text, date: new Date().toLocaleDateString() }});
        if (selectedVerseEl) selectedVerseEl.classList.add('saved');
        showToast(`⭐ Señalado: ${{ref}}`);
      }}
      localStorage.setItem('favVerses', JSON.stringify(favVerses));
      updateFavCounters();
    }}

    function copyVerseAction() {{
      closeVerseModalDirect();
      const fullText = `"${{selectedVerseText}}" - ${{selectedVerseRef}} (Reina Valera 1960)`;
      navigator.clipboard.writeText(fullText).then(() => {{
        showToast('📋 Versículo copiado al portapapeles');
      }}).catch(() => {{
        showToast('Copia lista');
      }});
    }}

    // ==========================================
    // NOTAS & ENSEÑANZAS (STUDY MODE & MULTI-LINE)
    // ==========================================
    function saveNotesToStorage() {{
      localStorage.setItem('idmji_notes', JSON.stringify(userNotes));
      localStorage.setItem('idmji_active_note_id', activeNoteId || '');
      document.getElementById('countNotes').innerText = userNotes.length;
    }}

    function updateActiveNoteBanner() {{
      const banner = document.getElementById('activeNoteBanner');
      if (!banner) return;
      const activeNote = userNotes.find(n => n.id === activeNoteId);
      if (activeNote) {{
        banner.style.display = 'flex';
        document.getElementById('activeNoteBannerTitle').innerText = activeNote.title || 'Enseñanza Activa';
        document.getElementById('activeNoteBannerCount').innerText = `${{activeNote.verses.length}} versículos 📝`;
      }} else {{
        banner.style.display = 'none';
      }}
    }}

    function openActiveNote() {{
      const activeNote = userNotes.find(n => n.id === activeNoteId);
      if (activeNote) openNoteEditor(activeNote.id);
    }}

    function createNewNote() {{
      const now = new Date();
      const dateStr = now.toLocaleDateString('es-ES', {{ day: 'numeric', month: 'short', year: 'numeric' }});
      const newNote = {{
        id: 'note_' + Date.now(),
        title: '',
        category: 'Enseñanza',
        date: dateStr,
        content: '',
        verses: []
      }};
      userNotes.unshift(newNote);
      activeNoteId = newNote.id;
      saveNotesToStorage();
      isNoteStudyMode = false; // new note opens in edit mode!
      openNoteEditor(newNote.id);
    }}

    function filterNotesCategory(cat, el) {{
      currentNotesFilter = cat;
      document.querySelectorAll('#viewNotas .filter-chip').forEach(c => c.classList.remove('active'));
      el.classList.add('active');
      renderNotesList();
    }}

    function renderNotesList() {{
      const container = document.getElementById('notesListContainer');
      const q = (document.getElementById('searchNotas').value || '').trim().toLowerCase();

      let list = userNotes;
      if (currentNotesFilter !== 'all') {{
        list = list.filter(n => n.category === currentNotesFilter);
      }}
      if (q) {{
        list = list.filter(n => {{
          if (n.title && n.title.toLowerCase().includes(q)) return true;
          if (n.content && n.content.toLowerCase().includes(q)) return true;
          return n.verses.some(v => v.ref.toLowerCase().includes(q) || v.text.toLowerCase().includes(q));
        }});
      }}

      document.getElementById('countNotes').innerText = userNotes.length;

      if (list.length === 0) {{
        container.innerHTML = `
          <div class="empty-state">
            <div class="empty-icon">📝</div>
            <p><strong>Aún no tienes notas o enseñanzas registradas</strong><br>
            Toca el botón "+ Nueva Enseñanza / Meditación" para empezar o añade versículos directamente mientras lees la Santa Biblia.</p>
          </div>
        `;
        return;
      }}

      container.innerHTML = list.map(note => {{
        const isActive = note.id === activeNoteId;
        const versePills = note.verses.slice(0, 5).map(v => `<span class="note-verse-pill" onclick="event.stopPropagation(); goToBibleVerse('${{v.ref}}')" title="Ir a este versículo en la Biblia">📖 ${{v.ref}}</span>`).join('');
        const moreCount = note.verses.length > 5 ? `<span class="note-verse-pill">+${{note.verses.length - 5}}</span>` : '';
        const preview = note.content || (note.verses[0] && note.verses[0].note) || 'Sin anotaciones adicionales...';

        return `
          <div class="note-item-card" onclick="openNoteEditor('${{note.id}}')">
            <div class="note-card-top">
              <span class="note-card-type">${{note.category || 'Enseñanza'}} ${{isActive ? '• 📌 ACTIVA' : ''}}</span>
              <span class="note-card-date">${{note.date}}</span>
            </div>
            <div class="note-card-title">${{note.title || 'Enseñanza sin título'}}</div>
            <div class="note-card-preview">${{preview}}</div>
            <div class="note-verses-pills">
              ${{versePills}} ${{moreCount}}
            </div>
          </div>
        `;
      }}).join('');
    }}

    // Editor & Study Mode Switcher
    function setNoteMode(isStudy) {{
      isNoteStudyMode = isStudy;
      document.getElementById('btnModeStudy').classList.toggle('active', isStudy);
      document.getElementById('btnModeEdit').classList.toggle('active', !isStudy);
      renderNoteModalBody();
    }}

    function openNoteEditor(noteId) {{
      const note = userNotes.find(n => n.id === noteId);
      if (!note) return;
      currentEditingNote = note;

      // If existing note with content, default to Study Mode (Reading) so they can read easily!
      // If empty/new note, open in edit mode
      if (note.title || note.content || note.verses.length > 0) {{
        isNoteStudyMode = true;
      }} else {{
        isNoteStudyMode = false;
      }}
      document.getElementById('btnModeStudy').classList.toggle('active', isNoteStudyMode);
      document.getElementById('btnModeEdit').classList.toggle('active', !isNoteStudyMode);

      document.getElementById('editNoteCategory').value = note.category || 'Enseñanza';
      document.getElementById('editNoteDate').innerText = note.date;
      document.getElementById('editNoteVerseCount').innerText = note.verses.length;

      const btnActive = document.getElementById('btnToggleActiveNote');
      btnActive.innerText = (note.id === activeNoteId) ? '📌 Enseñanza de Hoy (Fijada)' : '📌 Fijar como Enseñanza de Hoy';
      btnActive.style.background = (note.id === activeNoteId) ? 'var(--primary-gradient)' : 'var(--chip-bg)';
      btnActive.style.color = (note.id === activeNoteId) ? '#fff' : 'var(--text)';

      renderNoteModalBody();
      document.getElementById('noteEditorModal').classList.add('open');
    }}

    function renderNoteModalBody() {{
      if (!currentEditingNote) return;
      const note = currentEditingNote;

      // 1. Title Container
      const titleBox = document.getElementById('noteTitleContainer');
      if (isNoteStudyMode) {{
        titleBox.innerHTML = `
          <div style="font-size: 1.3rem; font-weight: 800; color: var(--text); margin-bottom: 12px; letter-spacing: -0.3px;">
            ${{note.title || '<span style=\"color: var(--text-muted); font-style: italic;\">Sin título</span>'}}
          </div>
        `;
      }} else {{
        titleBox.innerHTML = `
          <input type="text" id="editNoteTitle" class="note-input-title" placeholder="Título de la enseñanza o meditación..." value="${{note.title || ''}}" oninput="autoSaveCurrentNote()">
        `;
      }}

      // 2. General Content Container
      const genBox = document.getElementById('noteGeneralContentContainer');
      if (isNoteStudyMode) {{
        if (note.content) {{
          genBox.innerHTML = `
            <label style="font-size: 0.78rem; font-weight: 800; color: var(--text-muted); text-transform: uppercase; margin-bottom: 6px; display: block;">
              Notas y Reflexiones:
            </label>
            <div class="study-general-content">${{note.content}}</div>
          `;
        }} else {{
          genBox.innerHTML = '';
        }}
      }} else {{
        genBox.innerHTML = `
          <label style="font-size: 0.78rem; font-weight: 800; color: var(--text-muted); text-transform: uppercase; margin-bottom: 6px; display: block;">
            Anotaciones y Reflexiones:
          </label>
          <textarea id="editNoteContent" class="note-textarea" placeholder="Escribe aquí las notas de la enseñanza, palabras clave, reflexiones..." oninput="autoSaveCurrentNote()">${{note.content || ''}}</textarea>
        `;
      }}

      // 3. Verses Container
      renderLinkedVersesInEditor();
    }}

    function autoResizeTextarea(el) {{
      el.style.height = 'auto';
      el.style.height = (el.scrollHeight + 4) + 'px';
    }}

    function renderLinkedVersesInEditor() {{
      const container = document.getElementById('editNoteVersesContainer');
      if (!currentEditingNote || currentEditingNote.verses.length === 0) {{
        container.innerHTML = '<div style="font-size: 0.85rem; color: var(--text-muted); font-style: italic; padding: 12px 0;">No has añadido versículos a esta enseñanza aún. Toca "Buscar en la Biblia" para explorar y relacionar versículos.</div>';
        return;
      }}

      if (isNoteStudyMode) {{
        // STUDY MODE: COMPLETE DISPLAY, ZERO HORIZONTAL SCROLLING, WRAPPED TEXT
        container.innerHTML = currentEditingNote.verses.map((v, idx) => {{
          const userNoteBlock = v.note ? `
            <div class="study-user-note">
              <span style="font-weight: 700; color: var(--primary);">✍️ Mi Apunte:</span>
              <div style="margin-top: 4px; line-height: 1.55;">${{v.note}}</div>
            </div>
          ` : `
            <button class="modal-nav-btn" style="margin-top: 8px; padding: 4px 10px; font-size: 0.78rem;" onclick="setNoteMode(false)">+ Añadir apunte a este versículo</button>
          `;

          return `
            <div class="note-linked-verse-card">
              <div class="note-linked-ref">
                <span>📖 ${{v.ref}}</span>
                <button class="modal-nav-btn" style="padding: 4px 12px; font-size: 0.78rem; font-weight: 700; color: var(--primary);" onclick="event.stopPropagation(); goToBibleVerse('${{v.ref}}')">Ir a Biblia ➔</button>
              </div>
              <div class="note-linked-text">"${{v.text}}"</div>
              ${{userNoteBlock}}
            </div>
          `;
        }}).join('');
      }} else {{
        // EDIT MODE: AUTO-EXPANDING TEXTAREAS
        container.innerHTML = currentEditingNote.verses.map((v, idx) => {{
          return `
            <div class="note-linked-verse-card">
              <div class="note-linked-ref">
                <span>📖 ${{v.ref}}</span>
                <div style="display: flex; gap: 6px;">
                  <button class="modal-nav-btn" style="padding: 3px 8px; font-size: 0.72rem; color: var(--primary);" onclick="event.stopPropagation(); goToBibleVerse('${{v.ref}}')">Ir a Biblia ➔</button>
                  <button class="modal-nav-btn" style="padding: 3px 8px; font-size: 0.72rem; color: #ef4444;" onclick="removeVerseFromNote(${{idx}})">✕</button>
                </div>
              </div>
              <div class="note-linked-text">"${{v.text}}"</div>
              <textarea class="note-linked-comment" rows="2" 
                placeholder="Escribe aquí tu apunte o reflexión sobre este versículo..." 
                oninput="autoResizeTextarea(this); updateVerseNoteComment(${{idx}}, this.value)">${{v.note || ''}}</textarea>
            </div>
          `;
        }}).join('');

        // Trigger initial height auto-expansion
        setTimeout(() => {{
          container.querySelectorAll('.note-linked-comment').forEach(ta => autoResizeTextarea(ta));
        }}, 50);
      }}
    }}

    function updateVerseNoteComment(idx, val) {{
      if (currentEditingNote && currentEditingNote.verses[idx]) {{
        currentEditingNote.verses[idx].note = val;
        saveNotesToStorage();
      }}
    }}

    function removeVerseFromNote(idx) {{
      if (currentEditingNote) {{
        currentEditingNote.verses.splice(idx, 1);
        document.getElementById('editNoteVerseCount').innerText = currentEditingNote.verses.length;
        renderLinkedVersesInEditor();
        saveNotesToStorage();
        updateActiveNoteBanner();
        showToast('Versículo removido de la enseñanza');
      }}
    }}

    function autoSaveCurrentNote() {{
      if (!currentEditingNote) return;
      const titleEl = document.getElementById('editNoteTitle');
      if (titleEl) currentEditingNote.title = titleEl.value;
      const contentEl = document.getElementById('editNoteContent');
      if (contentEl) currentEditingNote.content = contentEl.value;
      currentEditingNote.category = document.getElementById('editNoteCategory').value;
      saveNotesToStorage();
      updateActiveNoteBanner();
    }}

    document.getElementById('editNoteCategory').addEventListener('change', autoSaveCurrentNote);

    function toggleCurrentNoteActive() {{
      if (!currentEditingNote) return;
      if (activeNoteId === currentEditingNote.id) {{
        activeNoteId = null;
        showToast('Enseñanza activa desfijada');
      }} else {{
        activeNoteId = currentEditingNote.id;
        showToast(`📌 Fijada como enseñanza activa: "${{currentEditingNote.title || 'Hoy'}}"`);
      }}
      saveNotesToStorage();
      updateActiveNoteBanner();
      openNoteEditor(currentEditingNote.id);
      renderBibleChapter();
    }}

    function jumpToBibleFromNote() {{
      closeNoteEditorDirect();
      const navBiblia = document.querySelectorAll('.nav-item')[2];
      switchView('viewBiblia', navBiblia);
      showToast('Navega por la Biblia y toca cualquier versículo para anexarlo');
    }}

    function goToBibleVerse(ref, bookIdx, chapIdx) {{
      try {{
        if (window.event) window.event.stopPropagation();
        closeVerseModalDirect();
        closeNoteEditorDirect();
      }} catch (e) {{}}
      let targetBookIdx = (typeof bookIdx === 'number' && bookIdx >= 0) ? bookIdx : null;
      let targetChapIdx = (typeof chapIdx === 'number' && chapIdx >= 0) ? chapIdx : null;
      let targetVerseNum = null;

      if (ref) {{
        // Regex to parse e.g. "Génesis 4:7", "1 Juan 3:12", "San Mateo 3:2"
        const m = ref.match(/^(.*?)\s+(\d+):(\d+)$/);
        if (m) {{
          const bName = m[1].trim().toLowerCase();
          const chNum = parseInt(m[2], 10);
          targetVerseNum = parseInt(m[3], 10);

          if (targetBookIdx === null || targetChapIdx === null) {{
            const cleanTargetName = bName.normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/\./g, "").trim();
            const foundIdx = BIBLIA.findIndex(b => {{
              const n1 = b.name.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim();
              const n2 = b.short.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/\./g, "").trim();
              return n1 === cleanTargetName || n2 === cleanTargetName || n1.includes(cleanTargetName);
            }});
            if (foundIdx !== -1) {{
              targetBookIdx = foundIdx;
              targetChapIdx = chNum - 1;
            }}
          }}
        }}
      }}

      if (targetBookIdx !== null && targetChapIdx !== null) {{
        currentBookIndex = targetBookIdx;
        currentChapterIndex = targetChapIdx;
      }}

      // Save Bible state
      localStorage.setItem('currentBookIndex', currentBookIndex);
      localStorage.setItem('currentChapterIndex', currentChapterIndex);

      // Render the target chapter
      renderBibleChapter();

      // Switch view to Biblia tab
      const navBiblia = document.querySelectorAll('.nav-item')[2];
      switchView('viewBiblia', navBiblia);

      // Scroll directly to the indicated verse with eye-catching pulse highlight
      if (targetVerseNum !== null) {{
        setTimeout(() => {{
          const verseEl = document.getElementById(`verse-${{targetVerseNum}}`);
          if (verseEl) {{
            verseEl.scrollIntoView({{ behavior: 'smooth', block: 'center' }});
            verseEl.classList.remove('verse-pulse-highlight');
            void verseEl.offsetWidth; // trigger reflow
            verseEl.classList.add('verse-pulse-highlight');
            setTimeout(() => verseEl.classList.remove('verse-pulse-highlight'), 3500);
          }}
        }}, 350);
      }}

      showToast(`📖 ${{ref}}`);
    }}

    function shareCurrentNote() {{
      if (!currentEditingNote) return;
      let text = `📝 IDMJI - ${{currentEditingNote.category || 'Enseñanza'}}:\\n`;
      text += `"${{currentEditingNote.title || 'Sin título'}}"\\n`;
      text += `Fecha: ${{currentEditingNote.date}}\\n\\n`;
      if (currentEditingNote.content) {{
        text += `Notas:\\n${{currentEditingNote.content}}\\n\\n`;
      }}
      if (currentEditingNote.verses && currentEditingNote.verses.length > 0) {{
        text += `Versículos Relacionados:\\n`;
        currentEditingNote.verses.forEach(v => {{
          text += `• ${{v.ref}}: "${{v.text}}"\\n`;
          if (v.note) text += `  Apunte: ${{v.note}}\\n`;
        }});
      }}
      navigator.clipboard.writeText(text).then(() => {{
        showToast('📤 Enseñanza copiada al portapapeles');
      }}).catch(() => {{
        showToast('Copia realizada');
      }});
    }}

    function deleteCurrentNote() {{
      if (!currentEditingNote) return;
      userNotes = userNotes.filter(n => n.id !== currentEditingNote.id);
      if (activeNoteId === currentEditingNote.id) activeNoteId = null;
      saveNotesToStorage();
      updateActiveNoteBanner();
      closeNoteEditorDirect();
      renderNotesList();
      showToast('🗑️ Nota eliminada');
    }}

    function closeNoteEditorModal(e) {{
      if (e.target.id === 'noteEditorModal') closeNoteEditorDirect();
    }}
    function closeNoteEditorDirect() {{
      autoSaveCurrentNote();
      document.getElementById('noteEditorModal').classList.remove('open');
      currentEditingNote = null;
      renderNotesList();
    }}

    function exportAllNotes() {{
      if (userNotes.length === 0) {{
        showToast('No tienes notas guardadas para exportar');
        return;
      }}
      let dump = `CUADERNO DE ENSEÑANZAS Y MEDITACIONES IDMJI\\n`;
      dump += `Total: ${{userNotes.length}} notas\\n===============================\\n\\n`;
      userNotes.forEach((n, i) => {{
        dump += `[${{i + 1}}] ${{n.title || 'Sin título'}} (${{n.category}} - ${{n.date}})\\n`;
        if (n.content) dump += `Notas: ${{n.content}}\\n`;
        if (n.verses.length > 0) {{
          dump += `Versículos:\\n`;
          n.verses.forEach(v => dump += `  - ${{v.ref}}: "${{v.text}}"\\n`);
        }}
        dump += `\\n-------------------------------\\n\\n`;
      }});
      navigator.clipboard.writeText(dump).then(() => {{
        showToast('📋 Todas las notas copiadas al portapapeles');
      }});
    }}

    // ==========================================
    // BOOK & CHAPTER PICKERS
    // ==========================================
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
      document.getElementById('mainContainer').scrollTop = 0;
    }}
    function closeChapterModal(e) {{ if (e.target.id === 'chapterModal') closeChapterModalDirect(); }}
    function closeChapterModalDirect() {{ document.getElementById('chapterModal').classList.remove('open'); }}

    // ==========================================
    // SETTINGS MODAL
    // ==========================================
    function openSettingsModal() {{
      document.getElementById('settingsModal').classList.add('open');
    }}
    function closeSettingsModal(e) {{
      if (e.target.id === 'settingsModal') closeSettingsModalDirect();
    }}
    function closeSettingsModalDirect() {{
      document.getElementById('settingsModal').classList.remove('open');
    }}

    // ==========================================
    // FAVORITES VIEW
    // ==========================================
    function updateFavCounters() {{
      document.getElementById('favSongCount').innerText = favSongIds.size;
      document.getElementById('favVerseCount').innerText = favVerses.length;
    }}
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
          const preview = item.stanzas[0] ? item.stanzas[0].replace('CORO:', '').replace(/\\n/g, ' ').replace(/II/g, '').replace(/\\/\\//g, '').trim() : '';
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
                <div style="font-size: 0.95rem; margin-top: 6px; line-height: 1.5;">${{v.text}}</div>
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
      renderBibleChapter();
    }}

    document.addEventListener('DOMContentLoaded', init);
    window.onload = init;
    setTimeout(init, 50);

    // Register Service Worker for offline PWA on iOS and Android
    if ('serviceWorker' in navigator) {{
      window.addEventListener('load', () => {{
        navigator.serviceWorker.register('./sw.js').catch(() => {{}});
      }});
    }}
  </script>
</body>
</html>"""

out_path = os.path.join(ASSETS_DIR, "index.html")
with open(out_path, "w", encoding="utf-8") as f:
    f.write(html_content)

print(f"Generated v4 index.html with (x2) Song Highlighting, Full Bible Notations, and Study Mode Notes: {out_path} ({os.path.getsize(out_path) / 1024:.2f} KB)")
