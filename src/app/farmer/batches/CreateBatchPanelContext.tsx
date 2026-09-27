'use client';
import { createContext, useContext, useState, type ReactNode } from 'react';

type CreateBatchPanelContextValue = {
  isOpen: boolean;
  refreshSignal: number;
  open: () => void;
  close: () => void;
  notifyCreated: () => void;
};

const CreateBatchPanelContext = createContext<CreateBatchPanelContextValue | null>(null);

export function CreateBatchPanelProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [refreshSignal, setRefreshSignal] = useState(0);

  return (
    <CreateBatchPanelContext.Provider
      value={{
        isOpen,
        refreshSignal,
        open: () => setIsOpen(true),
        close: () => setIsOpen(false),
        notifyCreated: () => setRefreshSignal((n) => n + 1),
      }}
    >
      {children}
    </CreateBatchPanelContext.Provider>
  );
}

export function useCreateBatchPanel() {
  const ctx = useContext(CreateBatchPanelContext);
  if (!ctx) throw new Error('useCreateBatchPanel must be used within CreateBatchPanelProvider');
  return ctx;
}
