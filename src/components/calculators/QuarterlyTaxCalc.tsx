import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { Info, Save, AlertTriangle } from 'lucide-react';
import { formatCurrency } from '../../utils/helpers';
import { useStore } from '../../store/useStore';

export function QuarterlyTaxCalc() {
  const [grossIncome, setGrossIncome] = useState<number | ''>(75000);
  const [expenses, setExpenses] = useState<number | ''>(15000);
  const [effectiveTaxRate, setEffectiveTaxRate] = useState<number | ''>(15);
  
  const [isFormulaOpen, setIsFormulaOpen] = useState(false);
  const { addToHistory } = useStore();

  const gross = Number(grossIncome) || 0;
  const exp = Number(expenses) || 0;
  const incomeRate = Number(effectiveTaxRate) || 0;

  // Rough estimation logic for US Federal
  const netProfit = Math.max(0, gross - exp);
  
  // Self Employment Tax (~15.3% on 92.35% of net profit)
  const taxableSEProfit = netProfit * 0.9235;
  const seTax = taxableSEProfit * 0.153;

  // Income Tax (simplified effective rate applied to remaining profit minus half SE tax deduction)
  const incomeTaxable = Math.max(0, netProfit - (seTax / 2));
  const incomeTax = incomeTaxable * (incomeRate / 100);

  const totalEstimatedTax = seTax + incomeTax;
  const quarterlyPayment = totalEstimatedTax / 4;

  const handleSaveToTape = () => {
    addToHistory({
      type: 'tax',
      title: 'Quarterly Tax Est',
      inputs: { 'Net Profit': netProfit, 'Income Tax %': incomeRate },
      results: { 'Est Total Tax': totalEstimatedTax, 'Quarterly Pmt': quarterlyPayment }
    });
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex justify-between items-center">
        <div>
           <h2 className="text-xl font-bold text-slate-900 dark:text-white">Quarterly Tax Estimator</h2>
          <p className="text-sm text-slate-500">Estimate Self-Employment & Income tax payments for freelancers and sole props.</p>
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
            <strong>Net Profit</strong> = Gross Income - Expenses<br />
            <strong>SE Tax</strong> = (Net Profit Ã 92.35%) Ã 15.3%<br />
            <strong>Income Tax</strong> = (Net Profit - 50% of SE Tax) Ã Effective Tax Rate<br />
            <em>Note: This is a rough estimation tool, not official tax advice. Actual rates depend on local laws, deductions, and bracket structures.</em>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Year-to-Date (YTD) Estimates</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                 <div className="flex items-center gap-2 mb-4 p-3 bg-amber-50 dark:bg-amber-900/20 text-amber-800 dark:text-amber-200 text-xs rounded-lg border border-amber-200 dark:border-amber-800/50">
                    <AlertTriangle className="w-4 h-4 shrink-0" />
                    Enter your total EXPECTED figures for the entire year to get accurate quarterly chunks.
                 </div>
                <Input
                  label="Est. Annual Gross Income"
                  type="number"
                  prefix="$"
                  value={grossIncome}
                  onChange={(e) => setGrossIncome(e.target.value === '' ? '' : Number(e.target.value))}
                />
                <Input
                  label="Est. Annual Deductible Expenses"
                  type="number"
                  prefix="$"
                  value={expenses}
                  onChange={(e) => setExpenses(e.target.value === '' ? '' : Number(e.target.value))}
                />
                <div className="pt-2 flex justify-between items-center text-sm font-medium">
                   <span className="text-slate-500">Projected Net Profit:</span>
                   <span className="text-slate-900 dark:text-slate-100">{formatCurrency(netProfit)}</span>
                </div>
              </CardContent>
            </Card>

             <Card>
              <CardHeader>
                <CardTitle>Tax Configuration</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Input
                  label="Effective Personal Income Tax Rate (%)"
                  type="number"
                  suffix="%"
                  value={effectiveTaxRate}
                  onChange={(e) => setEffectiveTaxRate(e.target.value === '' ? '' : Number(e.target.value))}
                />
                <p className="text-xs text-slate-500">
                  This covers standard Federal/State income tax. SE Tax (15.3%) is calculated automatically on top of this.
                </p>
              </CardContent>
            </Card>
        </div>

        <div>
          <Card className="bg-slate-900 border-slate-800 text-white sticky top-24">
            <CardHeader className="border-slate-800">
              <CardTitle className="text-white">Estimated Liability</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
               <div className="bg-slate-800 p-6 rounded-xl text-center border border-slate-700">
                  <div className="text-slate-400 text-sm font-medium mb-1">Recommended Quarterly Payment</div>
                  <div className="text-4xl font-bold text-white">
                    {formatCurrency(quarterlyPayment)} 
                  </div>
                  <div className="text-sm mt-1 text-slate-400">Save this much every 3 months.</div>
               </div>

                <div className="pt-2 space-y-3">
                   <div className="flex justify-between items-center text-sm">
                      <span className="text-slate-400">Self-Employment (FICA) Tax</span>
                      <span className="font-semibold text-slate-200">{formatCurrency(seTax)}</span>
                   </div>
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-slate-400">Est. Income Tax</span>
                      <span className="font-semibold text-slate-200">{formatCurrency(incomeTax)}</span>
                   </div>
                   <div className="flex justify-between items-center font-bold text-lg pt-2 border-t border-slate-700">
                      <span className="text-white">Total Annual Tax Due</span>
                      <span className="text-red-400">{formatCurrency(totalEstimatedTax)}</span>
                   </div>
                   <div className="flex justify-between items-center text-xs text-slate-500 mt-2">
                      <span>Effective Blended Rate:</span>
                      <span>{netProfit > 0 ? ((totalEstimatedTax / netProfit) * 100).toFixed(1) : 0}%</span>
                   </div>
                </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
