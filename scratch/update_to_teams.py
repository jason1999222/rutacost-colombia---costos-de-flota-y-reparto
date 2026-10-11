# -*- coding: utf-8 -*-
import sys

# 1. Update build_sequential_deck.py
with open('scratch/build_sequential_deck.py', 'r', encoding='utf-8') as f:
    deck_code = f.read()

deck_replacements = [
    (
        '<div class="pill-label">🌸 Encuentro Nocturno • Google Meet</div>',
        '<div class="pill-label">🌸 Encuentro en Vivo • Microsoft Teams</div>'
    ),
    (
        'Una ética de la ternura para la vida adulta, el descanso y la comunidad virtual.',
        'Una ética de la ternura y la corresponsabilidad para el bienestar personal, laboral y comunitario.'
    ),
    (
        '<!-- SLIDE 3: INTERACCIÓN EN VIVO 1 (GOOGLE MEET) -->',
        '<!-- SLIDE 3: INTERACCIÓN EN VIVO 1 (MICROSOFT TEAMS) -->'
    ),
    (
        '<div class="pill-label interactive-pill">💬 Votación en el Chat de Google Meet</div>',
        '<div class="pill-label interactive-pill">💬 Votación en el Chat de Teams</div>'
    ),
    (
        'Escribe en el chat de Meet la letra (A, B o C) con la que más te identifiques esta noche:',
        'Escribe en el chat de Teams la letra (A, B o C) con la que más te identifiques:'
    ),
    (
        '<!-- SLIDE 6: DINÁMICA 1 (PENSADA PARA EL PÚBLICO EN MEET - SIN SPOILER DE GUION) -->',
        '<!-- SLIDE 6: DINÁMICA 1 (PENSADA PARA EL PÚBLICO EN TEAMS - SIN SPOILER DE GUION) -->'
    ),
    (
        '<div class="pill-label interactive-pill">⚡ Dinámica Virtual en Vivo • Google Meet</div>',
        '<div class="pill-label interactive-pill">⚡ Dinámica en Vivo • Microsoft Teams</div>'
    ),
    (
        '¿Con qué porcentaje de energía llegas hoy a esta reunión? Haz clic en tu nivel y compártelo en el chat de Meet:',
        '¿Con qué porcentaje de energía llegas hoy a esta reunión? Haz clic en tu nivel y compártelo en el chat de Teams:'
    ),
    (
        '💬 ¡Escribe tu porcentaje en el chat de Meet ahora mismo!',
        '💬 ¡Escribe tu porcentaje en el chat de Teams ahora mismo!'
    ),
    (
        '❤️ Envia reacciones de corazón y aplausos en Google Meet para recargar a quienes tienen la batería baja.',
        '❤️ Envía reacciones de corazón y aplausos en Teams para acompañar a quienes tienen la batería baja.'
    ),
    (
        '<div class="pill-label interactive-pill">💌 Empatía Colectiva en Google Meet</div>',
        '<div class="pill-label interactive-pill">💌 Empatía Colectiva en Microsoft Teams</div>'
    ),
    (
        'Escribe en el chat de Meet el número (1, 2, 3 o 4) o haz clic en cualquiera para abrir su medicina emocional:',
        'Escribe en el chat de Teams el número (1, 2, 3 o 4) o haz clic en cualquiera para abrir su medicina emocional:'
    ),
    (
        '<div class="pill-label interactive-pill">🤝 Dinámica Virtual N° 2 • Google Meet</div>',
        '<div class="pill-label interactive-pill">🤝 Dinámica Colectiva • Microsoft Teams</div>'
    ),
    (
        'El Muro Virtual de la <span class="highlight-violet">Gratitud y el Buen Trato</span>',
        'El Muro de la <span class="highlight-violet">Gratitud y el Reconocimiento</span>'
    ),
    (
        'Convirtamos el chat de Meet en un telar de reconocimiento mutuo. <em>(Haz clic en los post-its para inspirarte)</em>',
        'Convirtamos el chat de Teams en un espacio de aprecio y reconocimiento mutuo. <em>(Haz clic en las notas para inspirarte)</em>'
    ),
    (
        '<!-- Banner de llamado a la acción en Meet -->',
        '<!-- Banner de llamado a la acción en Teams -->'
    ),
    (
        '💬 <strong>¡Tu turno en el Chat de Meet!</strong>',
        '💬 <strong>¡Tu turno en el Chat de Teams!</strong>'
    ),
    (
        '✋ Si quieres dedicar tu mensaje en vivo con tu propia voz, ¡levanta la mano en Google Meet!',
        '✋ Si quieres compartir tu agradecimiento con tu propia voz, ¡levanta la mano en Microsoft Teams!'
    ),
    (
        '✨ Cierre Inspirador • Diálogo Abierto en Meet',
        '✨ Cierre Inspirador • Diálogo Abierto en Teams'
    ),
    (
        '<strong>📝 Mensaje sugerido para enviar por chat de Meet o WhatsApp:</strong>',
        '<strong>📝 Mensaje sugerido para enviar por chat de Teams o mensaje directo:</strong>'
    ),
    (
        'chat de Google Meet ahora',
        'chat de Teams ahora'
    ),
]

for old, new in deck_replacements:
    if old in deck_code:
        deck_code = deck_code.replace(old, new)
    else:
        print(f"Warning: pattern not found in deck: {old}")

with open('scratch/build_sequential_deck.py', 'w', encoding='utf-8') as f:
    f.write(deck_code)

print("Updated build_sequential_deck.py successfully.")

# 2. Update build_guion_angie.py
with open('scratch/build_guion_angie.py', 'r', encoding='utf-8') as f:
    guion_code = f.read()

# Replace general Google Meet -> Microsoft Teams in guion
guion_code = guion_code.replace("Google Meet", "Microsoft Teams")
guion_code = guion_code.replace("en Meet", "en Teams")
guion_code = guion_code.replace("de Meet", "de Teams")
guion_code = guion_code.replace("chat de Meet", "chat de Teams")
guion_code = guion_code.replace("este Meet", "esta sesión de Teams")
guion_code = guion_code.replace("este Google Meet", "esta sesión de Microsoft Teams")
guion_code = guion_code.replace("Meet", "Teams")

# Replace any lingering "comunidad virtual" in guion
guion_code = guion_code.replace(
    "la comunidad virtual",
    "el bienestar personal, laboral y familiar"
)

with open('scratch/build_guion_angie.py', 'w', encoding='utf-8') as f:
    f.write(guion_code)

print("Updated build_guion_angie.py successfully.")
