import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronRight, ChevronLeft, X, Rocket, Shield, History, FileSpreadsheet, Zap } from 'lucide-react';
import { Button } from './Button';
import { useStore } from '../../store/useStore';

const steps = [
  {
    title: "Welcome to TradeCalc Pro",
    description: "Your all-in-one companion for trading and dropshipping calculations. Let's take a quick tour to help you get started on your first day.",
    icon: <Rocket className="w-12 h-12 text-blue-500" />,
    color: "bg-blue-500/10",
  },
  {
    title: "Choose Your Path",
    description: "Switch between 'Trading' and 'Dropshipping' modes to access specialized calculators tailored to your current business needs.",
    icon: <Zap className="w-12 h-12 text-amber-500" />,
    color: "bg-amber-500/10",
  },
  {
    title: "Precise Calculations",
    description: "Use our interactive modules to calculate profit margins, break-even points, or position sizes with extreme precision.",
    icon: <Shield className="w-12 h-12 text-emerald-500" />,
    color: "bg-emerald-500/10",
  },
  {
    title: "The History Tape",
    description: "Every calculation is automatically saved to your History Tape. Use it to keep track of your logic throughout the day.",
    icon: <History className="w-12 h-12 text-purple-500" />,
    color: "bg-purple-500/10",
  },
  {
    title: "Export to Google Sheets",
    description: "Done for the day? Export your entire calculation tape directly to a Google Sheet for long-term record keeping and analysis.",
    icon: <FileSpreadsheet className="w-12 h-12 text-green-500" />,
    color: "bg-green-500/10",
  }
];

export function TutorialGuide() {
  const { hasSeenTutorial, setHasSeenTutorial } = useStore();
  const [currentStep, setCurrentStep] = useState(0);

  if (hasSeenTutorial) return null;

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      setHasSeenTutorial(true);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleSkip = () => {
    setHasSeenTutorial(true);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[300] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-2xl overflow-hidden shadow-2xl border border-slate-200 dark:border-slate-800"
        >
          {/* Progress Bar */}
          <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-800 flex">
            {steps.map((_, idx) => (
              <div 
                key={idx}
                className={`h-full transition-all duration-300 ${
                  idx <= currentStep ? 'bg-blue-600 flex-1' : 'w-0'
                }`}
              />
            ))}
          </div>

          <div className="p-8">
            <div className="flex justify-between items-start mb-6">
              <div className={`p-4 rounded-2xl ${steps[currentStep].color}`}>
                {steps[currentStep].icon}
              </div>
              <button 
                onClick={handleSkip}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-2"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
            >
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-3">
                {steps[currentStep].title}
              </h2>
              <p className="text-slate-600 dark:text-slate-400 text-lg leading-relaxed mb-8">
                {steps[currentStep].description}
              </p>
            </motion.div>

            <div className="flex items-center justify-between">
              <div className="flex gap-2">
                {steps.map((_, idx) => (
                  <div 
                    key={idx}
                    className={`w-2 h-2 rounded-full transition-all duration-300 ${
                      idx === currentStep ? 'bg-blue-600 w-6' : 'bg-slate-300 dark:bg-slate-700'
                    }`}
                  />
                ))}
              </div>
              
              <div className="flex gap-3">
                {currentStep > 0 && (
                  <Button variant="secondary" onClick={handleBack} className="rounded-xl">
                    <ChevronLeft className="w-5 h-5 mr-1" /> Back
                  </Button>
                )}
                <Button onClick={handleNext} className="rounded-xl bg-blue-600 hover:bg-blue-700 min-w-[100px]">
                  {currentStep === steps.length - 1 ? 'Get Started' : 'Next'}
                  {currentStep !== steps.length - 1 && <ChevronRight className="w-5 h-5 ml-1" />}
                </Button>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
