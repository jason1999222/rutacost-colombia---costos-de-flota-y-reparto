import sys
import os
sys.path.append(r'C:\Users\lenovo\.gemini\antigravity-ide\brain\1028804d-2a48-4bc7-9c53-7b9c7a021007\scratch')
from parse_actualizado import parse_xlsx

paths = [
    r'C:\Users\lenovo\Downloads\SCJ PRESUPUESTO ACTUALIZADO Y PARAMETRIZADO.xlsx',
    r'C:\Users\lenovo\Downloads\SCJ PRESUPUESTO REALIZAR.xlsx'
]

for p in paths:
    if not os.path.exists(p):
        print("Does not exist:", p)
        continue
    print("====================================")
    print("FILE:", p)
    data = parse_xlsx(p)
    for sname in data:
        print(f"\n--- SHEET: {sname} ---")
        for r in data[sname][:6]:
            row_idx = r['row']
            vals = {k: v['val'] for k, v in r['cells'].items() if v['val'] is not None}
            print(f"R{row_idx}: {vals}")
