import sys
sys.path.append(r'C:\Users\lenovo\.gemini\antigravity-ide\brain\1028804d-2a48-4bc7-9c53-7b9c7a021007\scratch')
from parse_actualizado import parse_xlsx

data1 = parse_xlsx(r'C:\Users\lenovo\Downloads\SCJ PRESUPUESTO ACTUALIZADO Y PARAMETRIZADO.xlsx')
hoja1 = data1['Hoja 1']
for r in hoja1[1:10]:
    idx = r['row']
    c = {k: v['val'] for k, v in r['cells'].items()}
    pos = c.get(f'A{idx}')
    h_est = float(c.get(f'C{idx}') or 0)
    h_norm = float(c.get(f'D{idx}') or 0)
    h_ext = float(c.get(f'E{idx}') or 0)
    print(f"{pos}: H_EST={h_est}, H_NORM={h_norm}, H_EXT={h_ext} (Diff={h_est - h_norm})")
