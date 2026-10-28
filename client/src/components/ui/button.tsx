import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { VariantProps } from 'class-variance-authority';

function cva(
  base: string,
  config?: { variants?: Record<string, Record<string, string>>; defaultVariants?: Record<string, string> },
) {
  return (props: Record<string, any> = {}) => {
    // Merge defaultVariants so they apply when variant/size are not explicitly passed.
    // Skip undefined prop values so they don't clobber the defaults.
    const mergedProps = { ...config?.defaultVariants };
    for (const [key, val] of Object.entries(props)) {
      if (val !== undefined) mergedProps[key] = val;
    }
    let classes = base;
    if (config?.variants) {
      Object.entries(config.variants).forEach(([key, variants]) => {
        const val = mergedProps[key];
        if (val && variants[val]) classes += ` ${variants[val]}`;
      });
    }
    // Support React's className convention (and `class` for compatibility)
    const manualClass = mergedProps.className ?? mergedProps.class;
    if (manualClass) classes += ` ${manualClass}`;
    return classes;
  };
}

const buttonVariants = cva(
  'inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium mx-1 transition-all duration-200 active:scale-95 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        default: 'bg-primary/20 text-primary shadow-sm hover:bg-primary hover:text-primary-foreground',
        destructive:
          'bg-destructive/10 text-destructive border border-transparent shadow-sm hover:border-destructive hover:bg-destructive hover:text-destructive-foreground',
        outline:
          'bg-background text-primary hover:bg-primary hover:text-primary-foreground',
        secondary:
          'bg-secondary/10 text-secondary-foreground border border-transparent shadow-sm hover:border-secondary hover:bg-secondary hover:text-secondary-foreground',
        ghost: 'bg-transparent hover:border hover:border-primary hover:bg-primary/10 hover:text-primary',
        link: 'text-primary underline-offset-4 hover:underline',
      },
      size: {
        default: 'h-10 px-4 py-2',
        sm: 'h-9 rounded-md px-3',
        lg: 'h-11 rounded-md px-8',
        icon: 'h-10 w-10',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  },
);

interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button';
    return (
      <Comp
        className={buttonVariants({ variant, size, className })}
        ref={ref}
        {...props}
      />
    );
  },
);
Button.displayName = 'Button';

export { Button, buttonVariants };
