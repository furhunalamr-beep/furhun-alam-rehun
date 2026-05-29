import React from 'react';
import { useStore } from '../../store/useStore';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';
import { Activity, ShoppingCart, Briefcase, History, ChevronRight, Percent, Building } from 'lucide-react';
import { formatCurrency } from '../../utils/helpers';
import { navigation } from '../layout/AppLayout';
import { DailyProfitWidget } from './DailyProfitWidget';

export function HomeDashboard({ setActiveModule }: { setActiveModule: (mod: string) => void }) {
  const { historyTape } = useStore();

  const recentItems = historyTape.slice(0, 3);
  
  const navigateToModule = (compId: string) => {
     setActiveModule(compId);
     // Note: Hydration of past state logic goes here
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto pb-6">
      <div className="space-y-2">
         <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Dashboard</h1>
         <p className="text-slate-500 text-sm">Welcome back to BizCalc Pro. Choose a module or review recent activity.</p>
      </div>

      <DailyProfitWidget />
      
      <div className="space-y-3">
        <h3 className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest pl-1">Quick Launch</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <button 
            onClick={() => navigateToModule('margin')}
            className="flex items-center gap-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-3 rounded-xl hover:border-blue-500 dark:hover:border-blue-500 transition-all hover:bg-blue-50 dark:hover:bg-blue-900/10 group shadow-sm"
          >
            <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg text-blue-600 dark:text-blue-400 group-hover:scale-110 transition-transform">
              <Percent className="w-5 h-5" />
            </div>
            <div className="text-left">
              <div className="text-xs font-bold text-slate-900 dark:text-slate-100">Profit & Pricing</div>
              <div className="text-[10px] text-slate-500">Determine margins</div>
            </div>
          </button>

          <button 
            onClick={() => navigateToModule('position_size')}
            className="flex items-center gap-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-3 rounded-xl hover:border-emerald-500 dark:hover:border-emerald-500 transition-all hover:bg-emerald-50 dark:hover:bg-emerald-900/10 group shadow-sm"
          >
            <div className="p-2 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg text-emerald-600 dark:text-emerald-400 group-hover:scale-110 transition-transform">
              <Activity className="w-5 h-5" />
            </div>
            <div className="text-left">
              <div className="text-xs font-bold text-slate-900 dark:text-slate-100">Position Size</div>
              <div className="text-[10px] text-slate-500">Manage risk</div>
            </div>
          </button>

          <button 
            onClick={() => navigateToModule('loan')}
            className="flex items-center gap-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-3 rounded-xl hover:border-purple-500 dark:hover:border-purple-500 transition-all hover:bg-purple-50 dark:hover:bg-purple-900/10 group shadow-sm"
          >
            <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg text-purple-600 dark:text-purple-400 group-hover:scale-110 transition-transform">
              <Building className="w-5 h-5" />
            </div>
            <div className="text-left">
              <div className="text-xs font-bold text-slate-900 dark:text-slate-100">Amortization</div>
              <div className="text-[10px] text-slate-500">Loan schedules</div>
            </div>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {navigation
          .filter(g => g.category !== 'Dashboard')
          .filter(g => {
            if (useStore.getState().appMode === 'dropshipping') return g.category !== 'Trading & Markets';
            if (useStore.getState().appMode === 'trading') return g.category !== 'E-Commerce & Dropship';
            return true;
          })
          .map((group, idx) => {
          const colors = ['bg-blue-500/10 text-blue-600 dark:text-blue-400', 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400', 'bg-purple-500/10 text-purple-600 dark:text-purple-400', 'bg-orange-500/10 text-orange-600 dark:text-orange-400'];
          const Icon = group.items[0].icon;
          return (
             <Card 
               key={group.category} 
               onClick={() => navigateToModule(group.items[0].id)}
               className="group cursor-pointer hover:shadow-lg transition-all hover:-translate-y-1 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800"
             >
               <CardContent className="p-4 flex flex-col items-center justify-center text-center space-y-3 min-h-[120px]">
                 <div className={`p-3 rounded-2xl ${colors[idx % colors.length]}`}>
                    <Icon className="w-6 h-6" />
                 </div>
                 <div className="text-sm font-semibold text-slate-800 dark:text-slate-200">{group.category}</div>
               </CardContent>
             </Card>
          );
        })}
      </div>

      <div className="bg-slate-900 dark:bg-slate-950 rounded-2xl p-6 text-white shadow-xl border border-slate-800">
         <div className="flex items-center gap-2 mb-6">
            <History className="w-5 h-5 text-blue-400" />
            <h2 className="text-lg font-bold">Recent Activity</h2>
         </div>
         
         <div className="space-y-3">
            {recentItems.length === 0 ? (
               <div className="text-center py-8 text-slate-500 text-sm">No recent calculations yet. Start calculating to see activity here.</div>
            ) : (
               recentItems.map(item => (
                  <div 
                    key={item.id} 
                    onClick={() => navigateToModule(item.type)}
                    className="bg-slate-800/50 hover:bg-slate-800 transition-colors border border-slate-700/50 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between group cursor-pointer gap-4"
                  >
                     <div className="flex items-center gap-4">
                        <div className="bg-slate-700 p-2.5 rounded-lg shrink-0 text-slate-300 group-hover:text-white transition-colors">
                           {item.type === 'ecom_cost' ? <ShoppingCart className="w-5 h-5" /> : 
                            item.type === 'position_size' ? <Activity className="w-5 h-5" /> : 
                            <Briefcase className="w-5 h-5" />}
                        </div>
                        <div>
                           <div className="font-semibold text-slate-200 mb-0.5">{item.title}</div>
                           <div className="text-xs text-slate-400 flex items-center gap-2">
                              <span>{new Date(item.timestamp).toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'})}</span>
                              {item.tags && item.tags.length > 0 && (
                                 <div className="flex items-center gap-1">
                                    <span className="opacity-50">•</span>
                                    <span className="text-blue-400">{item.tags[0]}</span>
                                 </div>
                              )}
                           </div>
                        </div>
                     </div>
                     <div className="flex items-center justify-between sm:justify-end gap-6 sm:w-1/3">
                        <div className="text-sm font-mono text-emerald-400">
                           {/* Quick preview of main result */}
                           {Object.entries(item.results)[0] && (
                              <span>{Object.entries(item.results)[0][0]}: <span className="font-bold text-white">{
                                 typeof Object.entries(item.results)[0][1] === 'number' 
                                  ? (Object.entries(item.results)[0][0].includes('%') ? `${Object.entries(item.results)[0][1]}%` : `${Object.entries(item.results)[0][1].toLocaleString()}`)
                                  : Object.entries(item.results)[0][1]
                              }</span></span>
                           )}
                        </div>
                        <ChevronRight className="w-5 h-5 text-slate-600 group-hover:text-slate-400 transition-colors" />
                     </div>
                  </div>
               ))
            )}
         </div>
      </div>

      <div className="bg-slate-900 border border-emerald-900/50 rounded-2xl p-6 text-white shadow-xl mt-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-6 opacity-10">
             <Briefcase className="w-24 h-24 text-emerald-400" />
          </div>
          <div className="flex items-center gap-2 mb-6 relative z-10">
             <Briefcase className="w-5 h-5 text-emerald-400" />
             <h2 className="text-lg font-bold">Community Templates & Blueprints</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 relative z-10">
             {useStore.getState().appMode !== 'trading' && (
               <div onClick={() => navigateToModule('ecom_cost')} className="bg-slate-800/80 hover:bg-slate-800 p-4 rounded-xl border border-emerald-500/20 cursor-pointer group transition-colors">
                  <div className="flex justify-between items-start mb-2">
                      <span className="text-emerald-400 font-bold text-sm tracking-wider uppercase">Dropshipping</span>
                      <span className="text-[10px] text-slate-400 font-bold bg-slate-900 border border-slate-700 px-2 py-0.5 rounded">#1 Trending</span>
                  </div>
                  <div className="font-bold text-white mb-1 group-hover:text-emerald-300 transition-colors">2026 TikTok Sourcing Blueprint</div>
                  <div className="text-xs text-slate-400">Pre-loads optimal CPA parameters, 30% margin goals, and standard global shipping targets.</div>
               </div>
             )}

             {useStore.getState().appMode !== 'dropshipping' && (
               <div onClick={() => navigateToModule('position_size')} className="bg-slate-800/80 hover:bg-slate-800 p-4 rounded-xl border border-cyan-500/20 cursor-pointer group transition-colors">
                  <div className="flex justify-between items-start mb-2">
                      <span className="text-cyan-400 font-bold text-sm tracking-wider uppercase">Trading</span>
                      <span className="text-[10px] text-slate-400 font-bold bg-slate-900 border border-slate-700 px-2 py-0.5 rounded">New</span>
                  </div>
                  <div className="font-bold text-white mb-1 group-hover:text-cyan-300 transition-colors">ICT Silver Bullet Risk Matrix</div>
                  <div className="text-xs text-slate-400">Locks your risk tolerance at 0.5% with pre-set standard take-profit intervals at 1:2 and 1:3.</div>
               </div>
             )}
          </div>
      </div>

    </div>
  );
}
