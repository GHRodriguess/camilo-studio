'use client';

import React, { useEffect, useState, useCallback, use } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, FlaskConical, Plus, Edit2, Trash2 } from 'lucide-react';
import { api, Cliente, FormulaQuimica, Profissional } from '@/lib/api';
import { extractApiErrorMessage } from '@/lib/errors';
import { LoadingState } from '@/components/atoms/LoadingState';
import { DeleteButton } from '@/components/atoms/DeleteButton';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { ClientePerfilCard } from '@/components/organisms/ClientePerfilCard';
import { ClienteEditDialog } from '@/components/organisms/ClienteEditDialog';
import { FormulaCard } from '@/components/organisms/FormulaCard';
import { FormulaFormDialog, FormulaFormData } from '@/components/organisms/FormulaFormDialog';
import { FormulaDeleteDialog } from '@/components/organisms/FormulaDeleteDialog';

function ClienteActionsHeader({
  onEditar,
  onExcluir,
  onNovaFormula,
}: {
  onEditar: () => void;
  onExcluir: () => void;
  onNovaFormula: () => void;
}) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <Link
        href="/clientes"
        className="inline-flex items-center gap-1.5 text-xs text-on-surface-variant hover:text-primary transition-colors cursor-pointer"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        <span>Voltar para Clientes</span>
      </Link>

      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          onClick={onEditar}
          className="rounded-full h-10 px-4 text-xs border border-outline-variant hover:border-primary/50 text-on-surface cursor-pointer gap-1.5"
        >
          <Edit2 className="w-3.5 h-3.5 text-primary" />
          <span>Editar Perfil</span>
        </Button>
        <DeleteButton onDelete={onExcluir} title="Excluir cadastro desta cliente" />
        <Button
          onClick={onNovaFormula}
          className="rounded-full h-10 px-5 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold text-xs shadow-md shadow-primary/20 cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5 mr-1" />
          Nova Fórmula Química
        </Button>
      </div>
    </div>
  );
}

function ClienteDeleteDialog({
  open,
  onOpenChange,
  clienteNome,
  onConfirm,
  excluindo,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  clienteNome: string;
  onConfirm: () => Promise<void>;
  excluindo: boolean;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md rounded-3xl p-6 bg-surface-container-lowest border-outline-variant">
        <DialogHeader>
          <DialogTitle className="text-lg font-bold text-on-surface font-heading flex items-center gap-2 text-destructive">
            <Trash2 className="w-5 h-5" />
            Excluir Cadastro da Cliente
          </DialogTitle>
          <DialogDescription className="text-xs text-on-surface-variant">
            Tem certeza que deseja remover o cadastro de <strong>{clienteNome}</strong>? Todas as fórmulas químicas e registros vinculados serão excluídos permanentemente.
          </DialogDescription>
        </DialogHeader>
        <div className="pt-3 flex items-center justify-end gap-2.5">
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)} className="rounded-full text-xs h-10 px-5">
            Cancelar
          </Button>
          <Button
            type="button"
            disabled={excluindo}
            onClick={onConfirm}
            className="rounded-full text-xs h-10 px-5 bg-destructive hover:bg-destructive/90 text-white font-semibold cursor-pointer"
          >
            {excluindo ? 'Excluindo...' : 'Confirmar Exclusão'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function FormulasSection({
  formulas,
  copiadoId,
  onCopiar,
  onEditar,
  onExcluir,
  onNovaFormula,
}: {
  formulas: FormulaQuimica[];
  copiadoId: number | null;
  onCopiar: (f: FormulaQuimica) => void;
  onEditar: (f: FormulaQuimica) => void;
  onExcluir: (f: FormulaQuimica) => void;
  onNovaFormula: () => void;
}) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <FlaskConical className="w-5 h-5 text-primary" />
          <h2 className="text-lg font-bold text-on-surface font-heading">Histórico Técnico de Fórmulas</h2>
        </div>
        <span className="text-xs text-on-surface-variant font-medium">{formulas.length} procedimento(s) registrado(s)</span>
      </div>

      {formulas.length === 0 ? (
        <div className="p-8 rounded-3xl border border-dashed border-outline-variant text-center bg-surface-container-low/40">
          <FlaskConical className="w-10 h-10 text-on-surface-variant mx-auto mb-2" />
          <p className="text-sm font-semibold text-on-surface">Nenhuma fórmula registrada ainda</p>
          <p className="text-xs text-on-surface-variant mt-1">Registre a proporção e oxidante utilizados para manter a consistência de cor da cliente.</p>
          <Button onClick={onNovaFormula} variant="outline" size="sm" className="rounded-full mt-4 text-xs">
            Adicionar primeira fórmula
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          {formulas.map((formula) => (
            <FormulaCard
              key={formula.id}
              formula={formula}
              copiado={copiadoId === formula.id}
              onCopiar={onCopiar}
              onEditar={onEditar}
              onExcluir={onExcluir}
            />
          ))}
        </div>
      )}
    </div>
  );
}

