'use client';

import React from 'react';
import { Check, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

export const WIZARD_STEPS = [
  { id: 1, title: 'Cliente', description: 'Quem será atendida' },
  { id: 2, title: 'Procedimentos', description: 'Serviços desejados' },
  { id: 3, title: 'Data & Horário', description: 'Quando será' },
  { id: 4, title: 'Confirmação', description: 'Revisão final' },
];

function WizardStepItem({
  step,
  idx,
  currentStep,
  clienteId,
  hasServicos,
  onStepClick,
}: {
  step: { id: number; title: string; description: string };
  idx: number;
  currentStep: number;
  clienteId: number | '';
  hasServicos: boolean;
  onStepClick: (stepId: number) => void;
}) {
  const isCompleted = currentStep > step.id;
  const isCurrent = currentStep === step.id;
  const canNavigate =
    step.id < currentStep ||
    (step.id === 2 && !!clienteId) ||
    (step.id === 3 && !!clienteId && hasServicos);

  return (
    <React.Fragment>
      {idx > 0 && (
        <div
          className={`flex-1 h-0.5 mx-1 sm:mx-2 min-w-1.5 transition-colors shrink ${
            currentStep >= step.id ? 'bg-primary' : 'bg-outline-variant/50'
          }`}
        />
      )}
      <button
        type="button"
        disabled={!canNavigate && !isCurrent}
        onClick={() => canNavigate && onStepClick(step.id)}
        className={`flex items-center gap-1.5 sm:gap-2 text-left shrink-0 transition-all ${
          canNavigate || isCurrent ? 'cursor-pointer' : 'cursor-not-allowed opacity-60'
        }`}
      >
        <div
          className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all shrink-0 ${
            isCompleted
              ? 'bg-primary text-primary-foreground shadow-sm shadow-primary/25'
              : isCurrent
              ? 'bg-primary text-primary-foreground ring-2 sm:ring-4 ring-primary/20 shadow-md shadow-primary/30'
              : 'bg-surface-container text-on-surface-variant border border-outline-variant/60'
          }`}
        >
          {isCompleted ? <Check className="w-3.5 h-3.5 stroke-[3]" /> : step.id}
        </div>
        <div className="hidden md:block">
          <p
            className={`text-xs font-semibold leading-tight ${
              isCurrent ? 'text-primary' : isCompleted ? 'text-on-surface' : 'text-on-surface-variant'
            }`}
          >
            {step.title}
          </p>
        </div>
      </button>
    </React.Fragment>
  );
}

interface StepperProps {
  currentStep: number;
  clienteId: number | '';
  hasServicos: boolean;
  onStepClick: (step: number) => void;
  isModal: boolean;
}

export function WizardStepper({
  currentStep,
  clienteId,
  hasServicos,
  onStepClick,
  isModal,
}: StepperProps) {
  return (
    <div
      className={`w-full min-w-0 ${
        isModal
          ? 'bg-surface-container-low/70 border border-outline-variant/40 rounded-2xl p-2.5 sm:p-3'
          : 'bg-surface-container-lowest border border-outline-variant/60 rounded-3xl p-3 sm:p-5 shadow-sm'
      }`}
    >
      <div className="flex items-center justify-between w-full min-w-0">
        {WIZARD_STEPS.map((step, idx) => (
          <WizardStepItem
            key={step.id}
            step={step}
            idx={idx}
            currentStep={currentStep}
            clienteId={clienteId}
            hasServicos={hasServicos}
            onStepClick={onStepClick}
          />
        ))}
      </div>
    </div>
  );
}

interface NavigationProps {
  currentStep: number;
  canAdvance: boolean;
  submitting: boolean;
  mode: 'create' | 'edit';
  onPrev: () => void;
  onNext: () => void;
  onSubmit: () => Promise<void>;
  onCancel?: () => void;
}

export function WizardNavigation(props: NavigationProps) {
  return (
    <div className="mt-6 pt-4 border-t border-outline-variant/40 flex items-center justify-between gap-2.5">
      {props.currentStep > 1 ? (
        <Button
          type="button"
          variant="outline"
          onClick={props.onPrev}
          className="rounded-full text-xs h-10 px-4 sm:px-5 border-outline-variant text-on-surface gap-1 cursor-pointer shrink-0"
        >
          <ChevronLeft className="w-3.5 h-3.5" /> <span>Voltar</span>
        </Button>
      ) : props.onCancel ? (
        <Button
          type="button"
          variant="outline"
          onClick={props.onCancel}
          className="rounded-full text-xs h-10 px-4 sm:px-5 border-outline-variant text-on-surface cursor-pointer shrink-0"
        >
          Cancelar
        </Button>
      ) : (
        <div />
      )}

      {props.currentStep < 4 ? (
        <Button
          type="button"
          disabled={!props.canAdvance}
          onClick={props.onNext}
          className="rounded-full text-xs h-10 px-5 sm:px-6 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold shadow-md shadow-primary/20 gap-1 cursor-pointer shrink-0"
        >
          <span>Avançar</span> <ChevronRight className="w-3.5 h-3.5" />
        </Button>
      ) : (
        <Button
          type="button"
          disabled={props.submitting}
          onClick={props.onSubmit}
          className="rounded-full text-xs h-10 px-6 sm:px-8 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold shadow-md shadow-primary/25 cursor-pointer shrink-0"
        >
          {props.submitting
            ? props.mode === 'edit' ? 'Salvando...' : 'Criando...'
            : props.mode === 'edit' ? 'Salvar Alterações' : 'Confirmar Agendamento'}
        </Button>
      )}
    </div>
  );
}
