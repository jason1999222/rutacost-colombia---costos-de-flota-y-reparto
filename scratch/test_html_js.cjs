const fs = require('fs');
const html = fs.readFileSync('C:/Users/lenovo/Desktop/trabajos andres/Presentacion_Cultura_del_Cuidado.html', 'utf8');

const jsMatch = html.match(/<script>([\s\S]*?)<\/script>/);
if (!jsMatch) {
  console.log("No <script> found");
  process.exit(1);
}

const jsCode = jsMatch[1];
console.log("JS code length:", jsCode.length);

try {
  new Function(jsCode);
  console.log("JavaScript is VALID!");
} catch (e) {
  console.error("JavaScript SYNTAX ERROR:", e.message);
  // Find line number
  const lines = jsCode.split('\n');
  console.log("Total lines:", lines.length);
}
