import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { CalculatorType, HistoryItem, SavedTemplate } from '../types';

interface AppState {
  theme: 'light' | 'dark';
  toggleTheme: () => void;
  
  historyTape: HistoryItem[];
  addToHistory: (item: Omit<HistoryItem, 'id' | 'timestamp'>) => void;
  clearHistory: () => void;
  
  savedTemplates: SavedTemplate[];
  saveTemplate: (template: Omit<SavedTemplate, 'id'>) => void;
  deleteTemplate: (id: string) => void;
  
  isHistoryOpen: boolean;
  toggleHistory: () => void;
  
  isSaveModalOpen: boolean;
  saveContext: any;
  openSaveModal: (context: any) => void;
  closeSaveModal: () => void;
  
  disciplineScore: number;
  addDisciplineScore: (points: number) => void;

  appMode: 'dropshipping' | 'trading' | null;
  setAppMode: (mode: 'dropshipping' | 'trading' | null) => void;

  googleToken: string | null;
  setGoogleToken: (token: string | null) => void;

  hasSeenTutorial: boolean;
  setHasSeenTutorial: (seen: boolean) => void;

  weeklyProfitGoal: number;
  setWeeklyProfitGoal: (goal: number) => void;
  dailyProfit: number;
  addDailyProfit: (amount: number) => void;
  resetDailyProfit: () => void;
  profitHistory: { date: string; amount: number }[];
  autoFetchFromHistory: boolean;
  setAutoFetchFromHistory: (enabled: boolean) => void;
  syncProfitFromHistory: () => void;
  
  // Global Run Trigger
  runTriggerCount: number;
  triggerGlobalRun: () => void;
}

export const useStore = create<AppState>()(
  persist(
    (set, get) => ({
      theme: 'light',
      toggleTheme: () => set((state) => ({ theme: state.theme === 'light' ? 'dark' : 'light' })),

      runTriggerCount: 0,
      triggerGlobalRun: () => set((state) => ({ runTriggerCount: state.runTriggerCount + 1 })),
      
      historyTape: [],
      addToHistory: (item) => {
        const newItem = { ...item, id: crypto.randomUUID(), timestamp: Date.now() };
        set((state) => ({
          historyTape: [newItem, ...state.historyTape].slice(0, 50)
        }));

        if (get().autoFetchFromHistory) {
          const profit = extractProfitFromItem(newItem);
          if (profit !== 0) {
            get().addDailyProfit(profit);
          }
        }
      },
      clearHistory: () => set({ historyTape: [] }),
      
      savedTemplates: [],
      saveTemplate: (template) => set((state) => ({
        savedTemplates: [...state.savedTemplates, { ...template, id: crypto.randomUUID() }]
      })),
      deleteTemplate: (id) => set((state) => ({
        savedTemplates: state.savedTemplates.filter(t => t.id !== id)
      })),
      
      isHistoryOpen: false,
      toggleHistory: () => set((state) => ({ isHistoryOpen: !state.isHistoryOpen })),
      
      isSaveModalOpen: false,
      saveContext: null,
      openSaveModal: (context) => set({ isSaveModalOpen: true, saveContext: context }),
      closeSaveModal: () => set({ isSaveModalOpen: false, saveContext: null }),
      
      disciplineScore: 0,
      addDisciplineScore: (points) => set((state) => ({ disciplineScore: (state.disciplineScore || 0) + points })),

      appMode: null,
      setAppMode: (mode) => set({ appMode: mode }),

      googleToken: null,
      setGoogleToken: (token) => set({ googleToken: token }),

      hasSeenTutorial: false,
      setHasSeenTutorial: (seen) => set({ hasSeenTutorial: seen }),

      weeklyProfitGoal: 700,
      setWeeklyProfitGoal: (goal) => set({ weeklyProfitGoal: goal }),
      dailyProfit: 0,
      profitHistory: [],
      autoFetchFromHistory: false,
      setAutoFetchFromHistory: (enabled) => set({ autoFetchFromHistory: enabled }),
      
      syncProfitFromHistory: () => {
        const state = get();
        const today = new Date().toISOString().split('T')[0];
        const todayStart = new Date(today).getTime();
        
        const totalToday = state.historyTape
          .filter(h => h.timestamp >= todayStart)
          .reduce((sum, h) => sum + extractProfitFromItem(h), 0);
          
        set({ dailyProfit: totalToday });
        
        // Also update profitHistory for today
        const history = [...(state.profitHistory || [])];
        const dayIdx = history.findIndex(h => h.date === today);
        if (dayIdx >= 0) {
          history[dayIdx] = { ...history[dayIdx], amount: totalToday };
        } else {
          history.push({ date: today, amount: totalToday });
        }
        set({ profitHistory: history.sort((a, b) => a.date.localeCompare(b.date)).slice(-7) });
      },

      addDailyProfit: (amount) => set((state) => {
        const today = new Date().toISOString().split('T')[0];
        const newDailyProfit = (state.dailyProfit || 0) + amount;
        
        const history = [...(state.profitHistory || [])];
        const dayIdx = history.findIndex(h => h.date === today);
        
        if (dayIdx >= 0) {
          history[dayIdx] = { ...history[dayIdx], amount: history[dayIdx].amount + amount };
        } else {
          history.push({ date: today, amount: amount });
        }
        
        const sortedHistory = history.sort((a, b) => a.date.localeCompare(b.date)).slice(-7);
        
        return { 
          dailyProfit: newDailyProfit,
          profitHistory: sortedHistory
        };
      }),
      resetDailyProfit: () => set((state) => {
        const today = new Date().toISOString().split('T')[0];
        const history = [...(state.profitHistory || [])];
        const dayIdx = history.findIndex(h => h.date === today);
        if (dayIdx >= 0) {
          history[dayIdx] = { ...history[dayIdx], amount: 0 };
        }
        return { dailyProfit: 0, profitHistory: history };
      }),
    }),
    {
      name: 'bizcalc-storage',
      partialize: (state) => {
        const { googleToken, ...rest } = state;
        return rest;
      },
    }
  )
);

function extractProfitFromItem(item: HistoryItem): number {
  const possibleKeys = ['netProfit', 'profit', 'totalProfit', 'gain', 'earnings'];
  for (const key of possibleKeys) {
    if (typeof item.results[key] === 'number') {
      return item.results[key] as number;
    }
  }
  return 0;
}
