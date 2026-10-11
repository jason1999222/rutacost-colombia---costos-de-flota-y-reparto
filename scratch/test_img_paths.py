# -*- coding: utf-8 -*-
import os
import base64

IMG_DIR = r"C:\Users\lenovo\.gemini\antigravity-ide\brain\1028804d-2a48-4bc7-9c53-7b9c7a021007"

images = {
    "hero": "hero_cuidado_adulto_1790565707489.jpg",
    "triangulo": "triangulo_cuidado_adulto_1790565821228.jpg",
    "auto": "autocuidado_adulto_1790565724497.jpg",
    "otro": "cuidado_otro_adulto_1790565743652.jpg",
    "eco": "ecocuidado_adulto_1790565769319.jpg",
    "trabajo": "trabajo_adulto_cuidado_1790565794882.jpg",
    "arbol": "arbol_cuidado_cartoon_1790565331811.jpg",
}

for k, v in images.items():
    p = os.path.join(IMG_DIR, v)
    print(k, os.path.exists(p), os.path.getsize(p))
