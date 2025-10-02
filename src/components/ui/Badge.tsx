import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../lib/utils';

const badgeVariants = cva(
  'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
  {
    variants: {
      variant: {
        default: 'border-transparent bg-primary-100 text-primary-700',
        secondary: 'border-transparent bg-gray-100 text-gray-700',
        success: 'border-transparent bg-success-50 text-success-600',
        warning: 'border-transparent bg-warning-50 text-warning-600',
        error: 'border-transparent bg-error-50 text-error-600',
        info: 'border-transparent bg-info-50 text-info-600',
        developer: 'border-transparent bg-developer-50 text-developer-700',
        agent: 'border-transparent bg-agent-50 text-agent-700',
        admin: 'border-transparent bg-admin-50 text-admin-700',
        outline: 'text-gray-700 border-gray-300',
      },
      size: {
        sm: 'px-2 py-0.5 text-xs',
        default: 'px-2.5 py-0.5 text-xs',
        lg: 'px-3 py-1 text-sm',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {
  icon?: React.ReactNode;
}

const Badge = React.forwardRef<HTMLDivElement, BadgeProps>(
  ({ className, variant, size, icon, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(badgeVariants({ variant, size }), className)}
        {...props}
      >
        {icon && <span className="mr-1">{icon}</span>}
        {children}
      </div>
    );
  }
);
Badge.displayName = 'Badge';

// Status-specific badge variants
export const StatusBadge = React.forwardRef<HTMLDivElement, BadgeProps>(
  ({ children, ...props }, ref) => {
    const getStatusVariant = (status: string) => {
      switch (status?.toLowerCase()) {
        case 'available':
        case 'qualified':
        case 'won':
          return 'success';
        case 'held':
        case 'contacted':
          return 'warning';
        case 'sold':
        case 'lost':
          return 'error';
        case 'reserved':
        case 'new':
          return 'info';
        default:
          return 'secondary';
      }
    };

    return (
      <Badge
        ref={ref}
        variant={getStatusVariant(children as string)}
        {...props}
      >
        {children}
      </Badge>
    );
  }
);
StatusBadge.displayName = 'StatusBadge';

export { Badge, badgeVariants };
