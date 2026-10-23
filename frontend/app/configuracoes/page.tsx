'use client';

import React, { useEffect, useState } from 'react';
import {
  Building2,
  MessageSquare,
  CheckCircle2,
} from 'lucide-react';
import { api } from '@/lib/api';
import { LoadingState } from '@/components/atoms/LoadingState';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

interface IdentidadeProps {
  nomeAtelie: string;
  setNomeAtelie: (v: string) => void;
  telefone: string;
  setTelefone: (v: string) => void;
  endereco: string;
  setEndereco: (v: string) => void;
}

function BlocoIdentidade(props: IdentidadeProps) {
  const { nomeAtelie, setNomeAtelie, telefone, setTelefone, endereco, setEndereco } = props;
  return (
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
          <Label className="text-xs font-medium text-on-surface-variant">WhatsApp Comercial</Label>
          <Input
            required
            value={telefone}
            onChange={(e) => setTelefone(e.target.value)}
            className="rounded-full h-11 text-xs font-mono"
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
    </div>
  );
}

interface TemplatesProps {
  templateConfirmacao: string;
  setTemplateConfirmacao: (v: string) => void;
  templateLembrete: string;
  setTemplateLembrete: (v: string) => void;
  politica: string;
  setPolitica: (v: string) => void;
}

function BlocoTemplates(props: TemplatesProps) {
  const { templateConfirmacao, setTemplateConfirmacao, templateLembrete, setTemplateLembrete, politica, setPolitica } = props;
  return (
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
  );
}

function ConfiguracoesHeader({ sucesso }: { sucesso: boolean }) {
  return (
    <>
      <div>
        <span className="text-xs uppercase tracking-[0.2em] font-semibold text-primary">Parâmetros do Ateliê</span>
        <h1 className="text-2xl sm:text-3xl font-bold text-on-surface font-heading tracking-tight mt-0.5">Ajustes e Configurações</h1>
        <p className="text-xs sm:text-sm text-on-surface-variant">Personalize a identidade institucional, horários de atendimento e modelos de WhatsApp.</p>
      </div>

      {sucesso && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>Configurações salvas e aplicadas com sucesso!</span>
        </div>
      )}
    </>
  );
}

export default function ConfiguracoesPage() {
  const [loading, setLoading] = useState(true);
  const [salvando, setSalvando] = useState(false);
  const [sucesso, setSucesso] = useState(false);

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
        if (!isMounted) return;
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
      })
      .catch(() => {
        if (isMounted) setLoading(false);
      });
    return () => { isMounted = false; };
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
    } finally {
      setSalvando(false);
    }
  };

  if (loading) {
    return <LoadingState message="Carregando ajustes e configurações..." />;
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <ConfiguracoesHeader sucesso={sucesso} />

      <form onSubmit={handleSalvar} className="space-y-6">
        <BlocoIdentidade
          nomeAtelie={nomeAtelie}
          setNomeAtelie={setNomeAtelie}
          telefone={telefone}
          setTelefone={setTelefone}
          endereco={endereco}
          setEndereco={setEndereco}
        />
        <BlocoTemplates
          templateConfirmacao={templateConfirmacao}
          setTemplateConfirmacao={setTemplateConfirmacao}
          templateLembrete={templateLembrete}
          setTemplateLembrete={setTemplateLembrete}
          politica={politica}
          setPolitica={setPolitica}
        />
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

