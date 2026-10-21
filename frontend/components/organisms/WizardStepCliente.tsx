'use client';

import React, { useState } from 'react';
import { User, Search, Plus, Phone, X } from 'lucide-react';
import { api, Cliente } from '@/lib/api';
import { formatarTelefone, validarTelefone } from '@/lib/masks';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';

interface ModalNovoClienteProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onClienteCriada: (cliente: Cliente) => void;
  nomeInicial: string;
}

interface FormNovoClienteRapidoProps {
  nomeInicial: string;
  onClienteCriada: (cliente: Cliente) => void;
  onCancel: () => void;
}

function FormNovoClienteRapido({
  nomeInicial,
  onClienteCriada,
  onCancel,
}: FormNovoClienteRapidoProps) {
  const [nome, setNome] = useState(nomeInicial);
  const [telefone, setTelefone] = useState('');
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErro(null);
    const validacao = validarTelefone(telefone);
    if (!validacao.valido) {
      setErro(validacao.mensagem || 'WhatsApp / Telefone inválido.');
      return;
    }
    setSalvando(true);
    try {
      const nova = await api.createCliente({ nome: nome.trim(), telefone: telefone.trim() });
      onClienteCriada(nova);
      onCancel();
    } catch (err: unknown) {
      setErro(err instanceof Error ? err.message : 'Erro ao cadastrar cliente.');
    } finally {
      setSalvando(false);
    }
  };

  return (
    <>
      {erro && <div className="p-3 rounded-2xl bg-destructive/10 border border-destructive/20 text-destructive text-xs">{erro}</div>}
      <form onSubmit={handleSubmit} className="space-y-3 pt-1">
        <div className="space-y-1">
          <Label className="text-xs font-medium text-on-surface-variant">Nome Completo</Label>
          <Input required value={nome} onChange={(e) => setNome(e.target.value)} placeholder="Ex: Beatriz Albuquerque" className="rounded-full h-10 text-xs" />
        </div>
        <div className="space-y-1">
          <Label className="text-xs font-medium text-on-surface-variant">WhatsApp / Telefone</Label>
          <Input required value={telefone} onChange={(e) => setTelefone(formatarTelefone(e.target.value, telefone))} maxLength={15} placeholder="(11) 98765-4321" className="rounded-full h-10 text-xs font-mono" />
        </div>
        <div className="pt-2 flex items-center justify-end gap-2">
          <Button type="button" variant="outline" onClick={onCancel} className="rounded-full text-xs h-9 px-4">Cancelar</Button>
          <Button type="submit" disabled={salvando} className="rounded-full text-xs h-9 px-5 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold shadow-md shadow-primary/20 cursor-pointer">
            {salvando ? 'Cadastrando...' : 'Salvar e Selecionar'}
          </Button>
        </div>
      </form>
    </>
  );
}

