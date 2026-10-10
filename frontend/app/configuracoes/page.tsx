'use client';

import React, { useEffect, useState } from 'react';
import {
  Building2,
  MessageSquare,
  Mail,
  CheckCircle2,
} from 'lucide-react';
import { api } from '@/lib/api';
import { LoadingState } from '@/components/atoms/LoadingState';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

export default function ConfiguracoesPage() {
  const [loading, setLoading] = useState(true);
  const [salvando, setSalvando] = useState(false);
  const [sucesso, setSucesso] = useState(false);

  // Form State
  const [nomeAtelie, setNomeAtelie] = useState('');
  const [slogan, setSlogan] = useState('');
  const [telefone, setTelefone] = useState('');
  const [email, setEmail] = useState('');
  const [endereco, setEndereco] = useState('');
  const [horario, setHorario] = useState('');
  const [templateConfirmacao, setTemplateConfirmacao] = useState('');
  const [templateLembrete, setTemplateLembrete] = useState('');
  const [politica, setPolitica] = useState('');

  useEffect(() => {
    let isMounted = true;
    api.getConfiguracoes()
      .then((data) => {
        if (isMounted) {
          setNomeAtelie(data.nome_atelie);
          setSlogan(data.slogan);
          setTelefone(data.telefone);
          setEmail(data.email);
          setEndereco(data.endereco);
          setHorario(data.horario_funcionamento);
          setTemplateConfirmacao(data.template_confirmacao);
          setTemplateLembrete(data.template_lembrete);
          setPolitica(data.politica_cancelamento);
          setLoading(false);
        }
      })
      .catch((err) => {
        if (isMounted) {
          console.error('Erro ao carregar configurações:', err);
          setLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const handleSalvar = async (e: React.FormEvent) => {
    e.preventDefault();
    setSalvando(true);
    setSucesso(false);

    try {
      await api.updateConfiguracoes({
        nome_atelie: nomeAtelie,
        slogan,
        telefone,
        email,
        endereco,
        horario_funcionamento: horario,
        template_confirmacao: templateConfirmacao,
        template_lembrete: templateLembrete,
        politica_cancelamento: politica,
      });
      setSucesso(true);
      setTimeout(() => setSucesso(false), 4000);
    } catch (err) {
      console.error('Erro ao salvar configurações:', err);
    } finally {
      setSalvando(false);
    }
  };

  if (loading) {
    return <LoadingState message="Carregando ajustes e configurações..." />;
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* CABEÇALHO */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs uppercase tracking-[0.2em] font-semibold text-primary">
            Parâmetros do Ateliê
          </span>
          <h1 className="text-2xl sm:text-3xl font-bold text-on-surface font-heading tracking-tight mt-0.5">
            Ajustes e Configurações
          </h1>
          <p className="text-xs sm:text-sm text-on-surface-variant">
            Personalize a identidade institucional, horários de atendimento e modelos de WhatsApp.
          </p>
        </div>
      </div>

      {sucesso && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>Configurações salvas e aplicadas com sucesso!</span>
        </div>
      )}

      <form onSubmit={handleSalvar} className="space-y-6">
        {/* BLOCO 1: DADOS INSTITUCIONAIS */}
        <div className="p-6 sm:p-8 rounded-[2.5rem] bg-surface-container-lowest border border-outline-variant/60 shadow-sm space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-outline-variant/40">
            <Building2 className="w-5 h-5 text-primary" />
            <h2 className="text-base font-bold text-on-surface font-heading">
              Identidade Institucional
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label className="text-xs font-medium text-on-surface-variant">Nome do Ateliê</Label>
              <Input
                required
                value={nomeAtelie}
                onChange={(e) => setNomeAtelie(e.target.value)}
                className="rounded-full h-11 text-xs"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-medium text-on-surface-variant">Slogan / Assinatura</Label>
              <Input
                value={slogan}
                onChange={(e) => setSlogan(e.target.value)}
                className="rounded-full h-11 text-xs"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label className="text-xs font-medium text-on-surface-variant">WhatsApp Comercial</Label>
              <Input
                required
                value={telefone}
                onChange={(e) => setTelefone(e.target.value)}
                className="rounded-full h-11 text-xs font-mono"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-medium text-on-surface-variant">E-mail Institucional</Label>
              <Input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="rounded-full h-11 text-xs"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-medium text-on-surface-variant">Endereço Completo</Label>
            <Input
              required
              value={endereco}
              onChange={(e) => setEndereco(e.target.value)}
              className="rounded-full h-11 text-xs"
            />
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-medium text-on-surface-variant">Horário de Funcionamento</Label>
            <Input
              value={horario}
              onChange={(e) => setHorario(e.target.value)}
              className="rounded-full h-11 text-xs"
            />
          </div>
        </div>

        {/* BLOCO 2: TEMPLATES WHATSAPP */}
        <div className="p-6 sm:p-8 rounded-[2.5rem] bg-surface-container-lowest border border-outline-variant/60 shadow-sm space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-outline-variant/40">
            <MessageSquare className="w-5 h-5 text-emerald-600" />
            <h2 className="text-base font-bold text-on-surface font-heading">
              Modelos de Mensagem WhatsApp
            </h2>
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <Label className="text-xs font-medium text-on-surface-variant">
                Template de Confirmação de Agendamento
              </Label>
              <span className="text-[10px] text-on-surface-variant font-mono">
                Variáveis: &#123;cliente&#125;, &#123;data&#125;, &#123;horario&#125;, &#123;profissional&#125;, &#123;servicos&#125;, &#123;valor&#125;
              </span>
            </div>
            <Textarea
              rows={4}
              value={templateConfirmacao}
              onChange={(e) => setTemplateConfirmacao(e.target.value)}
              className="rounded-2xl text-xs font-sans resize-none leading-relaxed"
            />
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-medium text-on-surface-variant">
              Template de Lembrete 24 Horas
            </Label>
            <Textarea
              rows={3}
              value={templateLembrete}
              onChange={(e) => setTemplateLembrete(e.target.value)}
              className="rounded-2xl text-xs font-sans resize-none leading-relaxed"
            />
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-medium text-on-surface-variant">
              Política de Cancelamento (Exibida em Comprovantes)
            </Label>
            <Textarea
              rows={2}
              value={politica}
              onChange={(e) => setPolitica(e.target.value)}
              className="rounded-2xl text-xs font-sans resize-none"
            />
          </div>
        </div>

        {/* BLOCO 3: INTEGRAÇÃO SMTP & EMAIL */}
        <div className="p-6 rounded-3xl bg-surface-container-low border border-outline-variant/40 space-y-2">
          <div className="flex items-center gap-2 text-xs font-semibold text-on-surface">
            <Mail className="w-4 h-4 text-primary" />
            <span>Serviço de Envio de E-mails (SMTP)</span>
          </div>
          <p className="text-xs text-on-surface-variant leading-relaxed">
            As credenciais seguras de envio de e-mails para primeiro acesso e recuperação de senha
            são gerenciadas através de variáveis de ambiente no arquivo <code>backend/.env</code>,
            garantindo total conformidade de segurança.
          </p>
        </div>

        {/* ÚNICO BOTÃO PRIMÁRIO */}
        <Button
          type="submit"
          disabled={salvando}
          className="w-full h-12 rounded-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold shadow-md shadow-primary/25 text-sm cursor-pointer"
        >
          {salvando ? 'Salvando ajustes...' : 'Salvar Configurações do Ateliê'}
        </Button>
      </form>
    </div>
  );
}
