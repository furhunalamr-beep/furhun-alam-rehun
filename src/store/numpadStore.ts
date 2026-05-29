import { create } from 'zustand';

interface NumpadState {
  isOpen: boolean;
  value: string;
  label: string;
  onUpdate: (val: string) => void;
  openNumpad: (label: string, initialValue: string, onUpdate: (val: string) => void) => void;
  closeNumpad: () => void;
  updateValue: (val: string) => void;
  submitValue: () => void;
}

export const useNumpadStore = create<NumpadState>((set, get) => ({
  isOpen: false,
  value: '',
  label: '',
  onUpdate: () => {},
  openNumpad: (label, initialValue, onUpdate) => set({ isOpen: true, label, value: initialValue, onUpdate }),
  closeNumpad: () => set({ isOpen: false }),
  updateValue: (val) => {
    set({ value: val });
    get().onUpdate(val);
  },
  submitValue: () => {
    // get().onUpdate(get().value); // Already updating in real-time
    set({ isOpen: false });
  }
}));
