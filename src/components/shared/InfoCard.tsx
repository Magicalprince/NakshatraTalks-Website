import { Card } from '@/components/ui/Card';
import { cn } from '@/utils/cn';
import { Info, AlertTriangle, CheckCircle, XCircle } from 'lucide-react';

const VARIANT_STYLES = {
  info: {
    bg: 'bg-status-info/5',
    border: 'border-status-info/20',
    iconColor: 'text-status-info',
    defaultIcon: Info,
  },
  warning: {
    bg: 'bg-status-warning/5',
    border: 'border-status-warning/20',
    iconColor: 'text-status-warning',
    defaultIcon: AlertTriangle,
  },
  success: {
    bg: 'bg-status-success/5',
    border: 'border-status-success/20',
    iconColor: 'text-status-success',
    defaultIcon: CheckCircle,
  },
  error: {
    bg: 'bg-status-error/5',
    border: 'border-status-error/20',
    iconColor: 'text-status-error',
    defaultIcon: XCircle,
  },
} as const;

interface InfoCardProps {
  variant?: keyof typeof VARIANT_STYLES;
  icon?: React.ElementType;
  children: React.ReactNode;
  className?: string;
}

export function InfoCard({
  variant = 'info',
  icon,
  children,
  className,
}: InfoCardProps) {
  const styles = VARIANT_STYLES[variant];
  const IconComponent = icon || styles.defaultIcon;

  return (
    <Card className={cn('p-4 shadow-web-sm border', styles.bg, styles.border, className)}>
      <div className="flex items-start gap-3">
        <IconComponent className={cn('w-5 h-5 flex-shrink-0 mt-0.5', styles.iconColor)} />
        <div className="text-sm text-text-secondary">{children}</div>
      </div>
    </Card>
  );
}
