import React from 'react';
import { cn } from '@/lib/utils';

interface MonoIconProps {
  text?: string;
  src?: string;
  alt?: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const MonoIcon: React.FC<MonoIconProps> = ({ text, src, alt, size = 'md', className }) => {
  const sizeClasses = {
    sm: 'w-5 h-5 text-[9px]',
    md: 'w-8 h-8 text-[11px]',
    lg: 'w-10 h-10 text-xs',
  };

  // If image source is provided, render image
  if (src) {
    return (
      <div
        className={cn(
          'rounded-sm flex items-center justify-center flex-shrink-0 overflow-hidden',
          sizeClasses[size],
          className
        )}
      >
        <img
          src={src}
          alt={alt || text || 'Brand logo'}
          className="w-full h-full object-cover"
        />
      </div>
    );
  }

  // Otherwise render text initials
  return (
    <div
      className={cn(
        'bg-gray-900 text-white rounded-sm font-semibold flex items-center justify-center flex-shrink-0',
        sizeClasses[size],
        className
      )}
    >
      {text}
    </div>
  );
};
