'use client';

import React from 'react';
import { AlertOctagon, CalendarClock, Edit3, Scissors } from 'lucide-react';
import { Agendamento } from '@/lib/api';
import { Button } from '@/components/ui/button';

interface ClienteConflitoCardProps {
  tipo: 'sobreposicao' | 'mesmo_dia';
  agendamento: Agendamento;
  onEditar: (agendamento: Agendamento) => void;
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

export function ClienteConflitoCard({ tipo, agendamento, onEditar }: ClienteConflitoCardProps) {
  const horaInicio = formatarHora(agendamento.data_hora_inicio);
  const horaFim = formatarHora(agendamento.data_hora_fim);
  const clienteNome = agendamento.cliente_detalhes?.nome || 'Esta cliente';
  const servicos = agendamento.servicos_detalhes?.map((s) => s.nome).join(', ') || 'Procedimentos agendados';

  const isSobreposicao = tipo === 'sobreposicao';

  return (
    <div
      className={`p-3.5 sm:p-4 rounded-2xl border transition-all space-y-3 ${
        isSobreposicao
          ? 'bg-destructive/10 border-destructive/30 text-destructive'
          : 'bg-primary/5 border-primary/20 text-on-surface'
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-2.5 min-w-0">
          <div
            className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${
              isSobreposicao
                ? 'bg-destructive/15 text-destructive'
                : 'bg-primary/15 text-primary'
            }`}
          >
            {isSobreposicao ? <AlertOctagon className="w-4 h-4" /> : <CalendarClock className="w-4 h-4" />}
          </div>
          <div className="min-w-0 space-y-0.5">
            <h4 className="text-xs sm:text-sm font-bold font-heading">
              {isSobreposicao
                ? 'Horário Indisponível para esta Cliente'
                : 'Cliente com Outro Atendimento no Dia'}
            </h4>
            <p className="text-[11px] sm:text-xs text-on-surface-variant leading-relaxed">
              {isSobreposicao ? (
                <>
                  Já existe um atendimento para <strong className="text-on-surface">{clienteNome}</strong> hoje das{' '}
                  <span className="font-mono font-semibold text-destructive">{horaInicio} às {horaFim}</span>.
                </>
              ) : (
                <>
                  <strong className="text-on-surface">{clienteNome}</strong> já possui um atendimento agendado hoje das{' '}
                  <span className="font-mono font-semibold text-primary">{horaInicio} às {horaFim}</span>.
                </>
              )}
            </p>
          </div>
        </div>

        <Button
          type="button"
          onClick={() => onEditar(agendamento)}
          variant={isSobreposicao ? 'default' : 'outline'}
          size="sm"
          className={`shrink-0 rounded-full text-xs font-semibold h-9 px-3.5 gap-1.5 cursor-pointer ${
            isSobreposicao
              ? 'bg-destructive text-destructive-foreground hover:bg-destructive/90 shadow-sm'
              : 'border-primary/30 text-primary hover:bg-primary/10'
          }`}
        >
          <Edit3 className="w-3.5 h-3.5" />
          <span>Editar Atendimento</span>
        </Button>
      </div>

      <div className="pt-2 border-t border-outline-variant/30 flex items-center gap-2 text-[11px] text-on-surface-variant">
        <Scissors className="w-3.5 h-3.5 shrink-0" />
        <span className="truncate">{servicos}</span>
      </div>
    </div>
  );
}
