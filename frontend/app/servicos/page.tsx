'use client';

import React, { useEffect, useState, useMemo, useCallback } from 'react';
import {
  Scissors,
  Plus,
  Clock,
  Edit2,
} from 'lucide-react';
import { api, Servico } from '@/lib/api';
import { LoadingState } from '@/components/atoms/LoadingState';
import { EmptyState } from '@/components/atoms/EmptyState';
import { SearchBar } from '@/components/molecules/SearchBar';
import { NoSearchResultsState } from '@/components/atoms/NoSearchResultsState';
import { DeleteButton } from '@/components/atoms/DeleteButton';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

const CATEGORIAS = ['Todos', 'Mechas', 'Cabelo', 'Tratamento', 'Penteado', 'Estética', 'Outros'];

function ServicosHeader({ onNovo }: { onNovo: () => void }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        <span className="text-xs uppercase tracking-[0.2em] font-semibold text-primary">Menu de Procedimentos</span>
        <h1 className="text-2xl sm:text-3xl font-bold text-on-surface font-heading tracking-tight mt-0.5">Catálogo de Serviços</h1>
        <p className="text-xs sm:text-sm text-on-surface-variant">Configuração de procedimentos, durações de atendimento e precificação editorial do ateliê.</p>
      </div>
      <Button onClick={onNovo} className="rounded-full h-11 px-6 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold shadow-md shadow-primary/20 shrink-0 cursor-pointer">
        <Plus className="w-4 h-4 mr-1.5" /> Novo Procedimento
      </Button>
    </div>
  );
}

function CategoriaChips({ ativa, onSelect }: { ativa: string; onSelect: (c: string) => void }) {
  return (
    <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
      {CATEGORIAS.map((cat) => (
        <button
          key={cat}
          type="button"
          onClick={() => onSelect(cat)}
          className={`px-4 py-2 rounded-full text-xs font-medium whitespace-nowrap transition-all cursor-pointer ${
            ativa === cat ? 'bg-primary text-primary-foreground shadow-sm shadow-primary/20' : 'bg-surface-container hover:bg-surface-container-high text-on-surface-variant'
          }`}
        >
          {cat}
        </button>
      ))}
    </div>
  );
}

function ServicoCard({
  servico,
  onEditar,
  onExcluir,
}: {
  servico: Servico;
  onEditar: () => void;
  onExcluir: () => void;
}) {
  return (
    <div className="p-6 rounded-3xl bg-surface-container-lowest border border-outline-variant/60 shadow-sm hover:shadow-md hover:border-primary/40 transition-all flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between gap-2 mb-3">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-primary bg-primary/10 px-3 py-0.5 rounded-full">
            {servico.categoria}
          </span>
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="icon" onClick={onEditar} className="rounded-full h-8 w-8 text-on-surface-variant hover:text-primary hover:bg-primary/10">
              <Edit2 className="w-3.5 h-3.5" />
            </Button>
            <DeleteButton onDelete={onExcluir} title="Excluir serviço" />
          </div>
        </div>
        <h3 className="text-base font-semibold text-on-surface font-heading leading-snug">{servico.nome}</h3>
        <p className="text-xs text-on-surface-variant line-clamp-2 mt-1.5 leading-relaxed">{servico.descricao || 'Sem descrição cadastrada.'}</p>
      </div>
      <div className="pt-4 mt-4 border-t border-outline-variant/40 flex items-center justify-between text-xs">
        <div className="flex items-center gap-1.5 text-on-surface-variant font-mono">
          <Clock className="w-3.5 h-3.5 text-primary" />
          <span>{servico.duracao_minutos} min</span>
        </div>
        <div className="font-heading font-semibold text-base text-primary">
          R$ {Number(servico.preco).toFixed(2).replace('.', ',')}
        </div>
      </div>
    </div>
  );
}

