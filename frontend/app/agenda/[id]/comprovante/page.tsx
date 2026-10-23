'use client';

import React, { useEffect, useState, use } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  Share2,
  Printer,
  Calendar,
  Clock,
  MapPin,
} from 'lucide-react';
import { api, Agendamento, ConfiguracaoAtelie } from '@/lib/api';
import { LoadingState } from '@/components/atoms/LoadingState';
import { Logo } from '@/components/atoms/Logo';
import { Button } from '@/components/ui/button';

interface HeaderProps {
  onPrint: () => void;
  onShare: () => void;
}

function ComprovanteHeaderActions({ onPrint, onShare }: HeaderProps) {
  return (
    <div className="flex items-center justify-between print:hidden">
      <Link
        href="/agenda"
        className="inline-flex items-center gap-1.5 text-xs text-on-surface-variant hover:text-primary transition-colors cursor-pointer"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        <span>Voltar para a Agenda</span>
      </Link>
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={onPrint}
          className="rounded-full text-xs h-9 px-4 gap-1.5 border-outline-variant cursor-pointer"
        >
          <Printer className="w-3.5 h-3.5" />
          <span>Imprimir</span>
        </Button>
        <Button
          size="sm"
          onClick={onShare}
          className="rounded-full text-xs h-9 px-4 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold shadow-md shadow-primary/20 gap-1.5 cursor-pointer"
        >
          <Share2 className="w-3.5 h-3.5" />
          <span>Compartilhar</span>
        </Button>
      </div>
    </div>
  );
}

interface ReciboProps {
  agendamento: Agendamento;
  config: ConfiguracaoAtelie | null;
  codigo: string;
  dataInicio: Date;
  dataFim: Date;
}

