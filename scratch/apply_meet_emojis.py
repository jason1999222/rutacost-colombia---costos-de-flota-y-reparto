# -*- coding: utf-8 -*-
"""
Ajusta la presentación y el guion para personas mayores usando los emojis exactos
de la barra flotante de Google Meet: 💖 👍 🎉 👏 😂 😮 😢 🤔 👎
"""

# 1. ACTUALIZAR build_sequential_deck.py
with open('scratch/build_sequential_deck.py', 'r', encoding='utf-8') as f:
    deck = f.read()

# Slide 3: Votación con Emojis de Meet
old_slide3 = """      <!-- SLIDE 3: INTERACCIÓN EN VIVO 1 (MICROSOFT TEAMS) -->
      <section class="slide" data-name="3. Pregunta al Público">
        <div style="margin-bottom: 12px;">
          <div class="pill-label interactive-pill">💬 Votación en el Chat de Meet</div>
          <h2 class="slide-heading">
            ¿Cuándo fue la última vez que te <span class="highlight-pink">detuviste</span> a cuidar de ti?
          </h2>
          <p class="slide-tagline">
            Escribe en el chat de Meet la letra (A, B o C) con la que más te identifiques:
          </p>
        </div>

        <div class="interactive-stage-card">
          <div class="poll-option-row" onclick="revealInsight(this, 'insight-1', '🌱 ¡Maravilloso! Mantener un espacio propio diario es la clave para llegar a la noche en equilibrio y no agotados.')">
            <div class="poll-option-title">
              <span>☕</span>
              <span>Opción A: Hoy me regalé unos minutos de silencio, respiración y calma.</span>
            </div>
            <span class="poll-badge">Escribe A en el Chat</span>
          </div>

          <div class="poll-option-row" onclick="revealInsight(this, 'insight-1', '⚡ ¡Estás en el lugar indicado! Esta sesión virtual es el momento perfecto para soltar el afán y respirar.')">
            <div class="poll-option-title">
              <span>🏃</span>
              <span>Opción B: Llevo semanas enteras corriendo en piloto automático sin parar.</span>
            </div>
            <span class="poll-badge">Escribe B en el Chat</span>
          </div>

          <div class="poll-option-row" onclick="revealInsight(this, 'insight-1', '🤍 Regla de oro de esta noche: Descansar no es un premio que se gana, es una necesidad vital que se respeta.')">
            <div class="poll-option-title">
              <span>🛑</span>
              <span>Opción C: Me siento culpable o ansioso cada vez que me detengo a descansar.</span>
            </div>
            <span class="poll-badge">Escribe C en el Chat</span>
          </div>

          <div id="insight-1" style="background:linear-gradient(135deg,var(--pastel-pink-card),var(--pastel-violet-card)); border-radius:16px; padding:16px 22px; border:2px dashed var(--pastel-violet-border); font-size:14.5px; color:var(--violet-text); font-weight:700; line-height:1.5; display:none;">
            <!-- Relleno dinámico al hacer clic -->
          </div>
        </div>
      </section>"""

