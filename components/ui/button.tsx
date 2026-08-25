import React from 'react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'outline' | 'ghost' | 'secondary' | 'danger' | 'pink';
  size?: 'default' | 'sm' | 'lg' | 'icon';
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className = '', variant = 'default', size = 'default', children, ...props }, ref) => {
    const baseStyles =
      'inline-flex items-center justify-center font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-zinc-400 disabled:pointer-events-none disabled:opacity-50 cursor-pointer rounded-lg text-xs';
    
    let variantStyles = 'bg-zinc-100 text-zinc-900 shadow hover:bg-zinc-200';
    if (variant === 'pink') {
      variantStyles = 'bg-[#EEAAC0] text-zinc-950 shadow hover:bg-[#E595B0] font-semibold';
    } else if (variant === 'danger') {
      variantStyles = 'bg-rose-600 text-white shadow hover:bg-rose-500';
    } else if (variant === 'outline') {
      variantStyles = 'border border-zinc-700 bg-zinc-900/80 text-zinc-200 hover:bg-zinc-800 hover:text-zinc-100';
    } else if (variant === 'secondary') {
      variantStyles = 'bg-zinc-800 text-zinc-100 hover:bg-zinc-700';
    } else if (variant === 'ghost') {
      variantStyles = 'hover:bg-zinc-800 text-zinc-400 hover:text-zinc-100';
    }

    let sizeStyles = 'h-9 px-4 py-2';
    if (size === 'sm') {
      sizeStyles = 'h-8 px-3 text-[11px]';
    } else if (size === 'lg') {
      sizeStyles = 'h-10 px-6 text-sm';
    } else if (size === 'icon') {
      sizeStyles = 'h-8 w-8 p-0';
    }

    return (
      <button
        ref={ref}
        className={`${baseStyles} ${variantStyles} ${sizeStyles} ${className}`}
        {...props}
      >
        {children}
      </button>
    );
  }
);
Button.displayName = 'Button';
