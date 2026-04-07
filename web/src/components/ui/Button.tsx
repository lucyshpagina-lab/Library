'use client';

import { ButtonHTMLAttributes, forwardRef } from 'react';
import { cn } from '@/lib/utils';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', disabled, ...props }, ref) => {
    return (
      <button
        ref={ref}
        disabled={disabled}
        className={cn(
          'font-semibold rounded-[10px] transition-colors inline-flex items-center justify-center gap-2',
          {
            'bg-pink-accent hover:bg-pink-hover text-white': variant === 'primary',
            'bg-white hover:bg-gray-50 text-text-primary border border-gray-200': variant === 'secondary',
            'bg-transparent hover:bg-pink-light text-pink-accent': variant === 'ghost',
          },
          {
            'px-4 py-1.5 text-sm': size === 'sm',
            'px-5 py-2.5 text-base': size === 'md',
            'px-8 py-3 text-lg': size === 'lg',
          },
          disabled && 'opacity-50 cursor-not-allowed',
          className,
        )}
        {...props}
      />
    );
  },
);

Button.displayName = 'Button';
export default Button;
