import os
import shutil

DESKTOP_PROYECTOS = r"C:\Users\lenovo\Desktop\proyectos"
SRC_BUILD_DIR = r"C:\Users\lenovo\Downloads\Himnario_App_Build"
DEST_APP_DIR = os.path.join(DESKTOP_PROYECTOS, "Himnario_y_Biblia_App")

os.makedirs(DEST_APP_DIR, exist_ok=True)

# 1. Read generate_v4_app.py and adapt BUILD_DIR
with open(r"scratch\generate_v4_app.py", "r", encoding="utf-8") as f:
    lines = f.readlines()

adapted_gen_lines = []
for line in lines:
    if line.startswith("BUILD_DIR ="):
        adapted_gen_lines.append("BUILD_DIR = os.path.dirname(os.path.abspath(__file__))\n")
    else:
        adapted_gen_lines.append(line)

with open(os.path.join(DEST_APP_DIR, "generate_html.py"), "w", encoding="utf-8") as f:
    f.writelines(adapted_gen_lines)
print("generate_html.py copiado y adaptado en DEST_APP_DIR")

# 2. Read compile_and_install.py and adapt PROJECT_DIR
with open(r"scratch\compile_and_install.py", "r", encoding="utf-8") as f:
    lines = f.readlines()

adapted_comp_lines = []
for line in lines:
    if line.startswith("PROJECT_DIR ="):
        adapted_comp_lines.append("PROJECT_DIR = os.path.dirname(os.path.abspath(__file__))\n")
    else:
        adapted_comp_lines.append(line)

with open(os.path.join(DEST_APP_DIR, "compile_and_install.py"), "w", encoding="utf-8") as f:
    f.writelines(adapted_comp_lines)
print("compile_and_install.py copiado y adaptado en DEST_APP_DIR")

# 3. Create compilar_e_instalar.bat
bat_content = """@echo off
chcp 65001 > nul
echo ========================================================
echo   Compilando e Instalando Himnario & Santa Biblia IDMJI
echo ========================================================
echo.
cd /d "%~dp0"
python generate_html.py
if %ERRORLEVEL% NEQ 0 (
    echo Error al generar HTML.
    pause
    exit /b %ERRORLEVEL%
)
python compile_and_install.py
if %ERRORLEVEL% NEQ 0 (
    echo Error al compilar o instalar APK.
    pause
    exit /b %ERRORLEVEL%
)
echo.
echo ========================================================
echo   APK compilado e instalado con exito en el celular!
echo ========================================================
pause
"""
with open(os.path.join(DEST_APP_DIR, "compilar_e_instalar.bat"), "w", encoding="utf-8") as f:
    f.write(bat_content)
print("compilar_e_instalar.bat creado")

# 4. Copy loose APK to DESKTOP_PROYECTOS
apk_src = os.path.join(DEST_APP_DIR, "bin", "Himnario_Biblia_Mejorada.apk")
apk_loose = os.path.join(DESKTOP_PROYECTOS, "Himnario_Biblia_IDMJI.apk")
shutil.copyfile(apk_src, apk_loose)
print(f"APK suelto en proyectos: {apk_loose} ({os.path.getsize(apk_loose) / 1024 / 1024:.2f} MB)")

# 5. Create LEEME.txt
readme_content = """============================================================
   HIMNARIO & SANTA BIBLIA IDMJI (VERSION MEJORADA)
============================================================

Este directorio contiene el codigo fuente y recursos completos de la aplicacion:
- assets/                 : Contiene index.html, logos, himnos (233), coros (168) y Santa Biblia Reina Valera 1960 con referencias cruzadas y notas de estudio.
- res/                    : Iconos y strings nativos de Android.
- src/                    : Codigo nativo Java (MainActivity.java).
- bin/                    : APK generado (Himnario_Biblia_Mejorada.apk).
- generate_html.py        : Generador del codigo HTML/JS con todas las mejoras.
- compile_and_install.py  : Script de compilacion con AAPT2, javac, D8, apksigner e instalador ADB.
- compilar_e_instalar.bat : Doble clic para regenerar y reinstalar en el celular conectado.

NOTA: En la carpeta 'proyectos' tambien se encuentra el APK listo para instalar suelto:
- Himnario_Biblia_IDMJI.apk
"""
with open(os.path.join(DEST_APP_DIR, "LEEME.txt"), "w", encoding="utf-8") as f:
    f.write(readme_content)
print("LEEME.txt creado")
