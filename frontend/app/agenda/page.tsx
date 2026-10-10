'use client';

import React, { useEffect, useState, useMemo } from 'react';
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
} from 'lucide-react';
import { api, Agendamento } from '@/lib/api';
import { LoadingState } from '@/components/atoms/LoadingState';
import { EmptyState } from '@/components/atoms/EmptyState';
import { NoSearchResultsState } from '@/components/atoms/NoSearchResultsState';
import { SearchBar } from '@/components/molecules/SearchBar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';

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

  const recarregarAgendamentos = async () => {
    try {
      const data = await api.getAgendamentos();
      const list = Array.isArray(data) ? data : data.results || [];
      setAgendamentos(list);
    } catch (err) {
      console.error('Erro ao recarregar agendamentos:', err);
    }
  };

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
      // Abre o WhatsApp direto em nova aba
      window.open(payloadWhatsapp.link_whatsapp, '_blank');
      // Confirma o agendamento no backend
      await api.confirmarWhatsapp(payloadWhatsapp.agendamento_id);
      setModalWhatsappOpen(false);
      await recarregarAgendamentos();
    } catch (err) {
      console.error('Erro ao confirmar WhatsApp:', err);
    } finally {
      setConfirmando(false);
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
            Acompanhe o fluxo de atendimento e confirme horários via link direto wa.me.
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
                className="p-5 sm:p-6 rounded-3xl bg-surface-container-lowest border border-outline-variant/60 shadow-sm hover:shadow-md hover:border-primary/40 transition-all flex flex-col md:flex-row md:items-center justify-between gap-5"
              >
                {/* Informações da Esquerda: Horário e Cliente */}
                <div className="flex items-start gap-4">
                  {/* Bloco de Horário */}
                  <div className="flex flex-col items-center justify-center w-20 py-2.5 px-2 rounded-2xl bg-surface-container-low border border-outline-variant/40 shrink-0 text-center">
                    <span className="text-[10px] uppercase font-bold text-primary tracking-wider">
                      {dataFormatada}
                    </span>
                    <span className="text-sm font-bold text-on-surface font-mono mt-0.5">
                      {dataInicio.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                    </span>
                    <span className="text-[10px] text-on-surface-variant font-mono">
                      até {dataFim.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>

                  {/* Cliente e Profissional */}
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="text-base font-bold text-on-surface font-heading">
                        {ag.cliente_detalhes?.nome || 'Cliente'}
                      </h3>
                      {getStatusBadge(ag.status)}
                    </div>

                    <p className="text-xs text-on-surface-variant flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full" style={{ backgroundColor: ag.profissional_detalhes?.cor_hex || '#7C3AED' }} />
                      <span>{ag.profissional_detalhes?.nome}</span>
                      <span className="text-on-surface-variant/60">•</span>
                      <span className="font-mono text-[11px]">{ag.profissional_detalhes?.cadeira}</span>
                    </p>

                    {/* Serviços */}
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {ag.servicos_detalhes?.map((serv) => (
                        <span
                          key={serv.id}
                          className="px-2.5 py-0.5 rounded-full text-[10px] bg-surface-container text-on-surface-variant font-medium"
                        >
                          {serv.nome}
                        </span>
                      ))}
                    </div>

                    {ag.observacoes && (
                      <p className="text-[11px] text-on-surface-variant italic pt-1">
                        Nota: {ag.observacoes}
                      </p>
                    )}
                  </div>
                </div>

                {/* Ações da Direita: Preço, WhatsApp e Comprovante */}
                <div className="flex flex-row md:flex-col items-center md:items-end justify-between md:justify-center gap-3 pt-3 md:pt-0 border-t md:border-t-0 border-outline-variant/40 shrink-0">
                  <div className="text-left md:text-right">
                    <p className="text-[10px] uppercase tracking-wider text-on-surface-variant font-semibold">
                      Total
                    </p>
                    <p className="text-lg font-bold text-primary font-heading">
                      R$ {Number(ag.valor_total).toFixed(2).replace('.', ',')}
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    {/* Botão Confirmação WhatsApp */}
                    {ag.status !== 'confirmado' && (
                      <Button
                        size="sm"
                        onClick={() => abrirModalWhatsapp(ag.id)}
                        className="rounded-full h-9 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-xs shadow-sm gap-1.5 cursor-pointer"
                      >
                        <MessageSquare className="w-3.5 h-3.5" />
                        <span>Confirmar WhatsApp</span>
                      </Button>
                    )}

                    {/* Botão Ver Comprovante */}
                    <Link
                      href={`/agenda/${ag.id}/comprovante`}
                      className="inline-flex items-center justify-center rounded-full h-9 px-3.5 text-xs border border-outline-variant hover:border-primary/50 text-on-surface cursor-pointer"
                    >
                      <Receipt className="w-3.5 h-3.5 mr-1 text-primary" />
                      <span>Comprovante</span>
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

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
