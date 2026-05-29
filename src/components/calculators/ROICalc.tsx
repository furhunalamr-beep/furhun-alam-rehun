import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { Info, Save } from 'lucide-react';
import { formatCurrency, formatPercent } from '../../utils/helpers';
import { useStore } from '../../store/useStore';

export function ROICalc() {
  const [investment, setInvestment] = useState<number | ''>(10000);
  const [returnAmount, setReturnAmount] = useState<number | ''>(15000);
  const [isFormulaOpen, setIsFormulaOpen] = useState(false);
  const { addToHistory } = useStore();

  const inv = Number(investment) || 0;
  const ret = Number(returnAmount) || 0;

  const netProfit = ret - inv;
  const roi = inv > 0 ? (netProfit / inv) * 100 : 0;

  const handleSaveToTape = () => {
    addToHistory({
      type: 'roi',
      title: 'ROI Analysis',
      inputs: { 'Investment': inv, 'Return': ret },
      results: { 'Net Profit': netProfit, 'ROI %': roi.toFixed(2) }
    });
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">Return on Investment (ROI)</h2>
          <p className="text-sm text-slate-500">Calculate the efficiency and profitability of an investment.</p>
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
            <strong>Net Profit</strong> = Total Return - Investment Cost<br />
            <strong>ROI %</strong> = (Net Profit / Investment Cost) × 100
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Investment Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input
              label="Cost of Investment"
              type="number"
              prefix="$"
              value={investment}
              onChange={(e) => setInvestment(e.target.value === '' ? '' : Number(e.target.value))}
            />
            <Input
              label="Total Return / Financial Gain"
              type="number"
              prefix="$"
              value={returnAmount}
              onChange={(e) => setReturnAmount(e.target.value === '' ? '' : Number(e.target.value))}
            />
          </CardContent>
        </Card>

        <Card className="bg-slate-900 border-slate-800 text-white">
          <CardHeader className="border-slate-800">
            <CardTitle className="text-white">Results</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
             <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-slate-400 text-sm font-medium mb-1">Net Profit</div>
                  <div className={`text-2xl font-bold ${netProfit >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                    {formatCurrency(netProfit)}
                  </div>
                </div>
                <div>
                  <div className="text-slate-400 text-sm font-medium mb-1">ROI</div>
                  <div className={`text-3xl font-bold ${roi >= 0 ? 'text-blue-400' : 'text-red-400'}`}>
                    {formatPercent(roi)}
                  </div>
                </div>
              </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
