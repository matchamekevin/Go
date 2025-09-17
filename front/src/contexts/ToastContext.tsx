import React, { createContext, useContext, useRef, useState, ReactNode } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import ToastOverlay from '../components/ToastOverlay';
import type { ToastType } from '../components/ToastOverlay';

type ToastContextType = {
  showToast: (message: string, type?: ToastType, duration?: number, position?: 'top' | 'bottom') => void;
  hideToast: () => void;
};

const ToastContext = createContext<ToastContextType | undefined>(undefined);

type ToastState = {
  visible: boolean;
  message: string | null;
  type: ToastType;
  duration: number;
  position: 'top' | 'bottom';
};

export const ToastProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [toast, setToast] = useState<ToastState>({
    visible: false,
    message: null,
    type: 'info',
    duration: 3500,
    position: 'top',
  });
  // lastMessage removed — no dev banner in production
  const clearTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const showToast = (msg: string, t: ToastType = 'info', d = 3500, pos: 'top' | 'bottom' = 'top') => {
    console.log('[ToastProvider] showToast called ->', { msg, t, d, pos });
    // cancel any pending clear
    if (clearTimerRef.current) {
      clearTimeout(clearTimerRef.current);
      clearTimerRef.current = null;
    }
    // atomically set all toast fields to avoid races between message & visible
    setToast({ visible: true, message: msg, type: t, duration: d, position: pos });
  };

  const hideToast = () => {
    console.log('[ToastProvider] hideToast called');
    // mark hidden; keep message for animation-out
    setToast((prev) => ({ ...prev, visible: false }));
    if (clearTimerRef.current) {
      clearTimeout(clearTimerRef.current);
    }
    // clear message after the overlay finished its hide animation
    clearTimerRef.current = setTimeout(() => {
      setToast((prev) => ({ ...prev, message: null }));
      clearTimerRef.current = null;
    }, 320);
  };

  return (
    <ToastContext.Provider value={{ showToast, hideToast }}>
      {children}
  {/* no dev banner */}
      <ToastOverlay
        visible={toast.visible}
        message={toast.message}
        type={toast.type}
        onHide={hideToast}
        duration={toast.duration}
        position={toast.position}
      />
    </ToastContext.Provider>
  );
};

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within a ToastProvider');
  return ctx;
}

export default ToastContext;

const styles = StyleSheet.create({});
