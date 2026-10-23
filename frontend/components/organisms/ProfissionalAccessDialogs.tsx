'use client';

import React, { useState } from 'react';
import { Trash2, CheckCircle2, RotateCcw } from 'lucide-react';
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

export function ModalDeleteProfissional({
  open,
  onOpenChange,
  prof,
  onConfirm,
  excluindo,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  prof: Profissional | null;
  onConfirm: () => Promise<void>;
  excluindo: boolean;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md rounded-3xl p-6 bg-surface-container-lowest border-outline-variant">
        <DialogHeader>
          <DialogTitle className="text-lg font-bold text-on-surface font-heading flex items-center gap-2 text-destructive">
            <Trash2 className="w-5 h-5" /> Remover Profissional
          </DialogTitle>
          <DialogDescription className="text-xs text-on-surface-variant pt-1">
            Tem certeza que deseja remover <strong>{prof?.nome}</strong> da equipe?
          </DialogDescription>
        </DialogHeader>
        <div className="p-3 bg-surface-container rounded-2xl border border-outline-variant/50 text-[11px] leading-relaxed text-on-surface-variant my-2">
          <strong className="text-on-surface font-semibold">🛡️ Integridade dos Dados:</strong> Se o colaborador possuir atendimentos, seu acesso será desativado preservando os dados.
        </div>
        <div className="pt-3 flex items-center justify-end gap-2.5">
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)} className="rounded-full text-xs h-10 px-5">Cancelar</Button>
          <Button type="button" disabled={excluindo} onClick={onConfirm} className="rounded-full text-xs h-10 px-5 bg-destructive hover:bg-destructive/90 text-white font-semibold cursor-pointer">
            {excluindo ? 'Processando...' : 'Confirmar Remoção'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

interface FormCriarAcessoProps {
  prof: Profissional;
  onCreated: () => Promise<void>;
  onClose: () => void;
}

function FormCriarAcesso({ prof, onCreated, onClose }: FormCriarAcessoProps) {
  const [email, setEmail] = useState(`${prof.nome.toLowerCase().replace(/\s+/g, '.')}@studiomariliacamilo.com`);
  const [perfil, setPerfil] = useState<'admin' | 'profissional'>('profissional');
  const [saving, setSaving] = useState(false);
  const [resultado, setResultado] = useState<{ email: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await api.criarAcessoProfissional(prof.id, email, perfil);
      setResultado({ email: res.email });
      await onCreated();
    } finally {
      setSaving(false);
    }
  };

  if (resultado) {
    return (
      <div className="py-4 space-y-4 text-center">
        <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary mx-auto">
          <CheckCircle2 className="w-7 h-7" />
        </div>
        <h4 className="text-sm font-semibold text-on-surface">Acesso criado com sucesso!</h4>
        <p className="text-xs text-on-surface-variant max-w-xs mx-auto">Instruções e senha provisória foram enviadas para <strong>{resultado.email}</strong>.</p>
        <Button type="button" onClick={onClose} className="w-full rounded-full text-xs h-10 mt-2 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold cursor-pointer">
          Concluir
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 pt-2">
      <div className="space-y-1.5">
        <Label className="text-xs font-medium text-on-surface-variant">Profissional</Label>
        <Input disabled value={prof.nome} className="rounded-full h-11 text-xs bg-surface-container" />
      </div>
      <div className="space-y-1.5">
        <Label className="text-xs font-medium text-on-surface-variant">E-mail de Login</Label>
        <Input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="rounded-full h-11 text-xs" />
      </div>
      <div className="space-y-1.5">
        <Label className="text-xs font-medium text-on-surface-variant">Perfil de Acesso</Label>
        <select value={perfil} onChange={(e) => setPerfil(e.target.value as 'admin' | 'profissional')} className="w-full h-11 px-3 rounded-full border border-outline-variant bg-surface-container-lowest text-xs text-on-surface focus:outline-none focus:ring-2 focus:ring-primary">
          <option value="profissional">Profissional (Acesso restrito aos atendimentos)</option>
          <option value="admin">Administrador (Acesso total)</option>
        </select>
      </div>
      <div className="pt-3 flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={onClose} className="rounded-full text-xs h-10 px-5">Cancelar</Button>
        <Button type="submit" disabled={saving} className="rounded-full text-xs h-10 px-6 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold shadow-md shadow-primary/20 cursor-pointer">
          {saving ? 'Criando e enviando...' : 'Criar Conta & Enviar E-mail'}
        </Button>
      </div>
    </form>
  );
}

export function ModalCriarAcesso({
  open,
  onOpenChange,
  prof,
  onCreated,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  prof: Profissional | null;
  onCreated: () => Promise<void>;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md rounded-3xl p-6 bg-surface-container-lowest border-outline-variant">
        <DialogHeader>
          <DialogTitle className="text-lg font-bold text-on-surface font-heading">Criar Acesso ao Sistema</DialogTitle>
          <DialogDescription className="text-xs text-on-surface-variant">Uma senha temporária será gerada e enviada por e-mail.</DialogDescription>
        </DialogHeader>
        {open && prof && (
          <FormCriarAcesso
            key={prof.id}
            prof={prof}
            onCreated={onCreated}
            onClose={() => onOpenChange(false)}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}

export function ModalResetarSenha({
  open,
  onOpenChange,
  prof,
  onConfirm,
  resetando,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  prof: Profissional | null;
  onConfirm: () => Promise<void>;
  resetando: boolean;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md rounded-3xl p-6 bg-surface-container-lowest border-outline-variant">
        <DialogHeader>
          <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary mb-2">
            <RotateCcw className="w-6 h-6" />
          </div>
          <DialogTitle className="text-lg font-bold text-on-surface font-heading">Redefinir Acesso de {prof?.nome}</DialogTitle>
          <DialogDescription className="text-xs text-on-surface-variant pt-1">Uma nova senha provisória será gerada e enviada por e-mail.</DialogDescription>
        </DialogHeader>
        <div className="space-y-3 py-2">
          <div className="p-3.5 bg-surface-container rounded-2xl border border-outline-variant/50 text-xs space-y-2">
            <span className="truncate font-mono text-on-surface font-medium">{prof?.email_usuario}</span>
            <p className="text-[11px] text-on-surface-variant leading-relaxed">O colaborador receberá uma mensagem institucional com a nova credencial provisória.</p>
          </div>
        </div>
        <div className="pt-2 flex items-center justify-end gap-2.5">
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)} className="rounded-full text-xs h-10 px-5 cursor-pointer">Cancelar</Button>
          <Button type="button" disabled={resetando} onClick={onConfirm} className="rounded-full text-xs h-10 px-5 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold shadow-md shadow-primary/20 cursor-pointer">
            {resetando ? 'Gerando e enviando...' : 'Confirmar e Enviar E-mail'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
