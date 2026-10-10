'use client';

import React, { useEffect, useState, useMemo, useCallback } from 'react';
import {
  Scissors,
  Plus,
  Clock,
  Edit2,
} from 'lucide-react';
import { api, Servico } from '@/lib/api';
import { SearchBar } from '@/components/molecules/SearchBar';
import { EmptyState } from '@/components/atoms/EmptyState';
import { NoSearchResultsState } from '@/components/atoms/NoSearchResultsState';
import { LoadingState } from '@/components/atoms/LoadingState';
import { DeleteButton } from '@/components/atoms/DeleteButton';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
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

const CATEGORIAS = ['Todos', 'Mechas', 'Cabelo', 'Tratamento', 'Penteado', 'Estética'];

export default function ServicosPage() {
  const [servicos, setServicos] = useState<Servico[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [categoriaAtiva, setCategoriaAtiva] = useState('Todos');

  // Modal de Criação / Edição
  const [modalOpen, setModalOpen] = useState(false);
  const [editingServico, setEditingServico] = useState<Servico | null>(null);
  const [formNome, setFormNome] = useState('');
  const [formCategoria, setFormCategoria] = useState('Mechas');
  const [formPreco, setFormPreco] = useState('');
  const [formDuracao, setFormDuracao] = useState('60');
  const [formDescricao, setFormDescricao] = useState('');
  const [saving, setSaving] = useState(false);

  const carregarServicos = useCallback(async () => {
    try {
      const data = await api.getServicos();
      const list = Array.isArray(data) ? data : data.results || [];
      setServicos(list);
    } catch (err) {
      console.error('Erro ao carregar serviços:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let isMounted = true;
    api.getServicos()
      .then((data) => {
        if (isMounted) {
          const list = Array.isArray(data) ? data : data.results || [];
          setServicos(list);
          setLoading(false);
        }
      })
      .catch((err) => {
        if (isMounted) {
          console.error('Erro ao carregar serviços:', err);
          setLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const servicosFiltrados = useMemo(() => {
    return servicos.filter((s) => {
      const matchCategoria = categoriaAtiva === 'Todos' || s.categoria === categoriaAtiva;
      const matchSearch =
        s.nome.toLowerCase().includes(search.toLowerCase()) ||
        s.descricao.toLowerCase().includes(search.toLowerCase());
      return matchCategoria && matchSearch;
    });
  }, [servicos, categoriaAtiva, search]);

  const abrirModalNovo = () => {
    setEditingServico(null);
    setFormNome('');
    setFormCategoria('Mechas');
    setFormPreco('');
    setFormDuracao('60');
    setFormDescricao('');
    setModalOpen(true);
  };

  const abrirModalEditar = (servico: Servico) => {
    setEditingServico(servico);
    setFormNome(servico.nome);
    setFormCategoria(servico.categoria);
    setFormPreco(String(servico.preco));
    setFormDuracao(String(servico.duracao_minutos));
    setFormDescricao(servico.descricao);
    setModalOpen(true);
  };

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

      if (editingServico) {
        await api.updateServico(editingServico.id, payload);
      } else {
        await api.createServico(payload);
      }

      setModalOpen(false);
      await carregarServicos();
    } catch (err) {
      console.error('Erro ao salvar serviço:', err);
    } finally {
      setSaving(false);
    }
  };

  const handleExcluir = async (id: number) => {
    if (confirm('Tem certeza que deseja remover este serviço do catálogo?')) {
      try {
        await api.deleteServico(id);
        await carregarServicos();
      } catch (err) {
        console.error('Erro ao excluir serviço:', err);
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* CABEÇALHO */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs uppercase tracking-[0.2em] font-semibold text-primary">
            Menu de Procedimentos
          </span>
          <h1 className="text-2xl sm:text-3xl font-bold text-on-surface font-heading tracking-tight mt-0.5">
            Catálogo de Serviços
          </h1>
          <p className="text-xs sm:text-sm text-on-surface-variant">
            Gerencie procedimentos, durações de atendimento e tabela de valores.
          </p>
        </div>

        {/* ÚNICO BOTÃO PRIMÁRIO DA TELA */}
        <Button
          onClick={abrirModalNovo}
          className="rounded-full h-11 px-6 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold shadow-md shadow-primary/20 shrink-0 cursor-pointer"
        >
          <Plus className="w-4 h-4 mr-1.5" />
          Novo Serviço
        </Button>
      </div>

      {/* BARRA DE BUSCA & FILTROS */}
      <div className="flex flex-col gap-3.5">
        <SearchBar
          value={search}
          onChange={setSearch}
          placeholder="Buscar serviço por nome ou palavra-chave..."
        />

        {/* Chips de Categoria */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          {CATEGORIAS.map((cat) => {
            const isSelected = categoriaAtiva === cat;
            return (
              <button
                key={cat}
                type="button"
                onClick={() => setCategoriaAtiva(cat)}
                className={`px-4 py-2 rounded-full text-xs font-medium whitespace-nowrap transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-primary text-primary-foreground shadow-sm shadow-primary/20'
                    : 'bg-surface-container hover:bg-surface-container-high text-on-surface-variant'
                }`}
              >
                {cat}
              </button>
            );
          })}
        </div>
      </div>

      {/* CONTEÚDO PRINCIPAL (LISTAGEM & ESTADOS) */}
      {loading ? (
        <LoadingState message="Carregando catálogo de serviços..." />
      ) : servicos.length === 0 ? (
        <EmptyState
          icon={Scissors}
          title="Nenhum serviço cadastrado"
          description="O catálogo está vazio. Adicione os primeiros procedimentos do Camilo Studio."
          actionLabel="Cadastrar Primeiro Serviço"
          onAction={abrirModalNovo}
        />
      ) : servicosFiltrados.length === 0 ? (
        <NoSearchResultsState
          searchTerm={search}
          onClear={() => {
            setSearch('');
            setCategoriaAtiva('Todos');
          }}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
          {servicosFiltrados.map((servico) => (
            <div
              key={servico.id}
              className="group flex flex-col justify-between p-5 rounded-3xl bg-surface-container-lowest border border-outline-variant/60 shadow-sm hover:shadow-md hover:border-primary/40 transition-all"
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-2.5">
                  <Badge
                    variant="secondary"
                    className="rounded-full text-[11px] px-3 py-0.5 bg-surface-container-high text-primary border-none font-medium"
                  >
                    {servico.categoria}
                  </Badge>
                  <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => abrirModalEditar(servico)}
                      className="w-8 h-8 rounded-full text-on-surface-variant hover:text-primary hover:bg-surface-container"
                      title="Editar serviço"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </Button>
                    <DeleteButton
                      onDelete={() => handleExcluir(servico.id)}
                      title="Excluir serviço"
                    />
                  </div>
                </div>

                <h3 className="text-base font-semibold text-on-surface font-heading leading-snug">
                  {servico.nome}
                </h3>

                <p className="text-xs text-on-surface-variant line-clamp-2 mt-1.5 leading-relaxed">
                  {servico.descricao || 'Sem descrição cadastrada.'}
                </p>
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
          ))}
        </div>
      )}

      {/* MODAL CADASTRAR / EDITAR SERVIÇO */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="sm:max-w-md rounded-3xl p-6 bg-surface-container-lowest border-outline-variant">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-on-surface font-heading">
              {editingServico ? 'Editar Serviço' : 'Novo Serviço no Catálogo'}
            </DialogTitle>
            <DialogDescription className="text-xs text-on-surface-variant">
              Preencha os dados do procedimento conforme os padrões editoriais do ateliê.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSalvar} className="space-y-4 pt-2">
            <div className="space-y-1.5">
              <Label className="text-xs font-medium text-on-surface-variant">Nome do Procedimento</Label>
              <Input
                required
                value={formNome}
                onChange={(e) => setFormNome(e.target.value)}
                placeholder="Ex: Mechas Globais Pérola"
                className="rounded-full h-11 text-xs"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-on-surface-variant">Categoria</Label>
                <select
                  value={formCategoria}
                  onChange={(e) => setFormCategoria(e.target.value)}
                  className="w-full h-11 px-3 rounded-full border border-outline-variant bg-surface-container-lowest text-xs text-on-surface focus:outline-none focus:ring-2 focus:ring-primary"
                >
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
                <Input
                  required
                  type="text"
                  value={formPreco}
                  onChange={(e) => setFormPreco(e.target.value)}
                  placeholder="780,00"
                  className="rounded-full h-11 text-xs font-mono"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-medium text-on-surface-variant">
                Duração Estimada (minutos)
              </Label>
              <Input
                required
                type="number"
                min="15"
                step="15"
                value={formDuracao}
                onChange={(e) => setFormDuracao(e.target.value)}
                className="rounded-full h-11 text-xs font-mono"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-medium text-on-surface-variant">Descrição do Serviço</Label>
              <Textarea
                rows={3}
                value={formDescricao}
                onChange={(e) => setFormDescricao(e.target.value)}
                placeholder="Detalhes sobre a técnica, produtos utilizados e diferenciais..."
                className="rounded-2xl text-xs resize-none"
              />
            </div>

            <div className="pt-3 flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setModalOpen(false)}
                className="rounded-full text-xs h-10 px-5"
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={saving}
                className="rounded-full text-xs h-10 px-6 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold shadow-md shadow-primary/20"
              >
                {saving ? 'Salvando...' : editingServico ? 'Salvar Alterações' : 'Cadastrar Serviço'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
