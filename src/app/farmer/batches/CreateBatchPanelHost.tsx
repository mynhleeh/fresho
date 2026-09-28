'use client';
import { Overlay } from '../../components/feedback/Overlay';
import { HarvestBatchForm } from './HarvestBatchForm';
import { useCreateBatchPanel } from './CreateBatchPanelContext';

export function CreateBatchPanelHost() {
  const { isOpen, close, notifyCreated } = useCreateBatchPanel();

  return (
    <Overlay open={isOpen} onClose={close}>
      {isOpen && (
        <HarvestBatchForm
          mode="create"
          onCancel={close}
          onSaved={() => {
            notifyCreated();
            close();
          }}
        />
      )}
    </Overlay>
  );
}
