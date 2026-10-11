// Run cost calculator in TS/JS
const { execSync } = require('child_process');

// Let's use ts-node or run via vite or quick compiled script
const fs = require('fs');

const initialRoutesTs = fs.readFileSync('src/data/initialRoutes.ts', 'utf8');
const laborDefaultsTs = fs.readFileSync('src/data/laborDefaults.ts', 'utf8');
const costCalculatorTs = fs.readFileSync('src/utils/costCalculator.ts', 'utf8');
const vehicleProfilesTs = fs.readFileSync('src/data/vehicleProfiles.ts', 'utf8');

console.log("Ready to evaluate");
