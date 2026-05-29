import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { Info, Save } from 'lucide-react';
import { formatCurrency, formatPercent } from '../../utils/helpers';
import { useStore } from '../../store/useStore';
import { Tooltip } from '../ui/Tooltip';

export function SaaSMetricsCalc() {
  const [totalCustomers, setTotalCustomers] = useState<number | ''>(1000);
  const [mrr, setMrr] = useState<number | ''>(50000);
  const [churnedCustomers, setChurnedCustomers] = useState<number | ''>(25);
  const [isFormulaOpen, setIsFormulaOpen] = useState(false);
  
  const { addToHistory } = useStore();

  const active = Number(totalCustomers) || 0;
  const revenue = Number(mrr) || 0;
  const churned = Number(churnedCustomers) || 0;

  const arpu = active > 0 ? revenue / active : 0;
  const churnRate = active > 0 ? churned / active : 0;
  const ltv = churnRate > 0 ? arpu / churnRate : 0;
  
  // Calculate CAC requirement for standard 3:1 ratio
  const maxHealthyCac = ltv / 3;

  const handleSaveToTape = () => {
    addToHistory({
      type: 'saas',
      title: 'SaaS Metrics (ARPU/LTV)',
      inputs: { 'Active Users': active, 'MRR': revenue, 'Churned': churned },
      results: { 'ARPU': arpu.toFixed(2), 'Churn Rate': `${(churnRate * 100).toFixed(1)}%`, 'LTV': ltv.toFixed(2) }
    });
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">SaaS / Subscription Metrics</h2>
          <p className="text-sm text-slate-500">Calculate ARPU, Churn, and Customer Lifetime Value (LTV).</p>
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
            <strong>ARPU (Average Revenue per User)</strong> = Total MRR / Active Customers<br />
            <strong>Customer Churn Rate</strong> = Churned Customers / Total Customers<br />
            <strong>LTV (Lifetime Value)</strong> = ARPU / Churn Rate
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Monthly Data</CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            <Input
              label="Total Active Subscriptions"
              type="number"
              value={totalCustomers}
              onChange={(e) => setTotalCustomers(e.target.value === '' ? '' : Number(e.target.value))}
            />
            <Input
              label="Monthly Recurring Revenue (MRR)"
              type="number"
              prefix="$"
              value={mrr}
              onChange={(e) => setMrr(e.target.value === '' ? '' : Number(e.target.value))}
            />
            <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
              <Input
                label="Customers Lost this Month"
                type="number"
                value={churnedCustomers}
                onChange={(e) => setChurnedCustomers(e.target.value === '' ? '' : Number(e.target.value))}
              />
            </div>
          </CardContent>
        </Card>

        <div className="lg:col-span-2 space-y-6">
           <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Card className="bg-white dark:bg-slate-900 text-center py-6">
                <div className="text-slate-500 text-sm font-medium mb-2 uppercase tracking-wider">Average Revenue Per User</div>
                <div className="text-4xl font-bold text-slate-900 dark:text-white">
                  {formatCurrency(arpu)} <span className="text-sm font-normal text-slate-400">/ mo</span>
                </div>
              </Card>
              <Card className="bg-white dark:bg-slate-900 text-center py-6 border-red-200 dark:border-red-900/50">
                <div className="flex items-center justify-center gap-2 mb-2">
                   <div className="text-slate-500 text-sm font-medium uppercase tracking-wider">Customer Churn Rate</div>
                   <Tooltip content="The percentage of customers who canceled their subscription this month. Aim for under 5%.">
                      <Info className="w-4 h-4 text-slate-400 cursor-help" />
                   </Tooltip>
                </div>
                <div className={`text-4xl font-bold ${churnRate > 0.05 ? 'text-red-500' : 'text-emerald-500'}`}>
                  {formatPercent(churnRate)}
                </div>
              </Card>
           </div>

           <Card className="bg-blue-600 border-none text-white text-center py-8">
              <div className="text-blue-200 text-sm font-medium mb-2 uppercase tracking-wider">Customer Lifetime Value (LTV)</div>
              <div className="text-6xl font-bold mb-4">
                 {churnRate === 0 ? 'â' : formatCurrency(ltv)}
              </div>
              <div className="bg-blue-700/50 rounded-lg p-4 mx-6 text-sm text-blue-100 flex items-center justify-between">
                 <span>Healthy CAC Target (3:1 Ratio)</span>
                 <span className="font-bold text-lg">{formatCurrency(maxHealthyCac)}</span>
              </div>
           </Card>
        </div>
      </div>
    </div>
  );
}
