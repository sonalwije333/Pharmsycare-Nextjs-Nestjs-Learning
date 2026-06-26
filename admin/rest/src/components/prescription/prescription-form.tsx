import { useState } from 'react';
import { useRouter } from 'next/router';
import { toast } from 'react-toastify';
import Button from '@/components/ui/button';
import Input from '@/components/ui/input';
import TextArea from '@/components/ui/text-area';
import { uploadClient } from '@/data/client/upload';
import { prescriptionService } from '@/data/prescription';
import { Routes } from '@/config/routes';

interface PrescriptionFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
  submitLabel?: string;
}

export default function PrescriptionForm({
  onSuccess,
  onCancel,
  submitLabel = 'Save Prescription',
}: PrescriptionFormProps) {
  const router = useRouter();
  const [notes, setNotes] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!file) {
      toast.error('Please choose a prescription file first');
      return;
    }

    setSubmitting(true);
    try {
      const uploaded = await uploadClient.upload([file]);
      const attachment = uploaded?.data?.[0];

      if (!attachment?.id) {
        throw new Error('Upload did not return an attachment id');
      }

      await prescriptionService.create({
        attachment_id: attachment.id,
        notes: notes.trim() || undefined,
      });

      toast.success('Prescription saved successfully');
      setNotes('');
      setFile(null);
      if (onSuccess) {
        onSuccess();
        return;
      }
      await router.push(Routes.prescriptions.list);
    } catch (error) {
      toast.error('Failed to save prescription');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5 rounded-lg bg-white p-6 shadow-sm">
      <div>
        <Input
          name="prescription-file"
          type="file"
          label="Prescription file"
          accept="image/*,application/pdf"
          onChange={(event) => {
            const selected = event.target.files?.[0] ?? null;
            setFile(selected);
          }}
          required
        />
        {file ? <p className="mt-2 text-xs text-gray-500">Selected: {file.name}</p> : null}
      </div>

      <TextArea
        name="notes"
        label="Notes"
        placeholder="Add any context, symptoms, or fulfillment instructions"
        value={notes}
        onChange={(event) => setNotes(event.target.value)}
      />

      <div className="flex items-center justify-end gap-3">
        {onCancel ? (
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
        ) : null}
        <Button type="submit" loading={submitting} disabled={submitting}>
          {submitLabel}
        </Button>
      </div>
    </form>
  );
}
