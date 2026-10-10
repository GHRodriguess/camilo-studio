import React from 'react';
import { Loader2 } from 'lucide-react';

interface LoadingStateProps {
  message?: string;
  count?: number;
}

export function LoadingState({ message = 'Carregando dados...', count = 3 }: LoadingStateProps) {
  return (
    <div className="w-full py-8 space-y-4">
      <div className="flex items-center justify-center space-x-2 text-primary pb-2">
        <Loader2 className="w-5 h-5 animate-spin" />
        <span className="text-sm font-medium">{message}</span>
      </div>
      <div className="space-y-3">
        {Array.from({ length: count }).map((_, i) => (
          <div
            key={i}
            className="w-full h-20 rounded-2xl bg-surface-container/60 animate-pulse border border-outline-variant/30"
          />
        ))}
      </div>
    </div>
  );
}
