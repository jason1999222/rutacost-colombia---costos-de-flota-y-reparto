import { describe, it, expect } from 'vitest';
import { computeEmployerCharges } from '../src/utils/employerCharges';
import { defaultLaborConfig } from '../src/data/laborDefaults';

describe('Employer Charges Calculator', () => {
  it('should calculate correct employer charges for a standard driver salary', () => {
    // 2.200.000 COP, Auxilio 249.095, no hours
    const result = computeEmployerCharges({
      salariedBase: 2200000,
      auxilioTransporte: 249095,
      labor: defaultLaborConfig,
      monthlySalary: 2200000
    });

    // Prestaciones (Cesantias 8.33%, Int 1%, Prima 8.33%, Vac 4.17%)
    const expectedCesantias = 2200000 * 0.0833; // 183260
    const expectedIntereses = expectedCesantias * 0.01; // 1832.6
    const expectedPrima = (2200000 + 249095) * 0.0833; // 204009.61
    const expectedVacaciones = 2200000 * 0.0417; // 91740

    // Seguridad Social
    // Since it's < 10 SMMLV and exempt is true, Salud is 0.
    const expectedSalud = 0;
    const expectedPension = 2200000 * 0.12; // 264000
    const expectedArl = 2200000 * 0.0435; // 95700

    // Parafiscales
    const expectedCaja = 2200000 * 0.04; // 88000
    // Exempt SENA and ICBF
    const expectedSena = 0;
    const expectedIcbf = 0;

    expect(result.cesantias).toBeCloseTo(expectedCesantias, 0);
    expect(result.primaServicios).toBeCloseTo(expectedPrima, 0);
    expect(result.vacaciones).toBeCloseTo(expectedVacaciones, 0);
    expect(result.salud).toBe(0);
    expect(result.sena).toBe(0);
    expect(result.icbf).toBe(0);
    expect(result.cajaCompensacion).toBeCloseTo(expectedCaja, 0);
  });
});
