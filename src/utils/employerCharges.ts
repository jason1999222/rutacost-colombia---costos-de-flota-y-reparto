import { LaborConfig } from '../types/logistics';

/**
 * Motor central de cargos patronales de nómina (Colombia / CST).
 *
 * Bases legales aplicadas:
 * - Cesantías (Art. 307 CST): el auxilio de transporte NO es salario, por lo que
 *   se excluye de la base de cesantías e intereses.
 * - Prima de servicios: para trabajadores que devengan hasta 2 SMMLV, el auxilio
 *   de transporte SÍ forma parte de la base de la prima (práctica legal estándar).
 * - Vacaciones: base = devengado salarial, sin auxilio.
 * - Seguridad social y parafiscales: sobre el devengado salarial. Las horas extras
 *   solo se incluyen en la base cuando su tarifa NO trae factor prestacional
 *   (si la tarifa de la base de datos ya viene "cargada", sumar cargos encima
 *   sería doble conteo).
 * - Exención Ley 1607 / Art. 114-1 E.T. (salud, SENA, ICBF): aplica solo si el
 *   empleador está exento Y el trabajador devenga menos de 10 SMMLV.
 * - Dotación: aplica para salarios hasta 2 SMMLV.
 */

export interface EmployerChargesInput {
  /** Devengado salarial del período (sueldo + recargos ordinarios + extras si no están cargadas) */
  salariedBase: number;
  /** Auxilio de transporte del período (no salarial) */
  auxilioTransporte: number;
  /** Salario mensual del trabajador (para exención Ley 1607 y dotación) */
  monthlySalary: number;
  /** Tasa ARL del trabajador (ej. 4.35% riesgo IV conductor) */
  arlRate: number;
  /** Configuración laboral con tasas de prestaciones y parafiscales */
  labor: LaborConfig;
  /** Días del período para prorrateo de dotación (ej. días trabajados del mes, o días del viaje) */
  proratedDays: number;
  /** Si es false, no se computa dotación */
  applyDotacion?: boolean;
}

export interface EmployerChargesBreakdown {
  cesantias: number;
  interesesCesantias: number;
  primaServicios: number;
  vacaciones: number;
  totalPrestaciones: number;
  pension: number;
  salud: number;
  arl: number;
  totalSeguridadSocial: number;
  cajaCompensacion: number;
  sena: number;
  icbf: number;
  totalParafiscales: number;
  dotacion: number;
  /** Total de todos los cargos patronales (sin incluir el devengado) */
  totalCharges: number;
}

/**
 * Detecta si una tarifa de hora extra ya incluye el factor prestacional.
 *
 * Compara la tarifa contra el valor hora ordinario con el recargo legal:
 * si la tarifa supera el recargo puro por más de un 10% de tolerancia,
 * se considera una tarifa "cargada" (ej. HED $17.488 vs $8.000 × 1.25 = $10.000).
 */
export function isLoadedOvertimeRate(rate: number, ordinaryRate: number, surcharge: number): boolean {
  if (!rate || !ordinaryRate) return false;
  return rate > ordinaryRate * (1 + surcharge) * 1.10;
}

/**
 * Calcula todos los cargos patronales de un devengado salarial.
 */
export function computeEmployerCharges(input: EmployerChargesInput): EmployerChargesBreakdown {
  const labor = input.labor;
  const smmlv = labor.smmlv || 1750905;
  const monthlySalary = input.monthlySalary || labor.smmlv || 1750905;

  // Base salarial (Art. 307 CST: el auxilio de transporte no es base de cesantías)
  const salariedBase = Math.max(0, input.salariedBase);
  const auxilio = Math.max(0, input.auxilioTransporte);

  // 1. Prestaciones sociales
  const cesantiasRate = labor.cesantiasRate ?? 0.0833;
  const interesesCesantiasRate = labor.interesesCesantiasRate ?? 0.01;
  const primaRate = labor.primaServiciosRate ?? 0.0833;
  const vacacionesRate = labor.vacacionesRate ?? 0.0417;

  const cesantias = salariedBase * cesantiasRate;
  const interesesCesantias = cesantias * interesesCesantiasRate;
  // La prima SÍ incluye el auxilio de transporte (trabajadores ≤ 2 SMMLV; si el
  // auxilio es 0 —salario > 2 SMMLV— la base queda igual en solo lo salarial)
  const primaServicios = (salariedBase + auxilio) * primaRate;
  const vacaciones = salariedBase * vacacionesRate;
  const totalPrestaciones = cesantias + interesesCesantias + primaServicios + vacaciones;

  // 2. Seguridad social empleador (sobre devengado salarial)
  const pensionRate = labor.pensionRate ?? 0.12;
  const saludRate = labor.saludRate ?? 0.085;
  const arlRate = input.arlRate ?? labor.arlRiskLevelRate ?? 0.0435;

  const pension = salariedBase * pensionRate;
  // Ley 1607 / Art. 114-1 E.T.: exoneración de salud solo si gana < 10 SMMLV
  const qualifiesExempt = (labor.isTaxExemptLey1607 === true) && monthlySalary < (smmlv * 10);
  const salud = qualifiesExempt ? 0 : salariedBase * saludRate;
  const arl = salariedBase * arlRate;
  const totalSeguridadSocial = pension + salud + arl;

  // 3. Parafiscales
  const cajaRate = labor.cajaCompensacionRate ?? 0.04;
  const senaRate = qualifiesExempt ? 0 : (labor.senaRate ?? 0.02);
  const icbfRate = qualifiesExempt ? 0 : (labor.icbfRate ?? 0.03);

  const cajaCompensacion = salariedBase * cajaRate;
  const sena = salariedBase * senaRate;
  const icbf = salariedBase * icbfRate;
  const totalParafiscales = cajaCompensacion + sena + icbf;

  // 4. Dotación legal (aplica a salarios hasta 2 SMMLV)
  const applyDotacion = input.applyDotacion !== false;
  const qualifiesDotacion = applyDotacion && monthlySalary <= (smmlv * 2);
  const dotacion = qualifiesDotacion
    ? ((labor.monthlyDotacionPerPerson ?? 65000) / 30) * Math.max(0, input.proratedDays)
    : 0;

  const totalCharges =
    totalPrestaciones + totalSeguridadSocial + totalParafiscales + dotacion;

  return {
    cesantias,
    interesesCesantias,
    primaServicios,
    vacaciones,
    totalPrestaciones,
    pension,
    salud,
    arl,
    totalSeguridadSocial,
    cajaCompensacion,
    sena,
    icbf,
    totalParafiscales,
    dotacion,
    totalCharges
  };
}
