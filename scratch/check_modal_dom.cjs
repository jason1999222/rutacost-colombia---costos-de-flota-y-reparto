const fs = require('fs');
const html = fs.readFileSync('C:/Users/lenovo/Desktop/trabajos andres/Presentacion_Cultura_del_Cuidado.html', 'utf8');

// Let's inspect the interactiveModal element
const modalIdx = html.indexOf('id="interactiveModal"');
console.log("interactiveModal found at:", modalIdx);
console.log(html.substring(modalIdx - 100, modalIdx + 300));
