'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Mail, ArrowLeft, Loader2, CheckCircle2, ShieldAlert } from 'lucide-react';
import { api } from '@/lib/api';
import { Logo } from '@/components/atoms/Logo';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

function EsqueciSenhaHeader({ submitted }: { submitted: boolean }) {
  return (
    <>
      <Link
        href="/login"
        className="inline-flex items-center gap-1.5 text-xs text-on-surface-variant hover:text-primary transition-colors mb-6 cursor-pointer"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        <span>Voltar para o login</span>
      </Link>
      <div className="flex flex-col items-center text-center mb-8">
        <Logo size="md" variant="full" className="mb-2" />
        <h1 className="text-xl font-semibold text-on-surface font-heading">
          Recuperação de Acesso
        </h1>
        <p className="text-xs text-on-surface-variant mt-1.5 max-w-xs">
          {submitted
            ? 'Digite o código de 6 dígitos que enviamos para seu e-mail e crie sua nova senha.'
            : 'Informe o e-mail cadastrado para receber um código de uso único e redefinir sua senha.'}
        </p>
      </div>
    </>
  );
}

function SuccessResetView() {
  return (
    <div className="text-center py-6 space-y-4">
      <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center text-primary mx-auto">
        <CheckCircle2 className="w-8 h-8" />
      </div>
      <h2 className="text-base font-semibold text-on-surface">Senha Redefinida!</h2>
      <p className="text-xs text-on-surface-variant">
        Sua senha foi atualizada com sucesso. Você já pode fazer login no ateliê com a sua nova credencial.
      </p>
      <Link
        href="/login"
        className="inline-flex items-center justify-center w-full rounded-full mt-4 h-11 bg-primary text-primary-foreground font-semibold text-xs shadow-md shadow-primary/20 hover:bg-primary/90 transition-all cursor-pointer"
      >
        Ir para o Login
      </Link>
    </div>
  );
}

function SolicitarCodigoForm({
  email,
  setEmail,
  loading,
  onSubmit,
}: {
  email: string;
  setEmail: (v: string) => void;
  loading: boolean;
  onSubmit: (e: React.FormEvent) => void;
}) {
  return (
    <form onSubmit={onSubmit} className="space-y-5">
      <div className="space-y-1.5">
        <Label htmlFor="email" className="text-xs font-medium text-on-surface-variant">
          Seu E-mail Cadastrado
        </Label>
        <div className="relative">
          <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-on-surface-variant/70" />
          <Input
            id="email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="usuario@camilostudio.com"
            className="pl-10 h-12 rounded-full border-outline-variant bg-surface-container-lowest focus-visible:ring-primary text-sm shadow-sm"
          />
        </div>
      </div>

      <Button
        type="submit"
        disabled={loading}
        className="w-full h-12 rounded-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold text-sm shadow-md shadow-primary/25 cursor-pointer mt-2"
      >
        {loading ? (
          <span className="flex items-center gap-2">
            <Loader2 className="w-4 h-4 animate-spin" />
            Enviando código...
          </span>
        ) : (
          'Enviar Código de Recuperação'
        )}
      </Button>
    </form>
  );
}

interface ConfirmarProps {
  email: string;
  codigoInput: string;
  setCodigoInput: (v: string) => void;
  novaSenha: string;
  setNovaSenha: (v: string) => void;
  confirmacao: string;
  setConfirmacao: (v: string) => void;
  loading: boolean;
  onSubmit: (e: React.FormEvent) => void;
  onResetEmail: () => void;
}

