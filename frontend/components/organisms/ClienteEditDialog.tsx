'use client';

import React, { useState } from 'react';
import { Edit2 } from 'lucide-react';
import { Cliente } from '@/lib/api';
import { formatarTelefone, validarTelefone } from '@/lib/masks';
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

interface FormFieldsProps {
  nome: string;
  setNome: (v: string) => void;
  telefone: string;
  setTelefone: (v: string) => void;
  email: string;
  setEmail: (v: string) => void;
  dataNascimento: string;
  setDataNascimento: (v: string) => void;
  signo: string;
  setSigno: (v: string) => void;
  tags: string;
  setTags: (v: string) => void;
  alergias: string;
  setAlergias: (v: string) => void;
  preferencias: string;
  setPreferencias: (v: string) => void;
}

function ClienteEditFormFields(props: FormFieldsProps) {
  return (
    <>
      <div className="space-y-1.5">
        <Label className="text-xs font-medium text-on-surface-variant">Nome Completo *</Label>
        <Input
          required
          value={props.nome}
          onChange={(e) => props.setNome(e.target.value)}
          placeholder="Ex: Beatriz Albuquerque"
          className="rounded-full h-11 text-xs"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label className="text-xs font-medium text-on-surface-variant">WhatsApp / Telefone *</Label>
          <Input
            required
            value={props.telefone}
            onChange={(e) => props.setTelefone(formatarTelefone(e.target.value, props.telefone))}
            maxLength={15}
            placeholder="(11) 98765-4321"
            className="rounded-full h-11 text-xs font-mono"
          />
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs font-medium text-on-surface-variant">E-mail</Label>
          <Input
            type="email"
            value={props.email}
            onChange={(e) => props.setEmail(e.target.value)}
            placeholder="cliente@email.com"
            className="rounded-full h-11 text-xs"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label className="text-xs font-medium text-on-surface-variant">Data de Nascimento</Label>
          <Input
            type="date"
            value={props.dataNascimento}
            onChange={(e) => props.setDataNascimento(e.target.value)}
            className="rounded-full h-11 text-xs"
          />
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs font-medium text-on-surface-variant">Signo</Label>
          <Input
            value={props.signo}
            onChange={(e) => props.setSigno(e.target.value)}
            placeholder="Ex: Leão, Virgem"
            className="rounded-full h-11 text-xs"
          />
        </div>
      </div>

      <div className="space-y-1.5">
        <Label className="text-xs font-medium text-on-surface-variant">Tags de Perfil (separadas por vírgula)</Label>
        <Input
          value={props.tags}
          onChange={(e) => props.setTags(e.target.value)}
          placeholder="Ex: VIP, Mechas, Frequente"
          className="rounded-full h-11 text-xs"
        />
      </div>

      <div className="space-y-1.5">
        <Label className="text-xs font-medium text-on-surface-variant">Alergias & Restrições Químicas</Label>
        <Textarea
          value={props.alergias}
          onChange={(e) => props.setAlergias(e.target.value)}
          placeholder="Sensibilidade ao pó descolorante, amônia..."
          className="rounded-2xl text-xs resize-none"
          rows={2}
        />
      </div>

      <div className="space-y-1.5">
        <Label className="text-xs font-medium text-on-surface-variant">Preferências Sensoriais & Cuidados</Label>
        <Textarea
          value={props.preferencias}
          onChange={(e) => props.setPreferencias(e.target.value)}
          placeholder="Café espresso sem açúcar, água morna no lavatório..."
          className="rounded-2xl text-xs resize-none"
          rows={2}
        />
      </div>
    </>
  );
}

interface ClienteEditDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  cliente: Cliente;
  onSave: (payload: Partial<Cliente>) => Promise<void>;
  saving: boolean;
  erro: string | null;
}

function ClienteEditFooter({ saving, onCancel }: { saving: boolean; onCancel: () => void }) {
  return (
    <div className="pt-3 flex items-center justify-end gap-2.5">
      <Button
        type="button"
        variant="outline"
        onClick={onCancel}
        className="rounded-full text-xs h-10 px-5"
      >
        Cancelar
      </Button>
      <Button
        type="submit"
        disabled={saving}
        className="rounded-full text-xs h-10 px-6 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold shadow-md shadow-primary/20 cursor-pointer"
      >
        {saving ? 'Salvando...' : 'Salvar Alterações'}
      </Button>
    </div>
  );
}

interface ClienteEditFormProps {
  cliente: Cliente;
  onSave: (payload: Partial<Cliente>) => Promise<void>;
  saving: boolean;
  erro: string | null;
  onCancel: () => void;
}

function ClienteEditForm({ cliente, onSave, saving, erro, onCancel }: ClienteEditFormProps) {
  const [nome, setNome] = useState(cliente.nome);
  const [telefone, setTelefone] = useState(formatarTelefone(cliente.telefone));
  const [email, setEmail] = useState(cliente.email || '');
  const [dataNascimento, setDataNascimento] = useState(cliente.data_nascimento || '');
  const [signo, setSigno] = useState(cliente.signo || '');
  const [tags, setTags] = useState(cliente.tags || '');
  const [alergias, setAlergias] = useState(cliente.observacoes_alergias || '');
  const [preferencias, setPreferencias] = useState(cliente.preferencias_sensoriais || '');
  const [localErro, setLocalErro] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (nome.trim().length < 3) {
      setLocalErro('O nome deve conter pelo menos 3 caracteres.');
      return;
    }
    const validacaoTel = validarTelefone(telefone);
    if (!validacaoTel.valido) {
      setLocalErro(validacaoTel.mensagem || 'WhatsApp / Telefone inválido.');
      return;
    }
    setLocalErro(null);
    await onSave({
      nome: nome.trim(),
      telefone: telefone.trim(),
      email: email.trim(),
      data_nascimento: dataNascimento || undefined,
      signo: signo.trim(),
      tags: tags.trim(),
      observacoes_alergias: alergias.trim(),
      preferencias_sensoriais: preferencias.trim(),
    });
  };

  return (
    <>
      {(localErro || erro) && (
        <div className="p-3.5 rounded-2xl bg-destructive/10 border border-destructive/20 text-destructive text-xs">
          {localErro || erro}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4 pt-2">
        <ClienteEditFormFields
          nome={nome} setNome={setNome}
          telefone={telefone} setTelefone={setTelefone}
          email={email} setEmail={setEmail}
          dataNascimento={dataNascimento} setDataNascimento={setDataNascimento}
          signo={signo} setSigno={setSigno}
          tags={tags} setTags={setTags}
          alergias={alergias} setAlergias={setAlergias}
          preferencias={preferencias} setPreferencias={setPreferencias}
        />

        <ClienteEditFooter saving={saving} onCancel={onCancel} />
      </form>
    </>
  );
}

export function ClienteEditDialog({
  open,
  onOpenChange,
  cliente,
  onSave,
  saving,
  erro,
}: ClienteEditDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl rounded-3xl p-6 bg-surface-container-lowest border-outline-variant max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-lg font-bold text-on-surface font-heading flex items-center gap-2">
            <Edit2 className="w-5 h-5 text-primary" />
            Editar Perfil da Cliente
          </DialogTitle>
          <DialogDescription className="text-xs text-on-surface-variant">
            Atualize as informações cadastrais, de contato e preferências da cliente.
          </DialogDescription>
        </DialogHeader>

        {open && (
          <ClienteEditForm
            key={cliente.id}
            cliente={cliente}
            onSave={onSave}
            saving={saving}
            erro={erro}
            onCancel={() => onOpenChange(false)}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}
