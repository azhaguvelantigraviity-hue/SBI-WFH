import React, { createContext, useContext, useState, useCallback } from 'react';
import { Check, X, Info, AlertTriangle } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';

const ToastContext = createContext();

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((type, title, msg) => {
    const id = Math.random().toString(36).slice(2);
    setToasts(prev => [...prev, { id, type, title, msg }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4000);
  }, []);

  const removeToast = useCallback((id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ addToast }}>
      {children}
      <div className="fixed bottom-6 right-6 z-[9999] flex flex-col gap-3">
        <AnimatePresence>
          {toasts.map(toast => (
            <ToastItem key={toast.id} {...toast} onRemove={() => removeToast(toast.id)} />
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}

function ToastItem({ type, title, msg, onRemove }) {
  const icons = {
    success: <Check className="w-3.5 h-3.5" />,
    error: <X className="w-3.5 h-3.5" />,
    info: <Info className="w-3.5 h-3.5" />,
    warning: <AlertTriangle className="w-3.5 h-3.5" />,
  };

  const colors = {
    success: 'border-success text-success bg-success/10',
    error: 'border-danger text-danger bg-danger/10',
    info: 'border-info text-info bg-info/10',
    warning: 'border-warning text-warning bg-warning/10',
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 20, scale: 0.95 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: 20, scale: 0.95 }}
      className="bg-card-light dark:bg-card-dark border border-border-light dark:border-border-dark rounded-xl p-4 shadow-premium dark:shadow-premium-dark flex gap-3 min-w-[300px] max-w-[400px]"
    >
      <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${colors[type]}`}>
        {icons[type]}
      </div>
      <div className="flex-1">
        <h4 className="text-sm font-semibold text-text-primary dark:text-text-dark-primary">{title}</h4>
        {msg && <p className="text-xs text-text-secondary dark:text-text-dark-secondary mt-1">{msg}</p>}
      </div>
      <button onClick={onRemove} className="text-text-muted hover:text-text-primary dark:text-text-dark-muted dark:hover:text-text-dark-primary transition-colors">
        <X className="w-4 h-4" />
      </button>
    </motion.div>
  );
}

export const useToast = () => useContext(ToastContext);
