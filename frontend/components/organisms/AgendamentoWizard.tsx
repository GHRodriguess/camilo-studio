'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { X } from 'lucide-react';
import { api, Cliente, Servico, Agendamento } from '@/lib/api';
import { LoadingState } from '@/components/atoms/LoadingState';
import { WizardStepContent } from '@/components/organisms/WizardStepContent';
import { WizardStepper, WizardNavigation } from '@/components/organisms/WizardStepper';

export interface AgendamentoWizardProps {
  mode: 'create' | 'edit';
  initialData?: Agendamento | null;
  onSuccess: (agendamento: Agendamento) => void;
  onCancel?: () => void;
  isModal?: boolean;
}

function WizardModalHeader({ mode }: { mode: 'create' | 'edit' }) {
  return (
    <div className="pb-1 border-b border-outline-variant/40">
      <span className="text-[10px] uppercase tracking-[0.2em] font-semibold text-primary">{mode === 'edit' ? 'Editar Atendimento' : 'Novo Atendimento'}</span>
      <h2 className="text-lg sm:text-xl font-bold text-on-surface font-heading tracking-tight">{mode === 'edit' ? 'Editar Agendamento' : 'Marcar Agendamento'}</h2>
    </div>
  );
}

function aplicarValoresWizard(
  ag: Agendamento | null | undefined,
  set: (cId: number | '', s: number[], d: string, h: string, st: Agendamento['status'], obs: string) => void
) {
  if (ag) {
    const d = new Date(ag.data_hora_inicio);
    const dStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    const hStr = `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
    set(ag.cliente, ag.servicos || [], dStr, hStr, ag.status, ag.observacoes || '');
  } else {
    set('', [], new Date().toISOString().split('T')[0], '10:00', 'agendado', '');
  }
}

function useWizardInit(mode: 'create' | 'edit', initialData?: Agendamento | null) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentStep, setCurrentStep] = useState(1);
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [servicos, setServicos] = useState<Servico[]>([]);
  const [clienteId, setClienteId] = useState<number | ''>('');
  const [servicosSelecionados, setServicosSelecionados] = useState<number[]>([]);
  const [dataStr, setDataStr] = useState('');
  const [horaInicioStr, setHoraInicioStr] = useState('10:00');
  const [status, setStatus] = useState<Agendamento['status']>('agendado');
  const [observacoes, setObservacoes] = useState('');

  const setDados = (cId: number | '', s: number[], d: string, h: string, st: Agendamento['status'], obs: string) => {
    setClienteId(cId); setServicosSelecionados(s); setDataStr(d); setHoraInicioStr(h); setStatus(st); setObservacoes(obs);
  };

  useEffect(() => {
    async function carregar() {
      try {
        const [c, s] = await Promise.all([api.getClientes(), api.getServicos()]);
        setClientes(Array.isArray(c) ? c : c.results || []);
        setServicos(Array.isArray(s) ? s : s.results || []);
        setCurrentStep(1);
        aplicarValoresWizard(mode === 'edit' ? initialData : null, setDados);
      } catch {
        setError('Erro ao carregar lista de clientes e serviços.');
      } finally {
        setLoading(false);
      }
    }
    carregar();
  }, [mode, initialData]);

  return {
    loading, error, setError, currentStep, setCurrentStep, clientes, setClientes, servicos,
    clienteId, setClienteId, servicosSelecionados, setServicosSelecionados,
    dataStr, setDataStr, horaInicioStr, setHoraInicioStr, status, setStatus,
    observacoes, setObservacoes,
  };
}

function useWizardFilters(
  clientes: Cliente[],
  servicos: Servico[],
  clienteId: number | '',
  searchCliente: string,
  searchServico: string,
  categoriaAtiva: string
) {
  const clienteSelecionada = useMemo(() => clientes.find((c) => c.id === clienteId) || null, [clientes, clienteId]);
  const clientesFiltradas = useMemo(() => {
    const q = searchCliente.trim().toLowerCase();
    if (!q) return clientes;
    const qDigits = q.replace(/\D/g, '');
    return clientes.filter((c) => c.nome.toLowerCase().includes(q) || (qDigits ? c.telefone.replace(/\D/g, '').includes(qDigits) : false));
  }, [clientes, searchCliente]);

  const categoriasServicos = useMemo(() => {
    const setCats = new Set<string>();
    servicos.forEach((s) => { if (s.categoria) setCats.add(s.categoria); });
    return ['Todas', ...Array.from(setCats)];
  }, [servicos]);

  const servicosFiltrados = useMemo(() => {
    const q = searchServico.trim().toLowerCase();
    return servicos.filter((s) => (categoriaAtiva === 'Todas' || s.categoria === categoriaAtiva) && (q === '' || s.nome.toLowerCase().includes(q)));
  }, [servicos, searchServico, categoriaAtiva]);

  return { clienteSelecionada, clientesFiltradas, categoriasServicos, servicosFiltrados };
}

function useWizardTotals(
  servicos: Servico[],
  servicosSelecionados: number[],
  dataStr: string,
  horaInicioStr: string,
  horaReferencia: number,
  clienteId: number | '',
  currentStep: number
) {
  const totalMinutos = useMemo(() => servicos.filter((s) => servicosSelecionados.includes(s.id)).reduce((acc, s) => acc + s.duracao_minutos, 0), [servicos, servicosSelecionados]);
  const valorTotal = useMemo(() => servicos.filter((s) => servicosSelecionados.includes(s.id)).reduce((acc, s) => acc + Number(s.preco), 0), [servicos, servicosSelecionados]);

  const horaFimStr = useMemo(() => {
    if (!horaInicioStr) return '';
    const [h, m] = horaInicioStr.split(':').map(Number);
    const totalM = (h * 60 + m + (totalMinutos || 60)) % (24 * 60);
    return `${String(Math.floor(totalM / 60)).padStart(2, '0')}:${String(totalM % 60).padStart(2, '0')}`;
  }, [horaInicioStr, totalMinutos]);

  const isHorarioPassado = useMemo(() => {
    if (!dataStr || !horaInicioStr) return false;
    const sel = new Date(`${dataStr}T${horaInicioStr}:00`);
    return isNaN(sel.getTime()) ? false : sel.getTime() < horaReferencia - 5 * 60 * 1000;
  }, [dataStr, horaInicioStr, horaReferencia]);

  const canAdvance = useMemo(() => {
    if (currentStep === 1) return !!clienteId;
    if (currentStep === 2) return servicosSelecionados.length > 0;
    if (currentStep === 3) return !!dataStr && !!horaInicioStr && !isHorarioPassado;
    return true;
  }, [currentStep, clienteId, servicosSelecionados, dataStr, horaInicioStr, isHorarioPassado]);

  return { totalMinutos, valorTotal, horaFimStr, isHorarioPassado, canAdvance };
}

function useWizardConflitos(
  dataStr: string,
  horaInicioStr: string,
  totalMinutos: number,
  initialId?: number
) {
  const [conflitos, setConflitos] = useState<Agendamento[]>([]);
  const [loadingConflitos, setLoadingConflitos] = useState(false);

  useEffect(() => {
    const timer = setTimeout(async () => {
      if (!dataStr || !horaInicioStr) {
        setConflitos([]);
        return;
      }
      try {
        setLoadingConflitos(true);
        const inicio = new Date(`${dataStr}T${horaInicioStr}:00`);
        if (isNaN(inicio.getTime())) {
          setConflitos([]);
          return;
        }
        const duracao = totalMinutos || 60;
        const fim = new Date(inicio.getTime() + duracao * 60000);
        const res = await api.getConflitosAgendamento(inicio.toISOString(), fim.toISOString(), initialId);
        setConflitos(Array.isArray(res) ? res : []);
      } catch {
        setConflitos([]);
      } finally {
        setLoadingConflitos(false);
      }
    }, 350);

    return () => clearTimeout(timer);
  }, [dataStr, horaInicioStr, totalMinutos, initialId]);

  return { conflitos, loadingConflitos };
}

export function AgendamentoWizard({
  mode,
  initialData,
  onSuccess,
  onCancel,
  isModal = false,
}: AgendamentoWizardProps) {
  const [submitting, setSubmitting] = useState(false);
  const [searchCliente, setSearchCliente] = useState('');
  const [searchServico, setSearchServico] = useState('');
  const [categoriaAtiva, setCategoriaAtiva] = useState('Todas');
  const hojeStr = useMemo(() => new Date().toISOString().split('T')[0], []);
  const [horaReferencia] = useState(() => Date.now());

  const w = useWizardInit(mode, initialData);
  const currentStep = (!w.clienteId && mode === 'create') ? 1 : w.currentStep;
  const setCurrentStep = w.setCurrentStep;
  const f = useWizardFilters(w.clientes, w.servicos, w.clienteId, searchCliente, searchServico, categoriaAtiva);
  const t = useWizardTotals(w.servicos, w.servicosSelecionados, w.dataStr, w.horaInicioStr, horaReferencia, w.clienteId, currentStep);
  const { conflitos, loadingConflitos } = useWizardConflitos(w.dataStr, w.horaInicioStr, t.totalMinutos, initialData?.id);

  const executarSalvamento = async () => {
    setSubmitting(true);
    w.setError(null);
    try {
      const inicio = new Date(`${w.dataStr}T${w.horaInicioStr}:00`);
      const payload = {
        cliente: Number(w.clienteId),
        profissional: null,
        servicos: w.servicosSelecionados,
        data_hora_inicio: inicio.toISOString(),
        data_hora_fim: new Date(inicio.getTime() + (t.totalMinutos || 60) * 60000).toISOString(),
        status: mode === 'edit' ? w.status : 'agendado',
        valor_total: t.valorTotal,
        observacoes: w.observacoes,
      };
      const res = mode === 'edit' && initialData ? await api.updateAgendamento(initialData.id, payload) : await api.createAgendamento(payload);
      setCurrentStep(1);
      onSuccess(res);
    } catch (err: unknown) {
      w.setError(err instanceof Error ? err.message : 'Erro ao salvar agendamento.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubmit = async () => {
    if (!w.clienteId || w.servicosSelecionados.length === 0 || !w.dataStr || !w.horaInicioStr || t.isHorarioPassado) {
      w.setError('Por favor, verifique os campos obrigatórios e horários.');
      return;
    }
    await executarSalvamento();
  };

  if (w.loading) return <LoadingState message="Carregando opções para agendamento..." />;

  return (
    <div className={`w-full min-w-0 ${isModal ? 'space-y-4' : 'max-w-3xl mx-auto space-y-6'}`}>
      {isModal && <WizardModalHeader mode={mode} />}
      <WizardStepper currentStep={currentStep} clienteId={w.clienteId} hasServicos={w.servicosSelecionados.length > 0} onStepClick={setCurrentStep} isModal={isModal} />
      {w.error && <div className="p-3 sm:p-4 rounded-2xl bg-destructive/10 border border-destructive/20 text-destructive text-xs flex items-center gap-2"><X className="w-4 h-4 shrink-0" /><span>{w.error}</span></div>}
      <div className={`w-full min-w-0 ${isModal ? 'p-0' : 'bg-surface-container-lowest border border-outline-variant/60 rounded-[2.5rem] p-5 sm:p-8 shadow-sm'}`}>
        <WizardStepContent
          currentStep={currentStep} mode={mode} clienteSelecionada={f.clienteSelecionada} clientesFiltradas={f.clientesFiltradas}
          searchCliente={searchCliente} setSearchCliente={setSearchCliente} onSelectCliente={(id) => { w.setClienteId(id); setSearchCliente(''); }}
          onClearCliente={() => w.setClienteId('')} onClienteCriada={(c) => w.setClientes((prev) => [c, ...prev])}
          searchServico={searchServico} setSearchServico={setSearchServico} categoriasServicos={f.categoriasServicos} categoriaAtiva={categoriaAtiva}
          setCategoriaAtiva={setCategoriaAtiva} servicosFiltrados={f.servicosFiltrados} servicos={w.servicos} servicosSelecionados={w.servicosSelecionados}
          onToggleServico={(id) => w.setServicosSelecionados((prev) => prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id])}
          totalMinutos={t.totalMinutos} valorTotal={t.valorTotal} hojeStr={hojeStr} dataStr={w.dataStr} setDataStr={w.setDataStr} horaInicioStr={w.horaInicioStr}
          setHoraInicioStr={w.setHoraInicioStr} horaFimStr={t.horaFimStr} isHorarioPassado={t.isHorarioPassado} status={w.status} setStatus={w.setStatus}
          observacoes={w.observacoes} setObservacoes={w.setObservacoes} onGoToStep={setCurrentStep} conflitos={conflitos} loadingConflitos={loadingConflitos}
        />
        <WizardNavigation currentStep={currentStep} canAdvance={t.canAdvance} submitting={submitting} mode={mode} onPrev={() => setCurrentStep((p) => p - 1)} onNext={() => setCurrentStep((p) => p + 1)} onSubmit={handleSubmit} onCancel={() => { setCurrentStep(1); onCancel?.(); }} />
      </div>
    </div>
  );
}
