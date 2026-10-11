import { INITIAL_ROUTES } from '../src/data/initialRoutes';
import { VEHICLE_PROFILES } from '../src/data/vehicleProfiles';
import { DEFAULT_LABOR_CONFIG } from '../src/data/laborDefaults';
import { calculateRouteCost } from '../src/utils/costCalculator';

const vehicle = VEHICLE_PROFILES[0];
const labor = DEFAULT_LABOR_CONFIG;

for (const r of INITIAL_ROUTES.slice(0, 10)) {
  const b = calculateRouteCost(r, vehicle, labor);
  console.log(`${r.name.padEnd(35)}: km=${r.km}, hrs=${b.totalHours}, regH=${b.regularHours}, extH=${b.overtimeHours} (D=${b.overtimeDayHours}, N=${b.overtimeNightHours}) -> DriverLabor=$${b.driverCost.total.toLocaleString()}`);
}
