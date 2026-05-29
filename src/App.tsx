import React, { useState, useEffect } from 'react';
import { AppLayout } from './components/layout/AppLayout';
import { useStore } from './store/useStore';
import { doc, getDocFromServer } from 'firebase/firestore';
import { db } from './lib/firebase';

import { ProfitMarginCalc } from './components/calculators/ProfitMarginCalc';
import { BreakEvenCalc } from './components/calculators/BreakEvenCalc';
import { ROICalc } from './components/calculators/ROICalc';
import { AmortizationCalc } from './components/calculators/AmortizationCalc';
import { PayrollCalc } from './components/calculators/PayrollCalc';
import { TVMCalc } from './components/calculators/TVMCalc';
import { VolumeElasticityCalc } from './components/calculators/VolumeElasticityCalc';
import { SaaSMetricsCalc } from './components/calculators/SaaSMetricsCalc';
import { MileageCalc } from './components/calculators/MileageCalc';
import { QuarterlyTaxCalc } from './components/calculators/QuarterlyTaxCalc';
import { TrueCostCalc } from './components/calculators/TrueCostCalc';
import { ROASCalc } from './components/calculators/ROASCalc';
import { TradingGrid } from './components/calculators/TradingGrid';
import { RRRatioCalc } from './components/calculators/RRRatioCalc';
import { DCACalc } from './components/calculators/DCACalc';
import { FXCalc } from './components/calculators/FXCalc';
import { AuthLock } from './components/AuthLock';
import { SaveModal } from './components/ui/SaveModal';
import { Toaster } from 'react-hot-toast';
import { HomeDashboard } from './components/dashboard/HomeDashboard';
import { AIChatWidget } from './components/ui/AIChatWidget';
import { ModeSelectionScreen } from './components/ui/ModeSelectionScreen';
import { TutorialGuide } from './components/ui/TutorialGuide';

export default function App() {
  const [activeModule, setActiveModule] = useState('home');
  const { theme, appMode } = useStore();

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  // Set default module based on appMode if 'home' isn't explicitly wanted
  useEffect(() => {
     if (appMode === 'dropshipping') setActiveModule('ecom_cost');
     else if (appMode === 'trading') setActiveModule('position_size');
  }, [appMode]);

  const renderModule = () => {
    switch (activeModule) {
      case 'home':
        return <HomeDashboard setActiveModule={setActiveModule} />;
      case 'margin':
        return <ProfitMarginCalc />;
      case 'breakeven':
        return <BreakEvenCalc />;
      case 'elasticity':
        return <VolumeElasticityCalc />;
      case 'saas':
        return <SaaSMetricsCalc />;
      case 'tax':
        return <QuarterlyTaxCalc />;
      case 'mileage':
        return <MileageCalc />;
      case 'ecom_cost':
        return <TrueCostCalc />;
      case 'roas':
        return <ROASCalc />;
      case 'fx':
        return <FXCalc />;
      case 'position_size':
        return <TradingGrid />;
      case 'risk_reward':
        return <RRRatioCalc />;
      case 'dca':
        return <DCACalc />;
      case 'roi':
        return <ROICalc />;
      case 'loan':
        return <AmortizationCalc />;
      case 'payroll':
         return <PayrollCalc />;
      case 'tvm':
         return <TVMCalc />;
      default:
        return (
          <div className="flex flex-col items-center justify-center h-64 text-slate-500">
            <h2 className="text-xl font-semibold mb-2">Module Not Found</h2>
            <p>This module is under development.</p>
          </div>
        );
    }
  };

  if (!appMode) {
    return (
      <AuthLock>
        <ModeSelectionScreen />
        <Toaster position="top-center" toastOptions={{ className: 'dark:bg-slate-800 dark:text-white', duration: 3000 }} />
      </AuthLock>
    );
  }

  return (
    <AuthLock>
      <TutorialGuide />
      <AppLayout activeModule={activeModule} setActiveModule={setActiveModule}>
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 ease-out h-full">
          {renderModule()}
        </div>
      </AppLayout>
      <AIChatWidget />
      <SaveModal />
      <Toaster position="top-center" toastOptions={{ className: 'dark:bg-slate-800 dark:text-white', duration: 3000 }} />
    </AuthLock>
  );
}

