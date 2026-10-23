'use client';

import React, { useEffect, useState } from 'react';
import {
  Sparkles,
  Plus,
  ShieldAlert,
  CheckCircle2,
  Info,
} from 'lucide-react';
import { api, Profissional } from '@/lib/api';
import { LoadingState } from '@/components/atoms/LoadingState';
import { EmptyState } from '@/components/atoms/EmptyState';
import { SearchBar } from '@/components/molecules/SearchBar';
import { NoSearchResultsState } from '@/components/atoms/NoSearchResultsState';
import { Button } from '@/components/ui/button';
import { ProfissionalCard } from '@/components/organisms/ProfissionalCard';
import {
  ModalNovoProfissional,
  ModalEditarProfissional,
} from '@/components/organisms/ProfissionalFormDialogs';
import {
  ModalDeleteProfissional,
  ModalCriarAcesso,
  ModalResetarSenha,
} from '@/components/organisms/ProfissionalAccessDialogs';

function EquipeHeader({ onNovo }: { onNovo: () => void }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        <span className="text-xs uppercase tracking-[0.2em] font-semibold text-primary">Corpo de Especialistas</span>
        <h1 className="text-2xl sm:text-3xl font-bold text-on-surface font-heading tracking-tight mt-0.5">Equipe do Ateliê</h1>
        <p className="text-xs sm:text-sm text-on-surface-variant">Gerencie profissionais do ateliê, cores de identificação e credenciais de acesso ao sistema.</p>
      </div>
      <Button onClick={onNovo} className="rounded-full h-11 px-6 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold shadow-md shadow-primary/20 shrink-0 cursor-pointer">
        <Plus className="w-4 h-4 mr-1.5" /> Novo Profissional
      </Button>
    </div>
  );
}

function FeedbackAlert({
  msg,
  onClose,
}: {
  msg: { tipo: 'sucesso' | 'info' | 'erro'; texto: string };
  onClose: () => void;
}) {
  const isErro = msg.tipo === 'erro';
  const isInfo = msg.tipo === 'info';
  return (
    <div className={`p-3.5 rounded-2xl border text-xs flex items-center justify-between gap-3 animate-in fade-in duration-200 ${
      isErro ? 'bg-destructive/10 border-destructive/20 text-destructive' : isInfo ? 'bg-amber-500/10 border-amber-500/20 text-amber-800' : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-800'
    }`}>
      <div className="flex items-center gap-2">
        {isErro ? <ShieldAlert className="w-4 h-4 shrink-0" /> : isInfo ? <Info className="w-4 h-4 shrink-0" /> : <CheckCircle2 className="w-4 h-4 shrink-0" />}
        <span>{msg.texto}</span>
      </div>
      <button type="button" onClick={onClose} className="text-xs font-semibold hover:opacity-75 cursor-pointer px-1">✕</button>
    </div>
  );
}

interface GridProps {
  loading: boolean;
  total: number;
  filtrados: Profissional[];
  search: string;
  loadingAcaoId: number | null;
  onNovo: () => void;
  onClearSearch: () => void;
  onEditar: (p: Profissional) => void;
  onExcluir: (p: Profissional) => void;
  onResetar: (p: Profissional) => void;
  onToggleAtivo: (p: Profissional) => void;
  onCriarAcesso: (p: Profissional) => void;
}

function EquipeGrid(props: GridProps) {
  if (props.loading) return <LoadingState message="Carregando profissionais da equipe..." />;
  if (props.total === 0) {
    return <EmptyState icon={Sparkles} title="Nenhum profissional cadastrado" description="Cadastre os especialistas do ateliê." actionLabel="Cadastrar Membro" onAction={props.onNovo} />;
  }
  if (props.filtrados.length === 0) {
    return <NoSearchResultsState searchTerm={props.search} onClear={props.onClearSearch} />;
  }
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
      {props.filtrados.map((prof) => (
        <ProfissionalCard
          key={prof.id}
          prof={prof}
          loadingAcaoId={props.loadingAcaoId}
          onEditar={props.onEditar}
          onExcluir={props.onExcluir}
          onResetar={props.onResetar}
          onToggleAtivo={props.onToggleAtivo}
          onCriarAcesso={props.onCriarAcesso}
        />
      ))}
    </div>
  );
}

interface ModalsProps {
  novoOpen: boolean;
  setNovoOpen: (v: boolean) => void;
  editOpen: boolean;
  setEditOpen: (v: boolean) => void;
  editingProf: Profissional | null;
  deleteOpen: boolean;
  setDeleteOpen: (v: boolean) => void;
  profParaExcluir: Profissional | null;
  setProfParaExcluir: (p: Profissional | null) => void;
  acessoOpen: boolean;
  setAcessoOpen: (v: boolean) => void;
  profAcesso: Profissional | null;
  resetOpen: boolean;
  setResetOpen: (v: boolean) => void;
  profParaResetar: Profissional | null;
  setProfParaResetar: (p: Profissional | null) => void;
  onRecarregar: () => Promise<void>;
  setFeedbackMsg: (f: { tipo: 'sucesso' | 'info' | 'erro'; texto: string } | null) => void;
}

