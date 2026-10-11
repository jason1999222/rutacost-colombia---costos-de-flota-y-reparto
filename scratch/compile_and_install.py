import os
import subprocess
import shutil
import zipfile

SDK_DIR = r"C:\Users\lenovo\AppData\Local\Android\Sdk"
BUILD_TOOLS = os.path.join(SDK_DIR, "build-tools", "34.0.0")
PLATFORM_JAR = os.path.join(SDK_DIR, "platforms", "android-36", "android.jar")
AAPT2 = os.path.join(BUILD_TOOLS, "aapt2.exe")
D8 = os.path.join(BUILD_TOOLS, "d8.bat")
ZIPALIGN = os.path.join(BUILD_TOOLS, "zipalign.exe")
APKSIGNER = os.path.join(BUILD_TOOLS, "apksigner.bat")
ADB = r"C:\Users\lenovo\Downloads\platform-tools\adb.exe"

PROJECT_DIR = r"C:\Users\lenovo\Downloads\Himnario_App_Build"
SRC_DIR = os.path.join(PROJECT_DIR, "src", "com", "himnario", "biblia", "mejorada")
RES_DIR = os.path.join(PROJECT_DIR, "res")
ASSETS_DIR = os.path.join(PROJECT_DIR, "assets")
BIN_DIR = os.path.join(PROJECT_DIR, "bin")
OBJ_DIR = os.path.join(PROJECT_DIR, "obj")

os.makedirs(SRC_DIR, exist_ok=True)
os.makedirs(os.path.join(RES_DIR, "values"), exist_ok=True)
os.makedirs(os.path.join(RES_DIR, "drawable"), exist_ok=True)
os.makedirs(BIN_DIR, exist_ok=True)
os.makedirs(OBJ_DIR, exist_ok=True)