function ConfirmarCodigoForm(props: ConfirmarProps) {
  const { email, codigoInput, setCodigoInput, novaSenha, setNovaSenha, confirmacao, setConfirmacao, loading, onSubmit, onResetEmail } = props;
  return (
    <div className="space-y-5">
      <div className="p-4 rounded-2xl bg-surface-container border border-outline-variant/60 text-center space-y-1.5">
        <CheckCircle2 className="w-5 h-5 text-primary mx-auto" />
        <p className="text-xs font-semibold text-on-surface">Código enviado para {email}</p>
        <p className="text-[11px] text-on-surface-variant">
          Verifique sua caixa de entrada (e spam). O código é válido por <strong className="text-primary font-medium">15 minutos</strong>.
        </p>
      </div>

      <form onSubmit={onSubmit} className="space-y-4 pt-1">
        <div className="space-y-1.5">
          <Label htmlFor="codigo" className="text-xs font-medium text-on-surface-variant">
            Código de 6 Dígitos
          </Label>
          <Input
            id="codigo"
            type="text"
            required
            maxLength={6}
            value={codigoInput}
            onChange={(e) => setCodigoInput(e.target.value.replace(/\D/g, ''))}
            placeholder="000000"
            className="h-12 rounded-2xl text-center text-lg font-mono tracking-[0.35em] font-semibold border-primary/40 focus-visible:ring-primary"
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="novaSenha" className="text-xs font-medium text-on-surface-variant">Nova Senha</Label>
          <Input
            id="novaSenha"
            type="password"
            required
            value={novaSenha}
            onChange={(e) => setNovaSenha(e.target.value)}
            placeholder="Mínimo de 6 caracteres"
            className="h-11 rounded-full text-xs"
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="confirmacao" className="text-xs font-medium text-on-surface-variant">Confirmar Nova Senha</Label>
          <Input
            id="confirmacao"
            type="password"
            required
            value={confirmacao}
            onChange={(e) => setConfirmacao(e.target.value)}
            placeholder="Repita a nova senha"
            className="h-11 rounded-full text-xs"
          />
        </div>

        <Button
          type="submit"
          disabled={loading}
          className="w-full h-12 rounded-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold text-xs shadow-md shadow-primary/25 cursor-pointer mt-2"
        >
          {loading ? (
            <span className="flex items-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin" />
              Validando e atualizando...
            </span>
          ) : (
            'Confirmar e Atualizar Senha'
          )}
        </Button>

        <div className="text-center pt-2">
          <button
            type="button"
            onClick={onResetEmail}
            className="text-[11px] text-on-surface-variant hover:text-primary transition-colors cursor-pointer"
          >
            Não recebeu o e-mail? Solicitar outro código
          </button>
        </div>
      </form>
    </div>
  );
}

export default function EsqueciSenhaPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [codigoInput, setCodigoInput] = useState('');
  const [novaSenha, setNovaSenha] = useState('');
  const [confirmacao, setConfirmacao] = useState('');
  const [successReset, setSuccessReset] = useState(false);

  const handleSubmitEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await api.esqueciSenha(email.trim());
      setSubmitted(true);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Erro ao enviar solicitação.');
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const codigoLimpo = codigoInput.trim();
    if (codigoLimpo.length !== 6) {
      setError('Por favor, informe o código de 6 dígitos recebido por e-mail.');
      return;
    }
    if (novaSenha.length < 6) {
      setError('A nova senha deve ter no mínimo 6 caracteres.');
      return;
    }
    if (novaSenha !== confirmacao) {
      setError('As senhas digitadas não coincidem.');
      return;
    }
    setLoading(true);
    try {
      await api.confirmarRedefinicaoSenha({
        email: email.trim(),
        codigo: codigoLimpo,
        nova_senha: novaSenha,
        confirmacao_senha: confirmacao,
      });
      setSuccessReset(true);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Código inválido ou expirado.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 sm:p-6 bg-gradient-to-b from-surface via-surface-container-low to-surface-container">
      <div className="w-full max-w-md bg-surface-container-lowest/90 backdrop-blur-xl rounded-[2.5rem] border border-outline-variant/60 p-8 sm:p-10 shadow-xl shadow-primary/5 relative">
        <EsqueciSenhaHeader submitted={submitted} />
        {error && (
          <div className="mb-6 p-4 rounded-2xl bg-destructive/10 border border-destructive/20 text-destructive text-xs flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}
        {successReset ? (
          <SuccessResetView />
        ) : !submitted ? (
          <SolicitarCodigoForm
            email={email}
            setEmail={setEmail}
            loading={loading}
            onSubmit={handleSubmitEmail}
          />
        ) : (
          <ConfirmarCodigoForm
            email={email}
            codigoInput={codigoInput}
            setCodigoInput={setCodigoInput}
            novaSenha={novaSenha}
            setNovaSenha={setNovaSenha}
            confirmacao={confirmacao}
            setConfirmacao={setConfirmacao}
            loading={loading}
            onSubmit={handleConfirmReset}
            onResetEmail={() => setSubmitted(false)}
          />
        )}
      </div>
    </div>
  );
}
