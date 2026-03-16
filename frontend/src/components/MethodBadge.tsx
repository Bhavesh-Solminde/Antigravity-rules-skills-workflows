import { cn } from '../lib/utils';

interface MethodBadgeProps {
  method: string;
  className?: string;
}

export function MethodBadge({ method, className }: MethodBadgeProps) {
  const normalized = method.toUpperCase();
  let colorClass = 'bg-zinc-800 text-zinc-400 border-zinc-700';

  switch (normalized) {
    case 'GET':
      colorClass = 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30';
      break;
    case 'POST':
      colorClass = 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30';
      break;
    case 'PUT':
      colorClass = 'bg-purple-500/10 text-purple-400 border-purple-500/30';
      break;
    case 'PATCH':
      colorClass = 'bg-amber-500/10 text-amber-400 border-amber-500/30';
      break;
    case 'DELETE':
      colorClass = 'bg-rose-500/10 text-rose-400 border-rose-500/30';
      break;
    case 'OPTIONS':
    case 'HEAD':
      colorClass = 'bg-indigo-500/10 text-indigo-400 border-indigo-500/30';
      break;
  }

  return (
    <span
      className={cn(
        'inline-flex items-center justify-center px-2 py-0.5 rounded text-[10px] font-mono leading-none font-bold uppercase tracking-wider border',
        colorClass,
        className
      )}
    >
      {normalized}
    </span>
  );
}
