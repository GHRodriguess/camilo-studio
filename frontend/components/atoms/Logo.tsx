import React from 'react';

interface LogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'full' | 'monogram';
}

export function Logo({ className = '', size = 'md', variant = 'full' }: LogoProps) {
  const iconSizes = {
    sm: 'w-7 h-7 text-xs',
    md: 'w-9 h-9 text-sm',
    lg: 'w-14 h-14 text-xl',
  };

  const textSizes = {
    sm: 'text-sm',
    md: 'text-lg',
    lg: 'text-2xl',
  };

  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      {/* Monogram Crest */}
      <div
        className={`${iconSizes[size]} rounded-2xl bg-gradient-to-br from-primary to-secondary text-primary-foreground flex items-center justify-center font-bold tracking-widest shadow-md shadow-primary/20 shrink-0 select-none`}
      >
        <span>CS</span>
      </div>

      {variant === 'full' && (
        <div className="flex flex-col leading-none">
          <span className={`font-semibold tracking-wider uppercase font-heading ${textSizes[size]} text-on-surface`}>
            Camilo
          </span>
          <span className="text-[10px] tracking-[0.2em] font-medium text-primary uppercase">
            Studio
          </span>
        </div>
      )}
    </div>
  );
}
