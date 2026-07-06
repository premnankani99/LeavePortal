import { createContext, useContext, useState, useCallback } from 'react';
import { CheckCircle, XCircle, AlertTriangle, Info, X } from 'lucide-react';

const ToastContext = createContext(null);

export const useToast = () => {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used inside ToastProvider');
  return ctx;
};

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, type = 'info', duration = 4000) => {
    const id = Date.now() + Math.random();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, duration);
  }, []);

  const removeToast = useCallback((id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  const toast = {
    success: (msg) => addToast(msg, 'success'),
    error: (msg) => addToast(msg, 'error'),
    warning: (msg) => addToast(msg, 'warning'),
    info: (msg) => addToast(msg, 'info'),
  };

  const configs = {
    success: { icon: CheckCircle, bg: 'bg-emerald-50', border: 'border-emerald-200', text: 'text-emerald-800', icon_cls: 'text-emerald-500' },
    error:   { icon: XCircle,     bg: 'bg-red-50',     border: 'border-red-200',     text: 'text-red-800',     icon_cls: 'text-red-500' },
    warning: { icon: AlertTriangle,bg: 'bg-amber-50',  border: 'border-amber-200',   text: 'text-amber-800',   icon_cls: 'text-amber-500' },
    info:    { icon: Info,         bg: 'bg-purple-50',   border: 'border-purple-200',    text: 'text-purple-800',    icon_cls: 'text-[#7e57c2]' },
  };

  return (
    <ToastContext.Provider value={toast}>
      {children}

      {/* Toast Container - fixed bottom-right */}
      <div className="fixed bottom-6 right-6 z-[9999] flex flex-col gap-3 pointer-events-none" style={{ maxWidth: '380px' }}>
        {toasts.map(t => {
          const c = configs[t.type] || configs.info;
          const Icon = c.icon;
          return (
            <div
              key={t.id}
              className={`pointer-events-auto flex items-start gap-3 px-4 py-3.5 rounded-xl border shadow-xl ${c.bg} ${c.border} animate-in slide-in-from-right-5 fade-in duration-300`}
            >
              <Icon className={`w-5 h-5 mt-0.5 shrink-0 ${c.icon_cls}`} />
              <p className={`text-sm font-medium flex-1 ${c.text}`}>{t.message}</p>
              <button
                onClick={() => removeToast(t.id)}
                className={`shrink-0 ml-1 hover:opacity-60 transition-opacity ${c.icon_cls}`}
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}
