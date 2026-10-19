'use client';

import React, { useEffect, useState, use } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  Phone,
  Mail,
  FlaskConical,
  Clock,
  Plus,
  Copy,
  Check,
  Heart,
  AlertCircle,
  Edit2,
  Trash2,
} from 'lucide-react';
import { api, Cliente, FormulaQuimica, Profissional } from '@/lib/api';
import { formatarTelefone, validarTelefone } from '@/lib/masks';
import { LoadingState } from '@/components/atoms/LoadingState';
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
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export default function ClienteDetalhesPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const router = useRouter();
  const { id } = use(params);
  const clienteId = parseInt(id, 10);

  const [cliente, setCliente] = useState<Cliente | null>(null);
  const [formulas, setFormulas] = useState<FormulaQuimica[]>([]);
  const [equipe, setEquipe] = useState<Profissional[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal Edição Cliente
  const [modalEditClienteOpen, setModalEditClienteOpen] = useState(false);
  const [editNome, setEditNome] = useState('');
  const [editTelefone, setEditTelefone] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editDataNascimento, setEditDataNascimento] = useState('');
  const [editSigno, setEditSigno] = useState('');
  const [editTags, setEditTags] = useState('');
  const [editAlergias, setEditAlergias] = useState('');
  const [editPreferencias, setEditPreferencias] = useState('');
  const [savingCliente, setSavingCliente] = useState(false);
  const [erroEditCliente, setErroEditCliente] = useState<string | null>(null);

  // Modal Exclusão Cliente
  const [modalDeleteClienteOpen, setModalDeleteClienteOpen] = useState(false);
  const [excluindoCliente, setExcluindoCliente] = useState(false);

  // Modal Fórmula (Nova ou Edição)
  const [modalFormulaOpen, setModalFormulaOpen] = useState(false);
  const [editingFormula, setEditingFormula] = useState<FormulaQuimica | null>(null);
  const [formProcedimento, setFormProcedimento] = useState('Mechas Globais Pérola');
  const [formProfissional, setFormProfissional] = useState<number | ''>('');
  const [formDataAplicacao, setFormDataAplicacao] = useState('');
  const [formFormulaTexto, setFormFormulaTexto] = useState('');
  const [formVolumagemOx, setFormVolumagemOx] = useState('20 vol');
  const [formTempoPausa, setFormTempoPausa] = useState('45');
  const [formFundo, setFormFundo] = useState('Fundo 9 / 10');
  const [formObservacoes, setFormObservacoes] = useState('');
  const [savingFormula, setSavingFormula] = useState(false);
  const [copiadoId, setCopiadoId] = useState<number | null>(null);

  // Modal Exclusão Fórmula
  const [modalDeleteFormulaOpen, setModalDeleteFormulaOpen] = useState(false);
  const [formulaParaExcluir, setFormulaParaExcluir] = useState<FormulaQuimica | null>(null);
  const [excluindoFormula, setExcluindoFormula] = useState(false);

  useEffect(() => {
    let isMounted = true;
    Promise.all([
      api.getCliente(clienteId),
      api.getFormulas(clienteId),
      api.getEquipe(),
    ])
      .then(([cliData, formResp, equipeResp]) => {
        if (isMounted) {
          setFormDataAplicacao(new Date().toISOString().split('T')[0]);
          setCliente(cliData);
          setFormulas(Array.isArray(formResp) ? formResp : formResp.results || []);
          setEquipe(Array.isArray(equipeResp) ? equipeResp : equipeResp.results || []);
          setLoading(false);
        }
      })
      .catch((err) => {
        if (isMounted) {
          console.error('Erro ao carregar dados do cliente:', err);
          setLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [clienteId]);

  const recarregarFormulas = async () => {
    try {
      const formResp = await api.getFormulas(clienteId);
      setFormulas(Array.isArray(formResp) ? formResp : formResp.results || []);
    } catch (err) {
      console.error('Erro ao recarregar fórmulas:', err);
    }
  };

  const abrirModalEditarCliente = () => {
    if (!cliente) return;
    setEditNome(cliente.nome);
    setEditTelefone(formatarTelefone(cliente.telefone));
    setEditEmail(cliente.email || '');
    setEditDataNascimento(cliente.data_nascimento || '');
    setEditSigno(cliente.signo || '');
    setEditTags(cliente.tags || '');
    setEditAlergias(cliente.observacoes_alergias || '');
    setEditPreferencias(cliente.preferencias_sensoriais || '');
    setErroEditCliente(null);
    setModalEditClienteOpen(true);
  };

  const handleSalvarCliente = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cliente) return;
    if (editNome.trim().length < 3) {
      setErroEditCliente('O nome deve conter pelo menos 3 caracteres.');
      return;
    }

    const validacaoTel = validarTelefone(editTelefone);
    if (!validacaoTel.valido) {
      setErroEditCliente(validacaoTel.mensagem || 'WhatsApp / Telefone inválido.');
      return;
    }

    setSavingCliente(true);
    setErroEditCliente(null);

    try {
      const atualizado = await api.updateCliente(cliente.id, {
        nome: editNome.trim(),
        telefone: editTelefone.trim(),
        email: editEmail.trim(),
        data_nascimento: editDataNascimento || undefined,
        signo: editSigno.trim(),
        tags: editTags.trim(),
        observacoes_alergias: editAlergias.trim(),
        preferencias_sensoriais: editPreferencias.trim(),
      });
      setCliente(atualizado);
      setModalEditClienteOpen(false);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setErroEditCliente(err.message);
      } else {
        setErroEditCliente('Erro ao atualizar perfil da cliente.');
      }
    } finally {
      setSavingCliente(false);
    }
  };

  const handleConfirmarExclusaoCliente = async () => {
    if (!cliente) return;
    setExcluindoCliente(true);
    try {
      await api.deleteCliente(cliente.id);
      setModalDeleteClienteOpen(false);
      router.push('/clientes');
    } catch (err) {
      console.error('Erro ao excluir cliente:', err);
    } finally {
      setExcluindoCliente(false);
    }
  };

  const abrirModalNovaFormula = () => {
    setEditingFormula(null);
    setFormProcedimento('Mechas Globais Pérola');
    setFormProfissional('');
    setFormDataAplicacao(new Date().toISOString().split('T')[0]);
    setFormFormulaTexto('');
    setFormVolumagemOx('20 vol');
    setFormTempoPausa('45');
    setFormFundo('Fundo 9 / 10');
    setFormObservacoes('');
    setModalFormulaOpen(true);
  };

  const abrirModalEditarFormula = (formula: FormulaQuimica) => {
    setEditingFormula(formula);
    setFormProcedimento(formula.procedimento);
    setFormProfissional(formula.profissional ?? '');
    setFormDataAplicacao(formula.data_aplicacao);
    setFormFormulaTexto(formula.formula_texto);
    setFormVolumagemOx(formula.volumagem_ox);
    setFormTempoPausa(String(formula.tempo_pausa_minutos));
    setFormFundo(formula.fundo_clareamento || '');
    setFormObservacoes(formula.observacoes || '');
    setModalFormulaOpen(true);
  };

  const handleSalvarFormula = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingFormula(true);
    try {
      const payload = {
        cliente: clienteId,
        profissional: formProfissional ? Number(formProfissional) : undefined,
        data_aplicacao: formDataAplicacao,
        procedimento: formProcedimento,
        formula_texto: formFormulaTexto,
        volumagem_ox: formVolumagemOx,
        tempo_pausa_minutos: parseInt(formTempoPausa, 10) || 45,
        fundo_clareamento: formFundo,
        observacoes: formObservacoes,
      };

      if (editingFormula) {
        await api.updateFormula(editingFormula.id, payload);
      } else {
        await api.createFormula(payload);
      }

      setModalFormulaOpen(false);
      await recarregarFormulas();
    } catch (err) {
      console.error('Erro ao salvar fórmula:', err);
    } finally {
      setSavingFormula(false);
    }
  };

  const abrirModalExcluirFormula = (formula: FormulaQuimica) => {
    setFormulaParaExcluir(formula);
    setModalDeleteFormulaOpen(true);
  };

  const handleConfirmarExclusaoFormula = async () => {
    if (!formulaParaExcluir) return;
    setExcluindoFormula(true);
    try {
      await api.deleteFormula(formulaParaExcluir.id);
      setModalDeleteFormulaOpen(false);
      setFormulaParaExcluir(null);
      await recarregarFormulas();
    } catch (err) {
      console.error('Erro ao excluir fórmula:', err);
    } finally {
      setExcluindoFormula(false);
    }
  };

  const handleCopiarFormula = (formula: FormulaQuimica) => {
    const texto = `[Fórmula Camilo Studio] Procedimento: ${formula.procedimento}\nMistura: ${formula.formula_texto}\nOX: ${formula.volumagem_ox} | Pausa: ${formula.tempo_pausa_minutos} min | Fundo: ${formula.fundo_clareamento || 'N/A'}`;
    navigator.clipboard.writeText(texto);
    setCopiadoId(formula.id);
    setTimeout(() => setCopiadoId(null), 3000);
  };

  if (loading) {
    return <LoadingState message="Carregando ficha e dossiê químico..." />;
  }

  if (!cliente) {
    return (
      <div className="text-center py-12">
        <Link
          href="/clientes"
          className="inline-flex items-center justify-center rounded-full mt-4 h-10 px-6 bg-primary text-primary-foreground font-semibold text-xs shadow-md shadow-primary/20"
        >
          Voltar para a lista
        </Link>
      </div>
    );
  }

  const tags = cliente.tags ? cliente.tags.split(',').map((t) => t.trim()) : [];

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* NAVEGAÇÃO TOPO */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <Link
          href="/clientes"
          className="inline-flex items-center gap-1.5 text-xs text-on-surface-variant hover:text-primary transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Voltar para Clientes</span>
        </Link>

        <div className="flex items-center gap-2">
          {/* Botão Secundário: Editar Perfil */}
          <Button
            variant="outline"
            onClick={abrirModalEditarCliente}
            className="rounded-full h-10 px-4 text-xs border border-outline-variant hover:border-primary/50 text-on-surface cursor-pointer gap-1.5"
          >
            <Edit2 className="w-3.5 h-3.5 text-primary" />
            <span>Editar Perfil</span>
          </Button>

          {/* Botão Excluir Cliente */}
          <DeleteButton
            onDelete={() => setModalDeleteClienteOpen(true)}
            title="Excluir cadastro desta cliente"
          />

          {/* ÚNICO BOTÃO PRIMÁRIO */}
          <Button
            onClick={abrirModalNovaFormula}
            className="rounded-full h-10 px-5 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold text-xs shadow-md shadow-primary/20 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5 mr-1" />
            Nova Fórmula Química
          </Button>
        </div>
      </div>

      {/* CARTÃO PERFIL EDITORIAL */}
      <div className="p-6 sm:p-8 rounded-[2.5rem] bg-surface-container-lowest border border-outline-variant/60 shadow-sm relative overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="flex items-start sm:items-center gap-4">
            <Avatar className="w-16 h-16 sm:w-20 sm:h-20 border-2 border-primary/20 shadow-md">
              <AvatarImage src={cliente.foto_url} alt={cliente.nome} />
              <AvatarFallback className="bg-primary/10 text-primary font-bold text-xl">
                {cliente.nome.slice(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>

            <div className="space-y-1">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-xl sm:text-2xl font-bold text-on-surface font-heading">
                  {cliente.nome}
                </h1>
                {tags.map((tag, i) => (
                  <Badge
                    key={i}
                    variant="secondary"
                    className="rounded-full text-[10px] px-2.5 py-0.5 bg-surface-container-high text-primary font-medium"
                  >
                    {tag}
                  </Badge>
                ))}
              </div>

              <div className="flex flex-wrap items-center gap-3 text-xs text-on-surface-variant font-mono">
                <a
                  href={`https://wa.me/55${cliente.telefone.replace(/\D/g, '')}`}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-1 hover:text-emerald-600 transition-colors"
                >
                  <Phone className="w-3 h-3 text-primary" />
                  {cliente.telefone}
                </a>
                {cliente.email && (
                  <span className="flex items-center gap-1">
                    <Mail className="w-3 h-3 text-primary" />
                    {cliente.email}
                  </span>
                )}
                {cliente.data_nascimento && (
                  <span className="text-on-surface-variant">
                    🎂 {new Date(cliente.data_nascimento + 'T12:00:00').toLocaleDateString('pt-BR')}
                  </span>
                )}
                {cliente.signo && (
                  <span className="text-on-surface-variant">✨ {cliente.signo}</span>
                )}
              </div>
            </div>
          </div>

          {/* Métricas */}
          <div className="grid grid-cols-2 sm:grid-cols-2 gap-3 shrink-0">
            <div className="p-3.5 rounded-2xl bg-surface-container-low border border-outline-variant/40 text-center">
              <p className="text-[10px] uppercase tracking-wider text-on-surface-variant font-semibold">
                Total Investido
              </p>
              <p className="text-base font-bold text-primary font-heading mt-0.5">
                R$ {Number(cliente.total_investido).toFixed(2).replace('.', ',')}
              </p>
            </div>
            <div className="p-3.5 rounded-2xl bg-surface-container-low border border-outline-variant/40 text-center">
              <p className="text-[10px] uppercase tracking-wider text-on-surface-variant font-semibold">
                Visitas
              </p>
              <p className="text-base font-bold text-on-surface font-heading mt-0.5">
                {cliente.visitas_realizadas} no ateliê
              </p>
            </div>
          </div>
        </div>

        {/* NOTAS SENSORIAIS & ALERGIAS */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6 pt-6 border-t border-outline-variant/40">
          <div className="p-4 rounded-2xl bg-surface-container-low/80 border border-outline-variant/30 space-y-1">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-primary">
              <Heart className="w-3.5 h-3.5" />
              <span>Preferências Sensoriais & Cuidados</span>
            </div>
            <p className="text-xs text-on-surface leading-relaxed">
              {cliente.preferencias_sensoriais || 'Nenhuma preferência personalizada cadastrada.'}
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-surface-container-low/80 border border-outline-variant/30 space-y-1">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-amber-700">
              <AlertCircle className="w-3.5 h-3.5" />
              <span>Alergias & Restrições Químicas</span>
            </div>
            <p className="text-xs text-on-surface leading-relaxed">
              {cliente.observacoes_alergias || 'Nenhuma restrição química relatada.'}
            </p>
          </div>
        </div>
      </div>

      {/* DOSSIÊ HISTÓRICO DE FÓRMULAS QUÍMICAS */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FlaskConical className="w-5 h-5 text-primary" />
            <h2 className="text-lg font-bold text-on-surface font-heading">
              Histórico Técnico de Fórmulas
            </h2>
          </div>
          <span className="text-xs text-on-surface-variant font-medium">
            {formulas.length} procedimento(s) registrado(s)
          </span>
        </div>

        {formulas.length === 0 ? (
          <div className="p-8 rounded-3xl border border-dashed border-outline-variant text-center bg-surface-container-low/40">
            <FlaskConical className="w-10 h-10 text-on-surface-variant mx-auto mb-2" />
            <p className="text-sm font-semibold text-on-surface">Nenhuma fórmula registrada ainda</p>
            <p className="text-xs text-on-surface-variant mt-1">
              Registre a proporção e oxidante utilizados para manter a consistência de cor da cliente.
            </p>
            <Button
              onClick={abrirModalNovaFormula}
              variant="outline"
              size="sm"
              className="rounded-full mt-4 text-xs"
            >
              Adicionar primeira fórmula
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {formulas.map((formula) => (
              <div
                key={formula.id}
                className="p-5 sm:p-6 rounded-3xl bg-surface-container-lowest border border-outline-variant/60 shadow-sm hover:border-primary/40 transition-all space-y-3"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <span className="text-[11px] font-mono text-primary font-semibold">
                      {new Date(formula.data_aplicacao).toLocaleDateString('pt-BR')}
                    </span>
                    <h3 className="text-base font-bold text-on-surface font-heading">
                      {formula.procedimento}
                    </h3>
                    {formula.profissional_detalhes && (
                      <p className="text-xs text-on-surface-variant">
                        Aplicado por <strong>{formula.profissional_detalhes.nome}</strong>
                      </p>
                    )}
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    {/* Ação de Copiar Fórmula */}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleCopiarFormula(formula)}
                      className="rounded-full text-xs h-8 px-3 border-primary/30 text-primary hover:bg-primary/5 cursor-pointer"
                    >
                      {copiadoId === formula.id ? (
                        <>
                          <Check className="w-3.5 h-3.5 mr-1 text-emerald-600" />
                          Copiada!
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5 mr-1" />
                          Copiar
                        </>
                      )}
                    </Button>

                    {/* Editar Fórmula */}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => abrirModalEditarFormula(formula)}
                      className="rounded-full text-xs h-8 px-3 border-outline-variant hover:border-primary/50 text-on-surface cursor-pointer gap-1"
                      title="Editar Fórmula"
                    >
                      <Edit2 className="w-3.5 h-3.5 text-primary" />
                      <span>Editar</span>
                    </Button>

                    {/* Excluir Fórmula */}
                    <DeleteButton
                      onDelete={() => abrirModalExcluirFormula(formula)}
                      title="Excluir fórmula química"
                    />
                  </div>
                </div>

                {/* Proporções Químicas */}
                <div className="p-4 rounded-2xl bg-surface-container-low font-mono text-xs text-on-surface whitespace-pre-line border border-outline-variant/30 leading-relaxed">
                  {formula.formula_texto}
                </div>

                {/* Badges de Parâmetros Técnicos */}
                <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
                  <Badge variant="outline" className="rounded-full border-primary/40 text-primary bg-primary/5 font-mono">
                    OX: {formula.volumagem_ox}
                  </Badge>
                  <Badge variant="outline" className="rounded-full border-outline-variant font-mono gap-1">
                    <Clock className="w-3 h-3 text-primary" />
                    Pausa: {formula.tempo_pausa_minutos} min
                  </Badge>
                  {formula.fundo_clareamento && (
                    <Badge variant="outline" className="rounded-full border-outline-variant">
                      ✨ {formula.fundo_clareamento}
                    </Badge>
                  )}
                </div>

                {formula.observacoes && (
                  <p className="text-xs text-on-surface-variant pt-2 border-t border-outline-variant/30 leading-relaxed italic">
                    Nota: {formula.observacoes}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* MODAL DE EDIÇÃO DE PERFIL DA CLIENTE */}
      <Dialog open={modalEditClienteOpen} onOpenChange={setModalEditClienteOpen}>
        <DialogContent className="sm:max-w-xl rounded-3xl p-6 bg-surface-container-lowest border-outline-variant max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-on-surface font-heading flex items-center gap-2">
              <Edit2 className="w-5 h-5 text-primary" />
              Editar Perfil da Cliente
            </DialogTitle>
            <DialogDescription className="text-xs text-on-surface-variant">
              Atualize as informações cadastrais, de contato e preferências da cliente.
            </DialogDescription>
          </DialogHeader>

          {erroEditCliente && (
            <div className="p-3.5 rounded-2xl bg-destructive/10 border border-destructive/20 text-destructive text-xs">
              {erroEditCliente}
            </div>
          )}

          <form onSubmit={handleSalvarCliente} className="space-y-4 pt-2">
            <div className="space-y-1.5">
              <Label className="text-xs font-medium text-on-surface-variant">Nome Completo *</Label>
              <Input
                required
                value={editNome}
                onChange={(e) => setEditNome(e.target.value)}
                placeholder="Ex: Beatriz Albuquerque"
                className="rounded-full h-11 text-xs"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-on-surface-variant">WhatsApp / Telefone *</Label>
                <Input
                  required
                  value={editTelefone}
                  onChange={(e) => setEditTelefone(formatarTelefone(e.target.value, editTelefone))}
                  maxLength={15}
                  placeholder="(11) 98765-4321"
                  className="rounded-full h-11 text-xs font-mono"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-on-surface-variant">E-mail</Label>
                <Input
                  type="email"
                  value={editEmail}
                  onChange={(e) => setEditEmail(e.target.value)}
                  placeholder="cliente@email.com"
                  className="rounded-full h-11 text-xs"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-on-surface-variant">Data de Nascimento</Label>
                <Input
                  type="date"
                  value={editDataNascimento}
                  onChange={(e) => setEditDataNascimento(e.target.value)}
                  className="rounded-full h-11 text-xs"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-on-surface-variant">Signo</Label>
                <Input
                  value={editSigno}
                  onChange={(e) => setEditSigno(e.target.value)}
                  placeholder="Ex: Leão, Virgem"
                  className="rounded-full h-11 text-xs"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-medium text-on-surface-variant">
                Tags de Perfil (separadas por vírgula)
              </Label>
              <Input
                value={editTags}
                onChange={(e) => setEditTags(e.target.value)}
                placeholder="Ex: VIP, Mechas, Frequente"
                className="rounded-full h-11 text-xs"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-medium text-on-surface-variant">
                Alergias & Restrições Químicas
              </Label>
              <Textarea
                value={editAlergias}
                onChange={(e) => setEditAlergias(e.target.value)}
                placeholder="Sensibilidade ao pó descolorante, amônia..."
                className="rounded-2xl text-xs resize-none"
                rows={2}
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-medium text-on-surface-variant">
                Preferências Sensoriais & Cuidados
              </Label>
              <Textarea
                value={editPreferencias}
                onChange={(e) => setEditPreferencias(e.target.value)}
                placeholder="Café espresso sem açúcar, água morna no lavatório..."
                className="rounded-2xl text-xs resize-none"
                rows={2}
              />
            </div>

            <div className="pt-3 flex items-center justify-end gap-2.5">
              <Button
                type="button"
                variant="outline"
                onClick={() => setModalEditClienteOpen(false)}
                className="rounded-full text-xs h-10 px-5"
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={savingCliente}
                className="rounded-full text-xs h-10 px-6 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold shadow-md shadow-primary/20 cursor-pointer"
              >
                {savingCliente ? 'Salvando...' : 'Salvar Alterações'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* DIÁLOGO DE CONFIRMAÇÃO DE EXCLUSÃO DA CLIENTE */}
      <Dialog open={modalDeleteClienteOpen} onOpenChange={setModalDeleteClienteOpen}>
        <DialogContent className="sm:max-w-md rounded-3xl p-6 bg-surface-container-lowest border-outline-variant">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-on-surface font-heading flex items-center gap-2 text-destructive">
              <Trash2 className="w-5 h-5" />
              Excluir Cadastro da Cliente
            </DialogTitle>
            <DialogDescription className="text-xs text-on-surface-variant">
              Tem certeza que deseja remover o cadastro de <strong>{cliente.nome}</strong>? Todas as fórmulas químicas e registros vinculados serão excluídos permanentemente.
            </DialogDescription>
          </DialogHeader>

          <div className="pt-3 flex items-center justify-end gap-2.5">
            <Button
              type="button"
              variant="outline"
              onClick={() => setModalDeleteClienteOpen(false)}
              className="rounded-full text-xs h-10 px-5"
            >
              Cancelar
            </Button>
            <Button
              type="button"
              disabled={excluindoCliente}
              onClick={handleConfirmarExclusaoCliente}
              className="rounded-full text-xs h-10 px-5 bg-destructive hover:bg-destructive/90 text-white font-semibold cursor-pointer"
            >
              {excluindoCliente ? 'Excluindo...' : 'Confirmar Exclusão'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* MODAL FÓRMULA QUÍMICA (CRIAR / EDITAR) */}
      <Dialog open={modalFormulaOpen} onOpenChange={setModalFormulaOpen}>
        <DialogContent className="sm:max-w-lg rounded-3xl p-6 bg-surface-container-lowest border-outline-variant max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-on-surface font-heading flex items-center gap-2">
              <FlaskConical className="w-5 h-5 text-primary" />
              {editingFormula ? 'Editar Fórmula Técnica' : 'Registrar Fórmula Técnica'}
            </DialogTitle>
            <DialogDescription className="text-xs text-on-surface-variant">
              Guarde proporções de pós, colorações, tonalizantes e oxidantes para este atendimento.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSalvarFormula} className="space-y-4 pt-2">
            <div className="space-y-1.5">
              <Label className="text-xs font-medium text-on-surface-variant">Procedimento</Label>
              <Input
                required
                value={formProcedimento}
                onChange={(e) => setFormProcedimento(e.target.value)}
                placeholder="Ex: Mechas Globais Pérola"
                className="rounded-full h-11 text-xs"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-on-surface-variant">Profissional Responsável</Label>
                <Select
                  value={formProfissional ? String(formProfissional) : 'sem_especifico'}
                  onValueChange={(val) => setFormProfissional(val === 'sem_especifico' ? '' : Number(val))}
                >
                  <SelectTrigger className="rounded-full h-11 text-xs">
                    <SelectValue placeholder="Selecione..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="sem_especifico" className="text-xs">Equipe Camilo Studio</SelectItem>
                    {equipe.map((p) => (
                      <SelectItem key={p.id} value={String(p.id)} className="text-xs">
                        {p.nome} ({p.cargo})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-on-surface-variant">Data da Aplicação</Label>
                <Input
                  type="date"
                  required
                  value={formDataAplicacao}
                  onChange={(e) => setFormDataAplicacao(e.target.value)}
                  className="rounded-full h-11 text-xs"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-medium text-on-surface-variant">
                Mistura Quimica / Gramaturas (Exato)
              </Label>
              <Textarea
                required
                rows={3}
                value={formFormulaTexto}
                onChange={(e) => setFormFormulaTexto(e.target.value)}
                placeholder="Ex: BlondorPlex 1:2 (40g pó + 80g OX)&#10;Tonalização: 9V (20g) + 9GI (20g)"
                className="rounded-2xl font-mono text-xs"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-on-surface-variant">Volumagem OX</Label>
                <Input
                  value={formVolumagemOx}
                  onChange={(e) => setFormVolumagemOx(e.target.value)}
                  placeholder="20 vol"
                  className="rounded-full h-11 text-xs"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-on-surface-variant">Pausa (min)</Label>
                <Input
                  type="number"
                  value={formTempoPausa}
                  onChange={(e) => setFormTempoPausa(e.target.value)}
                  placeholder="45"
                  className="rounded-full h-11 text-xs font-mono"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-on-surface-variant">Fundo de Clareamento</Label>
                <Input
                  value={formFundo}
                  onChange={(e) => setFormFundo(e.target.value)}
                  placeholder="Fundo 9 / 10"
                  className="rounded-full h-11 text-xs"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-medium text-on-surface-variant">Observações / Resultado</Label>
              <Textarea
                rows={2}
                value={formObservacoes}
                onChange={(e) => setFormObservacoes(e.target.value)}
                placeholder="Resultado bege frio com excelente integridade da fibra."
                className="rounded-2xl text-xs"
              />
            </div>

            <div className="pt-3 flex items-center justify-end gap-2.5">
              <Button
                type="button"
                variant="outline"
                onClick={() => setModalFormulaOpen(false)}
                className="rounded-full text-xs h-10 px-5"
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={savingFormula}
                className="rounded-full text-xs h-10 px-6 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold shadow-md shadow-primary/20 cursor-pointer"
              >
                {savingFormula ? 'Salvando...' : editingFormula ? 'Salvar Alterações' : 'Salvar Fórmula no Dossiê'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* DIÁLOGO DE CONFIRMAÇÃO DE EXCLUSÃO DE FÓRMULA */}
      <Dialog open={modalDeleteFormulaOpen} onOpenChange={setModalDeleteFormulaOpen}>
        <DialogContent className="sm:max-w-md rounded-3xl p-6 bg-surface-container-lowest border-outline-variant">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-on-surface font-heading flex items-center gap-2 text-destructive">
              <Trash2 className="w-5 h-5" />
              Excluir Fórmula Química
            </DialogTitle>
            <DialogDescription className="text-xs text-on-surface-variant">
              Tem certeza que deseja remover esta fórmula química? O histórico técnico deste procedimento não poderá ser recuperado.
            </DialogDescription>
          </DialogHeader>

          {formulaParaExcluir && (
            <div className="p-4 rounded-2xl bg-surface-container-low border border-outline-variant/40 space-y-1 text-xs">
              <p className="font-semibold text-on-surface">{formulaParaExcluir.procedimento}</p>
              <p className="text-on-surface-variant">
                Data: {new Date(formulaParaExcluir.data_aplicacao).toLocaleDateString('pt-BR')}
              </p>
              <p className="text-on-surface-variant font-mono truncate">
                {formulaParaExcluir.formula_texto}
              </p>
            </div>
          )}

          <div className="pt-3 flex items-center justify-end gap-2.5">
            <Button
              type="button"
              variant="outline"
              onClick={() => setModalDeleteFormulaOpen(false)}
              className="rounded-full text-xs h-10 px-5"
            >
              Cancelar
            </Button>
            <Button
              type="button"
              disabled={excluindoFormula}
              onClick={handleConfirmarExclusaoFormula}
              className="rounded-full text-xs h-10 px-5 bg-destructive hover:bg-destructive/90 text-white font-semibold cursor-pointer"
            >
              {excluindoFormula ? 'Excluindo...' : 'Confirmar Exclusão'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
