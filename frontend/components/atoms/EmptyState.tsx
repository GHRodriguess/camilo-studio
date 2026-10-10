import React from 'react';
import { LucideIcon, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
}

export function EmptyState({
  icon: Icon = Sparkles,
  title,
  description,
  actionLabel,
  onAction,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center p-8 text-center rounded-3xl border border-dashed border-outline-variant bg-surface-container-low/50 my-6">
      <div className="w-14 h-14 rounded-full bg-surface-container flex items-center justify-center text-primary mb-4 shadow-sm">
        <Icon className="w-7 h-7" />
      </div>
      <h3 className="text-lg font-semibold text-on-surface mb-1 font-heading">{title}</h3>
      <p className="text-sm text-on-surface-variant max-w-sm mb-6">{description}</p>
      {actionLabel && onAction && (
        <Button onClick={onAction} className="rounded-full shadow-md">
          {actionLabel}
        </Button>
      )}
    </div>
  );
}
