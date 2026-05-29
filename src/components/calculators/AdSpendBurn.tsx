import React, { useState, useEffect } from 'react';
import { Flame } from 'lucide-react';
import { formatCurrency } from '../../utils/helpers';

export function AdSpendBurn() {
   const [dailyBudget, setDailyBudget] = useState<number>(100);
   const [spentSoFar, setSpentSoFar] = useState<number>(0);
   
   useEffect(() => {
      // Calculate how much should be spent so far today based on standard 24h cycle
      const updateBurn = () => {
         const now = new Date();
         const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
         const msPassed = now.getTime() - startOfDay.getTime();
         const msInDay = 24 * 60 * 60 * 1000;
         const fractionOfDay = msPassed / msInDay;
         
         const currentBurn = dailyBudget * fractionOfDay;
         setSpentSoFar(currentBurn);
      };
      
      updateBurn();
      const interval = setInterval(updateBurn, 1000); // update every second for visual effect
      return () => clearInterval(interval);
   }, [dailyBudget]);

   const burnPerMinute = dailyBudget / (24 * 60);

   return (
      <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-4 relative overflow-hidden group">
         <div className="absolute top-0 right-0 -mr-4 -mt-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <Flame className="w-32 h-32 text-red-500" />
         </div>
         <div className="relative z-10 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
               <div className="flex items-center gap-2 text-red-500 font-bold tracking-wider text-xs mb-1 uppercase">
                  <Flame className="w-4 h-4 animate-pulse" /> Live Ad Burn
               </div>
               <div className="text-3xl font-mono font-bold text-red-400">
                  {formatCurrency(spentSoFar)}
               </div>
               <div className="text-[10px] text-red-400/60 font-mono mt-1">
                  Burning {formatCurrency(burnPerMinute)} per minute
               </div>
            </div>
            
            <div className="flex flex-col gap-1 w-full sm:w-auto">
               <label className="text-[10px] text-slate-400 uppercase tracking-wider font-bold">Daily Ad Budget</label>
               <input 
                  type="number"
                  value={dailyBudget}
                  onChange={(e) => setDailyBudget(Number(e.target.value))}
                  className="bg-slate-900 border border-red-900/50 rounded-lg px-3 py-1.5 text-sm font-bold w-full sm:w-24 text-white focus:outline-none focus:border-red-500"
               />
            </div>
         </div>
         
         {/* Progress bar */}
         <div className="h-1.5 w-full bg-slate-800 rounded-full mt-4 overflow-hidden">
            <div className="h-full bg-red-500" style={{ width: `${(spentSoFar / dailyBudget) * 100}%` }}></div>
         </div>
      </div>
   );
}
