'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Heart } from 'lucide-react';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

export default function NovoClientePage() {
  const router = useRouter();
  const [nome, setNome] = useState('');
  const [telefone, setTelefone] = useState('');
  const [email, setEmail] = useState('');
  const [dataNascimento, setDataNascimento] = useState('');
  const [signo, setSigno] = useState('');
  const [tags, setTags] = useState('Frequente');
  const [alergias, setAlergias] = useState('');
  const [sensoriais, setSensoriais] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSaving(true);

    try {
      const novo = await api.createCliente({
        nome,
        telefone,
        email,
        data_nascimento: dataNascimento || undefined,
        signo,
        tags,
        observacoes_alergias: alergias,
        preferencias_sensoriais: sensoriais,
      });
      router.push(`/clientes/${novo.id}`);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Erro ao cadastrar cliente.');
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Botão Voltar */}
      <Link
        href="/clientes"
        className="inline-flex items-center gap-1.5 text-xs text-on-surface-variant hover:text-primary transition-colors cursor-pointer"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        <span>Voltar para Gestão de Clientes</span>
      </Link>

      <div className="bg-surface-container-lowest border border-outline-variant/60 rounded-[2.5rem] p-6 sm:p-8 shadow-sm">
        <div className="mb-6">
          <span className="text-xs uppercase tracking-[0.2em] font-semibold text-primary">
            Novo Registro
          </span>
          <h1 className="text-2xl font-bold text-on-surface font-heading tracking-tight mt-0.5">
            Cadastrar Nova Cliente
          </h1>
          <p className="text-xs text-on-surface-variant mt-1">
            Reúna dados cadastrais e preferências de atendimento para personalização sensorial.
          </p>
        </div>

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

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label className="text-xs font-medium text-on-surface-variant">WhatsApp / Telefone</Label>
              <Input
                required
                value={telefone}
                onChange={(e) => setTelefone(e.target.value)}
                placeholder="(11) 98765-4321"
                className="rounded-full h-12 text-sm font-mono"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-medium text-on-surface-variant">E-mail (opcional)</Label>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="cliente@email.com"
                className="rounded-full h-12 text-sm"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label className="text-xs font-medium text-on-surface-variant">Data de Nascimento</Label>
              <Input
                type="date"
                value={dataNascimento}
                onChange={(e) => setDataNascimento(e.target.value)}
                className="rounded-full h-12 text-xs"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-medium text-on-surface-variant">Signo (opcional)</Label>
              <Input
                value={signo}
                onChange={(e) => setSigno(e.target.value)}
                placeholder="Ex: Leão, Touro..."
                className="rounded-full h-12 text-sm"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-medium text-on-surface-variant">
              Tags de Perfil (separadas por vírgula)
            </Label>
            <Input
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              placeholder="Ex: VIP, Loiros, Morena Iluminada"
              className="rounded-full h-12 text-sm"
            />
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-medium text-on-surface-variant">
              Alergias e Restrições Químicas
            </Label>
            <Textarea
              rows={2}
              value={alergias}
              onChange={(e) => setAlergias(e.target.value)}
              placeholder="Alergia a amônia, fragrâncias, sensibilidade no couro cabeludo..."
              className="rounded-2xl text-xs resize-none"
            />
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-medium text-on-surface-variant flex items-center gap-1.5">
              <Heart className="w-3.5 h-3.5 text-primary" />
              Preferências Sensoriais & Cuidados no Atendimento
            </Label>
            <Textarea
              rows={3}
              value={sensoriais}
              onChange={(e) => setSensoriais(e.target.value)}
              placeholder="Preferência de café/chá, temperatura da água do lavatório, revistas favoritas..."
              className="rounded-2xl text-xs resize-none"
            />
          </div>

          {/* ÚNICO BOTÃO PRIMÁRIO */}
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
