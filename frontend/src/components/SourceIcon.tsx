const SOURCE_COLORS: Record<string, string> = {
  stripe: 'bg-indigo-500',
  github: 'bg-slate-900 dark:bg-slate-200 dark:text-slate-900',
  sendgrid: 'bg-blue-400',
  razorpay: 'bg-blue-600',
  default: 'bg-slate-500',
};

interface SourceIconProps {
  source: string;
}

export function SourceIcon({ source }: SourceIconProps) {
  const key = source.toLowerCase();
  const colorClass = SOURCE_COLORS[key] ?? SOURCE_COLORS.default;

  return (
    <div
      className={`w-8 h-8 rounded-md ${colorClass} flex items-center justify-center text-white font-black text-[10px] shadow-sm shrink-0`}
    >
      {source.charAt(0).toUpperCase()}
    </div>
  );
}
