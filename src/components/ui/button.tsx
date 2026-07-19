import { type ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

type ButtonVariant = "primary" | "secondary" | "ghost";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  /** Ocupa todo el ancho disponible (CTAs de pie de modal/pantalla). */
  fullWidth?: boolean;
};

// Estilo unico para botones de accion (texto). Los circulares icon-only siguen
// su propio patron documentado (size-10 rounded-full bg-surface hover:bg-muted)
// y no pasan por aqui. La forma pill + bg-accent es la convencion dominante de
// la app; secondary/ghost comparten forma para que la jerarquia sea coherente.
const BASE =
  "inline-flex items-center justify-center gap-2 rounded-full px-5 py-3 text-sm font-medium transition-transform active:scale-[0.98] disabled:pointer-events-none disabled:opacity-50";

const VARIANTS: Record<ButtonVariant, string> = {
  primary: "bg-accent text-accent-foreground",
  secondary:
    "border border-border bg-surface text-muted-foreground transition-colors hover:bg-muted hover:text-foreground",
  ghost: "text-muted-foreground transition-colors hover:bg-muted hover:text-foreground",
};

export function Button({
  className,
  variant = "primary",
  fullWidth,
  type = "button",
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      className={cn(BASE, VARIANTS[variant], fullWidth && "w-full", className)}
      {...props}
    />
  );
}
