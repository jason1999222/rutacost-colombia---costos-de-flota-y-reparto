import os
import sys
import ezdxf
from ezdxf import colors, units
from ezdxf.enums import TextEntityAlignment

def build_autocad_plan(output_path):
    print(f"Generando plano de AutoCAD en: {output_path}")
    
    # 1. Crear documento DXF version R2018 compatible con AutoCAD 2027
    doc = ezdxf.new("R2018", setup=True)
    doc.units = units.M  # Metros
    doc.header['$MEASUREMENT'] = 1  # Metrico
    doc.header['$LUNITS'] = 2
    doc.header['$LUPREC'] = 2
    
    # 2. Configurar Capas (LAYERS)
    layers_config = [
        ("A-WALL-HIGH", 7, 35, "CONTINUOUS"),       # Muros en corte (0.35 mm)
        ("A-WALL-LOW", 3, 18, "CONTINUOUS"),        # Muros bajos/antepechos (Verde 0.18 mm)
        ("A-DOOR", 2, 18, "CONTINUOUS"),            # Puertas y batientes (Amarillo 0.18 mm)
        ("A-GLAZ", 4, 15, "CONTINUOUS"),            # Ventanas y vidrios (Cyan 0.15 mm)
        ("A-FURN", 6, 13, "CONTINUOUS"),            # Mobiliario interior (Magenta 0.13 mm)
        ("A-EQUP", 130, 15, "CONTINUOUS"),          # Aparatos sanitarios y cocina (0.15 mm)
        ("A-CLST", 40, 15, "CONTINUOUS"),           # Closets y carpinteria fija (Naranja 0.15 mm)
        ("A-DIMS", 1, 13, "CONTINUOUS"),            # Cotas de dibujo (Rojo 0.13 mm)
        ("A-TEXT", 2, 20, "CONTINUOUS"),            # Textos y niveles (Amarillo 0.20 mm)
        ("A-GRID", 8, 13, "CENTER"),                # Ejes estructurales (Gris 0.13 mm)
        ("A-TITLE", 7, 35, "CONTINUOUS"),           # Rotulo y margen (0.35 mm)
        ("DEFPOINTS", 7, 0, "CONTINUOUS"),          # No imprimible
    ]
    
    for name, col, lw, lt in layers_config:
        if name not in doc.layers:
            layer = doc.layers.add(name=name, color=col)
            layer.lineweight = lw
            layer.linetype = lt

    if "CENTER" not in doc.linetypes:
        doc.linetypes.add("CENTER", [10.0, 6.0, -1.5, 1.0, -1.5], description="Center ____ _ ____ _")

    # 3. Bloques de Interiorismo (BLOCKS)
    blocks = doc.blocks

    # 3.1 Cama Doble con mesas de noche
    blk_cama_doble = blocks.new(name="BLK_CAMA_DOBLE")
    blk_cama_doble.add_lwpolyline([(0, 0), (1.60, 0), (1.60, 2.00), (0, 2.00), (0, 0)], dxfattribs={"layer": "A-FURN"})
    blk_cama_doble.add_lwpolyline([(0, 1.90), (1.60, 1.90)], dxfattribs={"layer": "A-FURN"})
    blk_cama_doble.add_lwpolyline([(0.10, 1.45), (0.75, 1.45), (0.75, 1.85), (0.10, 1.85), (0.10, 1.45)], dxfattribs={"layer": "A-FURN"})
    blk_cama_doble.add_lwpolyline([(0.85, 1.45), (1.50, 1.45), (1.50, 1.85), (0.85, 1.85), (0.85, 1.45)], dxfattribs={"layer": "A-FURN"})
    blk_cama_doble.add_line((0, 0.70), (1.60, 0.70), dxfattribs={"layer": "A-FURN"})
    blk_cama_doble.add_lwpolyline([(-0.45, 1.55), (0, 1.55), (0, 2.00), (-0.45, 2.00), (-0.45, 1.55)], dxfattribs={"layer": "A-FURN"})
    blk_cama_doble.add_circle((-0.225, 1.775), 0.08, dxfattribs={"layer": "A-FURN"})
    blk_cama_doble.add_lwpolyline([(1.60, 1.55), (2.05, 1.55), (2.05, 2.00), (1.60, 2.00), (1.60, 1.55)], dxfattribs={"layer": "A-FURN"})
    blk_cama_doble.add_circle((1.825, 1.775), 0.08, dxfattribs={"layer": "A-FURN"})

    # 3.2 Cama Individual
    blk_cama_ind = blocks.new(name="BLK_CAMA_INDIVIDUAL")
    blk_cama_ind.add_lwpolyline([(0, 0), (1.00, 0), (1.00, 1.90), (0, 1.90), (0, 0)], dxfattribs={"layer": "A-FURN"})
    blk_cama_ind.add_lwpolyline([(0.10, 1.40), (0.90, 1.40), (0.90, 1.80), (0.10, 1.80), (0.10, 1.40)], dxfattribs={"layer": "A-FURN"})
    blk_cama_ind.add_line((0, 0.65), (1.00, 0.65), dxfattribs={"layer": "A-FURN"})
    blk_cama_ind.add_lwpolyline([(1.00, 1.45), (1.45, 1.45), (1.45, 1.90), (1.00, 1.90), (1.00, 1.45)], dxfattribs={"layer": "A-FURN"})

    # 3.3 Juego de Sala
    blk_sala = blocks.new(name="BLK_JUEGO_SALA")
    blk_sala.add_lwpolyline([(0, 0), (2.10, 0), (2.10, 0.85), (0, 0.85), (0, 0)], dxfattribs={"layer": "A-FURN"})
    blk_sala.add_line((0.15, 0.20), (1.95, 0.20), dxfattribs={"layer": "A-FURN"})
    blk_sala.add_line((0.75, 0.20), (0.75, 0.85), dxfattribs={"layer": "A-FURN"})
    blk_sala.add_line((1.35, 0.20), (1.35, 0.85), dxfattribs={"layer": "A-FURN"})
    blk_sala.add_line((0.15, 0), (0.15, 0.85), dxfattribs={"layer": "A-FURN"})
    blk_sala.add_line((1.95, 0), (1.95, 0.85), dxfattribs={"layer": "A-FURN"})
    blk_sala.add_lwpolyline([(0.50, 1.25), (1.60, 1.25), (1.60, 1.85), (0.50, 1.85), (0.50, 1.25)], dxfattribs={"layer": "A-FURN"})
    blk_sala.add_lwpolyline([(-0.90, 1.15), (-0.10, 1.15), (-0.10, 1.95), (-0.90, 1.95), (-0.90, 1.15)], dxfattribs={"layer": "A-FURN"})
    blk_sala.add_line((-0.30, 1.25), (-0.30, 1.85), dxfattribs={"layer": "A-FURN"})
    blk_sala.add_lwpolyline([(-1.10, -0.20), (2.30, -0.20), (2.30, 2.20), (-1.10, 2.20), (-1.10, -0.20)], dxfattribs={"layer": "A-FURN"})

    # 3.4 Comedor 4 Puestos
    blk_comedor = blocks.new(name="BLK_COMEDOR_4P")
    blk_comedor.add_lwpolyline([(0, 0), (1.30, 0), (1.30, 0.85), (0, 0.85), (0, 0)], dxfattribs={"layer": "A-FURN"})
    blk_comedor.add_lwpolyline([(0.20, -0.40), (0.60, -0.40), (0.60, -0.05), (0.20, -0.05), (0.20, -0.40)], dxfattribs={"layer": "A-FURN"})
    blk_comedor.add_lwpolyline([(0.70, -0.40), (1.10, -0.40), (1.10, -0.05), (0.70, -0.05), (0.70, -0.40)], dxfattribs={"layer": "A-FURN"})
    blk_comedor.add_lwpolyline([(0.20, 0.90), (0.60, 0.90), (0.60, 1.25), (0.20, 1.25), (0.20, 0.90)], dxfattribs={"layer": "A-FURN"})
    blk_comedor.add_lwpolyline([(0.70, 0.90), (1.10, 0.90), (1.10, 1.25), (0.70, 1.25), (0.70, 0.90)], dxfattribs={"layer": "A-FURN"})

    # 3.5 Estufa 4 Hornillas
    blk_estufa = blocks.new(name="BLK_ESTUFA_4Q")
    blk_estufa.add_lwpolyline([(0, 0), (0.60, 0), (0.60, 0.60), (0, 0.60), (0, 0)], dxfattribs={"layer": "A-EQUP"})
    blk_estufa.add_circle((0.18, 0.18), 0.08, dxfattribs={"layer": "A-EQUP"})
    blk_estufa.add_circle((0.42, 0.18), 0.07, dxfattribs={"layer": "A-EQUP"})
    blk_estufa.add_circle((0.18, 0.42), 0.07, dxfattribs={"layer": "A-EQUP"})
    blk_estufa.add_circle((0.42, 0.42), 0.09, dxfattribs={"layer": "A-EQUP"})

    # 3.6 Lavaplatos con Escurridor
    blk_lavaplatos = blocks.new(name="BLK_LAVAPLATOS")
    blk_lavaplatos.add_lwpolyline([(0, 0), (0.85, 0), (0.85, 0.50), (0, 0.50), (0, 0)], dxfattribs={"layer": "A-EQUP"})
    blk_lavaplatos.add_lwpolyline([(0.08, 0.06), (0.48, 0.06), (0.48, 0.44), (0.08, 0.44), (0.08, 0.06)], dxfattribs={"layer": "A-EQUP"})
    blk_lavaplatos.add_circle((0.28, 0.25), 0.03, dxfattribs={"layer": "A-EQUP"})
    blk_lavaplatos.add_circle((0.28, 0.47), 0.02, dxfattribs={"layer": "A-EQUP"})
    for x in [0.55, 0.62, 0.69, 0.76]:
        blk_lavaplatos.add_line((x, 0.08), (x, 0.42), dxfattribs={"layer": "A-EQUP"})

    # 3.7 Nevera
    blk_nevera = blocks.new(name="BLK_NEVERA")
    blk_nevera.add_lwpolyline([(0, 0), (0.70, 0), (0.70, 0.70), (0, 0.70), (0, 0)], dxfattribs={"layer": "A-EQUP"})
    blk_nevera.add_line((0, 0.10), (0.70, 0.10), dxfattribs={"layer": "A-EQUP"})
    blk_nevera.add_line((0.10, 0.05), (0.60, 0.05), dxfattribs={"layer": "A-EQUP"})

    # 3.8 Inodoro
    blk_inodoro = blocks.new(name="BLK_INODORO")
    blk_inodoro.add_lwpolyline([(-0.25, 0), (0.25, 0), (0.25, 0.20), (-0.25, 0.20), (-0.25, 0)], dxfattribs={"layer": "A-EQUP"})
    blk_inodoro.add_lwpolyline([(-0.18, 0.20), (-0.18, 0.45), (0, 0.65), (0.18, 0.45), (0.18, 0.20)], dxfattribs={"layer": "A-EQUP"})
    blk_inodoro.add_circle((0, 0.40), 0.07, dxfattribs={"layer": "A-EQUP"})

    # 3.9 Lavamanos
    blk_lavamanos = blocks.new(name="BLK_LAVAMANOS")
    blk_lavamanos.add_lwpolyline([(-0.25, 0), (0.25, 0), (0.25, 0.42), (-0.25, 0.42), (-0.25, 0)], dxfattribs={"layer": "A-EQUP"})
    blk_lavamanos.add_lwpolyline([(-0.20, 0.06), (0.20, 0.06), (0.20, 0.36), (-0.20, 0.36), (-0.20, 0.06)], dxfattribs={"layer": "A-EQUP"})
    blk_lavamanos.add_circle((0, 0.20), 0.03, dxfattribs={"layer": "A-EQUP"})

    # 3.10 Ducha
    blk_ducha = blocks.new(name="BLK_DUCHA")
    blk_ducha.add_lwpolyline([(0, 0), (0.90, 0), (0.90, 1.00), (0, 1.00), (0, 0)], dxfattribs={"layer": "A-EQUP"})
    blk_ducha.add_circle((0.45, 0.50), 0.05, dxfattribs={"layer": "A-EQUP"})
    blk_ducha.add_line((0.42, 0.50), (0.48, 0.50), dxfattribs={"layer": "A-EQUP"})
    blk_ducha.add_line((0.45, 0.47), (0.45, 0.53), dxfattribs={"layer": "A-EQUP"})
    blk_ducha.add_line((0, 0), (0.90, 0), dxfattribs={"layer": "A-GLAZ"})

    # 3.11 Zona Ropas
    blk_ropas = blocks.new(name="BLK_ZONA_ROPAS")
    blk_ropas.add_lwpolyline([(0, 0), (0.70, 0), (0.70, 0.60), (0, 0.60), (0, 0)], dxfattribs={"layer": "A-EQUP"})
    blk_ropas.add_line((0.35, 0), (0.35, 0.60), dxfattribs={"layer": "A-EQUP"})
    for y in [0.10, 0.20, 0.30, 0.40, 0.50]:
        blk_ropas.add_line((0.05, y), (0.30, y), dxfattribs={"layer": "A-EQUP"})
    blk_ropas.add_lwpolyline([(0.80, 0), (1.45, 0), (1.45, 0.65), (0.80, 0.65), (0.80, 0)], dxfattribs={"layer": "A-EQUP"})
    blk_ropas.add_circle((1.125, 0.325), 0.22, dxfattribs={"layer": "A-EQUP"})

    # ========================================================
    # 4. MODEL SPACE (DIBUJO DE PLANTA)
    # ========================================================
    msp = doc.modelspace()

    # 4.1 Muros Perimetrales Exteriores (A-WALL-HIGH)
    # Fachada Frontal (Sur)
    msp.add_lwpolyline([(0, 0), (0.90, 0), (0.90, 0.15), (0.15, 0.15), (0.15, 9.85), (0, 9.85), (0, 0)], dxfattribs={"layer": "A-WALL-HIGH"})
    msp.add_lwpolyline([(1.80, 0), (2.80, 0), (2.80, 0.15), (1.80, 0.15), (1.80, 0)], dxfattribs={"layer": "A-WALL-HIGH"})
    msp.add_lwpolyline([(4.60, 0), (5.50, 0), (5.50, 0.15), (4.60, 0.15), (4.60, 0)], dxfattribs={"layer": "A-WALL-HIGH"})
    msp.add_lwpolyline([(7.10, 0), (8.00, 0), (8.00, 9.85), (7.85, 9.85), (7.85, 0.15), (7.10, 0.15), (7.10, 0)], dxfattribs={"layer": "A-WALL-HIGH"})

    # Fachada Posterior (Norte)
    msp.add_lwpolyline([(0, 9.85), (1.00, 9.85), (1.00, 10.00), (0, 10.00), (0, 9.85)], dxfattribs={"layer": "A-WALL-HIGH"})
    msp.add_lwpolyline([(2.50, 9.85), (6.20, 9.85), (6.20, 10.00), (2.50, 10.00), (2.50, 9.85)], dxfattribs={"layer": "A-WALL-HIGH"})
    msp.add_lwpolyline([(7.50, 9.85), (8.00, 9.85), (8.00, 10.00), (7.50, 10.00), (7.50, 9.85)], dxfattribs={"layer": "A-WALL-HIGH"})

    # Muros Interiores (A-WALL-HIGH)
    # Eje X = 4.30 a 4.45 (muro central)
    msp.add_lwpolyline([(4.30, 0.15), (4.45, 0.15), (4.45, 3.50), (4.30, 3.50), (4.30, 0.15)], dxfattribs={"layer": "A-WALL-HIGH"})
    msp.add_lwpolyline([(4.30, 4.40), (4.45, 4.40), (4.45, 6.20), (4.30, 6.20), (4.30, 4.40)], dxfattribs={"layer": "A-WALL-HIGH"})

    # Muro Alcoba Principal / Comedor (Y=6.20 a 6.35, X=0.15 a 3.40)
    msp.add_lwpolyline([(0.15, 6.20), (3.40, 6.20), (3.40, 6.35), (0.15, 6.35), (0.15, 6.20)], dxfattribs={"layer": "A-WALL-HIGH"})
    # Muro divisorio Alcoba Principal / Baño (X=3.40 a 3.55, Y=6.35 a 9.85)
    msp.add_lwpolyline([(3.40, 6.35), (3.55, 6.35), (3.55, 9.85), (3.40, 9.85), (3.40, 6.35)], dxfattribs={"layer": "A-WALL-HIGH"})

    # Muro Baño Sur (Y=6.20 a 6.35, X=4.45 a 6.25)
    msp.add_lwpolyline([(4.45, 6.20), (6.25, 6.20), (6.25, 6.35), (4.45, 6.35), (4.45, 6.20)], dxfattribs={"layer": "A-WALL-HIGH"})
    # Muro Baño Este (X=6.25 a 6.40, Y=6.20 a 8.20)
    msp.add_lwpolyline([(6.25, 6.20), (6.40, 6.20), (6.40, 8.20), (6.25, 8.20), (6.25, 6.20)], dxfattribs={"layer": "A-WALL-HIGH"})
    # Muro Baño Norte / Patio (Y=8.20 a 8.35, X=4.45 a 6.40)
    msp.add_lwpolyline([(3.55, 8.20), (6.40, 8.20), (6.40, 8.35), (3.55, 8.35), (3.55, 8.20)], dxfattribs={"layer": "A-WALL-HIGH"})
    # Muro Patio Este (X=6.25 a 6.40, Y=8.35 a 9.85)
    msp.add_lwpolyline([(6.25, 8.35), (6.40, 8.35), (6.40, 9.85), (6.25, 9.85), (6.25, 8.35)], dxfattribs={"layer": "A-WALL-HIGH"})

    # 4.2 Ventanas (A-GLAZ + A-WALL-LOW)
    def add_window(p1, p2):
        x1, y1 = p1
        x2, y2 = p2
        msp.add_line((x1, y1), (x2, y2), dxfattribs={"layer": "A-WALL-LOW"})
        msp.add_line((x1, y1 + 0.15), (x2, y2 + 0.15), dxfattribs={"layer": "A-WALL-LOW"})
        msp.add_line((x1, y1 + 0.05), (x2, y2 + 0.05), dxfattribs={"layer": "A-GLAZ"})
        msp.add_line((x1, y1 + 0.10), (x2, y2 + 0.10), dxfattribs={"layer": "A-GLAZ"})

    add_window((2.80, 0), (4.60, 0))      # Sala
    add_window((5.50, 0), (7.10, 0))      # Alcoba 2
    add_window((1.00, 9.85), (2.50, 9.85)) # Alcoba Ppal
    add_window((6.50, 9.85), (7.50, 9.85)) # Patio Ropas
    add_window((4.70, 8.20), (5.70, 8.20)) # Baño ventilacion

    # 4.3 Puertas (A-DOOR)
    def add_door(hx, hy, width, angle_deg):
        msp.add_lwpolyline([(hx-0.03, hy-0.03), (hx+0.03, hy-0.03), (hx+0.03, hy+0.03), (hx-0.03, hy+0.03), (hx-0.03, hy-0.03)], dxfattribs={"layer": "A-DOOR"})
        if angle_deg == 0:
            msp.add_line((hx, hy), (hx, hy + width), dxfattribs={"layer": "A-DOOR"})
            msp.add_arc((hx, hy), width, 0, 90, dxfattribs={"layer": "A-DOOR"})
        elif angle_deg == 90:
            msp.add_line((hx, hy), (hx - width, hy), dxfattribs={"layer": "A-DOOR"})
            msp.add_arc((hx, hy), width, 90, 180, dxfattribs={"layer": "A-DOOR"})
        elif angle_deg == 180:
            msp.add_line((hx, hy), (hx, hy - width), dxfattribs={"layer": "A-DOOR"})
            msp.add_arc((hx, hy), width, 180, 270, dxfattribs={"layer": "A-DOOR"})
        elif angle_deg == 270:
            msp.add_line((hx, hy), (hx + width, hy), dxfattribs={"layer": "A-DOOR"})
            msp.add_arc((hx, hy), width, 270, 360, dxfattribs={"layer": "A-DOOR"})

    add_door(0.90, 0.15, 0.90, 0)    # Puerta Principal
    add_door(4.45, 3.50, 0.80, 270)  # Puerta Alcoba 2
    add_door(3.40, 6.35, 0.85, 90)   # Puerta Alcoba Ppal
    add_door(4.45, 6.35, 0.70, 0)    # Puerta Baño
    add_door(6.40, 8.35, 0.80, 270)  # Puerta Patio

    # 4.4 Bloques y Mobiliario
    msp.add_blockref("BLK_JUEGO_SALA", (1.40, 0.60), dxfattribs={"layer": "A-FURN"})
    msp.add_blockref("BLK_COMEDOR_4P", (1.50, 4.20), dxfattribs={"layer": "A-FURN"})

    # Mesón Cocina
    msp.add_lwpolyline([(7.25, 4.00), (7.85, 4.00), (7.85, 6.00), (6.00, 6.00), (6.00, 5.40), (7.25, 5.40), (7.25, 4.00)], dxfattribs={"layer": "A-FURN"})
    msp.add_blockref("BLK_ESTUFA_4Q", (7.25, 4.40), dxfattribs={"layer": "A-EQUP"})
    msp.add_blockref("BLK_LAVAPLATOS", (6.10, 5.45), dxfattribs={"layer": "A-EQUP"})
    msp.add_blockref("BLK_NEVERA", (4.60, 5.40), dxfattribs={"layer": "A-EQUP"})

    # Alcoba Principal
    msp.add_blockref("BLK_CAMA_DOBLE", (0.75, 7.50), dxfattribs={"layer": "A-FURN"})
    # Closet
    msp.add_lwpolyline([(0.30, 6.45), (3.30, 6.45), (3.30, 7.05), (0.30, 7.05), (0.30, 6.45)], dxfattribs={"layer": "A-CLST"})
    msp.add_line((0.30, 6.45), (3.30, 7.05), dxfattribs={"layer": "A-CLST"})
    msp.add_line((0.30, 7.05), (3.30, 6.45), dxfattribs={"layer": "A-CLST"})

    # Alcoba 2
    msp.add_blockref("BLK_CAMA_INDIVIDUAL", (5.80, 1.20), dxfattribs={"layer": "A-FURN"})
    msp.add_lwpolyline([(4.60, 2.80), (6.40, 2.80), (6.40, 3.40), (4.60, 3.40), (4.60, 2.80)], dxfattribs={"layer": "A-CLST"})
    msp.add_line((4.60, 2.80), (6.40, 3.40), dxfattribs={"layer": "A-CLST"})
    msp.add_line((4.60, 3.40), (6.40, 2.80), dxfattribs={"layer": "A-CLST"})

    # Baño
    msp.add_blockref("BLK_DUCHA", (3.65, 7.10), dxfattribs={"layer": "A-EQUP"})
    msp.add_blockref("BLK_INODORO", (5.00, 8.10), dxfattribs={"layer": "A-EQUP", "rotation": 180})
    msp.add_blockref("BLK_LAVAMANOS", (5.80, 6.45), dxfattribs={"layer": "A-EQUP"})

    # Patio
    msp.add_blockref("BLK_ZONA_ROPAS", (6.45, 9.10), dxfattribs={"layer": "A-EQUP"})

    # 4.5 Textos y Niveles
    texts_info = [
        ("SALA", (2.20, 2.60), 0.22, "N.P.T. +0.15"),
        ("COMEDOR", (2.20, 5.70), 0.22, "N.P.T. +0.15"),
        ("COCINA", (6.00, 4.70), 0.22, "N.P.T. +0.15"),
        ("ALCOBA PRINCIPAL", (1.70, 7.20), 0.24, "N.P.T. +0.15"),
        ("ALCOBA 2", (6.10, 2.40), 0.22, "N.P.T. +0.15"),
        ("BAÑO FAMILIAR", (4.90, 6.70), 0.18, "N.P.T. +0.13"),
        ("ZONA ROPAS / PATIO", (7.10, 8.60), 0.16, "N.P.T. +0.10"),
        ("ACCESO", (1.35, -0.40), 0.18, "N.P.T. ±0.00"),
    ]
    for name, pt, sz, level in texts_info:
        msp.add_text(name, dxfattribs={"layer": "A-TEXT", "height": sz}).set_placement(pt, align=TextEntityAlignment.MIDDLE_CENTER)
        msp.add_text(level, dxfattribs={"layer": "A-TEXT", "height": sz * 0.70}).set_placement((pt[0], pt[1] - 0.28), align=TextEntityAlignment.MIDDLE_CENTER)

    # 4.6 Cotas
    def add_dim(p1, p2, txt, tpt):
        msp.add_line(p1, p2, dxfattribs={"layer": "A-DIMS"})
        for px, py in [p1, p2]:
            msp.add_line((px - 0.08, py - 0.08), (px + 0.08, py + 0.08), dxfattribs={"layer": "A-DIMS"})
        msp.add_text(txt, dxfattribs={"layer": "A-DIMS", "height": 0.16}).set_placement(tpt, align=TextEntityAlignment.MIDDLE_CENTER)

    add_dim((0, -1.10), (8.00, -1.10), "8.00 m", (4.00, -0.90))
    add_dim((0, -0.60), (4.30, -0.60), "4.30", (2.15, -0.45))
    add_dim((4.30, -0.60), (8.00, -0.60), "3.70", (6.15, -0.45))
    add_dim((-1.10, 0), (-1.10, 10.00), "10.00 m", (-1.35, 5.00))
    add_dim((-0.60, 0), (-0.60, 6.20), "6.20", (-0.85, 3.10))
    add_dim((-0.60, 6.20), (-0.60, 10.00), "3.80", (-0.85, 8.10))
    add_dim((9.10, 0), (9.10, 10.00), "10.00 m", (9.35, 5.00))

    # 4.7 Ejes Estructurales
    axes_v = [("A", 0.075), ("B", 4.375), ("C", 7.925)]
    for tag, x in axes_v:
        msp.add_line((x, -1.60), (x, 10.80), dxfattribs={"layer": "A-GRID", "linetype": "CENTER"})
        msp.add_circle((x, -1.90), 0.30, dxfattribs={"layer": "A-GRID"})
        msp.add_text(tag, dxfattribs={"layer": "A-TEXT", "height": 0.28}).set_placement((x, -1.90), align=TextEntityAlignment.MIDDLE_CENTER)
        msp.add_circle((x, 11.10), 0.30, dxfattribs={"layer": "A-GRID"})
        msp.add_text(tag, dxfattribs={"layer": "A-TEXT", "height": 0.28}).set_placement((x, 11.10), align=TextEntityAlignment.MIDDLE_CENTER)

    axes_h = [("1", 0.075), ("2", 6.275), ("3", 9.925)]
    for tag, y in axes_h:
        msp.add_line((-1.60, y), (9.60, y), dxfattribs={"layer": "A-GRID", "linetype": "CENTER"})
        msp.add_circle((-1.90, y), 0.30, dxfattribs={"layer": "A-GRID"})
        msp.add_text(tag, dxfattribs={"layer": "A-TEXT", "height": 0.28}).set_placement((-1.90, y), align=TextEntityAlignment.MIDDLE_CENTER)
        msp.add_circle((9.90, y), 0.30, dxfattribs={"layer": "A-GRID"})
        msp.add_text(tag, dxfattribs={"layer": "A-TEXT", "height": 0.28}).set_placement((9.90, y), align=TextEntityAlignment.MIDDLE_CENTER)

    # ========================================================
    # 5. PAPER SPACE (LAYOUT): LÁMINA A3 CON RÓTULO TÉCNICO
    # ========================================================
    layout = doc.layouts.get("Layout1")
    layout.page_setup(size=(420, 297), margins=(10, 10, 10, 10), units="mm")

    # Margen exterior
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

    # Textos institucionales
    layout.add_text("UNIVERSIDAD / FACULTAD DE INGENIERIA", dxfattribs={"layer": "A-TEXT", "height": 3.2}).set_placement((rx + 90, ry + 48), align=TextEntityAlignment.MIDDLE_CENTER)
    layout.add_text("PROGRAMA DE INGENIERIA AMBIENTAL", dxfattribs={"layer": "A-TEXT", "height": 2.5}).set_placement((rx + 90, ry + 44), align=TextEntityAlignment.MIDDLE_CENTER)
    layout.add_text("ASIGNATURA: INGENIERIA DEL AGUA (HABILITACION)", dxfattribs={"layer": "A-TEXT", "height": 2.6}).set_placement((rx + 90, ry + 36), align=TextEntityAlignment.MIDDLE_CENTER)
    layout.add_text("DOCENTE: NATHALIA HERRERA BOTERO", dxfattribs={"layer": "A-TEXT", "height": 2.3}).set_placement((rx + 90, ry + 32.5), align=TextEntityAlignment.MIDDLE_CENTER)

    layout.add_text("PROYECTO: PLANTA ARQUITECTONICA 2D", dxfattribs={"layer": "A-TEXT", "height": 2.6}).set_placement((rx + 5, ry + 25))
    layout.add_text("VIVIENDA UNIFAMILIAR SOSTENIBLE", dxfattribs={"layer": "A-TEXT", "height": 2.2}).set_placement((rx + 5, ry + 20.5))

    layout.add_text("ESTUDIANTE:", dxfattribs={"layer": "A-TEXT", "height": 2.2}).set_placement((rx + 95, ry + 25))
    layout.add_text("[NOMBRE DEL ESTUDIANTE]", dxfattribs={"layer": "A-TEXT", "height": 2.6}).set_placement((rx + 95, ry + 20.5))

    layout.add_text("ESCALA: 1:50", dxfattribs={"layer": "A-TEXT", "height": 2.5}).set_placement((rx + 45, ry + 9), align=TextEntityAlignment.MIDDLE_CENTER)
    layout.add_text("FECHA: SEPT. 2026", dxfattribs={"layer": "A-TEXT", "height": 2.5}).set_placement((rx + 112.5, ry + 9), align=TextEntityAlignment.MIDDLE_CENTER)
    layout.add_text("PLANCHA:", dxfattribs={"layer": "A-TEXT", "height": 2.2}).set_placement((rx + 157.5, ry + 12), align=TextEntityAlignment.MIDDLE_CENTER)
    layout.add_text("01 / 01", dxfattribs={"layer": "A-TEXT", "height": 3.5}).set_placement((rx + 157.5, ry + 6), align=TextEntityAlignment.MIDDLE_CENTER)

    # Cuadro de Áreas
    ax, ay = 300, 70
    layout.add_lwpolyline([(ax, ay), (ax + 110, ay), (ax + 110, ay + 60), (ax, ay + 60), (ax, ay)], dxfattribs={"layer": "A-TITLE"})
    layout.add_line((ax, ay + 50), (ax + 110, ay + 50), dxfattribs={"layer": "A-TITLE"})
    layout.add_text("CUADRO DE AREAS (M2)", dxfattribs={"layer": "A-TEXT", "height": 3.0}).set_placement((ax + 55, ay + 55), align=TextEntityAlignment.MIDDLE_CENTER)
    
    areas = [
        ("Zona Social (Sala - Comedor):", "26.50 m2"),
        ("Cocina Integral:", "7.80 m2"),
        ("Alcoba Principal:", "13.20 m2"),
        ("Alcoba 2:", "11.50 m2"),
        ("Bano Familiar:", "4.20 m2"),
        ("Zona de Ropas y Servicios:", "3.80 m2"),
        ("Muros y Circulacion:", "13.00 m2"),
        ("AREA TOTAL CONSTRUIDA:", "80.00 m2"),
    ]
    for i, (lbl, val) in enumerate(areas):
        yy = ay + 44 - (i * 5.5)
        layout.add_text(lbl, dxfattribs={"layer": "A-TEXT", "height": 2.1}).set_placement((ax + 4, yy))
        layout.add_text(val, dxfattribs={"layer": "A-TEXT", "height": 2.1}).set_placement((ax + 105, yy), align=TextEntityAlignment.MIDDLE_RIGHT)

    # Ventana Gráfica (Viewport) a escala 1:50
    layout.add_viewport(
        center=(125, 150),
        size=(210, 240),
        view_center_point=(4.0, 5.0),
        view_height=13.0,
        dxfattribs={"layer": "DEFPOINTS"}
    )

    doc.saveas(output_path)
    print("Plano generado exitosamente en:", output_path)
    return True

if __name__ == "__main__":
    desktop = os.path.join(os.environ["USERPROFILE"], "Desktop")
    out_file = os.path.join(desktop, "Vivienda_Unifamiliar_AutoCAD.dxf")
    build_autocad_plan(out_file)
