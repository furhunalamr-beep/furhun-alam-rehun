import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { Info, Save, Table as TableIcon } from 'lucide-react';
import { formatCurrency } from '../../utils/helpers';
import { useStore } from '../../store/useStore';

export function AmortizationCalc() {
  const [loanAmount, setLoanAmount] = useState<number | ''>(50000);
  const [interestRate, setInterestRate] = useState<number | ''>(7.5);
  const [loanTerm, setLoanTerm] = useState<number | ''>(5); // years
  const [showSchedule, setShowSchedule] = useState(false);
  
  const { addToHistory, theme } = useStore();

  const P = Number(loanAmount) || 0;
  const r = (Number(interestRate) || 0) / 100 / 12;
  const n = (Number(loanTerm) || 0) * 12;

  // Monthly Payment Formula: M = P [ i(1 + i)^n ] / [ (1 + i)^n - 1]
  const monthlyPayment = P > 0 && r > 0 && n > 0 
    ? P * (r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1)
    : (n > 0 ? P / n : 0);

  const totalPaid = monthlyPayment * n;
  const totalInterest = totalPaid - P;

  const handleSaveToTape = () => {
    addToHistory({
      type: 'loan',
      title: 'Commercial Loan',
      inputs: { 'Amount': P, 'Rate (%)': Number(interestRate), 'Years': Number(loanTerm) },
      results: { 'Monthly Pmt': monthlyPayment, 'Total Interest': totalInterest }
    });
  };

  const generateSchedule = () => {
    if (P <= 0 || n <= 0) return [];
    let balance = P;
    const schedule = [];
    for (let month = 1; month <= Math.min(n, 360); month++) { // Cap at 30 years for performance
      const interestPayment = balance * r;
      const principalPayment = monthlyPayment - interestPayment;
      balance -= principalPayment;
      schedule.push({
        month,
        principal: principalPayment,
        interest: interestPayment,
        balance: Math.max(0, balance)
      });
    }
    return schedule;
  };

  const schedule = showSchedule ? generateSchedule() : [];

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">Commercial Loan & Amortization</h2>
          <p className="text-sm text-slate-500">Calculate payments and generate a schedule.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={handleSaveToTape}>
            <Save className="w-4 h-4 mr-2" /> Tape
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-1 border-blue-100 dark:border-blue-900/30">
          <CardHeader>
            <CardTitle>Loan Terms</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input
              label="Loan Amount"
              type="number"
              prefix="$"
              value={loanAmount}
              onChange={(e) => setLoanAmount(e.target.value === '' ? '' : Number(e.target.value))}
            />
            <Input
              label="Annual Interest Rate (%)"
              type="number"
              suffix="%"
              value={interestRate}
              onChange={(e) => setInterestRate(e.target.value === '' ? '' : Number(e.target.value))}
            />
            <Input
              label="Loan Term (Years)"
              type="number"
              value={loanTerm}
              onChange={(e) => setLoanTerm(e.target.value === '' ? '' : Number(e.target.value))}
            />
             <div className="pt-4">
                <Button 
                  variant={showSchedule ? "secondary" : "outline"} 
                  className="w-full"
                  onClick={() => setShowSchedule(!showSchedule)}
                >
                  <TableIcon className="w-4 h-4 mr-2" /> 
                  {showSchedule ? 'Hide Schedule' : 'Show Schedule'}
                </Button>
            </div>
          </CardContent>
        </Card>

        <div className="lg:col-span-2 space-y-6">
          <Card className="bg-slate-900 dark:bg-slate-950 border-slate-800 text-white">
            <CardContent className="p-6">
               <div className="text-slate-400 text-sm font-medium mb-1 text-center">Estimated Monthly Payment</div>
               <div className="text-4xl sm:text-5xl font-bold text-center text-white mb-8 mt-2">
                 {formatCurrency(monthlyPayment)}
               </div>

              <div className="grid grid-cols-2 gap-4 border-t border-slate-800 pt-6">
                <div className="text-center">
                  <div className="text-slate-400 text-sm font-medium mb-1">Total Principal</div>
                  <div className="text-xl font-semibold">{formatCurrency(P)}</div>
                </div>
                <div className="text-center">
                  <div className="text-slate-400 text-sm font-medium mb-1">Total Interest</div>
                  <div className="text-xl font-semibold text-orange-400">{formatCurrency(totalInterest)}</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {showSchedule && schedule.length > 0 && (
        <Card className="overflow-hidden">
          <CardHeader>
            <CardTitle>Amortization Schedule</CardTitle>
          </CardHeader>
          <div className="overflow-x-auto max-h-96">
            <table className="w-full text-sm text-left text-slate-500 dark:text-slate-400">
              <thead className="text-xs text-slate-700 uppercase bg-slate-50 dark:bg-slate-800/50 dark:text-slate-300 sticky top-0">
                <tr>
                  <th className="px-6 py-3">Pmt #</th>
                  <th className="px-6 py-3">Principal</th>
                  <th className="px-6 py-3">Interest</th>
                  <th className="px-6 py-3">Remaining Balance</th>
                </tr>
              </thead>
              <tbody>
                {schedule.map((row) => (
                  <tr key={row.month} className="bg-white border-b dark:bg-slate-900 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/80">
                    <td className="px-6 py-3 font-medium text-slate-900 dark:text-slate-100">{row.month}</td>
                    <td className="px-6 py-3 text-emerald-600 dark:text-emerald-400">{formatCurrency(row.principal)}</td>
                    <td className="px-6 py-3 text-orange-600 dark:text-orange-400">{formatCurrency(row.interest)}</td>
                    <td className="px-6 py-3 font-mono">{formatCurrency(row.balance)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
}
