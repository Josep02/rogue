"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { createPortal } from "react-dom";
import { CheckCircle2, AlertCircle, Info, X } from "lucide-react";
import { cn } from "@/lib/utils";

export type ToastVariant = "success" | "error" | "info";

type Toast = {
  id: number;
  message: string;
  variant: ToastVariant;
};

type ToastContextValue = {
  /** Muestra un aviso efimero (por defecto informativo). */
  notify: (message: string, variant?: ToastVariant) => void;
};

const ToastContext = createContext<ToastContextValue | null>(null);

const VARIANT_META: Record<
  ToastVariant,
  { icon: typeof Info; dot: string }
> = {
  success: { icon: CheckCircle2, dot: "text-green-500" },
  error: { icon: AlertCircle, dot: "text-red-500" },
  info: { icon: Info, dot: "text-muted-foreground" },
};

const AUTO_DISMISS_MS = 3200;

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  // #app-shell no existe cuando este provider se monta: HydrationGate muestra un
  // loader y solo monta AppShell (que tiene ese id) tras hidratar. Por eso NO se
  // puede cachear el target una vez al montar (quedaria null para siempre y los
  // toasts nunca se pintarian). Se resuelve en cada render, ya con el DOM listo;
  // los toasts se disparan siempre por interaccion, mucho despues de la hidratacion.
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const portalTarget = mounted ? document.getElementById("app-shell") : null;
  const idRef = useRef(0);

  const dismiss = useCallback((id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const notify = useCallback(
    (message: string, variant: ToastVariant = "info") => {
      const id = ++idRef.current;
      setToasts((prev) => [...prev, { id, message, variant }]);
      setTimeout(() => dismiss(id), AUTO_DISMISS_MS);
    },
    [dismiss],
  );

  const value = useMemo(() => ({ notify }), [notify]);

  const overlay =
    portalTarget && toasts.length > 0
      ? createPortal(
          <div className="pointer-events-none absolute inset-x-0 top-0 z-[70] flex flex-col items-center gap-2 px-4 pt-[max(0.75rem,env(safe-area-inset-top))]">
            {toasts.map((t) => {
              const meta = VARIANT_META[t.variant];
              const Icon = meta.icon;
              return (
                <div
                  key={t.id}
                  role="status"
                  className="pointer-events-auto flex w-full max-w-sm items-center gap-2.5 rounded-2xl border border-border bg-surface px-4 py-3 shadow-2xl [animation:toast-in_0.2s_ease-out]"
                >
                  <Icon className={cn("size-5 shrink-0", meta.dot)} />
                  <p className="flex-1 text-sm font-medium">{t.message}</p>
                  <button
                    type="button"
                    onClick={() => dismiss(t.id)}
                    aria-label="Cerrar aviso"
                    className="flex size-7 shrink-0 items-center justify-center rounded-full text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                  >
                    <X className="size-4" />
                  </button>
                </div>
              );
            })}
          </div>,
          portalTarget,
        )
      : null;

  return (
    <ToastContext.Provider value={value}>
      {children}
      {overlay}
    </ToastContext.Provider>
  );
}

export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast debe usarse dentro de ToastProvider");
  return ctx;
}
