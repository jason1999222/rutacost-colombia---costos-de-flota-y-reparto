const fs = require('fs');

const filePath = 'src/components/CalculationBasisConfig.tsx';
const lines = fs.readFileSync(filePath, 'utf8').split('\n');

// Find line starting with {laborForm.isTaxExemptLey1607 ?
let idx1 = lines.findIndex(l => l.includes('laborForm.isTaxExemptLey1607'));
console.log('idx1:', idx1, lines[idx1]);

if (idx1 !== -1) {
  lines[idx1] = "                {laborForm.isTaxExemptLey1607 ? 'Exonerado Ley 1607 (-13.5%)' : 'Régimen Pleno CST'}";
  lines.splice(idx1 + 1, 0,
    "              </span>",
    "            </div>",
    "          </div>",
    "",
    "          {/* SECCIÓN 1: CONFIGURACIÓN DE HORARIOS POR DÍA Y JORNADA SEMANAL (LEY 2101 / 42H) */}"
  );
}

// Find line with "trong>."
let idx2 = lines.findIndex(l => l.includes('trong>.'));
console.log('idx2:', idx2, lines[idx2]);

if (idx2 !== -1) {
  // Replace line idx2 and the next 4 lines with proper closing
  lines.splice(idx2, 5);
}

fs.writeFileSync(filePath, lines.join('\n'), 'utf8');
console.log('Successfully fixed CalculationBasisConfig.tsx!');
