import * as React from 'react';
import { cn } from '@/lib/utils.ts';

const badgeVariants = (
  props: { variant?: string; className?: string } = {},
) => {
  const { variant = 'default', className } = props;
  const base = 'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2';
  const variants: Record<string, string> = {
    default: 'border-transparent bg-primary text-primary-foreground hover:bg-primary/80',
    secondary: 'border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80',
    destructive: 'border-transparent bg-destructive text-destructive-foreground',
    outline: 'border-input text-foreground',
    success: 'border-transparent bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-200',
    warning: 'border-transparent bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-200',
  };
  return cn(base, variants[variant], className);
};

interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'secondary' | 'destructive' | 'outline' | 'success' | 'warning';
}

const Badge = React.forwardRef<HTMLSpanElement, BadgeProps>(
  ({ className, variant, ...props }, ref) => (
    <span
      ref={ref}
      className={badgeVariants({ variant, className })}
      {...props}
    />
  ),
);
Badge.displayName = 'Badge';

export { Badge, badgeVariants };
