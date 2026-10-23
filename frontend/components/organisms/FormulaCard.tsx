'use client';

import React from 'react';
import { Clock, Copy, Check, Edit2 } from 'lucide-react';
import { FormulaQuimica } from '@/lib/api';
import { DeleteButton } from '@/components/atoms/DeleteButton';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

export interface FormulaCardProps {
  formula: FormulaQuimica;
  copiado: boolean;
  onCopiar: (formula: FormulaQuimica) => void;
  onEditar: (formula: FormulaQuimica) => void;
  onExcluir: (formula: FormulaQuimica) => void;
}

export function FormulaCard({
  formula,
  copiado,
  onCopiar,
  onEditar,
  onExcluir,
}: FormulaCardProps) {
  return (
    <div className="p-5 sm:p-6 rounded-3xl bg-surface-container-lowest border border-outline-variant/60 shadow-sm hover:border-primary/40 transition-all space-y-3">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <span className="text-[11px] font-mono text-primary font-semibold">
            {new Date(formula.data_aplicacao).toLocaleDateString('pt-BR')}
          </span>
          <h3 className="text-base font-bold text-on-surface font-heading">
            {formula.procedimento}
          </h3>
          {formula.profissional_detalhes && (
            <p className="text-xs text-on-surface-variant">
              Aplicado por <strong>{formula.profissional_detalhes.nome}</strong>
            </p>
          )}
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onCopiar(formula)}
            className="rounded-full text-xs h-8 px-3 border-primary/30 text-primary hover:bg-primary/5 cursor-pointer"
          >
            {copiado ? (
              <>
                <Check className="w-3.5 h-3.5 mr-1 text-emerald-600" />
                Copiada!
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5 mr-1" />
                Copiar
              </>
            )}
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => onEditar(formula)}
            className="rounded-full text-xs h-8 px-3 border-outline-variant hover:border-primary/50 text-on-surface cursor-pointer gap-1"
            title="Editar Fórmula"
          >
            <Edit2 className="w-3.5 h-3.5 text-primary" />
            <span>Editar</span>
          </Button>

          <DeleteButton
            onDelete={() => onExcluir(formula)}
            title="Excluir fórmula química"
          />
        </div>
      </div>

      <div className="p-4 rounded-2xl bg-surface-container-low font-mono text-xs text-on-surface whitespace-pre-line border border-outline-variant/30 leading-relaxed">
        {formula.formula_texto}
      </div>

      <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
        <Badge variant="outline" className="rounded-full border-primary/40 text-primary bg-primary/5 font-mono">
          OX: {formula.volumagem_ox}
        </Badge>
        <Badge variant="outline" className="rounded-full border-outline-variant font-mono gap-1">
          <Clock className="w-3 h-3 text-primary" />
          Pausa: {formula.tempo_pausa_minutos} min
        </Badge>
        {formula.fundo_clareamento && (
          <Badge variant="outline" className="rounded-full border-outline-variant">
            ✨ {formula.fundo_clareamento}
          </Badge>
        )}
      </div>

      {formula.observacoes && (
        <p className="text-xs text-on-surface-variant pt-2 border-t border-outline-variant/30 leading-relaxed italic">
          Nota: {formula.observacoes}
        </p>
      )}
    </div>
  );
}
