'use client';

import React, { useEffect, useState, useCallback } from 'react';
import {
  Sparkles,
  Plus,
  Clock,
  ShieldCheck,
  KeyRound,
  CheckCircle2,
} from 'lucide-react';
import { api, Profissional } from '@/lib/api';
import { LoadingState } from '@/components/atoms/LoadingState';
import { EmptyState } from '@/components/atoms/EmptyState';
import { SearchBar } from '@/components/molecules/SearchBar';
import { NoSearchResultsState } from '@/components/atoms/NoSearchResultsState';
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
  const [formCadeira, setFormCadeira] = useState('Cadeira 01');
  const [formHorarioInicio, setFormHorarioInicio] = useState('09:00');
  const [formHorarioFim, setFormHorarioFim] = useState('19:00');
  const [formCorHex] = useState('#7C3AED');
  const [saving, setSaving] = useState(false);

  // Modal Criar Acesso
  const [modalAcessoOpen, setModalAcessoOpen] = useState(false);
  const [profissionalAcesso, setProfissionalAcesso] = useState<Profissional | null>(null);
  const [emailAcesso, setEmailAcesso] = useState('');
  const [perfilAcesso, setPerfilAcesso] = useState<'admin' | 'profissional'>('profissional');
  const [savingAcesso, setSavingAcesso] = useState(false);
  const [resultadoAcesso, setResultadoAcesso] = useState<{ email: string; senha_temp?: string } | null>(null);

  const carregarEquipe = useCallback(async () => {
    try {
      const data = await api.getEquipe();
      const list = Array.isArray(data) ? data : data.results || [];
      setEquipe(list);
    } catch (err) {
      console.error('Erro ao carregar equipe:', err);
    } finally {
      setLoading(false);
    }
  }, []);

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
      p.cadeira.toLowerCase().includes(search.toLowerCase())
  );

  const handleSalvarProfissional = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.createProfissional({
        nome: formNome,
        cargo: formCargo,
        cadeira: formCadeira,
        horario_inicio: formHorarioInicio,
        horario_fim: formHorarioFim,
        cor_hex: formCorHex,
        ativo: true,
      });
      setModalNovoOpen(false);
      setFormNome('');
      await carregarEquipe();
    } catch (err) {
      console.error('Erro ao criar profissional:', err);
    } finally {
      setSaving(false);
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
      setResultadoAcesso({ email: res.email, senha_temp: res.senha_temp });
      await carregarEquipe();
    } catch (err) {
      console.error('Erro ao criar acesso:', err);
    } finally {
      setSavingAcesso(false);
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
            Equipe & Escala de Horários
          </h1>
          <p className="text-xs sm:text-sm text-on-surface-variant">
            Gerencie profissionais, cadeiras de atendimento e credenciais de acesso.
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

      <SearchBar
        value={search}
        onChange={setSearch}
        placeholder="Buscar profissional por nome, especialidade ou cadeira..."
      />

      {loading ? (
        <LoadingState message="Carregando escala da equipe..." />
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
                <div className="flex items-start gap-4 mb-4">
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
                      <span className="w-2 h-2 rounded-full" style={{ backgroundColor: prof.cor_hex }} />
                      <span className="text-[11px] text-on-surface-variant font-mono">
                        {prof.cadeira}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="space-y-2 py-3 border-y border-outline-variant/40 text-xs text-on-surface-variant">
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-primary" />
                      Expediente:
                    </span>
                    <span className="font-mono font-medium text-on-surface">
                      {prof.horario_inicio} às {prof.horario_fim}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Dias:</span>
                    <span className="uppercase text-[10px] font-semibold tracking-wider text-on-surface">
                      {prof.dias_semana || 'Ter - Sáb'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Status de Acesso */}
              <div className="pt-4 flex items-center justify-between gap-2">
                {prof.possui_acesso ? (
                  <Badge variant="outline" className="rounded-full text-[11px] gap-1 text-emerald-600 border-emerald-200 bg-emerald-50/50">
                    <ShieldCheck className="w-3 h-3" />
                    Acesso Ativo
                  </Badge>
                ) : (
                  <Button
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
              Adicione o especialista à escala e defina sua estação de trabalho.
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

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-on-surface-variant">Cargo / Função</Label>
                <Input
                  required
                  value={formCargo}
                  onChange={(e) => setFormCargo(e.target.value)}
                  placeholder="Ex: Colorista Master"
                  className="rounded-full h-11 text-xs"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-on-surface-variant">Cadeira / Estação</Label>
                <Input
                  required
                  value={formCadeira}
                  onChange={(e) => setFormCadeira(e.target.value)}
                  placeholder="Ex: Bancada 04"
                  className="rounded-full h-11 text-xs"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-on-surface-variant">Início Expediente</Label>
                <Input
                  type="time"
                  required
                  value={formHorarioInicio}
                  onChange={(e) => setFormHorarioInicio(e.target.value)}
                  className="rounded-full h-11 text-xs font-mono"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-on-surface-variant">Fim Expediente</Label>
                <Input
                  type="time"
                  required
                  value={formHorarioFim}
                  onChange={(e) => setFormHorarioFim(e.target.value)}
                  className="rounded-full h-11 text-xs font-mono"
                />
              </div>
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

      {/* MODAL CRIAR ACESSO AO SISTEMA */}
      <Dialog open={modalAcessoOpen} onOpenChange={setModalAcessoOpen}>
        <DialogContent className="sm:max-w-md rounded-3xl p-6 bg-surface-container-lowest border-outline-variant">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-on-surface font-heading">
              Criar Acesso ao Sistema
            </DialogTitle>
            <DialogDescription className="text-xs text-on-surface-variant">
              Uma senha temporária será gerada e enviada para o e-mail do profissional.
            </DialogDescription>
          </DialogHeader>

          {resultadoAcesso ? (
            <div className="py-4 space-y-4 text-center">
              <CheckCircle2 className="w-12 h-12 text-primary mx-auto" />
              <h4 className="text-sm font-semibold text-on-surface">Conta criada com sucesso!</h4>
              <p className="text-xs text-on-surface-variant">
                O e-mail de boas-vindas com a senha provisória foi disparado para <strong>{resultadoAcesso.email}</strong>.
              </p>
              {resultadoAcesso.senha_temp && (
                <div className="p-3 bg-surface-container rounded-2xl border border-outline-variant text-xs">
                  <span className="text-on-surface-variant">Senha gerada (dev): </span>
                  <strong className="font-mono text-primary">{resultadoAcesso.senha_temp}</strong>
                </div>
              )}
              <Button
                onClick={() => setModalAcessoOpen(false)}
                className="w-full rounded-full text-xs h-10 mt-2"
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
                  className="rounded-full text-xs h-10 px-6 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold shadow-md shadow-primary/20"
                >
                  {savingAcesso ? 'Criando e enviando...' : 'Criar Conta & Enviar E-mail'}
                </Button>
              </div>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
