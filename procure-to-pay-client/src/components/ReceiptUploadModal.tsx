import { useState } from 'react';
import { createPortal } from 'react-dom';
import { Upload } from 'lucide-react';
import { Button } from './ui/Button';
import type { FormEvent, ChangeEvent } from 'react';

interface ReceiptUploadModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (file: File) => Promise<void>;
  loading?: boolean;
}

export const ReceiptUploadModal = ({ open, onClose, onSubmit, loading }: ReceiptUploadModalProps) => {
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);

  if (!open) return null;

  const handleSubmit = async (evt: FormEvent) => {
    evt.preventDefault();
    if (!file) {
      setError('Choose a receipt file to continue.');
      return;
    }
    setError(null);
    try {
      await onSubmit(file);
      setFile(null);
    } catch (err) {
      setError((err as Error).message || 'Unable to upload receipt.');
    }
  };

  const handleFileChange = (evt: ChangeEvent<HTMLInputElement>) => {
    const nextFile = evt.target.files?.[0] ?? null;
    setFile(nextFile);
    setError(null);
  };

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 px-4">
      <div className="w-full max-w-lg rounded-3xl bg-white p-6 shadow-2xl">
        <div className="flex items-center gap-3">
          <div className="rounded-2xl bg-blue-100 p-3 text-blue-600">
            <Upload className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-slate-900">Upload receipt</h3>
            <p className="text-sm text-slate-500">
              PDF, PNG, or JPG files up to 10 MB. We will extract totals and run validation instantly.
            </p>
          </div>
        </div>
        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <label className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-200 px-4 py-8 text-center text-sm text-slate-500 transition hover:border-blue-300">
            <input
              type="file"
              accept=".pdf,.png,.jpg,.jpeg"
              className="hidden"
              onChange={handleFileChange}
              disabled={loading}
            />
            <span className="font-semibold text-slate-900">
              {file ? file.name : 'Drag & drop or click to select a file'}
            </span>
            <span className="text-xs text-slate-400">File types: PDF, PNG, JPG</span>
          </label>
          {error && <p className="text-sm text-rose-600">{error}</p>}
          {loading && (
            <p className="rounded-xl bg-blue-50 px-4 py-2 text-sm text-blue-700">
              Uploading and analyzing receipt...
            </p>
          )}
          <div className="flex justify-end gap-2">
            <Button type="button" variant="ghost" onClick={onClose} disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" disabled={!file || loading} loading={loading}>
              Submit Receipt
            </Button>
          </div>
        </form>
      </div>
    </div>,
    document.body,
  );
};
