import os
import json

BUILD_DIR = r"C:\Users\lenovo\Downloads\Himnario_App_Build"
ASSETS_DIR = os.path.join(BUILD_DIR, "assets")

# Load JSON data
with open(os.path.join(ASSETS_DIR, "himnos.json"), "r", encoding="utf-8") as f:
    himnos = json.load(f)

with open(os.path.join(ASSETS_DIR, "coros.json"), "r", encoding="utf-8") as f:
    coros = json.load(f)

with open(os.path.join(ASSETS_DIR, "biblia.json"), "r", encoding="utf-8") as f:
    biblia = json.load(f)

html_content = """<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover">
  <title>Himnario & Biblia Mejorada</title>
  <!-- Google Fonts -->
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Playfair+Display:ital,wght@0,600;0,700;1,600&display=swap" rel="stylesheet">
  <style>
    :root {
      --bg: #090d16;
      --bg-gradient: radial-gradient(circle at 50% 0%, #172554 0%, #090d16 70%);
      --bg-card: rgba(19, 27, 46, 0.75);
      --bg-card-hover: rgba(30, 41, 69, 0.9);
      --bg-glass: rgba(15, 23, 42, 0.8);
      --text: #f8fafc;
      --text-muted: #94a3b8;
      --primary: #38bdf8;
      --primary-gradient: linear-gradient(135deg, #38bdf8 0%, #6366f1 100%);
      --accent: #fbbf24;
      --accent-gradient: linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%);
      --border: rgba(255, 255, 255, 0.08);
      --border-focus: rgba(56, 189, 248, 0.4);
      --chip-bg: rgba(255, 255, 255, 0.05);
      --chip-active: linear-gradient(135deg, #2563eb, #4f46e5);
      --callout-bg: rgba(37, 99, 235, 0.12);
      --callout-border: rgba(56, 189, 248, 0.3);
      --font-scale: 1;
      --shadow-sm: 0 4px 12px rgba(0, 0, 0, 0.25);
      --shadow-lg: 0 12px 32px rgba(0, 0, 0, 0.45);
      --nav-height: 64px;
    }
    
    body.light {
      --bg: #f1f5f9;
      --bg-gradient: radial-gradient(circle at 50% 0%, #e0f2fe 0%, #f1f5f9 70%);
      --bg-card: rgba(255, 255, 255, 0.85);
      --bg-card-hover: #ffffff;
      --bg-glass: rgba(255, 255, 255, 0.85);
      --text: #0f172a;
      --text-muted: #64748b;
      --primary: #2563eb;
      --primary-gradient: linear-gradient(135deg, #2563eb 0%, #4f46e5 100%);
      --accent: #d97706;
      --accent-gradient: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
      --border: rgba(0, 0, 0, 0.07);
      --border-focus: rgba(37, 99, 235, 0.4);
      --chip-bg: rgba(0, 0, 0, 0.04);
      --chip-active: linear-gradient(135deg, #2563eb, #1d4ed8);
      --callout-bg: rgba(239, 246, 255, 0.9);
      --callout-border: rgba(59, 130, 246, 0.3);
      --shadow-sm: 0 4px 12px rgba(0, 0, 0, 0.06);
      --shadow-lg: 0 12px 32px rgba(0, 0, 0, 0.12);
    }

    body.sepia {
      --bg: #f7f1e5;
      --bg-gradient: radial-gradient(circle at 50% 0%, #fef3c7 0%, #f7f1e5 70%);
      --bg-card: rgba(255, 251, 245, 0.88);
      --bg-card-hover: #ffffff;
      --bg-glass: rgba(247, 241, 229, 0.88);
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
      --callout-bg: rgba(254, 243, 199, 0.7);
      --callout-border: rgba(180, 83, 9, 0.3);
      --shadow-sm: 0 4px 12px rgba(60, 40, 20, 0.06);
      --shadow-lg: 0 12px 32px rgba(60, 40, 20, 0.12);
    }

    * { box-sizing: border-box; -webkit-tap-highlight-color: transparent; margin: 0; padding: 0; }
    body {
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
    }

    /* Top Glass Header */
    header {
      background: var(--bg-glass);
      backdrop-filter: blur(20px);
      -webkit-backdrop-filter: blur(20px);
      border-bottom: 1px solid var(--border);
      padding: 12px 18px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      flex-shrink: 0;
      box-shadow: var(--shadow-sm);
      z-index: 30;
      transition: background 0.3s, border-color 0.3s;
    }
    .header-left {
      display: flex;
      align-items: center;
      gap: 12px;
    }
    .header-logo-icon {
      width: 38px;
      height: 38px;
      border-radius: 12px;
      background: var(--primary-gradient);
      display: flex;
      align-items: center;
      justify-content: center;
      color: #fff;
      font-size: 1.25rem;
      box-shadow: 0 4px 14px rgba(56, 189, 248, 0.35);
      flex-shrink: 0;
    }
    .header-text { display: flex; flex-direction: column; }
    .header-title {
      font-size: 1.15rem;
      font-weight: 800;
      display: flex;
      align-items: center;
      gap: 8px;
      letter-spacing: -0.3px;
    }
    .badge-improved {
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
    }
    .header-sub {
      font-size: 0.73rem;
      font-weight: 500;
      color: var(--text-muted);
    }
    .header-actions {
      display: flex;
      align-items: center;
      gap: 6px;
    }
    .pill-btn-group {
      display: flex;
      background: var(--chip-bg);
      border: 1px solid var(--border);
      border-radius: 10px;
      padding: 2px;
    }
    .action-pill-btn {
      background: transparent;
      border: none;
      color: var(--text);
      font-weight: 700;
      font-size: 0.8rem;
      padding: 6px 10px;
      border-radius: 8px;
      cursor: pointer;
      transition: background 0.15s, transform 0.1s;
    }
    .action-pill-btn:active {
      background: rgba(255, 255, 255, 0.1);
      transform: scale(0.95);
    }
    .theme-round-btn {
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
    }
    .theme-round-btn:active {
      transform: scale(0.9) rotate(20deg);
    }

    /* Main Scroll Area */
    main {
      flex: 1;
      overflow-y: auto;
      padding: 16px;
      padding-bottom: 95px; /* space for floating nav */
      -webkit-overflow-scrolling: touch;
    }

    /* Floating Modern Dock Navigation */
    nav.bottom-nav {
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
    }
    .nav-item {
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
    }
    .nav-item.active {
      color: #fff;
      background: var(--chip-active);
      box-shadow: 0 4px 14px rgba(37, 99, 235, 0.35);
    }
    body.light .nav-item.active { color: #fff; }
    .nav-icon { font-size: 1.25rem; line-height: 1; }

    /* Views */
    .view { display: none; }
    .view.active { display: block; animation: fadeIn 0.2s ease-out; }
    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(6px); }
      to { opacity: 1; transform: translateY(0); }
    }

    /* Modern Search & Filter */
    .search-wrapper {
      position: relative;
      margin-bottom: 14px;
    }
    .search-icon-inside {
      position: absolute;
      left: 14px;
      top: 50%;
      transform: translateY(-50%);
      font-size: 1.05rem;
      color: var(--text-muted);
      pointer-events: none;
    }
    .search-input {
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
    }
    .search-input:focus {
      border-color: var(--primary);
      box-shadow: 0 0 0 3px var(--border-focus);
    }
    .clear-search-btn {
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
    }

    /* Filter Chips */
    .filter-bar {
      display: flex;
      gap: 8px;
      margin-bottom: 16px;
      overflow-x: auto;
      padding-bottom: 4px;
      scrollbar-width: none;
    }
    .filter-bar::-webkit-scrollbar { display: none; }
    .filter-chip {
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
    }
    .filter-chip.active {
      background: var(--chip-active);
      color: #fff;
      border-color: transparent;
      box-shadow: 0 3px 12px rgba(37, 99, 235, 0.3);
    }

    /* Cards */
    .item-card {
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
    }
    .item-card:active {
      background: var(--bg-card-hover);
      transform: scale(0.985);
      border-color: var(--primary);
    }
    .item-left { display: flex; align-items: center; gap: 14px; flex: 1; }
    .item-badge {
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
    }
    .badge-coro { color: #f59e0b; }
    .item-info { display: flex; flex-direction: column; gap: 3px; flex: 1; }
    .item-title {
      font-weight: 700;
      font-size: 1.02rem;
      line-height: 1.3;
      letter-spacing: -0.2px;
    }
    .item-preview {
      font-size: 0.82rem;
      color: var(--text-muted);
      line-height: 1.35;
      display: -webkit-box;
      -webkit-line-clamp: 1;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }
    .fav-btn {
      font-size: 1.35rem;
      color: var(--text-muted);
      padding: 10px;
      cursor: pointer;
      border-radius: 50%;
      transition: transform 0.2s cubic-bezier(0.34, 1.56, 0.64, 1), color 0.2s;
    }
    .fav-btn.is-fav {
      color: var(--accent);
      filter: drop-shadow(0 0 6px rgba(245, 158, 11, 0.5));
    }
    .fav-btn:active { transform: scale(1.35); }

    /* Detail Modal (Hymn Full Reader) */
    .modal-overlay {
      position: fixed;
      top: 0; left: 0; right: 0; bottom: 0;
      background: rgba(0, 0, 0, 0.75);
      backdrop-filter: blur(10px);
      -webkit-backdrop-filter: blur(10px);
      z-index: 100;
      display: none;
      align-items: flex-end;
    }
    .modal-overlay.open { display: flex; }
    .modal-content {
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
    }
    @keyframes sheetUp {
      from { transform: translateY(100%); }
      to { transform: translateY(0); }
    }
    .modal-handle-bar {
      width: 38px;
      height: 5px;
      background: rgba(255, 255, 255, 0.2);
      border-radius: 999px;
      margin: 10px auto 4px auto;
    }
    .modal-header {
      background: var(--bg-glass);
      backdrop-filter: blur(16px);
      border-bottom: 1px solid var(--border);
      padding: 14px 20px;
      display: flex;
      align-items: center;
      justify-content: space-between;
    }
    .modal-body {
      padding: 24px 20px;
      overflow-y: auto;
      flex: 1;
      font-size: calc(1.15rem * var(--font-scale));
      line-height: 1.7;
      user-select: text;
    }
    .stanza {
      margin-bottom: 22px;
      white-space: pre-line;
      letter-spacing: -0.1px;
    }
    .stanza.coro-highlight {
      background: var(--callout-bg);
      border-left: 4px solid var(--primary);
      padding: 16px 18px;
      border-radius: 14px;
      font-style: italic;
      font-weight: 500;
      box-shadow: var(--shadow-sm);
    }

    /* Bible View */
    .bible-selector-bar {
      display: flex;
      gap: 12px;
      margin-bottom: 16px;
    }
    .selector-btn {
      flex: 1;
      background: var(--bg-card);
      border: 1px solid var(--border);
      color: var(--text);
      padding: 14px 18px;
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
    }
    .selector-btn:active {
      transform: scale(0.98);
      border-color: var(--primary);
    }
    .chapter-nav-bar {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 12px 16px;
      margin-bottom: 16px;
      background: var(--bg-card);
      border: 1px solid var(--border);
      border-radius: 16px;
    }
    .bible-heading {
      font-family: 'Playfair Display', Georgia, serif;
      font-size: 1.35rem;
      font-weight: 700;
      color: var(--text);
      letter-spacing: -0.2px;
    }
    .verse-list {
      display: flex;
      flex-direction: column;
      gap: 14px;
      user-select: text;
    }
    .verse-item {
      line-height: 1.7;
      font-size: calc(1.1rem * var(--font-scale));
      padding: 10px 14px;
      border-radius: 14px;
      cursor: pointer;
      transition: background 0.15s, transform 0.1s;
    }
    .verse-item:active {
      background: var(--bg-card);
      transform: scale(0.99);
    }
    .verse-num {
      color: var(--primary);
      font-weight: 800;
      font-size: 0.82rem;
      margin-right: 6px;
      background: var(--chip-bg);
      border: 1px solid var(--border);
      padding: 2px 7px;
      border-radius: 6px;
      display: inline-block;
      vertical-align: baseline;
    }
    .verse-item.saved {
      background: var(--callout-bg);
      border-left: 4px solid var(--accent);
      box-shadow: var(--shadow-sm);
    }

    /* Grids for Book and Chapter Selection */
    .grid-books {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(105px, 1fr));
      gap: 10px;
      margin-top: 14px;
    }
    .book-btn {
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
    }
    .book-btn:active {
      background: var(--primary-gradient);
      color: #fff;
      transform: scale(0.95);
    }
    .grid-chapters {
      display: grid;
      grid-template-columns: repeat(6, 1fr);
      gap: 10px;
      margin-top: 14px;
    }
    .chapter-btn {
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
    }
    .chapter-btn:active {
      background: var(--primary-gradient);
      color: #fff;
      transform: scale(0.95);
    }

    /* Settings Components */
    .settings-group {
      background: var(--bg-card);
      backdrop-filter: blur(12px);
      border: 1px solid var(--border);
      border-radius: 20px;
      padding: 20px;
      margin-bottom: 18px;
      box-shadow: var(--shadow-sm);
    }
    .settings-title {
      font-size: 0.8rem;
      text-transform: uppercase;
      letter-spacing: 0.8px;
      color: var(--text-muted);
      margin-bottom: 14px;
      font-weight: 800;
    }
    .theme-picker {
      display: flex;
      gap: 10px;
    }
    .theme-card {
      flex: 1;
      padding: 16px 8px;
      border-radius: 14px;
      border: 2px solid var(--border);
      text-align: center;
      font-weight: 800;
      font-size: 0.9rem;
      cursor: pointer;
      transition: all 0.2s;
    }
    .theme-card.active {
      border-color: var(--primary);
      background: var(--chip-bg);
      box-shadow: 0 4px 14px rgba(56, 189, 248, 0.2);
    }
    .font-size-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-top: 10px;
    }

    /* Floating Toast */
    .toast {
      position: fixed;
      bottom: 90px;
      left: 50%;
      transform: translateX(-50%);
      background: rgba(15, 23, 42, 0.92);
      backdrop-filter: blur(12px);
      border: 1px solid var(--border);
      color: #fff;
      padding: 10px 20px;
      border-radius: 999px;
      font-size: 0.88rem;
      font-weight: 700;
      z-index: 200;
      display: none;
      box-shadow: var(--shadow-lg);
      animation: popToast 0.2s ease-out;
    }
    @keyframes popToast {
      from { transform: translate(-50%, 10px); opacity: 0; }
      to { transform: translate(-50%, 0); opacity: 1; }
    }
    .empty-state {
      text-align: center;
      padding: 50px 20px;
      color: var(--text-muted);
    }
    .empty-icon { font-size: 3.5rem; margin-bottom: 12px; }
  </style>
</head>
<body class="dark">

  <!-- Header -->
  <header>
    <div class="header-left">
      <div class="header-logo-icon">✝</div>
      <div class="header-text">
        <div class="header-title">
          Himnario & Biblia
          <span class="badge-improved">✦ App Mejorada ✦</span>
        </div>
        <div class="header-sub">Coros, Himnos & Reina Valera 1960</div>
      </div>
    </div>
    <div class="header-actions">
      <div class="pill-btn-group">
        <button class="action-pill-btn" onclick="adjustFont(-0.1)" title="Reducir">A-</button>
        <button class="action-pill-btn" onclick="adjustFont(0.1)" title="Aumentar">A+</button>
      </div>
      <button class="theme-round-btn" onclick="cycleTheme()" id="themeIconBtn">🌙</button>
    </div>
  </header>

  <!-- Main Scroll View -->
  <main>

    <!-- TAB 1: HIMNOS Y COROS -->
    <section id="viewHimnos" class="view active">
      <div class="search-wrapper">
        <span class="search-icon-inside">🔍</span>
        <input type="text" id="himnoSearch" class="search-input" placeholder="Buscar por número o letra (ej. 4, gloria, gracia)..." oninput="filterHimnos()">
        <button id="clearSearchBtn" class="clear-search-btn" onclick="clearHimnoSearch()">✕</button>
      </div>

      <div class="filter-bar">
        <button class="filter-chip active" onclick="setHimnoFilter('todos', this)">Todos</button>
        <button class="filter-chip" onclick="setHimnoFilter('himno', this)">🎶 Himnos</button>
        <button class="filter-chip" onclick="setHimnoFilter('coro', this)">🎺 Coros</button>
      </div>

      <div id="himnosListContainer"></div>
    </section>

    <!-- TAB 2: SANTA BIBLIA REINA VALERA 1960 -->
    <section id="viewBiblia" class="view">
      <div class="bible-selector-bar">
        <button class="selector-btn" onclick="openBookPicker()">
          <span style="display: flex; align-items: center; gap: 8px;">
            <span>📖</span>
            <span id="currentBookName">Génesis</span>
          </span>
          <span style="color: var(--primary);">▾</span>
        </button>
        <button class="selector-btn" style="max-width: 140px;" onclick="openChapterPicker()">
          <span>Cap. <span id="currentChapterNum">1</span></span>
          <span style="color: var(--primary);">▾</span>
        </button>
      </div>

      <div class="chapter-nav-bar">
        <button class="action-pill-btn" style="background: var(--chip-bg);" onclick="navigateChapter(-1)">◀ Anterior</button>
        <div class="bible-heading" id="navRefLabel">Génesis 1</div>
        <button class="action-pill-btn" style="background: var(--chip-bg);" onclick="navigateChapter(1)">Siguiente ▶</button>
      </div>

      <div class="verse-list" id="verseListContainer"></div>
    </section>

    <!-- TAB 3: FAVORITOS & LISTAS DE CULTO -->
    <section id="viewFavoritos" class="view">
      <div class="filter-bar" style="margin-bottom: 14px;">
        <button class="filter-chip active" onclick="setFavTab('alabanzas', this)">🎵 Alabanzas (<span id="favHimnosCount">0</span>)</button>
        <button class="filter-chip" onclick="setFavTab('versiculos', this)">📖 Versículos (<span id="favVersesCount">0</span>)</button>
      </div>
      <div id="favListContainer"></div>
    </section>

    <!-- TAB 4: AJUSTES -->
    <section id="viewAjustes" class="view">
      <div class="settings-group">
        <div class="settings-title">Apariencia Visual</div>
        <div class="theme-picker">
          <div class="theme-card active" onclick="setTheme('dark')">🌙 Noche OLED</div>
          <div class="theme-card" onclick="setTheme('light')">☀️ Día Claro</div>
          <div class="theme-card" onclick="setTheme('sepia')">📜 Pergamino</div>
        </div>
      </div>

      <div class="settings-group">
        <div class="settings-title">Ajuste de Lectura</div>
        <div class="font-size-row">
          <span>Tamaño de fuente: <b id="fontScaleLabel" style="color: var(--primary);">100%</b></span>
          <div class="pill-btn-group">
            <button class="action-pill-btn" onclick="adjustFont(-0.1)">A-</button>
            <button class="action-pill-btn" onclick="resetFont()">Normal</button>
            <button class="action-pill-btn" onclick="adjustFont(0.1)">A+</button>
          </div>
        </div>
      </div>

      <div class="settings-group">
        <div class="settings-title">Información del Sistema</div>
        <div style="font-size: 0.95rem; line-height: 1.6; color: var(--text-muted);">
          <p><b style="color: var(--text);">Himnario & Santa Biblia</b></p>
          <p>Edición: <span style="color: var(--primary); font-weight: 700;">App Mejorada v1.2</span></p>
          <p>Texto Bíblico: Reina Valera 1960 (66 libros completos)</p>
          <p>Himnos y Coros oficiales unificados con favoritos</p>
          <p style="margin-top: 12px; color: #10b981; font-weight: 800; display: flex; align-items: center; gap: 6px;">
            <span>🟢</span> 100% Offline (Sin conexión a internet requerida)
          </p>
        </div>
      </div>
    </section>

  </main>

  <!-- Modern Floating Dock Navigation Bar -->
  <nav class="bottom-nav">
    <div class="nav-item active" onclick="switchNav('viewHimnos', this)">
      <span class="nav-icon">🎵</span>
      <span>Himnario</span>
    </div>
    <div class="nav-item" onclick="switchNav('viewBiblia', this)">
      <span class="nav-icon">📖</span>
      <span>Biblia</span>
    </div>
    <div class="nav-item" onclick="switchNav('viewFavoritos', this)">
      <span class="nav-icon">⭐</span>
      <span>Favoritos</span>
    </div>
    <div class="nav-item" onclick="switchNav('viewAjustes', this)">
      <span class="nav-icon">⚙️</span>
      <span>Ajustes</span>
    </div>
  </nav>

  <!-- Hymn Fullscreen Reader Sheet -->
  <div id="hymnModal" class="modal-overlay" onclick="closeHymnModal(event)">
    <div class="modal-content" onclick="event.stopPropagation()">
      <div class="modal-handle-bar"></div>
      <div class="modal-header">
        <div>
          <span id="modalHymnBadge" class="badge-improved" style="margin-right: 6px;">H-1</span>
          <b id="modalHymnTitle" style="font-size: 1.1rem; letter-spacing: -0.2px;">Título</b>
        </div>
        <div style="display: flex; gap: 8px; align-items: center;">
          <span id="modalHymnFavBtn" class="fav-btn" onclick="toggleModalFav()">⭐</span>
          <button class="action-pill-btn" style="background: var(--chip-bg);" onclick="closeHymnModalDirect()">✕ Cerrar</button>
        </div>
      </div>
      <div class="modal-body" id="modalHymnBody"></div>
    </div>
  </div>

  <!-- Book Picker Modal -->
  <div id="bookModal" class="modal-overlay" onclick="closeBookModal(event)">
    <div class="modal-content" onclick="event.stopPropagation()">
      <div class="modal-handle-bar"></div>
      <div class="modal-header">
        <b>Selecciona un Libro de la Biblia</b>
        <button class="action-pill-btn" style="background: var(--chip-bg);" onclick="closeBookModalDirect()">✕</button>
      </div>
      <div style="display: flex; gap: 8px; padding: 14px 20px 0 20px;">
        <button class="filter-chip active" id="btnOT" onclick="filterTestament('OT')">Antiguo Testamento (39)</button>
        <button class="filter-chip" id="btnNT" onclick="filterTestament('NT')">Nuevo Testamento (27)</button>
      </div>
      <div class="modal-body" style="padding-top: 10px;">
        <div class="grid-books" id="booksGrid"></div>
      </div>
    </div>
  </div>

  <!-- Chapter Picker Modal -->
  <div id="chapterModal" class="modal-overlay" onclick="closeChapterModal(event)">
    <div class="modal-content" onclick="event.stopPropagation()">
      <div class="modal-handle-bar"></div>
      <div class="modal-header">
        <b id="chapterModalTitle">Capítulos</b>
        <button class="action-pill-btn" style="background: var(--chip-bg);" onclick="closeChapterModalDirect()">✕</button>
      </div>
      <div class="modal-body">
        <div class="grid-chapters" id="chaptersGrid"></div>
      </div>
    </div>
  </div>

  <!-- Toast Notification -->
  <div id="toast" class="toast">Mensaje</div>

  <!-- Application Logic -->
  <script>
    const HIMNOS = """ + json.dumps(himnos, ensure_ascii=False) + """;
    const COROS = """ + json.dumps(coros, ensure_ascii=False) + """;
    const ALL_SONGS = [...HIMNOS, ...COROS];
    const BIBLIA = """ + json.dumps(biblia, ensure_ascii=False) + """;

    let currentFilter = 'todos';
    let currentFavTab = 'alabanzas';
    let currentBookIndex = 0;
    let currentChapterIndex = 0;
    let currentSongInModal = null;
    let fontScale = parseFloat(localStorage.getItem('fontScale') || '1.0');
    let theme = localStorage.getItem('theme') || 'dark';

    let favSongIds = new Set(JSON.parse(localStorage.getItem('favSongs') || '[]'));
    let favVerses = JSON.parse(localStorage.getItem('favVerses') || '[]');

    function init() {
      applyTheme(theme);
      applyFontScale();
      renderHimnos();
      renderBibleChapter();
      updateFavCounters();
    }

    function showToast(msg) {
      const t = document.getElementById('toast');
      t.innerText = msg;
      t.style.display = 'block';
      setTimeout(() => { t.style.display = 'none'; }, 2200);
    }

    function setTheme(t) {
      theme = t;
      localStorage.setItem('theme', theme);
      applyTheme(theme);
    }
    function cycleTheme() {
      const themes = ['dark', 'light', 'sepia'];
      let next = themes[(themes.indexOf(theme) + 1) % themes.length];
      setTheme(next);
    }
    function applyTheme(t) {
      document.body.className = t;
      document.querySelectorAll('.theme-card').forEach(c => {
        c.classList.toggle('active', c.innerText.toLowerCase().includes(t));
      });
      const icon = t === 'dark' ? '🌙' : (t === 'light' ? '☀️' : '📜');
      document.getElementById('themeIconBtn').innerText = icon;
    }

    function adjustFont(delta) {
      fontScale = Math.min(1.8, Math.max(0.8, fontScale + delta));
      localStorage.setItem('fontScale', fontScale.toFixed(2));
      applyFontScale();
    }
    function resetFont() {
      fontScale = 1.0;
      localStorage.setItem('fontScale', '1.0');
      applyFontScale();
    }
    function applyFontScale() {
      document.documentElement.style.setProperty('--font-scale', fontScale);
      document.getElementById('fontScaleLabel').innerText = Math.round(fontScale * 100) + '%';
    }

    function switchNav(viewId, el) {
      document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
      document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
      document.getElementById(viewId).classList.add('active');
      el.classList.add('active');
      if (viewId === 'viewFavoritos') {
        renderFavorites();
      }
      document.querySelector('main').scrollTop = 0;
    }

    function setHimnoFilter(type, el) {
      currentFilter = type;
      document.querySelectorAll('#viewHimnos .filter-chip').forEach(c => c.classList.remove('active'));
      el.classList.add('active');
      renderHimnos();
    }

    function filterHimnos() {
      const q = document.getElementById('himnoSearch').value.trim();
      document.getElementById('clearSearchBtn').style.display = q ? 'block' : 'none';
      renderHimnos();
    }
    function clearHimnoSearch() {
      document.getElementById('himnoSearch').value = '';
      document.getElementById('clearSearchBtn').style.display = 'none';
      renderHimnos();
    }

    function renderHimnos() {
      const q = document.getElementById('himnoSearch').value.trim().toLowerCase();
      const container = document.getElementById('himnosListContainer');
      let filtered = ALL_SONGS.filter(item => {
        if (currentFilter !== 'todos' && item.type !== currentFilter) return false;
        if (!q) return true;
        if (item.num.toString() === q) return true;
        if (item.title.toLowerCase().includes(q)) return true;
        return item.stanzas.some(s => s.toLowerCase().includes(q));
      });

      if (filtered.length === 0) {
        container.innerHTML = '<div class="empty-state"><div class="empty-icon">🔍</div><p>No se encontraron alabanzas con ese número o palabra.</p></div>';
        return;
      }

      container.innerHTML = filtered.map(item => {
        const isFav = favSongIds.has(item.id);
        const prefix = item.type === 'himno' ? 'H' : 'C';
        const isCoro = item.type === 'coro';
        const preview = item.stanzas[0].replace('CORO:', '').replace(/\\n/g, ' ').trim();
        return `
          <div class="item-card" onclick="openHymnModal('${item.id}')">
            <div class="item-left">
              <div class="item-badge ${isCoro ? 'badge-coro' : ''}">${prefix}-${item.num}</div>
              <div class="item-info">
                <div class="item-title">${item.title}</div>
                <div class="item-preview">${preview}</div>
              </div>
            </div>
            <div class="fav-btn ${isFav ? 'is-fav' : ''}" onclick="toggleFavSong('${item.id}', event)">⭐</div>
          </div>
        `;
      }).join('');
    }

    function toggleFavSong(id, e) {
      if (e) e.stopPropagation();
      if (favSongIds.has(id)) {
        favSongIds.delete(id);
        showToast('Eliminado de Favoritos');
      } else {
        favSongIds.add(id);
        showToast('⭐ Guardado en Favoritos');
      }
      localStorage.setItem('favSongs', JSON.stringify([...favSongIds]));
      updateFavCounters();
      renderHimnos();
      if (currentSongInModal && currentSongInModal.id === id) {
        updateModalFavState();
      }
    }

    function updateFavCounters() {
      document.getElementById('favHimnosCount').innerText = favSongIds.size;
      document.getElementById('favVersesCount').innerText = favVerses.length;
    }

    function openHymnModal(id) {
      const song = ALL_SONGS.find(s => s.id === id);
      if (!song) return;
      currentSongInModal = song;
      const prefix = song.type === 'himno' ? 'Himno' : 'Coro';
      document.getElementById('modalHymnBadge').innerText = `${prefix} #${song.num}`;
      document.getElementById('modalHymnTitle').innerText = song.title;
      updateModalFavState();

      const body = document.getElementById('modalHymnBody');
      body.innerHTML = song.stanzas.map((stanza, idx) => {
        const isCoro = stanza.includes('CORO:');
        return `<div class="stanza ${isCoro ? 'coro-highlight' : ''}">${stanza}</div>`;
      }).join('');

      document.getElementById('hymnModal').classList.add('open');
    }
    function updateModalFavState() {
      const isFav = currentSongInModal && favSongIds.has(currentSongInModal.id);
      const btn = document.getElementById('modalHymnFavBtn');
      btn.className = `fav-btn ${isFav ? 'is-fav' : ''}`;
    }
    function toggleModalFav() {
      if (currentSongInModal) {
        toggleFavSong(currentSongInModal.id);
      }
    }
    function closeHymnModal(e) {
      if (e.target.id === 'hymnModal') closeHymnModalDirect();
    }
    function closeHymnModalDirect() {
      document.getElementById('hymnModal').classList.remove('open');
      currentSongInModal = null;
    }

    function renderBibleChapter() {
      const book = BIBLIA[currentBookIndex];
      const chapters = book.chapters;
      if (currentChapterIndex >= chapters.length) currentChapterIndex = 0;
      const verses = chapters[currentChapterIndex];

      document.getElementById('currentBookName').innerText = book.name;
      document.getElementById('currentChapterNum').innerText = (currentChapterIndex + 1);
      document.getElementById('navRefLabel').innerText = `${book.name} ${currentChapterIndex + 1}`;

      const container = document.getElementById('verseListContainer');
      container.innerHTML = verses.map((text, idx) => {
        const vNum = idx + 1;
        const ref = `${book.name} ${currentChapterIndex + 1}:${vNum}`;
        const isSaved = favVerses.some(fv => fv.ref === ref);
        return `
          <div class="verse-item ${isSaved ? 'saved' : ''}" onclick="promptVerseAction('${ref}', '${text.replace(/'/g, "\\'")}')">
            <span class="verse-num">${vNum}</span>${text}
          </div>
        `;
      }).join('');
      document.querySelector('main').scrollTop = 0;
    }

    function navigateChapter(dir) {
      const book = BIBLIA[currentBookIndex];
      let newChap = currentChapterIndex + dir;
      if (newChap >= 0 && newChap < book.chapters.length) {
        currentChapterIndex = newChap;
        renderBibleChapter();
      } else if (dir > 0 && currentBookIndex + 1 < BIBLIA.length) {
        currentBookIndex++;
        currentChapterIndex = 0;
        renderBibleChapter();
      } else if (dir < 0 && currentBookIndex - 1 >= 0) {
        currentBookIndex--;
        currentChapterIndex = BIBLIA[currentBookIndex].chapters.length - 1;
        renderBibleChapter();
      }
    }

    function promptVerseAction(ref, text) {
      const isSaved = favVerses.some(fv => fv.ref === ref);
      if (isSaved) {
        favVerses = favVerses.filter(fv => fv.ref !== ref);
        showToast('Versículo eliminado de Favoritos');
      } else {
        favVerses.unshift({ ref, text, date: new Date().toLocaleDateString() });
        showToast(`⭐ Guardado: ${ref}`);
      }
      localStorage.setItem('favVerses', JSON.stringify(favVerses));
      updateFavCounters();
      renderBibleChapter();
    }

    let selectedTestament = 'OT';
    function openBookPicker() {
      renderBooksGrid();
      document.getElementById('bookModal').classList.add('open');
    }
    function filterTestament(testament) {
      selectedTestament = testament;
      document.getElementById('btnOT').classList.toggle('active', testament === 'OT');
      document.getElementById('btnNT').classList.toggle('active', testament === 'NT');
      renderBooksGrid();
    }
    function renderBooksGrid() {
      const grid = document.getElementById('booksGrid');
      const start = selectedTestament === 'OT' ? 0 : 39;
      const end = selectedTestament === 'OT' ? 39 : 66;
      grid.innerHTML = BIBLIA.slice(start, end).map((book, idx) => {
        const actualIdx = start + idx;
        return `<div class="book-btn" onclick="selectBook(${actualIdx})">${book.name}</div>`;
      }).join('');
    }
    function selectBook(idx) {
      currentBookIndex = idx;
      currentChapterIndex = 0;
      closeBookModalDirect();
      openChapterPicker();
    }
    function closeBookModal(e) { if (e.target.id === 'bookModal') closeBookModalDirect(); }
    function closeBookModalDirect() { document.getElementById('bookModal').classList.remove('open'); }

    function openChapterPicker() {
      const book = BIBLIA[currentBookIndex];
      document.getElementById('chapterModalTitle').innerText = `${book.name} - Capítulos`;
      const grid = document.getElementById('chaptersGrid');
      grid.innerHTML = book.chapters.map((_, idx) => {
        return `<div class="chapter-btn" onclick="selectChapter(${idx})">${idx + 1}</div>`;
      }).join('');
      document.getElementById('chapterModal').classList.add('open');
    }
    function selectChapter(idx) {
      currentChapterIndex = idx;
      closeChapterModalDirect();
      renderBibleChapter();
    }
    function closeChapterModal(e) { if (e.target.id === 'chapterModal') closeChapterModalDirect(); }
    function closeChapterModalDirect() { document.getElementById('chapterModal').classList.remove('open'); }

    function setFavTab(tab, el) {
      currentFavTab = tab;
      document.querySelectorAll('#viewFavoritos .filter-chip').forEach(c => c.classList.remove('active'));
      el.classList.add('active');
      renderFavorites();
    }
    function renderFavorites() {
      const container = document.getElementById('favListContainer');
      if (currentFavTab === 'alabanzas') {
        const songs = ALL_SONGS.filter(s => favSongIds.has(s.id));
        if (songs.length === 0) {
          container.innerHTML = '<div class="empty-state"><div class="empty-icon">⭐</div><p>Aún no has guardado alabanzas favoritas.<br>Toca la estrella ⭐ en cualquier himno o coro para agregarlo aquí.</p></div>';
          return;
        }
        container.innerHTML = songs.map(item => {
          const prefix = item.type === 'himno' ? 'H' : 'C';
          const isCoro = item.type === 'coro';
          return `
            <div class="item-card" onclick="openHymnModal('${item.id}')">
              <div class="item-left">
                <div class="item-badge ${isCoro ? 'badge-coro' : ''}">${prefix}-${item.num}</div>
                <div class="item-info">
                  <div class="item-title">${item.title}</div>
                  <div class="item-preview">${item.stanzas[0].replace('CORO:', '').replace(/\\n/g, ' ').trim()}</div>
                </div>
              </div>
              <div class="fav-btn is-fav" onclick="toggleFavSong('${item.id}', event)">⭐</div>
            </div>
          `;
        }).join('');
      } else {
        if (favVerses.length === 0) {
          container.innerHTML = '<div class="empty-state"><div class="empty-icon">📖</div><p>No tienes versículos guardados.<br>Toca cualquier versículo de la Biblia para guardarlo como favorito.</p></div>';
          return;
        }
        container.innerHTML = favVerses.map(v => {
          return `
            <div class="item-card" style="align-items: flex-start;">
              <div class="item-info" style="flex: 1;">
                <div class="item-title" style="color: var(--primary); font-weight: 800;">${v.ref}</div>
                <div style="font-size: 0.98rem; margin-top: 6px; line-height: 1.5;">${v.text}</div>
              </div>
              <div class="fav-btn is-fav" onclick="removeFavVerse('${v.ref}')">⭐</div>
            </div>
          `;
        }).join('');
      }
    }
    function removeFavVerse(ref) {
      favVerses = favVerses.filter(v => v.ref !== ref);
      localStorage.setItem('favVerses', JSON.stringify(favVerses));
      showToast('Versículo eliminado');
      updateFavCounters();
      renderFavorites();
    }

    document.addEventListener('DOMContentLoaded', init);
    window.onload = init;
    setTimeout(init, 50);
  </script>
</body>
</html>"""

out_path = os.path.join(ASSETS_DIR, "index.html")
with open(out_path, "w", encoding="utf-8") as f:
    f.write(html_content)

print(f"Generated modern index.html: {out_path} ({os.path.getsize(out_path) / 1024 / 1024:.2f} MB)")
