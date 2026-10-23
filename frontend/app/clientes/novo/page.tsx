'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { api } from '@/lib/api';
import { formatarTelefone, validarTelefone } from '@/lib/masks';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

function NovoClienteHeader() {
  return (
    <>
      <Link
        href="/clientes"
        className="inline-flex items-center gap-1.5 text-xs text-on-surface-variant hover:text-primary transition-colors cursor-pointer"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        <span>Voltar para Gestão de Clientes</span>
      </Link>
      <div className="mb-6">
        <span className="text-xs uppercase tracking-[0.2em] font-semibold text-primary">
          Novo Registro
        </span>
        <h1 className="text-2xl font-bold text-on-surface font-heading tracking-tight mt-0.5">
          Cadastrar Nova Cliente
        </h1>
        <p className="text-xs text-on-surface-variant mt-1">
          Cadastre as informações essenciais para contato e agendamento no Camilo Studio.
        </p>
      </div>
    </>
  );
}

export default function NovoClientePage() {
  const router = useRouter();
  const [nome, setNome] = useState('');
  const [telefone, setTelefone] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const validacao = validarTelefone(telefone);
    if (!validacao.valido) {
      setError(validacao.mensagem || 'WhatsApp / Telefone inválido.');
      return;
    }
    setSaving(true);
    try {
      const novo = await api.createCliente({ nome, telefone });
      router.push(`/clientes/${novo.id}`);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Erro ao cadastrar cliente.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto space-y-6">
      <div className="bg-surface-container-lowest border border-outline-variant/60 rounded-[2.5rem] p-6 sm:p-8 shadow-sm">
        <NovoClienteHeader />
        {error && (
          <div className="mb-6 p-4 rounded-2xl bg-destructive/10 border border-destructive/20 text-destructive text-xs">
            {error}
          </div>
        )}
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-1.5">
            <Label className="text-xs font-medium text-on-surface-variant">Nome Completo</Label>
            <Input
              required
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              placeholder="Ex: Beatriz Albuquerque"
              className="rounded-full h-12 text-sm"
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs font-medium text-on-surface-variant">WhatsApp / Telefone</Label>
            <Input
              required
              value={telefone}
              onChange={(e) => setTelefone(formatarTelefone(e.target.value, telefone))}
              maxLength={15}
              placeholder="(11) 98765-4321"
              className="rounded-full h-12 text-sm font-mono"
            />
          </div>
          <div className="pt-4">
            <Button
              type="submit"
              disabled={saving}
              className="w-full h-12 rounded-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold shadow-md shadow-primary/20 text-sm cursor-pointer"
            >
              {saving ? 'Cadastrando cliente...' : 'Cadastrar Cliente no Ateliê'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
