'use client';

import React, { useState } from 'react';
import { AlertTriangle, ChevronDown, ChevronUp } from 'lucide-react';
import { Agendamento } from '@/lib/api';
import { AgendamentoConflitoCard } from '@/components/molecules/AgendamentoConflitoCard';

interface AgendamentosConflitoAlertProps {
  conflitos: Agendamento[];
  loading?: boolean;
}

export function AgendamentosConflitoAlert({ conflitos, loading }: AgendamentosConflitoAlertProps) {
  const [expandido, setExpandido] = useState(false);

  if (conflitos.length === 0) return null;

  const count = conflitos.length;
  const titulo = count === 1
    ? '1 agendamento concorrente no mesmo horário'
    : `${count} agendamentos concorrentes no mesmo horário`;

  return (
    <div className={`rounded-2xl border border-amber-500/25 bg-amber-500/5 p-3.5 sm:p-4 transition-all ${expandido ? 'space-y-3' : 'space-y-0'}`}>
      <div
        onClick={() => setExpandido((prev) => !prev)}
        className="flex items-start justify-between gap-2.5 cursor-pointer select-none"
      >
        <div className="flex items-start gap-2.5">
          <div className="w-8 h-8 rounded-full bg-amber-500/15 text-amber-700 dark:text-amber-400 flex items-center justify-center shrink-0 mt-0.5">
            <AlertTriangle className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs sm:text-sm font-semibold text-on-surface font-heading">
              {titulo}
            </h4>
            <p className="text-[11px] sm:text-xs text-on-surface-variant mt-0.5 leading-relaxed">
              Atendimento concorrente já agendado no ateliê neste intervalo.
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            setExpandido((prev) => !prev);
          }}
          className="text-xs text-on-surface-variant hover:text-on-surface p-1 rounded-lg hover:bg-surface-container transition-colors shrink-0 cursor-pointer"
          aria-label={expandido ? 'Ocultar detalhes dos conflitos' : 'Ver detalhes dos conflitos'}
        >
          {expandido ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>
      </div>

      {expandido && (
        <div className="space-y-2 pt-1 border-t border-amber-500/15">
          <span className="text-[10px] uppercase font-semibold text-on-surface-variant tracking-wider block">
            Atendimentos no Período ({count})
          </span>
          <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
            {conflitos.map((item) => (
              <AgendamentoConflitoCard key={item.id} agendamento={item} />
            ))}
          </div>
        </div>
      )}
      {loading && (
        <p className="text-[10px] text-on-surface-variant italic">Atualizando verificação de horários...</p>
      )}
    </div>
  );
}
