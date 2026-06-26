import { useState } from 'react';
import { useRouter } from 'next/router';
import { toast } from 'react-toastify';
import DashboardLayout from '@/layouts/_dashboard';
import Card from '@/components/ui/cards/card';
import Button from '@/components/ui/button';
import Link from '@/components/ui/link';
import { Routes } from '@/config/routes';
import client from '@/framework/client';
import MedicinePicker from '@/components/prescriptions/medicine-picker';
import { PrescriptionMedicine } from '@/types';

export { getStaticProps } from '@/framework/general.ssr';

export default function UploadPrescriptionPage() {
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [notes, setNotes] = useState('');
  const [medicines, setMedicines] = useState<PrescriptionMedicine[]>([]);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!file) {
      toast.error('Please choose a prescription file first.');
      return;
    }

    setSubmitting(true);
    try {
      console.log('Starting prescription upload...');
      const uploadResult = await client.settings.upload([file]);
      console.log('Upload result:', uploadResult);
      
      // Handle response structure: { data: [...] }
      const attachments = uploadResult.data || (Array.isArray(uploadResult) ? uploadResult : []);
      const attachment = attachments[0];
      console.log('Attachment:', attachment);

      if (!attachment?.id) {
        throw new Error('Upload did not return an attachment id');
      }

      const attachmentId = String(attachment.id);
      console.log('Creating prescription with attachmentId:', attachmentId);

      const createResult = await client.prescriptions.create({
        attachment_id: attachmentId,
        notes: notes.trim() || undefined,
        medicines: medicines.length ? medicines : undefined,
      });
      console.log('Create result:', createResult);

      toast.success('Prescription uploaded successfully.');
      await router.push(Routes.prescriptions);
    } catch (error: any) {
      console.error('Error:', error);
      console.error('Error response:', error?.response);
      const apiMessage = error?.response?.data?.message;
      toast.error(apiMessage || 'Failed to upload prescription. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Card className="w-full shadow-none sm:shadow">
      <div className="mb-8 border-b border-dashed border-border-200 pb-6">
        <h1 className="text-lg font-semibold text-heading sm:text-xl">Upload Prescription</h1>
        <p className="mt-2 text-sm text-body">
          Upload a clear image or PDF. Our pharmacy team will review it and update your progress.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="mb-2 block text-sm font-semibold text-heading" htmlFor="prescription-file">
            Prescription file
          </label>
          <input
            id="prescription-file"
            type="file"
            accept="image/*,application/pdf"
            onChange={(event) => {
              const selected = event.target.files?.[0] ?? null;
              setFile(selected);
            }}
            className="block w-full rounded border border-border-200 p-3 text-sm file:mr-4 file:rounded file:border-0 file:bg-accent/10 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-accent"
          />
          <p className="mt-2 text-xs text-body">Allowed: JPG, PNG, WEBP, PDF</p>
          {file ? (
            <p className="mt-2 text-xs text-heading">Selected: {file.name}</p>
          ) : null}
        </div>

        <div>
          <label className="mb-2 block text-sm font-semibold text-heading" htmlFor="prescription-notes">
            Notes (optional)
          </label>
          <textarea
            id="prescription-notes"
            className="min-h-[140px] w-full rounded border border-border-200 p-3 text-sm focus:border-accent focus:outline-none"
            placeholder="Add symptoms, preferred shop, or special instructions"
            value={notes}
            onChange={(event) => setNotes(event.target.value)}
          />
        </div>

        <MedicinePicker value={medicines} onChange={setMedicines} />

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <Button type="submit" loading={submitting} disabled={submitting}>
            Submit Prescription
          </Button>
          <Link
            href={Routes.prescriptions}
            className="inline-flex h-11 items-center justify-center rounded border border-border-300 px-5 text-sm font-semibold text-heading"
          >
            View My Progress
          </Link>
        </div>
      </form>
    </Card>
  );
}

UploadPrescriptionPage.authenticationRequired = true;
UploadPrescriptionPage.getLayout = function getLayout(page: React.ReactElement) {
  return <DashboardLayout>{page}</DashboardLayout>;
};
