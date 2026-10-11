import os

bat_path = os.path.join(os.environ["USERPROFILE"], "Desktop", "Abrir_Plano_en_AutoCAD.bat")
bat_content = """@echo off
echo Abriendo plano de Vivienda Unifamiliar en AutoCAD 2027...
start "" "C:\\Program Files\\Autodesk\\AutoCAD 2027\\acad.exe" "%USERPROFILE%\\Desktop\\Vivienda_Unifamiliar_AutoCAD.dxf"
exit
"""

with open(bat_path, "w", encoding="ascii") as f:
    f.write(bat_content)

print(f"Creado: {bat_path}")
