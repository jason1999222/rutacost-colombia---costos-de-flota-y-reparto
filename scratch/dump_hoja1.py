import sys
sys.path.append(r'C:\Users\lenovo\.gemini\antigravity-ide\brain\1028804d-2a48-4bc7-9c53-7b9c7a021007\scratch')
from parse_actualizado import parse_xlsx

data = parse_xlsx(r'C:\Users\lenovo\Downloads\SCJ PRESUPUESTO ACTUALIZADO Y PARAMETRIZADO.xlsx')
hoja1 = data['Hoja 1']

print(f'Total rows in Hoja 1: {len(hoja1)}')
for r in hoja1:
    idx = r['row']
    cells = {k: v['val'] for k, v in r['cells'].items() if v['val'] is not None}
    formulas = {k: v['formula'] for k, v in r['cells'].items() if v['formula'] is not None}
    pos = cells.get(f'A{idx}', '')
    print(f"R{idx:02d} | POS: {pos}")
    print(f"    Values: {cells}")
    if formulas:
        print(f"    Formulas: {formulas}")
