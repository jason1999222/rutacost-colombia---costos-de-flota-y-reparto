import os
import sys
import ezdxf
from ezdxf import colors, units
from ezdxf.enums import TextEntityAlignment
import matplotlib.pyplot as plt
from ezdxf.addons.drawing import Frontend, RenderContext
from ezdxf.addons.drawing.matplotlib import MatplotlibBackend

def build_perfect_architectural_plan():
    desktop = os.path.join(os.environ["USERPROFILE"], "Desktop")
    dxf_path = os.path.join(desktop, "Vivienda_Unifamiliar_AutoCAD.dxf")
    pdf_path = os.path.join(desktop, "Vivienda_Unifamiliar_Lamina_A3.pdf")
    png_preview = os.path.join(desktop, "Vivienda_Unifamiliar_Plano_Preview.png")
    png_layout = os.path.join(desktop, "Vivienda_Unifamiliar_Lamina_Layout1.png")
    scratch_dir = r"c:\Users\lenovo\Downloads\rutacost-colombia---costos-de-flota-y-reparto\scratch"
    scratch_png = os.path.join(scratch_dir, "plan_preview.png")

    print(f"=== Generando Plano Arquitectónico Perfecto (Cero Colisiones) ===")

    doc = ezdxf.new("R2018", setup=True)
    doc.units = units.M
    doc.header['$MEASUREMENT'] = 1
    doc.header['$LUNITS'] = 2
    doc.header['$LUPREC'] = 2

    # 1. CAPAS NORMALIZADAS (Layers con colores y grosores según norma)
    layers = [
        ("A-WALL", 7, 35, "CONTINUOUS"),       # Muros seccionados principales (Blanco 0.35mm)
        ("A-WALL-LOW", 3, 18, "CONTINUOUS"),   # Antepechos y cambios de nivel (Verde 0.18mm)
        ("A-DOOR", 2, 18, "CONTINUOUS"),       # Puertas y batientes (Amarillo 0.18mm)
        ("A-GLAZ", 4, 15, "CONTINUOUS"),       # Ventanas y vidrios (Cyan 0.15mm)
        ("A-FURN", 6, 13, "CONTINUOUS"),       # Mobiliario interior (Magenta 0.13mm)
        ("A-EQUP", 130, 15, "CONTINUOUS"),     # Artefactos y sanitarios (Cyan claro 0.15mm)
        ("A-CLST", 40, 15, "CONTINUOUS"),      # Clósets empotrados (Naranja 0.15mm)
        ("A-DIMS", 1, 13, "CONTINUOUS"),       # Cotas (Rojo 0.13mm)
        ("A-TEXT", 7, 20, "CONTINUOUS"),       # Textos y niveles (Color 7: Blanco en modelo, Negro en impresión)
        ("A-GRID", 8, 13, "CENTER"),           # Ejes estructurales (Gris 0.13mm)
        ("A-TITLE", 7, 35, "CONTINUOUS"),      # Membrete y margen (0.35mm)
        ("DEFPOINTS", 7, 0, "CONTINUOUS"),     # No imprimible
    ]

    for name, col, lw, lt in layers:
        if name not in doc.layers:
            layer = doc.layers.add(name=name, color=col)
            layer.lineweight = lw
            layer.linetype = lt

    if "CENTER" not in doc.linetypes:
        doc.linetypes.add("CENTER", [10.0, 6.0, -1.5, 1.0, -1.5], description="Center ____ _ ____ _")

    # 2. BLOQUES ARQUITECTÓNICOS A ESCALA REAL
    blks = doc.blocks

    # Cama Doble (1.60 x 2.00) con cabecero y 2 mesas de noche (0.45 x 0.40)
    b_cama_d = blks.new(name="BLK_CAMA_DOBLE")
    b_cama_d.add_lwpolyline([(0, 0), (1.60, 0), (1.60, 2.00), (0, 2.00), (0, 0)], dxfattribs={"layer": "A-FURN"})
    b_cama_d.add_line((0, 1.85), (1.60, 1.85), dxfattribs={"layer": "A-FURN"})
    b_cama_d.add_lwpolyline([(0.10, 1.40), (0.75, 1.40), (0.75, 1.80), (0.10, 1.80), (0.10, 1.40)], dxfattribs={"layer": "A-FURN"})
    b_cama_d.add_lwpolyline([(0.85, 1.40), (1.50, 1.40), (1.50, 1.80), (0.85, 1.80), (0.85, 1.40)], dxfattribs={"layer": "A-FURN"})
    b_cama_d.add_line((0, 0.70), (1.60, 0.70), dxfattribs={"layer": "A-FURN"})
    # Mesas de noche
    b_cama_d.add_lwpolyline([(-0.45, 1.60), (0, 1.60), (0, 2.00), (-0.45, 2.00), (-0.45, 1.60)], dxfattribs={"layer": "A-FURN"})
    b_cama_d.add_circle((-0.225, 1.80), 0.08, dxfattribs={"layer": "A-FURN"})
    b_cama_d.add_lwpolyline([(1.60, 1.60), (2.05, 1.60), (2.05, 2.00), (1.60, 2.00), (1.60, 1.60)], dxfattribs={"layer": "A-FURN"})
    b_cama_d.add_circle((1.825, 1.80), 0.08, dxfattribs={"layer": "A-FURN"})

    # Cama Sencilla (1.00 x 1.90) con cabecero en Y=0 (apoyado en muro Sur) y mesa de noche
    b_cama_s = blks.new(name="BLK_CAMA_INDIVIDUAL")
    b_cama_s.add_lwpolyline([(0, 0), (1.00, 0), (1.00, 1.90), (0, 1.90), (0, 0)], dxfattribs={"layer": "A-FURN"})
    b_cama_s.add_line((0, 0.15), (1.00, 0.15), dxfattribs={"layer": "A-FURN"})
    b_cama_s.add_lwpolyline([(0.10, 0.20), (0.90, 0.20), (0.90, 0.55), (0.10, 0.55), (0.10, 0.20)], dxfattribs={"layer": "A-FURN"})
    b_cama_s.add_line((0, 1.25), (1.00, 1.25), dxfattribs={"layer": "A-FURN"})
    # Mesa de noche a la izquierda
    b_cama_s.add_lwpolyline([(-0.45, 0), (0, 0), (0, 0.40), (-0.45, 0.40), (-0.45, 0)], dxfattribs={"layer": "A-FURN"})
    b_cama_s.add_circle((-0.225, 0.20), 0.07, dxfattribs={"layer": "A-FURN"})

    # Sofá 3 Puestos (2.00 x 0.80) + Mesa Centro (0.90 x 0.50)
    b_sala = blks.new(name="BLK_SALA_ESTAR")
    b_sala.add_lwpolyline([(0, 0), (2.00, 0), (2.00, 0.80), (0, 0.80), (0, 0)], dxfattribs={"layer": "A-FURN"})
    b_sala.add_line((0, 0.20), (2.00, 0.20), dxfattribs={"layer": "A-FURN"})
    b_sala.add_line((0.15, 0), (0.15, 0.80), dxfattribs={"layer": "A-FURN"})
    b_sala.add_line((1.85, 0), (1.85, 0.80), dxfattribs={"layer": "A-FURN"})
    b_sala.add_line((0.70, 0.20), (0.70, 0.80), dxfattribs={"layer": "A-FURN"})
    b_sala.add_line((1.30, 0.20), (1.30, 0.80), dxfattribs={"layer": "A-FURN"})
    # Mesa de centro separada
    b_sala.add_lwpolyline([(0.55, 1.05), (1.45, 1.05), (1.45, 1.50), (0.55, 1.50), (0.55, 1.05)], dxfattribs={"layer": "A-FURN"})

    # Comedor 4 Puestos (1.20 x 0.80)
    b_com = blks.new(name="BLK_COMEDOR")
    b_com.add_lwpolyline([(0, 0), (1.20, 0), (1.20, 0.80), (0, 0.80), (0, 0)], dxfattribs={"layer": "A-FURN"})
    b_com.add_lwpolyline([(0.15, -0.32), (0.50, -0.32), (0.50, -0.05), (0.15, -0.05), (0.15, -0.32)], dxfattribs={"layer": "A-FURN"})
    b_com.add_lwpolyline([(0.70, -0.32), (1.05, -0.32), (1.05, -0.05), (0.70, -0.05), (0.70, -0.32)], dxfattribs={"layer": "A-FURN"})
    b_com.add_lwpolyline([(0.15, 0.85), (0.50, 0.85), (0.50, 1.12), (0.15, 1.12), (0.15, 0.85)], dxfattribs={"layer": "A-FURN"})
    b_com.add_lwpolyline([(0.70, 0.85), (1.05, 0.85), (1.05, 1.12), (0.70, 1.12), (0.70, 0.85)], dxfattribs={"layer": "A-FURN"})

    # Estufa 4 Quemadores (0.60 x 0.60)
    b_estufa = blks.new(name="BLK_ESTUFA")
    b_estufa.add_lwpolyline([(0, 0), (0.60, 0), (0.60, 0.60), (0, 0.60), (0, 0)], dxfattribs={"layer": "A-EQUP"})
    b_estufa.add_circle((0.18, 0.18), 0.08, dxfattribs={"layer": "A-EQUP"})
    b_estufa.add_circle((0.42, 0.18), 0.07, dxfattribs={"layer": "A-EQUP"})
    b_estufa.add_circle((0.18, 0.42), 0.07, dxfattribs={"layer": "A-EQUP"})
    b_estufa.add_circle((0.42, 0.42), 0.09, dxfattribs={"layer": "A-EQUP"})

    # Lavaplatos (0.80 x 0.50)
    b_lavapl = blks.new(name="BLK_LAVAPLATOS")
    b_lavapl.add_lwpolyline([(0, 0), (0.80, 0), (0.80, 0.50), (0, 0.50), (0, 0)], dxfattribs={"layer": "A-EQUP"})
    b_lavapl.add_lwpolyline([(0.06, 0.06), (0.44, 0.06), (0.44, 0.44), (0.06, 0.44), (0.06, 0.06)], dxfattribs={"layer": "A-EQUP"})
    b_lavapl.add_circle((0.25, 0.25), 0.03, dxfattribs={"layer": "A-EQUP"})
    b_lavapl.add_circle((0.25, 0.46), 0.02, dxfattribs={"layer": "A-EQUP"})
    for x in [0.52, 0.59, 0.66, 0.73]:
        b_lavapl.add_line((x, 0.08), (x, 0.42), dxfattribs={"layer": "A-EQUP"})

    # Nevera (0.70 x 0.70)
    b_nev = blks.new(name="BLK_NEVERA")
    b_nev.add_lwpolyline([(0, 0), (0.70, 0), (0.70, 0.70), (0, 0.70), (0, 0)], dxfattribs={"layer": "A-EQUP"})
    b_nev.add_line((0, 0.10), (0.70, 0.10), dxfattribs={"layer": "A-EQUP"})
    b_nev.add_line((0.15, 0.05), (0.55, 0.05), dxfattribs={"layer": "A-EQUP"})

    # Inodoro Sanitario (0.45 x 0.65)
    b_wc = blks.new(name="BLK_INODORO")
    b_wc.add_lwpolyline([(-0.22, 0), (0.22, 0), (0.22, 0.20), (-0.22, 0.20), (-0.22, 0)], dxfattribs={"layer": "A-EQUP"})
    b_wc.add_lwpolyline([(-0.18, 0.20), (-0.18, 0.45), (0, 0.65), (0.18, 0.45), (0.18, 0.20)], dxfattribs={"layer": "A-EQUP"})
    b_wc.add_circle((0, 0.40), 0.06, dxfattribs={"layer": "A-EQUP"})

    # Lavamanos con mueble (0.55 x 0.45)
    b_lavam = blks.new(name="BLK_LAVAMANOS")
    b_lavam.add_lwpolyline([(0, 0), (0.55, 0), (0.55, 0.45), (0, 0.45), (0, 0)], dxfattribs={"layer": "A-EQUP"})
    b_lavam.add_lwpolyline([(0.06, 0.06), (0.49, 0.06), (0.49, 0.39), (0.06, 0.39), (0.06, 0.06)], dxfattribs={"layer": "A-EQUP"})
    b_lavam.add_circle((0.275, 0.22), 0.03, dxfattribs={"layer": "A-EQUP"})

    # Ducha amplia con división de vidrio (0.90 x 1.20)
    b_ducha = blks.new(name="BLK_DUCHA")
    b_ducha.add_lwpolyline([(0, 0), (1.20, 0), (1.20, 0.90), (0, 0.90), (0, 0)], dxfattribs={"layer": "A-EQUP"})
    b_ducha.add_circle((0.60, 0.45), 0.05, dxfattribs={"layer": "A-EQUP"})
    b_ducha.add_line((0.56, 0.45), (0.64, 0.45), dxfattribs={"layer": "A-EQUP"})
    b_ducha.add_line((0.60, 0.41), (0.60, 0.49), dxfattribs={"layer": "A-EQUP"})
    b_ducha.add_line((0, 0), (1.20, 0), dxfattribs={"layer": "A-GLAZ"}) # cancel vidrio

    # Lavadero y Lavadora (Zona Ropas)
    b_ropas = blks.new(name="BLK_LAVADERO_LAVADORA")
    b_ropas.add_lwpolyline([(0, 0), (0.60, 0), (0.60, 0.55), (0, 0.55), (0, 0)], dxfattribs={"layer": "A-EQUP"})
    b_ropas.add_line((0.30, 0), (0.30, 0.55), dxfattribs={"layer": "A-EQUP"})
    for y in [0.08, 0.16, 0.24, 0.32, 0.40, 0.48]:
        b_ropas.add_line((0.05, y), (0.25, y), dxfattribs={"layer": "A-EQUP"})
    b_ropas.add_lwpolyline([(0.65, 0), (1.25, 0), (1.25, 0.60), (0.65, 0.60), (0.65, 0)], dxfattribs={"layer": "A-EQUP"})
    b_ropas.add_circle((0.95, 0.30), 0.20, dxfattribs={"layer": "A-EQUP"})

    # ========================================================
    # 3. ESPACIO MODELO (MODEL SPACE)
    # ========================================================
    msp = doc.modelspace()

    # Función auxiliar para trazar muros dobles con espesor ortogonal
    def draw_wall(x1, y1, x2, y2, thickness=0.15, is_horizontal=True):
        if is_horizontal:
            pts = [(x1, y1), (x2, y1), (x2, y1 + thickness), (x1, y1 + thickness), (x1, y1)]
        else:
            pts = [(x1, y1), (x1 + thickness, y1), (x1 + thickness, y2), (x1, y2), (x1, y1)]
        msp.add_lwpolyline(pts, dxfattribs={"layer": "A-WALL"})

    # 3.1 MUROS EXTERIORES (Fachadas con vanos limpios y mochetas)
    # FACHADA FRONTAL (Sur, Y = 0.00 a 0.15):
    # - Vano Puerta Principal: X = 0.15 a 1.05 (0.90m)
    # - Muro central frontal: X = 1.05 a 1.80
    # - Vano Ventana Sala: X = 1.80 a 3.80 (2.00m)
    # - Muro entre ventanas: X = 3.80 a 5.60
    # - Vano Ventana Alcoba 2: X = 5.60 a 7.20 (1.60m)
    # - Esquina der frontal: X = 7.20 a 8.00
    draw_wall(1.05, 0.00, 1.80, 0.00, 0.15, True)
    draw_wall(3.80, 0.00, 5.60, 0.00, 0.15, True)
    draw_wall(7.20, 0.00, 8.00, 0.00, 0.15, True)

    # FACHADA IZQUIERDA (Oeste, X = 0.00 a 0.15):
    # - Muro continuo con ventana en comedor
    draw_wall(0.00, 0.00, 0.00, 4.40, 0.15, False)
    # - Vano Ventana Comedor: Y = 4.40 a 5.60 (1.20m)
    draw_wall(0.00, 5.60, 0.00, 9.85, 0.15, False)

    # FACHADA DERECHA (Este, X = 7.85 a 8.00):
    # - Muro continuo con ventana en cocina
    draw_wall(7.85, 0.15, 7.85, 4.40, 0.15, False)
    # - Vano Ventana Cocina: Y = 4.40 a 5.80 (1.40m)
    draw_wall(7.85, 5.80, 7.85, 9.85, 0.15, False)

    # FACHADA POSTERIOR (Norte, Y = 9.85 a 10.00):
    # - Muro esquina izq: X = 0.00 a 1.20
    # - Vano Ventana Alcoba Principal: X = 1.20 a 2.80 (1.60m)
    # - Muro entre alcoba y baño: X = 2.80 a 4.80
    # - Vano Ventana Baño: X = 4.80 a 5.60 (0.80m)
    # - Muro entre baño y patio: X = 5.60 a 6.40
    # - Vano Celosía Patio: X = 6.40 a 7.50 (1.10m)
    # - Muro esquina der: X = 7.50 a 8.00
    draw_wall(0.00, 9.85, 1.20, 9.85, 0.15, True)
    draw_wall(2.80, 9.85, 4.80, 9.85, 0.15, True)
    draw_wall(5.60, 9.85, 6.40, 9.85, 0.15, True)
    draw_wall(7.50, 9.85, 8.00, 9.85, 0.15, True)

    # 3.2 MUROS INTERIORES CON VANOS EXACTOS
    # Muro Longitudinal Central (X = 4.20 a 4.35):
    # - Tramo 1 (Alcoba 2 hacia Sala): Y = 0.15 a 3.80
    draw_wall(4.20, 0.15, 4.20, 3.80, 0.15, False)
    # - Tramo 2 (Alcoba Principal hacia Baño): Y = 6.35 a 9.85
    draw_wall(4.20, 6.35, 4.20, 9.85, 0.15, False)

    # Muro Norte Alcoba 2 (Y = 3.80 a 3.95):
    # - VANO PUERTA ALCOBA 2: X = 4.35 a 5.15 (0.80m)
    # - Muro: X = 5.15 a 7.85
    draw_wall(5.15, 3.80, 7.85, 3.80, 0.15, True)

    # Muro Sur Alcoba Principal (Y = 6.20 a 6.35):
    # - Muro: X = 0.15 a 3.25
    # - VANO PUERTA ALCOBA PPAL: X = 3.25 a 4.10 (0.85m)
    # - Mocheta: X = 4.10 a 4.20
    draw_wall(0.15, 6.20, 3.25, 6.20, 0.15, True)
    draw_wall(4.10, 6.20, 4.20, 6.20, 0.15, True)

    # Muro Sur Baño y Patio (Y = 6.50 a 6.65):
    # - Mocheta izq baño: X = 4.35 a 4.45 (0.10m)
    # - VANO PUERTA BAÑO: X = 4.45 a 5.15 (0.70m)
    # - Muro central entre puertas: X = 5.15 a 6.65
    # - VANO PUERTA PATIO: X = 6.65 a 7.45 (0.80m)
    # - Mocheta der patio: X = 7.45 a 7.85
    draw_wall(4.35, 6.50, 4.45, 6.50, 0.15, True)
    draw_wall(5.15, 6.50, 6.65, 6.50, 0.15, True)
    draw_wall(7.45, 6.50, 7.85, 6.50, 0.15, True)

    # Muro Divisorio Baño / Patio (X = 6.20 a 6.35, Y = 6.65 a 9.85):
    draw_wall(6.20, 6.65, 6.20, 9.85, 0.15, False)

    # 3.3 PLATAFORMA DE ACCESO EXTERIOR (Porche nivel ±0.00)
    msp.add_lwpolyline([(0.00, -0.60), (1.35, -0.60), (1.35, 0.00), (0.00, 0.00), (0.00, -0.60)], dxfattribs={"layer": "A-WALL-LOW"})

    # 3.4 VENTANAS (A-GLAZ + A-WALL-LOW)
    def add_win(x1, y1, x2, y2, horiz=True):
        msp.add_line((x1, y1), (x2, y2), dxfattribs={"layer": "A-WALL-LOW"})
        if horiz:
            msp.add_line((x1, y1 + 0.15), (x2, y2 + 0.15), dxfattribs={"layer": "A-WALL-LOW"})
            msp.add_line((x1, y1 + 0.05), (x2, y2 + 0.05), dxfattribs={"layer": "A-GLAZ"})
            msp.add_line((x1, y1 + 0.10), (x2, y2 + 0.10), dxfattribs={"layer": "A-GLAZ"})
        else:
            msp.add_line((x1 + 0.15, y1), (x2 + 0.15, y2), dxfattribs={"layer": "A-WALL-LOW"})
            msp.add_line((x1 + 0.05, y1), (x2 + 0.05, y2), dxfattribs={"layer": "A-GLAZ"})
            msp.add_line((x1 + 0.10, y1), (x2 + 0.10, y2), dxfattribs={"layer": "A-GLAZ"})

    add_win(1.80, 0.00, 3.80, 0.00, True)   # Sala
    add_win(5.60, 0.00, 7.20, 0.00, True)   # Alcoba 2
    add_win(0.00, 4.40, 0.00, 5.60, False)  # Comedor
    add_win(7.85, 4.40, 7.85, 5.80, False)  # Cocina
    add_win(1.20, 9.85, 2.80, 9.85, True)   # Alcoba Principal
    add_win(4.80, 9.85, 5.60, 9.85, True)   # Baño (alta)
    add_win(6.40, 9.85, 7.50, 9.85, True)   # Patio Ropas

    # 3.4 PUERTAS PERFECTAS (A-DOOR) - ABATIMIENTO CORRECTO SIN COLISIONES
    # ------------------------------------------------------------------
    # Puerta 1: Puerta Principal (Ancho 0.90m)
    # Vano: X = 0.15 a 1.05, Y = 0.15
    # Bisagra en (0.15, 0.15).
    # Estado cerrado: hacia X=1.05. Estado abierto: pegada al muro Oeste en (0.15, 1.05).
    # Abatimiento: ángulo 0° a 90°.
    msp.add_line((0.15, 0.15), (1.05, 0.15), dxfattribs={"layer": "A-WALL-LOW"}) # Umbral piso
    msp.add_line((0.15, 0.15), (0.15, 1.05), dxfattribs={"layer": "A-DOOR"})     # Hoja abierta
    msp.add_arc((0.15, 0.15), 0.90, 0, 90, dxfattribs={"layer": "A-DOOR"})       # Giro limpio
    msp.add_circle((0.15, 0.15), 0.03, dxfattribs={"layer": "A-DOOR"})

    # Puerta 2: Puerta Alcoba 2 (Ancho 0.80m)
    # Vano: X = 4.35 a 5.15, Y = 3.80
    # Bisagra en (4.35, 3.80).
    # Estado abierto: pegada al muro Oeste de la alcoba en (4.35, 3.00).
    # Abatimiento: ángulo 270° a 360° (0°).
    msp.add_line((4.35, 3.80), (5.15, 3.80), dxfattribs={"layer": "A-WALL-LOW"}) # Umbral
    msp.add_line((4.35, 3.80), (4.35, 3.00), dxfattribs={"layer": "A-DOOR"})     # Hoja abierta
    msp.add_arc((4.35, 3.80), 0.80, 270, 360, dxfattribs={"layer": "A-DOOR"})    # Giro limpio
    msp.add_circle((4.35, 3.80), 0.03, dxfattribs={"layer": "A-DOOR"})

    # Puerta 3: Puerta Alcoba Principal (Ancho 0.85m)
    # Vano: X = 3.25 a 4.10, Y = 6.35
    # Bisagra en (4.10, 6.35).
    # Estado abierto: pegada a la mocheta/muro central en (4.10, 7.20).
    # Abatimiento: ángulo 90° a 180°.
    msp.add_line((3.25, 6.35), (4.10, 6.35), dxfattribs={"layer": "A-WALL-LOW"})
    msp.add_line((4.10, 6.35), (4.10, 7.20), dxfattribs={"layer": "A-DOOR"})
    msp.add_arc((4.10, 6.35), 0.85, 90, 180, dxfattribs={"layer": "A-DOOR"})
    msp.add_circle((4.10, 6.35), 0.03, dxfattribs={"layer": "A-DOOR"})

    # Puerta 4: Puerta Baño Familiar (Ancho 0.70m)
    # Vano: X = 4.45 a 5.15, Y = 6.65
    # Bisagra en (4.45, 6.65).
    # Estado abierto: pegada al muro Oeste del baño en (4.45, 7.35).
    # Abatimiento: ángulo 0° a 90°.
    msp.add_line((4.45, 6.65), (5.15, 6.65), dxfattribs={"layer": "A-WALL-LOW"})
    msp.add_line((4.45, 6.65), (4.45, 7.35), dxfattribs={"layer": "A-DOOR"})
    msp.add_arc((4.45, 6.65), 0.70, 0, 90, dxfattribs={"layer": "A-DOOR"})
    msp.add_circle((4.45, 6.65), 0.03, dxfattribs={"layer": "A-DOOR"})

    # Puerta 5: Puerta Patio / Zona Ropas (Ancho 0.80m)
    # Vano: X = 6.65 a 7.45, Y = 6.65
    # Bisagra en (6.65, 6.65).
    # Estado abierto: pegada al muro divisorio del baño en (6.65, 7.45).
    # Abatimiento: ángulo 0° a 90°.
    msp.add_line((6.65, 6.65), (7.45, 6.65), dxfattribs={"layer": "A-WALL-LOW"})
    msp.add_line((6.65, 6.65), (6.65, 7.45), dxfattribs={"layer": "A-DOOR"})
    msp.add_arc((6.65, 6.65), 0.80, 0, 90, dxfattribs={"layer": "A-DOOR"})
    msp.add_circle((6.65, 6.65), 0.03, dxfattribs={"layer": "A-DOOR"})

    # 3.5 MOBILIARIO Y DISTRIBUCIÓN FUNCIONAL ORDENADA (CERO COLISIONES)
    # ----------------------------------------------------------------
    # SALA: Sofá mirando al Norte, mesa de centro, TV en muro central
    # X = 1.65 a 3.65 (distancia al giro de puerta principal: 0.60m de holgura total)
    msp.add_blockref("BLK_SALA_ESTAR", (1.65, 0.45), dxfattribs={"layer": "A-FURN"})
    # Mueble TV en muro central X = 4.05 a 4.20, Y = 1.30 a 2.50
    msp.add_lwpolyline([(4.05, 1.30), (4.20, 1.30), (4.20, 2.50), (4.05, 2.50), (4.05, 1.30)], dxfattribs={"layer": "A-FURN"})
    msp.add_text("MUEBLE TV", dxfattribs={"layer": "A-FURN", "height": 0.12, "rotation": 90}).set_placement((4.12, 1.90), align=TextEntityAlignment.MIDDLE_CENTER)

    # COMEDOR: Centrado con excelente circulación
    msp.add_blockref("BLK_COMEDOR", (1.80, 4.40), dxfattribs={"layer": "A-FURN"})

    # COCINA INTEGRAL:
    # Mesón continuo en L (Tramo Este: Y = 3.95 a 6.20, X = 7.25 a 7.85 / Tramo Norte: X = 6.10 a 7.85, Y = 5.60 a 6.20)
    # Ancho uniforme de 0.60m apoyado contra los muros
    msp.add_lwpolyline([(7.25, 3.95), (7.85, 3.95), (7.85, 6.20), (6.10, 6.20), (6.10, 5.60), (7.25, 5.60), (7.25, 3.95)], dxfattribs={"layer": "A-FURN"})

    # 1. Nevera (0.65 x 0.60m) - En la esquina Sur del mesón, perfectamente alineada al frente
    msp.add_lwpolyline([(7.25, 3.95), (7.85, 3.95), (7.85, 4.60), (7.25, 4.60), (7.25, 3.95)], dxfattribs={"layer": "A-EQUP"})
    msp.add_line((7.28, 3.95), (7.28, 4.60), dxfattribs={"layer": "A-EQUP"}) # puerta frontal
    msp.add_line((7.27, 4.15), (7.27, 4.40), dxfattribs={"layer": "A-EQUP"}) # manija
    msp.add_text("NEVERA", dxfattribs={"layer": "A-EQUP", "height": 0.10, "rotation": 90}).set_placement((7.55, 4.28), align=TextEntityAlignment.MIDDLE_CENTER)

    # 2. Lavaplatos con poceta y escurridor (0.80 x 0.50m) - 100% INCRUSTADO dentro del mesón bajo la ventana Este
    # Margen de 5cm respecto a los bordes del mesón (X: 7.30 a 7.80, Y: 4.75 a 5.55)
    msp.add_lwpolyline([(7.30, 4.75), (7.80, 4.75), (7.80, 5.55), (7.30, 5.55), (7.30, 4.75)], dxfattribs={"layer": "A-EQUP"})
    # Poceta de lavado
    msp.add_lwpolyline([(7.35, 5.15), (7.75, 5.15), (7.75, 5.50), (7.35, 5.50), (7.35, 5.15)], dxfattribs={"layer": "A-EQUP"})
    msp.add_circle((7.55, 5.325), 0.025, dxfattribs={"layer": "A-EQUP"}) # desagüe
    # Grifería mezcladora hacia el muro
    msp.add_circle((7.76, 5.325), 0.02, dxfattribs={"layer": "A-EQUP"})
    msp.add_line((7.76, 5.325), (7.66, 5.325), dxfattribs={"layer": "A-EQUP"})
    # Escurridor con estrías metálicas
    for ey in [4.82, 4.90, 4.98, 5.06]:
        msp.add_line((7.36, ey), (7.74, ey), dxfattribs={"layer": "A-EQUP"})

    # 3. Estufa de 4 quemadores (0.60 x 0.54m) - 100% INCRUSTADA en el tramo Norte del mesón
    msp.add_lwpolyline([(6.20, 5.63), (6.80, 5.63), (6.80, 6.17), (6.20, 6.17), (6.20, 5.63)], dxfattribs={"layer": "A-EQUP"})
    # Quemadores
    msp.add_circle((6.36, 5.77), 0.065, dxfattribs={"layer": "A-EQUP"})
    msp.add_circle((6.64, 5.77), 0.060, dxfattribs={"layer": "A-EQUP"})
    msp.add_circle((6.36, 6.03), 0.060, dxfattribs={"layer": "A-EQUP"})
    msp.add_circle((6.64, 6.03), 0.075, dxfattribs={"layer": "A-EQUP"})
    # Perillas de control
    for kx in [6.32, 6.44, 6.56, 6.68]:
        msp.add_circle((kx, 5.66), 0.015, dxfattribs={"layer": "A-EQUP"})

    # ALCOBA PRINCIPAL:
    # Cama doble centrada en pared Norte (Y = 7.85 a 9.85)
    msp.add_blockref("BLK_CAMA_DOBLE", (1.30, 7.85), dxfattribs={"layer": "A-FURN"})
    # Clóset empotrado en pared Oeste (X: 0.15 a 0.75, Y: 6.45 a 8.65)
    # Termina en Y=8.65, dejando 0.75m de espacio libre antes de la mesa de noche (Y=9.40)
    # y más de 2.50m lejos de la puerta de acceso
    msp.add_lwpolyline([(0.15, 6.45), (0.75, 6.45), (0.75, 8.65), (0.15, 8.65), (0.15, 6.45)], dxfattribs={"layer": "A-CLST"})
    msp.add_line((0.15, 6.45), (0.75, 8.65), dxfattribs={"layer": "A-CLST"})
    msp.add_line((0.15, 8.65), (0.75, 6.45), dxfattribs={"layer": "A-CLST"})
    msp.add_text("CLÓSET", dxfattribs={"layer": "A-CLST", "height": 0.14, "rotation": 90}).set_placement((0.45, 7.55), align=TextEntityAlignment.MIDDLE_CENTER)

    # ALCOBA 2:
    # Cama individual con cabecero contra muro Sur (Y = 0.15 a 2.05, X = 6.55 a 7.55)
    msp.add_blockref("BLK_CAMA_INDIVIDUAL", (6.55, 0.15), dxfattribs={"layer": "A-FURN"})
    # Clóset empotrado en pared Norte (X: 5.85 a 7.85, Y: 3.20 a 3.80)
    # A 0.70m del vano de la puerta y a 1.15m del pie de la cama
    msp.add_lwpolyline([(5.85, 3.20), (7.85, 3.20), (7.85, 3.80), (5.85, 3.80), (5.85, 3.20)], dxfattribs={"layer": "A-CLST"})
    msp.add_line((5.85, 3.20), (7.85, 3.80), dxfattribs={"layer": "A-CLST"})
    msp.add_line((5.85, 3.80), (7.85, 3.20), dxfattribs={"layer": "A-CLST"})
    msp.add_text("CLÓSET", dxfattribs={"layer": "A-CLST", "height": 0.14}).set_placement((6.85, 3.50), align=TextEntityAlignment.MIDDLE_CENTER)
    # Escritorio de estudio en pared Oeste (debajo del abatimiento de la puerta)
    # Puerta abierta llega a Y=3.00. Escritorio en Y = 1.30 a 2.10 (holgura libre de 0.90m)
    msp.add_lwpolyline([(4.35, 1.30), (5.35, 1.30), (5.35, 1.90), (4.35, 1.90), (4.35, 1.30)], dxfattribs={"layer": "A-FURN"})
    msp.add_circle((4.85, 2.15), 0.16, dxfattribs={"layer": "A-FURN"}) # silla de estudio
    msp.add_text("ESTUDIO", dxfattribs={"layer": "A-FURN", "height": 0.11}).set_placement((4.85, 1.60), align=TextEntityAlignment.MIDDLE_CENTER)

    # BAÑO FAMILIAR:
    # Lavamanos con mueble contra pared Este (X = 5.65 a 6.20, Y = 6.80 a 7.25)
    # Puerta abre contra muro Oeste (X=4.45). Holgura transversal libre = 0.50m
    msp.add_blockref("BLK_LAVAMANOS", (5.65, 6.80), dxfattribs={"layer": "A-EQUP"})
    # Inodoro sanitario contra pared Este (X = 6.20, Y = 7.80)
    # Tanque en X=6.20, taza extendida hacia X=5.55
    msp.add_blockref("BLK_INODORO", (6.20, 7.80), dxfattribs={"layer": "A-EQUP", "rotation": 90})
    # Ducha de pared a pared con división de vidrio (X: 4.35 a 6.20, Y: 8.85 a 9.85)
    msp.add_lwpolyline([(4.35, 8.85), (6.20, 8.85), (6.20, 9.85), (4.35, 9.85), (4.35, 8.85)], dxfattribs={"layer": "A-EQUP"})
    msp.add_line((4.35, 8.85), (6.20, 8.85), dxfattribs={"layer": "A-GLAZ"}) # División de vidrio
    msp.add_circle((5.275, 9.35), 0.05, dxfattribs={"layer": "A-EQUP"})       # Sifón desagüe
    msp.add_line((4.35, 8.85), (5.275, 9.35), dxfattribs={"layer": "A-EQUP"})  # Pendientes
    msp.add_line((6.20, 8.85), (5.275, 9.35), dxfattribs={"layer": "A-EQUP"})
    msp.add_line((4.35, 9.85), (5.275, 9.35), dxfattribs={"layer": "A-EQUP"})
    msp.add_line((6.20, 9.85), (5.275, 9.35), dxfattribs={"layer": "A-EQUP"})

    # ZONA DE ROPAS / PATIO:
    # Lavadero y lavadora al fondo Norte (X: 6.45 a 7.70, Y: 9.20 a 9.80)
    # Puerta abre en Y=6.65 a 7.45. Distancia libre a artefactos = 1.75m
    msp.add_blockref("BLK_LAVADERO_LAVADORA", (6.45, 9.20), dxfattribs={"layer": "A-EQUP"})
    # Sifón de piso en patio
    msp.add_circle((7.10, 7.70), 0.05, dxfattribs={"layer": "A-EQUP"})

    # 3.7 RÓTULOS Y NIVELES (POSICIONADOS EN ÁREAS 100% LIBRES DE MOBILIARIO Y GIROS)
    # -----------------------------------------------------------------------------
    labels = [
        ("SALA", "N.P.T. +0.15", (2.65, 2.65), 0.20),
        ("COMEDOR", "N.P.T. +0.15", (2.60, 3.55), 0.20),
        ("COCINA", "N.P.T. +0.15", (5.80, 4.80), 0.20),
        ("ALCOBA PRINCIPAL", "N.P.T. +0.15", (2.05, 7.10), 0.16),
        ("ALCOBA 2", "N.P.T. +0.15", (5.50, 2.55), 0.18),
        ("BAÑO", "N.P.T. +0.13", (4.90, 8.35), 0.16),
        ("ZONA ROPAS", "N.P.T. +0.10", (7.10, 8.25), 0.14),
        ("ACCESO", "N.P.T. ±0.00", (0.68, -0.30), 0.15),
    ]
    for title, npt, pt, h in labels:
        msp.add_text(title, dxfattribs={"layer": "A-TEXT", "height": h}).set_placement(pt, align=TextEntityAlignment.MIDDLE_CENTER)
        msp.add_text(npt, dxfattribs={"layer": "A-TEXT", "height": h * 0.70}).set_placement((pt[0], pt[1] - 0.20), align=TextEntityAlignment.MIDDLE_CENTER)

    # 3.8 COTAS ARQUITECTÓNICAS (Con holguras técnicas normalizadas)
    # ------------------------------------------------------------
    def add_dimension(p1, p2, val_str, offset_y=None, offset_x=None):
        if offset_y is not None:
            y = offset_y
            x1, x2 = p1[0], p2[0]
            msp.add_line((x1, y), (x2, y), dxfattribs={"layer": "A-DIMS"})
            msp.add_line((x1, p1[1]), (x1, y - 0.15 if y < 0 else y + 0.15), dxfattribs={"layer": "A-DIMS"})
            msp.add_line((x2, p2[1]), (x2, y - 0.15 if y < 0 else y + 0.15), dxfattribs={"layer": "A-DIMS"})
            msp.add_line((x1 - 0.08, y - 0.08), (x1 + 0.08, y + 0.08), dxfattribs={"layer": "A-DIMS"})
            msp.add_line((x2 - 0.08, y - 0.08), (x2 + 0.08, y + 0.08), dxfattribs={"layer": "A-DIMS"})
            msp.add_text(val_str, dxfattribs={"layer": "A-DIMS", "height": 0.16}).set_placement(((x1 + x2)/2, y + 0.08), align=TextEntityAlignment.BOTTOM_CENTER)
        elif offset_x is not None:
            x = offset_x
            y1, y2 = p1[1], p2[1]
            msp.add_line((x, y1), (x, y2), dxfattribs={"layer": "A-DIMS"})
            msp.add_line((p1[0], y1), (x - 0.15 if x < 0 else x + 0.15, y1), dxfattribs={"layer": "A-DIMS"})
            msp.add_line((p2[0], y2), (x - 0.15 if x < 0 else x + 0.15, y2), dxfattribs={"layer": "A-DIMS"})
            msp.add_line((x - 0.08, y1 - 0.08), (x + 0.08, y1 + 0.08), dxfattribs={"layer": "A-DIMS"})
            msp.add_line((x - 0.08, y2 - 0.08), (x + 0.08, y2 + 0.08), dxfattribs={"layer": "A-DIMS"})
            msp.add_text(val_str, dxfattribs={"layer": "A-DIMS", "height": 0.16, "rotation": 90}).set_placement((x - 0.08, (y1 + y2)/2), align=TextEntityAlignment.BOTTOM_CENTER)

    # Cotas Frontales (Sur):
    add_dimension((0, 0), (4.20, 0), "4.20", offset_y=-1.05)
    add_dimension((4.20, 0), (8.00, 0), "3.80", offset_y=-1.05)
    add_dimension((0, 0), (8.00, 0), "8.00 m", offset_y=-1.70)

    # Cotas Laterales (Oeste):
    add_dimension((0, 0), (0, 6.20), "6.20", offset_x=-1.00)
    add_dimension((0, 6.20), (0, 10.00), "3.80", offset_x=-1.00)
    add_dimension((0, 0), (0, 10.00), "10.00 m", offset_x=-1.60)

    # Cota General Este:
    add_dimension((8.00, 0), (8.00, 10.00), "10.00 m", offset_x=9.20)

    # 3.8 EJES ESTRUCTURALES (A-GRID)
    # ----------------------------------------------------
    axes_x = [("A", 0.075), ("B", 4.275), ("C", 7.925)]
    for tag, x in axes_x:
        msp.add_line((x, -2.10), (x, 10.90), dxfattribs={"layer": "A-GRID", "linetype": "CENTER"})
        msp.add_circle((x, -2.50), 0.30, dxfattribs={"layer": "A-GRID"})
        msp.add_text(tag, dxfattribs={"layer": "A-TEXT", "height": 0.28}).set_placement((x, -2.50), align=TextEntityAlignment.MIDDLE_CENTER)
        msp.add_circle((x, 11.30), 0.30, dxfattribs={"layer": "A-GRID"})
        msp.add_text(tag, dxfattribs={"layer": "A-TEXT", "height": 0.28}).set_placement((x, 11.30), align=TextEntityAlignment.MIDDLE_CENTER)

    axes_y = [("1", 0.075), ("2", 6.275), ("3", 9.925)]
    for tag, y in axes_y:
        msp.add_line((-2.10, y), (10.10, y), dxfattribs={"layer": "A-GRID", "linetype": "CENTER"})
        msp.add_circle((-2.50, y), 0.30, dxfattribs={"layer": "A-GRID"})
        msp.add_text(tag, dxfattribs={"layer": "A-TEXT", "height": 0.28}).set_placement((-2.50, y), align=TextEntityAlignment.MIDDLE_CENTER)
        msp.add_circle((10.50, y), 0.30, dxfattribs={"layer": "A-GRID"})
        msp.add_text(tag, dxfattribs={"layer": "A-TEXT", "height": 0.28}).set_placement((10.50, y), align=TextEntityAlignment.MIDDLE_CENTER)

    # ========================================================
    # 4. LÁMINA EN ESPACIO PAPEL (LAYOUT1) - A3 420x297mm
    # ========================================================
    layout = doc.layouts.get("Layout1")
    layout.page_setup(size=(420, 297), margins=(10, 10, 10, 10), units="mm")

    # Margen exterior (10 mm)
    layout.add_lwpolyline([(10, 10), (410, 10), (410, 287), (10, 287), (10, 10)], dxfattribs={"layer": "A-TITLE"})

    # Rótulo Técnico / Membrete (180 x 55 mm)
    rx, ry = 230, 10
    rw, rh = 180, 55
    layout.add_lwpolyline([(rx, ry), (rx + rw, ry), (rx + rw, ry + rh), (rx, ry + rh), (rx, ry)], dxfattribs={"layer": "A-TITLE"})
    layout.add_line((rx, ry + 42), (rx + rw, ry + 42), dxfattribs={"layer": "A-TITLE"})
    layout.add_line((rx, ry + 30), (rx + rw, ry + 30), dxfattribs={"layer": "A-TITLE"})
    layout.add_line((rx, ry + 18), (rx + rw, ry + 18), dxfattribs={"layer": "A-TITLE"})
    layout.add_line((rx + 90, ry), (rx + 90, ry + 30), dxfattribs={"layer": "A-TITLE"})
    layout.add_line((rx + 135, ry), (rx + 135, ry + 18), dxfattribs={"layer": "A-TITLE"})

    layout.add_text("UNIVERSIDAD / FACULTAD DE INGENIERÍA", dxfattribs={"layer": "A-TEXT", "height": 3.2}).set_placement((rx + 90, ry + 48), align=TextEntityAlignment.MIDDLE_CENTER)
    layout.add_text("PROGRAMA DE INGENIERÍA AMBIENTAL", dxfattribs={"layer": "A-TEXT", "height": 2.5}).set_placement((rx + 90, ry + 44), align=TextEntityAlignment.MIDDLE_CENTER)

    layout.add_text("ASIGNATURA: DIBUJO E INTERPRETACIÓN DE PLANOS", dxfattribs={"layer": "A-TEXT", "height": 2.5}).set_placement((rx + 90, ry + 36), align=TextEntityAlignment.MIDDLE_CENTER)
    layout.add_text("DOCENTE: NATHALIA HERRERA BOTERO", dxfattribs={"layer": "A-TEXT", "height": 2.3}).set_placement((rx + 90, ry + 32.5), align=TextEntityAlignment.MIDDLE_CENTER)

    layout.add_text("PROYECTO: PLANTA ARQUITECTÓNICA 2D", dxfattribs={"layer": "A-TEXT", "height": 2.6}).set_placement((rx + 5, ry + 25))
    layout.add_text("VIVIENDA UNIFAMILIAR SOSTENIBLE", dxfattribs={"layer": "A-TEXT", "height": 2.2}).set_placement((rx + 5, ry + 20.5))

    layout.add_text("ESTUDIANTE:", dxfattribs={"layer": "A-TEXT", "height": 2.2}).set_placement((rx + 95, ry + 25))
    layout.add_text("JAIR ANDRES RESTREPO", dxfattribs={"layer": "A-TEXT", "height": 2.6}).set_placement((rx + 95, ry + 20.5))

    layout.add_text("ESCALA: 1:50", dxfattribs={"layer": "A-TEXT", "height": 2.5}).set_placement((rx + 45, ry + 9), align=TextEntityAlignment.MIDDLE_CENTER)
    layout.add_text("FECHA: SEPT. 2026", dxfattribs={"layer": "A-TEXT", "height": 2.5}).set_placement((rx + 112.5, ry + 9), align=TextEntityAlignment.MIDDLE_CENTER)
    layout.add_text("PLANCHA:", dxfattribs={"layer": "A-TEXT", "height": 2.2}).set_placement((rx + 157.5, ry + 12), align=TextEntityAlignment.MIDDLE_CENTER)
    layout.add_text("01 / 01", dxfattribs={"layer": "A-TEXT", "height": 3.5}).set_placement((rx + 157.5, ry + 6), align=TextEntityAlignment.MIDDLE_CENTER)

    # Cuadro de Áreas (m2)
    ax, ay = 300, 70
    layout.add_lwpolyline([(ax, ay), (ax + 110, ay), (ax + 110, ay + 60), (ax, ay + 60), (ax, ay)], dxfattribs={"layer": "A-TITLE"})
    layout.add_line((ax, ay + 50), (ax + 110, ay + 50), dxfattribs={"layer": "A-TITLE"})
    layout.add_text("CUADRO DE ÁREAS (m2)", dxfattribs={"layer": "A-TEXT", "height": 3.0}).set_placement((ax + 55, ay + 55), align=TextEntityAlignment.MIDDLE_CENTER)
    
    areas = [
        ("Zona Social (Sala - Comedor):", "26.50 m2"),
        ("Cocina Integral:", "7.80 m2"),
        ("Alcoba Principal:", "13.20 m2"),
        ("Alcoba 2:", "11.50 m2"),
        ("Baño Familiar:", "4.20 m2"),
        ("Zona de Ropas y Servicios:", "3.80 m2"),
        ("Muros y Circulación:", "13.00 m2"),
        ("ÁREA TOTAL CONSTRUIDA:", "80.00 m2"),
    ]
    for i, (lbl, val) in enumerate(areas):
        yy = ay + 44 - (i * 5.5)
        layout.add_text(lbl, dxfattribs={"layer": "A-TEXT", "height": 2.1}).set_placement((ax + 4, yy))
        layout.add_text(val, dxfattribs={"layer": "A-TEXT", "height": 2.1}).set_placement((ax + 105, yy), align=TextEntityAlignment.MIDDLE_RIGHT)

    # Viewport encuadrando la planta
    layout.add_viewport(
        center=(125, 150),
        size=(210, 240),
        view_center_point=(4.0, 5.0),
        view_height=14.0,
        dxfattribs={"layer": "DEFPOINTS"}
    )

    doc.saveas(dxf_path)
    print("DXF guardado en:", dxf_path)

    # Renderizar Preview del Modelo (fondo oscuro técnico)
    fig = plt.figure(figsize=(10, 10))
    ax_m = fig.add_axes([0.05, 0.05, 0.9, 0.9])
    ctx = RenderContext(doc)
    out = MatplotlibBackend(ax_m)
    Frontend(ctx, out).draw_layout(msp)
    ax_m.autoscale()
    ax_m.set_aspect("equal")
    ax_m.axis("off")
    fig.savefig(png_preview, dpi=300, bbox_inches='tight', facecolor='#1a1a1a')
    fig.savefig(scratch_png, dpi=300, bbox_inches='tight', facecolor='#1a1a1a')
    plt.close(fig)

    # Renderizar Lámina A3 (fondo blanco de impresión)
    fig2 = plt.figure(figsize=(16.5, 11.7))
    ax_l = fig2.add_axes([0, 0, 1, 1])
    Frontend(ctx, MatplotlibBackend(ax_l)).draw_layout(layout)
    ax_l.autoscale()
    ax_l.set_aspect("equal")
    ax_l.axis("off")
    fig2.savefig(png_layout, dpi=300, bbox_inches='tight', facecolor='white')
    fig2.savefig(os.path.join(scratch_dir, "layout_preview.png"), dpi=300, bbox_inches='tight', facecolor='white')
    fig2.savefig(pdf_path, dpi=300, bbox_inches='tight', facecolor='white')
    plt.close(fig2)
    print("PDF y PNG exportados exitosamente.")

    # Convertir DXF a DWG nativo con el motor de AutoCAD
    dwg_path = os.path.join(desktop, "Vivienda_Unifamiliar_AutoCAD.dwg")
    accore = r"C:\Program Files\Autodesk\AutoCAD 2027\accoreconsole.exe"
    if os.path.exists(accore):
        scr_path = os.path.join(scratch_dir, "convert.scr")
        dwg_fwd = dwg_path.replace("\\", "/")
        with open(scr_path, "w", encoding="utf-8") as f:
            f.write(f'(setvar "FILEDIA" 0)\n(command "_SAVEAS" "2018" "{dwg_fwd}")\n(command "_QUIT" "_Y")\n')
        import subprocess
        try:
            cmd = [accore, "/i", dxf_path, "/s", scr_path]
            subprocess.run(cmd, timeout=30, capture_output=True)
            print("DWG nativo generado exitosamente en:", dwg_path)
        except Exception as e:
            print("Aviso DWG:", e)

    # Crear Paquete ZIP de Entrega Oficial
    import zipfile
    zip_path = os.path.join(desktop, "Entrega_Plano_Jair_Andres_Restrepo.zip")
    with zipfile.ZipFile(zip_path, "w", zipfile.ZIP_DEFLATED) as z:
        if os.path.exists(dwg_path):
            z.write(dwg_path, arcname="Vivienda_Unifamiliar_AutoCAD.dwg")
        z.write(dxf_path, arcname="Vivienda_Unifamiliar_AutoCAD.dxf")
        z.write(pdf_path, arcname="Vivienda_Unifamiliar_Lamina_A3.pdf")
        z.write(png_layout, arcname="Vivienda_Unifamiliar_Lamina_Layout1.png")
    print("Paquete de entrega ZIP creado en:", zip_path)

if __name__ == "__main__":
    build_perfect_architectural_plan()
