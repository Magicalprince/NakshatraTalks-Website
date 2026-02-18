import Link from 'next/link';
import { Card } from '@/components/ui/Card';
import { ChevronRight } from 'lucide-react';
import { cn } from '@/utils/cn';

export interface QuickLinkItem {
  icon: React.ElementType;
  label: string;
  href: string;
  color: string;
  bgColor: string;
}

interface QuickLinksProps {
  items: QuickLinkItem[];
  ariaLabel?: string;
  className?: string;
}

export function QuickLinks({
  items,
  ariaLabel = 'Quick links',
  className,
}: QuickLinksProps) {
  return (
    <Card className={cn('p-0 overflow-hidden shadow-web-sm', className)} padding="none">
      <nav aria-label={ariaLabel}>
        {items.map((item, index) => (
          <Link
            key={item.label}
            href={item.href}
            aria-label={`Go to ${item.label}`}
            className={cn(
              'group flex items-center justify-between p-4 hover:bg-background-offWhite transition-all duration-200',
              index !== items.length - 1 && 'border-b border-gray-100'
            )}
          >
            <div className="flex items-center gap-3 transition-transform duration-200 group-hover:translate-x-1">
              <div className={cn('w-10 h-10 rounded-full flex items-center justify-center', item.bgColor, item.color)}>
                <item.icon className="w-5 h-5" />
              </div>
              <span className="font-medium text-text-primary text-sm">{item.label}</span>
            </div>
            <ChevronRight className="w-5 h-5 text-text-muted transition-transform duration-200 group-hover:translate-x-0.5" />
          </Link>
        ))}
      </nav>
    </Card>
  );
}
