import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { Info, Save, Plus, Trash2 } from 'lucide-react';
import { formatCurrency } from '../../utils/helpers';
import { useStore } from '../../store/useStore';
import { CopyButton } from '../ui/CopyButton';

type Purchase = { id: string, price: number | '', quantity: number | '' };

export function DCACalc() {
  const [purchases, setPurchases] = useState<Purchase[]>([
    { id: '1', price: 100, quantity: 10 },
    { id: '2', price: 80, quantity: 20 },
  ]);
  
  const { addToHistory } = useStore();

  const handleUpdate = (id: string, field: 'price' | 'quantity', value: number | '') => {
    setPurchases(purchases.map(p => p.id === id ? { ...p, [field]: value } : p));
  };

  const handleAdd = () => {
    setPurchases([...purchases, { id: crypto.randomUUID(), price: '', quantity: '' }]);
  };

  const handleRemove = (id: string) => {
    if (purchases.length > 1) {
      setPurchases(purchases.filter(p => p.id !== id));
    }
  };

  let totalCost = 0;
  let totalUnits = 0;

  purchases.forEach(p => {
    const price = Number(p.price) || 0;
    const qty = Number(p.quantity) || 0;
    if (price > 0 && qty > 0) {
      totalCost += price * qty;
      totalUnits += qty;
    }
  });

  const averagePrice = totalUnits > 0 ? totalCost / totalUnits : 0;

  const handleSaveToTape = () => {
    addToHistory({
      type: 'dca',
      title: 'DCA Average Down',
      inputs: { 'Orders': purchases.length, 'Total Invested': totalCost },
      results: { 'Average Entry': averagePrice.toFixed(4) }
    });
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">DCA Average Down Calculator</h2>
          <p className="text-sm text-slate-500">Calculate your weighted average entry price across multiple buys.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={handleSaveToTape}>
            <Save className="w-4 h-4 mr-2" /> Tape
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="flex flex-col">
          <CardHeader className="flex flex-row justify-between items-center">
            <CardTitle>Trade Execution History</CardTitle>
            <Button variant="outline" size="sm" onClick={handleAdd}>
               <Plus className="w-4 h-4 mr-1" /> Add Buy
            </Button>
          </CardHeader>
          <CardContent className="space-y-4 flex-1 overflow-y-auto max-h-[500px]">
             {purchases.map((purchase, index) => (
                <div key={purchase.id} className="p-4 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 rounded-xl relative group">
                   <div className="absolute -top-3 left-4 bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 text-[10px] font-bold px-2 py-0.5 rounded-full">
                     Order #{index + 1}
                   </div>
                   <div className="flex items-center gap-3">
                     <Input
                        label="Buy Price"
                        type="number"
                        prefix="$"
                        value={purchase.price}
                        onChange={(e) => handleUpdate(purchase.id, 'price', e.target.value === '' ? '' : Number(e.target.value))}
                      />
                      <Input
                        label="Quantity"
                        type="number"
                        value={purchase.quantity}
                        onChange={(e) => handleUpdate(purchase.id, 'quantity', e.target.value === '' ? '' : Number(e.target.value))}
                      />
                      <button 
                        onClick={() => handleRemove(purchase.id)}
                        className="mt-6 p-2 text-slate-400 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100 disabled:opacity-0"
                        disabled={purchases.length === 1}
                      >
                         <Trash2 className="w-5 h-5" />
                      </button>
                   </div>
                </div>
             ))}
          </CardContent>
        </Card>

        <Card className="bg-slate-900 border-slate-800 text-white">
          <CardHeader className="border-b border-slate-800">
            <CardTitle className="text-white">Weighted Average</CardTitle>
          </CardHeader>
          <CardContent className="p-6 space-y-6">
             
             <div className="bg-slate-950 p-6 rounded-xl border border-blue-900/50 shadow-inner">
                <div className="text-slate-400 text-sm font-medium mb-2 uppercase tracking-wider text-center">New Average Break-Even Price</div>
                <div className="flex justify-center items-center gap-3">
                   <div className="text-5xl font-mono text-cyan-400">
                     {averagePrice === 0 ? '0.00' : averagePrice.toLocaleString(undefined, { maximumFractionDigits: 6 })}
                   </div>
                   {averagePrice > 0 && <CopyButton value={averagePrice.toString()} className="text-slate-400 hover:text-white" iconOnly={false} />}
                </div>
             </div>

             <div className="space-y-4 pt-4">
                <div className="flex justify-between items-center text-sm border-b border-slate-800 pb-2">
                   <span className="text-slate-400">Total Tokens / Shares Owned</span>
                   <span className="font-mono text-lg text-slate-200">{totalUnits.toLocaleString(undefined, { maximumFractionDigits: 6 })}</span>
                </div>
                <div className="flex justify-between items-center text-sm border-b border-slate-800 pb-2">
                   <span className="text-slate-400">Total Capital Deployed</span>
                   <span className="font-mono text-lg text-slate-200">{formatCurrency(totalCost)}</span>
                </div>
             </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
