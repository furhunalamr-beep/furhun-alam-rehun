import React, { useState } from 'react';
import { Percent, TrendingUp, HandCoins, Building, Users, Clock, History, Menu, X, Sun, Moon, Briefcase, Download, Landmark, Cloud, TrendingDown, Car, ShoppingCart, Megaphone, Activity, Crosshair, ArrowDownToLine, Copy, CheckCircle2, Globe2, FileSpreadsheet, Play, Command } from 'lucide-react';
import { useStore } from '../../store/useStore';
import { cn } from '../../utils/cn';
import { Button } from '../ui/Button';
import { MobileNumpad } from '../ui/MobileNumpad';
import { toast } from 'react-hot-toast';

interface AppLayoutProps {
  children: React.ReactNode;
  activeModule: string;
  setActiveModule: (module: string) => void;
}

export const navigation = [
  {
    category: 'Dashboard',
    items: [
      { name: 'Home', id: 'home', icon: Briefcase },
    ]
  },
  {
    category: 'Core Business',
    items: [
      { name: 'Profit & Pricing', id: 'margin', icon: Percent },
      { name: 'Break-Even', id: 'breakeven', icon: TrendingUp },
      { name: 'Volume Elasticity', id: 'elasticity', icon: TrendingDown },
      { name: 'SaaS Metrics', id: 'saas', icon: Cloud },
      { name: 'Quarterly Tax', id: 'tax', icon: Landmark },
      { name: 'Mileage Tracker', id: 'mileage', icon: Car },
    ]
  },
  {
    category: 'E-Commerce & Dropship',
    items: [
      { name: 'True Product Cost', id: 'ecom_cost', icon: ShoppingCart },
      { name: 'Break-Even ROAS', id: 'roas', icon: Megaphone },
      { name: 'Live Currency FX', id: 'fx', icon: Globe2 },
    ]
  },
  {
    category: 'Trading & Markets',
    items: [
      { name: 'Position Size', id: 'position_size', icon: Activity },
      { name: 'Risk:Reward Levels', id: 'risk_reward', icon: Crosshair },
      { name: 'DCA Calculator', id: 'dca', icon: ArrowDownToLine },
    ]
  },
  {
    category: 'Finance & Loan',
    items: [
      { name: 'ROI Analysis', id: 'roi', icon: HandCoins },
      { name: 'Amortization', id: 'loan', icon: Building },
      { name: 'Employee Cost', id: 'payroll', icon: Users },
      { name: 'Time Value (TVM)', id: 'tvm', icon: Clock },
    ]
  }
];

