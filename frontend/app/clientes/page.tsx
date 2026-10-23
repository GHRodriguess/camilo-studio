'use client';

import React, { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Users,
  UserPlus,
  Phone,
  Calendar,
  ChevronRight,
  Edit2,
  Trash2,
} from 'lucide-react';
import { api, Cliente } from '@/lib/api';
import { formatarTelefone, validarTelefone } from '@/lib/masks';
import { SearchBar } from '@/components/molecules/SearchBar';
import { EmptyState } from '@/components/atoms/EmptyState';
import { NoSearchResultsState } from '@/components/atoms/NoSearchResultsState';
import { LoadingState } from '@/components/atoms/LoadingState';
import { DeleteButton } from '@/components/atoms/DeleteButton';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
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

function ClientesHeader() {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        <span className="text-xs uppercase tracking-[0.2em] font-semibold text-primary">Dossiê de Fidelidade</span>
        <h1 className="text-2xl sm:text-3xl font-bold text-on-surface font-heading tracking-tight mt-0.5">Gestão de Clientes</h1>
        <p className="text-xs sm:text-sm text-on-surface-variant">Histórico de visitas, preferências sensoriais e fórmulas químicas registradas.</p>
      </div>
      <Link href="/clientes/novo" className="inline-flex items-center justify-center rounded-full h-11 px-6 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold shadow-md shadow-primary/20 shrink-0 text-sm cursor-pointer">
        <UserPlus className="w-4 h-4 mr-1.5" />
        Nova Cliente
      </Link>
    </div>
  );
}

function ClienteCard({ cliente, onEditar, onExcluir }: { cliente: Cliente; onEditar: (e: React.MouseEvent) => void; onExcluir: () => void }) {
  const tags = cliente.tags ? cliente.tags.split(',').map((t) => t.trim()) : [];
  const isVip = tags.some((t) => t.toUpperCase() === 'VIP');

  return (
    <div className="group p-5 rounded-3xl bg-surface-container-lowest border border-outline-variant/60 shadow-sm hover:shadow-md hover:border-primary/40 transition-all flex flex-col justify-between">
      <div>
        <div className="flex items-start gap-3.5 mb-3.5">
          <Link href={`/clientes/${cliente.id}`} className="shrink-0">
            <Avatar className="w-12 h-12 border border-outline-variant hover:border-primary transition-colors cursor-pointer">
              <AvatarImage src={cliente.foto_url} alt={cliente.nome} />
              <AvatarFallback className="bg-primary/10 text-primary font-bold text-sm">
                {cliente.nome.slice(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
          </Link>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5 flex-wrap">
              <Link href={`/clientes/${cliente.id}`} className="text-base font-semibold text-on-surface font-heading truncate hover:text-primary transition-colors block cursor-pointer">
                {cliente.nome}
              </Link>
              {isVip && <Badge className="bg-amber-100 text-amber-800 border-amber-300 text-[10px] px-2 py-0 rounded-full font-semibold">VIP</Badge>}
            </div>
            <a href={`https://wa.me/55${cliente.telefone.replace(/\D/g, '')}`} target="_blank" rel="noreferrer" className="text-xs text-on-surface-variant font-mono mt-0.5 flex items-center gap-1 hover:text-emerald-600 transition-colors">
              <Phone className="w-3 h-3 text-primary/70" />
              {cliente.telefone}
            </a>
          </div>
          <Link href={`/clientes/${cliente.id}`}>
            <ChevronRight className="w-4 h-4 text-on-surface-variant group-hover:translate-x-1 group-hover:text-primary transition-all shrink-0 mt-1 cursor-pointer" />
          </Link>
        </div>
        {tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-3">
            {tags.map((tag, idx) => (
              <span key={idx} className="px-2.5 py-0.5 rounded-full text-[10px] bg-surface-container text-on-surface-variant font-medium">{tag}</span>
            ))}
          </div>
        )}
        {cliente.preferencias_sensoriais && (
          <p className="text-[11px] text-on-surface-variant/80 italic line-clamp-1 bg-surface-container-low/70 p-2 rounded-xl mb-3">
            ☕ {cliente.preferencias_sensoriais}
          </p>
        )}
      </div>
      <div className="pt-3 border-t border-outline-variant/40 flex items-center justify-between text-xs gap-2">
        <div className="flex items-center gap-1 text-on-surface-variant shrink-0">
          <Calendar className="w-3.5 h-3.5 text-primary" />
          <span>{cliente.visitas_realizadas} visitas</span>
        </div>
        <div className="flex items-center gap-1.5 shrink-0">
          <span className="font-heading font-semibold text-on-surface mr-1">
            R$ {Number(cliente.total_investido).toFixed(2).replace('.', ',')}
          </span>
          <Button variant="ghost" size="icon" onClick={onEditar} className="rounded-full h-8 w-8 text-on-surface-variant hover:text-primary hover:bg-primary/10" title="Editar dados da cliente">
            <Edit2 className="w-3.5 h-3.5" />
          </Button>
          <DeleteButton onDelete={onExcluir} title="Excluir cadastro" />
        </div>
      </div>
    </div>
  );
}

interface EditDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  cliente: Cliente | null;
  onSaved: () => Promise<void>;
}

