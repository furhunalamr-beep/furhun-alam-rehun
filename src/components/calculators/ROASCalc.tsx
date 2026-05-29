import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { Info, Save } from 'lucide-react';
import { formatCurrency, formatPercent } from '../../utils/helpers';
import { useStore } from '../../store/useStore';
import { Tooltip } from '../ui/Tooltip';
import { CopyButton } from '../ui/CopyButton';

export function ROASCalc() {
  const [sellingPrice, setSellingPrice] = useState<number | ''>(50);
  const [cogs, setCogs] = useState<number | ''>(20); // Cost of Goods + Shipping + Fees
  const [targetProfitPercent, setTargetProfitPercent] = useState<number | ''>(20); // Desired net margin
  
  const [isFormulaOpen, setIsFormulaOpen] = useState(false);
  const { addToHistory } = useStore();

  const sp = Number(sellingPrice) || 0;
  const cost = Number(cogs) || 0;
  const targetProfitMagin = (Number(targetProfitPercent) || 0) / 100;

  // Max CPA to break even (Profit before ads)
  const maxCpaBreakeven = sp - cost;
  
  // Break-Even ROAS = Selling Price / Max CPA
  const breakevenRoas = maxCpaBreakeven > 0 ? sp / maxCpaBreakeven : 0;

  // Target CPA to hit profit margin
  const targetProfitAmount = sp * targetProfitMagin;
  const targetCpa = maxCpaBreakeven - targetProfitAmount;
  
  // Target ROAS
  const targetRoas = targetCpa > 0 ? sp / targetCpa : 0;

  const handleSaveToTape = () => {
    addToHistory({
      type: 'roas',
      title: 'ROAS Targets',
      inputs: { 'Price': sp, 'Cost': cost, 'Target Margin': `${targetProfitPercent}%` },
      results: { 'BE ROAS': breakevenRoas.toFixed(2), 'Target ROAS': targetRoas.toFixed(2) }
    });
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">ROAS Target & CPA Calculator</h2>
          <p className="text-sm text-slate-500">Calculate Break-Even Return on Ad Spend (ROAS) and Cost Per Acquisition (CPA) targets.</p>
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
            <strong>Break-Even CPA (Max Ad Spend)</strong> = Selling Price - Total COGS<br />
            <strong>Break-Even ROAS</strong> = Selling Price / Break-Even CPA<br />
            <strong>Target CPA</strong> = Break-Even CPA - Desired Net Profit<br />
            <strong>Target ROAS</strong> = Selling Price / Target CPA
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-6">
           <Card>
            <CardHeader>
              <CardTitle>Unit Economics</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
               <Input
                  label="Final Selling Price"
                  type="number"
                  prefix="$"
                  value={sellingPrice}
                  onChange={(e) => setSellingPrice(e.target.value === '' ? '' : Number(e.target.value))}
                />
                 <Input
                    label="Floor Cost (Product + Ship + Fees)"
                    type="number"
                    prefix="$"
                    value={cogs}
                    onChange={(e) => setCogs(e.target.value === '' ? '' : Number(e.target.value))}
                  />
                <div className="pt-2 text-sm text-slate-500 flex justify-between items-center">
                  <span>Gross Profit (Max CPA to Break-Even):</span>
                  <span className="font-semibold text-slate-900 dark:text-slate-100">{formatCurrency(maxCpaBreakeven)}</span>
                </div>
            </CardContent>
          </Card>

          <Card>
             <CardHeader>
               <CardTitle>Growth Targets</CardTitle>
             </CardHeader>
             <CardContent>
                <Input
                  label="Target Net Profit Margin (%)"
                  type="number"
                  suffix="%"
                  value={targetProfitPercent}
                  onChange={(e) => setTargetProfitPercent(e.target.value === '' ? '' : Number(e.target.value))}
                />
                <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800 text-sm text-slate-500 flex justify-between items-center">
                  <span>Desired Profit Per Unit:</span>
                  <span className="font-semibold text-emerald-600 dark:text-emerald-400">+{formatCurrency(targetProfitAmount)}</span>
                </div>
             </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="bg-slate-900 border-slate-800 text-white">
            <CardHeader className="border-slate-800 pb-4">
              <CardTitle className="text-white flex items-center gap-2">
                1. Break-Even Point (Survival)
                <Tooltip content="If your ROAS drops below this, you are actively losing money on every sale.">
                  <Info className="w-4 h-4 text-slate-500" />
                </Tooltip>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
               <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-slate-400 text-sm font-medium mb-1">Break-Even ROAS</div>
                    <div className="text-3xl font-bold text-orange-400 flex items-center gap-2">
                      {breakevenRoas > 0 ? breakevenRoas.toFixed(2) : 'N/A'}<span className="text-lg">x</span>
                      {breakevenRoas > 0 && <CopyButton value={breakevenRoas.toFixed(2)} className="text-slate-400 hover:text-white hover:bg-slate-800" />}
                    </div>
                  </div>
                   <div>
                    <div className="text-slate-400 text-sm font-medium mb-1">Max CPA</div>
                    <div className="text-3xl font-bold flex items-center gap-2">
                      {formatCurrency(maxCpaBreakeven)}
                    </div>
                  </div>
               </div>
            </CardContent>
          </Card>
          
           <Card className="bg-blue-600 border-blue-600 text-white overflow-hidden relative">
            {targetCpa <= 0 && (
              <div className="absolute inset-0 bg-slate-900/90 backdrop-blur-sm z-10 flex flex-col items-center justify-center p-6 text-center">
                <span className="text-2xl mb-2">ðŸš«</span>
                <p className="font-semibold">Unrealistic Target Margin.</p>
                <p className="text-sm text-slate-300 mt-2">Your desired profit exceeds your gross profit. You need a higher selling price or lower floor cost.</p>
              </div>
            )}
            <CardHeader className="pb-4">
              <CardTitle className="text-white flex items-center gap-2">
                2. Goal Point (Profitable)
                <Tooltip content="The exact ROAS inside your Ad Manager you need to hit your target profit.">
                  <Info className="w-4 h-4 text-blue-300" />
                </Tooltip>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
               <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-blue-200 text-sm font-medium mb-1">Target ROAS</div>
                    <div className="text-4xl font-bold text-white flex items-center gap-2">
                      {targetRoas.toFixed(2)}<span className="text-xl text-blue-200">x</span>
                      <CopyButton value={targetRoas.toFixed(2)} className="text-blue-300 hover:text-white hover:bg-blue-700" />
                    </div>
                  </div>
                   <div>
                    <div className="text-blue-200 text-sm font-medium mb-1">Target CPA</div>
                    <div className="text-4xl font-bold flex items-center gap-2 text-white">
                      {formatCurrency(targetCpa)}
                    </div>
                  </div>
               </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
