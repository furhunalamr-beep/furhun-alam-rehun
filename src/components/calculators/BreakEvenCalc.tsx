import React, { useState, useMemo } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { Info, Save } from 'lucide-react';
import { formatCurrency } from '../../utils/helpers';
import { useStore } from '../../store/useStore';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend } from 'recharts';

export function BreakEvenCalc() {
  const [fixedCosts, setFixedCosts] = useState<number | ''>(5000);
  const [variableCost, setVariableCost] = useState<number | ''>(20);
  const [sellingPrice, setSellingPrice] = useState<number | ''>(50);
  const [isFormulaOpen, setIsFormulaOpen] = useState(false);
  const { addToHistory, theme } = useStore();

  const fc = Number(fixedCosts) || 0;
  const vc = Number(variableCost) || 0;
  const sp = Number(sellingPrice) || 0;

  const contributionMargin = sp - vc;
  const breakEvenUnits = contributionMargin > 0 ? Math.ceil(fc / contributionMargin) : 0;
  const breakEvenRevenue = breakEvenUnits * sp;

  const handleSaveToTape = () => {
    addToHistory({
      type: 'breakeven',
      title: 'Break-Even Analysis',
      inputs: { 'Fixed Costs': fc, 'Variable Cost/Unit': vc, 'Selling Price': sp },
      results: { 'Break-Even Units': breakEvenUnits, 'Break-Even Revenue': breakEvenRevenue }
    });
  };

  const chartData = useMemo(() => {
    if (contributionMargin <= 0 || breakEvenUnits === 0) return [];
    
    const data = [];
    // Generate points around break even
    const maxUnits = Math.ceil(breakEvenUnits * 2.5);
    const step = Math.ceil(maxUnits / 10);
    
    for (let units = 0; units <= maxUnits; units += step) {
      data.push({
        units,
        'Total Costs': fc + (vc * units),
        'Total Revenue': sp * units,
      });
    }
    return data;
  }, [fc, vc, sp, breakEvenUnits, contributionMargin]);

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">Break-Even Analysis</h2>
          <p className="text-sm text-slate-500">Determine how many units you must sell to cover overhead.</p>
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
            <strong>Contribution Margin</strong> = Selling Price - Variable Cost<br />
            <strong>Break-Even Units</strong> = Fixed Costs / Contribution Margin<br />
            <strong>Break-Even Revenue</strong> = Break-Even Units × Selling Price
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Costs & Pricing</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input
              label="Fixed Costs (Rent, Salaries)"
              type="number"
              prefix="$"
              value={fixedCosts}
              onChange={(e) => setFixedCosts(e.target.value === '' ? '' : Number(e.target.value))}
            />
            <div className="pt-2 border-t border-slate-100 dark:border-slate-800"></div>
            <Input
              label="Variable Cost per Unit"
              type="number"
              prefix="$"
              value={variableCost}
              onChange={(e) => setVariableCost(e.target.value === '' ? '' : Number(e.target.value))}
            />
             <Input
              label="Selling Price per Unit"
              type="number"
              prefix="$"
              value={sellingPrice}
              onChange={(e) => setSellingPrice(e.target.value === '' ? '' : Number(e.target.value))}
            />
             <div className="pt-2">
                <label className="text-sm text-slate-500 dark:text-slate-400">Quick Adjust Price</label>
                <Input
                  type="range"
                  min={vc}
                  max={vc * 5}
                  value={sp}
                  onChange={(e) => setSellingPrice(Number(e.target.value))}
                  prefix="$"
                />
             </div>
          </CardContent>
        </Card>

        <div className="lg:col-span-2 space-y-6">
          <Card className="bg-blue-600 border-blue-600 text-white">
            <CardContent className="p-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-blue-200 text-sm font-medium mb-1">Break-Even Units</div>
                  <div className="text-3xl font-bold">
                    {contributionMargin <= 0 ? 'N/A' : breakEvenUnits.toLocaleString()}
                  </div>
                </div>
                <div>
                  <div className="text-blue-200 text-sm font-medium mb-1">Break-Even Revenue</div>
                  <div className="text-3xl font-bold">
                     {contributionMargin <= 0 ? 'N/A' : formatCurrency(breakEvenRevenue)}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Visualization</CardTitle>
            </CardHeader>
            <CardContent>
               <div className="h-72 w-full">
                  {chartData.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={chartData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke={theme === 'dark' ? '#334155' : '#e2e8f0'} />
                        <XAxis 
                          dataKey="units" 
                          stroke={theme === 'dark' ? '#94a3b8' : '#64748b'} 
                          tickFormatter={(val) => `${val} u`}
                        />
                        <YAxis 
                          stroke={theme === 'dark' ? '#94a3b8' : '#64748b'} 
                          tickFormatter={(val) => `$${val/1000}k`}
                        />
                        <RechartsTooltip 
                          formatter={(value: number) => formatCurrency(value)}
                          labelFormatter={(label) => `Units: ${label}`}
                          contentStyle={{
                             backgroundColor: theme === 'dark' ? '#1e293b' : '#ffffff',
                             borderColor: theme === 'dark' ? '#334155' : '#e2e8f0',
                             color: theme === 'dark' ? '#f8fafc' : '#0f172a'
                          }}
                        />
                        <Legend />
                        <Line type="monotone" dataKey="Total Costs" stroke="#ef4444" strokeWidth={2} dot={false} />
                        <Line type="monotone" dataKey="Total Revenue" stroke="#22c55e" strokeWidth={2} dot={false} />
                      </LineChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="h-full flex items-center justify-center text-slate-500">
                      Not enough data. Selling price must exceed variable cost.
                    </div>
                  )}
               </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
