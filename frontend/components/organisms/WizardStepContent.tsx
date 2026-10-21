'use client';

import React from 'react';
import { Cliente, Servico, Agendamento } from '@/lib/api';
import { WizardStepCliente } from '@/components/organisms/WizardStepCliente';
import { WizardStepServicos } from '@/components/organisms/WizardStepServicos';
import { WizardStepHorario } from '@/components/organisms/WizardStepHorario';
import { WizardStepConfirmacao } from '@/components/organisms/WizardStepConfirmacao';

export interface WizardStepContentProps {
  currentStep: number;
  mode: 'create' | 'edit';
  clienteSelecionada: Cliente | null;
  clientesFiltradas: Cliente[];
  searchCliente: string;
  setSearchCliente: (v: string) => void;
  onSelectCliente: (id: number) => void;
  onClearCliente: () => void;
  onClienteCriada: (c: Cliente) => void;
  searchServico: string;
  setSearchServico: (v: string) => void;
  categoriasServicos: string[];
  categoriaAtiva: string;
  setCategoriaAtiva: (c: string) => void;
  servicosFiltrados: Servico[];
  servicos: Servico[];
  servicosSelecionados: number[];
  onToggleServico: (id: number) => void;
  totalMinutos: number;
  valorTotal: number;
  hojeStr: string;
  dataStr: string;
  setDataStr: (v: string) => void;
  horaInicioStr: string;
  setHoraInicioStr: (v: string) => void;
  horaFimStr: string;
  isHorarioPassado: boolean;
  status: Agendamento['status'];
  setStatus: (s: Agendamento['status']) => void;
  observacoes: string;
  setObservacoes: (v: string) => void;
  onGoToStep: (step: number) => void;
  conflitos?: Agendamento[];
  loadingConflitos?: boolean;
}

export function WizardStepContent(props: WizardStepContentProps) {
  if (props.currentStep === 1) {
    return (
      <WizardStepCliente
        clienteSelecionada={props.clienteSelecionada}
        clientesFiltradas={props.clientesFiltradas}
        searchCliente={props.searchCliente}
        setSearchCliente={props.setSearchCliente}
        onSelectCliente={props.onSelectCliente}
        onClearCliente={props.onClearCliente}
        onClienteCriada={props.onClienteCriada}
      />
    );
  }
  if (props.currentStep === 2) {
    return (
      <WizardStepServicos
        searchServico={props.searchServico}
        setSearchServico={props.setSearchServico}
        categoriasServicos={props.categoriasServicos}
        categoriaAtiva={props.categoriaAtiva}
        setCategoriaAtiva={props.setCategoriaAtiva}
        servicosFiltrados={props.servicosFiltrados}
        servicosSelecionados={props.servicosSelecionados}
        onToggleServico={props.onToggleServico}
        totalMinutos={props.totalMinutos}
        valorTotal={props.valorTotal}
      />
    );
  }
  if (props.currentStep === 3) {
    return (
      <WizardStepHorario
        mode={props.mode}
        hojeStr={props.hojeStr}
        dataStr={props.dataStr}
        setDataStr={props.setDataStr}
        horaInicioStr={props.horaInicioStr}
        setHoraInicioStr={props.setHoraInicioStr}
        horaFimStr={props.horaFimStr}
        totalMinutos={props.totalMinutos}
        isHorarioPassado={props.isHorarioPassado}
        status={props.status}
        setStatus={props.setStatus}
        observacoes={props.observacoes}
        setObservacoes={props.setObservacoes}
        conflitos={props.conflitos}
        loadingConflitos={props.loadingConflitos}
      />
    );
  }
  return (
    <WizardStepConfirmacao
      mode={props.mode}
      clienteSelecionada={props.clienteSelecionada}
      dataStr={props.dataStr}
      horaInicioStr={props.horaInicioStr}
      horaFimStr={props.horaFimStr}
      totalMinutos={props.totalMinutos}
      servicos={props.servicos}
      servicosSelecionados={props.servicosSelecionados}
      status={props.status}
      observacoes={props.observacoes}
      valorTotal={props.valorTotal}
      onGoToStep={props.onGoToStep}
      conflitos={props.conflitos}
      loadingConflitos={props.loadingConflitos}
    />
  );
}
