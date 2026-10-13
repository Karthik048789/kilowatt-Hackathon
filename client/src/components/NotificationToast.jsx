import React, { useEffect } from 'react';
import { CheckCircle2, AlertTriangle, AlertCircle, Info, X } from 'lucide-react';

export default function NotificationToast({ toast, onClose }) {
  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => {
      onClose();
    }, 4500);
    return () => clearTimeout(timer);
  }, [toast, onClose]);

  if (!toast) return null;

  const getStyle = () => {
    switch (toast.type) {
      case 'success':
        return {
          icon: <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />,
          bg: 'bg-emerald-950/90 border-emerald-500/50 text-emerald-200'
        };
      case 'warning':
        return {
          icon: <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0" />,
          bg: 'bg-amber-950/90 border-amber-500/50 text-amber-200'
        };
      case 'error':
        return {
          icon: <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />,
          bg: 'bg-rose-950/90 border-rose-500/50 text-rose-200'
        };
      default:
        return {
          icon: <Info className="w-5 h-5 text-blue-400 shrink-0" />,
          bg: 'bg-slate-900/90 border-slate-700 text-slate-200'
        };
    }
  };

  const style = getStyle();

  return (
    <div className="fixed bottom-6 right-6 z-50 animate-slide-up">
      <div className={`flex items-center space-x-3 px-4 py-3 rounded-2xl border shadow-2xl backdrop-blur-md text-xs font-medium max-w-md ${style.bg}`}>
        {style.icon}
        <span className="flex-1">{toast.message}</span>
        <button
          onClick={onClose}
          className="p-1 text-slate-400 hover:text-white transition"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
