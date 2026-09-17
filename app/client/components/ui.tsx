import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';

/* --------------------------------- Button --------------------------------- */

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'md' | 'lg' | 'sm';
  loading?: boolean;
  block?: boolean;
};

export function Button({
  variant = 'primary',
  size = 'md',
  loading = false,
  block = false,
  className = '',
  children,
  disabled,
  ...rest
}: ButtonProps) {
  const base =
    'inline-flex items-center justify-center gap-2 rounded-xl font-semibold transition-colors disabled:opacity-55 disabled:cursor-not-allowed';
  const variants = {
    primary: 'bg-leaf-500 text-white hover:bg-leaf-600 active:bg-leaf-700',
    secondary: 'bg-white text-ink border border-sand-200 hover:bg-sand-50',
    ghost: 'text-leaf-600 hover:bg-leaf-50',
    danger: 'bg-alert-500 text-white hover:bg-alert-600'
  } as const;
  const sizes = {
    sm: 'px-3 py-2 text-sm min-h-[40px]',
    md: 'px-4 py-2.5 text-[15px] min-h-[44px]',
    lg: 'px-5 py-4 text-lg min-h-[56px]'
  } as const;
  return (
    <button
      className={`${base} ${variants[variant]} ${sizes[size]} ${block ? 'w-full' : ''} ${className}`}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      {...rest}
    >
      {loading && <Spinner className="h-4 w-4" />}
      {children}
    </button>
  );
}

export function Spinner({ className = 'h-5 w-5' }: { className?: string }) {
  return (
    <svg className={`animate-spin ${className}`} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" className="opacity-25" />
      <path d="M22 12a10 10 0 0 1-10 10" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
    </svg>
  );
}

/* ---------------------------------- Card ---------------------------------- */

export function Card({
  children,
  className = '',
  as: As = 'section'
}: {
  children: React.ReactNode;
  className?: string;
  as?: any;
}) {
  return <As className={`cc-card p-4 sm:p-5 ${className}`}>{children}</As>;
}

export function SectionTitle({
  children,
  action
}: {
  children: React.ReactNode;
  action?: React.ReactNode;
}) {
  return (
    <div className="mb-3 flex items-baseline justify-between gap-3">
      <h2 className="text-base font-semibold text-ink">{children}</h2>
      {action}
    </div>
  );
}

/* --------------------------------- Badge ---------------------------------- */

const badgeTones = {
  good: 'bg-leaf-50 text-leaf-700',
  warn: 'bg-warn-50 text-warn-600',
  alert: 'bg-alert-50 text-alert-600',
  neutral: 'bg-sand-100 text-ink-muted',
  info: 'bg-leaf-100 text-leaf-700'
} as const;

export function Badge({
  tone = 'neutral',
  children,
  className = ''
}: {
  tone?: keyof typeof badgeTones;
  children: React.ReactNode;
  className?: string;
}) {
  return <span className={`cc-chip ${badgeTones[tone]} ${className}`}>{children}</span>;
}

/* --------------------------------- Fields --------------------------------- */

interface FieldProps {
  label: string;
  hint?: string;
  error?: string;
  required?: boolean;
  children: (props: { id: string; 'aria-invalid': boolean; 'aria-describedby': string | undefined }) => React.ReactNode;
}

let fieldSeq = 0;
export function Field({ label, hint, error, required, children }: FieldProps) {
  const id = useMemo(() => `f${++fieldSeq}`, []);
  const describedBy = error ? `${id}-err` : hint ? `${id}-hint` : undefined;
  return (
    <div>
      <label className="cc-label" htmlFor={id}>
        {label}
        {required && <span className="text-alert-500"> *</span>}
      </label>
      {children({ id, 'aria-invalid': Boolean(error), 'aria-describedby': describedBy })}
      {hint && !error && (
        <p className="cc-hint" id={`${id}-hint`}>
          {hint}
        </p>
      )}
      {error && (
        <p className="cc-error" id={`${id}-err`}>
          {error}
        </p>
      )}
    </div>
  );
}

/* -------------------------------- Feedback -------------------------------- */

export function Loading({ label = 'Loading…' }: { label?: string }) {
  return (
    <div className="flex items-center justify-center gap-3 py-16 text-ink-soft" role="status">
      <Spinner />
      <span>{label}</span>
    </div>
  );
}

