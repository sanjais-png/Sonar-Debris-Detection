import React from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { AlertCircle, X } from 'lucide-react';

interface ConfirmDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  isDanger?: boolean;
  onConfirm: () => void;
  isLoading?: boolean;
}

export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  isOpen,
  onOpenChange,
  title,
  description,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  isDanger = true,
  onConfirm,
  isLoading = false,
}) => {
  return (
    <Dialog.Root open={isOpen} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs transition-opacity animate-in fade-in" />
        <Dialog.Content className="fixed left-[50%] top-[50%] z-50 w-full max-w-md translate-x-[-50%] translate-y-[-50%] rounded-card bg-surface p-6 border border-border shadow-popover focus:outline-none animate-in fade-in-90 zoom-in-95">
          <div className="flex items-start gap-4">
            <div className={`p-2.5 rounded-full shrink-0 ${isDanger ? 'bg-danger-tint text-danger' : 'bg-primary-tint text-primary'}`}>
              <AlertCircle className="w-5 h-5" />
            </div>
            <div className="flex-1">
              <Dialog.Title className="text-base font-semibold text-text">
                {title}
              </Dialog.Title>
              <Dialog.Description className="text-xs leading-relaxed text-muted mt-1.5">
                {description}
              </Dialog.Description>
            </div>
            <Dialog.Close className="text-muted hover:text-text p-1 rounded hover:bg-background">
              <X className="w-4 h-4" />
            </Dialog.Close>
          </div>

          <div className="mt-6 flex items-center justify-end gap-3">
            <button
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
              className="px-3.5 py-1.5 text-xs font-semibold text-text bg-surface border border-border rounded-button hover:bg-background transition-colors"
            >
              {cancelLabel}
            </button>
            <button
              onClick={onConfirm}
              disabled={isLoading}
              className={`px-3.5 py-1.5 text-xs font-semibold text-white rounded-button transition-colors ${
                isDanger
                  ? 'bg-danger hover:bg-danger/90'
                  : 'bg-primary hover:bg-primary-hover'
              }`}
            >
              {isLoading ? 'Processing...' : confirmLabel}
            </button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};
