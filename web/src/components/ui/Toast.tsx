'use client';

import { useToastStore } from '@/stores/toastStore';
import { X, CheckCircle, AlertCircle, Info } from 'lucide-react';
import { cn } from '@/lib/utils';

const icons = {
  success: CheckCircle,
  error: AlertCircle,
  info: Info,
};

const styles = {
  success: 'bg-green-50 border-green-200 text-green-800',
  error: 'bg-red-50 border-red-200 text-red-800',
  info: 'bg-blue-50 border-blue-200 text-blue-800',
};

export default function ToastContainer() {
  const { toasts, removeToast } = useToastStore();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2 max-w-sm w-full pointer-events-none">
      {toasts.map((toast) => {
        const Icon = icons[toast.type];
        return (
          <div
            key={toast.id}
            className={cn(
              'pointer-events-auto flex items-center gap-3 px-4 py-3 rounded-[10px] border shadow-lg animate-in fade-in slide-in-from-right duration-300',
              styles[toast.type],
            )}
          >
            <Icon className="w-5 h-5 flex-shrink-0" />
            <p className="text-sm flex-1">{toast.message}</p>
            <button
              onClick={() => removeToast(toast.id)}
              className="flex-shrink-0 opacity-60 hover:opacity-100"
              aria-label="Dismiss"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
}
