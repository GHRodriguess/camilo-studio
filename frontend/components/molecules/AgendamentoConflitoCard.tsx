'use client';

import React from 'react';
import { Clock, User, Scissors } from 'lucide-react';
import { Agendamento } from '@/lib/api';
import { AgendamentoStatusBadge } from '@/components/molecules/AgendamentoStatusBadge';

interface AgendamentoConflitoCardProps {
  agendamento: Agendamento;
}

function formatarHora(isoString: string): string {
  try {
    const d = new Date(isoString);
    if (isNaN(d.getTime())) return '--:--';
    return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
  } catch {
    return '--:--';
  }
}

export function AgendamentoConflitoCard({ agendamento }: AgendamentoConflitoCardProps) {
  const horaInicio = formatarHora(agendamento.data_hora_inicio);
  const horaFim = formatarHora(agendamento.data_hora_fim);
  const clienteNome = agendamento.cliente_detalhes?.nome || 'Cliente';
  const profNome = agendamento.profissional_detalhes?.nome || 'Equipe Camilo Studio';
  const servicosNomes = agendamento.servicos_detalhes && agendamento.servicos_detalhes.length > 0
    ? agendamento.servicos_detalhes.map((s) => s.nome).join(', ')
    : 'Serviços não especificados';

  return (
    <div className="p-3 sm:p-3.5 rounded-2xl bg-surface-container-lowest border border-outline-variant/50 space-y-2 text-xs">
      <div className="flex items-start justify-between gap-2 flex-wrap">
        <div className="flex items-center gap-2 min-w-0">
          <div className="w-7 h-7 rounded-full bg-surface-container-high text-on-surface-variant flex items-center justify-center font-bold text-[11px] shrink-0">
            {clienteNome.slice(0, 2).toUpperCase()}
          </div>
          <div className="min-w-0">
            <p className="font-bold text-on-surface truncate font-heading">{clienteNome}</p>
            <div className="flex items-center gap-1.5 text-[11px] text-on-surface-variant">
              <Clock className="w-3 h-3 text-on-surface-variant shrink-0" />
              <span className="font-mono font-medium text-on-surface">
                {horaInicio} às {horaFim}
              </span>
            </div>
          </div>
        </div>
        <div className="shrink-0">
          <AgendamentoStatusBadge agendamento={agendamento} />
        </div>
      </div>

      <div className="pt-1.5 border-t border-outline-variant/30 flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 text-[11px] text-on-surface-variant">
        <div className="flex items-center gap-1.5 truncate">
          <Scissors className="w-3 h-3 shrink-0 text-on-surface-variant" />
          <span className="truncate">{servicosNomes}</span>
        </div>
        <div className="flex items-center gap-1.5 shrink-0">
          <User className="w-3 h-3 shrink-0 text-on-surface-variant" />
          <span>{profNome}</span>
        </div>
      </div>
    </div>
  );
}
