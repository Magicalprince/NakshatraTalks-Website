import { Card } from '@/components/ui/Card';
import { cn } from '@/utils/cn';

interface StatCardProps {
  icon: React.ElementType;
  value: string | number;
  label: string;
  color: string;
  bg: string;
  accent?: string;
  layout?: 'vertical' | 'horizontal';
  className?: string;
}

export function StatCard({
  icon: Icon,
  value,
  label,
  color,
  bg,
  accent,
  layout = 'vertical',
  className,
}: StatCardProps) {
  if (layout === 'horizontal') {
    return (
      <Card className={cn('p-4 shadow-web-sm hover:shadow-web-md transition-shadow', className)}>
        <div className="flex items-center gap-3">
          <div className={cn('w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0', bg)}>
            <Icon className={cn('w-5 h-5', color)} />
          </div>
          <div>
            <p className="text-xl font-bold text-text-primary font-lexend">{value}</p>
            <p className="text-xs text-text-muted">{label}</p>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card className={cn('p-0 shadow-web-md hover:shadow-web-lg transition-shadow overflow-hidden', className)} padding="none">
      <div className={cn('h-1.5 w-full', accent || bg)} />
      <div className="p-4 pt-3">
        <div className={cn('w-10 h-10 rounded-full flex items-center justify-center mb-3', bg)}>
          <Icon className={cn('w-5 h-5', color)} />
        </div>
        <p className="text-xl font-bold text-text-primary font-lexend">{value}</p>
        <p className="text-xs text-text-muted mt-0.5">{label}</p>
      </div>
    </Card>
  );
}
