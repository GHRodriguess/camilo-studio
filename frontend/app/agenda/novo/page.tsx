'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  Plus,
} from 'lucide-react';
import { api, Cliente, Profissional, Servico } from '@/lib/api';
import { LoadingState } from '@/components/atoms/LoadingState';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

export default function NovoAgendamentoPage() {
  const router = useRouter();
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [equipe, setEquipe] = useState<Profissional[]>([]);
  const [servicos, setServicos] = useState<Servico[]>([]);
  const [loading, setLoading] = useState(true);

  // Form State
  const [clienteId, setClienteId] = useState<number | ''>('');
  const [profissionalId, setProfissionalId] = useState<number | ''>('');
  const [servicosSelecionados, setServicosSelecionados] = useState<number[]>([]);
  const [dataStr, setDataStr] = useState('');
  const [horaInicioStr, setHoraInicioStr] = useState('10:00');
  const [observacoes, setObservacoes] = useState('');
  const [salvando, setSalvando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function carregarDados() {
      setDataStr(new Date().toISOString().split('T')[0]);
      try {
        const [cData, eData, sData] = await Promise.all([
          api.getClientes(),
          api.getEquipe(),
          api.getServicos(),
        ]);
        setClientes(Array.isArray(cData) ? cData : cData.results || []);
        setEquipe(Array.isArray(eData) ? eData : eData.results || []);
        setServicos(Array.isArray(sData) ? sData : sData.results || []);
      } catch (err) {
        console.error('Erro ao carregar dados para o agendamento:', err);
      } finally {
        setLoading(false);
      }
    }
    carregarDados();
  }, []);

  const totalMinutos = useMemo(() => {
    return servicos
      .filter((s) => servicosSelecionados.includes(s.id))
      .reduce((acc, s) => acc + s.duracao_minutos, 0);
  }, [servicos, servicosSelecionados]);

  const valorTotal = useMemo(() => {
    return servicos
      .filter((s) => servicosSelecionados.includes(s.id))
      .reduce((acc, s) => acc + Number(s.preco), 0);
  }, [servicos, servicosSelecionados]);

  const horaFimStr = useMemo(() => {
    if (!horaInicioStr) return '';
    const [h, m] = horaInicioStr.split(':').map(Number);
    const totalM = (h * 60 + m + (totalMinutos || 60)) % (24 * 60);
    const endH = Math.floor(totalM / 60);
    const endM = totalM % 60;
    return `${String(endH).padStart(2, '0')}:${String(endM).padStart(2, '0')}`;
  }, [horaInicioStr, totalMinutos]);

  const toggleServico = (id: number) => {
    setServicosSelecionados((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!clienteId) {
      setError('Selecione uma cliente.');
      return;
    }
    if (!profissionalId) {
      setError('Selecione o profissional responsável.');
      return;
    }
    if (servicosSelecionados.length === 0) {
      setError('Selecione pelo menos um serviço.');
      return;
    }

    setSalvando(true);
    try {
      const dataHoraInicio = new Date(`${dataStr}T${horaInicioStr}:00`).toISOString();
      const fimDate = new Date(`${dataStr}T${horaInicioStr}:00`);
      fimDate.setMinutes(fimDate.getMinutes() + totalMinutos);
      const dataHoraFim = fimDate.toISOString();

      await api.createAgendamento({
        cliente: Number(clienteId),
        profissional: Number(profissionalId),
        servicos: servicosSelecionados,
        data_hora_inicio: dataHoraInicio,
        data_hora_fim: dataHoraFim,
        status: 'agendado',
        valor_total: valorTotal,
        observacoes,
      });

      router.push('/agenda');
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Erro ao criar agendamento.');
      }
    } finally {
      setSalvando(false);
    }
  };

  if (loading) {
    return <LoadingState message="Carregando opções para agendamento..." />;
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Voltar */}
      <Link
        href="/agenda"
        className="inline-flex items-center gap-1.5 text-xs text-on-surface-variant hover:text-primary transition-colors cursor-pointer"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        <span>Voltar para a Agenda</span>
      </Link>

      <div className="bg-surface-container-lowest border border-outline-variant/60 rounded-[2.5rem] p-6 sm:p-8 shadow-sm">
        <div className="mb-6">
          <span className="text-xs uppercase tracking-[0.2em] font-semibold text-primary">
            Novo Atendimento
          </span>
          <h1 className="text-2xl font-bold text-on-surface font-heading tracking-tight mt-0.5">
            Marcar Agendamento
          </h1>
          <p className="text-xs text-on-surface-variant mt-1">
            Selecione a cliente, o especialista e monte o combo de procedimentos.
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-2xl bg-destructive/10 border border-destructive/20 text-destructive text-xs">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* SELEÇÃO DE CLIENTE */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <Label className="text-xs font-medium text-on-surface-variant">Cliente</Label>
              <Link
                href="/clientes/novo"
                className="text-xs text-primary hover:underline font-medium inline-flex items-center gap-1"
              >
                <Plus className="w-3 h-3" />
                Cadastrar nova cliente
              </Link>
            </div>
            <select
              value={clienteId}
              onChange={(e) => setClienteId(e.target.value ? Number(e.target.value) : '')}
              required
              className="w-full h-12 px-4 rounded-full border border-outline-variant bg-surface-container-lowest text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="">Selecione a cliente...</option>
              {clientes.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.nome} ({c.telefone})
                </option>
              ))}
            </select>
          </div>

          {/* SELEÇÃO DE PROFISSIONAL */}
          <div className="space-y-1.5">
            <Label className="text-xs font-medium text-on-surface-variant">
              Profissional Responsável
            </Label>
            <select
              value={profissionalId}
              onChange={(e) => setProfissionalId(e.target.value ? Number(e.target.value) : '')}
              required
              className="w-full h-12 px-4 rounded-full border border-outline-variant bg-surface-container-lowest text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="">Selecione o profissional...</option>
              {equipe.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.nome} — {p.cargo} ({p.cadeira})
                </option>
              ))}
            </select>
          </div>

          {/* SELEÇÃO DE SERVIÇOS (COMBO COM SOMA DINÂMICA) */}
          <div className="space-y-2">
            <Label className="text-xs font-medium text-on-surface-variant">
              Procedimentos Desejados (Selecione um ou mais)
            </Label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-60 overflow-y-auto p-1 border border-outline-variant/50 rounded-2xl">
              {servicos.map((servico) => {
                const isSelected = servicosSelecionados.includes(servico.id);
                return (
                  <div
                    key={servico.id}
                    onClick={() => toggleServico(servico.id)}
                    className={`p-3 rounded-2xl border text-xs cursor-pointer transition-all flex items-center justify-between gap-2 ${
                      isSelected
                        ? 'border-primary bg-primary/10 text-primary font-semibold'
                        : 'border-outline-variant/60 bg-surface-container-low hover:bg-surface-container text-on-surface'
                    }`}
                  >
                    <div className="min-w-0 flex-1">
                      <p className="truncate">{servico.nome}</p>
                      <span className="text-[10px] text-on-surface-variant font-mono">
                        {servico.duracao_minutos} min
                      </span>
                    </div>
                    <div className="text-right shrink-0">
                      <span className="font-heading font-bold text-xs">
                        R$ {Number(servico.preco).toFixed(0)}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* DATA E HORÁRIO */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label className="text-xs font-medium text-on-surface-variant">Data do Atendimento</Label>
              <Input
                type="date"
                required
                value={dataStr}
                onChange={(e) => setDataStr(e.target.value)}
                className="rounded-full h-12 text-sm"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-medium text-on-surface-variant">Horário de Início</Label>
              <Input
                type="time"
                required
                value={horaInicioStr}
                onChange={(e) => setHoraInicioStr(e.target.value)}
                className="rounded-full h-12 text-sm font-mono"
              />
            </div>
          </div>

          {/* RESUMO DE TEMPO E VALOR */}
          <div className="p-4 rounded-2xl bg-surface-container-low border border-outline-variant/40 flex items-center justify-between text-xs">
            <div className="space-y-0.5">
              <p className="text-on-surface-variant">Previsão de Término:</p>
              <p className="font-bold text-on-surface font-mono text-sm">
                {horaFimStr} ({totalMinutos} min)
              </p>
            </div>
            <div className="text-right space-y-0.5">
              <p className="text-on-surface-variant">Investimento Total:</p>
              <p className="font-bold text-primary font-heading text-lg">
                R$ {valorTotal.toFixed(2).replace('.', ',')}
              </p>
            </div>
          </div>

          {/* OBSERVAÇÕES */}
          <div className="space-y-1.5">
            <Label className="text-xs font-medium text-on-surface-variant">
              Observações Especiais
            </Label>
            <Textarea
              rows={2}
              value={observacoes}
              onChange={(e) => setObservacoes(e.target.value)}
              placeholder="Ex: Cliente tem reunião às 14h, prefere mechas com touca, etc..."
              className="rounded-2xl text-xs resize-none"
            />
          </div>

          {/* ÚNICO BOTÃO PRIMÁRIO */}
          <Button
            type="submit"
            disabled={salvando}
            className="w-full h-12 rounded-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold shadow-md shadow-primary/25 text-sm cursor-pointer"
          >
            {salvando ? 'Agendando...' : 'Confirmar Agendamento'}
          </Button>
        </form>
      </div>
    </div>
  );
}
