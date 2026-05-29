import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '../ui/Card';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { ShieldCheck, LayoutGrid, Maximize2, Save, Copy } from 'lucide-react';
import { formatCurrency, vibrate } from '../../utils/helpers';
import { useStore } from '../../store/useStore';
import { CopyButton } from '../ui/CopyButton';
import { useAutoSave } from '../../hooks/useAutoSave';
import { useQuickRun } from '../../hooks/useQuickRun';

export function PositionSizeCalc({ instanceId = 1, onToggleGrid, gridCount = 1 }: { instanceId?: number, onToggleGrid?: () => void, gridCount?: number }) {
  const [accountBalance, setAccountBalance] = useState<number>(10000);
  const [riskPercent, setRiskPercent] = useState<number>(1);
  
  const [entryPrice, setEntryPrice] = useState<number | ''>('');
  const [stopLossInput, setStopLossInput] = useState<number | ''>('');
  
  const [slMode, setSlMode] = useState<'price' | 'percent'>('price');
  const [unitMode, setUnitMode] = useState<'units' | 'lots'>('units');
  const [isLong, setIsLong] = useState(true);
  const [followedPlan, setFollowedPlan] = useState<boolean>(false);

  const { openSaveModal, disciplineScore, addDisciplineScore } = useStore();

  useAutoSave(`bizcalc-position-autosave-${instanceId}`, {
    accountBalance: setAccountBalance,
    riskPercent: setRiskPercent,
    entryPrice: setEntryPrice,
    stopLossInput: setStopLossInput,
    slMode: setSlMode as any,
    unitMode: setUnitMode as any,
    isLong: setIsLong
  }, { accountBalance, riskPercent, entryPrice, stopLossInput, slMode, unitMode, isLong });

  const handleSaveToTape = () => {
    const balance = Number(accountBalance) || 0;
    const riskP = Number(riskPercent) || 0;
    const entry = Number(entryPrice) || 0;
    const slRaw = Number(stopLossInput) || 0;
    
    // Quick calculate slPrice for tape
    let slPrice = 0;
    if (entry > 0) {
      if (slMode === 'price') slPrice = slRaw;
      else slPrice = isLong ? entry * (1 - slRaw / 100) : entry * (1 + slRaw / 100);
    }

    const priceDiff = Math.abs(entry - slPrice);
    const riskAmountUsd = balance * (riskP / 100);
    const positionSizeUnits = priceDiff > 0 ? riskAmountUsd / priceDiff : 0;

    openSaveModal({
      type: 'position_size',
      title: 'Trading Position Size',
      inputs: { 'Balance': balance, 'Risk %': riskP, 'Entry': entry, 'SL': slPrice },
      results: { 'Units': positionSizeUnits.toFixed(4), 'Risk Amount': riskAmountUsd }
    });
  };

  useQuickRun(handleSaveToTape);

  useEffect(() => {
    const handleClear = () => {
      setEntryPrice(''); setStopLossInput('');
    };
    const handleQuickSave = () => handleSaveToTape();
    const handleKeyShortcut = (e: KeyboardEvent) => {
       // Only if no input is focused
       if (document.activeElement?.tagName === 'INPUT') return;
       
       if (['1', '2', '3'].includes(e.key)) {
         setRiskPercent(Number(e.key));
         vibrate(20);
       }
    };
    
    const handleAIFill = (e: Event) => {
       const detail = (e as CustomEvent).detail;
       if (detail.accountBalance) setAccountBalance(detail.accountBalance);
       if (detail.riskPercent) setRiskPercent(detail.riskPercent);
       if (detail.entryPrice) setEntryPrice(detail.entryPrice);
       if (detail.stopLossInput) {
          setStopLossInput(detail.stopLossInput);
          setSlMode('price');
       }
       vibrate([20, 20]);
    };

    window.addEventListener('clear-workspace', handleClear);
    window.addEventListener('quick-save', handleQuickSave);
    window.addEventListener('keydown', handleKeyShortcut);
    window.addEventListener('ai-fill-position', handleAIFill);
    return () => {
      window.removeEventListener('clear-workspace', handleClear);
      window.removeEventListener('quick-save', handleQuickSave);
      window.removeEventListener('keydown', handleKeyShortcut);
      window.removeEventListener('ai-fill-position', handleAIFill);
    };
  }, [accountBalance, riskPercent, entryPrice, stopLossInput, slMode, unitMode, isLong]);

  const balance = Number(accountBalance) || 0;
  const riskP = Number(riskPercent) || 0;
  const entry = Number(entryPrice) || 0;
  const slRaw = Number(stopLossInput) || 0;

  // Determine actual Stop Loss Price
  let slPrice = 0;
  if (entry > 0) {
    if (slMode === 'price') {
      slPrice = slRaw;
      if (slPrice > 0 && slPrice !== entry) {
         if (isLong && slPrice > entry) setIsLong(false);
         if (!isLong && slPrice < entry) setIsLong(true);
      }
    } else {
      // Percent mode
      slPrice = isLong ? entry * (1 - slRaw / 100) : entry * (1 + slRaw / 100);
    }
  }

  const riskAmountUsd = balance * (riskP / 100);
  const priceDiff = Math.abs(entry - slPrice);
  
  const positionSizeUnits = priceDiff > 0 ? riskAmountUsd / priceDiff : 0;
  
  // Calculate display size
  const displaySize = unitMode === 'lots' ? positionSizeUnits / 100000 : positionSizeUnits;

  const getTarget = (ratio: number) => {
    if (entry === 0 || priceDiff === 0) return { price: 0, profit: 0 };
    const reward = priceDiff * ratio;
    return {
       price: isLong ? entry + reward : entry - reward,
       profit: riskAmountUsd * ratio
    };
  };

  const openPiP = async () => {
    if ('documentPictureInPicture' in window) {
      try {
        const pipWindow = await (window as any).documentPictureInPicture.requestWindow({
          width: 340, height: 420
        });
        pipWindow.document.body.innerHTML = `
          <div style="font-family: monospace; padding: 20px; background: #020617; color: white; height: 100vh;">
             <h3 style="margin-top:0; color:#94a3b8">Position Size PIP</h3>
             <div style="font-size: 32px; color: #2dd4bf; margin: 20px 0;">${displaySize > 0 ? displaySize.toLocaleString(undefined, { maximumFractionDigits: 4 }) : '0.00'}</div>
             <div style="color:#64748b">Units / Lots: ${unitMode.toUpperCase()}</div>
             <div style="color:#64748b">Risk: $${riskAmountUsd.toFixed(2)}</div>
             <div style="margin-top:20px; padding-top:20px; border-top:1px solid #1e293b;">
               <b>Direction:</b> <span style="color: ${isLong ? '#34d399' : '#f87171'}">${isLong ? 'LONG BUY' : 'SHORT SELL'}</span>
             </div>
          </div>
        `;
      } catch (err) {
        console.error(err);
      }
    } else {
      alert("Picture-in-Picture not supported in this browser.");
    }
  };

  return (
    <div className={`flex flex-col max-w-7xl mx-auto lg:flex-row gap-6 ${gridCount > 1 ? 'h-full' : 'h-[calc(100vh-140px)] lg:h-full'}`}>
      
      {/* Central Input Column (Middle Column on Web) */}
      <div className={`w-full ${gridCount > 1 ? 'lg:w-1/2' : 'lg:w-[45%]'} flex-shrink-0 flex flex-col overflow-y-auto pb-24 lg:pb-6 space-y-8 px-1 lg:px-4 lg:border-r border-slate-200 dark:border-slate-800`}>
         
         <div className="space-y-4">
           <div className="text-sm font-semibold text-slate-800 dark:text-slate-200">1. Account Configuration</div>
           <Input
              label="Account Balance"
              type="number"
              prefix="$"
              value={accountBalance}
              onChange={(e) => setAccountBalance(Number(e.target.value))}
           />
           
           <div>
              <div className="text-xs text-slate-500 mb-2 font-medium uppercase tracking-wider">Risk Amount <span className="hidden lg:inline normal-case opacity-50 ml-2">(Keys: 1, 2, 3)</span></div>
              <div className="flex gap-2">
                 {[0.5, 1, 2, 5].map(pct => (
                    <button
                      key={pct}
                      onClick={() => { vibrate(20); setRiskPercent(pct); }}
                      className={`flex-1 py-3 px-2 text-sm font-bold rounded-xl border transition-all ${riskPercent === pct ? 'bg-slate-900 border-slate-900 text-white dark:bg-white dark:border-white dark:text-slate-900 shadow-md' : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300'}`}
                    >
                      {pct}%
                    </button>
                 ))}
                 <div className="flex-1 relative">
                    <input
                      type="number"
                      placeholder="Custom"
                      className={`w-full h-full py-3 px-2 text-sm font-bold rounded-xl border transition-all text-center outline-none ${(![0.5, 1, 2, 5].includes(riskPercent)) ? 'bg-slate-900 border-slate-900 text-white dark:bg-white dark:border-white dark:text-slate-900 shadow-md' : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300'}`}
                      value={(![0.5, 1, 2, 5].includes(riskPercent)) ? riskPercent : ''}
                      onChange={(e) => setRiskPercent(Number(e.target.value))}
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold opacity-50">%</span>
                 </div>
              </div>
           </div>
         </div>

         <div className="space-y-4">
            <div className="text-sm font-semibold text-slate-800 dark:text-slate-200">2. Trade Setup</div>
            
            <div className="bg-slate-50 dark:bg-slate-900/40 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-4">
               <div>
                  <div className="flex justify-between items-center mb-1">
                     <span className="text-xs font-medium uppercase text-slate-500">Direction</span>
                  </div>
                  <div className="flex bg-white dark:bg-slate-950 rounded-lg p-1 border border-slate-200 dark:border-slate-800">
                     <button onClick={() => { setIsLong(true); vibrate(20); }} className={`flex-1 py-2 text-sm font-bold rounded-md transition-colors ${isLong ? 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400' : 'text-slate-500'}`}>LONG</button>
                     <button onClick={() => { setIsLong(false); vibrate(20); }} className={`flex-1 py-2 text-sm font-bold rounded-md transition-colors ${!isLong ? 'bg-red-500/20 text-red-600 dark:text-red-400' : 'text-slate-500'}`}>SHORT</button>
                  </div>
               </div>
               
               <Input
                  label="Entry Price"
                  type="number"
                  prefix="$"
                  value={entryPrice}
                  onChange={(e) => setEntryPrice(e.target.value === '' ? '' : Number(e.target.value))}
                  className="bg-white dark:bg-slate-950 font-mono font-bold text-lg"
               />
               
               <div className="relative">
                  <Input
                     label="Stop Loss"
                     type="number"
                     prefix={slMode === 'price' ? "$" : undefined}
                     suffix={slMode === 'percent' ? "%" : undefined}
                     value={stopLossInput}
                     onChange={(e) => setStopLossInput(e.target.value === '' ? '' : Number(e.target.value))}
                     className="bg-white dark:bg-slate-950 font-mono font-bold text-lg"
                  />
                  <div className="absolute right-0 top-0 -mt-1 flex bg-slate-200 dark:bg-slate-800 rounded-md p-0.5">
                     <button onClick={() => setSlMode('price')} className={`px-2 py-0.5 text-[10px] font-bold rounded-sm transition-colors ${slMode === 'price' ? 'bg-white dark:bg-slate-600 shadow-sm' : 'text-slate-500'}`}>PRICE</button>
                     <button onClick={() => setSlMode('percent')} className={`px-2 py-0.5 text-[10px] font-bold rounded-sm transition-colors ${slMode === 'percent' ? 'bg-white dark:bg-slate-600 shadow-sm' : 'text-slate-500'}`}>% DIST</button>
                  </div>
               </div>
            </div>
         </div>
         
      </div>

      {/* Right Result Column (Mobile Top, Desktop Right) */}
      <div className={`w-full ${gridCount > 1 ? 'lg:w-1/2' : 'lg:w-[55%]'} flex-shrink-0 bg-slate-950 md:rounded-3xl rounded-b-3xl text-white overflow-y-auto pb-6 relative z-10 shadow-xl border-t-0 md:border md:border-slate-800 -mx-4 lg:mx-0 px-4 md:px-0 lg:mt-0 pt-6 order-first lg:order-last`}>
         {/* Terminal aesthetic grid pattern background */}
         <div className="absolute inset-0 opacity-[0.05] pointer-events-none" style={{ backgroundImage: 'linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)', backgroundSize: '20px 20px' }}></div>
         
         <div className="p-6 space-y-6 relative z-10">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div className="flex items-center gap-3">
                 <div className="text-slate-400 font-bold uppercase tracking-wider text-xs">Trade Ticket</div>
                 {entry > 0 && priceDiff > 0 && (
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-sm ${isLong ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'}`}>
                      {isLong ? 'LONG BUY' : 'SHORT SELL'}
                    </span>
                 )}
                 <button className="hidden lg:flex items-center justify-center p-1 bg-slate-800 rounded hover:bg-slate-700 text-slate-400 hover:text-white" onClick={openPiP} title="Pop out Calculator (PiP)">
                    <Maximize2 className="w-3 h-3" />
                 </button>
                 <button className="hidden lg:flex items-center justify-center p-1 bg-slate-800 rounded hover:bg-slate-700 text-slate-400 hover:text-white" onClick={onToggleGrid} title="Screen Splitter (Multi-Asset)">
                    <LayoutGrid className="w-3 h-3" />
                    {gridCount > 1 && <span className="text-[9px] font-bold ml-1">{gridCount}x</span>}
                 </button>
              </div>
              <Button variant="outline" size="sm" onClick={handleSaveToTape} className="text-white border-slate-700 hover:bg-slate-800 h-8 text-xs font-bold tracking-widest hidden lg:flex">
                SAVE (CTRL+S)
              </Button>
            </div>

            <div className="space-y-2">
               <div className="flex justify-between items-center text-sm font-medium">
                  <span className="text-slate-400">Position Size ({unitMode === 'lots' ? 'Lots' : 'Units'})</span>
                  <div className="flex bg-slate-900 rounded-lg p-1 border border-slate-800">
                     <button onClick={() => setUnitMode('units')} className={`px-3 py-1 text-[10px] font-bold uppercase rounded-md transition-colors ${unitMode === 'units' ? 'bg-slate-700 text-white' : 'text-slate-500'}`}>Units</button>
                     <button onClick={() => setUnitMode('lots')} className={`px-3 py-1 text-[10px] font-bold uppercase rounded-md transition-colors ${unitMode === 'lots' ? 'bg-slate-700 text-white' : 'text-slate-500'}`}>Lots</button>
                  </div>
               </div>
               
               <div className="mt-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-slate-900/50 p-4 rounded-xl border border-slate-800/50">
                 <div className="text-5xl font-mono text-cyan-400 font-bold">
                   {displaySize === 0 || !isFinite(displaySize) ? '0.00' : displaySize.toLocaleString(undefined, { maximumFractionDigits: 4 })}
                 </div>
                 
                 <Button 
                   onClick={() => {
                      navigator.clipboard.writeText(displaySize.toString());
                      vibrate([30, 30]);
                   }}
                   className="w-full lg:w-auto h-12 bg-blue-600 hover:bg-blue-700 text-white font-bold tracking-wider text-sm rounded-xl flex items-center justify-center gap-2 px-6"
                 >
                   <Copy className="w-4 h-4" /> COPY SIZE
                 </Button>
               </div>
            </div>

            <div className="pt-6 space-y-4">
               <div className="text-slate-400 text-xs font-bold uppercase tracking-wider">Take Profit Targets (R:R)</div>
               
               <div className="bg-slate-900/80 rounded-xl border border-slate-800/80 divide-y divide-slate-800/50 overflow-hidden">
                  {[1, 2, 3, 4, 5].map(ratio => {
                     const target = getTarget(ratio);
                     return (
                        <div key={ratio} className="p-3 px-4 flex items-center justify-between hover:bg-slate-800/50 transition-colors">
                           <div className="flex items-center gap-4">
                              <span className="text-slate-500 font-mono text-sm w-12">1:{ratio}</span>
                              <span className="font-mono text-emerald-400 font-medium">
                                 {target.price > 0 ? target.price.toLocaleString(undefined, { maximumFractionDigits: 5 }) : '---'}
                              </span>
                           </div>
                           <div className="flex items-center gap-3">
                              <span className="text-slate-400 text-sm">+{formatCurrency(target.profit)}</span>
                              {target.price > 0 && <CopyButton value={target.price.toString()} className="text-slate-500 hover:text-white" iconOnly />}
                           </div>
                        </div>
                     );
                  })}
               </div>
            </div>
            
            <div className="pt-2 flex justify-between text-sm">
               <span className="text-slate-500">Max Risk:</span>
               <span className="text-red-400 font-semibold">{formatCurrency(riskAmountUsd)}</span>
            </div>

            <div className="pt-6 border-t border-slate-800">
               <div className="flex items-center justify-between">
                  <div>
                    <div className="text-xs font-bold text-slate-400 flex items-center gap-2 uppercase tracking-wider mb-1"><ShieldCheck className="w-4 h-4 text-emerald-500" /> Trading Discipline Score</div>
                     <div className="text-[10px] text-slate-500">Check if you stuck to your risk rule.</div>
                  </div>
                  <div className="flex flex-col items-end">
                     <span className="text-lg font-bold text-emerald-400">{disciplineScore} pts</span>
                     {followedPlan ? (
                        <div className="text-[10px] text-slate-400 font-bold px-2 border border-slate-700 bg-slate-800 rounded">Awarded!</div>
                     ) : (
                        <button 
                          onClick={() => {
                             setFollowedPlan(true);
                             addDisciplineScore(10);
                             vibrate([10, 50, 10]);
                             import('react-hot-toast').then(toast => toast.default.success('+10 Discipline Points!'));
                          }}
                          className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-xs font-bold transition-colors"
                        >
                           I STUCK TO MY PLAN
                        </button>
                     )}
                  </div>
               </div>
            </div>
         </div>
      </div>

    </div>
  );
}

