'use client';

import React from 'react';
import { Clock } from 'lucide-react';
import { Agendamento } from '@/lib/api';
import { AgendamentosConflitoAlert } from '@/components/organisms/AgendamentosConflitoAlert';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const STATUS_OPTIONS: { value: Agendamento['status']; label: string }[] = [
  { value: 'agendado', label: 'Agendado (Pendente)' },
  { value: 'confirmado', label: 'Confirmado WhatsApp' },
  { value: 'em_atendimento', label: 'Em Atendimento' },
  { value: 'concluido', label: 'Finalizado' },
  { value: 'nao_compareceu', label: 'Não Compareceu' },
  { value: 'cancelado', label: 'Cancelado' },
];

const STATUS_LABELS: Record<string, string> = {
  agendado: 'Agendado (Pendente)',
  confirmado: 'Confirmado WhatsApp',
  em_atendimento: 'Em Atendimento',
  concluido: 'Finalizado',
  nao_compareceu: 'Não Compareceu',
  cancelado: 'Cancelado',
};

interface StepHorarioProps {
  mode: 'create' | 'edit';
  hojeStr: string;
  dataStr: string;
  setDataStr: (v: string) => void;
  horaInicioStr: string;
  setHoraInicioStr: (v: string) => void;
  horaFimStr: string;
  totalMinutos: number;
  isHorarioPassado: boolean;
  status: Agendamento['status'];
  setStatus: (s: Agendamento['status']) => void;
  observacoes: string;
  setObservacoes: (v: string) => void;
  conflitos?: Agendamento[];
  loadingConflitos?: boolean;
}

export function WizardStepHorario(props: StepHorarioProps) {
  return (
    <div className="space-y-4 sm:space-y-5 min-w-0">
      <div>
        <span className="text-[11px] uppercase tracking-[0.2em] font-semibold text-primary">Passo 3 de 4</span>
        <h3 className="text-lg sm:text-2xl font-bold text-on-surface font-heading tracking-tight mt-0.5">Quando será o atendimento?</h3>
        <p className="text-xs text-on-surface-variant mt-0.5">Defina a data e o horário de início. A previsão de término é calculada automaticamente.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
        <div className="space-y-1.5">
          <Label className="text-xs font-medium text-on-surface-variant">Data do Atendimento</Label>
          <Input type="date" required min={props.hojeStr} value={props.dataStr} onChange={(e) => props.setDataStr(e.target.value)} className="rounded-full h-11 text-xs sm:text-sm" />
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs font-medium text-on-surface-variant">Horário de Início</Label>
          <Input
            type="time"
            required
            value={props.horaInicioStr}
            onChange={(e) => props.setHoraInicioStr(e.target.value)}
            className={`rounded-full h-11 text-xs sm:text-sm font-mono ${props.isHorarioPassado ? 'border-destructive focus-visible:ring-destructive' : ''}`}
          />
        </div>
      </div>

      {props.isHorarioPassado && (
        <div className="p-3 rounded-2xl bg-destructive/10 border border-destructive/20 text-destructive text-xs">
          O horário selecionado é anterior ao momento atual. Por favor, selecione um horário futuro para continuar.
        </div>
      )}

      <div className="p-3.5 rounded-2xl bg-surface-container-low border border-outline-variant/40 flex items-center justify-between text-xs">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-surface-container-high text-on-surface-variant flex items-center justify-center shrink-0">
            <Clock className="w-4 h-4" />
          </div>
          <div>
            <p className="text-on-surface-variant text-[10px]">Previsão de Término:</p>
            <p className="font-bold text-on-surface font-mono text-xs sm:text-sm">{props.horaFimStr ? `${props.horaFimStr} (${props.totalMinutos} min somados)` : '--:--'}</p>
          </div>
        </div>
      </div>

      {props.conflitos && props.conflitos.length > 0 && (
        <AgendamentosConflitoAlert conflitos={props.conflitos} loading={props.loadingConflitos} />
      )}

      {props.mode === 'edit' && (
        <div className="space-y-1.5 w-full">
          <Label className="text-xs font-medium text-on-surface-variant">Status do Atendimento</Label>
          <Select value={props.status} onValueChange={(val) => props.setStatus(val as Agendamento['status'])}>
            <SelectTrigger className="w-full rounded-full h-11 text-xs sm:text-sm bg-surface-container-lowest border-outline-variant px-4">
              <SelectValue>{(val) => STATUS_LABELS[val as string] || 'Selecione o status...'}</SelectValue>
            </SelectTrigger>
            <SelectContent className="w-(--anchor-width) min-w-[240px]">
              {STATUS_OPTIONS.map((opt) => (
                <SelectItem key={opt.value} value={opt.value} className="text-xs sm:text-sm py-2">{opt.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      <div className="space-y-1.5">
        <Label className="text-xs font-medium text-on-surface-variant">Observações Especiais (Opcional)</Label>
        <Textarea rows={2} value={props.observacoes} onChange={(e) => props.setObservacoes(e.target.value)} placeholder="Ex: Recomendações de tom, preferências de café, etc..." className="rounded-2xl text-xs resize-none" />
      </div>
    </div>
  );
}
