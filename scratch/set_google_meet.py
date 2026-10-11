# -*- coding: utf-8 -*-
"""
Actualizador para Google Meet conservando la temática general de la Cultura del Cuidado
y todo el contenido expandido de las tarjetas.
"""

# 1. Actualizar build_sequential_deck.py
with open('scratch/build_sequential_deck.py', 'r', encoding='utf-8') as f:
    deck = f.read()

deck = deck.replace('Microsoft Teams', 'Google Meet')
deck = deck.replace('en Teams', 'en Meet')
deck = deck.replace('de Teams', 'de Meet')
deck = deck.replace('chat de Teams', 'chat de Meet')
deck = deck.replace('el Chat de Teams', 'el Chat de Meet')

with open('scratch/build_sequential_deck.py', 'w', encoding='utf-8') as f:
    f.write(deck)
print("build_sequential_deck.py actualizado con Google Meet.")

# 2. Actualizar build_comprehensive_guion.py
with open('scratch/build_comprehensive_guion.py', 'r', encoding='utf-8') as f:
    guion = f.read()

guion = guion.replace('MICROSOFT TEAMS', 'GOOGLE MEET')
guion = guion.replace('Microsoft Teams', 'Google Meet')
guion = guion.replace('en Teams', 'en Meet')
guion = guion.replace('de Teams', 'de Meet')
guion = guion.replace('chat de Teams', 'chat de Meet')
guion = guion.replace('el Chat de Teams', 'el Chat de Meet')

with open('scratch/build_comprehensive_guion.py', 'w', encoding='utf-8') as f:
    f.write(guion)
print("build_comprehensive_guion.py actualizado con Google Meet.")
