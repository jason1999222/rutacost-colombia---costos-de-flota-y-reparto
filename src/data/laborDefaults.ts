import { LaborConfig } from '../types/logistics';

/**
 * Parámetros Laborales y Prestacionales Colombia 2026 / Matriz SCJ
 * Fuente: Hoja "VALOR RUTA" y "NOMINA SCJ" de SCJ PRESUPUESTO REALIZAR.xlsx
 * Incluye la tarifa horaria ordinaria de $8.000 COP, recargos de horas extras
 * fijados en la empresa ($17.488 diurna y $23.000 nocturna con factor prestacional)
 * y los porcentajes oficiales de seguridad social y parafiscales según el CST.
 */
export const defaultLaborConfig: LaborConfig = {
  // Parámetros Base Legales Colombia 2026
  smmlv: 1750905,
  auxilioTransporteLegal: 249095,

  // Tarifas Horarias Oficiales SCJ / CST 2026 (Hoja "VALOR RUTA" y "BASE DE DATOS PARA GASTOS")
  hourlyOrdinaryRate: 8000, // Hora ordinaria pactada SCJ: $8.000 COP
  hourlyOvertimeDayRate: 17488, // Hora extra diurna con factor prestacional: $17.488 COP
  hourlyOvertimeNightRate: 23000, // Hora extra nocturna con factor prestacional: $23.000 COP
  hourlyNightRate: 11200, // Hora nocturna ordinaria con recargo (+35%): $10.800 - $11.200 COP
  hourlyHolidayRate: 14000, // Hora festiva / dominical ordinaria: $14.000 COP
  hourlyHolidayNightRate: 17500, // Hora festiva nocturna
  hourlyHolidayOvertimeDayRate: 17488,
  hourlyHolidayOvertimeNightRate: 23000,

  // Tripulación
  driverSalary: 2200000, // Salario base conductor/polifuncional
  driverOvertimeAllowed: true,

  hasHelper: false, // Por defecto en ruta troncal SCJ opera 1 conductor; auxiliar se asigna según despacho o ruta urbana
  helperSalary: 1750905, // Salario básico auxiliar (1 SMMLV)
  helperHourlyOrdinaryRate: 8338, // Hora ordinaria auxiliar (SMMLV / 210h)
  helperOvertimeDayRate: 10422, // Hora extra diurna auxiliar (+25%)
  helperOvertimeNightRate: 14591, // Hora extra nocturna auxiliar (+75%)
  helperHourlyNightRate: 11256,
  helperHourlyHolidayRate: 14591,
  helperHourlyHolidayNightRate: 17509,
  helperHourlyHolidayOvertimeDayRate: 16675,
  helperHourlyHolidayOvertimeNightRate: 20844,

  // Jornada de Trabajo Legal (Ley 2101 de 2021: 42 horas semanales a partir de julio 2026)
  standardHoursPerDay: 8.0, // 8 horas ordinarias de trabajo diaria
  monthlyWorkingHours: 210,


  // Recargos Horarios según Código Sustantivo del Trabajo (CST Art. 168 y 179)
  dayOvertimeSurcharge: 0.25, // Hora extra diurna ordinaria: +25%
  nightOvertimeSurcharge: 0.75, // Hora extra nocturna: +75% (después de las 21:00)
  nightSurchargeRate: 0.35, // Recargo nocturno ordinario: +35% (21:00 - 06:00)
  sundayHolidaySurchargeRate: 0.75, // Recargo dominical / festivo ordinario: +75%
  holidayOvertimeDaySurchargeRate: 1.00, // Extra festiva diurna: +100% (Factor 2.00)
  holidayOvertimeNightSurchargeRate: 1.50, // Extra festiva nocturna: +150% (Factor 2.50)

  // Viáticos de Ruta y Pernoctación
  dailyViaticosPerPerson: 50000, // Viático estándar de alimentación/pernoctación
  viaticosHourThreshold: 14.0, // A partir de 14h totales de ruta se computa pernoctación

  // Prestaciones Sociales a Cargo del Empleador (CST)
  primaServiciosRate: 0.0833, // 8.33% (1 mes de salario por año)
  cesantiasRate: 0.0833, // 8.33% (1 mes de salario por año)
  interesesCesantiasRate: 0.0100, // 1.00% mensual sobre cesantías (12% anual)
  vacacionesRate: 0.0417, // 4.17% (15 días hábiles por año)

  // Seguridad Social a Cargo del Empleador
  pensionRate: 0.1200, // 12.0% empleador
  saludRate: 0.0850, // 8.5% a cargo del empleador
  arlRiskLevelRate: 0.0435, // 4.350% correspondiente a Riesgo IV (Transporte terrestre de carga)

  // Aportes Parafiscales
  cajaCompensacionRate: 0.0400, // 4.0% Caja de Compensación (Comfama, etc.)
  senaRate: 0.0200, // 2.0%
  icbfRate: 0.0300, // 3.0%

  // Exoneración Ley 1607 de 2012 / Art. 114-1 E.T. (Salud, SENA, ICBF para < 10 SMMLV)
  isTaxExemptLey1607: true,

  // Dotación y EPP mensual
  monthlyDotacionPerPerson: 65000
};
