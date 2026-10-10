'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Mail, ArrowLeft, Loader2, CheckCircle2 } from 'lucide-react';
import { api } from '@/lib/api';
import { Logo } from '@/components/atoms/Logo';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function EsqueciSenhaPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Campos para confirmação direta caso o usuário já tenha o token
  const [tokenInput, setTokenInput] = useState('');
  const [novaSenha, setNovaSenha] = useState('');
  const [confirmacao, setConfirmacao] = useState('');
  const [successReset, setSuccessReset] = useState(false);

  const handleSubmitEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await api.esqueciSenha(email);
      setSubmitted(true);
      if (res.dev_token) {
        setTokenInput(res.dev_token);
      }
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Erro ao enviar solicitação.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (novaSenha !== confirmacao) {
      setError('As senhas não coincidem.');
      return;
    }

    setLoading(true);
    try {
      await api.confirmarRedefinicaoSenha({
        email,
        token: tokenInput,
        nova_senha: novaSenha,
        confirmacao_senha: confirmacao,
      });
      setSuccessReset(true);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Token inválido ou expirado.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 sm:p-6 bg-gradient-to-b from-surface via-surface-container-low to-surface-container">
      <div className="w-full max-w-md bg-surface-container-lowest/90 backdrop-blur-xl rounded-[2.5rem] border border-outline-variant/60 p-8 sm:p-10 shadow-xl shadow-primary/5 relative">
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
            Informe o e-mail cadastrado para receber instruções de redefinição da sua senha.
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-2xl bg-destructive/10 border border-destructive/20 text-destructive text-xs">
            {error}
          </div>
        )}

        {successReset ? (
          <div className="text-center py-6 space-y-4">
            <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center text-primary mx-auto">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h2 className="text-base font-semibold text-on-surface">Senha Redefinida!</h2>
            <p className="text-xs text-on-surface-variant">
              Sua senha foi atualizada com sucesso. Você já pode fazer login no ateliê.
            </p>
            <Link
              href="/login"
              className="inline-flex items-center justify-center w-full rounded-full mt-4 h-11 bg-primary text-primary-foreground font-semibold text-xs shadow-md shadow-primary/20"
            >
              Ir para o Login
            </Link>
          </div>
        ) : !submitted ? (
          <form onSubmit={handleSubmitEmail} className="space-y-5">
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
                  Enviando instruções...
                </span>
              ) : (
                'Enviar Instruções'
              )}
            </Button>
          </form>
        ) : (
          <div className="space-y-6">
            <div className="p-4 rounded-2xl bg-surface-container border border-outline-variant/60 text-center space-y-2">
              <CheckCircle2 className="w-6 h-6 text-primary mx-auto" />
              <p className="text-xs font-semibold text-on-surface">Instruções enviadas para {email}</p>
              <p className="text-[11px] text-on-surface-variant">
                Verifique sua caixa de entrada e siga as orientações para redefinir a sua senha.
              </p>
            </div>

            {/* Formulário de inserção do token */}
            <form onSubmit={handleConfirmReset} className="space-y-4 pt-2">
              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-on-surface-variant">
                  Código / Token de Redefinição
                </Label>
                <Input
                  type="text"
                  required
                  value={tokenInput}
                  onChange={(e) => setTokenInput(e.target.value)}
                  placeholder="Cole o token recebido"
                  className="h-11 rounded-full text-xs"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-on-surface-variant">Nova Senha</Label>
                <Input
                  type="password"
                  required
                  value={novaSenha}
                  onChange={(e) => setNovaSenha(e.target.value)}
                  placeholder="Mínimo 6 caracteres"
                  className="h-11 rounded-full text-xs"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-on-surface-variant">Confirmar Senha</Label>
                <Input
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
                className="w-full h-11 rounded-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold text-xs shadow-md shadow-primary/25 cursor-pointer mt-2"
              >
                {loading ? 'Redefinindo...' : 'Confirmar e Criar Nova Senha'}
              </Button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
