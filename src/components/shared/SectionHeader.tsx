import { cn } from '@/utils/cn';

interface SectionHeaderProps {
  icon: React.ElementType;
  title: string;
  variant?: 'default' | 'danger';
  rightContent?: React.ReactNode;
  className?: string;
}

export function SectionHeader({
  icon: Icon,
  title,
  variant = 'default',
  rightContent,
  className,
}: SectionHeaderProps) {
  const isDanger = variant === 'danger';

  return (
    <div className={cn('flex items-center justify-between mb-3 px-1', className)}>
      <div className="flex items-center gap-2">
        <Icon className={cn('w-4 h-4', isDanger ? 'text-status-error' : 'text-text-muted')} />
        <h2
          className={cn(
            'text-sm font-semibold font-lexend uppercase tracking-wider',
            isDanger ? 'text-status-error' : 'text-text-muted'
          )}
        >
          {title}
        </h2>
      </div>
      {rightContent}
    </div>
  );
}
