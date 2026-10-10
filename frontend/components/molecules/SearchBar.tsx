import React from 'react';
import { Search, X } from 'lucide-react';
import { Input } from '@/components/ui/input';

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export function SearchBar({
  value,
  onChange,
  placeholder = 'Buscar...',
  className = '',
}: SearchBarProps) {
  return (
    <div className={`relative flex items-center w-full ${className}`}>
      <Search className="absolute left-3.5 w-4 h-4 text-on-surface-variant pointer-events-none" />
      <Input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="pl-10 pr-9 h-11 bg-surface-container-lowest border-outline-variant/70 rounded-full text-sm placeholder:text-on-surface-variant/60 focus-visible:ring-primary shadow-sm"
      />
      {value && (
        <button
          type="button"
          onClick={() => onChange('')}
          className="absolute right-3 p-1 rounded-full text-on-surface-variant hover:text-on-surface hover:bg-surface-container transition-colors"
        >
          <X className="w-3.5 h-3.5" />
          <span className="sr-only">Limpar</span>
        </button>
      )}
    </div>
  );
}
