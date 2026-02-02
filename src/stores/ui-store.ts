/**
 * UI Store - Zustand store for UI state
 * Manages modals, sidebars, toasts, and other UI elements
 */

import { create } from 'zustand';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

interface Toast {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
  duration?: number;
}

interface UIState {
  // Sidebar
  isSidebarOpen: boolean;
  isAstrologerSidebarOpen: boolean;

  // Modals
  activeModal: string | null;
  modalData: Record<string, unknown> | null;

  // Toasts
  toasts: Toast[];

  // Loading states
  globalLoading: boolean;
  loadingMessage: string | null;

  // Mobile bottom sheet
  isBottomSheetOpen: boolean;
  bottomSheetContent: string | null;

  // Actions
  openSidebar: () => void;
  closeSidebar: () => void;
  toggleSidebar: () => void;

  openAstrologerSidebar: () => void;
  closeAstrologerSidebar: () => void;

  openModal: (modalId: string, data?: Record<string, unknown>) => void;
  closeModal: () => void;

  addToast: (toast: Omit<Toast, 'id'>) => void;
  removeToast: (id: string) => void;
  clearToasts: () => void;

  setGlobalLoading: (loading: boolean, message?: string) => void;

  openBottomSheet: (content: string) => void;
  closeBottomSheet: () => void;
}

export const useUIStore = create<UIState>((set, get) => ({
  // Initial state
  isSidebarOpen: false,
  isAstrologerSidebarOpen: false,
  activeModal: null,
  modalData: null,
  toasts: [],
  globalLoading: false,
  loadingMessage: null,
  isBottomSheetOpen: false,
  bottomSheetContent: null,

  // Sidebar actions
  openSidebar: () => set({ isSidebarOpen: true }),
  closeSidebar: () => set({ isSidebarOpen: false }),
  toggleSidebar: () => set({ isSidebarOpen: !get().isSidebarOpen }),

  openAstrologerSidebar: () => set({ isAstrologerSidebarOpen: true }),
  closeAstrologerSidebar: () => set({ isAstrologerSidebarOpen: false }),

  // Modal actions
  openModal: (modalId, data) => set({ activeModal: modalId, modalData: data || null }),
  closeModal: () => set({ activeModal: null, modalData: null }),

  // Toast actions
  addToast: (toast) => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const newToast = { ...toast, id };
    set({ toasts: [...get().toasts, newToast] });

    // Auto remove after duration
    const duration = toast.duration || 5000;
    setTimeout(() => {
      get().removeToast(id);
    }, duration);
  },

  removeToast: (id) => {
    set({ toasts: get().toasts.filter(t => t.id !== id) });
  },

  clearToasts: () => set({ toasts: [] }),

  // Loading actions
  setGlobalLoading: (loading, message) => {
    set({ globalLoading: loading, loadingMessage: message || null });
  },

  // Bottom sheet actions
  openBottomSheet: (content) => set({ isBottomSheetOpen: true, bottomSheetContent: content }),
  closeBottomSheet: () => set({ isBottomSheetOpen: false, bottomSheetContent: null }),
}));

// Export selectors
export const selectIsSidebarOpen = (state: UIState) => state.isSidebarOpen;
export const selectIsAstrologerSidebarOpen = (state: UIState) => state.isAstrologerSidebarOpen;
export const selectActiveModal = (state: UIState) => state.activeModal;
export const selectModalData = (state: UIState) => state.modalData;
export const selectToasts = (state: UIState) => state.toasts;
export const selectGlobalLoading = (state: UIState) => state.globalLoading;
export const selectLoadingMessage = (state: UIState) => state.loadingMessage;

// Toast helper hooks
export const useToast = () => {
  const addToast = useUIStore(state => state.addToast);

  return {
    success: (title: string, message?: string) => addToast({ type: 'success', title, message }),
    error: (title: string, message?: string) => addToast({ type: 'error', title, message }),
    warning: (title: string, message?: string) => addToast({ type: 'warning', title, message }),
    info: (title: string, message?: string) => addToast({ type: 'info', title, message }),
  };
};
