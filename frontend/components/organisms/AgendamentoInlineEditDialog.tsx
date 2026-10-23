'use client';

import React from 'react';
import { Agendamento } from '@/lib/api';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { AgendamentoWizard } from '@/components/organisms/AgendamentoWizard';

interface AgendamentoInlineEditDialogProps {
  agendamento: Agendamento | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: (agendamento: Agendamento) => void;
}

export function AgendamentoInlineEditDialog({
  agendamento,
  open,
  onOpenChange,
  onSuccess,
}: AgendamentoInlineEditDialogProps) {
  if (!agendamento) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[calc(100vw-1.5rem)] sm:w-full sm:max-w-2xl max-h-[92vh] overflow-y-auto overflow-x-hidden rounded-3xl p-4 sm:p-6 bg-surface-container-lowest border-outline-variant">
        <DialogHeader className="sr-only">
          <DialogTitle>Editar Atendimento Existente</DialogTitle>
          <DialogDescription>Edição rápida do agendamento existente da cliente.</DialogDescription>
        </DialogHeader>
        <AgendamentoWizard
          key={`inline-edit-${agendamento.id}`}
          mode="edit"
          initialData={agendamento}
          isModal={true}
          onSuccess={(agAtualizado) => {
            onOpenChange(false);
            onSuccess(agAtualizado);
          }}
          onCancel={() => onOpenChange(false)}
        />
      </DialogContent>
    </Dialog>
  );
}
