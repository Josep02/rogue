"use client";

import { useEffect } from "react";
import { RotateCcw, TriangleAlert } from "lucide-react";

export default function Error({
  error,
  unstable_retry,
}: {
  error: Error & { digest?: string };
  unstable_retry: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-4 px-8 text-center">
      <span className="flex size-14 items-center justify-center rounded-2xl bg-muted text-muted-foreground">
        <TriangleAlert className="size-6" />
      </span>
      <div>
        <h2 className="text-lg font-semibold tracking-tight">Algo ha fallado</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Ha ocurrido un error inesperado. Tus datos guardados no se han perdido.
        </p>
      </div>
      <button
        type="button"
        onClick={() => unstable_retry()}
        className="flex items-center gap-2 rounded-full bg-accent px-6 py-3 text-sm font-medium text-accent-foreground transition-transform active:scale-[0.98]"
      >
        <RotateCcw className="size-4" />
        Reintentar
      </button>
    </div>
  );
}
