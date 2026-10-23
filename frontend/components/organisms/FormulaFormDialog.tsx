'use client';

import React, { useState } from 'react';
import { FlaskConical } from 'lucide-react';
import { FormulaQuimica, Profissional } from '@/lib/api';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export interface FormulaFormData {
  cliente: number;
  procedimento: string;
  profissional?: number;
  data_aplicacao: string;
  formula_texto: string;
  volumagem_ox: string;
  tempo_pausa_minutos: number;
  fundo_clareamento?: string;
  observacoes?: string;
}

interface FieldsProps {
  procedimento: string;
  setProcedimento: (v: string) => void;
  profissional: number | '';
  setProfissional: (v: number | '') => void;
  equipe: Profissional[];
  dataAplicacao: string;
  setDataAplicacao: (v: string) => void;
  formulaTexto: string;
  setFormulaTexto: (v: string) => void;
  volumagemOx: string;
  setVolumagemOx: (v: string) => void;
  tempoPausa: string;
  setTempoPausa: (v: string) => void;
  fundo: string;
  setFundo: (v: string) => void;
  observacoes: string;
  setObservacoes: (v: string) => void;
}

function FormulaParametrosRow({
  volumagemOx,
  setVolumagemOx,
  tempoPausa,
  setTempoPausa,
  fundo,
  setFundo,
}: {
  volumagemOx: string;
  setVolumagemOx: (v: string) => void;
  tempoPausa: string;
  setTempoPausa: (v: string) => void;
  fundo: string;
  setFundo: (v: string) => void;
}) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
      <div className="space-y-1.5">
        <Label className="text-xs font-medium text-on-surface-variant">Volumagem OX</Label>
        <Input value={volumagemOx} onChange={(e) => setVolumagemOx(e.target.value)} placeholder="20 vol" className="rounded-full h-11 text-xs" />
      </div>
      <div className="space-y-1.5">
        <Label className="text-xs font-medium text-on-surface-variant">Pausa (min)</Label>
        <Input type="number" value={tempoPausa} onChange={(e) => setTempoPausa(e.target.value)} placeholder="45" className="rounded-full h-11 text-xs font-mono" />
      </div>
      <div className="space-y-1.5">
        <Label className="text-xs font-medium text-on-surface-variant">Fundo de Clareamento</Label>
        <Input value={fundo} onChange={(e) => setFundo(e.target.value)} placeholder="Fundo 9 / 10" className="rounded-full h-11 text-xs" />
      </div>
    </div>
  );
}

function FormulaFormFields(props: FieldsProps) {
  return (
    <>
      <div className="space-y-1.5">
        <Label className="text-xs font-medium text-on-surface-variant">Procedimento</Label>
        <Input required value={props.procedimento} onChange={(e) => props.setProcedimento(e.target.value)} placeholder="Ex: Mechas Globais Pérola" className="rounded-full h-11 text-xs" />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label className="text-xs font-medium text-on-surface-variant">Profissional Responsável</Label>
          <Select value={props.profissional ? String(props.profissional) : 'sem_especifico'} onValueChange={(val) => props.setProfissional(val === 'sem_especifico' ? '' : Number(val))}>
            <SelectTrigger className="rounded-full h-11 text-xs"><SelectValue placeholder="Selecione..." /></SelectTrigger>
            <SelectContent>
              <SelectItem value="sem_especifico" className="text-xs">Equipe Studio Marilia Camilo</SelectItem>
              {props.equipe.map((p) => (<SelectItem key={p.id} value={String(p.id)} className="text-xs">{p.nome} ({p.cargo})</SelectItem>))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1.5">
          <Label className="text-xs font-medium text-on-surface-variant">Data da Aplicação</Label>
          <Input type="date" required value={props.dataAplicacao} onChange={(e) => props.setDataAplicacao(e.target.value)} className="rounded-full h-11 text-xs" />
        </div>
      </div>

      <div className="space-y-1.5">
        <Label className="text-xs font-medium text-on-surface-variant">Mistura Quimica / Gramaturas (Exato)</Label>
        <Textarea required rows={3} value={props.formulaTexto} onChange={(e) => props.setFormulaTexto(e.target.value)} placeholder="Ex: BlondorPlex 1:2 (40g pó + 80g OX)&#10;Tonalização: 9V (20g) + 9GI (20g)" className="rounded-2xl font-mono text-xs" />
      </div>

      <FormulaParametrosRow volumagemOx={props.volumagemOx} setVolumagemOx={props.setVolumagemOx} tempoPausa={props.tempoPausa} setTempoPausa={props.setTempoPausa} fundo={props.fundo} setFundo={props.setFundo} />

      <div className="space-y-1.5">
        <Label className="text-xs font-medium text-on-surface-variant">Observações / Resultado</Label>
        <Textarea rows={2} value={props.observacoes} onChange={(e) => props.setObservacoes(e.target.value)} placeholder="Resultado bege frio com excelente integridade da fibra." className="rounded-2xl text-xs" />
      </div>
    </>
  );
}

interface FormulaFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editingFormula: FormulaQuimica | null;
  equipe: Profissional[];
  clienteId: number;
  onSave: (payload: FormulaFormData, formulaId?: number) => Promise<void>;
  saving: boolean;
}

