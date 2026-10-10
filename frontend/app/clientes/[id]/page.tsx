'use client';

import React, { useEffect, useState, use } from 'react';
import Link from 'next/link';
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
} from 'lucide-react';
import { api, Cliente, FormulaQuimica, Profissional } from '@/lib/api';
import { LoadingState } from '@/components/atoms/LoadingState';
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

export default function ClienteDetalhesPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const clienteId = parseInt(id, 10);

  const [cliente, setCliente] = useState<Cliente | null>(null);
  const [formulas, setFormulas] = useState<FormulaQuimica[]>([]);
  const [equipe, setEquipe] = useState<Profissional[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal Nova Fórmula
  const [modalFormulaOpen, setModalFormulaOpen] = useState(false);
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

  const handleSalvarFormula = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingFormula(true);
    try {
      await api.createFormula({
        cliente: clienteId,
        profissional: formProfissional ? Number(formProfissional) : undefined,
        data_aplicacao: formDataAplicacao,
        procedimento: formProcedimento,
        formula_texto: formFormulaTexto,
        volumagem_ox: formVolumagemOx,
        tempo_pausa_minutos: parseInt(formTempoPausa, 10) || 45,
        fundo_clareamento: formFundo,
        observacoes: formObservacoes,
      });
      setModalFormulaOpen(false);
      setFormFormulaTexto('');
      setFormObservacoes('');
      await recarregarFormulas();
    } catch (err) {
      console.error('Erro ao salvar fórmula:', err);
    } finally {
      setSavingFormula(false);
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
      <div className="flex items-center justify-between">
        <Link
          href="/clientes"
          className="inline-flex items-center gap-1.5 text-xs text-on-surface-variant hover:text-primary transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Voltar para Clientes</span>
        </Link>

        {/* ÚNICO BOTÃO PRIMÁRIO */}
        <Button
          onClick={() => setModalFormulaOpen(true)}
          className="rounded-full h-10 px-5 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold text-xs shadow-md shadow-primary/20 cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5 mr-1" />
          Nova Fórmula Química
        </Button>
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
                <span className="flex items-center gap-1">
                  <Phone className="w-3 h-3 text-primary" />
                  {cliente.telefone}
                </span>
                {cliente.email && (
                  <span className="flex items-center gap-1">
                    <Mail className="w-3 h-3 text-primary" />
                    {cliente.email}
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
              {cliente.preferencias_sensoriais || 'Nenhuma preferência cadastrada.'}
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-surface-container-low/80 border border-outline-variant/30 space-y-1">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-amber-600">
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
              onClick={() => setModalFormulaOpen(true)}
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

                  {/* Ação de Copiar Fórmula */}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleCopiarFormula(formula)}
                    className="rounded-full text-xs h-8 px-3.5 border-primary/30 text-primary hover:bg-primary/5 cursor-pointer shrink-0"
                  >
                    {copiadoId === formula.id ? (
                      <>
                        <Check className="w-3.5 h-3.5 mr-1 text-emerald-600" />
                        Fórmula Copiada!
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5 mr-1" />
                        Copiar Fórmula
                      </>
                    )}
                  </Button>
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

      {/* MODAL NOVA FÓRMULA QUÍMICA */}
      <Dialog open={modalFormulaOpen} onOpenChange={setModalFormulaOpen}>
        <DialogContent className="sm:max-w-lg rounded-3xl p-6 bg-surface-container-lowest border-outline-variant max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-on-surface font-heading">
              Registrar Fórmula Técnica
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
                placeholder="Ex: Morena Iluminada Caramelo"
                className="rounded-full h-11 text-xs"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
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

              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-on-surface-variant">Profissional</Label>
                <select
                  value={formProfissional}
                  onChange={(e) => setFormProfissional(e.target.value ? Number(e.target.value) : '')}
                  className="w-full h-11 px-3 rounded-full border border-outline-variant bg-surface-container-lowest text-xs text-on-surface focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="">Selecione o profissional...</option>
                  {equipe.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.nome}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-medium text-on-surface-variant">
                Fórmula & Gramaturas (Proporções exatas)
              </Label>
              <Textarea
                rows={3}
                required
                value={formFormulaTexto}
                onChange={(e) => setFormFormulaTexto(e.target.value)}
                placeholder="Ex: Blondme (40g) + OX 20 vol (80g)&#10;Tonalização: 9.5-1 (25g) + Gel Ativador (50g)"
                className="rounded-2xl text-xs font-mono resize-none"
              />
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-on-surface-variant">Oxidante (OX)</Label>
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
                <Label className="text-xs font-medium text-on-surface-variant">Fundo Alcançado</Label>
                <Input
                  value={formFundo}
                  onChange={(e) => setFormFundo(e.target.value)}
                  placeholder="Fundo 9 / 10"
                  className="rounded-full h-11 text-xs"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-medium text-on-surface-variant">
                Observações do Fio & Cuidados Pós-Química
              </Label>
              <Textarea
                rows={2}
                value={formObservacoes}
                onChange={(e) => setFormObservacoes(e.target.value)}
                placeholder="Cabelo manteve elasticidade, uso de cronograma nas pontas..."
                className="rounded-2xl text-xs resize-none"
              />
            </div>

            <div className="pt-3 flex justify-end gap-2">
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
                className="rounded-full text-xs h-10 px-6 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold shadow-md shadow-primary/20"
              >
                {savingFormula ? 'Salvando...' : 'Salvar Fórmula'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
