import React, { useState, useEffect, useRef } from 'react';
import { Target, TrendingUp, Edit2, Check, X, DollarSign, RotateCcw, PartyPopper, Settings, RefreshCw } from 'lucide-react';
import { useStore } from '../../store/useStore';
import { Card, CardContent } from '../ui/Card';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { formatCurrency } from '../../utils/helpers';
import { motion, AnimatePresence, useMotionValue, useSpring, useTransform, animate } from 'motion/react';
import { AreaChart, Area, ResponsiveContainer, Tooltip } from 'recharts';
import { toast } from 'react-hot-toast';

function AnimatedNumber({ value }: { value: number }) {
  const motionValue = useMotionValue(value);
  const springValue = useSpring(motionValue, { 
    stiffness: 100, 
    damping: 30,
    restDelta: 0.001
  });
  
  const [displayValue, setDisplayValue] = useState(value);

  useEffect(() => {
    motionValue.set(value);
  }, [value, motionValue]);

  useEffect(() => {
    return springValue.on("change", (latest) => {
      setDisplayValue(latest);
    });
  }, [springValue]);

  return <>{formatCurrency(displayValue)}</>;
}

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-2 rounded-lg shadow-xl text-[10px] animate-in fade-in zoom-in-95 duration-200">
        <p className="font-bold text-slate-400 dark:text-slate-500 mb-0.5 uppercase tracking-wider">
          {new Date(payload[0].payload.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
        </p>
        <p className="text-blue-600 dark:text-blue-400 font-mono font-bold text-xs">
          {formatCurrency(payload[0].value)}
        </p>
      </div>
    );
  }
  return null;
};

