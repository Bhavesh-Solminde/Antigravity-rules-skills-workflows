import { format, formatDistanceToNow } from 'date-fns';

interface TimestampDisplayProps {
  timestamp: string;
  className?: string;
}

export function TimestampDisplay({ timestamp, className = '' }: TimestampDisplayProps) {
  try {
    const date = new Date(timestamp);
    const absolute = format(date, 'MMM d, yyyy HH:mm:ss.SSS');
    const relative = formatDistanceToNow(date, { addSuffix: true });

    return (
      <span
        className={`font-mono text-[10px] font-medium text-slate-400 dark:text-slate-500 hover:text-slate-900 dark:hover:text-slate-300 transition-colors cursor-default ${className}`}
        title={absolute}
      >
        {relative}
      </span>
    );
  } catch {
    return <span className={`font-mono text-[10px] text-slate-400 ${className}`}>Invalid Date</span>;
  }
}