new_slide3 = """      <!-- SLIDE 3: INTERACCIÓN EN VIVO 1 (EMOJIS GOOGLE MEET) -->
      <section class="slide" data-name="3. Pregunta al Público">
        <div style="margin-bottom: 12px;">
          <div class="pill-label interactive-pill">😃 Participación con Emojis en Google Meet</div>
          <h2 class="slide-heading">
            ¿Cuándo fue la última vez que te <span class="highlight-pink">detuviste</span> a cuidar de ti?
          </h2>
          <p class="slide-tagline">
            ¡Súper fácil, sin escribir! Toca la carita sonriente 😃 en tu barra de Google Meet abajo y elige tu emoji:
          </p>
        </div>

        <div class="interactive-stage-card">
          <div class="poll-option-row" onclick="revealInsight(this, 'insight-1', '💖 ¡Maravilloso! Mantener un espacio propio diario es la clave para llegar a la noche en equilibrio y no agotados.')">
            <div class="poll-option-title">
              <span style="font-size:22px;">☕</span>
              <span>1. Hoy me regalé unos minutos de silencio, respiración y calma.</span>
            </div>
            <span class="poll-badge" style="background:linear-gradient(135deg,#f43f5e,#be123c); color:#fff; border:none;">Reacciona con 💖 o 👍</span>
          </div>

          <div class="poll-option-row" onclick="revealInsight(this, 'insight-1', '🤔 ¡Estás en el lugar indicado! Esta sesión es el momento perfecto para soltar el afán y respirar.')">
            <div class="poll-option-title">
              <span style="font-size:22px;">🏃</span>
              <span>2. Llevo semanas enteras corriendo en piloto automático sin parar.</span>
            </div>
            <span class="poll-badge" style="background:linear-gradient(135deg,#7c3aed,#6d28d9); color:#fff; border:none;">Reacciona con 🤔 o 😮</span>
          </div>

          <div class="poll-option-row" onclick="revealInsight(this, 'insight-1', '🤍 Regla de oro de esta noche: Descansar no es un premio que se gana, es una necesidad vital que se respeta.')">
            <div class="poll-option-title">
              <span style="font-size:22px;">🛑</span>
              <span>3. Me siento culpable o ansioso cada vez que me detengo a descansar.</span>
            </div>
            <span class="poll-badge" style="background:linear-gradient(135deg,#0284c7,#0369a1); color:#fff; border:none;">Reacciona con 😢 o 👎</span>
          </div>

          <!-- Barra de Ayuda Visual con los Emojis Nativos de Meet -->
          <div style="background:#f1f5f9; border-radius:16px; padding:10px 18px; display:flex; align-items:center; justify-content:space-between; border:1.5px solid #e2e8f0; margin-top:2px;">
            <div style="display:flex; align-items:center; gap:8px; font-size:12.5px; font-weight:800; color:var(--text-dark);">
              <span style="background:#3b82f6; color:#fff; padding:3px 8px; border-radius:8px; font-size:14px;">😃</span>
              <span>Barra de Emojis de Meet (abajo):</span>
            </div>
            <div style="font-size:22px; display:flex; gap:10px; letter-spacing:2px;">
              <span>💖</span><span>👍</span><span>🎉</span><span>👏</span><span>😂</span><span>😮</span><span>😢</span><span>🤔</span><span>👎</span>
            </div>
          </div>

          <div id="insight-1" style="background:linear-gradient(135deg,var(--pastel-pink-card),var(--pastel-violet-card)); border-radius:16px; padding:14px 20px; border:2px dashed var(--pastel-violet-border); font-size:14px; color:var(--violet-text); font-weight:700; line-height:1.5; display:none;">
            <!-- Relleno dinámico al hacer clic -->
          </div>
        </div>
      </section>"""

if old_slide3 in deck:
    deck = deck.replace(old_slide3, new_slide3)
    print("Slide 3 reemplazado con éxito.")
else:
    print("Warning: old_slide3 exact match no encontrado, intentando reemplazo flexible.")

