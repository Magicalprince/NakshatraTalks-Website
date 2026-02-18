import { Card } from '@/components/ui/Card';
import { cn } from '@/utils/cn';

interface EmptyStateProps {
  icon: React.ElementType;
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  className,
}: EmptyStateProps) {
  return (
    <Card className={cn('p-8 text-center shadow-web-sm', className)}>
      <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center mx-auto mb-4">
        <Icon className="w-8 h-8 text-primary/60" />
      </div>
      <p className="text-text-secondary font-medium">{title}</p>
      {description && <p className="text-xs text-text-muted mt-1">{description}</p>}
      {action && <div className="mt-4">{action}</div>}
    </Card>
  );
}
