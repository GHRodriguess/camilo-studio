'use client';

import React from 'react';
import { Calendar } from 'lucide-react';
import { Cliente, Servico, Agendamento } from '@/lib/api';
import { AgendamentosConflitoAlert } from '@/components/organisms/AgendamentosConflitoAlert';

const STATUS_LABELS: Record<string, string> = {
  agendado: 'Agendado (Pendente)',
  confirmado: 'Confirmado WhatsApp',
  em_atendimento: 'Em Atendimento',
  concluido: 'Finalizado',
  nao_compareceu: 'Não Compareceu',
  cancelado: 'Cancelado',
};

function ConfirmacaoProcedimentosList({
  servicos,
  servicosSelecionados,
  onAlterar,
}: {
  servicos: Servico[];
  servicosSelecionados: number[];
  onAlterar: () => void;
}) {
  return (
    <div className="space-y-2 pb-3 border-b border-outline-variant/40">
      <div className="flex items-center justify-between">
        <span className="text-[10px] uppercase font-semibold text-on-surface-variant tracking-wider">
          Procedimentos ({servicosSelecionados.length})
        </span>
        <button
          type="button"
          onClick={onAlterar}
          className="text-xs text-primary hover:bg-primary/10 rounded-full h-7 px-2.5 shrink-0 cursor-pointer"
        >
          Alterar
        </button>
      </div>
      <div className="space-y-1.5 pt-0.5">
        {servicos
          .filter((s) => servicosSelecionados.includes(s.id))
          .map((servico) => (
            <div
              key={servico.id}
              className="flex items-center justify-between text-xs py-1.5 border-b last:border-b-0 border-outline-variant/25 gap-2"
            >
              <span className="font-medium text-on-surface truncate">{servico.nome}</span>
              <div className="flex items-center gap-2 font-mono text-[11px] shrink-0">
                <span className="text-on-surface-variant">{servico.duracao_minutos} min</span>
                <span className="font-bold text-on-surface font-heading">
                  R$ {Number(servico.preco).toFixed(0)}
                </span>
              </div>
            </div>
          ))}
      </div>
    </div>
  );
}

interface StepConfirmacaoProps {
  mode: 'create' | 'edit';
  clienteSelecionada: Cliente | null;
  dataStr: string;
  horaInicioStr: string;
  horaFimStr: string;
  totalMinutos: number;
  servicos: Servico[];
  servicosSelecionados: number[];
  status: Agendamento['status'];
  observacoes: string;
  valorTotal: number;
  onGoToStep: (step: number) => void;
  conflitos?: Agendamento[];
  loadingConflitos?: boolean;
}

export function WizardStepConfirmacao(props: StepConfirmacaoProps) {
  return (
    <div className="space-y-4 sm:space-y-5 min-w-0">
      <div>
        <span className="text-[11px] uppercase tracking-[0.2em] font-semibold text-primary">Passo 4 de 4</span>
        <h3 className="text-lg sm:text-2xl font-bold text-on-surface font-heading tracking-tight mt-0.5">Revisão do Atendimento</h3>
        <p className="text-xs text-on-surface-variant mt-0.5">Confira os detalhes antes de confirmar o agendamento no Studio Marilia Camilo.</p>
      </div>

      {props.conflitos && props.conflitos.length > 0 && (
        <AgendamentosConflitoAlert conflitos={props.conflitos} loading={props.loadingConflitos} />
      )}

      <div className="p-4 sm:p-5 rounded-2xl bg-surface-container-low border border-outline-variant/60 space-y-4 min-w-0">
        <div className="flex items-center justify-between pb-3 border-b border-outline-variant/40 gap-2">
          <div className="flex items-center gap-2.5 min-w-0 flex-1">
            <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-xs shrink-0">
              {props.clienteSelecionada?.nome.slice(0, 2).toUpperCase()}
            </div>
            <div className="min-w-0 flex-1">
              <span className="text-[10px] uppercase font-semibold text-on-surface-variant tracking-wider block truncate">Cliente</span>
              <p className="text-sm font-bold text-on-surface font-heading truncate">{props.clienteSelecionada?.nome}</p>
              <p className="text-[11px] text-on-surface-variant font-mono truncate">{props.clienteSelecionada?.telefone}</p>
            </div>
          </div>
          <button type="button" onClick={() => props.onGoToStep(1)} className="text-xs text-primary hover:bg-primary/10 rounded-full h-7 px-2.5 shrink-0 cursor-pointer">
            Alterar
          </button>
        </div>

        <div className="flex items-center justify-between pb-3 border-b border-outline-variant/40 gap-2">
          <div className="flex items-center gap-2.5 min-w-0 flex-1">
            <div className="w-8 h-8 rounded-full bg-surface-container-high text-on-surface-variant flex items-center justify-center shrink-0">
              <Calendar className="w-4 h-4" />
            </div>
            <div className="min-w-0 flex-1">
              <span className="text-[10px] uppercase font-semibold text-on-surface-variant tracking-wider block truncate">Horário Marcado</span>
              <p className="text-xs sm:text-sm font-semibold text-on-surface truncate">
                {props.dataStr ? new Date(`${props.dataStr}T12:00:00`).toLocaleDateString('pt-BR', { weekday: 'short', day: '2-digit', month: 'short' }) : ''}
              </p>
              <p className="text-[11px] text-on-surface-variant font-mono truncate">{props.horaInicioStr} às {props.horaFimStr} ({props.totalMinutos} min)</p>
            </div>
          </div>
          <button type="button" onClick={() => props.onGoToStep(3)} className="text-xs text-primary hover:bg-primary/10 rounded-full h-7 px-2.5 shrink-0 cursor-pointer">
            Alterar
          </button>
        </div>

        <ConfirmacaoProcedimentosList
          servicos={props.servicos}
          servicosSelecionados={props.servicosSelecionados}
          onAlterar={() => props.onGoToStep(2)}
        />

        {props.mode === 'edit' && (
          <div className="flex items-center justify-between pb-3 border-b border-outline-variant/40">
            <span className="text-[10px] uppercase font-semibold text-on-surface-variant tracking-wider">Status do Atendimento</span>
            <span className="text-xs font-semibold text-primary bg-primary/10 px-3 py-0.5 rounded-full">
              {STATUS_LABELS[props.status] || props.status}
            </span>
          </div>
        )}

        {props.observacoes && (
          <div className="text-xs pb-3 border-b border-outline-variant/40">
            <span className="text-[10px] uppercase font-semibold text-on-surface-variant tracking-wider block mb-1">Observações</span>
            <p className="text-on-surface-variant italic text-xs pt-0.5">&quot;{props.observacoes}&quot;</p>
          </div>
        )}

        <div className="flex items-center justify-between pt-1">
          <div>
            <p className="text-[10px] uppercase tracking-wider text-on-surface-variant font-semibold">Investimento Total</p>
            <p className="text-[11px] text-on-surface-variant">{props.totalMinutos} minutos de atendimento</p>
          </div>
          <p className="text-xl sm:text-2xl font-bold text-primary font-heading">R$ {props.valorTotal.toFixed(2).replace('.', ',')}</p>
        </div>
      </div>
    </div>
  );
}
