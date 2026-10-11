import os
import subprocess
import shutil

SDK_DIR = r"C:\Users\lenovo\AppData\Local\Android\Sdk"
BUILD_TOOLS = os.path.join(SDK_DIR, "build-tools", "34.0.0")
PLATFORM_JAR = os.path.join(SDK_DIR, "platforms", "android-36", "android.jar")
AAPT2 = os.path.join(BUILD_TOOLS, "aapt2.exe")
D8 = os.path.join(BUILD_TOOLS, "d8.bat")
ZIPALIGN = os.path.join(BUILD_TOOLS, "zipalign.exe")
APKSIGNER = os.path.join(BUILD_TOOLS, "apksigner.bat")
ADB = r"C:\Users\lenovo\Downloads\platform-tools\adb.exe"

PROJECT_DIR = r"C:\Users\lenovo\Downloads\Himnario_App_Build"
BIN_DIR = os.path.join(PROJECT_DIR, "bin")
os.makedirs(BIN_DIR, exist_ok=True)

print("Verificando herramientas...")
for name, p in [("AAPT2", AAPT2), ("D8", D8), ("ZIPALIGN", ZIPALIGN), ("APKSIGNER", APKSIGNER), ("PLATFORM_JAR", PLATFORM_JAR), ("ADB", ADB)]:
    exists = os.path.exists(p)
    print(f"  {name}: {'OK' if exists else 'MISSING'} -> {p}")
