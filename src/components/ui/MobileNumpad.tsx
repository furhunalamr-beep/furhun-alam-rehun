import React, { useEffect, useState } from 'react';
import { useNumpadStore } from '../../store/numpadStore';
import { X, Delete, Check } from 'lucide-react';
import { cn } from '../../utils/cn';
import { vibrate } from '../../utils/helpers';

export function MobileNumpad() {
  const { isOpen, value, label, closeNumpad, updateValue, submitValue } = useNumpadStore();
  const [localValue, setLocalValue] = useState('');

  useEffect(() => {
    if (isOpen) {
      setLocalValue(value);
      // Prevent body scrolling when numpad is open
      document.body.style.overflow = 'hidden';
    } else {
       document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [isOpen, value]);

  if (!isOpen) return null;

  const handlePress = (key: string) => {
    vibrate(30);
    let newVal = localValue;
    
    if (key === 'C') {
      newVal = '';
    } else if (key === 'DEL') {
      newVal = newVal.slice(0, -1);
    } else if (key === '.') {
      if (!newVal.includes('.')) {
        newVal += newVal === '' ? '0.' : '.';
      }
    } else if (key === '00') {
      if (newVal !== '' && newVal !== '0') newVal += '00';
    } else if (key === '%') {
      // Small helper to divide by 100
      const num = parseFloat(newVal);
      if (!isNaN(num)) {
         newVal = (num / 100).toString();
      }
    } else {
      if (newVal === '0' && key !== '.') newVal = key;
      else newVal += key;
    }

    setLocalValue(newVal);
    updateValue(newVal);
  };

  const keys = [
    ['C', '%', 'DEL'],
    ['7', '8', '9'],
    ['4', '5', '6'],
    ['1', '2', '3'],
    ['00', '0', '.'],
  ];

  return (
    <>
      <div 
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] transition-opacity lg:hidden" 
        onClick={() => submitValue()} 
      />
      <div className="fixed bottom-0 left-0 right-0 z-[101] bg-slate-100 dark:bg-slate-950 p-4 pb-8 rounded-t-3xl shadow-[0_-10px_40px_rgba(0,0,0,0.1)] dark:shadow-[0_-10px_40px_rgba(0,0,0,0.5)] transform transition-transform lg:hidden border-t border-slate-200 dark:border-slate-800">
        
        <div className="flex justify-between items-center mb-6">
          <div className="flex-1">
             <div className="text-sm font-semibold text-slate-500 dark:text-slate-400 mb-1">{label}</div>
             <div className="text-3xl font-mono text-slate-900 dark:text-white truncate">
                {localValue || '0'}
             </div>
          </div>
          <button 
             onClick={() => submitValue()}
             className="px-6 py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-bold shadow-lg shadow-blue-600/30 active:scale-95 transition-all"
             onTouchStart={() => vibrate(50)}
          >
             <Check className="w-8 h-8" />
          </button>
        </div>

        <div className="grid grid-cols-3 gap-3">
           {keys.flat().map((key) => (
              <button
                key={key}
                onClick={(e) => { e.preventDefault(); handlePress(key); }}
                className={cn(
                  "flex items-center justify-center p-5 text-2xl font-semibold rounded-2xl transition-all active:scale-95 select-none",
                  key === 'DEL' ? "bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-300" :
                  key === 'C' || key === '%' ? "bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-300" :
                  "bg-white text-slate-900 shadow-sm dark:bg-slate-900 dark:border-slate-800 dark:border dark:text-white dark:shadow-none"
                )}
              >
                {key === 'DEL' ? <Delete className="w-7 h-7" /> : key}
              </button>
           ))}
        </div>
      </div>
    </>
  );
}
