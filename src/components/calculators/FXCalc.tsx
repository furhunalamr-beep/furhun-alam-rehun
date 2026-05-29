import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { ArrowRightLeft, RefreshCw, AlertCircle, Globe } from 'lucide-react';
import { CopyButton } from '../ui/CopyButton';

// Quick fallback static rates just in case API fails
const FALLBACK_RATES: Record<string, number> = {
  USD: 1, EUR: 0.92, GBP: 0.79, JPY: 154.5, CNY: 7.24, CAD: 1.36, AUD: 1.52, CHF: 0.91,
};

const POPULAR_CURRENCIES = ['USD', 'EUR', 'GBP', 'JPY', 'CNY', 'AUD', 'CAD'];

export function FXCalc() {
  const [amount, setAmount] = useState<number | ''>(1000);
  const [baseCurrency, setBaseCurrency] = useState('USD');
  const [targetCurrency, setTargetCurrency] = useState('EUR');
  
  const [rates, setRates] = useState<Record<string, number>>(FALLBACK_RATES);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const fetchRates = async (base: string) => {
    setLoading(true);
    setError(null);
    try {
      // Using open.er-api.com which is free and doesn't require API keys
      const res = await fetch(`https://open.er-api.com/v6/latest/${base}`);
      if (!res.ok) throw new Error('API Rate limit or unavailable');
      const data = await res.json();
      setRates(data.rates);
      setLastUpdated(new Date(data.time_last_update_unix * 1000));
    } catch (err) {
      console.warn("Could not fetch live rates, falling back to static", err);
      setError("Using offline fallback rates");
      // Calculate derived fallback rates if base isn't USD
      if (base !== 'USD' && FALLBACK_RATES[base]) {
         const newRates: Record<string, number> = {};
         Object.keys(FALLBACK_RATES).forEach(cur => {
            newRates[cur] = FALLBACK_RATES[cur] / FALLBACK_RATES[base];
         });
         setRates(newRates);
      } else {
         setRates(FALLBACK_RATES);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRates(baseCurrency);
  }, [baseCurrency]);

  const handleSwap = () => {
    setBaseCurrency(targetCurrency);
    setTargetCurrency(baseCurrency);
  };

  const a = Number(amount) || 0;
  const rate = rates[targetCurrency] || 0;
  const result = a * rate;

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">Live Currency Exchange</h2>
          <p className="text-sm text-slate-500">Real-time dropshipping & trading FX converter.</p>
        </div>
        <div className="flex gap-2 text-sm text-slate-500 items-center">
          {error && <span className="text-amber-500 flex items-center gap-1"><AlertCircle className="w-4 h-4"/> Offline Mode</span>}
          {loading ? (
             <RefreshCw className="w-4 h-4 animate-spin text-blue-500" />
          ) : (
             <button onClick={() => fetchRates(baseCurrency)} className="hover:text-slate-900 dark:hover:text-white transition-colors" title="Force Refresh">
               <RefreshCw className="w-4 h-4" />
             </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
        <Card>
          <CardContent className="p-6 space-y-6">
             <div className="space-y-2">
               <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Amount</label>
               <input
                 type="number"
                 className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg px-4 py-3 text-2xl font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                 value={amount}
                 onChange={(e) => setAmount(e.target.value === '' ? '' : Number(e.target.value))}
               />
             </div>

             <div className="grid grid-cols-[1fr_auto_1fr] gap-4 items-center">
                <div className="space-y-2">
                   <label className="text-sm font-medium text-slate-700 dark:text-slate-300">From</label>
                   <select 
                     className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-2.5 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                     value={baseCurrency}
                     onChange={(e) => setBaseCurrency(e.target.value)}
                   >
                     {Object.keys(rates).sort().map(c => <option key={c} value={c}>{c}</option>)}
                   </select>
                </div>
                
                <button 
                  onClick={handleSwap}
                  className="mt-6 p-3 rounded-full hover:bg-blue-50 dark:hover:bg-blue-900/30 text-blue-600 dark:text-blue-400 transition-colors"
                >
                   <ArrowRightLeft className="w-5 h-5" />
                </button>

                <div className="space-y-2">
                   <label className="text-sm font-medium text-slate-700 dark:text-slate-300">To</label>
                   <select 
                     className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-2.5 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                     value={targetCurrency}
                     onChange={(e) => setTargetCurrency(e.target.value)}
                   >
                     {Object.keys(rates).sort().map(c => <option key={c} value={c}>{c}</option>)}
                   </select>
                </div>
             </div>
             
             <div className="flex gap-2 flex-wrap pt-2">
                {POPULAR_CURRENCIES.filter(c => c !== targetCurrency).map(c => (
                   <button 
                     key={c}
                     onClick={() => setTargetCurrency(c)}
                     className="px-3 py-1 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-full text-xs font-medium transition-colors"
                   >
                     {c}
                   </button>
                ))}
             </div>
          </CardContent>
        </Card>

        <Card className="bg-blue-600 border-none text-white overflow-hidden shadow-xl sm:h-[300px] flex flex-col justify-center relative">
          {/* Background decoration */}
          <div className="absolute -right-20 -bottom-20 opacity-10 blur-xl">
             <Globe className="w-64 h-64" />
          </div>

          <CardContent className="p-8 relative z-10 flex flex-col items-center justify-center text-center space-y-4">
             <div className="text-blue-200 text-sm font-medium uppercase tracking-wider">Converted Amount</div>
             
             <div className="text-5xl md:text-6xl font-bold flex items-center justify-center gap-2">
                {result.toLocaleString(undefined, { maximumFractionDigits: 2 })}
             </div>
             <div className="text-2xl text-blue-100 font-medium">
                {targetCurrency}
             </div>
             
             <div className="mt-4 pt-4 border-t border-blue-500/50 flex flex-col items-center">
               <div className="text-blue-200 text-sm mb-2">
                 1 {baseCurrency} = {rate.toLocaleString(undefined, { maximumFractionDigits: 4 })} {targetCurrency}
               </div>
               <CopyButton 
                 value={result.toFixed(2)} 
                 className="bg-blue-700/50 hover:bg-blue-700 text-white" 
                 iconOnly={false} 
               />
             </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
