"use client";
import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { CheckCircle2, CircleAlert, X } from "lucide-react";

type Toast = { id: number; title: string; description?: string; tone?: "success" | "error" };
const ToastContext = createContext<(toast: Omit<Toast, "id">) => void>(() => {});
let externalToast: ((toast: Omit<Toast, "id">) => void) | null = null;
export function toast(input: Omit<Toast, "id">) { externalToast?.(input); }
export function useToast() { return useContext(ToastContext); }

export function Toaster() {
  const [items, setItems] = useState<Toast[]>([]);
  const push = useCallback((input: Omit<Toast, "id">) => {
    const item = { ...input, id: Date.now() + Math.random() };
    setItems((current) => [...current, item]);
    window.setTimeout(() => setItems((current) => current.filter((entry) => entry.id !== item.id)), 3800);
  }, []);
  useEffect(() => { externalToast = push; return () => { externalToast = null; }; }, [push]);
  return (
    <ToastContext.Provider value={push}>
      <div className="fixed right-4 top-4 z-[100] flex w-[min(360px,calc(100vw-32px))] flex-col gap-2">
        <AnimatePresence>
          {items.map((item) => (
            <motion.div key={item.id} initial={{ opacity: 0, y: -12, scale: .98 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -8, scale: .98 }} className="cue-panel flex items-start gap-3 p-4 shadow-2xl">
              {item.tone === "error" ? <CircleAlert className="mt-0.5 size-4 text-[var(--danger)]" /> : <CheckCircle2 className="mt-0.5 size-4 text-[var(--success)]" />}
              <div className="min-w-0 flex-1"><div className="text-sm font-semibold">{item.title}</div>{item.description && <div className="mt-1 text-xs leading-5 text-[var(--muted)]">{item.description}</div>}</div>
              <button onClick={() => setItems((current) => current.filter((entry) => entry.id !== item.id))} aria-label="Dismiss notification" className="text-[var(--faint)] hover:text-white"><X className="size-4" /></button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}