function EquipeModalsContainer(props: ModalsProps) {
  const [excluindo, setExcluindo] = useState(false);
  const [resetando, setResetando] = useState(false);

  const handleConfirmarExclusao = async () => {
    if (!props.profParaExcluir) return;
    setExcluindo(true);
    try {
      const res = await api.deleteProfissional(props.profParaExcluir.id);
      props.setDeleteOpen(false);
      props.setProfParaExcluir(null);
      props.setFeedbackMsg({ tipo: res.soft_deleted ? 'info' : 'sucesso', texto: res.message || 'Membro removido.' });
      await props.onRecarregar();
    } finally {
      setExcluindo(false);
    }
  };

  const handleConfirmarReset = async () => {
    if (!props.profParaResetar) return;
    setResetando(true);
    try {
      const res = await api.resetarSenhaProfissional(props.profParaResetar.id);
      props.setResetOpen(false);
      props.setProfParaResetar(null);
      props.setFeedbackMsg({ tipo: 'sucesso', texto: res.message });
      await props.onRecarregar();
    } finally {
      setResetando(false);
    }
  };

  return (
    <>
      <ModalNovoProfissional
        open={props.novoOpen}
        onOpenChange={props.setNovoOpen}
        onSaved={async (texto) => { props.setFeedbackMsg({ tipo: 'sucesso', texto }); await props.onRecarregar(); }}
      />
      <ModalEditarProfissional
        open={props.editOpen}
        onOpenChange={props.setEditOpen}
        prof={props.editingProf}
        onSaved={async (texto) => { props.setFeedbackMsg({ tipo: 'sucesso', texto }); await props.onRecarregar(); }}
      />
      <ModalDeleteProfissional
        open={props.deleteOpen}
        onOpenChange={props.setDeleteOpen}
        prof={props.profParaExcluir}
        onConfirm={handleConfirmarExclusao}
        excluindo={excluindo}
      />
      <ModalCriarAcesso
        open={props.acessoOpen}
        onOpenChange={props.setAcessoOpen}
        prof={props.profAcesso}
        onCreated={props.onRecarregar}
      />
      <ModalResetarSenha
        open={props.resetOpen}
        onOpenChange={props.setResetOpen}
        prof={props.profParaResetar}
        onConfirm={handleConfirmarReset}
        resetando={resetando}
      />
    </>
  );
}

export default function EquipePage() {
  const [equipe, setEquipe] = useState<Profissional[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [modalNovoOpen, setModalNovoOpen] = useState(false);
  const [modalEditOpen, setModalEditOpen] = useState(false);
  const [editingProfissional, setEditingProfissional] = useState<Profissional | null>(null);
  const [modalDeleteOpen, setModalDeleteOpen] = useState(false);
  const [profissionalParaExcluir, setProfissionalParaExcluir] = useState<Profissional | null>(null);
  const [modalAcessoOpen, setModalAcessoOpen] = useState(false);
  const [profissionalAcesso, setProfissionalAcesso] = useState<Profissional | null>(null);
  const [modalResetOpen, setModalResetOpen] = useState(false);
  const [profissionalParaResetar, setProfissionalParaResetar] = useState<Profissional | null>(null);
  const [feedbackMsg, setFeedbackMsg] = useState<{ tipo: 'sucesso' | 'info' | 'erro'; texto: string } | null>(null);
  const [loadingAcaoId, setLoadingAcaoId] = useState<number | null>(null);

  const recarregarEquipe = async () => {
    try {
      const data = await api.getEquipe();
      setEquipe(Array.isArray(data) ? data : data.results || []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    recarregarEquipe();
  }, []);

  const equipeFiltrada = equipe.filter(
    (p) =>
      p.nome.toLowerCase().includes(search.toLowerCase()) ||
      p.cargo.toLowerCase().includes(search.toLowerCase()) ||
      (p.email_usuario && p.email_usuario.toLowerCase().includes(search.toLowerCase()))
  );

  const handleToggleAtivo = async (prof: Profissional) => {
    setLoadingAcaoId(prof.id);
    try {
      const res = await api.toggleAtivoProfissional(prof.id);
      setFeedbackMsg({ tipo: 'sucesso', texto: res.message });
      await recarregarEquipe();
    } finally {
      setLoadingAcaoId(null);
    }
  };

  return (
    <div className="space-y-6">
      <EquipeHeader onNovo={() => setModalNovoOpen(true)} />
      {feedbackMsg && <FeedbackAlert msg={feedbackMsg} onClose={() => setFeedbackMsg(null)} />}
      <SearchBar value={search} onChange={setSearch} placeholder="Buscar profissional por nome ou especialidade..." />

      <EquipeGrid
        loading={loading}
        total={equipe.length}
        filtrados={equipeFiltrada}
        search={search}
        loadingAcaoId={loadingAcaoId}
        onNovo={() => setModalNovoOpen(true)}
        onClearSearch={() => setSearch('')}
        onEditar={(p) => { setEditingProfissional(p); setModalEditOpen(true); }}
        onExcluir={(p) => { setProfissionalParaExcluir(p); setModalDeleteOpen(true); }}
        onResetar={(p) => { setProfissionalParaResetar(p); setModalResetOpen(true); }}
        onToggleAtivo={handleToggleAtivo}
        onCriarAcesso={(p) => { setProfissionalAcesso(p); setModalAcessoOpen(true); }}
      />

      <EquipeModalsContainer
        novoOpen={modalNovoOpen} setNovoOpen={setModalNovoOpen}
        editOpen={modalEditOpen} setEditOpen={setModalEditOpen}
        editingProf={editingProfissional}
        deleteOpen={modalDeleteOpen} setDeleteOpen={setModalDeleteOpen}
        profParaExcluir={profissionalParaExcluir} setProfParaExcluir={setProfissionalParaExcluir}
        acessoOpen={modalAcessoOpen} setAcessoOpen={setModalAcessoOpen}
        profAcesso={profissionalAcesso}
        resetOpen={modalResetOpen} setResetOpen={setModalResetOpen}
        profParaResetar={profissionalParaResetar} setProfParaResetar={setProfissionalParaResetar}
        onRecarregar={recarregarEquipe} setFeedbackMsg={setFeedbackMsg}
      />
    </div>
  );
}
