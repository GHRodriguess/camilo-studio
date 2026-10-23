'use client';

import React, { useState } from 'react';
import { Edit2 } from 'lucide-react';
import { api, Profissional } from '@/lib/api';
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

export function ModalNovoProfissional({
  open,
  onOpenChange,
  onSaved,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSaved: (msg: string) => void;
}) {
  const [nome, setNome] = useState('');
  const [cargo, setCargo] = useState('Hair Stylist');
  const [email, setEmail] = useState('');
  const [corHex, setCorHex] = useState('#7C3AED');
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const novo = await api.createProfissional({ nome, cargo, cor_hex: corHex, ativo: true });
      if (email.trim()) {
        try {
          await api.criarAcessoProfissional(novo.id, email.trim(), 'profissional');
        } catch {
          // Mantém o cadastro mesmo se falhar o envio de acesso
        }
      }
      onOpenChange(false);
      setNome('');
      setCargo('Hair Stylist');
      setEmail('');
      onSaved('Profissional cadastrado com sucesso!');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md rounded-3xl p-6 bg-surface-container-lowest border-outline-variant">
        <DialogHeader>
          <DialogTitle className="text-lg font-bold text-on-surface font-heading">Cadastrar Novo Profissional</DialogTitle>
          <DialogDescription className="text-xs text-on-surface-variant">Adicione o especialista à equipe do ateliê e configure seu login.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          <div className="space-y-1.5">
            <Label className="text-xs font-medium text-on-surface-variant">Nome Completo</Label>
            <Input required value={nome} onChange={(e) => setNome(e.target.value)} placeholder="Ex: Gabriela Monteiro" className="rounded-full h-11 text-xs" />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs font-medium text-on-surface-variant">Cargo / Especialidade</Label>
            <Input required value={cargo} onChange={(e) => setCargo(e.target.value)} placeholder="Ex: Hair Stylist & Terapeuta Capilar" className="rounded-full h-11 text-xs" />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs font-medium text-on-surface-variant">Cor de Identificação</Label>
            <div className="flex items-center gap-3">
              <Input type="color" value={corHex} onChange={(e) => setCorHex(e.target.value)} className="w-12 h-10 p-1 rounded-xl cursor-pointer" />
              <span className="text-xs font-mono text-on-surface-variant">{corHex}</span>
            </div>
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs font-medium text-on-surface-variant">E-mail Profissional (Opcional)</Label>
            <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Ex: gabriela@camilostudio.com" className="rounded-full h-11 text-xs" />
            <p className="text-[10px] text-on-surface-variant">Se informado, o sistema já gera o acesso com senha provisória enviada por e-mail.</p>
          </div>
          <div className="pt-3 flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} className="rounded-full text-xs h-10 px-5">Cancelar</Button>
            <Button type="submit" disabled={saving} className="rounded-full text-xs h-10 px-6 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold shadow-md shadow-primary/20">
              {saving ? 'Cadastrando...' : 'Cadastrar na Equipe'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

interface FormEditarProfissionalProps {
  prof: Profissional;
  onSaved: (msg: string) => void;
  onClose: () => void;
}

function FormEditarProfissional({ prof, onSaved, onClose }: FormEditarProfissionalProps) {
  const [nome, setNome] = useState(prof.nome);
  const [cargo, setCargo] = useState(prof.cargo);
  const [corHex, setCorHex] = useState(prof.cor_hex || '#7C3AED');
  const [ativo, setAtivo] = useState(prof.ativo);
  const [saving, setSaving] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setErro(null);
    try {
      await api.updateProfissional(prof.id, { nome: nome.trim(), cargo: cargo.trim(), cor_hex: corHex, ativo });
      onClose();
      onSaved('Dados do profissional atualizados com sucesso!');
    } catch (err: unknown) {
      setErro(err instanceof Error ? err.message : 'Erro ao atualizar profissional.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      {erro && <div className="p-3.5 rounded-2xl bg-destructive/10 border border-destructive/20 text-destructive text-xs">{erro}</div>}
      <form onSubmit={handleSubmit} className="space-y-4 pt-2">
        <div className="space-y-1.5">
          <Label className="text-xs font-medium text-on-surface-variant">Nome Completo</Label>
          <Input required value={nome} onChange={(e) => setNome(e.target.value)} className="rounded-full h-11 text-xs" />
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs font-medium text-on-surface-variant">Cargo / Especialidade</Label>
          <Input required value={cargo} onChange={(e) => setCargo(e.target.value)} className="rounded-full h-11 text-xs" />
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs font-medium text-on-surface-variant">Cor de Identificação</Label>
          <div className="flex items-center gap-3">
            <Input type="color" value={corHex} onChange={(e) => setCorHex(e.target.value)} className="w-12 h-10 p-1 rounded-xl cursor-pointer" />
            <span className="text-xs font-mono text-on-surface-variant">{corHex}</span>
          </div>
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs font-medium text-on-surface-variant">Status</Label>
          <div className="flex items-center gap-2">
            <input type="checkbox" id="editAtivo" checked={ativo} onChange={(e) => setAtivo(e.target.checked)} className="rounded text-primary focus:ring-primary h-4 w-4" />
            <label htmlFor="editAtivo" className="text-xs text-on-surface cursor-pointer">Profissional ativo e disponível para agendamentos</label>
          </div>
        </div>
        <div className="pt-3 flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={onClose} className="rounded-full text-xs h-10 px-5">Cancelar</Button>
          <Button type="submit" disabled={saving} className="rounded-full text-xs h-10 px-6 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold shadow-md shadow-primary/20 cursor-pointer">
            {saving ? 'Salvando...' : 'Salvar Alterações'}
          </Button>
        </div>
      </form>
    </>
  );
}

export function ModalEditarProfissional({
  open,
  onOpenChange,
  prof,
  onSaved,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  prof: Profissional | null;
  onSaved: (msg: string) => void;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md rounded-3xl p-6 bg-surface-container-lowest border-outline-variant">
        <DialogHeader>
          <DialogTitle className="text-lg font-bold text-on-surface font-heading flex items-center gap-2">
            <Edit2 className="w-5 h-5 text-primary" /> Editar Membro da Equipe
          </DialogTitle>
          <DialogDescription className="text-xs text-on-surface-variant">Atualize nome, cargo e cor de identificação do profissional.</DialogDescription>
        </DialogHeader>
        {open && prof && (
          <FormEditarProfissional
            key={prof.id}
            prof={prof}
            onSaved={onSaved}
            onClose={() => onOpenChange(false)}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}