# Generate square launcher icon with #1F2E85 background (no white margins)
icon_src = os.path.join(ASSETS_DIR, "logo_idmji.png")
icon_dst = os.path.join(RES_DIR, "drawable", "ic_launcher.png")
if os.path.exists(icon_src):
    try:
        from PIL import Image
        with Image.open(icon_src) as img:
            img = img.convert("RGBA")
            canvas = Image.new("RGBA", (512, 512), (31, 46, 133, 255))
            target_w = 460
            target_h = int(img.height * (target_w / img.width))
            resized = img.resize((target_w, target_h), Image.Resampling.LANCZOS)
            offset = ((512 - target_w) // 2, (512 - target_h) // 2)
            canvas.paste(resized, offset, resized)
            canvas.convert("RGB").save(icon_dst, format="PNG")
        print("Launcher icon generado con fondo IDMJI azul (sin bordes blancos).")
    except Exception as e:
        shutil.copyfile(icon_src, icon_dst)

# 1. AndroidManifest.xml
manifest_content = """<?xml version="1.0" encoding="utf-8"?>
<manifest xmlns:android="http://schemas.android.com/apk/res/android"
    package="com.himnario.biblia.mejorada"
    android:versionCode="4"
    android:versionName="4.0-mejorada">

    <uses-permission android:name="android.permission.INTERNET" />

    <application
        android:label="@string/app_name"
        android:icon="@drawable/ic_launcher"
        android:roundIcon="@drawable/ic_launcher"
        android:theme="@android:style/Theme.NoTitleBar"
        android:hardwareAccelerated="true">
        <activity
            android:name=".MainActivity"
            android:exported="true"
            android:configChanges="orientation|screenSize|keyboardHidden|screenLayout">
            <intent-filter>
                <action android:name="android.intent.action.MAIN" />
                <category android:name="android.intent.category.LAUNCHER" />
            </intent-filter>
        </activity>
    </application>
</manifest>
"""
with open(os.path.join(PROJECT_DIR, "AndroidManifest.xml"), "w", encoding="utf-8") as f:
    f.write(manifest_content)

# 2. res/values/strings.xml
strings_content = """<?xml version="1.0" encoding="utf-8"?>
<resources>
    <string name="app_name">Himnario &amp; Biblia (App Mejorada)</string>
</resources>
"""
with open(os.path.join(RES_DIR, "values", "strings.xml"), "w", encoding="utf-8") as f:
    f.write(strings_content)

# 3. MainActivity.java
main_activity_content = """package com.himnario.biblia.mejorada;

import android.app.Activity;
import android.os.Bundle;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.view.Window;
import android.view.KeyEvent;

public class MainActivity extends Activity {
    private WebView webView;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        requestWindowFeature(Window.FEATURE_NO_TITLE);

        webView = new WebView(this);
        WebSettings s = webView.getSettings();
        s.setJavaScriptEnabled(true);
        s.setDomStorageEnabled(true);
        s.setDatabaseEnabled(true);
        s.setAllowFileAccess(true);
        s.setAllowContentAccess(true);
        s.setAllowFileAccessFromFileURLs(true);
        s.setAllowUniversalAccessFromFileURLs(true);
        s.setLoadWithOverviewMode(true);
        s.setUseWideViewPort(true);

        webView.setWebViewClient(new WebViewClient());
        webView.loadUrl("file:///android_asset/index.html");
        setContentView(webView);
    }

    @Override
    public boolean onKeyDown(int keyCode, KeyEvent event) {
        if (keyCode == KeyEvent.KEYCODE_BACK && webView != null && webView.canGoBack()) {
            webView.goBack();
            return true;
        }
        return super.onKeyDown(keyCode, event);
    }
}
"""
with open(os.path.join(SRC_DIR, "MainActivity.java"), "w", encoding="utf-8") as f:
    f.write(main_activity_content)

print("Archivos base generados. Compilando...")

# Step 1: AAPT2 compile
compiled_res = os.path.join(BIN_DIR, "compiled_res.zip")
cmd_aapt2_compile = [AAPT2, "compile", "--dir", RES_DIR, "-o", compiled_res]
res = subprocess.run(cmd_aapt2_compile, capture_output=True, text=True)
if res.returncode != 0:
    print("Error aapt2 compile:", res.stderr)
    exit(1)
print("aapt2 compile OK")

# Step 2: AAPT2 link
manifest_path = os.path.join(PROJECT_DIR, "AndroidManifest.xml")
unaligned_apk = os.path.join(BIN_DIR, "unaligned.apk")
src_root = os.path.join(PROJECT_DIR, "src")
cmd_aapt2_link = [
    AAPT2, "link",
    "-I", PLATFORM_JAR,
    "--manifest", manifest_path,
    "-o", unaligned_apk,
    "--java", src_root,
    "--min-sdk-version", "24",
    "--target-sdk-version", "34",
    "-A", ASSETS_DIR,
    compiled_res,
    "--auto-add-overlay"
]
res = subprocess.run(cmd_aapt2_link, capture_output=True, text=True)
if res.returncode != 0:
    print("Error aapt2 link:", res.stderr)
    exit(1)
print("aapt2 link OK (generó R.java y unaligned.apk)")

# Step 3: Javac
java_files = [
    os.path.join(SRC_DIR, "MainActivity.java"),
    os.path.join(SRC_DIR, "R.java")
]
cmd_javac = ["javac", "--release", "17", "-cp", PLATFORM_JAR, "-d", OBJ_DIR] + java_files
res = subprocess.run(cmd_javac, capture_output=True, text=True)
if res.returncode != 0:
    print("Error javac:", res.stderr)
    exit(1)
print("javac OK")

# Step 4: D8
class_files = []
for root, _, files in os.walk(OBJ_DIR):
    for f in files:
        if f.endswith(".class"):
            class_files.append(os.path.join(root, f))

cmd_d8 = [D8, "--lib", PLATFORM_JAR, "--output", BIN_DIR] + class_files
res = subprocess.run(cmd_d8, capture_output=True, text=True, shell=True)
if res.returncode != 0:
    print("Error d8:", res.stderr)
    exit(1)
print("d8 OK (generó classes.dex)")

# Step 5: Add classes.dex into unaligned.apk
dex_file = os.path.join(BIN_DIR, "classes.dex")
with zipfile.ZipFile(unaligned_apk, "a") as apk:
    apk.write(dex_file, "classes.dex")
print("classes.dex añadido a APK")

# Step 6: Zipalign
aligned_apk = os.path.join(BIN_DIR, "Himnario_Biblia_Mejorada.apk")
if os.path.exists(aligned_apk):
    os.remove(aligned_apk)
cmd_zipalign = [ZIPALIGN, "-p", "-f", "4", unaligned_apk, aligned_apk]
res = subprocess.run(cmd_zipalign, capture_output=True, text=True)
if res.returncode != 0:
    print("Error zipalign:", res.stderr)
    exit(1)
print(f"zipalign OK -> {aligned_apk}")

# Step 7: Keystore & Sign
keystore_path = os.path.join(PROJECT_DIR, "debug.keystore")
if not os.path.exists(keystore_path):
    cmd_keytool = [
        "keytool", "-genkeypair", "-v",
        "-keystore", keystore_path,
        "-alias", "androiddebugkey",
        "-keypass", "android",
        "-storepass", "android",
        "-keyalg", "RSA",
        "-keysize", "2048",
        "-validity", "10000",
        "-dname", "CN=Android Debug,O=Android,C=US"
    ]
    subprocess.run(cmd_keytool, capture_output=True, text=True)
    print("debug.keystore generado")

cmd_apksigner = [
    APKSIGNER, "sign",
    "--ks", keystore_path,
    "--ks-pass", "pass:android",
    "--ks-key-alias", "androiddebugkey",
    aligned_apk
]
res = subprocess.run(cmd_apksigner, capture_output=True, text=True, shell=True)
if res.returncode != 0:
    print("Error apksigner:", res.stderr)
    exit(1)
print("apksigner OK! APK firmado con éxito.")
print(f"Tamaño final del APK: {os.path.getsize(aligned_apk) / 1024 / 1024:.2f} MB")

print("\n--- Instalando en el dispositivo físico por ADB ---")
cmd_install = [ADB, "install", "-r", "-g", aligned_apk]
res = subprocess.run(cmd_install, capture_output=True, text=True)
print("ADB Install:", res.stdout)
if res.stderr:
    print("ADB Stderr:", res.stderr)

# Force stop and start app
subprocess.run([ADB, "shell", "am", "force-stop", "com.himnario.biblia.mejorada"])
subprocess.run([ADB, "shell", "am", "start", "-n", "com.himnario.biblia.mejorada/.MainActivity"])
print("App iniciada en el celular!")
