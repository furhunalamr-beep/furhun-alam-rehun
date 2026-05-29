import React from 'react';
import { ShoppingCart, Activity, Briefcase } from 'lucide-react';
import { useStore } from '../../store/useStore';
import { cn } from '../../utils/cn';

export function ModeSelectionScreen() {
  const { setAppMode } = useStore();

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center p-4">
       <div className="max-w-4xl w-full">
          
          <div className="text-center mb-12">
             <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-blue-100 dark:bg-blue-900/50 mb-6 shadow-sm">
                <Briefcase className="w-8 h-8 text-blue-600 dark:text-blue-400" />
             </div>
             <h1 className="text-4xl sm:text-5xl font-extrabold text-slate-900 dark:text-white tracking-tight mb-4">
                Choose Your Workspace
             </h1>
             <p className="text-lg text-slate-500 dark:text-slate-400 max-w-xl mx-auto">
                Tailor BizCalc Pro to your exact needs. You can always change this later in settings.
             </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
             
             {/* Dropshipping Mode */}
             <button 
                onClick={() => setAppMode('dropshipping')}
                className="group relative bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 rounded-3xl p-8 hover:border-cyan-500 dark:hover:border-cyan-500 transition-all duration-300 hover:shadow-2xl hover:-translate-y-1 text-left overflow-hidden flex flex-col items-start justify-between min-h-[320px]"
             >
                <div className="absolute top-0 right-0 -mt-10 -mr-10 opacity-5 group-hover:opacity-10 transition-opacity">
                   <ShoppingCart className="w-64 h-64 text-cyan-500" />
                </div>
                <div className="relative z-10 w-full mb-6">
                   <div className="w-16 h-16 rounded-2xl bg-cyan-100 dark:bg-cyan-900/40 border border-cyan-200 dark:border-cyan-800 flex items-center justify-center mb-6">
                      <ShoppingCart className="w-8 h-8 text-cyan-600 dark:text-cyan-400" />
                   </div>
                   <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-3">E-Commerce & Dropshipping</h2>
                   <p className="text-slate-500 dark:text-slate-400 font-medium">
                     Tools optimized for store owners. Break-even ROAS, true product cost, supplier API shortcuts, and ad spend tracking.
                   </p>
                </div>
                <div className="relative z-10 font-bold text-cyan-600 dark:text-cyan-400 text-sm tracking-widest uppercase flex items-center gap-2 group-hover:translate-x-2 transition-transform">
                   Enter Dropship Mode &rarr;
                </div>
             </button>

             {/* Trading Mode */}
             <button 
                onClick={() => setAppMode('trading')}
                className="group relative bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 rounded-3xl p-8 hover:border-emerald-500 dark:hover:border-emerald-500 transition-all duration-300 hover:shadow-2xl hover:-translate-y-1 text-left overflow-hidden flex flex-col items-start justify-between min-h-[320px]"
             >
                <div className="absolute top-0 right-0 -mt-10 -mr-10 opacity-5 group-hover:opacity-10 transition-opacity">
                   <Activity className="w-64 h-64 text-emerald-500" />
                </div>
                <div className="relative z-10 w-full mb-6">
                   <div className="w-16 h-16 rounded-2xl bg-emerald-100 dark:bg-emerald-900/40 border border-emerald-200 dark:border-emerald-800 flex items-center justify-center mb-6">
                      <Activity className="w-8 h-8 text-emerald-600 dark:text-emerald-400" />
                   </div>
                   <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-3">Crypto & Market Trading</h2>
                   <p className="text-slate-500 dark:text-slate-400 font-medium">
                     Discipline and risk management tools. Position size grids, Risk:Reward targets, currency FX, and DCA simulators.
                   </p>
                </div>
                <div className="relative z-10 font-bold text-emerald-600 dark:text-emerald-400 text-sm tracking-widest uppercase flex items-center gap-2 group-hover:translate-x-2 transition-transform">
                   Enter Trading Mode &rarr;
                </div>
             </button>

          </div>

       </div>
    </div>
  );
}
