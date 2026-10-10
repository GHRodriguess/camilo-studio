import React from 'react';
import { Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface DeleteButtonProps {
  onDelete: () => void;
  title?: string;
  disabled?: boolean;
}

export function DeleteButton({
  onDelete,
  title = 'Excluir registro',
  disabled = false,
}: DeleteButtonProps) {
  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={onDelete}
      disabled={disabled}
      title={title}
      className="text-on-surface-variant hover:text-destructive hover:bg-destructive/10 transition-colors rounded-full"
    >
      <Trash2 className="w-4 h-4" />
      <span className="sr-only">{title}</span>
    </Button>
  );
}
