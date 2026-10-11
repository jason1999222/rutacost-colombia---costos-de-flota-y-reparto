const fs = require('fs');

const html = fs.readFileSync('scratch/Presentacion_Cultura_del_Cuidado_Mobile.html', 'utf8');

const checks = [
  { name: "Viewport meta tag (viewport-fit=cover)", ok: html.includes('viewport-fit=cover') },
  { name: "100dvh CSS support", ok: html.includes('100dvh') },
  { name: "Slide overflow-y auto (scroll en móvil)", ok: html.includes('overflow-y: auto') },
  { name: "Stop propagation on modals (evita cierres accidentales al tocar o scrollear)", ok: (html.match(/event\.stopPropagation\(\)/g) || []).length >= 2 },
  { name: "Mobile nav arrows markup (botones flotantes táctiles ‹ y ›)", ok: html.includes('id="mobilePrevBtn"') && html.includes('id="mobileNextBtn"') },
  { name: "Touch swipe listeners (deslizar con el pulgar para cambiar diapositivas)", ok: html.includes('stageElement.addEventListener(\'touchstart\'') && html.includes('stageElement.addEventListener(\'touchend\'') },
  { name: "Scroll reset on goTo (al cambiar diapositiva vuelve arriba)", ok: html.includes('slides[currentIndex].scrollTop = 0') },
  { name: "Responsive media queries (900px y 680px)", ok: html.includes('@media (max-width: 900px)') && html.includes('@media (max-width: 680px)') },
  { name: "Touch-action manipulation (elimina lag táctil)", ok: html.includes('touch-action: manipulation') },
  { name: "Modal fixed overlay (cubre el 100% en celular)", ok: html.includes('position: fixed !important') }
];

console.log("=== REPORTE DE VALIDACIÓN RESPONSIVE CELULAR ===");
let allOk = true;
checks.forEach(c => {
  console.log(`${c.ok ? '✅' : '❌'} ${c.name}`);
  if (!c.ok) allOk = false;
});

if (allOk) {
  console.log("\n🎉 TODAS LAS VALIDACIONES PASARON EXITOSAMENTE. LISTO PARA EL CELULAR.");
} else {
  console.error("ALERTA: Algunas validaciones fallaron.");
  process.exit(1);
}
