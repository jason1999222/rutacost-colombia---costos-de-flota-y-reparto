# -*- coding: utf-8 -*-
r"""
Generador de la Presentación Web Interactiva Secuencial:
'LA CULTURA DEL CUIDADO' - Expositora: Angie Gómez
VERSIÓN RESPONSIVA TOTALMENTE OPTIMIZADA PARA CELULARES (iOS & Android) Y PANTALLAS GRANDES.
"""

import os

SOURCE_HTML = r"C:\Users\lenovo\Downloads\rutacost-colombia---costos-de-flota-y-reparto\scratch\Presentacion_Cultura_del_Cuidado_Mobile.html"
path_desk   = r"C:\Users\lenovo\Desktop\trabajos andres\Presentacion_Cultura_del_Cuidado.html"
path_down   = r"C:\Users\lenovo\Downloads\Presentacion_Cultura_del_Cuidado.html"

with open(SOURCE_HTML, "r", encoding="utf-8") as f:
    html_content = f.read()

# Guardar en Desktop y Descargas
try:
    with open(path_desk, "w", encoding="utf-8") as f:
        f.write(html_content)
except Exception as e:
    print(f"Aviso al guardar en Escritorio: {e}")

with open(path_down, "w", encoding="utf-8") as f:
    f.write(html_content)

print("Presentación web secuencial y móvil guardada con éxito en Descargas y Escritorio.")