# Slide 6: Dinámica de la Batería con Emojis de Meet
old_slide6 = """      <!-- SLIDE 6: DINÁMICA 1 (PENSADA PARA EL PÚBLICO EN TEAMS - SIN SPOILER DE GUION) -->
      <section class="slide" data-name="6. Dinámica: La Batería">
        <div style="margin-bottom: 10px;">
          <div class="pill-label interactive-pill">⚡ Dinámica en Vivo • Google Meet</div>
          <h2 class="slide-heading">
            «El Termómetro de la <span class="highlight-pink">Batería Humana</span>»
          </h2>
          <p class="slide-tagline">
            ¿Con qué porcentaje de energía llegas hoy a esta reunión? Haz clic en tu nivel y compártelo en el chat de Meet:
          </p>
        </div>

        <div class="layout-split" style="grid-template-columns: 1.15fr 0.85fr; gap: 24px;">
          
          <!-- Lado Izquierdo: Termómetro Interactivo para el Público -->
          <div style="background:#ffffff; border-radius:22px; padding:18px 22px; border:2px solid var(--pastel-pink-border); display:flex; flex-direction:column; gap:10px; box-shadow:var(--shadow-sm);">
            <div style="font-size:12px; font-weight:800; color:var(--pink-text); text-transform:uppercase; letter-spacing:0.8px;">
              SELECCIONA TU ESTADO ACTUAL:
            </div>

            <div class="battery-level-card" onclick="selectBattery(this, '🪫 10% - 20%', 'Modo Ahorro Crítico: Llegando con lo justo. Requiere descanso profundo, té caliente y comprensión.')">
              <div style="display:flex; align-items:center; gap:12px;">
                <span style="font-size:24px;">🪫</span>
                <div>
                  <strong style="color:var(--text-dark); font-size:13.5px;">10% - 20% • Modo Ahorro Crítico</strong>
                  <div style="font-size:11.5px; color:var(--text-muted);">Batería roja, operando solo funciones básicas.</div>
                </div>
              </div>
              <span class="poll-badge" style="font-size:11px;">Escribe 15%</span>
            </div>

            <div class="battery-level-card" onclick="selectBattery(this, '🔋 25% - 45%', 'Batería Amarilla: Cansancio normal de la jornada. Con ganas de escuchar y recargar el espíritu.')">
              <div style="display:flex; align-items:center; gap:12px;">
                <span style="font-size:24px;">🔋</span>
                <div>
                  <strong style="color:var(--text-dark); font-size:13.5px;">25% - 45% • Modo Trabajo</strong>
                  <div style="font-size:11.5px; color:var(--text-muted);">Cansancio nocturno pero con buena actitud.</div>
                </div>
              </div>
              <span class="poll-badge" style="font-size:11px;">Escribe 35%</span>
            </div>

            <div class="battery-level-card" onclick="selectBattery(this, '☕ 50% - 75%', 'Sostenido con Café: Energía media y estable. Listo para aprender y conectar con el equipo.')">
              <div style="display:flex; align-items:center; gap:12px;">
                <span style="font-size:24px;">☕</span>
                <div>
                  <strong style="color:var(--text-dark); font-size:13.5px;">50% - 75% • Café y Ánimo</strong>
                  <div style="font-size:11.5px; color:var(--text-muted);">Energía equilibrada y presente.</div>
                </div>
              </div>
              <span class="poll-badge" style="font-size:11px;">Escribe 60%</span>
            </div>

            <div class="battery-level-card" onclick="selectBattery(this, '🌟 80% - 100%', 'Batería Plena: Energía al tope. Misión de hoy: enviar abrazos y recargar a los compañeros con batería baja.')">
              <div style="display:flex; align-items:center; gap:12px;">
                <span style="font-size:24px;">🌟</span>
                <div>
                  <strong style="color:var(--text-dark); font-size:13.5px;">80% - 100% • Energía Plena</strong>
                  <div style="font-size:11.5px; color:var(--text-muted);">Listo para enviar buena vibra al grupo.</div>
                </div>
              </div>
              <span class="poll-badge" style="font-size:11px;">Escribe 90%</span>
            </div>

            <!-- Banner dinámico al seleccionar -->
            <div id="battery-feedback" style="background:var(--pastel-pink-bg); border-radius:12px; padding:10px 14px; font-size:12.5px; color:var(--pink-text); font-weight:700; border:1px dashed var(--pastel-pink-border); text-align:center;">
              💬 ¡Escribe tu porcentaje en el chat de Meet ahora mismo!
            </div>
          </div>

          <!-- Lado Derecho: Temporizador Interactivo Oficial -->
          <div class="dynamic-timer-box">
            <span style="font-size:12.5px; font-weight:800; color:var(--violet-text); text-transform:uppercase; letter-spacing:1px;">
              ⏱️ TIEMPO DE PARTICIPACIÓN EN CHAT
            </span>
            <div class="dynamic-timer-num" id="slideTimer1">02:00</div>
            <div style="display:flex; gap:10px; margin-top:8px;">
              <button class="btn-timer-action" onclick="runSlideTimer(120, 'slideTimer1')">
                ▶ Iniciar 2 Minutos
              </button>
              <button class="btn-timer-action" style="background:#64748b;" onclick="stopSlideTimer('slideTimer1', '02:00')">
                ↻ Reiniciar
              </button>
            </div>
            <div style="margin-top:16px; background:#ffffff; border-radius:14px; padding:10px 16px; border:1px solid var(--pastel-violet-border); font-size:12.5px; color:var(--violet-text); font-weight:700; line-height:1.4;">
              ❤️ Envía reacciones de corazón y aplausos en Meet para acompañar a quienes tienen la batería baja.
            </div>
          </div>
        </div>
      </section>"""

