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
        className={`font-mono text-[11px] text-zinc-500 hover:text-zinc-300 transition-colors cursor-default ${className}`}
        title={absolute}
      >
        {relative}
      </span>
    );
  } catch (e) {
    return <span className={`font-mono text-[11px] text-zinc-600 ${className}`}>Invalid Date</span>;
  }
}
