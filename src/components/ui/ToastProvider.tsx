"use client";

import { useState, useEffect, createContext, useContext, useCallback } from "react";
import { CheckCircle2, AlertCircle, Info, X } from "lucide-react";

interface ToastItem {
  id: string;
  title?: string;
  message: string;
  type?: "success" | "info" | "error";
  duration?: number;
}

interface ToastContextType {
  toast: (options: { title?: string; message: string; type?: "success" | "info" | "error"; duration?: number }) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const toast = useCallback(({ title, message, type = "success", duration = 3000 }: {
    title?: string;
    message: string;
    type?: "success" | "info" | "error";
    duration?: number;
  }) => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, title, message, type, duration }]);

    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, duration);
  }, []);

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      {/* Floating Toasts Container */}
      <div className="fixed bottom-5 right-5 z-[999] flex flex-col gap-2 max-w-sm w-full pointer-events-none px-4 sm:px-0">
        {toasts.map((t) => {
          const isSuccess = t.type === "success";
          const isError = t.type === "error";

          return (
            <div
              key={t.id}
              className="pointer-events-auto flex items-start gap-3 p-4 rounded-2xl bg-[#F8F4EE] border border-[#E9DCCB] text-[#563A29] shadow-xl animate-in slide-in-from-bottom-3 fade-in duration-200"
            >
              <div className="shrink-0 mt-0.5">
                {isSuccess && <CheckCircle2 className="w-5 h-5 text-[#3d5a2d]" />}
                {isError && <AlertCircle className="w-5 h-5 text-red-600" />}
                {!isSuccess && !isError && <Info className="w-5 h-5 text-[#CDAE91]" />}
              </div>

              <div className="flex-1 min-w-0">
                {t.title && (
                  <h4 className="font-serif font-bold text-xs text-[#563A29]">
                    {t.title}
                  </h4>
                )}
                <p className="text-xs text-[#7D6B5E] mt-0.5 leading-relaxed">
                  {t.message}
                </p>
              </div>

              <button
                type="button"
                onClick={() => removeToast(t.id)}
                className="shrink-0 p-1 text-[#7D6B5E] hover:text-[#563A29] transition-colors rounded-lg"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    return {
      toast: (opts: any) => console.log("Toast:", opts),
    };
  }
  return context;
}