new_slide6 = """      <!-- SLIDE 6: DINÁMICA 1 (EMOJIS GOOGLE MEET) -->
      <section class="slide" data-name="6. Dinámica: La Batería">
        <div style="margin-bottom: 10px;">
          <div class="pill-label interactive-pill">⚡ Dinámica Fácil con Emojis • Google Meet</div>
          <h2 class="slide-heading">
            «El Termómetro de la <span class="highlight-pink">Batería Humana</span>»
          </h2>
          <p class="slide-tagline">
            ¿Cómo está tu batería hoy? ¡No tienes que escribir números! Toca el botón 😃 abajo en Meet y reacciona:
          </p>
        </div>

        <div class="layout-split" style="grid-template-columns: 1.15fr 0.85fr; gap: 24px;">
          
          <!-- Lado Izquierdo: Termómetro Interactivo para el Público -->
          <div style="background:#ffffff; border-radius:22px; padding:18px 22px; border:2px solid var(--pastel-pink-border); display:flex; flex-direction:column; gap:10px; box-shadow:var(--shadow-sm);">
            <div style="font-size:12px; font-weight:800; color:var(--pink-text); text-transform:uppercase; letter-spacing:0.8px;">
              TOCA EL EMOJI DE TU ESTADO EN GOOGLE MEET:
            </div>

            <div class="battery-level-card" onclick="selectBattery(this, '🪫 Batería Baja (25%)', 'Reacciona con 😢 en Meet. ¡Tu equipo te enviará corazones para recargarte!')">
              <div style="display:flex; align-items:center; gap:12px;">
                <span style="font-size:26px;">🪫</span>
                <div>
                  <strong style="color:var(--text-dark); font-size:13.5px;">Batería Baja (25%) • Muy Agotado</strong>
                  <div style="font-size:11.5px; color:var(--text-muted);">Cansancio acumulado, operando en reserva.</div>
                </div>
              </div>
              <span class="poll-badge" style="background:#fef2f2; color:#b91c1c; border-color:#fecaca; font-weight:800;">Toca 😢 Tristeza</span>
            </div>

            <div class="battery-level-card" onclick="selectBattery(this, '🔋 Batería Media (50%)', 'Reacciona con 🤔 en Meet. Día pesado pero con ánimo de respiro.')">
              <div style="display:flex; align-items:center; gap:12px;">
                <span style="font-size:26px;">🔋</span>
                <div>
                  <strong style="color:var(--text-dark); font-size:13.5px;">Batería Media (50%) • Cansancio Normal</strong>
                  <div style="font-size:11.5px; color:var(--text-muted);">Mente pensativa con el esfuerzo del día.</div>
                </div>
              </div>
              <span class="poll-badge" style="background:#fefce8; color:#a16207; border-color:#fef08a; font-weight:800;">Toca 🤔 Pensativo</span>
            </div>

            <div class="battery-level-card" onclick="selectBattery(this, '☕ Batería Estable (75%)', 'Reacciona con 👏 en Meet. ¡Energía constante para acompañar!')">
              <div style="display:flex; align-items:center; gap:12px;">
                <span style="font-size:26px;">☕</span>
                <div>
                  <strong style="color:var(--text-dark); font-size:13.5px;">Batería Estable (75%) • Buena Actitud</strong>
                  <div style="font-size:11.5px; color:var(--text-muted);">Energía equilibrada y presente.</div>
                </div>
              </div>
              <span class="poll-badge" style="background:#f0fdf4; color:#15803d; border-color:#bbf7d0; font-weight:800;">Toca 👏 Aplausos</span>
            </div>

            <div class="battery-level-card" onclick="selectBattery(this, '🌟 Batería Llena (100%)', 'Reacciona con 🎉 o 👍 en Meet. ¡Misión: contagiar alegría!')">
              <div style="display:flex; align-items:center; gap:12px;">
                <span style="font-size:26px;">🌟</span>
                <div>
                  <strong style="color:var(--text-dark); font-size:13.5px;">Batería Llena (100%) • Energía Total</strong>
                  <div style="font-size:11.5px; color:var(--text-muted);">Listo para enviar buena vibra a los demás.</div>
                </div>
              </div>
              <span class="poll-badge" style="background:#fdf2f8; color:#be123c; border-color:#fbcfe8; font-weight:800;">Toca 🎉 Fiesta o 👍</span>
            </div>

            <!-- Banner dinámico al seleccionar -->
            <div id="battery-feedback" style="background:var(--pastel-pink-bg); border-radius:12px; padding:10px 14px; font-size:12.5px; color:var(--pink-text); font-weight:700; border:1px dashed var(--pastel-pink-border); text-align:center;">
              😃 ¡Toca la carita sonriente abajo en Meet y presiona tu emoji ahora!
            </div>
          </div>

          <!-- Lado Derecho: Temporizador Interactivo Oficial -->
          <div class="dynamic-timer-box">
            <span style="font-size:12.5px; font-weight:800; color:var(--violet-text); text-transform:uppercase; letter-spacing:1px;">
              ⏱️ TIEMPO DE PARTICIPACIÓN EN MEET
            </span>
            <div class="dynamic-timer-num" id="slideTimer1">02:00</div>
            <div style="display:flex; gap:10px; margin-top:8px;">
              <button class="btn-timer-action" onclick="runSlideTimer(120, 'slideTimer1')">
                ▶ Iniciar 2 Minutos
              </button>
              <button class="btn-timer-action" style="background:#64748b;" onclick="stopSlideTimer('slideTimer1', '02:00')">
                ↻ Reiniciar
              </button>
            </div>
            
            <!-- Recarga Colectiva con Corazones -->
            <div style="margin-top:14px; background:#ffffff; border-radius:16px; padding:12px 16px; border:2px solid var(--pastel-pink-border); text-align:center;">
              <div style="font-size:13px; font-weight:800; color:var(--pink-text); margin-bottom:4px;">
                💖 ¡Recarga Colectiva de Energía!
              </div>
              <div style="font-size:12px; color:var(--text-body); line-height:1.4;">
                Presiona muchas veces <strong>💖 Corazón</strong> o <strong>👏 Aplauso</strong> para recargar la batería de los compañeros que tienen la batería baja.
              </div>
            </div>
          </div>
        </div>
      </section>"""

