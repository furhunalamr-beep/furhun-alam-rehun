import { useEffect, useRef } from 'react';

export function useAutoSave(key: string, stateSetterMap: Record<string, (val: any) => void>, currentState: Record<string, any>) {
  const isInitialMount = useRef(true);

  // Load on mount
  useEffect(() => {
    const saved = localStorage.getItem(key);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        Object.keys(parsed).forEach(k => {
           if (stateSetterMap[k]) {
              stateSetterMap[k](parsed[k]);
           }
        });
      } catch (e) {}
    }
    isInitialMount.current = false;
  }, []);

  // Save on update (skip first mount)
  useEffect(() => {
    if (isInitialMount.current) return;
    const timeoutId = setTimeout(() => {
       localStorage.setItem(key, JSON.stringify(currentState));
    }, 500);
    return () => clearTimeout(timeoutId);
  }, Object.values(currentState));
}