export function DailyProfitWidget() {
  const { 
    weeklyProfitGoal, 
    setWeeklyProfitGoal, 
    dailyProfit, 
    addDailyProfit, 
    resetDailyProfit, 
    profitHistory,
    autoFetchFromHistory,
    setAutoFetchFromHistory,
    syncProfitFromHistory
  } = useStore();
  const [isEditingGoal, setIsEditingGoal] = useState(false);
  const [goalInput, setGoalInput] = useState(weeklyProfitGoal.toString());
  const [profitInput, setProfitInput] = useState('');
  const [showCelebration, setShowCelebration] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);

  const dailyTarget = weeklyProfitGoal / 7;
  const remainingToday = Math.max(0, dailyTarget - dailyProfit);
  const progressPercent = dailyTarget > 0 ? Math.min(100, (dailyProfit / dailyTarget) * 100) : 0;
  const isOverGoal = dailyTarget > 0 && dailyProfit >= dailyTarget;
  const isSuperProfit = dailyTarget > 0 && dailyProfit >= dailyTarget * 1.2;

  useEffect(() => {
    if (isSuperProfit && !showCelebration) {
      setShowCelebration(true);
      toast.success("Goal Smashed! You're 20% above target!", {
        icon: '🔥',
        duration: 4000,
        position: 'top-center',
      });
    } else if (!isSuperProfit) {
      setShowCelebration(false);
    }
  }, [isSuperProfit]);

  const handleUpdateGoal = () => {
    const val = parseFloat(goalInput);
    if (!isNaN(val)) {
      setWeeklyProfitGoal(val);
      setIsEditingGoal(false);
    }
  };

  const handleAddProfit = () => {
    const val = parseFloat(profitInput);
    if (!isNaN(val)) {
      addDailyProfit(val);
      setProfitInput('');
      if (dailyProfit + val >= dailyTarget && dailyProfit < dailyTarget) {
        toast.success("Daily Target Reached! 🎯", { position: 'bottom-center' });
      }
    }
  };

  return (
    <Card className={`bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden transition-all duration-500 ${isSuperProfit ? 'ring-2 ring-emerald-500/50 shadow-emerald-500/10' : ''}`}>
      <CardContent className="p-6">
        <div className="flex flex-col md:flex-row gap-8">
          {/* Left Side: Stats & Progress */}
          <div className="flex-1 space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className={`p-2 rounded-lg transition-colors duration-300 ${isOverGoal ? 'bg-emerald-100 dark:bg-emerald-900/30' : 'bg-blue-100 dark:bg-blue-900/30'}`}>
                  <Target className={`w-5 h-5 ${isOverGoal ? 'text-emerald-600 dark:text-emerald-400' : 'text-blue-600 dark:text-blue-400'}`} />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-medium text-slate-500 dark:text-slate-400">Daily Profit Goal</h3>
                    {isSuperProfit && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="flex items-center gap-1 bg-emerald-500 text-white text-[10px] px-1.5 py-0.5 rounded-full font-bold"
                      >
                        <PartyPopper className="w-2.5 h-2.5" /> SUPER
                      </motion.div>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    {isEditingGoal ? (
                      <div className="flex items-center gap-2 mt-1">
                        <Input 
                          value={goalInput}
                          onChange={(e) => setGoalInput(e.target.value)}
                          className="h-8 w-24 py-0 px-2 text-sm"
                          type="number"
                          autoFocus
                        />
                        <button onClick={handleUpdateGoal} className="text-emerald-500 hover:text-emerald-600">
                          <Check className="w-4 h-4" />
                        </button>
                        <button onClick={() => setIsEditingGoal(false)} className="text-red-500 hover:text-red-600">
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 group">
                        <span className="text-2xl font-bold text-slate-900 dark:text-white">
                          {formatCurrency(dailyTarget)}
                        </span>
                        <button 
                          onClick={() => {
                            setGoalInput(weeklyProfitGoal.toString());
                            setIsEditingGoal(true);
                          }}
                          className="opacity-0 group-hover:opacity-100 transition-opacity text-slate-400 hover:text-blue-500"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <span className="text-xs text-slate-400 font-normal">
                          (from {formatCurrency(weeklyProfitGoal)} weekly)
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              
              {/* Sparkline Trend */}
              <div className="flex-1 min-w-[120px] h-16 opacity-80">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={profitHistory.length > 0 ? profitHistory : [{ date: '', amount: 0 }, { date: '', amount: 0 }]}>
                    <defs>
                      <linearGradient id="profitGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={isOverGoal ? "#10b981" : "#3b82f6"} stopOpacity={0.1}/>
                        <stop offset="95%" stopColor={isOverGoal ? "#10b981" : "#3b82f6"} stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#3b82f6', strokeWidth: 1, strokeDasharray: '4 4' }} />
                    <Area 
                      type="monotone" 
                      dataKey="amount" 
                      stroke={isOverGoal ? "#10b981" : "#3b82f6"} 
                      strokeWidth={2}
                      dot={(props: any) => {
                        const { cx, cy, payload } = props;
                        const metGoal = payload.amount >= dailyTarget;
                        if (metGoal) {
                          return (
                            <circle key={`dot-${payload.date}`} cx={cx} cy={cy} r={3} fill="#10b981" stroke="white" strokeWidth={1} />
                          );
                        }
                        return null;
                      }}
                      activeDot={{ r: 4, strokeWidth: 0, fill: isOverGoal ? "#10b981" : "#3b82f6" }}
                      fillOpacity={1} 
                      fill="url(#profitGradient)" 
                      isAnimationActive={false}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Weekly Performance Summary */}
            <div className="pt-2 px-1 border-t border-slate-100 dark:border-slate-800/50">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-tighter">7-Day Average Performance</p>
                  <div className="flex items-baseline gap-2">
                    <span className="text-sm font-bold text-slate-700 dark:text-slate-200">
                      <AnimatedNumber value={profitHistory.length > 0 
                        ? profitHistory.reduce((acc, curr) => acc + curr.amount, 0) / Math.max(1, profitHistory.length) 
                        : 0
                      } />
                    </span>
                    <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded-md ${
                      (profitHistory.reduce((acc, curr) => acc + curr.amount, 0) / Math.max(1, profitHistory.length)) >= dailyTarget
                        ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400'
                        : 'bg-amber-50 text-amber-600 dark:bg-amber-900/20 dark:text-amber-400'
                    }`}>
                      {dailyTarget > 0 
                        ? `${Math.round(((profitHistory.reduce((acc, curr) => acc + curr.amount, 0) / Math.max(1, profitHistory.length)) / dailyTarget) * 100)}% of Goal`
                        : '0% of Goal'
                      }
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-tighter">Status</p>
                  <p className={`text-xs font-semibold ${
                    (profitHistory.reduce((acc, curr) => acc + curr.amount, 0) / Math.max(1, profitHistory.length)) >= dailyTarget
                      ? 'text-emerald-500'
                      : 'text-amber-500'
                  }`}>
                    {(profitHistory.reduce((acc, curr) => acc + curr.amount, 0) / Math.max(1, profitHistory.length)) >= dailyTarget
                      ? 'On Track'
                      : 'Below Target'}
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-end text-sm">
                <span className="text-slate-500">Today's Progress</span>
                <div className="flex items-center gap-3">
                  <span className={`font-mono font-medium transition-colors ${isOverGoal ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-700 dark:text-slate-300'}`}>
                    <AnimatedNumber value={dailyProfit} /> / {formatCurrency(dailyTarget)}
                  </span>
                  <button 
                    onClick={() => {
                      if(confirm('Reset today\'s profit progress?')) resetDailyProfit();
                    }}
                    className="text-slate-400 hover:text-red-500 transition-colors p-1"
                    title="Reset Day"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
              <div className="h-3 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ 
                    width: `${progressPercent}%`,
                    scale: isSuperProfit ? [1, 1.02, 1] : 1 
                  }}
                  transition={{ 
                    scale: { repeat: isSuperProfit ? Infinity : 0, duration: 2 } 
                  }}
                  className={`h-full transition-colors duration-500 ${isOverGoal ? 'bg-emerald-500 shadow-[0_0_15px_-3px_rgba(16,185,129,0.4)]' : 'bg-blue-600'}`}
                />
              </div>
              <p className="text-xs text-slate-400">
                {remainingToday > 0 
                  ? `Need ${formatCurrency(remainingToday)} more to hit goal.`
                  : isSuperProfit 
                    ? "Exceptional performance! You're in bonus territory today." 
                    : "Daily goal achieved! Excellent work today."}
              </p>
            </div>
          </div>

          {/* Right Side: Quick Update & Settings */}
          <div className="w-full md:w-64 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-800 flex flex-col gap-4">
            <div>
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Update Profit</h4>
                <button 
                  onClick={() => {
                    setIsSyncing(true);
                    setTimeout(() => {
                      syncProfitFromHistory();
                      setIsSyncing(false);
                      toast.success("Synced with Tape");
                    }, 600);
                  }}
                  className={`text-slate-400 hover:text-blue-500 transition-all ${isSyncing ? 'animate-spin' : ''}`}
                  title="Sync with History Tape"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 p-2 rounded-lg">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-tight">Auto-fetch from Tape</span>
                  <button 
                    onClick={() => setAutoFetchFromHistory(!autoFetchFromHistory)}
                    className={`relative inline-flex h-4 w-8 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${autoFetchFromHistory ? 'bg-blue-600' : 'bg-slate-200 dark:bg-slate-700'}`}
                  >
                    <span className={`pointer-events-none inline-block h-3 w-3 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${autoFetchFromHistory ? 'translate-x-4' : 'translate-x-0'}`} />
                  </button>
                </div>

                {!autoFetchFromHistory ? (
                  <div className="space-y-3">
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                        <DollarSign className="w-4 h-4" />
                      </span>
                      <Input 
                        value={profitInput}
                        onChange={(e) => setProfitInput(e.target.value)}
                        placeholder="0.00"
                        className="pl-9 h-10 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900"
                        type="number"
                      />
                    </div>
                    <Button 
                      onClick={handleAddProfit}
                      className={`w-full transition-all duration-300 ${isOverGoal ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-slate-900 dark:bg-white dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-slate-100'} h-10`}
                      disabled={!profitInput}
                    >
                      Update Day
                    </Button>
                  </div>
                ) : (
                  <div className="p-3 bg-blue-50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-900/30 rounded-lg text-center">
                    <p className="text-[10px] text-blue-600 dark:text-blue-400 font-medium">
                      Profit is automatically updated whenever you save a calculation.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

