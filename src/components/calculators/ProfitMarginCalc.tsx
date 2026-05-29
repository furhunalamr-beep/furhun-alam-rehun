import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { Info, Download, Save, RefreshCw } from 'lucide-react';
import { formatCurrency, formatPercent } from '../../utils/helpers';
import { useStore } from '../../store/useStore';
import { Tooltip } from '../ui/Tooltip';
import { useQuickRun } from '../../hooks/useQuickRun';

export function ProfitMarginCalc() {
  const [cost, setCost] = useState<number | ''>(50);
  const [margin, setMargin] = useState<number | ''>(40);
  const [isFormulaOpen, setIsFormulaOpen] = useState(false);
  const { addToHistory } = useStore();

  const c = Number(cost) || 0;
  const m = Number(margin) || 0;
  
  // Formulas
  const sellingPrice = m < 100 ? c / (1 - m / 100) : 0;
  const grossProfit = sellingPrice - c;
  const markup = c > 0 ? (grossProfit / c) * 100 : 0;

  const handleSaveToTape = () => {
    if (m >= 100) return;
    addToHistory({
      type: 'margin',
      title: 'Profit & Margin',
      inputs: { 'Cost': c, 'Target Margin %': m },
      results: { 'Selling Price': sellingPrice, 'Gross Profit': grossProfit }
    });
  };

  useQuickRun(handleSaveToTape);

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">Margin & Markup Calculator</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">Calculate optimal selling price based on cost and desired profit margin.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => setIsFormulaOpen(!isFormulaOpen)}>
            <Info className="w-4 h-4 mr-2" />
            Formula
          </Button>
          <Button variant="outline" size="sm" onClick={handleSaveToTape}>
            <Save className="w-4 h-4 mr-2" />
            Tape
          </Button>
        </div>
      </div>

      {isFormulaOpen && (
        <Card className="bg-blue-50/50 dark:bg-blue-900/10 border-blue-100 dark:border-blue-900/30">
          <CardContent className="p-4 text-sm text-blue-800 dark:text-blue-200">
            <strong>Selling Price</strong> = Cost / (1 - Margin %)<br />
            <strong>Gross Profit</strong> = Selling Price - Cost<br />
            <strong>Markup %</strong> = (Gross Profit / Cost) × 100
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Inputs</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <Input
              label="Item Cost"
              type="number"
              prefix="$"
              value={cost}
              onChange={(e) => setCost(e.target.value === '' ? '' : Number(e.target.value))}
              min={0}
              step="0.01"
            />
            
            <div className="space-y-4">
              <Input
                label="Target Gross Margin"
                type="range"
                min="0"
                max="99"
                value={margin === '' ? 0 : margin}
                onChange={(e) => setMargin(Number(e.target.value))}
                suffix="%"
              />
              <Input
                type="number"
                suffix="%"
                value={margin}
                onChange={(e) => setMargin(e.target.value === '' ? '' : Number(e.target.value))}
                min={0}
                max={99}
              />
            </div>
            
            <div className="pt-4 flex gap-2">
              <Button variant="secondary" className="w-full" onClick={() => { setCost(''); setMargin(''); }}>
                <RefreshCw className="w-4 h-4 mr-2" /> Reset
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-900 dark:bg-slate-950 border-slate-800 text-white">
          <CardHeader className="border-slate-800">
            <CardTitle className="text-white">Results</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="bg-slate-800 rounded-xl p-4">
              <div className="text-slate-400 text-sm font-medium mb-1">Recommended Selling Price</div>
              <div className="text-3xl font-bold text-white">
                {m >= 100 ? 'Impossible Margin' : formatCurrency(sellingPrice)}
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-800">
                <div className="text-slate-400 text-sm font-medium mb-1 flex items-center gap-1.5">
                  Gross Profit
                  <Tooltip content="The total revenue minus the cost of goods sold. This is your absolute profit per unit.">
                    <Info className="w-4 h-4 text-slate-500 hover:text-slate-300 cursor-help transition-colors" />
                  </Tooltip>
                </div>
                <div className="text-xl font-bold text-green-400">
                  {m >= 100 ? '-' : formatCurrency(grossProfit)}
                </div>
              </div>
              <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-800">
                <div className="text-slate-400 text-sm font-medium mb-1 flex items-center gap-1.5">
                  Equivalent Markup
                  <Tooltip content="The percentage added to your base cost to reach the selling price. Often confused with margin.">
                    <Info className="w-4 h-4 text-slate-500 hover:text-slate-300 cursor-help transition-colors" />
                  </Tooltip>
                </div>
                <div className="text-xl font-bold text-blue-400">
                  {m >= 100 ? '-' : formatPercent(markup)}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
