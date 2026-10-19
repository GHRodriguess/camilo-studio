'use client';

import React, { useEffect, useState, useMemo, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  CalendarDays,
  Plus,
  CheckCircle,
  MessageSquare,
  Sparkles,
  ExternalLink,
  Receipt,
  Clock,
  Edit2,
  Trash2,
} from 'lucide-react';
import { api, Agendamento, Cliente, Servico, Profissional } from '@/lib/api';
import { LoadingState } from '@/components/atoms/LoadingState';
import { EmptyState } from '@/components/atoms/EmptyState';
import { NoSearchResultsState } from '@/components/atoms/NoSearchResultsState';
import { SearchBar } from '@/components/molecules/SearchBar';
import { DeleteButton } from '@/components/atoms/DeleteButton';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
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

const STATUS_FILTERS = [
  { key: 'todos', label: 'Todos' },
  { key: 'agendado', label: 'Agendados' },
  { key: 'confirmado', label: 'Confirmados WhatsApp' },
  { key: 'em_atendimento', label: 'Em Atendimento' },
  { key: 'concluido', label: 'Finalizados' },
];

export default function AgendaPage() {
  const router = useRouter();
  const [agendamentos, setAgendamentos] = useState<Agendamento[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusAtivo, setStatusAtivo] = useState('todos');

  // Listas auxiliares para edição
  const [clientesList, setClientesList] = useState<Cliente[]>([]);
  const [servicosList, setServicosList] = useState<Servico[]>([]);
  const [equipeList, setEquipeList] = useState<Profissional[]>([]);

  // Modal WhatsApp
  const [modalWhatsappOpen, setModalWhatsappOpen] = useState(false);
  const [payloadWhatsapp, setPayloadWhatsapp] = useState<{
    agendamento_id: number;
    cliente: string;
    telefone: string;
    mensagem: string;
    link_whatsapp: string;
  } | null>(null);
  const [confirmando, setConfirmando] = useState(false);

  // Modal Edição
  const [modalEditOpen, setModalEditOpen] = useState(false);
  const [editingAgendamento, setEditingAgendamento] = useState<Agendamento | null>(null);
  const [editClienteId, setEditClienteId] = useState<number | ''>('');
  const [editProfissionalId, setEditProfissionalId] = useState<number | ''>('');
  const [editServicos, setEditServicos] = useState<number[]>([]);
  const [editData, setEditData] = useState('');
  const [editHoraInicio, setEditHoraInicio] = useState('10:00');
  const [editStatus, setEditStatus] = useState<Agendamento['status']>('agendado');
  const [editObservacoes, setEditObservacoes] = useState('');
  const [salvandoEdicao, setSalvandoEdicao] = useState(false);
  const [erroEdicao, setErroEdicao] = useState<string | null>(null);

  // Modal Exclusão
  const [modalDeleteOpen, setModalDeleteOpen] = useState(false);
  const [agendamentoParaExcluir, setAgendamentoParaExcluir] = useState<Agendamento | null>(null);
  const [excluindo, setExcluindo] = useState(false);

  const recarregarAgendamentos = async () => {
    try {
      const data = await api.getAgendamentos();
      const list = Array.isArray(data) ? data : data.results || [];
      setAgendamentos(list);
    } catch (err) {
      console.error('Erro ao carregar agendamentos:', err);
    }
  };

  useEffect(() => {
    let isMounted = true;
    api.getAgendamentos()
      .then((data) => {
        if (isMounted) {
          const list = Array.isArray(data) ? data : data.results || [];
          setAgendamentos(list);
          setLoading(false);
        }
      })
      .catch((err) => {
        if (isMounted) {
          console.error('Erro ao carregar agendamentos:', err);
          setLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const carregarDadosAuxiliares = useCallback(async () => {
    try {
      const [cData, sData, eData] = await Promise.all([
        api.getClientes(),
        api.getServicos(),
        api.getEquipe(),
      ]);
      setClientesList(Array.isArray(cData) ? cData : cData.results || []);
      setServicosList(Array.isArray(sData) ? sData : sData.results || []);
      setEquipeList(Array.isArray(eData) ? eData : eData.results || []);
    } catch (err) {
      console.error('Erro ao carregar listas auxiliares:', err);
    }
  }, []);

  const agendamentosFiltrados = useMemo(() => {
    return agendamentos.filter((ag) => {
      const matchStatus = statusAtivo === 'todos' || ag.status === statusAtivo;
      const clienteNome = ag.cliente_detalhes?.nome || '';
      const profissionalNome = ag.profissional_detalhes?.nome || '';
      const matchSearch =
        clienteNome.toLowerCase().includes(search.toLowerCase()) ||
        profissionalNome.toLowerCase().includes(search.toLowerCase());
      return matchStatus && matchSearch;
    });
  }, [agendamentos, statusAtivo, search]);

  const totalMinutosEdit = useMemo(() => {
    return servicosList
      .filter((s) => editServicos.includes(s.id))
      .reduce((acc, s) => acc + s.duracao_minutos, 0);
  }, [servicosList, editServicos]);

  const valorTotalEdit = useMemo(() => {
    return servicosList
      .filter((s) => editServicos.includes(s.id))
      .reduce((acc, s) => acc + Number(s.preco), 0);
  }, [servicosList, editServicos]);

  const horaFimEdit = useMemo(() => {
    if (!editHoraInicio) return '';
    const [h, m] = editHoraInicio.split(':').map(Number);
    const duracao = totalMinutosEdit || 60;
    const totalM = (h * 60 + m + duracao) % (24 * 60);
    const endH = Math.floor(totalM / 60);
    const endM = totalM % 60;
    return `${String(endH).padStart(2, '0')}:${String(endM).padStart(2, '0')}`;
  }, [editHoraInicio, totalMinutosEdit]);

  const toggleServicoEdit = (id: number) => {
    setEditServicos((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const abrirModalWhatsapp = async (agendamentoId: number) => {
    try {
      const data = await api.gerarLinkWhatsapp(agendamentoId);
      setPayloadWhatsapp(data);
      setModalWhatsappOpen(true);
    } catch (err) {
      console.error('Erro ao gerar mensagem WhatsApp:', err);
    }
  };

  const handleDispararWhatsapp = async () => {
    if (!payloadWhatsapp) return;
    setConfirmando(true);
    try {
      window.open(payloadWhatsapp.link_whatsapp, '_blank');
      await api.confirmarWhatsapp(payloadWhatsapp.agendamento_id);
      setModalWhatsappOpen(false);
      await recarregarAgendamentos();
    } catch (err) {
      console.error('Erro ao confirmar WhatsApp:', err);
    } finally {
      setConfirmando(false);
    }
  };

  const abrirModalEditar = async (ag: Agendamento) => {
    if (clientesList.length === 0 || servicosList.length === 0) {
      await carregarDadosAuxiliares();
    }

    const d = new Date(ag.data_hora_inicio);
    const ano = d.getFullYear();
    const mes = String(d.getMonth() + 1).padStart(2, '0');
    const dia = String(d.getDate()).padStart(2, '0');
    const hora = String(d.getHours()).padStart(2, '0');
    const min = String(d.getMinutes()).padStart(2, '0');

    setEditingAgendamento(ag);
    setEditClienteId(ag.cliente);
    setEditProfissionalId(ag.profissional ?? '');
    setEditServicos(ag.servicos || []);
    setEditData(`${ano}-${mes}-${dia}`);
    setEditHoraInicio(`${hora}:${min}`);
    setEditStatus(ag.status);
    setEditObservacoes(ag.observacoes || '');
    setErroEdicao(null);
    setModalEditOpen(true);
  };

  const handleSalvarEdicao = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingAgendamento) return;
    if (!editClienteId) {
      setErroEdicao('Selecione uma cliente.');
      return;
    }
    if (editServicos.length === 0) {
      setErroEdicao('Selecione pelo menos um serviço.');
      return;
    }

    setSalvandoEdicao(true);
    setErroEdicao(null);

    try {
      const inicioDate = new Date(`${editData}T${editHoraInicio}:00`);
      const duracao = totalMinutosEdit || 60;
      const fimDate = new Date(inicioDate.getTime() + duracao * 60000);

      await api.updateAgendamento(editingAgendamento.id, {
        cliente: Number(editClienteId),
        profissional: editProfissionalId ? Number(editProfissionalId) : null,
        servicos: editServicos,
        data_hora_inicio: inicioDate.toISOString(),
        data_hora_fim: fimDate.toISOString(),
        status: editStatus,
        valor_total: valorTotalEdit,
        observacoes: editObservacoes,
      });

      setModalEditOpen(false);
      await recarregarAgendamentos();
    } catch (err: unknown) {
      if (err instanceof Error) {
        setErroEdicao(err.message);
      } else {
        setErroEdicao('Erro ao atualizar agendamento.');
      }
    } finally {
      setSalvandoEdicao(false);
    }
  };

  const abrirModalExcluir = (ag: Agendamento) => {
    setAgendamentoParaExcluir(ag);
    setModalDeleteOpen(true);
  };

  const handleConfirmarExclusao = async () => {
    if (!agendamentoParaExcluir) return;
    setExcluindo(true);
    try {
      await api.deleteAgendamento(agendamentoParaExcluir.id);
      setModalDeleteOpen(false);
      setAgendamentoParaExcluir(null);
      await recarregarAgendamentos();
    } catch (err) {
      console.error('Erro ao excluir agendamento:', err);
    } finally {
      setExcluindo(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'confirmado':
        return (
          <Badge className="bg-emerald-100 text-emerald-800 border-emerald-300 text-[11px] gap-1 font-semibold rounded-full">
            <CheckCircle className="w-3 h-3 text-emerald-600" />
            Confirmado WhatsApp
          </Badge>
        );
      case 'em_atendimento':
        return (
          <Badge className="bg-purple-100 text-primary border-purple-300 text-[11px] gap-1 font-semibold rounded-full animate-pulse">
            <Sparkles className="w-3 h-3 text-primary" />
            Em Atendimento
          </Badge>
        );
      case 'concluido':
        return (
          <Badge className="bg-zinc-100 text-zinc-700 border-zinc-300 text-[11px] rounded-full">
            Finalizado
          </Badge>
        );
      case 'cancelado':
        return (
          <Badge className="bg-red-100 text-red-700 border-red-300 text-[11px] rounded-full">
            Cancelado
          </Badge>
        );
      default:
        return (
          <Badge className="bg-amber-100 text-amber-800 border-amber-300 text-[11px] rounded-full">
            Agendado (Pendente)
          </Badge>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* CABEÇALHO */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs uppercase tracking-[0.2em] font-semibold text-primary">
            Orquestração de Horários
          </span>
          <h1 className="text-2xl sm:text-3xl font-bold text-on-surface font-heading tracking-tight mt-0.5">
            Agenda & Confirmações WhatsApp
          </h1>
          <p className="text-xs sm:text-sm text-on-surface-variant">
            Acompanhe o fluxo de atendimento, altere horários e confirme presenças via wa.me.
          </p>
        </div>

        {/* ÚNICO BOTÃO PRIMÁRIO */}
        <Link
          href="/agenda/novo"
          className="inline-flex items-center justify-center rounded-full h-11 px-6 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold shadow-md shadow-primary/20 shrink-0 cursor-pointer text-sm"
        >
          <Plus className="w-4 h-4 mr-1.5" />
          Novo Agendamento
        </Link>
      </div>

      {/* FILTROS & BUSCA */}
      <div className="space-y-3.5">
        <SearchBar
          value={search}
          onChange={setSearch}
          placeholder="Buscar agendamento por cliente ou profissional..."
        />

        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          {STATUS_FILTERS.map((f) => {
            const isSelected = statusAtivo === f.key;
            return (
              <button
                key={f.key}
                type="button"
                onClick={() => setStatusAtivo(f.key)}
                className={`px-4 py-2 rounded-full text-xs font-medium whitespace-nowrap transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-primary text-primary-foreground shadow-sm shadow-primary/20'
                    : 'bg-surface-container hover:bg-surface-container-high text-on-surface-variant'
                }`}
              >
                {f.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* LISTAGEM DE AGENDAMENTOS */}
      {loading ? (
        <LoadingState message="Carregando atendimentos da agenda..." />
      ) : agendamentos.length === 0 ? (
        <EmptyState
          icon={CalendarDays}
          title="Nenhum agendamento encontrado"
          description="A grade de horários está livre. Comece marcando um novo atendimento."
          actionLabel="Marcar Primeiro Atendimento"
          onAction={() => router.push('/agenda/novo')}
        />
      ) : agendamentosFiltrados.length === 0 ? (
        <NoSearchResultsState
          searchTerm={search}
          onClear={() => {
            setSearch('');
            setStatusAtivo('todos');
          }}
        />
      ) : (
        <div className="space-y-4">
          {agendamentosFiltrados.map((ag) => {
            const dataInicio = new Date(ag.data_hora_inicio);
            const dataFim = new Date(ag.data_hora_fim);
            const dataFormatada = dataInicio.toLocaleDateString('pt-BR', { weekday: 'short', day: '2-digit', month: 'short' });

            return (
              <div
                key={ag.id}
                className="p-5 sm:p-6 rounded-3xl bg-surface-container-lowest border border-outline-variant/60 shadow-sm hover:shadow-md hover:border-primary/40 transition-all flex flex-col gap-4"
              >
                {/* Linha Superior: Data, Horário e Status */}
                <div className="flex flex-wrap items-center justify-between gap-2.5 pb-3 border-b border-outline-variant/40">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-surface-container text-xs font-semibold text-primary uppercase tracking-wider">
                      <CalendarDays className="w-3.5 h-3.5 text-primary shrink-0" />
                      <span>{dataFormatada}</span>
                    </span>
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-surface-container-low border border-outline-variant/40 text-xs font-mono font-medium text-on-surface">
                      <Clock className="w-3.5 h-3.5 text-on-surface-variant shrink-0" />
                      <span>
                        {dataInicio.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })} às {dataFim.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </span>
                  </div>

                  {getStatusBadge(ag.status)}
                </div>

                {/* Linha Principal: Informações do Atendimento e Ações */}
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  {/* Informações da Cliente e Procedimentos */}
                  <div className="space-y-1.5 min-w-0 flex-1">
                    <Link
                      href={`/clientes/${ag.cliente}`}
                      className="text-base sm:text-lg font-bold text-on-surface font-heading truncate hover:text-primary transition-colors block"
                    >
                      {ag.cliente_detalhes?.nome || 'Cliente'}
                    </Link>

                    <p className="text-xs text-on-surface-variant flex items-center gap-1.5">
                      <span
                        className="w-2 h-2 rounded-full shrink-0"
                        style={{ backgroundColor: ag.profissional_detalhes?.cor_hex || '#7C3AED' }}
                      />
                      <span className="font-medium text-on-surface">
                        {ag.profissional_detalhes?.nome || 'Equipe Camilo Studio'}
                      </span>
                    </p>

                    {/* Serviços */}
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {ag.servicos_detalhes?.map((serv) => (
                        <span
                          key={serv.id}
                          className="px-2.5 py-0.5 rounded-full text-[11px] bg-surface-container text-on-surface-variant font-medium"
                        >
                          {serv.nome}
                        </span>
                      ))}
                    </div>

                    {ag.observacoes && (
                      <p className="text-xs text-on-surface-variant italic pt-0.5">
                        Nota: {ag.observacoes}
                      </p>
                    )}
                  </div>

                  {/* Preço e Botões de Ação */}
                  <div className="flex flex-col sm:flex-row lg:flex-col items-start sm:items-center lg:items-end justify-between gap-3 pt-3 lg:pt-0 border-t lg:border-t-0 border-outline-variant/40 shrink-0">
                    <div className="text-left lg:text-right">
                      <p className="text-[10px] uppercase tracking-wider text-on-surface-variant font-semibold">
                        Total
                      </p>
                      <p className="text-lg sm:text-xl font-bold text-primary font-heading">
                        R$ {Number(ag.valor_total).toFixed(2).replace('.', ',')}
                      </p>
                    </div>

                    <div className="flex flex-wrap sm:flex-nowrap items-center gap-2 w-full sm:w-auto">
                      {/* Botão Confirmação WhatsApp */}
                      {ag.status !== 'confirmado' && (
                        <Button
                          size="sm"
                          onClick={() => abrirModalWhatsapp(ag.id)}
                          className="flex-1 sm:flex-initial rounded-full h-9 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-xs shadow-sm gap-1.5 cursor-pointer whitespace-nowrap"
                        >
                          <MessageSquare className="w-3.5 h-3.5" />
                          <span>WhatsApp</span>
                        </Button>
                      )}

                      {/* Botão Ver Comprovante */}
                      <Link
                        href={`/agenda/${ag.id}/comprovante`}
                        className="inline-flex items-center justify-center rounded-full h-9 px-3 text-xs border border-outline-variant hover:border-primary/50 text-on-surface cursor-pointer whitespace-nowrap"
                        title="Ver Comprovante"
                      >
                        <Receipt className="w-3.5 h-3.5 text-primary" />
                        <span className="sr-only">Comprovante</span>
                      </Link>

                      {/* Botão Editar Agendamento */}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => abrirModalEditar(ag)}
                        className="rounded-full h-9 px-3 text-xs border border-outline-variant hover:border-primary/50 text-on-surface cursor-pointer whitespace-nowrap gap-1"
                        title="Editar Agendamento"
                      >
                        <Edit2 className="w-3.5 h-3.5 text-primary" />
                        <span>Editar</span>
                      </Button>

                      {/* Botão Excluir Agendamento */}
                      <DeleteButton
                        onDelete={() => abrirModalExcluir(ag)}
                        title="Excluir agendamento"
                      />
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* MODAL DE EDIÇÃO DE AGENDAMENTO */}
      <Dialog open={modalEditOpen} onOpenChange={setModalEditOpen}>
        <DialogContent className="sm:max-w-xl max-h-[90vh] overflow-y-auto rounded-3xl p-6 bg-surface-container-lowest border-outline-variant">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-on-surface font-heading flex items-center gap-2">
              <Edit2 className="w-5 h-5 text-primary" />
              Editar Agendamento
            </DialogTitle>
            <DialogDescription className="text-xs text-on-surface-variant">
              Atualize cliente, serviços, horários ou status do atendimento.
            </DialogDescription>
          </DialogHeader>

          {erroEdicao && (
            <div className="p-3.5 rounded-2xl bg-destructive/10 border border-destructive/20 text-destructive text-xs">
              {erroEdicao}
            </div>
          )}

          <form onSubmit={handleSalvarEdicao} className="space-y-4 pt-2">
            {/* Seleção de Cliente */}
            <div className="space-y-1.5">
              <Label className="text-xs font-medium text-on-surface-variant">Cliente</Label>
              <Select
                value={editClienteId ? String(editClienteId) : ''}
                onValueChange={(val) => setEditClienteId(Number(val))}
              >
                <SelectTrigger className="rounded-full h-11 text-xs">
                  <SelectValue placeholder="Selecione a cliente..." />
                </SelectTrigger>
                <SelectContent className="max-h-56">
                  {clientesList.map((cli) => (
                    <SelectItem key={cli.id} value={String(cli.id)} className="text-xs">
                      {cli.nome} ({cli.telefone})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Seleção de Profissional */}
            <div className="space-y-1.5">
              <Label className="text-xs font-medium text-on-surface-variant">
                Profissional Responsável
              </Label>
              <Select
                value={editProfissionalId ? String(editProfissionalId) : 'equipe'}
                onValueChange={(val) => setEditProfissionalId(val === 'equipe' ? '' : Number(val))}
              >
                <SelectTrigger className="rounded-full h-11 text-xs">
                  <SelectValue placeholder="Equipe Camilo Studio" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="equipe" className="text-xs">
                    Equipe Camilo Studio (Atendimento Conjunto)
                  </SelectItem>
                  {equipeList.map((prof) => (
                    <SelectItem key={prof.id} value={String(prof.id)} className="text-xs">
                      {prof.nome} — {prof.cargo}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Serviços Contratados */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label className="text-xs font-medium text-on-surface-variant">
                  Serviços Selecionados ({editServicos.length})
                </Label>
                <span className="text-[11px] text-primary font-semibold">
                  {totalMinutosEdit} min • R$ {valorTotalEdit.toFixed(2).replace('.', ',')}
                </span>
              </div>
              <div className="max-h-40 overflow-y-auto p-2 rounded-2xl bg-surface-container-low border border-outline-variant/40 space-y-1.5 scrollbar-thin">
                {servicosList.map((s) => {
                  const isChecked = editServicos.includes(s.id);
                  return (
                    <label
                      key={s.id}
                      className={`flex items-center justify-between p-2 rounded-xl text-xs cursor-pointer transition-all ${
                        isChecked
                          ? 'bg-primary/10 border border-primary/30 text-primary font-medium'
                          : 'hover:bg-surface-container text-on-surface'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => toggleServicoEdit(s.id)}
                          className="rounded text-primary focus:ring-primary h-4 w-4"
                        />
                        <span>{s.nome}</span>
                      </div>
                      <span className="text-on-surface-variant text-[11px] font-mono">
                        {s.duracao_minutos}min • R$ {Number(s.preco).toFixed(2).replace('.', ',')}
                      </span>
                    </label>
                  );
                })}
              </div>
            </div>

            {/* Data e Horário */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-on-surface-variant">Data do Atendimento</Label>
                <Input
                  type="date"
                  required
                  value={editData}
                  onChange={(e) => setEditData(e.target.value)}
                  className="rounded-full h-11 text-xs"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-on-surface-variant">
                  Início ({horaFimEdit ? `Término previsto: ${horaFimEdit}` : ''})
                </Label>
                <Input
                  type="time"
                  required
                  value={editHoraInicio}
                  onChange={(e) => setEditHoraInicio(e.target.value)}
                  className="rounded-full h-11 text-xs font-mono"
                />
              </div>
            </div>

            {/* Status do Atendimento */}
            <div className="space-y-1.5">
              <Label className="text-xs font-medium text-on-surface-variant">Status</Label>
              <Select
                value={editStatus}
                onValueChange={(val) => setEditStatus(val as Agendamento['status'])}
              >
                <SelectTrigger className="rounded-full h-11 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="agendado" className="text-xs">Agendado (Pendente)</SelectItem>
                  <SelectItem value="confirmado" className="text-xs">Confirmado WhatsApp</SelectItem>
                  <SelectItem value="em_atendimento" className="text-xs">Em Atendimento</SelectItem>
                  <SelectItem value="concluido" className="text-xs">Finalizado</SelectItem>
                  <SelectItem value="cancelado" className="text-xs">Cancelado</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Observações */}
            <div className="space-y-1.5">
              <Label className="text-xs font-medium text-on-surface-variant">Observações / Notas</Label>
              <Textarea
                value={editObservacoes}
                onChange={(e) => setEditObservacoes(e.target.value)}
                placeholder="Preferências de bancada, recomendações especiais..."
                className="rounded-2xl text-xs resize-none"
                rows={2}
              />
            </div>

            {/* Ações do Modal */}
            <div className="pt-3 flex items-center justify-end gap-2.5">
              <Button
                type="button"
                variant="outline"
                onClick={() => setModalEditOpen(false)}
                className="rounded-full text-xs h-10 px-5"
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={salvandoEdicao}
                className="rounded-full text-xs h-10 px-6 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold shadow-md shadow-primary/20 cursor-pointer"
              >
                {salvandoEdicao ? 'Salvando...' : 'Salvar Alterações'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* DIÁLOGO DE CONFIRMAÇÃO DE EXCLUSÃO DE AGENDAMENTO */}
      <Dialog open={modalDeleteOpen} onOpenChange={setModalDeleteOpen}>
        <DialogContent className="sm:max-w-md rounded-3xl p-6 bg-surface-container-lowest border-outline-variant">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-on-surface font-heading flex items-center gap-2 text-destructive">
              <Trash2 className="w-5 h-5" />
              Excluir Agendamento
            </DialogTitle>
            <DialogDescription className="text-xs text-on-surface-variant">
              Tem certeza que deseja remover este agendamento? Esta ação não pode ser desfeita.
            </DialogDescription>
          </DialogHeader>

          {agendamentoParaExcluir && (
            <div className="p-4 rounded-2xl bg-surface-container-low border border-outline-variant/40 space-y-1 text-xs">
              <p className="font-semibold text-on-surface">
                Cliente: {agendamentoParaExcluir.cliente_detalhes?.nome || 'Cliente'}
              </p>
              <p className="text-on-surface-variant">
                Horário: {new Date(agendamentoParaExcluir.data_hora_inicio).toLocaleString('pt-BR')}
              </p>
              <p className="text-on-surface-variant">
                Valor: R$ {Number(agendamentoParaExcluir.valor_total).toFixed(2).replace('.', ',')}
              </p>
            </div>
          )}

          <div className="pt-3 flex items-center justify-end gap-2.5">
            <Button
              type="button"
              variant="outline"
              onClick={() => setModalDeleteOpen(false)}
              className="rounded-full text-xs h-10 px-5"
            >
              Cancelar
            </Button>
            <Button
              type="button"
              disabled={excluindo}
              onClick={handleConfirmarExclusao}
              className="rounded-full text-xs h-10 px-5 bg-destructive hover:bg-destructive/90 text-white font-semibold cursor-pointer"
            >
              {excluindo ? 'Excluindo...' : 'Confirmar Exclusão'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* MODAL DE CONFIRMAÇÃO WHATSAPP */}
      <Dialog open={modalWhatsappOpen} onOpenChange={setModalWhatsappOpen}>
        <DialogContent className="sm:max-w-lg rounded-3xl p-6 bg-surface-container-lowest border-outline-variant">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-on-surface font-heading flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-emerald-600" />
              Enviar Confirmação WhatsApp
            </DialogTitle>
            <DialogDescription className="text-xs text-on-surface-variant">
              Mensagem personalizada pronta para disparo no WhatsApp da cliente.
            </DialogDescription>
          </DialogHeader>

          {payloadWhatsapp && (
            <div className="space-y-4 pt-2">
              <div className="p-3.5 rounded-2xl bg-surface-container-low text-xs space-y-1 border border-outline-variant/30">
                <p className="text-on-surface font-semibold">Cliente: {payloadWhatsapp.cliente}</p>
                <p className="text-on-surface-variant font-mono">Telefone: {payloadWhatsapp.telefone}</p>
              </div>

              <div className="space-y-1.5">
                <span className="text-[11px] font-semibold text-on-surface-variant uppercase tracking-wider">
                  Pré-visualização da Mensagem
                </span>
                <div className="p-4 rounded-2xl bg-emerald-50/50 border border-emerald-200 text-xs text-zinc-800 whitespace-pre-line font-sans leading-relaxed shadow-inner">
                  {payloadWhatsapp.mensagem}
                </div>
              </div>

              <div className="pt-3 flex justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setModalWhatsappOpen(false)}
                  className="rounded-full text-xs h-10 px-5"
                >
                  Fechar
                </Button>
                <Button
                  onClick={handleDispararWhatsapp}
                  disabled={confirmando}
                  className="rounded-full text-xs h-10 px-6 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold shadow-md shadow-emerald-600/25 gap-1.5 cursor-pointer"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>{confirmando ? 'Abrindo...' : 'Abrir WhatsApp & Confirmar'}</span>
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
