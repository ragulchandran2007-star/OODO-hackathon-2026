import { SalaryStructure } from '../types';

/**
 * Wireframe spec ("Salary Info"):
 * - Wage Type: Fixed wage (Monthly / Yearly).
 * - Salary Components: Basic, HRA, Standard Allowance, Performance Bonus,
 *   Leave Travel Allowance, Fixed Allowance.
 * - Computation Type: Fixed Amount or Percentage of Wage.
 * - Basic / Standard Allowance / Performance Bonus / LTA are % of Basic (or Wage for Basic itself).
 * - Fixed Allowance = Wage - total of all other components (auto-computed remainder).
 * - The total of all components should never exceed the defined Wage.
 * - PF Contribution: Employee & Employer, each with an amount and a % (of Basic).
 * - Professional Tax: flat deduction from Gross salary.
 *
 * Example: Wage = 50,000; Basic = 50% of wage => Basic = 25,000; HRA = 50% of Basic => HRA = 12,500.
 */

export const DEFAULT_BASIC_PERCENT = 50; // % of wage
export const DEFAULT_HRA_PERCENT = 50; // % of basic
export const DEFAULT_STANDARD_ALLOWANCE_PERCENT = 16.67; // % of wage (~ matches wireframe example: 4167/25000)
export const DEFAULT_PERFORMANCE_BONUS_PERCENT = 8.33; // % of basic
export const DEFAULT_LTA_PERCENT = 8.33; // % of basic
export const DEFAULT_PF_EMPLOYEE_PERCENT = 12; // % of basic
export const DEFAULT_PF_EMPLOYER_PERCENT = 12; // % of basic
export const DEFAULT_PROFESSIONAL_TAX = 200; // flat / month
export const DEFAULT_WORKING_DAYS_PER_WEEK = 5;
export const DEFAULT_BREAK_TIME_HOURS = 1;

export interface ComputedSalary {
  monthlyWage: number;
  yearlyWage: number;
  basic: number;
  hra: number;
  standardAllowance: number;
  performanceBonus: number;
  leaveTravelAllowance: number;
  fixedAllowance: number;
  componentsTotal: number; // should equal monthlyWage
  pfEmployeeAmount: number;
  pfEmployerAmount: number;
  professionalTax: number;
  grossMonthly: number; // = monthlyWage (components sum to wage)
  totalDeductions: number; // employee PF + professional tax
  netMonthly: number; // gross - employee-side deductions
}

/**
 * Recomputes every salary component from the monthly wage and the configured
 * percentages. All percentage-based components auto-update whenever the wage
 * (or any percentage) changes; Fixed Allowance always absorbs the remainder so
 * the total of all components never exceeds the defined wage.
 */
