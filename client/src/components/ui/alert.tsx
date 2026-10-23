import * as React from 'react';
import { cn } from '@/lib/utils.ts';

interface AlertProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'destructive';
}

const Alert = React.forwardRef<HTMLDivElement, AlertProps>(
  ({ className, variant = 'default', ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          'relative rounded-xl border p-4 [&>svg+div]:translate-y-[-3px] [&>svg]:absolute [&>svg]:left-4 [&>svg]:top-4 [&>svg]:text-current [&>svg+div]:pl-7',
          variant === 'destructive'
            ? 'border-destructive/50 text-destructive dark:border-destructive bg-destructive/50'
            : 'border-muted/50 bg-background',
          className,
        )}
        {...props}
      />
    );
  },
);
Alert.displayName = 'Alert';

interface AlertTitleProps extends React.HTMLAttributes<HTMLHeadingElement> {}
const AlertTitle = React.forwardRef<HTMLHeadingElement, AlertTitleProps>(
  ({ className, ...props }, ref) => (
    <h3
      ref={ref}
      className={cn('mb-1 font-medium leading-none tracking-tight', className)}
      {...props}
    />
  ),
);
AlertTitle.displayName = 'AlertTitle';

interface AlertDescriptionProps extends React.HTMLAttributes<HTMLParagraphElement> {}
const AlertDescription = React.forwardRef<HTMLParagraphElement, AlertDescriptionProps>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn('text-sm [&_p]:leading-relaxed', className)} {...props} />
  ),
);
AlertDescription.displayName = 'AlertDescription';

export { Alert, AlertTitle, AlertDescription };
