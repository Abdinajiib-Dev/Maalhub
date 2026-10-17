import React, { createContext, useContext, useState, useCallback, useMemo } from 'react';
import { 
  AlertTriangle, 
  CheckCircle2, 
  AlertCircle, 
  Info, 
  X 
} from 'lucide-react';

const DialogContext = createContext(null);

export const DialogProvider = ({ children }) => {
  // Modal state
  const [dialogState, setDialogState] = useState(null);
  
  // Toast notifications state
  const [toasts, setToasts] = useState([]);

  // Dismiss toast
  const dismissToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  // Show Toast
  const showToast = useCallback((message, type = 'info', duration = 3500) => {
    const id = Date.now() + Math.random().toString(36).slice(2, 7);
    setToasts((prev) => [...prev, { id, message, type }]);
    
    setTimeout(() => {
      dismissToast(id);
    }, duration);
  }, [dismissToast]);

  // Convenience toast methods
  const toast = useMemo(() => {
    const fn = (msg, type, duration) => showToast(msg, type, duration);
    fn.success = (msg, duration) => showToast(msg, 'success', duration);
    fn.error = (msg, duration) => showToast(msg, 'error', duration);
    fn.info = (msg, duration) => showToast(msg, 'info', duration);
    fn.warning = (msg, duration) => showToast(msg, 'warning', duration);
    return fn;
  }, [showToast]);

  // Confirm dialog (returns Promise<boolean>)
  const confirm = useCallback(({
    title = 'Confirm Action',
    message = 'Are you sure you want to proceed?',
    confirmText = 'Confirm',
    cancelText = 'Cancel',
    variant = 'danger'
  }) => {
    return new Promise((resolve) => {
      setDialogState({
        type: 'confirm',
        title,
        message,
        confirmText,
        cancelText,
        variant,
        onConfirm: () => {
          setDialogState(null);
          resolve(true);
        },
        onCancel: () => {
          setDialogState(null);
          resolve(false);
        }
      });
    });
  }, []);

  // Alert dialog (returns Promise<void>)
  const showAlert = useCallback(({
    title = 'Notice',
    message = '',
    buttonText = 'Dismiss',
    variant = 'info'
  }) => {
    return new Promise((resolve) => {
      setDialogState({
        type: 'alert',
        title,
        message,
        confirmText: buttonText,
        variant,
        onConfirm: () => {
          setDialogState(null);
          resolve();
        },
        onCancel: () => {
          setDialogState(null);
          resolve();
        }
      });
    });
  }, []);

  return (
    <DialogContext.Provider value={{ confirm, showAlert, toast }}>
      {children}

      {/* Floating Toast Notification Container */}
      {toasts.length > 0 && (
        <div className="fixed top-5 right-5 z-[9999] flex flex-col gap-2 max-w-sm w-full pointer-events-none px-4 sm:px-0">
          {toasts.map((t) => (
            <div
              key={t.id}
              className={`pointer-events-auto flex items-start gap-3 p-3.5 rounded-xl shadow-lg border text-xs font-medium backdrop-blur-md transition-all ${
                t.type === 'success' 
                  ? 'bg-emerald-50/95 border-emerald-200 text-emerald-900' 
                  : t.type === 'error'
                  ? 'bg-red-50/95 border-red-200 text-red-900'
                  : t.type === 'warning'
                  ? 'bg-amber-50/95 border-amber-200 text-amber-900'
                  : 'bg-white/95 border-gray-200 text-gray-800'
              }`}
            >
              <div className="mt-0.5 flex-shrink-0">
                {t.type === 'success' && <CheckCircle2 size={16} className="text-emerald-600" />}
                {t.type === 'error' && <AlertCircle size={16} className="text-red-600" />}
                {t.type === 'warning' && <AlertTriangle size={16} className="text-amber-600" />}
                {t.type === 'info' && <Info size={16} className="text-primary" />}
              </div>
              <p className="flex-1 leading-snug">{t.message}</p>
              <button
                onClick={() => dismissToast(t.id)}
                className="text-gray-400 hover:text-gray-700 transition-colors p-0.5"
              >
                <X size={14} />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Modern Dialog / Modal Box */}
      {dialogState && (
        <div 
          className="fixed inset-0 z-[9990] overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4"
          onClick={dialogState.onCancel}
        >
          <div 
            className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-gray-100 p-6 space-y-4 transition-all"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Icon + Title Header */}
            <div className="flex items-start gap-3.5">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                dialogState.variant === 'danger' || dialogState.variant === 'error'
                  ? 'bg-red-50 text-red-600 border border-red-100'
                  : dialogState.variant === 'warning'
                  ? 'bg-amber-50 text-amber-600 border border-amber-100'
                  : dialogState.variant === 'success'
                  ? 'bg-emerald-50 text-emerald-600 border border-emerald-100'
                  : 'bg-primary/10 text-primary border border-primary/20'
              }`}>
                {dialogState.variant === 'danger' || dialogState.variant === 'error' ? (
                  <AlertCircle size={20} />
                ) : dialogState.variant === 'warning' ? (
                  <AlertTriangle size={20} />
                ) : dialogState.variant === 'success' ? (
                  <CheckCircle2 size={20} />
                ) : (
                  <Info size={20} />
                )}
              </div>

              <div className="flex-1 min-w-0">
                <h3 className="text-base font-bold text-gray-900 leading-snug">
                  {dialogState.title}
                </h3>
                <p className="text-xs sm:text-sm text-gray-600 mt-1 leading-relaxed whitespace-pre-line">
                  {dialogState.message}
                </p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-gray-100">
              {dialogState.type === 'confirm' && (
                <button
                  type="button"
                  onClick={dialogState.onCancel}
                  className="px-4 py-2 text-xs font-semibold rounded-xl border border-gray-200 text-gray-700 hover:bg-gray-50 transition-colors cursor-pointer"
                >
                  {dialogState.cancelText || 'Cancel'}
                </button>
              )}

              <button
                type="button"
                autoFocus
                onClick={dialogState.onConfirm}
                className={`px-4 py-2 text-xs font-bold rounded-xl transition-all shadow-xs cursor-pointer ${
                  dialogState.variant === 'danger' || dialogState.variant === 'error'
                    ? 'bg-red-600 hover:bg-red-700 text-white'
                    : dialogState.variant === 'warning'
                    ? 'bg-amber-600 hover:bg-amber-700 text-white'
                    : dialogState.variant === 'success'
                    ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                    : 'bg-primary hover:bg-secondary text-white'
                }`}
              >
                {dialogState.confirmText || 'OK'}
              </button>
            </div>
          </div>
        </div>
      )}
    </DialogContext.Provider>
  );
};

export const useDialog = () => {
  const context = useContext(DialogContext);
  if (!context) {
    throw new Error('useDialog must be used within a DialogProvider');
  }
  return context;
};
