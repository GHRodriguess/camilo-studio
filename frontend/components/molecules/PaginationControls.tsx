'use client';

import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface PaginationControlsProps {
  page: number;
  totalPages: number;
  totalCount: number;
  pageSize: number;
  onPageChange: (newPage: number) => void;
  loading?: boolean;
}

export function PaginationControls({
  page,
  totalPages,
  totalCount,
  pageSize,
  onPageChange,
  loading = false,
}: PaginationControlsProps) {
  if (totalCount === 0 || totalPages <= 1) return null;

  const inicio = (page - 1) * pageSize + 1;
  const fim = Math.min(page * pageSize, totalCount);

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-outline-variant/40">
      <p className="text-xs text-on-surface-variant font-medium">
        Mostrando <span className="font-semibold text-on-surface">{inicio}</span> a{' '}
        <span className="font-semibold text-on-surface">{fim}</span> de{' '}
        <span className="font-semibold text-on-surface">{totalCount}</span> atendimentos
      </p>

      <div className="flex items-center gap-1.5">
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={page <= 1 || loading}
          onClick={() => onPageChange(page - 1)}
          className="h-8 px-3 rounded-full text-xs font-medium cursor-pointer"
        >
          <ChevronLeft className="w-3.5 h-3.5 mr-1" />
          Anterior
        </Button>

        <span className="px-3 py-1 text-xs font-medium text-on-surface bg-surface-container rounded-full">
          {page} / {totalPages}
        </span>

        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={page >= totalPages || loading}
          onClick={() => onPageChange(page + 1)}
          className="h-8 px-3 rounded-full text-xs font-medium cursor-pointer"
        >
          Próxima
          <ChevronRight className="w-3.5 h-3.5 ml-1" />
        </Button>
      </div>
    </div>
  );
}
