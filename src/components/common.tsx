import { useEffect, useRef, type ReactNode } from 'react';
import { X } from 'lucide-react';

interface ModalProps {
  title: string;
  onClose: () => void;
  children: ReactNode;
  wide?: boolean;
}

/** Accessible modal: labelled dialog, Esc + backdrop close, focus moved in on open. */
export function Modal({ title, onClose, children, wide }: ModalProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    ref.current?.focus();
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/70 p-0 backdrop-blur-sm sm:items-center sm:p-6"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        ref={ref}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        tabIndex={-1}
        className={`card max-h-[92vh] w-full overflow-y-auto rounded-b-none p-5 outline-none animate-rise sm:rounded-2xl sm:p-6 ${
          wide ? 'sm:max-w-3xl' : 'sm:max-w-xl'
        }`}
      >
        <div className="mb-4 flex items-start justify-between gap-4">
          <h3 className="font-display text-xl font-bold text-white">{title}</h3>
          <button type="button" onClick={onClose} className="btn-ghost !px-2.5 !py-2" aria-label="Close dialog">
            <X className="h-4 w-4" aria-hidden="true" />
            <span className="text-sm">Close</span>
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

interface ProgressBarProps {
  value: number;
  target: number;
  /** Colour class for the fill, e.g. 'bg-volt-400' */
  colorClass?: string;
  /** When the value is best kept BELOW the target (e.g. sodium) */
  upperLimit?: boolean;
}

export function ProgressBar({ value, target, colorClass = 'bg-volt-400', upperLimit }: ProgressBarProps) {
  const pct = target > 0 ? (value / target) * 100 : 0;
  const width = Math.min(100, pct);
  const over = pct > 112;
  const fill = upperLimit && over ? 'bg-amber-400' : over ? 'bg-sky-400' : colorClass;
  return (
    <div className="h-2 w-full overflow-hidden rounded-full bg-ink-700" role="presentation">
      <div className={`h-full rounded-full ${fill} transition-all duration-500`} style={{ width: `${width}%` }} />
    </div>
  );
}

interface NumberFieldProps {
  label: string;
  value: number;
  onChange: (v: number) => void;
  unit?: string;
  min?: number;
  max?: number;
  step?: number;
  id: string;
}

export function NumberField({ label, value, onChange, unit, min = 0, max = 99999, step = 1, id }: NumberFieldProps) {
  return (
    <label htmlFor={id} className="block">
      <span className="mb-1 block text-xs font-medium uppercase tracking-wide text-ink-300">
        {label}
        {unit ? <span className="text-ink-400"> ({unit})</span> : null}
      </span>
      <input
        id={id}
        type="number"
        inputMode="numeric"
        className="input-field"
        value={Number.isFinite(value) ? value : ''}
        min={min}
        max={max}
        step={step}
        onChange={(e) => {
          const v = Number(e.target.value);
          if (Number.isFinite(v)) onChange(Math.max(min, Math.min(max, v)));
        }}
      />
    </label>
  );
}

export function TagPill({ children }: { children: ReactNode }) {
  return (
    <span className="inline-flex items-center rounded-full bg-ink-700/80 px-2 py-0.5 text-[11px] font-medium text-ink-200">
      {children}
    </span>
  );
}

export function EmptyState({ icon, title, hint }: { icon: ReactNode; title: string; hint?: string }) {
  return (
    <div className="card flex flex-col items-center gap-2 border-dashed px-6 py-10 text-center">
      <div className="text-ink-400">{icon}</div>
      <p className="font-medium text-ink-200">{title}</p>
      {hint ? <p className="max-w-md text-sm text-ink-400">{hint}</p> : null}
    </div>
  );
}