export function computeSalary(input: {
  monthlyWage: number;
  basicPercent?: number;
  hraPercent?: number;
  standardAllowancePercent?: number;
  performanceBonusPercent?: number;
  leaveTravelAllowancePercent?: number;
  pfEmployeePercent?: number;
  pfEmployerPercent?: number;
  professionalTax?: number;
}): ComputedSalary {
  const monthlyWage = Math.max(0, input.monthlyWage || 0);
  const basicPercent = input.basicPercent ?? DEFAULT_BASIC_PERCENT;
  const hraPercent = input.hraPercent ?? DEFAULT_HRA_PERCENT;
  const standardAllowancePercent = input.standardAllowancePercent ?? DEFAULT_STANDARD_ALLOWANCE_PERCENT;
  const performanceBonusPercent = input.performanceBonusPercent ?? DEFAULT_PERFORMANCE_BONUS_PERCENT;
  const leaveTravelAllowancePercent = input.leaveTravelAllowancePercent ?? DEFAULT_LTA_PERCENT;
  const pfEmployeePercent = input.pfEmployeePercent ?? DEFAULT_PF_EMPLOYEE_PERCENT;
  const pfEmployerPercent = input.pfEmployerPercent ?? DEFAULT_PF_EMPLOYER_PERCENT;
  const professionalTax = input.professionalTax ?? DEFAULT_PROFESSIONAL_TAX;

  const basic = round2((basicPercent / 100) * monthlyWage);
  const hra = round2((hraPercent / 100) * basic);
  const standardAllowance = round2((standardAllowancePercent / 100) * monthlyWage);
  const performanceBonus = round2((performanceBonusPercent / 100) * basic);
  const leaveTravelAllowance = round2((leaveTravelAllowancePercent / 100) * basic);

  const sumBeforeFixed = basic + hra + standardAllowance + performanceBonus + leaveTravelAllowance;
  // Fixed Allowance absorbs whatever remains of the wage; never negative.
  const fixedAllowance = round2(Math.max(0, monthlyWage - sumBeforeFixed));

  const componentsTotal = round2(basic + hra + standardAllowance + performanceBonus + leaveTravelAllowance + fixedAllowance);

  const pfEmployeeAmount = round2((pfEmployeePercent / 100) * basic);
  const pfEmployerAmount = round2((pfEmployerPercent / 100) * basic);

  const grossMonthly = componentsTotal;
  const totalDeductions = round2(pfEmployeeAmount + professionalTax);
  const netMonthly = round2(grossMonthly - totalDeductions);

  return {
    monthlyWage,
    yearlyWage: round2(monthlyWage * 12),
    basic,
    hra,
    standardAllowance,
    performanceBonus,
    leaveTravelAllowance,
    fixedAllowance,
    componentsTotal,
    pfEmployeeAmount,
    pfEmployerAmount,
    professionalTax,
    grossMonthly,
    totalDeductions,
    netMonthly
  };
}

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

/** Maps the wireframe-accurate ComputedSalary back onto the legacy SalaryStructure
 * shape so existing payroll/analytics code (which reads basic/hra/netSalary etc.)
 * keeps working without modification. */
export function toSalaryStructure(computed: ComputedSalary, extra?: Partial<SalaryStructure>): SalaryStructure {
  return {
    basic: computed.basic,
    hra: computed.hra,
    allowances: round2(computed.standardAllowance + computed.performanceBonus + computed.leaveTravelAllowance + computed.fixedAllowance),
    taxDeduction: computed.professionalTax,
    pfDeduction: computed.pfEmployeeAmount,
    otherDeductions: 0,
    netSalary: computed.netMonthly,
    monthlyWage: computed.monthlyWage,
    yearlyWage: computed.yearlyWage,
    basicPercent: extra?.basicPercent ?? DEFAULT_BASIC_PERCENT,
    hraPercent: extra?.hraPercent ?? DEFAULT_HRA_PERCENT,
    standardAllowancePercent: extra?.standardAllowancePercent ?? DEFAULT_STANDARD_ALLOWANCE_PERCENT,
    performanceBonusPercent: extra?.performanceBonusPercent ?? DEFAULT_PERFORMANCE_BONUS_PERCENT,
    leaveTravelAllowancePercent: extra?.leaveTravelAllowancePercent ?? DEFAULT_LTA_PERCENT,
    fixedAllowance: computed.fixedAllowance,
    workingDaysPerWeek: extra?.workingDaysPerWeek ?? DEFAULT_WORKING_DAYS_PER_WEEK,
    breakTimeHours: extra?.breakTimeHours ?? DEFAULT_BREAK_TIME_HOURS,
    pfEmployeeAmount: computed.pfEmployeeAmount,
    pfEmployeePercent: extra?.pfEmployeePercent ?? DEFAULT_PF_EMPLOYEE_PERCENT,
    pfEmployerAmount: computed.pfEmployerAmount,
    pfEmployerPercent: extra?.pfEmployerPercent ?? DEFAULT_PF_EMPLOYER_PERCENT,
    professionalTax: computed.professionalTax
  };
}
