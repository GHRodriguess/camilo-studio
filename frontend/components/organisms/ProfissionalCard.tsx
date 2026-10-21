'use client';

import React from 'react';
import {
  ShieldCheck,
  ShieldAlert,
  KeyRound,
  Mail,
  Edit2,
  UserX,
  UserCheck,
  RotateCcw,
} from 'lucide-react';
import { Profissional } from '@/lib/api';
import { DeleteButton } from '@/components/atoms/DeleteButton';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

interface ProfissionalCardProps {
  prof: Profissional;
  loadingAcaoId: number | null;
  onEditar: (p: Profissional) => void;
  onExcluir: (p: Profissional) => void;
  onResetar: (p: Profissional) => void;
  onToggleAtivo: (p: Profissional) => void;
  onCriarAcesso: (p: Profissional) => void;
}

function ProfissionalCardHeader({
  prof,
  onEditar,
  onExcluir,
}: {
  prof: Profissional;
  onEditar: (p: Profissional) => void;
  onExcluir: (p: Profissional) => void;
}) {
  return (
    <div className="flex items-start justify-between gap-2 mb-4">
      <div className="flex items-start gap-3.5 min-w-0">
        <Avatar className="w-14 h-14 border-2 shadow-sm shrink-0" style={{ borderColor: prof.cor_hex }}>
          <AvatarImage src={prof.foto_url} alt={prof.nome} />
          <AvatarFallback className="bg-primary/10 text-primary font-bold text-base">
            {prof.nome.slice(0, 2).toUpperCase()}
          </AvatarFallback>
        </Avatar>

        <div className="min-w-0 flex-1">
          <h3 className="text-base font-semibold text-on-surface font-heading truncate">{prof.nome}</h3>
          <p className="text-xs text-primary font-medium truncate mt-0.5">{prof.cargo}</p>
          <div className="flex items-center gap-1.5 mt-1.5">
            <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: prof.cor_hex }} />
            <span className="text-[11px] text-on-surface-variant font-medium">
              {prof.ativo ? 'Ativo na Equipe' : 'Inativo na Escala'}
            </span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-1 shrink-0">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => onEditar(prof)}
          className="rounded-full h-8 w-8 text-on-surface-variant hover:text-primary hover:bg-primary/10"
          title="Editar profissional"
        >
          <Edit2 className="w-3.5 h-3.5" />
        </Button>
        <DeleteButton onDelete={() => onExcluir(prof)} title="Remover profissional" />
      </div>
    </div>
  );
}

function ProfissionalCardActions({
  prof,
  loadingAcaoId,
  onResetar,
  onToggleAtivo,
  onCriarAcesso,
}: {
  prof: Profissional;
  loadingAcaoId: number | null;
  onResetar: (p: Profissional) => void;
  onToggleAtivo: (p: Profissional) => void;
  onCriarAcesso: (p: Profissional) => void;
}) {
  const isAtivo = prof.usuario_ativo !== false && prof.ativo;
  return (
    <div className="pt-4 border-t border-outline-variant/40 flex flex-col gap-2.5">
      <div className="flex items-center justify-between gap-2">
        {prof.possui_acesso ? (
          isAtivo ? (
            <Badge variant="outline" className="rounded-full text-[11px] gap-1 text-emerald-600 border-emerald-200 bg-emerald-50/50">
              <ShieldCheck className="w-3 h-3" /> Acesso Ativo
            </Badge>
          ) : (
            <Badge variant="outline" className="rounded-full text-[11px] gap-1 text-amber-700 border-amber-300 bg-amber-50/50">
              <ShieldAlert className="w-3 h-3" /> Acesso Desativado
            </Badge>
          )
        ) : (
          <Badge variant="outline" className="rounded-full text-[11px] gap-1 text-on-surface-variant/70 border-outline-variant bg-surface-container-low">
            Sem Acesso Web
          </Badge>
        )}

        {prof.possui_acesso && (
          <div className="flex items-center gap-1.5">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              disabled={loadingAcaoId === prof.id}
              onClick={() => onResetar(prof)}
              className="rounded-full h-8 px-2.5 text-[11px] text-on-surface-variant hover:text-primary hover:bg-primary/5 cursor-pointer gap-1"
              title="Gerar nova senha provisória e reenviar por e-mail"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Resetar Senha</span>
            </Button>

            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={loadingAcaoId === prof.id}
              onClick={() => onToggleAtivo(prof)}
              className={`rounded-full h-8 px-2.5 text-[11px] cursor-pointer gap-1 transition-all ${
                isAtivo ? 'border-amber-300 text-amber-700 hover:bg-amber-50' : 'border-emerald-300 text-emerald-700 hover:bg-emerald-50'
              }`}
              title={isAtivo ? 'Desativar acesso ao sistema' : 'Reativar acesso ao sistema'}
            >
              {isAtivo ? (
                <>
                  <UserX className="w-3 h-3" />
                  <span>Desativar</span>
                </>
              ) : (
                <>
                  <UserCheck className="w-3 h-3" />
                  <span>Reativar</span>
                </>
              )}
            </Button>
          </div>
        )}
      </div>

      {!prof.possui_acesso && (
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => onCriarAcesso(prof)}
          className="w-full rounded-full text-xs h-9 border-primary/30 text-primary hover:bg-primary/5 cursor-pointer"
        >
          <KeyRound className="w-3.5 h-3.5 mr-1" /> Criar Acesso ao Sistema
        </Button>
      )}
    </div>
  );
}

export function ProfissionalCard({
  prof,
  loadingAcaoId,
  onEditar,
  onExcluir,
  onResetar,
  onToggleAtivo,
  onCriarAcesso,
}: ProfissionalCardProps) {
  return (
    <div className="p-6 rounded-3xl bg-surface-container-lowest border border-outline-variant/60 shadow-sm hover:shadow-md hover:border-primary/40 transition-all flex flex-col justify-between">
      <div>
        <ProfissionalCardHeader prof={prof} onEditar={onEditar} onExcluir={onExcluir} />
        {prof.email_usuario ? (
          <div className="flex items-center gap-1.5 text-xs text-on-surface-variant font-mono mb-4 bg-surface-container-low px-2.5 py-1.5 rounded-xl border border-outline-variant/30">
            <Mail className="w-3.5 h-3.5 text-primary shrink-0" />
            <span className="truncate">{prof.email_usuario}</span>
          </div>
        ) : (
          <div className="flex items-center gap-1.5 text-[11px] text-on-surface-variant/60 mb-4">
            <Mail className="w-3 h-3 text-on-surface-variant/40 shrink-0" />
            <span className="italic">Login ainda não configurado</span>
          </div>
        )}
      </div>

      <ProfissionalCardActions
        prof={prof}
        loadingAcaoId={loadingAcaoId}
        onResetar={onResetar}
        onToggleAtivo={onToggleAtivo}
        onCriarAcesso={onCriarAcesso}
      />
    </div>
  );
}
