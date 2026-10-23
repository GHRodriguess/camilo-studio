'use client';

import React from 'react';
import { Search, Check, X } from 'lucide-react';
import { Servico } from '@/lib/api';
import { Input } from '@/components/ui/input';

interface ItemCardProps {
  servico: Servico;
  isSelected: boolean;
  onToggle: (id: number) => void;
}

function ServicoItemCard({ servico, isSelected, onToggle }: ItemCardProps) {
  return (
    <div
      onClick={() => onToggle(servico.id)}
      className={`p-3 rounded-2xl border text-xs cursor-pointer transition-all flex items-center justify-between gap-2.5 min-w-0 ${
        isSelected
          ? 'border-primary bg-primary/10 text-primary font-semibold shadow-sm shadow-primary/15'
          : 'border-outline-variant/60 bg-surface-container-low hover:bg-surface-container text-on-surface'
      }`}
    >
      <div className="flex items-center gap-2 min-w-0 flex-1">
        <div
          className={`w-4 h-4 rounded-md flex items-center justify-center shrink-0 border transition-all ${
            isSelected ? 'bg-primary border-primary text-primary-foreground' : 'border-outline-variant bg-surface-container-lowest'
          }`}
        >
          {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-xs">{servico.nome}</p>
          <span className="text-[10px] text-on-surface-variant font-mono">{servico.duracao_minutos} min</span>
        </div>
      </div>
      <div className="text-right shrink-0">
        <span className="font-heading font-bold text-xs">R$ {Number(servico.preco).toFixed(0)}</span>
      </div>
    </div>
  );
}

interface StepServicosProps {
  searchServico: string;
  setSearchServico: (v: string) => void;
  categoriasServicos: string[];
  categoriaAtiva: string;
  setCategoriaAtiva: (c: string) => void;
  servicosFiltrados: Servico[];
  servicosSelecionados: number[];
  onToggleServico: (id: number) => void;
  totalMinutos: number;
  valorTotal: number;
}

export function WizardStepServicos(props: StepServicosProps) {
  return (
    <div className="space-y-4 sm:space-y-5 min-w-0">
      <div>
        <span className="text-[11px] uppercase tracking-[0.2em] font-semibold text-primary">Passo 2 de 4</span>
        <h3 className="text-lg sm:text-2xl font-bold text-on-surface font-heading tracking-tight mt-0.5">Quais procedimentos serão realizados?</h3>
        <p className="text-xs text-on-surface-variant mt-0.5">Selecione um ou múltiplos serviços. O tempo e valor serão somados automaticamente.</p>
      </div>

      <div className="relative flex items-center w-full min-w-0">
        <Search className="absolute left-3.5 w-4 h-4 text-on-surface-variant pointer-events-none" />
        <Input
          type="text"
          value={props.searchServico}
          onChange={(e) => props.setSearchServico(e.target.value)}
          placeholder="Buscar procedimento por nome..."
          className="pl-10 pr-9 h-11 bg-surface-container-lowest border-outline-variant rounded-full text-xs sm:text-sm placeholder:text-on-surface-variant/60 focus-visible:ring-primary shadow-sm"
        />
        {props.searchServico && (
          <button type="button" onClick={() => props.setSearchServico('')} className="absolute right-3 p-1 rounded-full text-on-surface-variant hover:text-on-surface hover:bg-surface-container transition-colors">
            <X className="w-3.5 h-3.5" />
            <span className="sr-only">Limpar busca</span>
          </button>
        )}
      </div>

      {props.categoriasServicos.length > 2 && (
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          {props.categoriasServicos.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => props.setCategoriaAtiva(cat)}
              className={`px-3 py-1 rounded-full text-[11px] font-medium whitespace-nowrap transition-all cursor-pointer ${
                props.categoriaAtiva === cat
                  ? 'bg-primary text-primary-foreground shadow-sm shadow-primary/20'
                  : 'bg-surface-container hover:bg-surface-container-high text-on-surface-variant'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-2.5 max-h-56 sm:max-h-64 overflow-y-auto p-1 border border-outline-variant/60 rounded-2xl">
        {props.servicosFiltrados.length === 0 ? (
          <div className="col-span-full p-6 text-center text-xs text-on-surface-variant">Nenhum procedimento encontrado com o filtro atual.</div>
        ) : (
          props.servicosFiltrados.map((servico) => (
            <ServicoItemCard
              key={servico.id}
              servico={servico}
              isSelected={props.servicosSelecionados.includes(servico.id)}
              onToggle={props.onToggleServico}
            />
          ))
        )}
      </div>

      <div className="p-3 sm:p-3.5 rounded-2xl bg-surface-container-low border border-outline-variant/40 flex flex-wrap items-center justify-between gap-2 text-xs">
        <div className="space-y-0.5">
          <span className="text-on-surface-variant text-[11px]">Selecionados:</span>
          <p className="font-bold text-on-surface text-xs sm:text-sm">{props.servicosSelecionados.length} serviço(s) • {props.totalMinutos} min</p>
        </div>
        <div className="text-right space-y-0.5">
          <span className="text-on-surface-variant text-[11px]">Subtotal:</span>
          <p className="font-bold text-primary font-heading text-sm sm:text-base">R$ {props.valorTotal.toFixed(2).replace('.', ',')}</p>
        </div>
      </div>
    </div>
  );
}