function ReciboEditorialCard({ agendamento, config, codigo, dataInicio, dataFim }: ReciboProps) {
  return (
    <div className="p-8 sm:p-10 rounded-[2.5rem] bg-surface-container-lowest border border-outline-variant/70 shadow-lg shadow-primary/5 space-y-6 relative overflow-hidden">
      <div className="absolute top-4 right-4 text-7xl font-bold text-primary/5 pointer-events-none select-none font-heading">
        CS
      </div>

      <div className="flex flex-col items-center text-center pb-6 border-b border-outline-variant/50">
        <Logo size="md" variant="full" className="mb-2" />
        <p className="text-[11px] uppercase tracking-[0.25em] text-on-surface-variant font-semibold mt-1">
          Comprovante de Agendamento
        </p>
        <span className="font-mono text-xs text-primary font-bold mt-1">{codigo}</span>
      </div>

      <div className="grid grid-cols-2 gap-4 text-xs">
        <div className="space-y-1">
          <span className="text-[10px] uppercase tracking-wider text-on-surface-variant font-semibold">Cliente</span>
          <p className="font-bold text-on-surface text-sm">{agendamento.cliente_detalhes?.nome}</p>
          <p className="font-mono text-on-surface-variant">{agendamento.cliente_detalhes?.telefone}</p>
        </div>
        <div className="space-y-1 text-right">
          <span className="text-[10px] uppercase tracking-wider text-on-surface-variant font-semibold">Atendimento</span>
          <p className="font-bold text-on-surface text-sm">{agendamento.profissional_detalhes?.nome || 'Equipe Camilo Studio'}</p>
          <p className="text-on-surface-variant text-[11px]">{agendamento.profissional_detalhes?.cargo || 'Ateliê Principal'}</p>
        </div>
      </div>

      <div className="p-4 rounded-2xl bg-surface-container-low border border-outline-variant/40 flex items-center justify-between text-xs">
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-primary" />
          <span className="font-semibold text-on-surface">
            {dataInicio.toLocaleDateString('pt-BR', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' })}
          </span>
        </div>
        <div className="flex items-center gap-1.5 font-mono text-primary font-bold">
          <Clock className="w-3.5 h-3.5" />
          <span>
            {dataInicio.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })} às {dataFim.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
          </span>
        </div>
      </div>

      <div className="space-y-3 pt-2">
        <span className="text-[10px] uppercase tracking-wider text-on-surface-variant font-semibold">Procedimentos Contratados</span>
        <div className="space-y-2 border-y border-outline-variant/40 py-3 text-xs">
          {agendamento.servicos_detalhes?.map((servico) => (
            <div key={servico.id} className="flex items-center justify-between">
              <div>
                <p className="font-semibold text-on-surface">{servico.nome}</p>
                <span className="text-[10px] text-on-surface-variant font-mono">{servico.duracao_minutos} min</span>
              </div>
              <span className="font-mono font-semibold text-on-surface">
                R$ {Number(servico.preco).toFixed(2).replace('.', ',')}
              </span>
            </div>
          ))}
        </div>
        <div className="flex items-center justify-between pt-1">
          <span className="text-sm font-bold text-on-surface font-heading">Valor Total Estimado</span>
          <span className="text-xl font-bold text-primary font-heading">
            R$ {Number(agendamento.valor_total).toFixed(2).replace('.', ',')}
          </span>
        </div>
      </div>

      <div className="pt-6 border-t border-outline-variant/50 text-center space-y-2 text-[11px] text-on-surface-variant">
        <p className="flex items-center justify-center gap-1">
          <MapPin className="w-3 h-3 text-primary" />
          <span>{config?.endereco || 'Rua Oscar Freire, 1200 - Jardins, São Paulo - SP'}</span>
        </p>
        <p className="text-[10px] italic max-w-xs mx-auto leading-relaxed">
          {config?.politica_cancelamento || 'Pedimos a gentileza de avisar com até 24h de antecedência em caso de alteração.'}
        </p>
      </div>
    </div>
  );
}

export default function ComprovanteAgendamentoPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const agendamentoId = parseInt(id, 10);
  const [agendamento, setAgendamento] = useState<Agendamento | null>(null);
  const [config, setConfig] = useState<ConfiguracaoAtelie | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function carregar() {
      try {
        const [agData, confData] = await Promise.all([
          api.getAgendamento(agendamentoId),
          api.getConfiguracoes(),
        ]);
        setAgendamento(agData);
        setConfig(confData);
      } finally {
        setLoading(false);
      }
    }
    carregar();
  }, [agendamentoId]);

  if (loading) {
    return <LoadingState message="Gerando comprovante do ateliê..." />;
  }

  if (!agendamento) {
    return (
      <div className="text-center py-12">
        <p className="text-sm text-on-surface-variant">Agendamento não encontrado.</p>
        <Link href="/agenda" className="inline-flex items-center justify-center rounded-full mt-4 h-10 px-6 bg-primary text-primary-foreground font-semibold text-xs shadow-md shadow-primary/20">
          Voltar para a Agenda
        </Link>
      </div>
    );
  }

  const dataInicio = new Date(agendamento.data_hora_inicio);
  const dataFim = new Date(agendamento.data_hora_fim);
  const codigo = `#CS-${String(agendamento.id).padStart(4, '0')}`;

  const handleShare = () => {
    const servicos = agendamento.servicos_detalhes?.map((s) => s.nome).join(', ') || 'Procedimentos';
    const texto = `*Comprovante de Agendamento — Camilo Studio* ✨\n\nCódigo: *${codigo}*\nCliente: *${agendamento.cliente_detalhes?.nome}*\nData: *${dataInicio.toLocaleDateString('pt-BR')}*\nHorário: *${dataInicio.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })} às ${dataFim.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}*\nProfissional: *${agendamento.profissional_detalhes?.nome}*\nServiços: ${servicos}\nTotal: *R$ ${Number(agendamento.valor_total).toFixed(2).replace('.', ',')}*\n\nLocal: ${config?.endereco || 'Camilo Studio'}\n\nAguardamos você com muito carinho! 💜`;
    window.open(`https://wa.me/?text=${encodeURIComponent(texto)}`, '_blank');
  };

  return (
    <div className="max-w-xl mx-auto space-y-6">
      <ComprovanteHeaderActions onPrint={() => window.print()} onShare={handleShare} />
      <ReciboEditorialCard
        agendamento={agendamento}
        config={config}
        codigo={codigo}
        dataInicio={dataInicio}
        dataFim={dataFim}
      />
    </div>
  );
}
