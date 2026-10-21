'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { AgendamentoWizard } from '@/components/organisms/AgendamentoWizard';

export default function NovoAgendamentoPage() {
  const router = useRouter();

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Voltar para a Agenda */}
      <Link
        href="/agenda"
        className="inline-flex items-center gap-1.5 text-xs text-on-surface-variant hover:text-primary transition-colors cursor-pointer"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        <span>Voltar para a Agenda</span>
      </Link>

      <div className="mb-2">
        <span className="text-xs uppercase tracking-[0.2em] font-semibold text-primary">
          Novo Atendimento
        </span>
        <h1 className="text-2xl sm:text-3xl font-bold text-on-surface font-heading tracking-tight mt-0.5">
          Marcar Agendamento
        </h1>
        <p className="text-xs sm:text-sm text-on-surface-variant mt-1">
          Siga as etapas para selecionar a cliente, procedimentos e definir a data e horário.
        </p>
      </div>

      <AgendamentoWizard
        mode="create"
        onSuccess={() => {
          router.push('/agenda');
        }}
        onCancel={() => {
          router.push('/agenda');
        }}
      />
    </div>
  );
}
