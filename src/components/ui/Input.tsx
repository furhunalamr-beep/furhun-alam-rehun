import React, { InputHTMLAttributes } from 'react';
import { cn } from '../../utils/cn';
import { useNumpadStore } from '../../store/numpadStore';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  prefix?: React.ReactNode;
  suffix?: React.ReactNode;
  actionIcon?: React.ReactNode;
  onActionClick?: () => void;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, prefix, suffix, actionIcon, onActionClick, id, onFocus, onChange, ...props }, ref) => {
    const generatedId = id || Math.random().toString(36).substring(7);
    const { openNumpad } = useNumpadStore();
    
    // Only intercept natively on mobile devices
    const isMobileDevice = typeof window !== 'undefined' && window.innerWidth < 1024;
    
    const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
       if (props.type === 'number' && isMobileDevice && !props.readOnly) {
         e.preventDefault();
         e.target.blur(); // Hide native keyboard
         openNumpad(label || props.placeholder || 'Enter value', props.value?.toString() || '', (val) => {
            if (onChange) {
               // Simulate standard onChange event with a custom target
               onChange({ target: { value: val } } as any);
            }
         });
       }
       if (onFocus) onFocus(e);
    };

    return (
      <div className="w-full">
        {label && (
          <label htmlFor={generatedId} className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5 flex justify-between">
            {label}
            {props.type === "range" && <span className="text-slate-500 font-normal">{props.value}{suffix || ''}</span>}
          </label>
        )}
        <div className="relative">
          {prefix && (
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
              {prefix}
            </div>
          )}
          <input
            id={generatedId}
            ref={ref}
            onFocus={handleFocus}
            onChange={onChange}
            className={cn(
               props.type === 'range' 
                 ? "w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-600"
                 : "block w-full rounded-xl border-0 py-3 sm:py-2 sm:text-sm sm:leading-6 shadow-sm ring-1 ring-inset ring-slate-300 dark:ring-slate-700 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 disabled:opacity-50 text-lg sm:text-base",
              prefix && "pl-9",
              suffix && props.type !== 'range' && !actionIcon && "pr-9",
              actionIcon && "pr-12",
              className
            )}
            {...props}
          />
          {actionIcon && (
             <div className="absolute inset-y-0 right-0 pr-1 flex items-center">
                <button 
                  type="button" 
                  onClick={onActionClick} 
                  className="p-1.5 text-slate-400 hover:text-blue-600 bg-slate-50 dark:bg-slate-700 hover:bg-blue-50 dark:hover:bg-slate-600 rounded-lg transition-colors"
                >
                  {actionIcon}
                </button>
             </div>
          )}
          {suffix && props.type !== 'range' && !actionIcon && (
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-slate-500">
              {suffix}
            </div>
          )}
        </div>
      </div>
    );
  }
);
Input.displayName = 'Input';
