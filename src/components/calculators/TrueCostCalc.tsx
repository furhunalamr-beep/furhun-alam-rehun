import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '../ui/Card';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { Info, Save, Camera, Loader2, ChevronDown, ChevronUp, Copy, Maximize2 } from 'lucide-react';
import { formatCurrency, formatPercent, vibrate } from '../../utils/helpers';
import { useStore } from '../../store/useStore';
import { Tooltip } from '../ui/Tooltip';
import { CopyButton } from '../ui/CopyButton';
import { ProfitMarginCalc } from './ProfitMarginCalc'; // Dummy to keep imports correct just mapping
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip } from 'recharts';
import { useAutoSave } from '../../hooks/useAutoSave';
import { AdSpendBurn } from './AdSpendBurn';
import { useQuickRun } from '../../hooks/useQuickRun';

const PLATFORMS = {
  shopify: { name: 'Shopify', fee: 2.0 },
  amazon: { name: 'Amazon', fee: 15.0 },
  tiktok: { name: 'TikTok Shop', fee: 5.0 },
  custom: { name: 'Custom', fee: 0 },
};

const GATEWAYS = {
  stripe: { name: 'Stripe', pct: 2.9, fixed: 0.30 },
  paypal: { name: 'PayPal', pct: 3.49, fixed: 0.49 },
  shoppay: { name: 'Shop Pay', pct: 2.4, fixed: 0.30 },
};