interface DialogsProps {
  cliente: Cliente;
  setCliente: (c: Cliente) => void;
  clienteId: number;
  equipe: Profissional[];
  onFormulasChanged: () => Promise<void>;
  editOpen: boolean;
  onEditOpenChange: (open: boolean) => void;
  deleteOpen: boolean;
  onDeleteOpenChange: (open: boolean) => void;
  formulaOpen: boolean;
  onFormulaOpenChange: (open: boolean) => void;
  editingFormula: FormulaQuimica | null;
  deleteFormulaOpen: boolean;
  onDeleteFormulaOpenChange: (open: boolean) => void;
  formulaParaExcluir: FormulaQuimica | null;
  setFormulaParaExcluir: (f: FormulaQuimica | null) => void;
}

function ClienteDialogsSection(props: DialogsProps) {
  const router = useRouter();
  const [savingCliente, setSavingCliente] = useState(false);
  const [erroEditCliente, setErroEditCliente] = useState<string | null>(null);
  const [excluindoCliente, setExcluindoCliente] = useState(false);
  const [savingFormula, setSavingFormula] = useState(false);
  const [excluindoFormula, setExcluindoFormula] = useState(false);

  const handleSalvarCliente = async (payload: Partial<Cliente>) => {
    setSavingCliente(true);
    setErroEditCliente(null);
    try {
      const atualizado = await api.updateCliente(props.cliente.id, payload);
      props.setCliente(atualizado);
      props.onEditOpenChange(false);
    } catch (err: unknown) {
      setErroEditCliente(extractApiErrorMessage(err));
    } finally {
      setSavingCliente(false);
    }
  };

  const handleExcluirCliente = async () => {
    setExcluindoCliente(true);
    try {
      await api.deleteCliente(props.cliente.id);
      props.onDeleteOpenChange(false);
      router.push('/clientes');
    } finally {
      setExcluindoCliente(false);
    }
  };

  const handleSalvarFormula = async (payload: FormulaFormData, formulaId?: number) => {
    setSavingFormula(true);
    try {
      if (formulaId) await api.updateFormula(formulaId, payload);
      else await api.createFormula(payload);
      props.onFormulaOpenChange(false);
      await props.onFormulasChanged();
    } finally {
      setSavingFormula(false);
    }
  };

  const handleExcluirFormula = async () => {
    if (!props.formulaParaExcluir) return;
    setExcluindoFormula(true);
    try {
      await api.deleteFormula(props.formulaParaExcluir.id);
      props.onDeleteFormulaOpenChange(false);
      props.setFormulaParaExcluir(null);
      await props.onFormulasChanged();
    } finally {
      setExcluindoFormula(false);
    }
  };

  return (
    <>
      <ClienteEditDialog open={props.editOpen} onOpenChange={props.onEditOpenChange} cliente={props.cliente} onSave={handleSalvarCliente} saving={savingCliente} erro={erroEditCliente} />
      <ClienteDeleteDialog open={props.deleteOpen} onOpenChange={props.onDeleteOpenChange} clienteNome={props.cliente.nome} onConfirm={handleExcluirCliente} excluindo={excluindoCliente} />
      <FormulaFormDialog open={props.formulaOpen} onOpenChange={props.onFormulaOpenChange} editingFormula={props.editingFormula} equipe={props.equipe} clienteId={props.clienteId} onSave={handleSalvarFormula} saving={savingFormula} />
      <FormulaDeleteDialog open={props.deleteFormulaOpen} onOpenChange={props.onDeleteFormulaOpenChange} formula={props.formulaParaExcluir} onConfirm={handleExcluirFormula} excluindo={excluindoFormula} />
    </>
  );
}

