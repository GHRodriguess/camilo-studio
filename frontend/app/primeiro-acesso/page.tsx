'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Lock, Loader2, KeyRound } from 'lucide-react';
import { api } from '@/lib/api';
import { useAuth } from '@/lib/auth-context';
import { Logo } from '@/components/atoms/Logo';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

function PrimeiroAcessoHeader() {
  return (
    <div className="flex flex-col items-center text-center mb-8">
      <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center text-primary mb-4">
        <KeyRound className="w-7 h-7" />
      </div>
      <Logo size="md" variant="full" className="mb-2" />
      <h1 className="text-xl font-semibold text-on-surface font-heading">
        Primeiro Acesso ao Sistema
      </h1>
      <p className="text-xs text-on-surface-variant mt-1.5 max-w-xs">
        Por segurança, cadastre uma nova senha pessoal para continuar acessando o ateliê.
      </p>
    </div>
  );
}

function PrimeiroAcessoForm({
  novaSenha,
  setNovaSenha,
  confirmacaoSenha,
  setConfirmacaoSenha,
  loading,
  onSubmit,
}: {
  novaSenha: string;
  setNovaSenha: (v: string) => void;
  confirmacaoSenha: string;
  setConfirmacaoSenha: (v: string) => void;
  loading: boolean;
  onSubmit: (e: React.FormEvent) => void;
}) {
  return (
    <form onSubmit={onSubmit} className="space-y-5">
      <div className="space-y-1.5">
        <Label htmlFor="nova_senha" className="text-xs font-medium text-on-surface-variant">
          Nova Senha Pessoal
        </Label>
        <div className="relative">
          <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-on-surface-variant/70" />
          <Input
            id="nova_senha"
            type="password"
            required
            value={novaSenha}
            onChange={(e) => setNovaSenha(e.target.value)}
            placeholder="Mínimo de 6 caracteres"
            className="pl-10 h-12 rounded-full border-outline-variant bg-surface-container-lowest focus-visible:ring-primary text-sm shadow-sm"
          />
        </div>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="confirmacao_senha" className="text-xs font-medium text-on-surface-variant">
          Confirmar Nova Senha
        </Label>
        <div className="relative">
          <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-on-surface-variant/70" />
          <Input
            id="confirmacao_senha"
            type="password"
            required
            value={confirmacaoSenha}
            onChange={(e) => setConfirmacaoSenha(e.target.value)}
            placeholder="Repita a nova senha"
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
            Salvando senha...
          </span>
        ) : (
          'Salvar Nova Senha & Acessar'
        )}
      </Button>
    </form>
  );
}

export default function PrimeiroAcessoPage() {
  const router = useRouter();
  const { refreshUser } = useAuth();
  const [novaSenha, setNovaSenha] = useState('');
  const [confirmacaoSenha, setConfirmacaoSenha] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (novaSenha.length < 6) {
      setError('A nova senha deve possuir pelo menos 6 caracteres.');
      return;
    }
    if (novaSenha !== confirmacaoSenha) {
      setError('As senhas digitadas não coincidem.');
      return;
    }
    setLoading(true);
    try {
      await api.redefinirSenhaPrimeiroAcesso({
        nova_senha: novaSenha,
        confirmacao_senha: confirmacaoSenha,
      });
      await refreshUser();
      router.push('/agenda');
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Erro ao redefinir a senha.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 sm:p-6 bg-gradient-to-b from-surface via-surface-container-low to-surface-container">
      <div className="w-full max-w-md bg-surface-container-lowest/90 backdrop-blur-xl rounded-[2.5rem] border border-outline-variant/60 p-8 sm:p-10 shadow-xl shadow-primary/5 relative">
        <PrimeiroAcessoHeader />
        {error && (
          <div className="mb-6 p-4 rounded-2xl bg-destructive/10 border border-destructive/20 text-destructive text-xs">
            {error}
          </div>
        )}
        <PrimeiroAcessoForm
          novaSenha={novaSenha}
          setNovaSenha={setNovaSenha}
          confirmacaoSenha={confirmacaoSenha}
          setConfirmacaoSenha={setConfirmacaoSenha}
          loading={loading}
          onSubmit={handleSubmit}
        />
      </div>
    </div>
  );
}
