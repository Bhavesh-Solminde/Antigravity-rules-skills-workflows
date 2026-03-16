import { cn } from '../lib/utils';

interface MethodBadgeProps {
  method: string;
  className?: string;
}

const METHOD_COLORS: Record<string, string> = {
  POST: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-500',
  GET: 'bg-sky-500/10 text-sky-600 dark:text-sky-500',
  PUT: 'bg-amber-500/10 text-amber-600 dark:text-amber-500',
  PATCH: 'bg-amber-500/10 text-amber-600 dark:text-amber-500',
  DELETE: 'bg-rose-500/10 text-rose-600 dark:text-rose-500',
};

export function MethodBadge({ method, className }: MethodBadgeProps) {
  const normalized = method.toUpperCase();
  const colorClass = METHOD_COLORS[normalized] ?? 'bg-slate-500/10 text-slate-500';

  return (
    <span
      className={cn(
        'px-2 py-0.5 rounded-md text-[10px] font-black border border-current opacity-80',
        colorClass,
        className
      )}
    >
      {normalized}
    </span>
  );
}
