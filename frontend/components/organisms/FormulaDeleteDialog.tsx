'use client';

import React from 'react';
import { Trash2 } from 'lucide-react';
import { FormulaQuimica } from '@/lib/api';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';

interface FormulaDeleteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  formula: FormulaQuimica | null;
  onConfirm: () => Promise<void>;
  excluindo: boolean;
}

export function FormulaDeleteDialog({
  open,
  onOpenChange,
  formula,
  onConfirm,
  excluindo,
}: FormulaDeleteDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md rounded-3xl p-6 bg-surface-container-lowest border-outline-variant">
        <DialogHeader>
          <DialogTitle className="text-lg font-bold text-on-surface font-heading flex items-center gap-2 text-destructive">
            <Trash2 className="w-5 h-5" />
            Excluir Fórmula Química
          </DialogTitle>
          <DialogDescription className="text-xs text-on-surface-variant">
            Tem certeza que deseja remover esta fórmula química? O histórico técnico deste procedimento não poderá ser recuperado.
          </DialogDescription>
        </DialogHeader>

        {formula && (
          <div className="p-4 rounded-2xl bg-surface-container-low border border-outline-variant/40 space-y-1 text-xs">
            <p className="font-semibold text-on-surface">{formula.procedimento}</p>
            <p className="text-on-surface-variant">
              Data: {new Date(formula.data_aplicacao).toLocaleDateString('pt-BR')}
            </p>
            <p className="text-on-surface-variant font-mono truncate">
              {formula.formula_texto}
            </p>
          </div>
        )}

        <div className="pt-3 flex items-center justify-end gap-2.5">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="rounded-full text-xs h-10 px-5"
          >
            Cancelar
          </Button>
          <Button
            type="button"
            disabled={excluindo}
            onClick={onConfirm}
            className="rounded-full text-xs h-10 px-5 bg-destructive hover:bg-destructive/90 text-white font-semibold cursor-pointer"
          >
            {excluindo ? 'Excluindo...' : 'Confirmar Exclusão'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