export function ErrorState({
  title = 'That did not load',
  message,
  onRetry
}: {
  title?: string;
  message: string;
  onRetry?: () => void;
}) {
  return (
    <Card className="border-alert-100 bg-alert-50/40 text-center">
      <p className="text-base font-semibold text-alert-600">{title}</p>
      <p className="mx-auto mt-1 max-w-md text-sm text-ink-muted">{message}</p>
      {onRetry && (
        <Button variant="secondary" className="mt-4" onClick={onRetry}>
          Try again
        </Button>
      )}
    </Card>
  );
}

export function EmptyState({
  title,
  message,
  action
}: {
  title: string;
  message: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-dashed border-sand-200 bg-white/60 px-5 py-10 text-center">
      <p className="text-base font-semibold text-ink">{title}</p>
      <p className="mx-auto mt-1.5 max-w-sm text-sm text-ink-soft">{message}</p>
      {action && <div className="mt-4 flex justify-center">{action}</div>}
    </div>
  );
}

/* ---------------------------------- Toast --------------------------------- */

interface Toast {
  id: number;
  message: string;
  tone: 'good' | 'alert';
}
const ToastCtx = createContext<{ notify: (m: string, tone?: 'good' | 'alert') => void }>({ notify: () => {} });
export const useToast = () => useContext(ToastCtx);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const notify = useCallback((message: string, tone: 'good' | 'alert' = 'good') => {
    const id = Date.now() + Math.random();
    setToasts((t) => [...t, { id, message, tone }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 4500);
  }, []);
  return (
    <ToastCtx.Provider value={{ notify }}>
      {children}
      <div
        className="pointer-events-none fixed inset-x-0 bottom-4 z-50 flex flex-col items-center gap-2 px-4"
        aria-live="polite"
        aria-atomic="true"
      >
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`pointer-events-auto max-w-sm rounded-xl px-4 py-3 text-sm font-medium shadow-card ${
              t.tone === 'alert' ? 'bg-alert-500 text-white' : 'bg-ink text-white'
            }`}
          >
            {t.message}
          </div>
        ))}
      </div>
    </ToastCtx.Provider>
  );
}

/* --------------------------------- Sheet ---------------------------------- */

export function Sheet({
  open,
  title,
  onClose,
  children
}: {
  open: boolean;
  title: string;
  onClose: () => void;
  children: React.ReactNode;
}) {
  React.useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [open, onClose]);
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-40 flex items-end justify-center sm:items-center" role="dialog" aria-modal="true" aria-label={title}>
      <div className="absolute inset-0 bg-ink/40" onClick={onClose} />
      <div className="relative z-10 w-full max-w-lg rounded-t-2xl bg-white p-5 shadow-card sm:rounded-2xl">
        <div className="mb-4 flex items-start justify-between gap-4">
          <h2 className="text-lg font-semibold">{title}</h2>
          <button onClick={onClose} className="rounded-lg p-1 text-ink-soft hover:bg-sand-100" aria-label="Close">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

/* ------------------------------- Data display ------------------------------ */

export function ProgressBar({ value, max, tone = 'good' }: { value: number; max: number; tone?: 'good' | 'warn' }) {
  const pct = max > 0 ? Math.min(100, Math.round((value / max) * 100)) : 0;
  return (
    <div className="h-2 w-full overflow-hidden rounded-full bg-sand-100" role="presentation">
      <div className={`h-full rounded-full ${tone === 'good' ? 'bg-leaf-500' : 'bg-warn-600'}`} style={{ width: `${pct}%` }} />
    </div>
  );
}

export function Sparkline({ points, height = 36 }: { points: number[]; height?: number }) {
  if (points.length < 2) return null;
  const max = Math.max(...points, 1);
  const min = Math.min(...points, 0);
  const span = max - min || 1;
  const w = 100;
  const d = points
    .map((p, i) => `${i === 0 ? 'M' : 'L'}${(i / (points.length - 1)) * w},${height - ((p - min) / span) * height}`)
    .join(' ');
  return (
    <svg viewBox={`0 0 ${w} ${height}`} className="w-full" height={height} preserveAspectRatio="none" aria-hidden="true">
      <path d={d} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" vectorEffect="non-scaling-stroke" />
    </svg>
  );
}
