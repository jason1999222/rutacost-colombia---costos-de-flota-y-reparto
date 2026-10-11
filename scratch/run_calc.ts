import { INITIAL_ROUTES } from '../src/data/initialRoutes';
import { VEHICLE_PROFILES } from '../src/data/vehicleProfiles';
import { DEFAULT_LABOR_CONFIG } from '../src/data/laborDefaults';
import { calculateRouteCost } from '../src/utils/costCalculator';

const vehicle = VEHICLE_PROFILES[0];
const labor = DEFAULT_LABOR_CONFIG;

let totRevenue = 0;
let totExpenses = 0;
let totFuel = 0;
let totLabor = 0;
let totTolls = 0;
let totMaint = 0;
let totViaticos = 0;

for (const r of INITIAL_ROUTES) {
  const b = calculateRouteCost(r, vehicle, labor);
  const rev = r.freightTariffNpr || r.freightTariffNlr || 0;
  totRevenue += rev;
  totExpenses += b.totalTripCost;
  totFuel += b.fuelCost;
  totLabor += b.totalLaborCost;
  totTolls += b.tollCost;
  totMaint += b.totalMaintenanceCost;
  totViaticos += b.driverCost.viaticos;
}

console.log('=== CALCULATED TOTALS FOR ALL 37 ROUTES ===');
console.log('Total Revenue:    $' + totRevenue.toLocaleString());
console.log('Total Expenses:   $' + totExpenses.toLocaleString());
console.log('Total Net Profit: $' + (totRevenue - totExpenses).toLocaleString());
console.log('Margin:           ' + ((totRevenue - totExpenses) / totRevenue * 100).toFixed(1) + '%');
console.log('--- Breakdown ---');
console.log('Total Labor:      $' + totLabor.toLocaleString() + ' (' + (totLabor/totExpenses*100).toFixed(1) + '%)');
console.log('Total Fuel:       $' + totFuel.toLocaleString() + ' (' + (totFuel/totExpenses*100).toFixed(1) + '%)');
console.log('Total Tolls:      $' + totTolls.toLocaleString() + ' (' + (totTolls/totExpenses*100).toFixed(1) + '%)');
console.log('Total Maint:      $' + totMaint.toLocaleString() + ' (' + (totMaint/totExpenses*100).toFixed(1) + '%)');
console.log('Total Viaticos:   $' + totViaticos.toLocaleString() + ' (' + (totViaticos/totExpenses*100).toFixed(1) + '%)');
