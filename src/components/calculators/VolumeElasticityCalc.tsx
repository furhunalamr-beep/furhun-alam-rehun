import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { Info, Save } from 'lucide-react';
import { formatCurrency, formatPercent } from '../../utils/helpers';
import { useStore } from '../../store/useStore';
import { Tooltip } from '../ui/Tooltip';

export function VolumeElasticityCalc() {
  const [cost, setCost] = useState<number | ''>(30);
  const [price, setPrice] = useState<number | ''>(50);
  const [proposedDiscount, setProposedDiscount] = useState<number | ''>(10);
  const [isFormulaOpen, setIsFormulaOpen] = useState(false);
  
  const { addToHistory } = useStore();

  const c = Number(cost) || 0;
  const p = Number(price) || 0;
  const discountPercent = Number(proposedDiscount) || 0;

  const currentMargin = p - c;
  const newPrice = p * (1 - discountPercent / 100);
  const newMargin = newPrice - c;

  let requiredVolumeIncrease = 0;
  let isImpossible = false;

  if (newMargin <= 0) {
    isImpossible = true;
  } else if (currentMargin > 0) {
    requiredVolumeIncrease = (currentMargin / newMargin) - 1;
  }

  const handleSaveToTape = () => {
    addToHistory({
      type: 'elasticity',
      title: 'Discount Elasticity',
      inputs: { 'Cost': c, 'Price': p, 'Discount %': discountPercent },
      results: { 'New Margin': newMargin > 0 ? newMargin : 0, 'Req Volume Increase': isImpossible ? 'Impossible' : `${(requiredVolumeIncrease * 100).toFixed(1)}%` }
    });
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">Discounts vs. Volume Elasticity</h2>
          <p className="text-sm text-slate-500">Calculate how many more units you must sell to maintain profits after a discount.</p>
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
            <strong>Current Gross Profit</strong> = Price - Cost<br />
            <strong>New Gross Profit</strong> = (Price - Discount) - Cost<br />
            <strong>Required Volume Increase</strong> = (Current Gross Profit / New Gross Profit) - 1
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Current Metrics & Promo</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input
              label="Unit Cost"
              type="number"
              prefix="$"
              value={cost}
              onChange={(e) => setCost(e.target.value === '' ? '' : Number(e.target.value))}
            />
            <Input
              label="Current Selling Price"
              type="number"
              prefix="$"
              value={price}
              onChange={(e) => setPrice(e.target.value === '' ? '' : Number(e.target.value))}
            />
            <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
              <Input
                label="Proposed Discount"
                type="number"
                suffix="%"
                value={proposedDiscount}
                onChange={(e) => setProposedDiscount(e.target.value === '' ? '' : Number(e.target.value))}
              />
               <Input
                type="range"
                min="0"
                max="99"
                value={proposedDiscount === '' ? 0 : proposedDiscount}
                onChange={(e) => setProposedDiscount(Number(e.target.value))}
                className="mt-2"
              />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-900 border-slate-800 text-white flex flex-col justify-center">
          <CardHeader className="border-slate-800 pb-2">
             <CardTitle className="text-white">To Make The Same Profit...</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
             {isImpossible || currentMargin <= 0 ? (
                <div className="bg-red-500/20 text-red-400 p-4 rounded-xl border border-red-500/30">
                   <div className="font-bold text-lg mb-1">Loss-Making Discount</div>
                   <p className="text-sm">This discount drops the price below your unit cost. You will lose money on every sale, making it impossible to recover total profit through volume.</p>
                </div>
             ) : (
                <>
                  <div>
                    <div className="text-slate-400 text-sm font-medium mb-1">You must increase sales volume by:</div>
                    <div className="text-5xl font-bold text-emerald-400 mb-2">
                       {formatPercent(requiredVolumeIncrease)}
                    </div>
                    <div className="text-slate-300 text-sm">
                       If you normally sell 100 units, you now need to sell <strong>{Math.ceil(100 * (1 + requiredVolumeIncrease))} units</strong> just to break even on the promotion.
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-800">
                     <div>
                       <div className="text-slate-500 text-xs uppercase tracking-wider mb-1">Old Margin/Unit</div>
                       <div className="font-semibold">{formatCurrency(currentMargin)}</div>
                     </div>
                      <div>
                       <div className="text-slate-500 text-xs uppercase tracking-wider mb-1">New Margin/Unit</div>
                       <div className="font-semibold text-orange-400">{formatCurrency(newMargin)}</div>
                     </div>
                  </div>
                </>
             )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
