'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Eye, EyeOff, Loader2, Lock, Mail } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import { Logo } from '@/components/atoms/Logo';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function LoginPage() {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await login({ email, password });
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Ocorreu um erro ao tentar entrar. Tente novamente.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 sm:p-6 bg-gradient-to-b from-surface via-surface-container-low to-surface-container">
      {/* Container Editorial Mobile/Desktop */}
      <div className="w-full max-w-md bg-surface-container-lowest/90 backdrop-blur-xl rounded-[2.5rem] border border-outline-variant/60 p-8 sm:p-10 shadow-xl shadow-primary/5 relative overflow-hidden">
        {/* Glow sutil de fundo */}
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-secondary/10 rounded-full blur-3xl pointer-events-none" />

        {/* Cabeçalho */}
        <div className="flex flex-col items-center text-center mb-8 relative">
          <Logo size="lg" variant="full" className="mb-4" />
          <span className="text-xs uppercase tracking-[0.25em] text-on-surface-variant font-medium">
            Acesso Restrito à Equipe
          </span>
          <h1 className="text-xl font-semibold text-on-surface mt-2 font-heading">
            Gestão & Ateliê de Beleza
          </h1>
        </div>

        {/* Mensagem de Erro */}
        {error && (
          <div className="mb-6 p-4 rounded-2xl bg-destructive/10 border border-destructive/20 text-destructive text-xs leading-relaxed">
            {error}
          </div>
        )}

        {/* Formulário */}
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-1.5">
            <Label htmlFor="email" className="text-xs font-medium text-on-surface-variant">
              E-mail Profissional
            </Label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-on-surface-variant/70" />
              <Input
                id="email"
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="seu.email@camilostudio.com"
                className="pl-10 h-12 rounded-full border-outline-variant bg-surface-container-lowest focus-visible:ring-primary text-sm shadow-sm"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <Label htmlFor="password" className="text-xs font-medium text-on-surface-variant">
                Senha de Acesso
              </Label>
              <Link
                href="/esqueci-senha"
                className="text-xs text-primary hover:underline font-medium"
              >
                Esqueci minha senha
              </Link>
            </div>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-on-surface-variant/70" />
              <Input
                id="password"
                type={showPassword ? 'text' : 'password'}
                required
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="pl-10 pr-10 h-12 rounded-full border-outline-variant bg-surface-container-lowest focus-visible:ring-primary text-sm shadow-sm"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-on-surface-variant/70 hover:text-on-surface p-1"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                <span className="sr-only">Alternar visibilidade da senha</span>
              </button>
            </div>
          </div>

          {/* Botão Primário Único */}
          <Button
            type="submit"
            disabled={loading}
            className="w-full h-12 rounded-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold text-sm shadow-md shadow-primary/25 cursor-pointer transition-all mt-2"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                Autenticando...
              </span>
            ) : (
              'Entrar no Sistema'
            )}
          </Button>
        </form>
      </div>
    </div>
  );
}
