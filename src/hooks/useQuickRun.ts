import { useEffect, useRef } from 'react';
import { useStore } from '../store/useStore';

/**
 * useQuickRun
 * Listens for the global "Trigger Run" action and executes the provided callback.
 */
export function useQuickRun(onRun: () => void) {
  const triggerCount = useStore(state => state.runTriggerCount);
  const lastCount = useRef(triggerCount);

  useEffect(() => {
    if (triggerCount > lastCount.current) {
      onRun();
      lastCount.current = triggerCount;
    }
  }, [triggerCount, onRun]);
}
