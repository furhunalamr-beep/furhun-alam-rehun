import React from 'react';

export function Tooltip({ children, content }: { children: React.ReactNode; content: string | React.ReactNode }) {
  return (
    <div className="group relative inline-flex items-center">
      {children}
      <div className="pointer-events-none absolute bottom-full left-1/2 z-50 mb-2 -translate-x-1/2 w-56 rounded-md bg-slate-900 px-3 py-2 text-xs text-slate-50 opacity-0 shadow-lg transition-opacity group-hover:opacity-100 dark:bg-slate-800 border border-slate-700 text-center">
        {content}
        <span className="absolute top-full left-1/2 -ml-1.5 border-[6px] border-transparent border-t-slate-900 dark:border-t-slate-800"></span>
      </div>
    </div>
  );
}