export function AppLayout({ children, activeModule, setActiveModule }: AppLayoutProps) {
  const { 
    theme, 
    toggleTheme, 
    isHistoryOpen, 
    toggleHistory, 
    appMode, 
    setAppMode, 
    historyTape, 
    clearHistory, 
    googleToken,
    triggerGlobalRun
  } = useStore();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Global Run Shortcut: Ctrl + Enter
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        e.preventDefault();
        triggerGlobalRun();
        return;
      }

      // Ignore if user is inside an input/textarea and just typing,
      // but catch if they use modifiers.
      if ((e.ctrlKey || e.metaKey)) {
        switch (e.key.toLowerCase()) {
          case 'n':
            e.preventDefault();
            // In a real app we'd dispatch a clear action to the active module.
            // Using a simple page reload or custom event here for 'New'.
            window.dispatchEvent(new CustomEvent('clear-workspace'));
            break;
          case 's':
            e.preventDefault();
            // Quick save dummy context since we don't have active module refs directly here, 
            // but normally the module itself could register a handler 
            // or we could save the generic state.
            window.dispatchEvent(new CustomEvent('quick-save'));
            break;
          case 'e':
            e.preventDefault();
            import('../../utils/helpers').then(({ exportToCSV }) => {
                const rows = historyTape.map(t => [
                  new Date(t.timestamp).toISOString(),
                  t.title,
                  JSON.stringify(t.inputs),
                  JSON.stringify(t.results)
                ]);
                exportToCSV('bizcalc-history', ['Date', 'Calculator', 'Inputs', 'Results'], rows);
            });
            break;
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [historyTape]);

  return (
    <div className={cn("min-h-screen font-sans antialiased transition-colors duration-200", theme === 'dark' ? 'dark bg-slate-950 text-slate-50' : 'bg-slate-50 text-slate-900')}>
      
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 bg-slate-900/80 backdrop-blur-sm lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <div className={cn(
        "fixed inset-y-0 left-0 z-50 w-72 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0 lg:flex lg:w-72 lg:flex-col",
        sidebarOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="flex h-16 shrink-0 items-center justify-between px-6 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-2 font-display font-bold text-xl text-blue-600 dark:text-blue-500">
            <Briefcase className="w-6 h-6" />
            BizCalc Pro
          </div>
          <button className="lg:hidden p-2 text-slate-500" onClick={() => setSidebarOpen(false)}>
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <nav className="flex flex-1 flex-col overflow-y-auto px-4 py-6 space-y-6">
          {navigation
             .filter(group => {
               if (appMode === 'dropshipping') {
                 return group.category !== 'Trading & Markets';
               }
               if (appMode === 'trading') {
                 return group.category !== 'E-Commerce & Dropship';
               }
               return true;
             })
             .map((group) => (
            <div key={group.category} className="space-y-1">
              <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 px-2">
                {group.category}
              </div>
              {group.items.map((item) => (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveModule(item.id);
                    setSidebarOpen(false);
                  }}
                  className={cn(
                    "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                    activeModule === item.id
                      ? "bg-blue-50 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300"
                      : "text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-200"
                  )}
                >
                  <item.icon className="w-5 h-5" />
                  {item.name}
                </button>
              ))}
            </div>
          ))}
        </nav>
      </div>

      {/* Main Container */}
      <div className="flex flex-1 flex-col lg:h-screen lg:overflow-hidden w-full lg:flex-row pb-16 lg:pb-0">
        
        <div className="flex flex-1 flex-col overflow-y-auto relative w-full lg:w-auto">
          {/* Top Header */}
          <header className="sticky top-0 z-30 flex h-16 shrink-0 items-center gap-x-4 border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md px-4 sm:gap-x-6 sm:px-6 lg:px-8">
            <button type="button" className="-m-2.5 p-2.5 text-slate-700 dark:text-slate-300 lg:hidden" onClick={() => setSidebarOpen(true)}>
              <span className="sr-only">Open sidebar</span>
              <Menu className="h-6 w-6" aria-hidden="true" />
            </button>
            <div className="flex flex-1 gap-x-4 self-stretch lg:gap-x-6 justify-between items-center">
              <h1 className="text-lg font-semibold text-slate-900 dark:text-white capitalize">
                {navigation.flatMap(g => g.items).find(n => n.id === activeModule)?.name || 'Calculator'}
              </h1>
              <div className="flex items-center gap-x-4 lg:gap-x-6">
                <Button 
                  variant="primary" 
                  size="sm" 
                  onClick={triggerGlobalRun}
                  className="hidden md:flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white border-none shadow-md shadow-blue-500/20"
                >
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span className="font-bold tracking-tight">RUN</span>
                  <div className="flex items-center gap-0.5 px-1 py-0.5 bg-blue-500/50 rounded text-[9px] opacity-80 border border-blue-400/30">
                    <Command className="w-2 h-2" />
                    <span>ENT</span>
                  </div>
                </Button>
                <Button variant="outline" size="sm" onClick={() => setAppMode(null)} className="hidden sm:flex text-xs font-bold text-slate-600 dark:text-slate-300">
                   Switch Workspace
                </Button>
                <Button variant="ghost" size="icon" onClick={toggleHistory} title="History Tape">
                  <History className="h-5 w-5" />
                </Button>
                <Button variant="ghost" size="icon" onClick={toggleTheme} title="Toggle Theme">
                  {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
                </Button>
              </div>
            </div>
          </header>

          {/* Main Content */}
          <main className="flex-1 p-4 sm:p-6 lg:p-8 w-full max-w-7xl mx-auto">
            {children}
          </main>
        </div>

      {/* Optional Right Sidebar for History Tape */}
        {isHistoryOpen && (
          <aside className="fixed inset-y-0 right-0 z-50 w-full max-w-sm lg:relative lg:w-80 border-l border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex flex-col h-full shrink-0 shadow-xl lg:shadow-none">
             <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-800/50">
               <h3 className="font-semibold flex items-center gap-2 text-slate-900 dark:text-slate-100">
                 <History className="w-4 h-4 text-blue-600 dark:text-blue-500" /> History Tape
               </h3>
               <Button variant="ghost" size="icon" onClick={toggleHistory}><X className="w-4 h-4"/></Button>
             </div>
             <div className="flex-1 overflow-y-auto p-4 space-y-4">
               {historyTape.length === 0 ? (
                 <div className="text-center text-slate-500 text-sm mt-10">Tape is empty</div>
               ) : (
                 historyTape.map((item) => (
                   <div key={item.id} className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-3 shadow-sm">
                     <div className="flex justify-between items-center mb-2 pb-2 border-b border-slate-100 dark:border-slate-700">
                       <span className="text-xs font-semibold text-slate-600 dark:text-slate-300">{item.title}</span>
                       <span className="text-[10px] text-slate-400">
                         {new Date(item.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                       </span>
                     </div>
                     <div className="space-y-1 mb-2">
                       {Object.entries(item.inputs).map(([key, val]) => (
                         <div key={key} className="flex justify-between text-xs text-slate-500 dark:text-slate-400">
                           <span>{key}:</span>
                           <span className="font-mono">{typeof val === 'number' ? val.toLocaleString() : val}</span>
                         </div>
                       ))}
                     </div>
                     <div className="space-y-1 pt-2 border-t border-slate-100 dark:border-slate-700">
                       {Object.entries(item.results).map(([key, val]) => (
                         <div key={key} className="flex justify-between text-xs font-medium text-slate-900 dark:text-slate-200">
                           <span>{key}:</span>
                           <span className="font-mono text-blue-600 dark:text-blue-400">
                             {typeof val === 'number' ? (key.includes('%') ? `${val}%` : `$${val.toLocaleString()}`) : val}
                           </span>
                         </div>
                       ))}
                     </div>
                   </div>
                 ))
               )}
             </div>
             {historyTape.length > 0 && (
               <div className="p-4 border-t border-slate-200 dark:border-slate-800 space-y-2">
                 <Button 
                   variant="secondary" 
                   className="w-full text-emerald-600 dark:text-emerald-400 bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-900/20" 
                   onClick={async () => {
                     const token = googleToken;
                     if (!token) {
                       toast.error("Please re-login to enable Google Sheets access (token expired or missing).");
                       return;
                     }
                     const tid = toast.loading("Exporting to Google Sheets...");
                     try {
                       const res = await fetch('/api/sheets/export', {
                         method: 'POST',
                         headers: {
                           'Content-Type': 'application/json',
                           'Authorization': `Bearer ${token}`
                         },
                         body: JSON.stringify({ historyTape: useStore.getState().historyTape })
                       });
                       const data = await res.json();
                       if (data.url) {
                        toast.success("Export successful!", { id: tid });
                        window.open(data.url, '_blank');
                       } else {
                        throw new Error(data.error);
                       }
                     } catch (err: any) {
                       toast.error(`Export failed: ${err.message}`, { id: tid });
                     }
                   }}
                 >
                   <FileSpreadsheet className="w-4 h-4 mr-2" /> Export to Sheets
                 </Button>
                 <Button variant="secondary" className="w-full text-blue-600 dark:text-blue-400" onClick={() => {
                   import('../../utils/helpers').then(({ exportToCSV }) => {
                     const rows = historyTape.map(t => [
                       new Date(t.timestamp).toISOString(),
                       t.title,
                       JSON.stringify(t.inputs),
                       JSON.stringify(t.results)
                     ]);
                     exportToCSV('bizcalc-history', ['Date', 'Calculator', 'Inputs', 'Results'], rows);
                   });
                 }}>
                   <Download className="w-4 h-4 mr-2" /> Export to CSV
                 </Button>
                 <Button variant="outline" className="w-full text-red-600 hover:bg-red-50 hover:border-red-200 dark:text-red-400 dark:hover:bg-red-900/20 dark:hover:border-red-900/50" onClick={clearHistory}>
                   Clear Tape
                 </Button>
               </div>
             )}
          </aside>
        )}
      </div>

      {/* Global Mobile UI */}
      <MobileNumpad />

      {/* Mobile Bottom Navigation Strip */}
      <div className="lg:hidden fixed bottom-0 inset-x-0 z-40 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 pb-safe shadow-[0_-4px_20px_rgba(0,0,0,0.05)] dark:shadow-[0_-4px_20px_rgba(0,0,0,0.3)]">
         <div className="flex justify-around items-center h-16">
            <button key="home" onClick={() => setActiveModule('home')} className={cn("flex flex-col items-center justify-center flex-1 h-full relative", activeModule === 'home' ? 'text-blue-600 dark:text-blue-500' : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-300')}>
              {activeModule === 'home' && <div className="absolute top-0 w-8 h-1 bg-blue-600 dark:bg-blue-500 rounded-b-md" />}
              <Briefcase className="w-5 h-5 mb-1" />
              <span className="text-[10px] font-medium">Home</span>
            </button>
            {appMode === 'dropshipping' && (
              <button key="ecom" onClick={() => setActiveModule('ecom_cost')} className={cn("flex flex-col items-center justify-center flex-1 h-full relative", activeModule === 'ecom_cost' || activeModule === 'roas' ? 'text-blue-600 dark:text-blue-500' : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-300')}>
                {(activeModule === 'ecom_cost' || activeModule === 'roas') && <div className="absolute top-0 w-8 h-1 bg-blue-600 dark:bg-blue-500 rounded-b-md" />}
                <ShoppingCart className="w-5 h-5 mb-1" />
                <span className="text-[10px] font-medium">E-Com</span>
              </button>
            )}
            {appMode === 'trading' && (
              <button key="trading" onClick={() => setActiveModule('position_size')} className={cn("flex flex-col items-center justify-center flex-1 h-full relative", activeModule === 'position_size' || activeModule === 'risk_reward' ? 'text-blue-600 dark:text-blue-500' : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-300')}>
                {(activeModule === 'position_size' || activeModule === 'risk_reward') && <div className="absolute top-0 w-8 h-1 bg-blue-600 dark:bg-blue-500 rounded-b-md" />}
                <Activity className="w-5 h-5 mb-1" />
                <span className="text-[10px] font-medium">Trading</span>
              </button>
            )}
         </div>
      </div>

    </div>
  );
}
