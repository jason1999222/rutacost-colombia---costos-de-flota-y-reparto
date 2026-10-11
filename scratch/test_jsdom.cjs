const fs = require('fs');
const html = fs.readFileSync('C:/Users/lenovo/Desktop/trabajos andres/Presentacion_Cultura_del_Cuidado.html', 'utf8');

// Check script content
const scriptMatch = html.match(/<script>([\s\S]*?)<\/script>/);
const scriptContent = scriptMatch[1];

// Let's check for any syntax errors or unescaped characters in script
try {
  const { JSDOM } = require('jsdom');
  const dom = new JSDOM(html, { runScripts: "dangerously" });
  console.log("JSDOM loaded successfully without error!");
  
  const window = dom.window;
  const document = window.document;
  
  console.log("Total slides:", document.querySelectorAll('.slide').length);
  const nextBtn = document.getElementById('nextSlideBtn');
  console.log("Next btn exists?", !!nextBtn);
  
  // Click next button
  nextBtn.click();
  console.log("Clicked next! Current active slide:", document.querySelector('.slide.active').getAttribute('data-name'));
  
  // Test modal
  window.openModalKey('ser_humano');
  const modal = document.getElementById('interactiveModal');
  console.log("Modal active class after openModalKey?", modal.classList.contains('active'));
  console.log("Modal title:", document.getElementById('modalTitle').textContent);
  
} catch (e) {
  console.error("JSDOM Error:", e);
}