interface FormulaFormInnerProps {
  editingFormula: FormulaQuimica | null;
  equipe: Profissional[];
  clienteId: number;
  onSave: (payload: FormulaFormData, formulaId?: number) => Promise<void>;
  saving: boolean;
  onCancel: () => void;
}

function FormulaFormInner({
  editingFormula,
  equipe,
  clienteId,
  onSave,
  saving,
  onCancel,
}: FormulaFormInnerProps) {
  const [procedimento, setProcedimento] = useState(editingFormula?.procedimento || 'Mechas Globais Pérola');
  const [profissional, setProfissional] = useState<number | ''>(editingFormula?.profissional ?? '');
  const [dataAplicacao, setDataAplicacao] = useState(editingFormula?.data_aplicacao || new Date().toISOString().split('T')[0]);
  const [formulaTexto, setFormulaTexto] = useState(editingFormula?.formula_texto || '');
  const [volumagemOx, setVolumagemOx] = useState(editingFormula?.volumagem_ox || '20 vol');
  const [tempoPausa, setTempoPausa] = useState(editingFormula ? String(editingFormula.tempo_pausa_minutos) : '45');
  const [fundo, setFundo] = useState(editingFormula?.fundo_clareamento || 'Fundo 9 / 10');
  const [observacoes, setObservacoes] = useState(editingFormula?.observacoes || '');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSave({
      cliente: clienteId,
      profissional: profissional ? Number(profissional) : undefined,
      data_aplicacao: dataAplicacao,
      procedimento,
      formula_texto: formulaTexto,
      volumagem_ox: volumagemOx,
      tempo_pausa_minutos: parseInt(tempoPausa, 10) || 45,
      fundo_clareamento: fundo,
      observacoes,
    }, editingFormula?.id);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 pt-2">
      <FormulaFormFields
        procedimento={procedimento} setProcedimento={setProcedimento}
        profissional={profissional} setProfissional={setProfissional}
        equipe={equipe}
        dataAplicacao={dataAplicacao} setDataAplicacao={setDataAplicacao}
        formulaTexto={formulaTexto} setFormulaTexto={setFormulaTexto}
        volumagemOx={volumagemOx} setVolumagemOx={setVolumagemOx}
        tempoPausa={tempoPausa} setTempoPausa={setTempoPausa}
        fundo={fundo} setFundo={setFundo}
        observacoes={observacoes} setObservacoes={setObservacoes}
      />

      <div className="pt-3 flex items-center justify-end gap-2.5">
        <Button type="button" variant="outline" onClick={onCancel} className="rounded-full text-xs h-10 px-5">Cancelar</Button>
        <Button type="submit" disabled={saving} className="rounded-full text-xs h-10 px-6 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold shadow-md shadow-primary/20 cursor-pointer">
          {saving ? 'Salvando...' : editingFormula ? 'Salvar Alterações' : 'Salvar Fórmula no Dossiê'}
        </Button>
      </div>
    </form>
  );
}

export function FormulaFormDialog({ open, onOpenChange, editingFormula, equipe, clienteId, onSave, saving }: FormulaFormDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg rounded-3xl p-6 bg-surface-container-lowest border-outline-variant max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-lg font-bold text-on-surface font-heading flex items-center gap-2">
            <FlaskConical className="w-5 h-5 text-primary" />
            {editingFormula ? 'Editar Fórmula Técnica' : 'Registrar Fórmula Técnica'}
          </DialogTitle>
          <DialogDescription className="text-xs text-on-surface-variant">Guarde proporções de pós, colorações, tonalizantes e oxidantes para este atendimento.</DialogDescription>
        </DialogHeader>

        {open && (
          <FormulaFormInner
            key={editingFormula ? editingFormula.id : 'novo'}
            editingFormula={editingFormula}
            equipe={equipe}
            clienteId={clienteId}
            onSave={onSave}
            saving={saving}
            onCancel={() => onOpenChange(false)}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}
