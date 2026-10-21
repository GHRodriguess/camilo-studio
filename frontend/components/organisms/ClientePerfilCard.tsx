'use client';

import React from 'react';
import { Phone, Mail, Heart, AlertCircle } from 'lucide-react';
import { Cliente } from '@/lib/api';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';

function ClienteObservacoesSensoriais({
  preferencias,
  alergias,
}: {
  preferencias?: string;
  alergias?: string;
}) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6 pt-6 border-t border-outline-variant/40">
      <div className="p-4 rounded-2xl bg-surface-container-low/80 border border-outline-variant/30 space-y-1">
        <div className="flex items-center gap-1.5 text-xs font-semibold text-primary">
          <Heart className="w-3.5 h-3.5" />
          <span>Preferências Sensoriais & Cuidados</span>
        </div>
        <p className="text-xs text-on-surface leading-relaxed">
          {preferencias || 'Nenhuma preferência personalizada cadastrada.'}
        </p>
      </div>

      <div className="p-4 rounded-2xl bg-surface-container-low/80 border border-outline-variant/30 space-y-1">
        <div className="flex items-center gap-1.5 text-xs font-semibold text-amber-700">
          <AlertCircle className="w-3.5 h-3.5" />
          <span>Alergias & Restrições Químicas</span>
        </div>
        <p className="text-xs text-on-surface leading-relaxed">
          {alergias || 'Nenhuma restrição química relatada.'}
        </p>
      </div>
    </div>
  );
}

export function ClientePerfilCard({ cliente }: { cliente: Cliente }) {
  const tags = cliente.tags ? cliente.tags.split(',').map((t) => t.trim()) : [];

  return (
    <div className="p-6 sm:p-8 rounded-[2.5rem] bg-surface-container-lowest border border-outline-variant/60 shadow-sm relative overflow-hidden">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div className="flex items-start sm:items-center gap-4">
          <Avatar className="w-16 h-16 sm:w-20 sm:h-20 border-2 border-primary/20 shadow-md">
            <AvatarImage src={cliente.foto_url} alt={cliente.nome} />
            <AvatarFallback className="bg-primary/10 text-primary font-bold text-xl">
              {cliente.nome.slice(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>

          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-xl sm:text-2xl font-bold text-on-surface font-heading">
                {cliente.nome}
              </h1>
              {tags.map((tag, i) => (
                <Badge
                  key={i}
                  variant="secondary"
                  className="rounded-full text-[10px] px-2.5 py-0.5 bg-surface-container-high text-primary font-medium"
                >
                  {tag}
                </Badge>
              ))}
            </div>

            <div className="flex flex-wrap items-center gap-3 text-xs text-on-surface-variant font-mono">
              <a
                href={`https://wa.me/55${cliente.telefone.replace(/\D/g, '')}`}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1 hover:text-emerald-600 transition-colors"
              >
                <Phone className="w-3 h-3 text-primary" />
                {cliente.telefone}
              </a>
              {cliente.email && (
                <span className="flex items-center gap-1">
                  <Mail className="w-3 h-3 text-primary" />
                  {cliente.email}
                </span>
              )}
              {cliente.data_nascimento && (
                <span className="text-on-surface-variant">
                  🎂 {new Date(cliente.data_nascimento + 'T12:00:00').toLocaleDateString('pt-BR')}
                </span>
              )}
              {cliente.signo && (
                <span className="text-on-surface-variant">✨ {cliente.signo}</span>
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-2 gap-3 shrink-0">
          <div className="p-3.5 rounded-2xl bg-surface-container-low border border-outline-variant/40 text-center">
            <p className="text-[10px] uppercase tracking-wider text-on-surface-variant font-semibold">Total Investido</p>
            <p className="text-base font-bold text-primary font-heading mt-0.5">
              R$ {Number(cliente.total_investido).toFixed(2).replace('.', ',')}
            </p>
          </div>
          <div className="p-3.5 rounded-2xl bg-surface-container-low border border-outline-variant/40 text-center">
            <p className="text-[10px] uppercase tracking-wider text-on-surface-variant font-semibold">Visitas</p>
            <p className="text-base font-bold text-on-surface font-heading mt-0.5">{cliente.visitas_realizadas} no ateliê</p>
          </div>
        </div>
      </div>

      <ClienteObservacoesSensoriais
        preferencias={cliente.preferencias_sensoriais}
        alergias={cliente.observacoes_alergias}
      />
    </div>
  );
}
