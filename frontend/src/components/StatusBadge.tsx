import { cn } from '../lib/utils';

interface StatusBadgeProps {
  status: number;
  className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const isError = status >= 400;
  const colorClass = isError
    ? 'text-rose-600 dark:text-rose-500 bg-rose-500/10 border-rose-500/20'
    : 'text-emerald-600 dark:text-emerald-500 bg-emerald-500/10 border-emerald-500/20';

  return (
    <span
      className={cn(
        'px-2.5 py-1 rounded-md text-[10px] font-mono font-bold border',
        colorClass,
        className
      )}
    >
      {status}
    </span>
  );
}
