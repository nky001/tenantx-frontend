import { ReactNode, useState, useEffect, useCallback } from 'react';

export interface Toast {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message?: string;
  duration?: number;
}

export interface ToastContextType {
  toasts: Toast[];
  addToast: (toast: Omit<Toast, 'id'>) => void;
  removeToast: (id: string) => void;
}

export function useToast(): ToastContextType {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  }, []);

  const addToast = useCallback((toast: Omit<Toast, 'id'>) => {
    const id = crypto.randomUUID();
    const newToast = { ...toast, id, duration: toast.duration ?? 5000 };
    setToasts(prev => [...prev, newToast]);

    if (newToast.duration > 0) {
      setTimeout(() => removeToast(id), newToast.duration);
    }
  }, [removeToast]);

  return { toasts, addToast, removeToast };
}

export function ToastContainer({ toasts, removeToast }: { toasts: Toast[]; removeToast: (id: string) => void }) {
  return (
    <div className="fixed top-4 right-4 z-50 space-y-2 max-w-sm">
      {toasts.map((toast) => (
        <Toast key={toast.id} toast={toast} onClose={() => removeToast(toast.id)} />
      ))}
    </div>
  );
}

function Toast({ toast, onClose }: { toast: Toast; onClose: () => void }) {
  useEffect(() => {
    const timer = setTimeout(() => onClose(), toast.duration ?? 5000);
    return () => clearTimeout(timer);
  }, [toast.duration, onClose]);

  const icons = {
    success: '✓',
    error: '✕',
    warning: '⚠',
    info: 'ℹ'
  };

  const colors = {
    success: 'bg-green-50 border-green-200 text-green-800',
    error: 'bg-red-50 border-red-200 text-red-800',
    warning: 'bg-yellow-50 border-yellow-200 text-yellow-800',
    info: 'bg-blue-50 border-blue-200 text-blue-800'
  };

  return (
    <div className={`p-4 rounded-lg border shadow-lg ${colors[toast.type]}`}>
      <div className="flex items-start gap-3">
        <span className="text-lg flex-shrink-0">{icons[toast.type]}</span>
        <div className="flex-1 min-w-0">
          <h4 className="font-semibold text-sm">{toast.title}</h4>
          {toast.message && <p className="text-sm mt-1 opacity-90">{toast.message}</p>}
        </div>
        <button
          onClick={onClose}
          className="text-current opacity-60 hover:opacity-100 flex-shrink-0"
        >
          ×
        </button>
      </div>
    </div>
  );
}

export function ConfirmationDialog({
  open,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  onConfirm,
  onCancel,
  type = 'danger'
}: {
  open: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel: () => void;
  type?: 'danger' | 'warning' | 'info';
}) {
  if (!open) return null;

  const colors = {
    danger: 'bg-red-600 hover:bg-red-700 focus:ring-red-500',
    warning: 'bg-yellow-600 hover:bg-yellow-700 focus:ring-yellow-500',
    info: 'bg-blue-600 hover:bg-blue-700 focus:ring-blue-500'
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4">
      <div className="w-full max-w-md card shadow-2xl animate-in fade-in-0 zoom-in-95 duration-200">
        <div className="px-6 py-4 border-b border-border">
          <h3 className="text-lg font-semibold text-foreground">{title}</h3>
        </div>
        <div className="px-6 py-4">
          <p className="text-secondary">{message}</p>
        </div>
        <div className="flex gap-3 px-6 py-4 border-t border-border bg-accent/50">
          <button
            onClick={onCancel}
            className="flex-1 btn-secondary"
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            className={`flex-1 btn-primary ${colors[type]}`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}

export function LoadingSpinner({ size = 'md', className = '' }: { size?: 'sm' | 'md' | 'lg'; className?: string }) {
  const sizes = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8'
  };

  return (
    <div className={`${sizes[size]} ${className}`}>
      <div className="w-full h-full border-2 border-primary/30 border-t-primary rounded-full animate-spin"></div>
    </div>
  );
}

export function EnhancedModal({
  open,
  title,
  onClose,
  children,
  size = 'md',
  showCloseButton = true
}: {
  open: boolean;
  title: string;
  onClose: () => void;
  children: ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showCloseButton?: boolean;
}) {
  if (!open) return null;

  const sizes = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl'
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4 animate-in fade-in-0 duration-200">
      <div className={`w-full ${sizes[size]} card shadow-2xl animate-in fade-in-0 zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto`}>
        <div className="flex items-center justify-between border-b border-border px-6 py-4 sticky top-0 bg-background">
          <h3 className="text-lg font-semibold text-foreground">{title}</h3>
          {showCloseButton && (
            <button
              onClick={onClose}
              className="text-secondary hover:text-foreground text-xl leading-none w-6 h-6 flex items-center justify-center rounded hover:bg-secondary/20"
            >
              ×
            </button>
          )}
        </div>
        <div className="px-6 py-6">{children}</div>
      </div>
    </div>
  );
}

export function EnhancedStatCard({
  label,
  value,
  accent,
  icon,
  trend
}: {
  label: string;
  value: string | number;
  accent: string;
  icon?: ReactNode;
  trend?: { value: number; label: string };
}) {
  return (
    <div className="card p-6 group">
      <div className="flex items-center justify-between mb-4">
        <div className={`flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${accent} text-white shadow-lg`}>
          {icon || <span className="text-lg font-bold">{label.slice(0, 1)}</span>}
        </div>
        {trend && (
          <div className={`text-xs px-2 py-1 rounded-full ${trend.value >= 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
            {trend.value >= 0 ? '+' : ''}{trend.value}% {trend.label}
          </div>
        )}
      </div>
      <p className="text-sm font-medium text-secondary mb-1">{label}</p>
      <p className="text-3xl font-bold text-foreground">{value}</p>
    </div>
  );
}

export function EnhancedEmptyState({
  title,
  description,
  action,
  icon
}: {
  title: string;
  description: string;
  action?: ReactNode;
  icon?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-border bg-gradient-to-br from-accent/30 to-accent/10 p-12 text-center">
      {icon && <div className="mb-4 text-6xl">{icon}</div>}
      <h3 className="text-xl font-semibold text-foreground mb-2">{title}</h3>
      <p className="max-w-md text-secondary mb-6 leading-relaxed">{description}</p>
      {action && <div className="flex flex-col sm:flex-row gap-3">{action}</div>}
    </div>
  );
}