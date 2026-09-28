import React, { createContext, useContext, useState, useCallback } from 'react';
import { CheckCircle2, AlertTriangle, AlertCircle, Info, X } from 'lucide-react';

export type ToastType = 'success' | 'warning' | 'danger' | 'info';

export interface ToastMessage {
  id: string;
  type: ToastType;
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
  duration?: number;
}

interface ToastContextType {
  toasts: ToastMessage[];
  showToast: (toast: Omit<ToastMessage, 'id'>) => void;
  removeToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showToast = useCallback(
    ({ duration = 4000, ...toast }: Omit<ToastMessage, 'id'>) => {
      const id = `toast-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`;
      const newToast = { ...toast, id, duration };

      setToasts((prev) => [...prev, newToast]);

      if (duration > 0) {
        setTimeout(() => {
          removeToast(id);
        }, duration);
      }
    },
    [removeToast]
  );

  return (
    <ToastContext.Provider value={{ toasts, showToast, removeToast }}>
      {children}
      {/* Toast Render Overlay */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2.5 max-w-md w-full pointer-events-none">
        {toasts.map((toast) => {
          const isSuccess = toast.type === 'success';
          const isWarning = toast.type === 'warning';
          const isDanger = toast.type === 'danger';

          return (
            <div
              key={toast.id}
              className={`pointer-events-auto flex items-start gap-3 p-4 rounded-card border shadow-popover transition-all animate-in slide-in-from-bottom-5 duration-200 bg-surface ${
                isSuccess
                  ? 'border-success/30 text-text'
                  : isWarning
                  ? 'border-warning/30 text-text'
                  : isDanger
                  ? 'border-danger/30 text-text'
                  : 'border-border text-text'
              }`}
            >
              <div className="mt-0.5 shrink-0">
                {isSuccess && <CheckCircle2 className="w-5 h-5 text-success" />}
                {isWarning && <AlertTriangle className="w-5 h-5 text-warning" />}
                {isDanger && <AlertCircle className="w-5 h-5 text-danger" />}
                {!isSuccess && !isWarning && !isDanger && <Info className="w-5 h-5 text-primary" />}
              </div>

              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-text">{toast.title}</p>
                {toast.description && (
                  <p className="text-xs text-muted mt-0.5 leading-relaxed">{toast.description}</p>
                )}
                {toast.actionLabel && toast.onAction && (
                  <button
                    onClick={() => {
                      toast.onAction?.();
                      removeToast(toast.id);
                    }}
                    className="mt-2 text-xs font-medium text-primary hover:text-primary-hover underline underline-offset-2 transition-colors"
                  >
                    {toast.actionLabel}
                  </button>
                )}
              </div>

              <button
                onClick={() => removeToast(toast.id)}
                className="text-muted hover:text-text p-1 rounded hover:bg-background transition-colors shrink-0"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
};

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}
