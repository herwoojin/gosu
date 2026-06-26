import { cn } from "@/lib/utils";
import Link from "next/link";

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "outline" | "ghost" | "danger";
  size?: "md" | "lg";
};

const btnBase =
  "inline-flex items-center justify-center gap-2 rounded-xl font-semibold transition active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none";
const btnVariant = {
  primary: "bg-primary text-white hover:bg-blue-700",
  outline: "border border-slate-300 bg-white text-ink hover:bg-slate-50",
  ghost: "text-ink hover:bg-slate-100",
  danger: "bg-danger text-white hover:bg-red-700",
};
const btnSize = { md: "h-11 px-4 text-sm", lg: "h-14 px-5 text-base" };

export function Button({ variant = "primary", size = "md", className, ...props }: ButtonProps) {
  return <button className={cn(btnBase, btnVariant[variant], btnSize[size], className)} {...props} />;
}

export function LinkButton({
  href,
  variant = "primary",
  size = "md",
  className,
  children,
}: {
  href: string;
  variant?: ButtonProps["variant"];
  size?: ButtonProps["size"];
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <Link href={href} className={cn(btnBase, btnVariant[variant!], btnSize[size!], className)}>
      {children}
    </Link>
  );
}

export function Card({ className, children }: { className?: string; children: React.ReactNode }) {
  return (
    <div className={cn("rounded-2xl bg-surface p-4 shadow-card", className)}>{children}</div>
  );
}

export function Badge({
  children,
  tone = "neutral",
}: {
  children: React.ReactNode;
  tone?: "neutral" | "primary" | "success" | "warn" | "danger";
}) {
  const tones = {
    neutral: "bg-slate-100 text-muted",
    primary: "bg-primary-soft text-primary",
    success: "bg-green-50 text-success",
    warn: "bg-amber-50 text-warn",
    danger: "bg-red-50 text-danger",
  };
  return (
    <span className={cn("inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold", tones[tone])}>
      {children}
    </span>
  );
}

export function SectionTitle({ children, action }: { children: React.ReactNode; action?: React.ReactNode }) {
  return (
    <div className="mb-3 mt-6 flex items-center justify-between px-1">
      <h2 className="text-lg font-bold text-ink">{children}</h2>
      {action}
    </div>
  );
}

export function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className={cn(
        "h-12 w-full rounded-xl border border-slate-300 bg-white px-4 text-sm outline-none focus:border-primary",
        props.className
      )}
    />
  );
}

export function Textarea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      {...props}
      className={cn(
        "min-h-28 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none focus:border-primary",
        props.className
      )}
    />
  );
}

export function Select(props: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      {...props}
      className={cn(
        "h-12 w-full rounded-xl border border-slate-300 bg-white px-3 text-sm outline-none focus:border-primary",
        props.className
      )}
    />
  );
}
