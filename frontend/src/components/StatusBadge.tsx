import { cn } from '../lib/utils';

interface StatusBadgeProps {
  status: number;
  className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  let colorClass = 'bg-zinc-800 text-zinc-400 border-zinc-700';

  if (status >= 200 && status < 300) {
    colorClass = 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
  } else if (status >= 300 && status < 400) {
    colorClass = 'bg-blue-500/10 text-blue-400 border-blue-500/20';
  } else if (status >= 400 && status < 500) {
    colorClass = 'bg-amber-500/10 text-amber-400 border-amber-500/20';
  } else if (status >= 500) {
    colorClass = 'bg-rose-500/10 text-rose-400 border-rose-500/20';
  }

  return (
    <span
      className={cn(
        'inline-flex items-center justify-center px-2 py-0.5 rounded text-[11px] font-mono font-medium border',
        colorClass,
        className
      )}
    >
      {status}
    </span>
  );
}