function ModalNovoClienteRapido({
  open,
  onOpenChange,
  onClienteCriada,
  nomeInicial,
}: ModalNovoClienteProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[calc(100vw-2rem)] sm:max-w-md rounded-3xl p-5 bg-surface-container-lowest border-outline-variant">
        <DialogHeader>
          <DialogTitle className="text-base font-bold text-on-surface font-heading flex items-center gap-2">
            <User className="w-4 h-4 text-primary" /> Cadastrar Nova Cliente
          </DialogTitle>
          <DialogDescription className="text-xs text-on-surface-variant">
            Cadastre as informações para selecioná-la imediatamente neste agendamento.
          </DialogDescription>
        </DialogHeader>
        {open && (
          <FormNovoClienteRapido
            key={nomeInicial}
            nomeInicial={nomeInicial}
            onClienteCriada={onClienteCriada}
            onCancel={() => onOpenChange(false)}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}

interface StepClienteProps {
  clienteSelecionada: Cliente | null;
  clientesFiltradas: Cliente[];
  searchCliente: string;
  setSearchCliente: (v: string) => void;
  onSelectCliente: (id: number) => void;
  onClearCliente: () => void;
  onClienteCriada: (cliente: Cliente) => void;
}

export function WizardStepCliente(props: StepClienteProps) {
  const [modalNovoOpen, setModalNovoOpen] = useState(false);

  return (
    <div className="space-y-4 sm:space-y-6 min-w-0">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
        <div>
          <span className="text-[11px] uppercase tracking-[0.2em] font-semibold text-primary">Passo 1 de 4</span>
          <h3 className="text-lg sm:text-2xl font-bold text-on-surface font-heading tracking-tight mt-0.5">Quem será atendida?</h3>
          <p className="text-xs text-on-surface-variant mt-0.5">Pesquise a cliente pelo nome ou WhatsApp, ou realize um cadastro rápido.</p>
        </div>
        <Button type="button" variant="outline" size="sm" onClick={() => setModalNovoOpen(true)} className="rounded-full text-xs h-9 px-3.5 border-primary/40 text-primary hover:bg-primary/10 gap-1.5 self-start sm:self-auto cursor-pointer shrink-0">
          <Plus className="w-3.5 h-3.5" /> <span>Nova Cliente</span>
        </Button>
      </div>

      {props.clienteSelecionada ? (
        <div className="p-3.5 sm:p-4 rounded-2xl bg-primary/5 border border-primary/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3 min-w-0 overflow-hidden">
          <div className="flex items-center gap-3 min-w-0 flex-1">
            <div className="w-10 h-10 rounded-full bg-primary/15 text-primary flex items-center justify-center font-bold text-xs shrink-0 font-heading">
              {props.clienteSelecionada.nome.slice(0, 2).toUpperCase()}
            </div>
            <div className="min-w-0 flex-1">
              <span className="text-[10px] uppercase font-semibold tracking-wider text-primary block truncate">Cliente Selecionada</span>
              <p className="text-sm sm:text-base font-bold text-on-surface truncate font-heading">{props.clienteSelecionada.nome}</p>
              <p className="text-xs text-on-surface-variant font-mono flex items-center gap-1.5 mt-0.5 truncate">
                <Phone className="w-3 h-3 text-primary shrink-0" />
                <span>{props.clienteSelecionada.telefone}</span>
              </p>
            </div>
          </div>
          <Button type="button" variant="outline" size="sm" onClick={props.onClearCliente} className="rounded-full text-xs h-8 px-3 border-outline-variant hover:border-primary/50 text-on-surface shrink-0 self-end sm:self-auto cursor-pointer">
            Trocar Cliente
          </Button>
        </div>
      ) : (
        <div className="space-y-3 min-w-0">
          <div className="relative flex items-center w-full min-w-0">
            <Search className="absolute left-3.5 w-4 h-4 text-on-surface-variant pointer-events-none" />
            <Input
              type="text"
              value={props.searchCliente}
              onChange={(e) => props.setSearchCliente(e.target.value)}
              placeholder="Pesquisar por nome ou WhatsApp..."
              className="pl-10 pr-9 h-11 bg-surface-container-lowest border-outline-variant rounded-full text-xs sm:text-sm placeholder:text-on-surface-variant/60 focus-visible:ring-primary shadow-sm"
            />
            {props.searchCliente && (
              <button type="button" onClick={() => props.setSearchCliente('')} className="absolute right-3 p-1 rounded-full text-on-surface-variant hover:text-on-surface hover:bg-surface-container transition-colors">
                <X className="w-3.5 h-3.5" />
                <span className="sr-only">Limpar busca</span>
              </button>
            )}
          </div>

          <div className="border border-outline-variant/60 rounded-2xl max-h-56 sm:max-h-64 overflow-y-auto divide-y divide-outline-variant/40 bg-surface-container-low/30">
            {props.clientesFiltradas.length === 0 ? (
              <div className="p-6 text-center space-y-2.5">
                <User className="w-7 h-7 text-on-surface-variant/50 mx-auto" />
                <p className="text-xs text-on-surface-variant">Nenhuma cliente encontrada com o termo &quot;{props.searchCliente}&quot;.</p>
                <Button type="button" variant="outline" size="sm" onClick={() => setModalNovoOpen(true)} className="rounded-full text-xs h-8 px-3.5 border-primary/40 text-primary hover:bg-primary/10 gap-1.5 cursor-pointer">
                  <Plus className="w-3 h-3" /> <span>Cadastrar &quot;{props.searchCliente}&quot;</span>
                </Button>
              </div>
            ) : (
              props.clientesFiltradas.map((c) => (
                <div key={c.id} onClick={() => props.onSelectCliente(c.id)} className="p-3 sm:p-3.5 flex items-center justify-between gap-2.5 hover:bg-primary/5 cursor-pointer transition-colors min-w-0">
                  <div className="flex items-center gap-2.5 min-w-0 flex-1">
                    <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-surface-container text-primary font-bold text-xs flex items-center justify-center shrink-0">
                      {c.nome.slice(0, 2).toUpperCase()}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs sm:text-sm font-semibold text-on-surface truncate">{c.nome}</p>
                      <p className="text-[11px] text-on-surface-variant font-mono truncate">{c.telefone}</p>
                    </div>
                  </div>
                  <span className="text-xs text-primary font-medium shrink-0">Escolher ➔</span>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      <ModalNovoClienteRapido
        open={modalNovoOpen}
        onOpenChange={setModalNovoOpen}
        onClienteCriada={(nova) => { props.onClienteCriada(nova); props.onSelectCliente(nova.id); }}
        nomeInicial={props.searchCliente}
      />
    </div>
  );
}
