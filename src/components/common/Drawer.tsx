import React from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { X } from 'lucide-react';

interface DrawerProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  size?: 'md' | 'lg';
}

export const Drawer: React.FC<DrawerProps> = ({
  isOpen,
  onOpenChange,
  title,
  subtitle,
  children,
  size = 'md',
}) => {
  const widthClass = size === 'lg' ? 'max-w-xl' : 'max-w-md';

  return (
    <Dialog.Root open={isOpen} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/30 backdrop-blur-xs transition-opacity animate-in fade-in" />
        <Dialog.Content className={`fixed right-0 top-0 bottom-0 z-50 w-full ${widthClass} bg-surface p-6 border-l border-border shadow-popover focus:outline-none flex flex-col animate-in slide-in-from-right duration-200`}>
          <div className="flex items-center justify-between border-b border-border pb-4 mb-4">
            <div>
              <Dialog.Title className="text-base font-semibold text-text">
                {title}
              </Dialog.Title>
              {subtitle && (
                <Dialog.Description className="text-xs text-muted mt-0.5">
                  {subtitle}
                </Dialog.Description>
              )}
            </div>
            <Dialog.Close className="text-muted hover:text-text p-1.5 rounded hover:bg-background transition-colors">
              <X className="w-5 h-5" />
            </Dialog.Close>
          </div>

          <div className="flex-1 overflow-y-auto pr-1">
            {children}
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};