if old_slide6 in deck:
    deck = deck.replace(old_slide6, new_slide6)
    print("Slide 6 reemplazado con éxito.")
else:
    print("Warning: old_slide6 exact match no encontrado, intentando reemplazo flexible.")

# Slide 8: Bálsamos con Emojis
old_badges_slide8 = [
    ('<span class="poll-badge">Escribe 1</span>', '<span class="poll-badge" style="background:#fdf2f8; color:#be123c; font-weight:800;">Toca 💖 Corazón</span>'),
    ('<span class="poll-badge">Escribe 2</span>', '<span class="poll-badge" style="background:#f0f9ff; color:#0369a1; font-weight:800;">Toca 👍 o 👏</span>'),
    ('<span class="poll-badge">Escribe 3</span>', '<span class="poll-badge" style="background:#fefce8; color:#a16207; font-weight:800;">Toca 🎉 Fiesta</span>'),
    ('<span class="poll-badge">Escribe 4</span>', '<span class="poll-badge" style="background:#f5f3ff; color:#6d28d9; font-weight:800;">Toca 🤔 o 💖</span>'),
    ('Escribe en el chat de Meet el número (1, 2, 3 o 4) o haz clic en cualquiera para abrir su medicina emocional:', 'Elige tu frase tocando el emoji correspondiente en la barra de Google Meet:')
]
for ob, nb in old_badges_slide8:
    deck = deck.replace(ob, nb)

# Slide 11: Muro de Gratitud con Emojis
old_slide11_action = """            <!-- Banner de llamado a la acción en Meet -->
            <div style="background:linear-gradient(135deg,var(--pastel-pink-card),var(--pastel-violet-card)); border-radius:14px; padding:12px 18px; border:1.5px solid var(--pastel-violet-border); font-size:13px; color:var(--text-dark); font-weight:700;">
              💬 <strong>¡Tu turno en el Chat de Meet!</strong> Escribe: <em>«Agradezco a [Nombre] por...»</em> o <em>«Mañana me comprometo a [Acción de cuidado]...»</em>
            </div>"""

new_slide11_action = """            <!-- Banner de llamado a la acción accesible con Emojis en Meet -->
            <div style="background:linear-gradient(135deg,#ffffff,var(--pastel-pink-card)); border-radius:16px; padding:14px 18px; border:2px solid var(--pastel-pink-border); font-size:13px; color:var(--text-dark); display:flex; flex-direction:column; gap:6px;">
              <div style="font-weight:800; color:var(--pink-text); display:flex; align-items:center; gap:8px;">
                <span>💖</span>
                <span>¡Envía tu Agradecimiento Fácil con Emojis de Meet!</span>
              </div>
              <div style="font-size:12px; color:var(--text-body); line-height:1.4;">
                • Presiona <strong>💖 Corazón</strong> para enviar cariño a un compañero.<br>
                • Presiona <strong>👏 Aplauso</strong> para agradecerle su apoyo en el trabajo.<br>
                • Presiona <strong>🎉 Fiesta</strong> para celebrar a quien alegra tus días.<br>
                • Presiona <strong>👍 Pulgar arriba</strong> para decir: <em>«¡Cuentas conmigo siempre!»</em>
              </div>
            </div>"""

if old_slide11_action in deck:
    deck = deck.replace(old_slide11_action, new_slide11_action)
    print("Slide 11 banner de agradecimiento actualizado con éxito.")

with open('scratch/build_sequential_deck.py', 'w', encoding='utf-8') as f:
    f.write(deck)

print("build_sequential_deck.py actualizado con dinámica de emojis accesibles.")
