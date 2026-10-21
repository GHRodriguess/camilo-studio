'use client';

import React from 'react';
import Link from 'next/link';
import {
  CalendarDays,
  CheckCircle,
  MessageSquare,
  Sparkles,
  Receipt,
  Clock,
  Edit2,
} from 'lucide-react';
import type { Agendamento } from '@/lib/api';
import { DeleteButton } from '@/components/atoms/DeleteButton';
import { Button } from '@/components/ui/button';
import { AgendamentoStatusBadge } from '@/components/molecules/AgendamentoStatusBadge';

interface CardProps {
  ag: Agendamento;
  onIniciar: (id: number) => void;
  onConcluir: (id: number) => void;
  onNaoCompareceu: (id: number) => void;
  onWhatsapp: (id: number) => void;
  onEditar: (ag: Agendamento) => void;
  onExcluir: (ag: Agendamento) => void;
}

export function AgendamentoCard(props: CardProps) {
  const { ag, onIniciar, onConcluir, onNaoCompareceu, onWhatsapp, onEditar, onExcluir } = props;
  const dtIni = new Date(ag.data_hora_inicio);
  const dtFim = new Date(ag.data_hora_fim);
  const dtFormatada = dtIni.toLocaleDateString('pt-BR', { weekday: 'short', day: '2-digit', month: 'short' });
  const horaIni = dtIni.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  const horaFim = dtFim.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });

  return (
    <div className="p-5 sm:p-6 rounded-3xl bg-surface-container-lowest border border-outline-variant/60 shadow-sm hover:shadow-md hover:border-primary/40 transition-all flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-2.5 pb-3 border-b border-outline-variant/40">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-surface-container text-xs font-semibold text-primary uppercase tracking-wider">
            <CalendarDays className="w-3.5 h-3.5 text-primary shrink-0" />
            <span>{dtFormatada}</span>
          </span>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-surface-container-low border border-outline-variant/40 text-xs font-mono font-medium text-on-surface">
            <Clock className="w-3.5 h-3.5 text-on-surface-variant shrink-0" />
            <span>{horaIni} às {horaFim}</span>
          </span>
        </div>
        <AgendamentoStatusBadge agendamento={ag} />
      </div>

      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="space-y-1.5 min-w-0 flex-1">
          <Link href={`/clientes/${ag.cliente}`} className="text-base sm:text-lg font-bold text-on-surface font-heading truncate hover:text-primary transition-colors block">
            {ag.cliente_detalhes?.nome || 'Cliente'}
          </Link>
          <div className="flex flex-wrap gap-1.5 pt-0.5">
            {ag.servicos_detalhes?.map((serv) => (
              <span key={serv.id} className="px-2.5 py-0.5 rounded-full text-[11px] bg-surface-container text-on-surface-variant font-medium">
                {serv.nome}
              </span>
            ))}
          </div>
          {ag.observacoes && <p className="text-xs text-on-surface-variant italic pt-0.5">Nota: {ag.observacoes}</p>}
        </div>

        <div className="flex flex-col sm:flex-row lg:flex-col items-start sm:items-center lg:items-end justify-between gap-3 pt-3 lg:pt-0 border-t lg:border-t-0 border-outline-variant/40 shrink-0">
          <div className="text-left lg:text-right">
            <p className="text-[10px] uppercase tracking-wider text-on-surface-variant font-semibold">Total</p>
            <p className="text-lg sm:text-xl font-bold text-primary font-heading">
              R$ {Number(ag.valor_total).toFixed(2).replace('.', ',')}
            </p>
          </div>

          <div className="flex flex-wrap sm:flex-nowrap items-center gap-1.5 w-full sm:w-auto">
            {ag.status === 'em_atendimento' && (
              <Button size="sm" onClick={() => onConcluir(ag.id)} className="rounded-full h-9 px-3.5 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold text-xs shadow-sm gap-1.5 cursor-pointer whitespace-nowrap">
                <CheckCircle className="w-3.5 h-3.5" /> <span>Finalizar</span>
              </Button>
            )}
            {(ag.status === 'agendado' || ag.status === 'confirmado') && (
              <>
                <Button size="sm" onClick={() => onIniciar(ag.id)} className="rounded-full h-9 px-3.5 bg-primary/10 hover:bg-primary text-primary hover:text-primary-foreground border border-primary/20 font-semibold text-xs gap-1.5 cursor-pointer whitespace-nowrap transition-colors">
                  <Sparkles className="w-3.5 h-3.5" /> <span>Iniciar</span>
                </Button>
                {ag.indicador_temporal === 'atrasado' && (
                  <Button variant="outline" size="sm" onClick={() => onNaoCompareceu(ag.id)} className="rounded-full h-9 px-2.5 text-xs border-amber-500/40 text-amber-700 dark:text-amber-300 hover:bg-amber-500/10 cursor-pointer whitespace-nowrap" title="Marcar Não Compareceu">
                    <span>Falta</span>
                  </Button>
                )}
              </>
            )}
            {ag.status !== 'confirmado' && ag.status !== 'concluido' && ag.status !== 'cancelado' && ag.status !== 'nao_compareceu' && (
              <Button size="sm" onClick={() => onWhatsapp(ag.id)} className="flex-1 sm:flex-initial rounded-full h-9 px-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-xs shadow-sm gap-1.5 cursor-pointer whitespace-nowrap">
                <MessageSquare className="w-3.5 h-3.5" /> <span>WhatsApp</span>
              </Button>
            )}
            <Link href={`/agenda/${ag.id}/comprovante`} className="inline-flex items-center justify-center rounded-full h-9 px-3 text-xs border border-outline-variant hover:border-primary/50 text-on-surface cursor-pointer whitespace-nowrap" title="Ver Comprovante">
              <Receipt className="w-3.5 h-3.5 text-primary" />
            </Link>
            <Button variant="outline" size="sm" onClick={() => onEditar(ag)} className="rounded-full h-9 px-3 text-xs border border-outline-variant hover:border-primary/50 text-on-surface cursor-pointer whitespace-nowrap gap-1" title="Editar Agendamento">
              <Edit2 className="w-3.5 h-3.5 text-primary" /> <span>Editar</span>
            </Button>
            <DeleteButton onDelete={() => onExcluir(ag)} title="Excluir agendamento" />
          </div>
        </div>
      </div>
    </div>
  );
}