function ServicoFormContent({
  editing,
  onOpenChange,
  onSaved,
}: {
  editing: Servico | null;
  onOpenChange: (open: boolean) => void;
  onSaved: () => Promise<void>;
}) {
  const [formNome, setFormNome] = useState(editing?.nome || '');
  const [formCategoria, setFormCategoria] = useState(editing?.categoria || 'Mechas');
  const [formPreco, setFormPreco] = useState(editing ? String(editing.preco) : '');
  const [formDuracao, setFormDuracao] = useState(editing ? String(editing.duracao_minutos) : '60');
  const [formDescricao, setFormDescricao] = useState(editing?.descricao || '');
  const [saving, setSaving] = useState(false);

  const handleSalvar = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        nome: formNome,
        categoria: formCategoria,
        preco: parseFloat(formPreco.replace(',', '.')) || 0,
        duracao_minutos: parseInt(formDuracao, 10) || 60,
        descricao: formDescricao,
        ativo: true,
      };
      if (editing) await api.updateServico(editing.id, payload);
      else await api.createServico(payload);
      onOpenChange(false);
      await onSaved();
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSalvar} className="space-y-4 pt-2">
      <div className="space-y-1.5">
        <Label className="text-xs font-medium text-on-surface-variant">Nome do Procedimento</Label>
        <Input required value={formNome} onChange={(e) => setFormNome(e.target.value)} placeholder="Ex: Mechas Globais Pérola" className="rounded-full h-11 text-xs" />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label className="text-xs font-medium text-on-surface-variant">Categoria</Label>
          <select value={formCategoria} onChange={(e) => setFormCategoria(e.target.value)} className="w-full h-11 px-3 rounded-full border border-outline-variant bg-surface-container-lowest text-xs text-on-surface focus:outline-none focus:ring-2 focus:ring-primary">
            <option value="Mechas">Mechas</option>
            <option value="Cabelo">Cabelo</option>
            <option value="Tratamento">Tratamento</option>
            <option value="Penteado">Penteado</option>
            <option value="Estética">Estética</option>
            <option value="Outros">Outros</option>
          </select>
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs font-medium text-on-surface-variant">Preço (R$)</Label>
          <Input required type="text" value={formPreco} onChange={(e) => setFormPreco(e.target.value)} placeholder="780,00" className="rounded-full h-11 text-xs font-mono" />
        </div>
      </div>
      <div className="space-y-1.5">
        <Label className="text-xs font-medium text-on-surface-variant">Duração Estimada (minutos)</Label>
        <Input required type="number" min="15" step="15" value={formDuracao} onChange={(e) => setFormDuracao(e.target.value)} className="rounded-full h-11 text-xs font-mono" />
      </div>
      <div className="space-y-1.5">
        <Label className="text-xs font-medium text-on-surface-variant">Descrição do Serviço</Label>
        <Textarea rows={3} value={formDescricao} onChange={(e) => setFormDescricao(e.target.value)} placeholder="Detalhes sobre a técnica, produtos utilizados e diferenciais..." className="rounded-2xl text-xs resize-none" />
      </div>
      <div className="pt-3 flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={() => onOpenChange(false)} className="rounded-full text-xs h-10 px-5">Cancelar</Button>
        <Button type="submit" disabled={saving} className="rounded-full text-xs h-10 px-6 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold shadow-md shadow-primary/20">
          {saving ? 'Salvando...' : editing ? 'Salvar Alterações' : 'Cadastrar Serviço'}
        </Button>
      </div>
    </form>
  );
}

function ServicosList({
  loading,
  total,
  filtrados,
  search,
  onNovo,
  onClear,
  onEditar,
  onExcluir,
}: {
  loading: boolean;
  total: number;
  filtrados: Servico[];
  search: string;
  onNovo: () => void;
  onClear: () => void;
  onEditar: (s: Servico) => void;
  onExcluir: (id: number) => void;
}) {
  if (loading) return <LoadingState message="Carregando catálogo de serviços..." />;
  if (total === 0) {
    return (
      <EmptyState
        icon={Scissors}
        title="Nenhum serviço cadastrado"
        description="Monte seu menu de procedimentos para os agendamentos."
        actionLabel="Cadastrar Primeiro Serviço"
        onAction={onNovo}
      />
    );
  }
  if (filtrados.length === 0) {
    return <NoSearchResultsState searchTerm={search} onClear={onClear} />;
  }
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
      {filtrados.map((servico) => (
        <ServicoCard
          key={servico.id}
          servico={servico}
          onEditar={() => onEditar(servico)}
          onExcluir={() => onExcluir(servico.id)}
        />
      ))}
    </div>
  );
}

export default function ServicosPage() {
  const [servicos, setServicos] = useState<Servico[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [categoriaAtiva, setCategoriaAtiva] = useState('Todos');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingServico, setEditingServico] = useState<Servico | null>(null);

  const carregarServicos = useCallback(async () => {
    try {
      const data = await api.getServicos();
      setServicos(Array.isArray(data) ? data : data.results || []);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { carregarServicos(); }, [carregarServicos]);

  const servicosFiltrados = useMemo(() => {
    return servicos.filter((s) => {
      const matchCat = categoriaAtiva === 'Todos' || s.categoria === categoriaAtiva;
      const matchSearch = s.nome.toLowerCase().includes(search.toLowerCase()) || s.descricao.toLowerCase().includes(search.toLowerCase());
      return matchCat && matchSearch;
    });
  }, [servicos, categoriaAtiva, search]);

  const handleExcluir = async (id: number) => {
    if (confirm('Tem certeza que deseja remover este serviço do catálogo?')) {
      await api.deleteServico(id);
      await carregarServicos();
    }
  };

  return (
    <div className="space-y-6">
      <ServicosHeader onNovo={() => { setEditingServico(null); setModalOpen(true); }} />
      <div className="flex flex-col gap-3.5">
        <SearchBar value={search} onChange={setSearch} placeholder="Buscar serviço por nome ou palavra-chave..." />
        <CategoriaChips ativa={categoriaAtiva} onSelect={setCategoriaAtiva} />
      </div>
      <ServicosList
        loading={loading}
        total={servicos.length}
        filtrados={servicosFiltrados}
        search={search}
        onNovo={() => { setEditingServico(null); setModalOpen(true); }}
        onClear={() => { setSearch(''); setCategoriaAtiva('Todos'); }}
        onEditar={(s) => { setEditingServico(s); setModalOpen(true); }}
        onExcluir={handleExcluir}
      />
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="sm:max-w-md rounded-3xl p-6 bg-surface-container-lowest border-outline-variant">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-on-surface font-heading">{editingServico ? 'Editar Serviço' : 'Novo Serviço no Catálogo'}</DialogTitle>
            <DialogDescription className="text-xs text-on-surface-variant">Preencha os dados do procedimento conforme os padrões editoriais do ateliê.</DialogDescription>
          </DialogHeader>
          <ServicoFormContent key={editingServico?.id ?? 'novo'} editing={editingServico} onOpenChange={setModalOpen} onSaved={carregarServicos} />
        </DialogContent>
      </Dialog>
    </div>
  );
}
