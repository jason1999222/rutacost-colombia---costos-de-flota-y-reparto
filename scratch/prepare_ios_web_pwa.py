import os
import shutil
import json
from PIL import Image

BASE_DIR = r"c:\Users\lenovo\Downloads\rutacost-colombia---costos-de-flota-y-reparto"
BUILD_DIR = r"C:\Users\lenovo\Downloads\Himnario_App_Build"
ASSETS_DIR = os.path.join(BUILD_DIR, "assets")
DEST_WEB = r"C:\Users\lenovo\Desktop\proyectos\Himnario_Web_iOS_Android"

os.makedirs(DEST_WEB, exist_ok=True)

# 1. Run generate_v4_app.py
print("Regenerando index.html...")
import subprocess
subprocess.run(["python", os.path.join(BASE_DIR, "scratch", "generate_v4_app.py")], check=True)

# 2. Copy index.html and data files
files_to_copy = [
    "index.html",
    "himnos_data.js",
    "coros_data.js",
    "biblia_data.js",
    "logo_idmji.png"
]
for fname in files_to_copy:
    src = os.path.join(ASSETS_DIR, fname)
    dst = os.path.join(DEST_WEB, fname)
    shutil.copyfile(src, dst)
    print(f"Copiado a web: {fname} ({os.path.getsize(dst)/1024:.1f} KB)")

# 3. Generate high-res square icons (192, 512, favicon)
logo_path = os.path.join(ASSETS_DIR, "logo_idmji.png")
with Image.open(logo_path) as img:
    img = img.convert("RGBA")
    for size in [192, 512]:
        canvas = Image.new("RGBA", (size, size), (31, 46, 133, 255))
        target_w = int(size * 0.84)
        target_h = int(img.height * (target_w / img.width))
        resized = img.resize((target_w, target_h), Image.Resampling.LANCZOS)
        offset = ((size - target_w) // 2, (size - target_h) // 2)
        canvas.paste(resized, offset, resized)
        out_icon = os.path.join(DEST_WEB, f"icon-{size}.png")
        canvas.convert("RGB").save(out_icon, format="PNG")
        print(f"Icono generado: icon-{size}.png")

    # Favicon
    canvas_32 = Image.new("RGBA", (32, 32), (31, 46, 133, 255))
    target_w = 28
    target_h = int(img.height * (target_w / img.width))
    resized = img.resize((target_w, target_h), Image.Resampling.LANCZOS)
    canvas_32.paste(resized, ((32 - target_w) // 2, (32 - target_h) // 2), resized)
    canvas_32.convert("RGB").save(os.path.join(DEST_WEB, "favicon.ico"), format="ICO")
    print("Favicon generado.")

# 4. Create manifest.json
manifest_data = {
    "name": "Himnario & Santa Biblia IDMJI",
    "short_name": "Himnario IDMJI",
    "description": "Himnos, Coros oficiales y Santa Biblia Reina Valera 1960 para estudio y alabanza",
    "start_url": "./index.html",
    "scope": "./",
    "display": "standalone",
    "orientation": "portrait-primary",
    "background_color": "#090d16",
    "theme_color": "#172554",
    "icons": [
        {
            "src": "icon-192.png",
            "sizes": "192x192",
            "type": "image/png",
            "purpose": "any maskable"
        },
        {
            "src": "icon-512.png",
            "sizes": "512x512",
            "type": "image/png",
            "purpose": "any maskable"
        }
    ]
}
with open(os.path.join(DEST_WEB, "manifest.json"), "w", encoding="utf-8") as f:
    json.dump(manifest_data, f, indent=2, ensure_ascii=False)
print("manifest.json creado.")

# 5. Create sw.js (Service Worker)
sw_content = """const CACHE_NAME = 'himnario-idmji-v4';
const ASSETS_TO_CACHE = [
  './',
  './index.html',
  './himnos_data.js',
  './coros_data.js',
  './biblia_data.js',
  './logo_idmji.png',
  './icon-192.png',
  './icon-512.png',
  './manifest.json',
  './favicon.ico'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE);
    }).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse;
      }
      return fetch(event.request).then((networkResponse) => {
        if (event.request.method === 'GET' && networkResponse && networkResponse.status === 200) {
          const responseClone = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseClone);
          });
        }
        return networkResponse;
      }).catch(() => {
        if (event.request.mode === 'navigate') {
          return caches.match('./index.html');
        }
      });
    })
  );
});
"""
with open(os.path.join(DEST_WEB, "sw.js"), "w", encoding="utf-8") as f:
    f.write(sw_content)
print("sw.js (Service Worker) creado.")

# 6. Create local preview server bat
preview_bat = """@echo off
chcp 65001 > nul
echo ========================================================
echo   Iniciando Servidor Local para Himnario & Biblia
echo ========================================================
echo.
echo Abriendo aplicacion en tu navegador...
cd /d "%~dp0"
start http://localhost:8080/index.html
python -m http.server 8080
pause
"""
with open(os.path.join(DEST_WEB, "probar_en_navegador.bat"), "w", encoding="utf-8") as f:
    f.write(preview_bat)
print("probar_en_navegador.bat creado.")

# 7. Create instructions file
guide_content = """=====================================================================
   GUIA PASO A PASO: COMO PUBLICAR Y USAR LA APP EN IPHONE / IOS
=====================================================================

Esta carpeta contiene la aplicacion web lista para funcionar como una
App Nativa en iPhone, iPad, Android y Computadoras.

---------------------------------------------------------------------
METODO 1: PUBLICAR EN 1 CLIC (100% GRATIS Y RAPIDO - NETLIFY DROP)
---------------------------------------------------------------------
1. Entra desde tu computadora a: https://app.netlify.com/drop
2. Arrastra esta carpeta completa ('Himnario_Web_iOS_Android') a la ventana del navegador.
3. En 10 segundos tendras un enlace seguro HTTPS (ejemplo: https://himnario-idmji.netlify.app).
4. Abre ese enlace en el iPhone desde el navegador SAFARI.

---------------------------------------------------------------------
COMO INSTALARLO EN EL IPHONE DESDE SAFARI:
---------------------------------------------------------------------
1. En tu iPhone, abre el enlace en SAFARI.
2. Toca el boton COMPARTIR (el icono cuadrado con la flecha hacia arriba que esta en el centro inferior).
3. Desliza hacia abajo y toca: "AGREGAR A PANTALLA DE INICIO" (Add to Home Screen).
4. Toca "Agregar" arriba a la derecha.

LISTO! En la pantalla de tu iPhone aparecera el icono con el logo de la IDMJI.
Al abrirlo:
- Se abrira en PANTALLA COMPLETA como cualquier app nativa (sin barras de Safari).
- Guardara todos los datos en tu iPhone y funcionara 100% OFFLINE (sin internet).
- NUNCA caduca, no requiere cuenta de Apple de pago ni certificados.

---------------------------------------------------------------------
METODO 2: GITHUB PAGES (ALTERNATIVA)
---------------------------------------------------------------------
1. Sube estos archivos a un repositorio de GitHub.
2. Ve a Settings -> Pages -> Selecciona la rama 'main' y guarda.
3. Tu app estara disponible en https://tu-usuario.github.io/tu-repo/
=====================================================================
"""
with open(os.path.join(DEST_WEB, "COMO_PUBLICAR_Y_USAR_EN_IPHONE.txt"), "w", encoding="utf-8") as f:
    f.write(guide_content)
print("COMO_PUBLICAR_Y_USAR_EN_IPHONE.txt creado.")

print("\n--- BUNDLE WEB/IOS LISTO EXITOSAMENTE EN: ---")
print(DEST_WEB)
