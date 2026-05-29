import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { Info, Save } from 'lucide-react';
import { useStore } from '../../store/useStore';
import { CopyButton } from '../ui/CopyButton';

export function RRRatioCalc() {
  const [entryPrice, setEntryPrice] = useState<number | ''>(45000);
  const [stopLoss, setStopLoss] = useState<number | ''>(44000);
  
  const { addToHistory } = useStore();

  const entry = Number(entryPrice) || 0;
  const sl = Number(stopLoss) || 0;

  // Price difference per unit
  const riskAmount = Math.abs(entry - sl);
  const isLong = sl < entry;

  const getTP = (ratio: number) => {
    if (entry === 0 || sl === 0 || entry === sl) return 0;
    const reward = riskAmount * ratio;
    return isLong ? entry + reward : entry - reward;
  };

  const handleSaveToTape = () => {
    addToHistory({
      type: 'risk_reward',
      title: 'Risk/Reward TPs',
      inputs: { 'Entry': entry, 'SL': sl },
      results: { '1:2 TP': getTP(2), '1:3 TP': getTP(3) }
    });
  };

  const ratios = [1, 1.5, 2, 3, 5, 10];

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">Risk:Reward Multi-TP Calculator</h2>
          <p className="text-sm text-slate-500">Automatically map out your Take Profit levels based on Entry and Stop Loss risk.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={handleSaveToTape}>
            <Save className="w-4 h-4 mr-2" /> Tape
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-[1fr_2fr] gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Trade Levels</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
             <Input
                label="Entry Price"
                type="number"
                prefix="$"
                value={entryPrice}
                onChange={(e) => setEntryPrice(e.target.value === '' ? '' : Number(e.target.value))}
              />
              <Input
                label="Stop Loss Price"
                type="number"
                prefix="$"
                value={stopLoss}
                onChange={(e) => setStopLoss(e.target.value === '' ? '' : Number(e.target.value))}
              />
               {entry > 0 && sl > 0 && (
                   <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800 text-sm">
                      <div className="text-slate-500 mb-1">Risk per unit:</div>
                      <div className="font-mono font-medium">${riskAmount.toLocaleString(undefined, { maximumFractionDigits: 5 })}</div>
                   </div>
                )}
          </CardContent>
        </Card>

        <Card className="bg-slate-900 border-slate-800 text-white">
          <CardHeader className="border-b border-slate-800 bg-slate-950">
            <CardTitle className="text-white flex items-center justify-between">
              Take Profit Targets
              {entry > 0 && sl > 0 && (
                <span className={`text-xs px-2 py-1 rounded-md ${isLong ? 'bg-emerald-900/50 text-emerald-400 border border-emerald-900' : 'bg-red-900/50 text-red-400 border border-red-900'}`}>
                  {isLong ? 'LONG' : 'SHORT'}
                </span>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
             <div className="divide-y divide-slate-800">
               {ratios.map(ratio => {
                 const tp = getTP(ratio);
                 return (
                    <div key={ratio} className="flex items-center justify-between p-4 hover:bg-slate-800/50 transition-colors">
                      <div className="flex flex-col">
                        <span className="text-sm font-semibold text-slate-400">Target {ratio}:1</span>
                        <span className="text-lg font-mono text-emerald-400">${tp === 0 ? '0.00' : tp.toLocaleString(undefined, { maximumFractionDigits: 5 })}</span>
                      </div>
                      {tp > 0 && <CopyButton value={tp.toString()} className="text-slate-400 hover:text-white" iconOnly={false} />}
                    </div>
                 );
               })}
             </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
