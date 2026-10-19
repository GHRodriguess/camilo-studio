'use client';

import React, { useEffect, useState } from 'react';
import {
  Sparkles,
  Plus,
  ShieldCheck,
  ShieldAlert,
  KeyRound,
  CheckCircle2,
  Mail,
  Edit2,
  Trash2,
  UserX,
  UserCheck,
  RotateCcw,
  Info,
} from 'lucide-react';
import { api, Profissional } from '@/lib/api';
import { LoadingState } from '@/components/atoms/LoadingState';
import { EmptyState } from '@/components/atoms/EmptyState';
import { SearchBar } from '@/components/molecules/SearchBar';
import { NoSearchResultsState } from '@/components/atoms/NoSearchResultsState';
import { DeleteButton } from '@/components/atoms/DeleteButton';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
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

export default function EquipePage() {
  const [equipe, setEquipe] = useState<Profissional[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  // Modal Novo Membro
  const [modalNovoOpen, setModalNovoOpen] = useState(false);
  const [formNome, setFormNome] = useState('');
  const [formCargo, setFormCargo] = useState('Hair Stylist');
  const [formEmail, setFormEmail] = useState('');
  const [formCorHex, setFormCorHex] = useState('#7C3AED');
  const [saving, setSaving] = useState(false);

  // Modal Edição Membro
  const [modalEditOpen, setModalEditOpen] = useState(false);
  const [editingProfissional, setEditingProfissional] = useState<Profissional | null>(null);
  const [editNome, setEditNome] = useState('');
  const [editCargo, setEditCargo] = useState('Hair Stylist');
  const [editCorHex, setEditCorHex] = useState('#7C3AED');
  const [editAtivo, setEditAtivo] = useState(true);
  const [savingEdit, setSavingEdit] = useState(false);
  const [erroEdit, setErroEdit] = useState<string | null>(null);

  // Modal Exclusão Membro
  const [modalDeleteOpen, setModalDeleteOpen] = useState(false);
  const [profissionalParaExcluir, setProfissionalParaExcluir] = useState<Profissional | null>(null);
  const [excluindo, setExcluindo] = useState(false);

  // Modal Criar Acesso
  const [modalAcessoOpen, setModalAcessoOpen] = useState(false);
  const [profissionalAcesso, setProfissionalAcesso] = useState<Profissional | null>(null);
  const [emailAcesso, setEmailAcesso] = useState('');
  const [perfilAcesso, setPerfilAcesso] = useState<'admin' | 'profissional'>('profissional');
  const [savingAcesso, setSavingAcesso] = useState(false);
  const [resultadoAcesso, setResultadoAcesso] = useState<{ email: string } | null>(null);

  // Modal Resetar Senha
  const [modalResetOpen, setModalResetOpen] = useState(false);
  const [profissionalParaResetar, setProfissionalParaResetar] = useState<Profissional | null>(null);
  const [resetando, setResetando] = useState(false);

  // Feedback e Ações Rápidas
  const [feedbackMsg, setFeedbackMsg] = useState<{ tipo: 'sucesso' | 'info' | 'erro'; texto: string } | null>(null);
  const [loadingAcaoId, setLoadingAcaoId] = useState<number | null>(null);

  const recarregarEquipe = async () => {
    try {
      const data = await api.getEquipe();
      const list = Array.isArray(data) ? data : data.results || [];
      setEquipe(list);
    } catch (err) {
      console.error('Erro ao carregar equipe:', err);
    }
  };

  useEffect(() => {
    let isMounted = true;
    api.getEquipe()
      .then((data) => {
        if (isMounted) {
          const list = Array.isArray(data) ? data : data.results || [];
          setEquipe(list);
          setLoading(false);
        }
      })
      .catch((err) => {
        if (isMounted) {
          console.error('Erro ao carregar equipe:', err);
          setLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const equipeFiltrada = equipe.filter(
    (p) =>
      p.nome.toLowerCase().includes(search.toLowerCase()) ||
      p.cargo.toLowerCase().includes(search.toLowerCase()) ||
      (p.email_usuario && p.email_usuario.toLowerCase().includes(search.toLowerCase()))
  );

  const handleSalvarProfissional = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const novo = await api.createProfissional({
        nome: formNome,
        cargo: formCargo,
        cor_hex: formCorHex,
        ativo: true,
      });

      if (formEmail.trim()) {
        try {
          await api.criarAcessoProfissional(novo.id, formEmail.trim(), 'profissional');
        } catch (errAcesso) {
          console.error('Profissional criado, mas erro ao gerar acesso:', errAcesso);
        }
      }

      setModalNovoOpen(false);
      setFormNome('');
      setFormCargo('Hair Stylist');
      setFormEmail('');
      setFeedbackMsg({ tipo: 'sucesso', texto: 'Profissional cadastrado com sucesso!' });
      await recarregarEquipe();
    } catch (err) {
      console.error('Erro ao criar profissional:', err);
    } finally {
      setSaving(false);
    }
  };

  const abrirModalEditar = (prof: Profissional) => {
    setEditingProfissional(prof);
    setEditNome(prof.nome);
    setEditCargo(prof.cargo);
    setEditCorHex(prof.cor_hex || '#7C3AED');
    setEditAtivo(prof.ativo);
    setErroEdit(null);
    setModalEditOpen(true);
  };

  const handleSalvarEdicao = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProfissional) return;
    setSavingEdit(true);
    setErroEdit(null);
    try {
      await api.updateProfissional(editingProfissional.id, {
        nome: editNome.trim(),
        cargo: editCargo.trim(),
        cor_hex: editCorHex,
        ativo: editAtivo,
      });
      setModalEditOpen(false);
      setFeedbackMsg({ tipo: 'sucesso', texto: 'Dados do profissional atualizados com sucesso!' });
      await recarregarEquipe();
    } catch (err: unknown) {
      if (err instanceof Error) {
        setErroEdit(err.message);
      } else {
        setErroEdit('Erro ao atualizar profissional.');
      }
    } finally {
      setSavingEdit(false);
    }
  };

  const abrirModalExcluir = (prof: Profissional) => {
    setProfissionalParaExcluir(prof);
    setModalDeleteOpen(true);
  };

  const handleConfirmarExclusao = async () => {
    if (!profissionalParaExcluir) return;
    setExcluindo(true);
    try {
      const res = await api.deleteProfissional(profissionalParaExcluir.id);
      setModalDeleteOpen(false);
      setProfissionalParaExcluir(null);
      setFeedbackMsg({
        tipo: res.soft_deleted ? 'info' : 'sucesso',
        texto: res.message || 'Membro da equipe removido com sucesso.',
      });
      await recarregarEquipe();
    } catch (err) {
      console.error('Erro ao remover profissional:', err);
      setFeedbackMsg({ tipo: 'erro', texto: 'Erro ao remover profissional.' });
    } finally {
      setExcluindo(false);
    }
  };

  const abrirModalAcesso = (p: Profissional) => {
    setProfissionalAcesso(p);
    setEmailAcesso(`${p.nome.toLowerCase().replace(/\s+/g, '.')}@camilostudio.com`);
    setPerfilAcesso('profissional');
    setResultadoAcesso(null);
    setModalAcessoOpen(true);
  };

  const handleCriarAcesso = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profissionalAcesso) return;
    setSavingAcesso(true);
    try {
      const res = await api.criarAcessoProfissional(profissionalAcesso.id, emailAcesso, perfilAcesso);
      setResultadoAcesso({ email: res.email });
      await recarregarEquipe();
    } catch (err) {
      console.error('Erro ao criar acesso:', err);
    } finally {
      setSavingAcesso(false);
    }
  };

  const handleToggleAtivo = async (prof: Profissional) => {
    setLoadingAcaoId(prof.id);
    try {
      const res = await api.toggleAtivoProfissional(prof.id);
      setFeedbackMsg({ tipo: 'sucesso', texto: res.message });
      await recarregarEquipe();
    } catch (err: unknown) {
      setFeedbackMsg({
        tipo: 'erro',
        texto: err instanceof Error ? err.message : 'Erro ao alternar status do colaborador.',
      });
    } finally {
      setLoadingAcaoId(null);
    }
  };

  const abrirModalResetar = (prof: Profissional) => {
    setProfissionalParaResetar(prof);
    setModalResetOpen(true);
  };

  const handleConfirmarReset = async () => {
    if (!profissionalParaResetar) return;
    setResetando(true);
    try {
      const res = await api.resetarSenhaProfissional(profissionalParaResetar.id);
      setModalResetOpen(false);
      setProfissionalParaResetar(null);
      setFeedbackMsg({ tipo: 'sucesso', texto: res.message });
      await recarregarEquipe();
    } catch (err: unknown) {
      setFeedbackMsg({
        tipo: 'erro',
        texto: err instanceof Error ? err.message : 'Erro ao resetar senha.',
      });
    } finally {
      setResetando(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* CABEÇALHO */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs uppercase tracking-[0.2em] font-semibold text-primary">
            Corpo de Especialistas
          </span>
          <h1 className="text-2xl sm:text-3xl font-bold text-on-surface font-heading tracking-tight mt-0.5">
            Equipe do Ateliê
          </h1>
          <p className="text-xs sm:text-sm text-on-surface-variant">
            Gerencie profissionais do ateliê, cores de identificação e credenciais de acesso ao sistema.
          </p>
        </div>

        {/* ÚNICO BOTÃO PRIMÁRIO */}
        <Button
          onClick={() => setModalNovoOpen(true)}
          className="rounded-full h-11 px-6 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold shadow-md shadow-primary/20 shrink-0 cursor-pointer"
        >
          <Plus className="w-4 h-4 mr-1.5" />
          Novo Profissional
        </Button>
      </div>

      {feedbackMsg && (
        <div
          className={`p-3.5 rounded-2xl border text-xs flex items-center justify-between gap-3 animate-in fade-in duration-200 ${
            feedbackMsg.tipo === 'erro'
              ? 'bg-destructive/10 border-destructive/20 text-destructive'
              : feedbackMsg.tipo === 'info'
              ? 'bg-amber-500/10 border-amber-500/20 text-amber-800'
              : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-800'
          }`}
        >
          <div className="flex items-center gap-2">
            {feedbackMsg.tipo === 'erro' ? (
              <ShieldAlert className="w-4 h-4 shrink-0" />
            ) : feedbackMsg.tipo === 'info' ? (
              <Info className="w-4 h-4 shrink-0" />
            ) : (
              <CheckCircle2 className="w-4 h-4 shrink-0" />
            )}
            <span>{feedbackMsg.texto}</span>
          </div>
          <button
            type="button"
            onClick={() => setFeedbackMsg(null)}
            className="text-xs font-semibold hover:opacity-75 cursor-pointer px-1"
          >
            ✕
          </button>
        </div>
      )}

      <SearchBar
        value={search}
        onChange={setSearch}
        placeholder="Buscar profissional por nome ou especialidade..."
      />

      {loading ? (
        <LoadingState message="Carregando profissionais da equipe..." />
      ) : equipe.length === 0 ? (
        <EmptyState
          icon={Sparkles}
          title="Nenhum profissional cadastrado"
          description="Cadastre os hair stylists, terapeutas capilares e assistentes do ateliê."
          actionLabel="Cadastrar Membro da Equipe"
          onAction={() => setModalNovoOpen(true)}
        />
      ) : equipeFiltrada.length === 0 ? (
        <NoSearchResultsState searchTerm={search} onClear={() => setSearch('')} />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {equipeFiltrada.map((prof) => (
            <div
              key={prof.id}
              className="p-6 rounded-3xl bg-surface-container-lowest border border-outline-variant/60 shadow-sm hover:shadow-md hover:border-primary/40 transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-4">
                  <div className="flex items-start gap-3.5 min-w-0">
                    <Avatar className="w-14 h-14 border-2 shadow-sm shrink-0" style={{ borderColor: prof.cor_hex }}>
                      <AvatarImage src={prof.foto_url} alt={prof.nome} />
                      <AvatarFallback className="bg-primary/10 text-primary font-bold text-base">
                        {prof.nome.slice(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>

                    <div className="min-w-0 flex-1">
                      <h3 className="text-base font-semibold text-on-surface font-heading truncate">
                        {prof.nome}
                      </h3>
                      <p className="text-xs text-primary font-medium truncate mt-0.5">
                        {prof.cargo}
                      </p>
                      <div className="flex items-center gap-1.5 mt-1.5">
                        <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: prof.cor_hex }} />
                        <span className="text-[11px] text-on-surface-variant font-medium">
                          {prof.ativo ? 'Ativo na Equipe' : 'Inativo na Escala'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Ações de Edição e Exclusão */}
                  <div className="flex items-center gap-1 shrink-0">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => abrirModalEditar(prof)}
                      className="rounded-full h-8 w-8 text-on-surface-variant hover:text-primary hover:bg-primary/10"
                      title="Editar profissional"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </Button>
                    <DeleteButton
                      onDelete={() => abrirModalExcluir(prof)}
                      title="Remover profissional"
                    />
                  </div>
                </div>

                {/* E-mail de Login do Profissional */}
                {prof.email_usuario ? (
                  <div className="flex items-center gap-1.5 text-xs text-on-surface-variant font-mono mb-4 bg-surface-container-low px-2.5 py-1.5 rounded-xl border border-outline-variant/30">
                    <Mail className="w-3.5 h-3.5 text-primary shrink-0" />
                    <span className="truncate">{prof.email_usuario}</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-1.5 text-[11px] text-on-surface-variant/60 mb-4">
                    <Mail className="w-3 h-3 text-on-surface-variant/40 shrink-0" />
                    <span className="italic">Login ainda não configurado</span>
                  </div>
                )}
              </div>

              {/* Status de Acesso e Controles */}
              <div className="pt-4 border-t border-outline-variant/40 flex flex-col gap-2.5">
                <div className="flex items-center justify-between gap-2">
                  {prof.possui_acesso ? (
                    prof.usuario_ativo !== false && prof.ativo ? (
                      <Badge variant="outline" className="rounded-full text-[11px] gap-1 text-emerald-600 border-emerald-200 bg-emerald-50/50">
                        <ShieldCheck className="w-3 h-3" />
                        Acesso Ativo
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="rounded-full text-[11px] gap-1 text-amber-700 border-amber-300 bg-amber-50/50">
                        <ShieldAlert className="w-3 h-3" />
                        Acesso Desativado
                      </Badge>
                    )
                  ) : (
                    <Badge variant="outline" className="rounded-full text-[11px] gap-1 text-on-surface-variant/70 border-outline-variant bg-surface-container-low">
                      Sem Acesso Web
                    </Badge>
                  )}

                  {prof.possui_acesso && (
                    <div className="flex items-center gap-1.5">
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        disabled={loadingAcaoId === prof.id}
                        onClick={() => abrirModalResetar(prof)}
                        className="rounded-full h-8 px-2.5 text-[11px] text-on-surface-variant hover:text-primary hover:bg-primary/5 cursor-pointer gap-1"
                        title="Gerar nova senha provisória e reenviar por e-mail"
                      >
                        <RotateCcw className="w-3 h-3" />
                        <span>Resetar Senha</span>
                      </Button>

                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        disabled={loadingAcaoId === prof.id}
                        onClick={() => handleToggleAtivo(prof)}
                        className={`rounded-full h-8 px-2.5 text-[11px] cursor-pointer gap-1 transition-all ${
                          prof.usuario_ativo !== false && prof.ativo
                            ? 'border-amber-300 text-amber-700 hover:bg-amber-50'
                            : 'border-emerald-300 text-emerald-700 hover:bg-emerald-50'
                        }`}
                        title={prof.usuario_ativo !== false && prof.ativo ? 'Desativar acesso ao sistema' : 'Reativar acesso ao sistema'}
                      >
                        {prof.usuario_ativo !== false && prof.ativo ? (
                          <>
                            <UserX className="w-3 h-3" />
                            <span>Desativar</span>
                          </>
                        ) : (
                          <>
                            <UserCheck className="w-3 h-3" />
                            <span>Reativar</span>
                          </>
                        )}
                      </Button>
                    </div>
                  )}
                </div>

                {!prof.possui_acesso && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => abrirModalAcesso(prof)}
                    className="w-full rounded-full text-xs h-9 border-primary/30 text-primary hover:bg-primary/5 cursor-pointer"
                  >
                    <KeyRound className="w-3.5 h-3.5 mr-1" />
                    Criar Acesso ao Sistema
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* MODAL NOVO PROFISSIONAL */}
      <Dialog open={modalNovoOpen} onOpenChange={setModalNovoOpen}>
        <DialogContent className="sm:max-w-md rounded-3xl p-6 bg-surface-container-lowest border-outline-variant">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-on-surface font-heading">
              Cadastrar Novo Profissional
            </DialogTitle>
            <DialogDescription className="text-xs text-on-surface-variant">
              Adicione o especialista à equipe do ateliê e configure seu login.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSalvarProfissional} className="space-y-4 pt-2">
            <div className="space-y-1.5">
              <Label className="text-xs font-medium text-on-surface-variant">Nome Completo</Label>
              <Input
                required
                value={formNome}
                onChange={(e) => setFormNome(e.target.value)}
                placeholder="Ex: Gabriela Monteiro"
                className="rounded-full h-11 text-xs"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-medium text-on-surface-variant">Cargo / Especialidade</Label>
              <Input
                required
                value={formCargo}
                onChange={(e) => setFormCargo(e.target.value)}
                placeholder="Ex: Hair Stylist & Terapeuta Capilar"
                className="rounded-full h-11 text-xs"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-medium text-on-surface-variant">Cor de Identificação</Label>
              <div className="flex items-center gap-3">
                <Input
                  type="color"
                  value={formCorHex}
                  onChange={(e) => setFormCorHex(e.target.value)}
                  className="w-12 h-10 p-1 rounded-xl cursor-pointer"
                />
                <span className="text-xs font-mono text-on-surface-variant">{formCorHex}</span>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-medium text-on-surface-variant">E-mail Profissional (Opcional)</Label>
              <Input
                type="email"
                value={formEmail}
                onChange={(e) => setFormEmail(e.target.value)}
                placeholder="Ex: gabriela@camilostudio.com"
                className="rounded-full h-11 text-xs"
              />
              <p className="text-[10px] text-on-surface-variant">
                Se informado, o sistema já gera o acesso com senha provisória enviada por e-mail.
              </p>
            </div>

            <div className="pt-3 flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setModalNovoOpen(false)}
                className="rounded-full text-xs h-10 px-5"
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={saving}
                className="rounded-full text-xs h-10 px-6 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold shadow-md shadow-primary/20"
              >
                {saving ? 'Cadastrando...' : 'Cadastrar na Equipe'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* MODAL EDITAR PROFISSIONAL */}
      <Dialog open={modalEditOpen} onOpenChange={setModalEditOpen}>
        <DialogContent className="sm:max-w-md rounded-3xl p-6 bg-surface-container-lowest border-outline-variant">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-on-surface font-heading flex items-center gap-2">
              <Edit2 className="w-5 h-5 text-primary" />
              Editar Membro da Equipe
            </DialogTitle>
            <DialogDescription className="text-xs text-on-surface-variant">
              Atualize nome, cargo e cor de identificação do profissional.
            </DialogDescription>
          </DialogHeader>

          {erroEdit && (
            <div className="p-3.5 rounded-2xl bg-destructive/10 border border-destructive/20 text-destructive text-xs">
              {erroEdit}
            </div>
          )}

          <form onSubmit={handleSalvarEdicao} className="space-y-4 pt-2">
            <div className="space-y-1.5">
              <Label className="text-xs font-medium text-on-surface-variant">Nome Completo</Label>
              <Input
                required
                value={editNome}
                onChange={(e) => setEditNome(e.target.value)}
                className="rounded-full h-11 text-xs"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-medium text-on-surface-variant">Cargo / Especialidade</Label>
              <Input
                required
                value={editCargo}
                onChange={(e) => setEditCargo(e.target.value)}
                className="rounded-full h-11 text-xs"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-medium text-on-surface-variant">Cor de Identificação</Label>
              <div className="flex items-center gap-3">
                <Input
                  type="color"
                  value={editCorHex}
                  onChange={(e) => setEditCorHex(e.target.value)}
                  className="w-12 h-10 p-1 rounded-xl cursor-pointer"
                />
                <span className="text-xs font-mono text-on-surface-variant">{editCorHex}</span>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-medium text-on-surface-variant">Status</Label>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="editAtivoCheckbox"
                  checked={editAtivo}
                  onChange={(e) => setEditAtivo(e.target.checked)}
                  className="rounded text-primary focus:ring-primary h-4 w-4"
                />
                <label htmlFor="editAtivoCheckbox" className="text-xs text-on-surface cursor-pointer">
                  Profissional ativo e disponível para agendamentos
                </label>
              </div>
            </div>

            <div className="pt-3 flex justify-end gap-2">
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
                disabled={savingEdit}
                className="rounded-full text-xs h-10 px-6 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold shadow-md shadow-primary/20 cursor-pointer"
              >
                {savingEdit ? 'Salvando...' : 'Salvar Alterações'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* DIÁLOGO DE CONFIRMAÇÃO DE EXCLUSÃO DE PROFISSIONAL */}
      <Dialog open={modalDeleteOpen} onOpenChange={setModalDeleteOpen}>
        <DialogContent className="sm:max-w-md rounded-3xl p-6 bg-surface-container-lowest border-outline-variant">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-on-surface font-heading flex items-center gap-2 text-destructive">
              <Trash2 className="w-5 h-5" />
              Remover Profissional
            </DialogTitle>
            <DialogDescription className="text-xs text-on-surface-variant pt-1">
              Tem certeza que deseja remover <strong>{profissionalParaExcluir?.nome}</strong> da equipe?
            </DialogDescription>
          </DialogHeader>

          <div className="p-3 bg-surface-container rounded-2xl border border-outline-variant/50 text-[11px] leading-relaxed text-on-surface-variant my-2">
            <strong className="text-on-surface font-semibold">🛡️ Integridade dos Dados:</strong> Se o colaborador possuir agendamentos ou procedimentos no histórico, seu acesso será desativado e ele será removido da escala ativa para preservar os registros. Caso seja um cadastro sem vínculos, será excluído definitivamente.
          </div>

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
              {excluindo ? 'Processando...' : 'Confirmar Remoção'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* MODAL CRIAR ACESSO AO SISTEMA */}
      <Dialog open={modalAcessoOpen} onOpenChange={setModalAcessoOpen}>
        <DialogContent className="sm:max-w-md rounded-3xl p-6 bg-surface-container-lowest border-outline-variant">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-on-surface font-heading">
              Criar Acesso ao Sistema
            </DialogTitle>
            <DialogDescription className="text-xs text-on-surface-variant">
              Uma senha temporária confidencial será gerada e enviada para o e-mail do profissional.
            </DialogDescription>
          </DialogHeader>

          {resultadoAcesso ? (
            <div className="py-4 space-y-4 text-center">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary mx-auto">
                <CheckCircle2 className="w-7 h-7" />
              </div>
              <h4 className="text-sm font-semibold text-on-surface">Acesso criado com sucesso!</h4>
              <p className="text-xs text-on-surface-variant max-w-xs mx-auto">
                As instruções de primeiro acesso e a senha provisória foram enviadas com sucesso para <strong>{resultadoAcesso.email}</strong>.
              </p>
              <div className="p-3 bg-surface-container rounded-2xl border border-outline-variant text-[11px] text-on-surface-variant">
                O colaborador deverá cadastrar sua senha definitiva e pessoal obrigatoriamente no primeiro login.
              </div>
              <Button
                type="button"
                onClick={() => setModalAcessoOpen(false)}
                className="w-full rounded-full text-xs h-10 mt-2 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold cursor-pointer"
              >
                Concluir
              </Button>
            </div>
          ) : (
            <form onSubmit={handleCriarAcesso} className="space-y-4 pt-2">
              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-on-surface-variant">Profissional</Label>
                <Input
                  disabled
                  value={profissionalAcesso?.nome || ''}
                  className="rounded-full h-11 text-xs bg-surface-container"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-on-surface-variant">E-mail de Login</Label>
                <Input
                  type="email"
                  required
                  value={emailAcesso}
                  onChange={(e) => setEmailAcesso(e.target.value)}
                  className="rounded-full h-11 text-xs"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-on-surface-variant">Perfil de Acesso</Label>
                <select
                  value={perfilAcesso}
                  onChange={(e) => setPerfilAcesso(e.target.value as 'admin' | 'profissional')}
                  className="w-full h-11 px-3 rounded-full border border-outline-variant bg-surface-container-lowest text-xs text-on-surface focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="profissional">Profissional (Acesso restrito aos atendimentos)</option>
                  <option value="admin">Administrador (Acesso total)</option>
                </select>
              </div>

              <div className="pt-3 flex justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setModalAcessoOpen(false)}
                  className="rounded-full text-xs h-10 px-5"
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  disabled={savingAcesso}
                  className="rounded-full text-xs h-10 px-6 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold shadow-md shadow-primary/20 cursor-pointer"
                >
                  {savingAcesso ? 'Criando e enviando...' : 'Criar Conta & Enviar E-mail'}
                </Button>
              </div>
            </form>
          )}
        </DialogContent>
      </Dialog>

      {/* MODAL REDEFINIR SENHA DO PROFISSIONAL */}
      <Dialog open={modalResetOpen} onOpenChange={setModalResetOpen}>
        <DialogContent className="sm:max-w-md rounded-3xl p-6 bg-surface-container-lowest border-outline-variant">
          <DialogHeader>
            <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary mb-2">
              <RotateCcw className="w-6 h-6" />
            </div>
            <DialogTitle className="text-lg font-bold text-on-surface font-heading">
              Redefinir Acesso de {profissionalParaResetar?.nome}
            </DialogTitle>
            <DialogDescription className="text-xs text-on-surface-variant pt-1">
              Uma nova senha provisória confidencial será gerada e enviada por e-mail.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 py-2">
            <div className="p-3.5 bg-surface-container rounded-2xl border border-outline-variant/50 text-xs space-y-2">
              <div className="flex items-center gap-2 text-on-surface font-medium">
                <Mail className="w-4 h-4 text-primary shrink-0" />
                <span className="truncate font-mono">{profissionalParaResetar?.email_usuario}</span>
              </div>
              <p className="text-[11px] text-on-surface-variant leading-relaxed">
                O colaborador receberá imediatamente uma mensagem institucional com a nova credencial provisória de 10 dígitos e será obrigado a cadastrar uma nova senha pessoal no próximo login.
              </p>
            </div>
          </div>

          <div className="pt-2 flex items-center justify-end gap-2.5">
            <Button
              type="button"
              variant="outline"
              onClick={() => setModalResetOpen(false)}
              className="rounded-full text-xs h-10 px-5 cursor-pointer"
            >
              Cancelar
            </Button>
            <Button
              type="button"
              disabled={resetando}
              onClick={handleConfirmarReset}
              className="rounded-full text-xs h-10 px-5 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold shadow-md shadow-primary/20 cursor-pointer"
            >
              {resetando ? 'Gerando e enviando...' : 'Confirmar e Enviar E-mail'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

