import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { Info, Save, PieChart } from 'lucide-react';
import { formatCurrency, formatPercent } from '../../utils/helpers';
import { useStore } from '../../store/useStore';

export function PayrollCalc() {
  const [hourlyWage, setHourlyWage] = useState<number | ''>(25);
  const [hoursPerWeek, setHoursPerWeek] = useState<number | ''>(40);
  
  // Additional costs (%)
  const [payrollTaxes, setPayrollTaxes] = useState<number | ''>(7.65); // FICA
  const [workersComp, setWorkersComp] = useState<number | ''>(1.5);
  
  // Fixed costs (Monthly)
  const [healthInsurance, setHealthInsurance] = useState<number | ''>(500);
  const [retirementMatch, setRetirementMatch] = useState<number | ''>(150);
  const [otherBenefits, setOtherBenefits] = useState<number | ''>(50);

  const [isFormulaOpen, setIsFormulaOpen] = useState(false);
  const { addToHistory } = useStore();

  const hw = Number(hourlyWage) || 0;
  const hpw = Number(hoursPerWeek) || 0;
  
  const weeklyBasePay = hw * hpw;
  const yearlyBasePay = weeklyBasePay * 52;
  const monthlyBasePay = yearlyBasePay / 12;

  const taxesAmountMonthly = monthlyBasePay * ((Number(payrollTaxes) || 0) / 100);
  const workersCompMonthly = monthlyBasePay * ((Number(workersComp) || 0) / 100);
  
  const fixedBenefitsMonthly = (Number(healthInsurance) || 0) + (Number(retirementMatch) || 0) + (Number(otherBenefits) || 0);

  const totalMonthlyCost = monthlyBasePay + taxesAmountMonthly + workersCompMonthly + fixedBenefitsMonthly;
  const totalYearlyCost = totalMonthlyCost * 12;

  const actualHourlyCost = hpw > 0 ? totalYearlyCost / (hpw * 52) : 0;
  const markupMultiplier = hw > 0 ? actualHourlyCost / hw : 0;

  const handleSaveToTape = () => {
    addToHistory({
      type: 'payroll',
      title: 'Employee True Cost',
      inputs: { 'Hourly Rate': hw, 'Hours/Wk': hpw },
      results: { 'Base Salary': yearlyBasePay, 'True Cost/Yr': totalYearlyCost, 'True Hourly': actualHourlyCost.toFixed(2) }
    });
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">Employee True Cost (Fully Loaded)</h2>
          <p className="text-sm text-slate-500">Calculate the actual cost of an employee including taxes and benefits.</p>
        </div>
        <div className="flex gap-2">
           <Button variant="outline" size="sm" onClick={() => setIsFormulaOpen(!isFormulaOpen)}>
            <Info className="w-4 h-4" />
          </Button>
          <Button variant="outline" size="sm" onClick={handleSaveToTape}>
            <Save className="w-4 h-4 mr-2" /> Tape
          </Button>
        </div>
      </div>

       {isFormulaOpen && (
        <Card className="bg-blue-50/50 dark:bg-blue-900/10 border-blue-100 dark:border-blue-900/30">
          <CardContent className="p-4 text-sm text-blue-800 dark:text-blue-200">
            <strong>Base Salary</strong> = Hourly Rate × Hours per Week × 52<br />
            <strong>Variable Costs</strong> = Base Salary × (Payroll Tax % + Workers Comp %)<br />
            <strong>Fixed Benefits</strong> = (Health + Retirement + Misc) × 12<br />
            <strong>True Hourly Cost</strong> = Total Yearly Cost / Total Yearly Hours
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-6">
           <Card>
            <CardHeader>
              <CardTitle>Base Compensation</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                 <Input
                  label="Hourly Wage"
                  type="number"
                  prefix="$"
                  value={hourlyWage}
                  onChange={(e) => setHourlyWage(e.target.value === '' ? '' : Number(e.target.value))}
                />
                <Input
                  label="Hours per Week"
                  type="number"
                  value={hoursPerWeek}
                  onChange={(e) => setHoursPerWeek(e.target.value === '' ? '' : Number(e.target.value))}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
             <CardHeader>
               <CardTitle>Taxes & Insurance (%)</CardTitle>
             </CardHeader>
             <CardContent className="space-y-4">
               <div className="grid grid-cols-2 gap-4">
                 <Input
                  label="Payroll Taxes (FICA, etc)"
                  type="number"
                  suffix="%"
                  value={payrollTaxes}
                  onChange={(e) => setPayrollTaxes(e.target.value === '' ? '' : Number(e.target.value))}
                />
                <Input
                  label="Workers Comp / Ins"
                  type="number"
                  suffix="%"
                  value={workersComp}
                  onChange={(e) => setWorkersComp(e.target.value === '' ? '' : Number(e.target.value))}
                />
              </div>
             </CardContent>
          </Card>

          <Card>
             <CardHeader>
               <CardTitle>Monthly Benefits Fixed Costs</CardTitle>
             </CardHeader>
             <CardContent className="space-y-4">
               <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                 <Input
                  label="Health Ins."
                  type="number"
                  prefix="$"
                  value={healthInsurance}
                  onChange={(e) => setHealthInsurance(e.target.value === '' ? '' : Number(e.target.value))}
                />
                <Input
                  label="Retirement"
                  type="number"
                  prefix="$"
                  value={retirementMatch}
                  onChange={(e) => setRetirementMatch(e.target.value === '' ? '' : Number(e.target.value))}
                />
                <Input
                  label="Other / Misc"
                  type="number"
                  prefix="$"
                  value={otherBenefits}
                  onChange={(e) => setOtherBenefits(e.target.value === '' ? '' : Number(e.target.value))}
                />
              </div>
             </CardContent>
          </Card>
        </div>

        <div>
          <Card className="bg-slate-900 border-slate-800 text-white sticky top-24">
            <CardHeader className="border-slate-800">
              <CardTitle className="text-white">Fully Loaded Cost Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
               <div>
                  <div className="text-slate-400 text-sm font-medium mb-1">True Cost Per Hour</div>
                  <div className="text-4xl font-bold text-white mb-2">
                    {formatCurrency(actualHourlyCost)} <span className="text-sm font-normal text-slate-400">/ hr</span>
                  </div>
                  <div className="text-sm text-blue-400">
                    That is {(markupMultiplier * 100 - 100).toFixed(1)}% higher than base wage.
                  </div>
               </div>

                <div className="pt-4 border-t border-slate-800 space-y-3">
                   <div className="flex justify-between items-center text-sm">
                      <span className="text-slate-400">Base Salary (Annual)</span>
                      <span className="font-semibold text-slate-200">{formatCurrency(yearlyBasePay)}</span>
                   </div>
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-slate-400">Taxes & Workers Comp</span>
                      <span className="font-semibold text-slate-200">{formatCurrency((taxesAmountMonthly + workersCompMonthly)*12)}</span>
                   </div>
                   <div className="flex justify-between items-center text-sm">
                      <span className="text-slate-400">Benefits & Perks</span>
                      <span className="font-semibold text-slate-200">{formatCurrency(fixedBenefitsMonthly*12)}</span>
                   </div>
                   <div className="flex justify-between items-center font-bold text-lg pt-2 border-t border-slate-700">
                      <span className="text-white">Total Annual Cost</span>
                      <span className="text-emerald-400">{formatCurrency(totalYearlyCost)}</span>
                   </div>
                </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
