import React from 'react';

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'outline' | 'pink' | 'amber';
}

export function Badge({ className = '', variant = 'default', children, ...props }: BadgeProps) {
  let variantStyles = 'bg-zinc-800 text-zinc-300 border border-zinc-700';
  if (variant === 'pink') {
    variantStyles = 'bg-[#EEAAC0]/10 text-[#EEAAC0] border border-[#EEAAC0]/20';
  } else if (variant === 'amber') {
    variantStyles = 'bg-amber-500/10 text-amber-400 border border-amber-500/20';
  } else if (variant === 'outline') {
    variantStyles = 'text-zinc-400 border border-zinc-800';
  }

  return (
    <div
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-medium transition-colors ${variantStyles} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}