export function TrueCostCalc() {
  const [sellingPrice, setSellingPrice] = useState<number>(49.99);
  const [supplierCost, setSupplierCost] = useState<number | ''>(12.50);
  const [shippingCost, setShippingCost] = useState<number | ''>(4.50);
  const [cpa, setCpa] = useState<number | ''>(15.00); 

  const [platform, setPlatform] = useState<keyof typeof PLATFORMS>('shopify');
  const [gateway, setGateway] = useState<keyof typeof GATEWAYS>('stripe');
  
  const [isScanning, setIsScanning] = useState(false);
  const [showFeeBreakdown, setShowFeeBreakdown] = useState(false);
  const [baseCurrency, setBaseCurrency] = useState('USD');
  
  const { openSaveModal } = useStore();

  useAutoSave('bizcalc-truecost-autosave', {
    sellingPrice: setSellingPrice,
    supplierCost: setSupplierCost,
    shippingCost: setShippingCost,
    cpa: setCpa,
    platform: setPlatform as any,
    gateway: setGateway as any,
    baseCurrency: setBaseCurrency
  }, { sellingPrice, supplierCost, shippingCost, cpa, platform, gateway, baseCurrency });

  const handleSaveToTape = () => {
    const p = Number(sellingPrice) || 0;
    const cMultiplier = baseCurrency === 'CNY' ? 0.14 : 1;
    const c = (Number(supplierCost) || 0) * cMultiplier;
    const s = Number(shippingCost) || 0;

    const gatewayCut = p * (GATEWAYS[gateway].pct / 100) + GATEWAYS[gateway].fixed;
    const platformCut = p * (PLATFORMS[platform].fee / 100);
    const trueFloorCost = c + s + gatewayCut + platformCut;
    const marketing = Number(cpa) || 0;
    const netProfit = p - (trueFloorCost + marketing);

    openSaveModal({
      type: 'ecom_cost',
      title: 'E-Com True Cost',
      inputs: { 'Sell Price': p, 'Supplier Base': c + s },
      results: { 'Floor Cost': trueFloorCost.toFixed(2), 'Net Profit': netProfit.toFixed(2) }
    });
  };

  useQuickRun(handleSaveToTape);

  useEffect(() => {
    const handleClear = () => {
      setSellingPrice(49.99); setSupplierCost(''); setShippingCost(''); setCpa('');
    };
    const handleQuickSave = () => handleSaveToTape();
    
    const handleAIFill = (e: Event) => {
       const detail = (e as CustomEvent).detail;
       if (detail.sellingPrice) setSellingPrice(detail.sellingPrice);
       if (detail.supplierCost) setSupplierCost(detail.supplierCost);
       if (detail.shippingCost) setShippingCost(detail.shippingCost);
       if (detail.cpa) setCpa(detail.cpa);
       vibrate([20, 20]);
    };

    window.addEventListener('clear-workspace', handleClear);
    window.addEventListener('quick-save', handleQuickSave);
    window.addEventListener('ai-fill-ecom', handleAIFill);
    return () => {
      window.removeEventListener('clear-workspace', handleClear);
      window.removeEventListener('quick-save', handleQuickSave);
      window.removeEventListener('ai-fill-ecom', handleAIFill);
    };
  }, [sellingPrice, supplierCost, shippingCost, cpa, platform, gateway, baseCurrency]);

  const handleSimulateOCR = () => {
     vibrate(50);
     setIsScanning(true);
     setTimeout(() => {
        setSupplierCost(24.50);
        setIsScanning(false);
        vibrate([50, 50]);
     }, 1500);
  };

  const p = Number(sellingPrice) || 0;
  const cMultiplier = baseCurrency === 'CNY' ? 0.14 : 1;
  const c = (Number(supplierCost) || 0) * cMultiplier;
  const s = Number(shippingCost) || 0;
  const marketing = Number(cpa) || 0;
  
  const gatewayCut = p * (GATEWAYS[gateway].pct / 100) + GATEWAYS[gateway].fixed;
  const platformCut = p * (PLATFORMS[platform].fee / 100);

  const totalHiddenFees = gatewayCut + platformCut;
  const trueFloorCost = c + s + totalHiddenFees;
  const totalCosts = trueFloorCost + marketing;
  
  const netProfit = p - totalCosts;
  const netMargin = p > 0 ? (netProfit / p) * 100 : 0;
  
  const maxCpaBreakeven = p - trueFloorCost;
  const breakevenRoas = maxCpaBreakeven > 0 ? p / maxCpaBreakeven : 0;

  const chartData = [
    { name: 'Supplier', value: c, color: '#94a3b8' },
    { name: 'Shipping', value: s, color: '#cbd5e1' },
    { name: 'Marketing', value: marketing, color: '#f59e0b' },
    { name: 'Platform', value: platformCut, color: '#3b82f6' },
    { name: 'Gateway', value: gatewayCut, color: '#8b5cf6' },
    { name: 'Profit', value: Math.max(0, netProfit), color: '#10b981' }
  ].filter(d => d.value > 0);

  const openPiP = async () => {
    if ('documentPictureInPicture' in window) {
      try {
        const pipWindow = await (window as any).documentPictureInPicture.requestWindow({
          width: 320, height: 480
        });
        pipWindow.document.body.innerHTML = `
          <div style="font-family: system-ui; padding: 20px; background: #0f172a; color: white; height: 100vh;">
             <h3 style="margin-top:0">True Cost PIP</h3>
             <div>Sell: $${p.toFixed(2)}</div>
             <div>Cost: $${totalCosts.toFixed(2)}</div>
             <div style="margin-top: 10px; font-size: 24px; color: ${netProfit > 0 ? '#10b981' : '#ef4444'}">
               Profit: $${netProfit.toFixed(2)}
             </div>
             <div style="font-size: 12px; margin-top: 20px; color: #64748b;">(Works as a live detached widget but UI sync requires full React portal in production)</div>
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
    <div className="flex flex-col h-[calc(100vh-140px)] lg:h-full max-w-7xl mx-auto lg:flex-row gap-6">
      
      {/* Central Input Column (Middle Column on Web) */}
      <div className="w-full lg:w-[45%] flex-shrink-0 flex flex-col overflow-y-auto pb-24 lg:pb-6 space-y-8 px-1 lg:px-4 lg:border-r border-slate-200 dark:border-slate-800">
         
         <div className="space-y-4">
           <div className="flex items-center justify-between">
              <div className="text-sm font-semibold text-slate-800 dark:text-slate-200">1. Select Platform & Gateway</div>
              <div className="hidden lg:flex items-center gap-2 relative group">
                 <Button onClick={async () => {
                    const url = prompt("Paste AliExpress/Supplier URL:");
                    if (url) {
                       vibrate(20);
                       const toast = (await import('react-hot-toast')).default;
                       const tid = toast.loading('AI Scraping URL...');
                       try {
                         const res = await fetch('/api/ai/scrape-url', {
                           method: 'POST',
                           headers: { 'Content-Type': 'application/json' },
                           body: JSON.stringify({ url })
                         });
                         const data = await res.json();
                         if (data.supplierCost) setSupplierCost(data.supplierCost);
                         if (data.shippingCost) setShippingCost(data.shippingCost);
                         toast.success(`Extracted: ${data.productName || 'Product'} $${data.supplierCost} + $${data.shippingCost} ship`, { id: tid });
                         vibrate([50, 50]);
                       } catch (e) {
                         toast.error('Scraping failed', { id: tid });
                       }
                    }
                 }} variant="outline" size="sm" className="h-7 text-xs font-bold border-cyan-200 dark:border-cyan-800 text-cyan-600 dark:text-cyan-400 bg-cyan-50 dark:bg-cyan-900/20 hover:bg-cyan-100 dark:hover:bg-cyan-900/40 relative overflow-hidden">
                   SCAN URL (AI)
                 </Button>
                 <Button variant="outline" size="sm" className="h-7 text-xs font-bold border-emerald-200 dark:border-emerald-800 text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20 hover:bg-emerald-100 dark:hover:bg-emerald-900/40 relative overflow-hidden">
                   BATCH CSV
                   <input 
                     type="file" 
                     accept=".csv" 
                     className="absolute inset-0 opacity-0 cursor-pointer"
                     onChange={(e) => {
                       if (e.target.files && e.target.files[0]) {
                         const file = e.target.files[0];
                         const reader = new FileReader();
                         reader.onload = async (event) => {
                           const text = (event.target?.result as string) || '';
                           const rows = text.split('\n').filter(r => r.trim());
                           
                           // Skip header, assuming columns: Product Name, Sell Price, Supplier Cost, Shipping, CPA
                           const outRows = [];
                           for (let i = 1; i < rows.length; i++) {
                             const cols = rows[i].split(',');
                             if (cols.length < 5) continue;
                             const name = cols[0];
                             const batchP = Number(cols[1]);
                             const batchC = Number(cols[2]);
                             const batchS = Number(cols[3]);
                             const batchCpa = Number(cols[4]);

                             const platformCut = batchP * (PLATFORMS[platform].fee / 100);
                             const gatewayCut = batchP * (GATEWAYS[gateway].pct / 100) + GATEWAYS[gateway].fixed;
                             const totalCosts = batchC + batchS + batchCpa + platformCut + gatewayCut;
                             const netValue = batchP - totalCosts;
                             outRows.push([name, batchP, batchC, batchS, batchCpa, platformCut.toFixed(2), gatewayCut.toFixed(2), netValue.toFixed(2)]);
                           }

                           if (outRows.length > 0) {
                              const { exportToCSV } = await import('../../utils/helpers');
                              exportToCSV('batch-products-calculated', ['Product', 'Sell', 'Supplier', 'Ship', 'CPA', 'Platform Fee', 'Gateway Fee', 'Net Profit'], outRows);
                              vibrate([50, 50]);
                           } else {
                              alert("Make sure CSV has 5 columns: Name, Sell Price, Supplier, Shipping, CPA");
                           }
                         };
                         reader.readAsText(file);
                       }
                     }}
                   />
                 </Button>
              </div>
           </div>
           <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
             {Object.entries(PLATFORMS).map(([key, val]) => (
                <button
                  key={key}
                  onClick={() => { vibrate(20); setPlatform(key as any); }}
                  className={`py-2 px-3 text-xs font-semibold rounded-lg border transition-all ${platform === key ? 'bg-blue-600 border-blue-600 text-white shadow-md shadow-blue-500/20' : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'}`}
                >
                  {val.name}
                </button>
             ))}
           </div>
           <div className="grid grid-cols-3 gap-2">
             {Object.entries(GATEWAYS).map(([key, val]) => (
                <button
                  key={key}
                  onClick={() => { vibrate(20); setGateway(key as any); }}
                  className={`py-2 px-3 text-xs font-semibold rounded-lg border transition-all ${gateway === key ? 'bg-indigo-600 border-indigo-600 text-white shadow-md shadow-indigo-500/20' : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'}`}
                >
                  {val.name}
                </button>
             ))}
           </div>
         </div>

         <div className="space-y-4">
            <div className="text-sm font-semibold text-slate-800 dark:text-slate-200">2. Enter Costs</div>
            <div className="grid grid-cols-2 gap-4">
               <div>
                 <Input
                    label="Supplier Cost"
                    type="number"
                    prefix={
                       <button 
                         onClick={() => setBaseCurrency(c => c === 'USD' ? 'CNY' : 'USD')}
                         className="flex items-center text-xs font-bold text-blue-600 dark:text-blue-400 h-full px-2"
                       >
                         {baseCurrency === 'USD' ? '🇺🇸' : '🇨🇳'}
                       </button>
                    }
                    value={supplierCost}
                    onChange={(e) => setSupplierCost(e.target.value === '' ? '' : Number(e.target.value))}
                    actionIcon={isScanning ? <Loader2 className="w-4 h-4 animate-spin text-blue-500" /> : <Camera className="w-4 h-4" />}
                    onActionClick={handleSimulateOCR}
                 />
                 {baseCurrency === 'CNY' && (
                    <div className="text-[10px] text-slate-500 mt-1 ml-1 px-2 border-l-2 border-slate-300 dark:border-slate-700">≈ {formatCurrency(c)} USD</div>
                 )}
               </div>
               <Input
                  label="Shipping Cost"
                  type="number"
                  prefix="$"
                  value={shippingCost}
                  onChange={(e) => setShippingCost(e.target.value === '' ? '' : Number(e.target.value))}
               />
            </div>
            <Input
               label="Est. Marketing Cost (CPA)"
               type="number"
               prefix="$"
               value={cpa}
               onChange={(e) => setCpa(e.target.value === '' ? '' : Number(e.target.value))}
               placeholder="How much to get 1 sale?"
            />
         </div>

         <div className="p-4 bg-blue-50 dark:bg-blue-900/10 rounded-2xl border border-blue-100 dark:border-blue-800 relative xl:-mr-8">
            <div className="flex justify-between items-center mb-4">
               <div className="text-sm font-semibold text-blue-900 dark:text-blue-200">3. Target Selling Price</div>
               <CopyButton value={sellingPrice.toFixed(2)} className="text-blue-600" />
            </div>
            <div className="flex items-center gap-4">
               <span className="text-xl font-bold text-slate-400">$</span>
               <input
                 type="number"
                 className="flex-1 bg-transparent border-b-2 border-blue-200 dark:border-blue-800 focus:border-blue-600 text-3xl font-bold text-slate-900 dark:text-white outline-none py-1 w-full"
                 value={sellingPrice}
                 onChange={(e) => setSellingPrice(Number(e.target.value))}
               />
            </div>
            
            <div className="mt-6">
               <div className="flex justify-between text-xs text-blue-600 dark:text-blue-400 mb-2 font-medium">
                 <span>"What-If" Adjust Price slider</span>
                 <span>{formatCurrency(sellingPrice)}</span>
               </div>
               <Input
                  type="range"
                  min="1"
                  max="200"
                  step="0.5"
                  value={sellingPrice}
                  onChange={(e) => setSellingPrice(Number(e.target.value))}
                  className="w-full"
               />
            </div>
         </div>

      </div>

      {/* Right Result Column (Mobile Top, Desktop Right) */}
      <div className="w-full lg:w-[55%] flex-1 bg-slate-900 md:rounded-3xl rounded-b-3xl text-white overflow-y-auto pb-6 relative z-10 shadow-xl border-t-0 md:border md:border-slate-800 -mx-4 lg:mx-0 px-4 md:px-0 lg:mt-0 pt-6 order-first lg:order-last">
         <div className="p-6 space-y-6">
            <div className="flex items-center justify-between">
              <div className="text-slate-400 font-medium uppercase tracking-wider text-xs flex items-center gap-2">
                 Real-Time Breakdown
                 <button className="hidden lg:flex items-center justify-center p-1 bg-slate-800 rounded hover:bg-slate-700 text-slate-400 hover:text-white" onClick={openPiP} title="Pop out Calculator (PiP)">
                    <Maximize2 className="w-3 h-3" />
                 </button>
              </div>
              <Button variant="outline" size="sm" onClick={handleSaveToTape} className="text-white border-slate-700 hover:bg-slate-800 h-8 text-xs font-bold tracking-widest hidden lg:flex">
                SAVE (CTRL+S)
              </Button>
            </div>

            <div className="flex flex-col xl:flex-row gap-6">
              <div className="flex-1 space-y-4">
                <div className="flex justify-between items-center text-lg">
                   <span className="text-slate-300">Gross Revenue:</span>
                   <span className="font-semibold">{formatCurrency(p)}</span>
                </div>
                
                <div 
                  className="bg-slate-800/50 rounded-xl p-4 cursor-pointer outline-none transition-colors hover:bg-slate-800 border border-slate-700/50"
                  onClick={() => setShowFeeBreakdown(!showFeeBreakdown)}
                >
                   <div className="flex justify-between items-center text-lg">
                     <span className="text-red-300 flex items-center gap-2">
                       Costs & Fees {showFeeBreakdown ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                     </span>
                     <span className="font-medium text-red-400">-{formatCurrency(totalCosts)}</span>
                   </div>
                   
                   {showFeeBreakdown && (
                     <div className="mt-4 pt-4 border-t border-slate-700 space-y-2 text-sm text-slate-400">
                        <div className="flex justify-between">
                          <span>Supplier & Shipping</span>
                          <span>{formatCurrency(c + s)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Marketing (CPA)</span>
                          <span>{formatCurrency(marketing)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Platform ({PLATFORMS[platform].name})</span>
                          <span>{formatCurrency(platformCut)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Gateway ({GATEWAYS[gateway].name})</span>
                          <span>{formatCurrency(gatewayCut)}</span>
                        </div>
                     </div>
                   )}
                </div>
              </div>

              {/* Chart section - hidden on mobile, visible on lg+ screens */}
              <div className="hidden xl:flex w-48 h-48 items-center justify-center relative">
                 {totalCosts > 0 && (
                   <ResponsiveContainer width="100%" height="100%">
                     <PieChart>
                       <Pie data={chartData} innerRadius={40} outerRadius={70} paddingAngle={2} dataKey="value" stroke="none">
                         {chartData.map((entry, index) => (
                           <Cell key={`cell-${index}`} fill={entry.color} />
                         ))}
                       </Pie>
                       <RechartsTooltip 
                         formatter={(value: number) => formatCurrency(value)}
                         contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', color: '#fff' }}
                         itemStyle={{ color: '#fff' }}
                       />
                     </PieChart>
                   </ResponsiveContainer>
                 )}
              </div>
            </div>

            <div className="pt-4 space-y-4 border-t border-slate-800">
               <div className="flex justify-between items-end">
                 <div>
                    <div className="text-slate-400 text-sm mb-1">Net Profit</div>
                    <div className="text-4xl font-bold flex items-center gap-3">
                      <span className={netProfit > 0 ? "text-emerald-400" : "text-red-500"}>
                        {netProfit > 0 ? '+' : ''}{formatCurrency(netProfit)}
                      </span>
                      <CopyButton value={netProfit.toFixed(2)} className="bg-slate-800 hover:bg-slate-700 text-white" />
                    </div>
                 </div>
                 <div className="text-right">
                    <div className="text-slate-400 text-sm mb-1">Margin</div>
                    <div className={`text-xl font-medium ${netMargin > 0 ? "text-emerald-500" : "text-red-500"}`}>
                      {netMargin.toFixed(1)}%
                    </div>
                 </div>
               </div>
               
               {netProfit > 0 && (
                  <div className="bg-emerald-900/20 border border-emerald-800/50 rounded-xl p-3 flex flex-col gap-2">
                     <div className="flex justify-between items-center text-[11px] font-bold tracking-wider uppercase text-emerald-500">
                        <span>"What-If" Wealth Simulator</span>
                     </div>
                     <div className="text-xs text-emerald-300">
                        If you sell 10 of these per day and invest 100% of profit at 8% APY for 5 years: <br/>
                        <span className="font-mono text-emerald-400 font-bold text-sm mt-1 block">{(10 * netProfit * 365 * 5.8666).toLocaleString('en-US', { style: 'currency', currency: 'USD' })}</span>
                     </div>
                  </div>
               )}
            </div>

            <div className="bg-blue-900/20 border border-blue-800/50 rounded-xl p-4 flex justify-between items-center text-sm mt-4">
               <span className="text-blue-200">Break-Even ROAS Target:</span>
               <span className="text-blue-400 font-bold text-lg">{breakevenRoas > 0 ? `${breakevenRoas.toFixed(2)}x` : 'N/A'}</span>
            </div>

            <div className="pt-4 border-t border-slate-800 mt-4">
               <AdSpendBurn />
            </div>
         </div>
      </div>

    </div>
  );
}
