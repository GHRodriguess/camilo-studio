import { useState, useEffect, useMemo } from 'react';
import { api, Cliente, Servico, Agendamento } from '@/lib/api';

export function useWizardFilters(
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

export function useWizardTotals(
  servicos: Servico[],
  servicosSelecionados: number[],
  dataStr: string,
  horaInicioStr: string,
  horaReferencia: number,
  clienteId: number | '',
  currentStep: number,
  bloqueadoPorConflito = false
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
    if (currentStep === 3) return !!dataStr && !!horaInicioStr && !isHorarioPassado && !bloqueadoPorConflito;
    return true;
  }, [currentStep, clienteId, servicosSelecionados, dataStr, horaInicioStr, isHorarioPassado, bloqueadoPorConflito]);

  return { totalMinutos, valorTotal, horaFimStr, isHorarioPassado, canAdvance };
}

export function useWizardConflitos(
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

export function useWizardClienteConflitos(
  clienteId: number | '',
  dataStr: string,
  conflitos: Agendamento[],
  initialId?: number
) {
  const [agendamentosDia, setAgendamentosDia] = useState<Agendamento[]>([]);

  useEffect(() => {
    let ativo = true;
    if (!clienteId || !dataStr) {
      return () => {
        ativo = false;
      };
    }
    api.getAgendamentosClienteNoDia(Number(clienteId), dataStr, initialId)
      .then((res) => { if (ativo) setAgendamentosDia(Array.isArray(res) ? res : []); })
      .catch(() => { if (ativo) setAgendamentosDia([]); });
    return () => { ativo = false; };
  }, [clienteId, dataStr, initialId]);

  const agendamentosValidos = useMemo(() => {
    return (!clienteId || !dataStr) ? [] : agendamentosDia;
  }, [clienteId, dataStr, agendamentosDia]);

  const conflitoSobreposicao = useMemo(() => {
    if (!clienteId) return null;
    return conflitos.find((c) => c.cliente === Number(clienteId) || c.cliente_detalhes?.id === Number(clienteId)) || null;
  }, [clienteId, conflitos]);

  const conflitoMesmoDia = useMemo(() => {
    if (!clienteId || conflitoSobreposicao) return null;
    return agendamentosValidos.find((c) => c.id !== initialId) || null;
  }, [clienteId, conflitoSobreposicao, agendamentosValidos, initialId]);

  return { conflitoSobreposicao, conflitoMesmoDia };
}
