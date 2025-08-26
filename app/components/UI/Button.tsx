'use client';

import { ButtonHTMLAttributes, forwardRef } from 'react';
import { cn } from '@/lib/utils';

const Button = forwardRef<HTMLButtonElement, ButtonHTMLAttributes<HTMLButtonElement>>(
    ({ className, ...props }, ref) => {
        return (
            <button
                ref={ref}
                className={cn(
                    'inline-flex items-center justify-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-white shadow-sm hover:bg-blue-700 focus:outline-none',
                    className
                )}
                {...props}
            />
        );
    }
);
Button.displayName = 'Button';
export default Button;
