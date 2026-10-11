import sys
sys.path.append(r'C:\Users\lenovo\.gemini\antigravity-ide\brain\1028804d-2a48-4bc7-9c53-7b9c7a021007\scratch')
from parse_actualizado import parse_xlsx

data1 = parse_xlsx(r'C:\Users\lenovo\Downloads\SCJ PRESUPUESTO ACTUALIZADO Y PARAMETRIZADO.xlsx')
hoja1 = data1['Hoja 1']
print("=== HOJA 1 OF ACTUALIZADO ===")
for r in hoja1[1:10]:
    row_idx = r['row']
    cells = {k: v['val'] for k, v in r['cells'].items()}
    pos = cells.get(f'A{row_idx}')
    km = cells.get(f'B{row_idx}')
    h_est = cells.get(f'C{row_idx}')
    h_ord = cells.get(f'D{row_idx}')
    h_ext = cells.get(f'E{row_idx}')
    v_ord = cells.get(f'F{row_idx}')
    v_ext_d = cells.get(f'G{row_idx}')
    v_ext_n = cells.get(f'H{row_idx}')
    costo_npr = cells.get(f'P{row_idx}')
    print(f"POS: {pos:35} | KM: {km:5} | H_EST: {h_est:4} | H_ORD: {h_ord:4} | H_EXT: {h_ext:4} | ORD$: {v_ord} | EXTD$: {v_ext_d} | EXTN$: {v_ext_n} | FLETE: {costo_npr}")
