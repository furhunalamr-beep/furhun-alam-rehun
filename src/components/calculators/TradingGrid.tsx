import React, { useState } from 'react';
import { PositionSizeCalc } from './PositionSizeCalc';

export function TradingGrid() {
  const [gridCount, setGridCount] = useState<number>(1);

  const toggleGrid = () => {
    setGridCount(c => c === 1 ? 2 : c === 2 ? 4 : 1);
  };

  if (gridCount === 1) {
    return <PositionSizeCalc instanceId={1} onToggleGrid={toggleGrid} gridCount={gridCount} />;
  }

  return (
    <div className={`grid gap-4 h-full ${gridCount === 2 ? 'grid-cols-1 lg:grid-cols-2' : 'grid-cols-1 lg:grid-cols-2'}`}>
      {Array.from({ length: gridCount }).map((_, i) => (
         <div key={i} className="h-[600px] lg:h-[calc(100vh-140px)] border-4 border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden relative">
            {/* Minimal wrapper to hide extra scrolling or adjust heights */}
            <div className="absolute inset-0 overflow-y-auto overflow-x-hidden transform scale-95 origin-top">
              <PositionSizeCalc instanceId={i + 1} onToggleGrid={toggleGrid} gridCount={gridCount} />
            </div>
         </div>
      ))}
    </div>
  );
}
