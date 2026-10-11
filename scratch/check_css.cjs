const fs = require('fs');
const html = fs.readFileSync('C:/Users/lenovo/Desktop/trabajos andres/Presentacion_Cultura_del_Cuidado.html', 'utf8');

const styleMatch = html.match(/<style>([\s\S]*?)<\/style>/);
if (!styleMatch) {
  console.log("No style found!");
  process.exit(1);
}

const css = styleMatch[1];
console.log("CSS length:", css.length);

// Check for broken double braces or formatting artifacts from python f-string!
// In Python f-string: if someone wrote {{ or { incorrectly...
const openBraces = (css.match(/{/g) || []).length;
const closeBraces = (css.match(/}/g) || []).length;
console.log("Open braces:", openBraces, "Close braces:", closeBraces);

// Let's search for .interactive-stage-card and .poll-option-row in css
console.log(".interactive-stage-card in css?", css.includes('.interactive-stage-card'));
console.log(".poll-option-row in css?", css.includes('.poll-option-row'));
