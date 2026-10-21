'use client';

import React, { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { CalendarDays, Plus } from 'lucide-react';
import { api, Agendamento } from '@/lib/api';
import { LoadingState } from '@/components/atoms/LoadingState';
import { EmptyState } from '@/components/atoms/EmptyState';
import { NoSearchResultsState } from '@/components/atoms/NoSearchResultsState';
import { SearchBar } from '@/components/molecules/SearchBar';
import { AgendamentoCard } from '@/components/organisms/AgendamentoCard';
import { AgendaModals, WhatsappPayload } from '@/components/organisms/AgendaModals';

const STATUS_FILTERS = [
  { key: 'todos', label: 'Todos' },
  { key: 'agendado', label: 'Agendados' },
  { key: 'confirmado', label: 'Confirmados WhatsApp' },
  { key: 'em_atendimento', label: 'Em Atendimento' },
  { key: 'concluido', label: 'Finalizados' },
  { key: 'nao_compareceu', label: 'Não Compareceu' },
];

function AgendaHeader() {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        <span className="text-xs uppercase tracking-[0.2em] font-semibold text-primary">Orquestração de Horários</span>
        <h1 className="text-2xl sm:text-3xl font-bold text-on-surface font-heading tracking-tight mt-0.5">Agenda & Confirmações WhatsApp</h1>
        <p className="text-xs sm:text-sm text-on-surface-variant">Acompanhe o fluxo de atendimento, altere horários e confirme presenças via wa.me.</p>
      </div>
      <Link href="/agenda/novo" className="inline-flex items-center justify-center rounded-full h-11 px-6 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold shadow-md shadow-primary/20 shrink-0 cursor-pointer text-sm">
        <Plus className="w-4 h-4 mr-1.5" />
        Novo Agendamento
      </Link>
    </div>
  );
}

function StatusFilterChips({ ativo, onSelect }: { ativo: string; onSelect: (k: string) => void }) {
  return (
    <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
      {STATUS_FILTERS.map((f) => (
        <button
          key={f.key}
          type="button"
          onClick={() => onSelect(f.key)}
          className={`px-4 py-2 rounded-full text-xs font-medium whitespace-nowrap transition-all cursor-pointer ${
            ativo === f.key ? 'bg-primary text-primary-foreground shadow-sm shadow-primary/20' : 'bg-surface-container hover:bg-surface-container-high text-on-surface-variant'
          }`}
        >
          {f.label}
        </button>
      ))}
    </div>
  );
}

interface ListProps {
  loading: boolean;
  total: number;
  filtrados: Agendamento[];
  search: string;
  onClear: () => void;
  onNovo: () => void;
  onIniciar: (id: number) => void;
  onConcluir: (id: number) => void;
  onNaoCompareceu: (id: number) => void;
  onWhatsapp: (id: number) => void;
  onEditar: (ag: Agendamento) => void;
  onExcluir: (ag: Agendamento) => void;
}

function AgendaList(props: ListProps) {
  const { loading, total, filtrados, search, onClear, onNovo, onIniciar, onConcluir, onNaoCompareceu, onWhatsapp, onEditar, onExcluir } = props;
  if (loading) return <LoadingState message="Carregando atendimentos da agenda..." />;
  if (total === 0) {
    return (
      <EmptyState
        icon={CalendarDays}
        title="Nenhum agendamento encontrado"
        description="A grade de horários está livre. Comece marcando um novo atendimento."
        actionLabel="Marcar Primeiro Atendimento"
        onAction={onNovo}
      />
    );
  }
  if (filtrados.length === 0) {
    return <NoSearchResultsState searchTerm={search} onClear={onClear} />;
  }
  return (
    <div className="space-y-4">
      {filtrados.map((ag) => (
        <AgendamentoCard
          key={ag.id}
          ag={ag}
          onIniciar={onIniciar}
          onConcluir={onConcluir}
          onNaoCompareceu={onNaoCompareceu}
          onWhatsapp={onWhatsapp}
          onEditar={onEditar}
          onExcluir={onExcluir}
        />
      ))}
    </div>
  );
}

export default function AgendaPage() {
  const router = useRouter();
  const [agendamentos, setAgendamentos] = useState<Agendamento[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusAtivo, setStatusAtivo] = useState('todos');
  const [modalWhatsappOpen, setModalWhatsappOpen] = useState(false);
  const [payloadWhatsapp, setPayloadWhatsapp] = useState<WhatsappPayload | null>(null);
  const [modalEditOpen, setModalEditOpen] = useState(false);
  const [editingAgendamento, setEditingAgendamento] = useState<Agendamento | null>(null);
  const [modalDeleteOpen, setModalDeleteOpen] = useState(false);
  const [agendamentoParaExcluir, setAgendamentoParaExcluir] = useState<Agendamento | null>(null);

  const recarregar = async () => {
    try {
      const data = await api.getAgendamentos();
      setAgendamentos(Array.isArray(data) ? data : data.results || []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    recarregar();
    const timer = setInterval(recarregar, 60000);
    return () => clearInterval(timer);
  }, []);

  const agendamentosFiltrados = useMemo(() => {
    return agendamentos.filter((ag) => {
      const matchStatus = statusAtivo === 'todos' || ag.status === statusAtivo;
      const clienteNome = ag.cliente_detalhes?.nome || '';
      const matchSearch = clienteNome.toLowerCase().includes(search.toLowerCase()) || (ag.observacoes && ag.observacoes.toLowerCase().includes(search.toLowerCase()));
      return matchStatus && matchSearch;
    });
  }, [agendamentos, statusAtivo, search]);

  return (
    <div className="space-y-6">
      <AgendaHeader />
      <div className="space-y-3.5">
        <SearchBar value={search} onChange={setSearch} placeholder="Buscar agendamento por cliente ou observações..." />
        <StatusFilterChips ativo={statusAtivo} onSelect={setStatusAtivo} />
      </div>

      <AgendaList
        loading={loading}
        total={agendamentos.length}
        filtrados={agendamentosFiltrados}
        search={search}
        onClear={() => { setSearch(''); setStatusAtivo('todos'); }}
        onNovo={() => router.push('/agenda/novo')}
        onIniciar={async (id) => { await api.iniciarAgendamento(id); await recarregar(); }}
        onConcluir={async (id) => { await api.concluirAgendamento(id); await recarregar(); }}
        onNaoCompareceu={async (id) => { await api.marcarNaoCompareceuAgendamento(id); await recarregar(); }}
        onWhatsapp={async (id) => {
          const data = await api.gerarLinkWhatsapp(id);
          setPayloadWhatsapp(data);
          setModalWhatsappOpen(true);
        }}
        onEditar={(item) => { setEditingAgendamento(item); setModalEditOpen(true); }}
        onExcluir={(item) => { setAgendamentoParaExcluir(item); setModalDeleteOpen(true); }}
      />

      <AgendaModals
        editOpen={modalEditOpen}
        onEditOpenChange={(open) => {
          setModalEditOpen(open);
          if (!open) setEditingAgendamento(null);
        }}
        editingAgendamento={editingAgendamento}
        deleteOpen={modalDeleteOpen}
        onDeleteOpenChange={setModalDeleteOpen}
        agendamentoParaExcluir={agendamentoParaExcluir}
        whatsappOpen={modalWhatsappOpen}
        onWhatsappOpenChange={setModalWhatsappOpen}
        payloadWhatsapp={payloadWhatsapp}
        onReload={recarregar}
      />
    </div>
  );
}
