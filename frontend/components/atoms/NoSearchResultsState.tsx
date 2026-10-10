import React from 'react';
import { SearchX } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface NoSearchResultsStateProps {
  searchTerm?: string;
  onClear: () => void;
}

export function NoSearchResultsState({ searchTerm, onClear }: NoSearchResultsStateProps) {
  return (
    <div className="flex flex-col items-center justify-center p-8 text-center rounded-3xl border border-outline-variant/60 bg-surface-container-low/40 my-6">
      <div className="w-12 h-12 rounded-full bg-surface-container flex items-center justify-center text-on-surface-variant mb-3">
        <SearchX className="w-6 h-6" />
      </div>
      <h3 className="text-base font-semibold text-on-surface mb-1">
        {searchTerm ? `Nenhum resultado para "${searchTerm}"` : 'Nenhum resultado encontrado'}
      </h3>
      <p className="text-xs text-on-surface-variant max-w-xs mb-4">
        Verifique a ortografia ou tente buscar por termos diferentes.
      </p>
      <Button variant="outline" size="sm" onClick={onClear} className="rounded-full text-xs">
        Limpar busca
      </Button>
    </div>
  );
}
