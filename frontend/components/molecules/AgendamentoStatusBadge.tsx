'use client';

import React from 'react';
import {
  CheckCircle,
  Sparkles,
  Clock,
  AlertTriangle,
  XCircle,
  UserX,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Agendamento } from '@/lib/api';

interface AgendamentoStatusBadgeProps {
  agendamento: Agendamento;
}

export function AgendamentoStatusBadge({ agendamento }: AgendamentoStatusBadgeProps) {
  const { status, indicador_temporal, tempo_relativo_display } = agendamento;

  if (status === 'em_atendimento') {
    const isExcedido = indicador_temporal === 'tempo_excedido';
    return (
      <Badge
        className={`text-[11px] gap-1.5 font-semibold rounded-full border px-2.5 py-0.5 ${
          isExcedido
            ? 'bg-primary/20 text-primary border-primary/40'
            : 'bg-primary/10 text-primary border-primary/30 animate-pulse'
        }`}
      >
        <Sparkles className="w-3 h-3 text-primary shrink-0" />
        <span>Em Atendimento</span>
        {tempo_relativo_display && (
          <span className="opacity-90 font-mono text-[10px] ml-0.5">
            • {tempo_relativo_display}
          </span>
        )}
      </Badge>
    );
  }

  if (status === 'confirmado') {
    const isAtrasado = indicador_temporal === 'atrasado';
    if (isAtrasado) {
      return (
        <Badge className="bg-amber-500/15 text-amber-800 dark:text-amber-300 border-amber-500/40 text-[11px] gap-1.5 font-semibold rounded-full border animate-pulse px-2.5 py-0.5">
          <AlertTriangle className="w-3 h-3 shrink-0" />
          <span>Confirmado WhatsApp</span>
          {tempo_relativo_display && (
            <span className="font-mono text-[10px] ml-0.5">• {tempo_relativo_display}</span>
          )}
        </Badge>
      );
    }
    return (
      <Badge className="bg-emerald-500/15 text-emerald-800 dark:text-emerald-300 border-emerald-500/40 text-[11px] gap-1.5 font-semibold rounded-full border px-2.5 py-0.5">
        <CheckCircle className="w-3 h-3 shrink-0" />
        <span>Confirmado WhatsApp</span>
        {tempo_relativo_display && tempo_relativo_display.startsWith('Começa') && (
          <span className="font-mono text-[10px] ml-0.5">• {tempo_relativo_display}</span>
        )}
      </Badge>
    );
  }

  if (status === 'nao_compareceu') {
    return (
      <Badge className="bg-surface-container-high text-on-surface-variant border-outline-variant text-[11px] gap-1.5 rounded-full border px-2.5 py-0.5">
        <UserX className="w-3 h-3 shrink-0 text-on-surface-variant" />
        <span>Não Compareceu</span>
      </Badge>
    );
  }

  if (status === 'concluido') {
    return (
      <Badge className="bg-surface-container text-on-surface-variant border-outline-variant/50 text-[11px] gap-1.5 rounded-full border px-2.5 py-0.5">
        <CheckCircle className="w-3 h-3 text-on-surface-variant shrink-0" />
        <span>Finalizado</span>
      </Badge>
    );
  }

  if (status === 'cancelado') {
    return (
      <Badge className="bg-destructive/10 text-destructive border-destructive/20 text-[11px] gap-1.5 rounded-full border px-2.5 py-0.5">
        <XCircle className="w-3 h-3 shrink-0" />
        <span>Cancelado</span>
      </Badge>
    );
  }

  // Padrão: agendado
  const isAtrasado = indicador_temporal === 'atrasado';
  if (isAtrasado) {
    return (
      <Badge className="bg-amber-500/15 text-amber-800 dark:text-amber-300 border-amber-500/40 text-[11px] gap-1.5 font-semibold rounded-full border animate-pulse px-2.5 py-0.5">
        <AlertTriangle className="w-3 h-3 shrink-0" />
        <span>Aguardando Início</span>
        {tempo_relativo_display && (
          <span className="font-mono text-[10px] ml-0.5">• {tempo_relativo_display}</span>
        )}
      </Badge>
    );
  }

  return (
    <Badge className="bg-surface-container-low text-on-surface-variant border-outline-variant/60 text-[11px] gap-1.5 rounded-full border px-2.5 py-0.5">
      <Clock className="w-3 h-3 shrink-0" />
      <span>Agendado</span>
      {tempo_relativo_display && tempo_relativo_display.startsWith('Começa') && (
        <span className="font-mono text-[10px] ml-0.5">• {tempo_relativo_display}</span>
      )}
    </Badge>
  );
}
