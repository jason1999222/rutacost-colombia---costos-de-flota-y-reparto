import json

with open(r'C:\Users\lenovo\Downloads\Himnario_App_Build\assets\biblia_con_titulos.json', encoding='utf-8') as f:
    b = json.load(f)

# Genesis 5:1
gen = b[0]
for v in gen['chapters'][4]: # Chapter 5
    if v.get('h') or v.get('xr'):
        print('Gen 5 verse with h/xr:', v['v'], 'heading:', v.get('h'), 'xr:', v.get('xr'))

# Matthew 3:1
mat = b[39] # Matthew is 40th book (index 39)
for v in mat['chapters'][2]: # Chapter 3
    if v.get('h') or v.get('xr'):
        print('Mat 3 verse with h/xr:', v['v'], 'heading:', v.get('h'), 'xr:', v.get('xr'))