interface ClienteEditFormInnerProps {
  cliente: Cliente;
  onSaved: () => Promise<void>;
  onClose: () => void;
}

function ClienteEditFormInner({ cliente, onSaved, onClose }: ClienteEditFormInnerProps) {
  const [nome, setNome] = useState(cliente.nome);
  const [telefone, setTelefone] = useState(formatarTelefone(cliente.telefone));
  const [email, setEmail] = useState(cliente.email || '');
  const [tags, setTags] = useState(cliente.tags || '');
  const [alergias, setAlergias] = useState(cliente.observacoes_alergias || '');
  const [preferencias, setPreferencias] = useState(cliente.preferencias_sensoriais || '');
  const [saving, setSaving] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  const handleSalvar = async (e: React.FormEvent) => {
    e.preventDefault();
    if (nome.trim().length < 3) { setErro('O nome deve conter pelo menos 3 caracteres.'); return; }
    const validacaoTel = validarTelefone(telefone);
    if (!validacaoTel.valido) { setErro(validacaoTel.mensagem || 'Telefone inválido.'); return; }
    setSaving(true);
    setErro(null);
    try {
      await api.updateCliente(cliente.id, {
        nome: nome.trim(),
        telefone: telefone.trim(),
        email: email.trim(),
        tags: tags.trim(),
        observacoes_alergias: alergias.trim(),
        preferencias_sensoriais: preferencias.trim(),
      });
      onClose();
      await onSaved();
    } catch (err: unknown) {
      setErro(err instanceof Error ? err.message : 'Erro ao salvar alterações.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      {erro && <div className="p-3.5 rounded-2xl bg-destructive/10 border border-destructive/20 text-destructive text-xs">{erro}</div>}
      <form onSubmit={handleSalvar} className="space-y-4 pt-2">
        <div className="space-y-1.5">
          <Label className="text-xs font-medium text-on-surface-variant">Nome Completo *</Label>
          <Input required value={nome} onChange={(e) => setNome(e.target.value)} placeholder="Ex: Beatriz Albuquerque" className="rounded-full h-11 text-xs" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label className="text-xs font-medium text-on-surface-variant">WhatsApp / Telefone *</Label>
            <Input required value={telefone} onChange={(e) => setTelefone(formatarTelefone(e.target.value, telefone))} maxLength={15} placeholder="(11) 98765-4321" className="rounded-full h-11 text-xs font-mono" />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs font-medium text-on-surface-variant">E-mail</Label>
            <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="cliente@email.com" className="rounded-full h-11 text-xs" />
          </div>
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs font-medium text-on-surface-variant">Tags de Perfil</Label>
          <Input value={tags} onChange={(e) => setTags(e.target.value)} placeholder="Ex: VIP, Loiros, Frequente" className="rounded-full h-11 text-xs" />
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs font-medium text-on-surface-variant">Preferências Sensoriais & Cuidados</Label>
          <Textarea value={preferencias} onChange={(e) => setPreferencias(e.target.value)} placeholder="Café espresso..." className="rounded-2xl text-xs resize-none" rows={2} />
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs font-medium text-on-surface-variant">Alergias & Restrições Químicas</Label>
          <Textarea value={alergias} onChange={(e) => setAlergias(e.target.value)} placeholder="Sensibilidade ao descolorante..." className="rounded-2xl text-xs resize-none" rows={2} />
        </div>
        <div className="pt-3 flex items-center justify-end gap-2.5">
          <Button type="button" variant="outline" onClick={onClose} className="rounded-full text-xs h-10 px-5">Cancelar</Button>
          <Button type="submit" disabled={saving} className="rounded-full text-xs h-10 px-6 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold shadow-md shadow-primary/20 cursor-pointer">
            {saving ? 'Salvando...' : 'Salvar Alterações'}
          </Button>
        </div>
      </form>
    </>
  );
}

function ClienteEditDialog({ open, onOpenChange, cliente, onSaved }: EditDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg rounded-3xl p-6 bg-surface-container-lowest border-outline-variant max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-lg font-bold text-on-surface font-heading flex items-center gap-2">
            <Edit2 className="w-5 h-5 text-primary" /> Editar Dados da Cliente
          </DialogTitle>
          <DialogDescription className="text-xs text-on-surface-variant">Corrija nome, WhatsApp, e-mail e preferências.</DialogDescription>
        </DialogHeader>
        {open && cliente && (
          <ClienteEditFormInner
            key={cliente.id}
            cliente={cliente}
            onSaved={onSaved}
            onClose={() => onOpenChange(false)}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}

function ClienteDeleteDialog({ open, onOpenChange, cliente, onDeleted }: { open: boolean; onOpenChange: (open: boolean) => void; cliente: Cliente | null; onDeleted: () => Promise<void> }) {
  const [deletando, setDeletando] = useState(false);

  const handleExcluir = async () => {
    if (!cliente) return;
    setDeletando(true);
    try {
      await api.deleteCliente(cliente.id);
      onOpenChange(false);
      await onDeleted();
    } finally {
      setDeletando(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md rounded-3xl p-6 bg-surface-container-lowest border-outline-variant">
        <DialogHeader>
          <DialogTitle className="text-lg font-bold text-on-surface font-heading flex items-center gap-2 text-destructive">
            <Trash2 className="w-5 h-5" /> Excluir Cliente
          </DialogTitle>
          <DialogDescription className="text-xs text-on-surface-variant">
            Tem certeza que deseja remover o cadastro de <strong>{cliente?.nome}</strong>?
          </DialogDescription>
        </DialogHeader>
        <div className="pt-3 flex items-center justify-end gap-2.5">
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)} className="rounded-full text-xs h-10 px-5">Cancelar</Button>
          <Button type="button" disabled={deletando} onClick={handleExcluir} className="rounded-full text-xs h-10 px-5 bg-destructive hover:bg-destructive/90 text-white font-semibold cursor-pointer">
            {deletando ? 'Excluindo...' : 'Confirmar Exclusão'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default function ClientesPage() {
  const router = useRouter();
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [modalEditOpen, setModalEditOpen] = useState(false);
  const [clienteEditando, setClienteEditando] = useState<Cliente | null>(null);
  const [modalDeleteOpen, setModalDeleteOpen] = useState(false);
  const [clienteExcluindo, setClienteExcluindo] = useState<Cliente | null>(null);

  const carregar = async () => {
    try {
      const data = await api.getClientes();
      setClientes(Array.isArray(data) ? data : data.results || []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { carregar(); }, []);

  const clientesFiltrados = useMemo(() => {
    return clientes.filter(
      (c) =>
        c.nome.toLowerCase().includes(search.toLowerCase()) ||
        c.telefone.includes(search) ||
        (c.tags && c.tags.toLowerCase().includes(search.toLowerCase()))
    );
  }, [clientes, search]);

  return (
    <div className="space-y-6">
      <ClientesHeader />
      <SearchBar value={search} onChange={setSearch} placeholder="Buscar cliente por nome, telefone ou tag (VIP, Loiros)..." />
      {loading ? (
        <LoadingState message="Carregando clientes cadastradas..." />
      ) : clientes.length === 0 ? (
        <EmptyState icon={Users} title="Nenhuma cliente cadastrada" description="Inicie a base de clientes do Studio Marilia Camilo registrando a primeira cliente." actionLabel="Cadastrar Nova Cliente" onAction={() => router.push('/clientes/novo')} />
      ) : clientesFiltrados.length === 0 ? (
        <NoSearchResultsState searchTerm={search} onClear={() => setSearch('')} />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {clientesFiltrados.map((cliente) => (
            <ClienteCard
              key={cliente.id}
              cliente={cliente}
              onEditar={(e) => { e.preventDefault(); e.stopPropagation(); setClienteEditando(cliente); setModalEditOpen(true); }}
              onExcluir={() => { setClienteExcluindo(cliente); setModalDeleteOpen(true); }}
            />
          ))}
        </div>
      )}
      <ClienteEditDialog open={modalEditOpen} onOpenChange={setModalEditOpen} cliente={clienteEditando} onSaved={carregar} />
      <ClienteDeleteDialog open={modalDeleteOpen} onOpenChange={setModalDeleteOpen} cliente={clienteExcluindo} onDeleted={carregar} />
    </div>
  );
}