export default function ClienteDetalhesPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const clienteId = parseInt(id, 10);

  const [cliente, setCliente] = useState<Cliente | null>(null);
  const [formulas, setFormulas] = useState<FormulaQuimica[]>([]);
  const [equipe, setEquipe] = useState<Profissional[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalEditClienteOpen, setModalEditClienteOpen] = useState(false);
  const [modalDeleteClienteOpen, setModalDeleteClienteOpen] = useState(false);
  const [modalFormulaOpen, setModalFormulaOpen] = useState(false);
  const [editingFormula, setEditingFormula] = useState<FormulaQuimica | null>(null);
  const [copiadoId, setCopiadoId] = useState<number | null>(null);
  const [modalDeleteFormulaOpen, setModalDeleteFormulaOpen] = useState(false);
  const [formulaParaExcluir, setFormulaParaExcluir] = useState<FormulaQuimica | null>(null);

  const carregarDados = useCallback(async () => {
    try {
      const [cliData, formResp, equipeResp] = await Promise.all([
        api.getCliente(clienteId),
        api.getFormulas(clienteId),
        api.getEquipe(),
      ]);
      setCliente(cliData);
      setFormulas(Array.isArray(formResp) ? formResp : formResp.results || []);
      setEquipe(Array.isArray(equipeResp) ? equipeResp : equipeResp.results || []);
    } finally {
      setLoading(false);
    }
  }, [clienteId]);

  useEffect(() => {
    carregarDados();
  }, [carregarDados]);

  if (loading) return <LoadingState message="Carregando ficha e dossiê químico..." />;
  if (!cliente) return null;

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <ClienteActionsHeader
        onEditar={() => setModalEditClienteOpen(true)}
        onExcluir={() => setModalDeleteClienteOpen(true)}
        onNovaFormula={() => { setEditingFormula(null); setModalFormulaOpen(true); }}
      />
      <ClientePerfilCard cliente={cliente} />
      <FormulasSection
        formulas={formulas}
        copiadoId={copiadoId}
        onCopiar={(f) => {
          navigator.clipboard.writeText(`[Fórmula Camilo Studio] Procedimento: ${f.procedimento}\nMistura: ${f.formula_texto}\nOX: ${f.volumagem_ox} | Pausa: ${f.tempo_pausa_minutos} min`);
          setCopiadoId(f.id);
          setTimeout(() => setCopiadoId(null), 3000);
        }}
        onEditar={(f) => { setEditingFormula(f); setModalFormulaOpen(true); }}
        onExcluir={(f) => { setFormulaParaExcluir(f); setModalDeleteFormulaOpen(true); }}
        onNovaFormula={() => { setEditingFormula(null); setModalFormulaOpen(true); }}
      />
      <ClienteDialogsSection
        cliente={cliente}
        setCliente={setCliente}
        clienteId={clienteId}
        equipe={equipe}
        onFormulasChanged={async () => {
          const formResp = await api.getFormulas(clienteId);
          setFormulas(Array.isArray(formResp) ? formResp : formResp.results || []);
        }}
        editOpen={modalEditClienteOpen}
        onEditOpenChange={setModalEditClienteOpen}
        deleteOpen={modalDeleteClienteOpen}
        onDeleteOpenChange={setModalDeleteClienteOpen}
        formulaOpen={modalFormulaOpen}
        onFormulaOpenChange={setModalFormulaOpen}
        editingFormula={editingFormula}
        deleteFormulaOpen={modalDeleteFormulaOpen}
        onDeleteFormulaOpenChange={setModalDeleteFormulaOpen}
        formulaParaExcluir={formulaParaExcluir}
        setFormulaParaExcluir={setFormulaParaExcluir}
      />
    </div>
  );
}
