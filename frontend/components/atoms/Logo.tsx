import React from 'react';

interface LogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'full' | 'monogram';
}

export function Logo({ className = '', size = 'md', variant = 'full' }: LogoProps) {
  const iconSizes = {
    sm: 'w-7 h-7 text-[10px] tracking-tight',
    md: 'w-9 h-9 text-xs tracking-tight',
    lg: 'w-14 h-14 text-base tracking-normal',
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
        className={`${iconSizes[size]} rounded-2xl bg-gradient-to-br from-primary to-secondary text-primary-foreground flex items-center justify-center font-bold shadow-md shadow-primary/20 shrink-0 select-none`}
      >
        <span>SMC</span>
      </div>

      {variant === 'full' && (
        <div className="flex flex-col leading-none">
          <span className="text-[9px] tracking-[0.25em] font-semibold text-primary uppercase">
            Studio
          </span>
          <span className={`font-semibold tracking-wider uppercase font-heading ${textSizes[size]} text-on-surface`}>
            Marilia Camilo
          </span>
        </div>
      )}
    </div>
  );
}
