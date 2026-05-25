import { useModalAction } from '@/components/ui/modal/modal.context';
import PrescriptionForm from './prescription-form';

export default function PrescriptionUploadModal() {
  const { closeModal } = useModalAction();

  return (
    <div className="rounded-lg bg-white">
      <PrescriptionForm
        submitLabel="Upload Prescription"
        onSuccess={closeModal}
        onCancel={closeModal}
      />
    </div>
  );
}
