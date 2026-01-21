import { create } from 'zustand';

interface ToastState {
  visible: boolean;
  message: string;
  undoAction: (() => void) | null;
  toastId: number;
  showToast: (message: string, undoAction?: () => void) => void;
  hideToast: () => void;
}

export const useToastStore = create<ToastState>((set) => ({
  visible: false,
  message: '',
  undoAction: null,
  toastId: 0,

  showToast: (message, undoAction) => {
    set((state) => ({
      visible: true,
      message,
      undoAction: undoAction ?? null,
      toastId: state.toastId + 1,
    }));
  },

  hideToast: () => {
    set({
      visible: false,
      message: '',
      undoAction: null,
    });
  },
}));
