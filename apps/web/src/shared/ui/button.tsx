import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/shared/utils/cn';

const buttonVariants = cva(
  'inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        default:
          'bg-primary-600 text-white hover:bg-primary-700 focus-visible:ring-2 focus-visible:ring-primary-300 focus-visible:ring-offset-2 shadow-sm hover:shadow-md',
        destructive: 'bg-red-500 text-white hover:bg-red-600',
        outline: 'border border-slate-200 bg-white hover:bg-slate-50',
        secondary: 'bg-slate-100 text-slate-900 hover:bg-slate-200',
        ghost: 'hover:bg-slate-50',
        link: 'text-primary-700 underline-offset-4 hover:underline',
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

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'default', size, style, ...props }, ref) => {
    // Inline fallback styles in case Tailwind utilities are not loaded yet
    const fallbackStyle: React.CSSProperties | undefined =
      variant === 'default' ? { backgroundColor: '#8b5cf6', color: '#ffffff' } : undefined;

    const mergedStyle = { ...(fallbackStyle || {}), ...(style || {}) };

    return (
      <button
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        style={mergedStyle}
        {...props}
      />
    );
  },
);

Button.displayName = 'Button';

export { Button, buttonVariants };
