'use client';

import React, { useState } from 'react';
import { MessageSquare, Trash2 } from 'lucide-react';
import { api, Agendamento } from '@/lib/api';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { AgendamentoWizard } from '@/components/organisms/AgendamentoWizard';

export interface WhatsappPayload {
  agendamento_id: number;
  cliente: string;
  telefone: string;
  mensagem: string;
  link_whatsapp: string;
}

function AgendaWhatsappDialog({
  open,
  onOpenChange,
  payload,
  onDisparar,
  confirmando,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  payload: WhatsappPayload | null;
  onDisparar: () => void;
  confirmando: boolean;
}) {
  if (!payload) return null;
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md rounded-3xl p-6 bg-surface-container-lowest border-outline-variant">
        <DialogHeader>
          <DialogTitle className="text-lg font-bold text-on-surface font-heading flex items-center gap-2 text-emerald-600">
            <MessageSquare className="w-5 h-5" /> Enviar Confirmação WhatsApp
          </DialogTitle>
          <DialogDescription className="text-xs text-on-surface-variant">
            O Studio Marilia Camilo preparou uma mensagem elegante para a cliente.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 pt-2">
          <div className="p-4 rounded-2xl bg-surface-container-low border border-outline-variant/40 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-on-surface">{payload.cliente}</span>
              <span className="text-on-surface-variant font-mono">{payload.telefone}</span>
            </div>
            <div className="p-3 rounded-xl bg-surface-container-lowest border border-outline-variant/30 text-xs text-on-surface whitespace-pre-wrap font-sans max-h-48 overflow-y-auto">
              {payload.mensagem}
            </div>
          </div>
          <div className="flex items-center justify-end gap-2.5 pt-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} className="rounded-full text-xs h-10 px-5">
              Fechar
            </Button>
            <Button
              type="button"
              onClick={onDisparar}
              disabled={confirmando}
              className="rounded-full text-xs h-10 px-6 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold shadow-md shadow-emerald-600/20 gap-1.5 cursor-pointer"
            >
              <MessageSquare className="w-4 h-4" /> <span>{confirmando ? 'Confirmando...' : 'Abrir WhatsApp & Confirmar'}</span>
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function AgendaDeleteDialog({
  open,
  onOpenChange,
  ag,
  onConfirm,
  excluindo,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  ag: Agendamento | null;
  onConfirm: () => void;
  excluindo: boolean;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md rounded-3xl p-6 bg-surface-container-lowest border-outline-variant">
        <DialogHeader>
          <DialogTitle className="text-lg font-bold text-on-surface font-heading flex items-center gap-2 text-destructive">
            <Trash2 className="w-5 h-5" /> Excluir Agendamento
          </DialogTitle>
          <DialogDescription className="text-xs text-on-surface-variant">
            Tem certeza que deseja remover este agendamento? Esta ação não pode ser desfeita.
          </DialogDescription>
        </DialogHeader>
        {ag && (
          <div className="py-2 text-xs text-on-surface-variant space-y-1">
            <p><strong className="text-on-surface">Cliente:</strong> {ag.cliente_detalhes?.nome}</p>
            <p><strong className="text-on-surface">Horário:</strong> {new Date(ag.data_hora_inicio).toLocaleString('pt-BR')}</p>
          </div>
        )}
        <div className="flex items-center justify-end gap-2.5 pt-3">
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)} className="rounded-full text-xs h-10 px-5">
            Cancelar
          </Button>
          <Button
            type="button"
            variant="destructive"
            disabled={excluindo}
            onClick={onConfirm}
            className="rounded-full text-xs h-10 px-5 bg-destructive hover:bg-destructive/90 text-destructive-foreground font-semibold shadow-sm cursor-pointer"
          >
            {excluindo ? 'Excluindo...' : 'Sim, Excluir'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function AgendaEditModal({
  open,
  onOpenChange,
  ag,
  onSaved,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  ag: Agendamento | null;
  onSaved: () => Promise<void>;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[calc(100vw-1.5rem)] sm:w-full sm:max-w-2xl max-h-[92vh] overflow-y-auto overflow-x-hidden rounded-3xl p-4 sm:p-6 bg-surface-container-lowest border-outline-variant">
        <DialogHeader className="sr-only">
          <DialogTitle>Editar Agendamento</DialogTitle>
          <DialogDescription>Edição passo a passo do agendamento.</DialogDescription>
        </DialogHeader>
        {ag && (
          <AgendamentoWizard
            key={`edit-${ag.id}`}
            mode="edit"
            initialData={ag}
            isModal={true}
            onSuccess={async () => {
              onOpenChange(false);
              await onSaved();
            }}
            onCancel={() => onOpenChange(false)}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}

export interface AgendaModalsProps {
  editOpen: boolean;
  onEditOpenChange: (open: boolean) => void;
  editingAgendamento: Agendamento | null;
  deleteOpen: boolean;
  onDeleteOpenChange: (open: boolean) => void;
  agendamentoParaExcluir: Agendamento | null;
  whatsappOpen: boolean;
  onWhatsappOpenChange: (open: boolean) => void;
  payloadWhatsapp: WhatsappPayload | null;
  onReload: () => Promise<void>;
}

export function AgendaModals(props: AgendaModalsProps) {
  const [confirmando, setConfirmando] = useState(false);
  const [excluindo, setExcluindo] = useState(false);

  const handleDispararWhatsapp = async () => {
    if (!props.payloadWhatsapp) return;
    setConfirmando(true);
    try {
      window.open(props.payloadWhatsapp.link_whatsapp, '_blank');
      await api.confirmarWhatsapp(props.payloadWhatsapp.agendamento_id);
      props.onWhatsappOpenChange(false);
      await props.onReload();
    } finally {
      setConfirmando(false);
    }
  };

  const handleConfirmarExclusao = async () => {
    if (!props.agendamentoParaExcluir) return;
    setExcluindo(true);
    try {
      await api.deleteAgendamento(props.agendamentoParaExcluir.id);
      props.onDeleteOpenChange(false);
      await props.onReload();
    } finally {
      setExcluindo(false);
    }
  };

  return (
    <>
      <AgendaEditModal
        open={props.editOpen}
        onOpenChange={props.onEditOpenChange}
        ag={props.editingAgendamento}
        onSaved={props.onReload}
      />
      <AgendaDeleteDialog
        open={props.deleteOpen}
        onOpenChange={props.onDeleteOpenChange}
        ag={props.agendamentoParaExcluir}
        onConfirm={handleConfirmarExclusao}
        excluindo={excluindo}
      />
      <AgendaWhatsappDialog
        open={props.whatsappOpen}
        onOpenChange={props.onWhatsappOpenChange}
        payload={props.payloadWhatsapp}
        onDisparar={handleDispararWhatsapp}
        confirmando={confirmando}
      />
    </>
  );
}
