import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Info } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import type { FormEvent } from 'react';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { FileDropzone } from '../components/FileDropzone';
import { useCreateRequest, useRequestDetail, useUpdateRequest } from '../hooks/useApiRequests';
import { useToast } from '../hooks/useToast';

type Mode = 'create' | 'edit';

export const RequestFormPage = () => {
  const { id } = useParams();
  const mode: Mode = id ? 'edit' : 'create';
  const navigate = useNavigate();
  const toast = useToast();
  const { user } = useAuth();
  const { data: existing, isLoading: loadingRequest } = useRequestDetail(mode === 'edit' ? id : undefined);
  const createMutation = useCreateRequest();
  const updateMutation = id ? useUpdateRequest(id) : null;
  const isSubmitting = mode === 'create' ? createMutation.isPending : Boolean(updateMutation?.isPending);

  const [form, setForm] = useState({
    title: '',
    description: '',
    amountEstimated: '',
    currency: 'USD',
    neededBy: '',
    notes: '',
  });
  const [fileSummary, setFileSummary] = useState<{ name: string; size: number } | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (existing && mode === 'edit') {
      setForm({
        // NOTE: adjust these field names if your API returns snake_case
        title: existing.title,
        description: existing.description,
        amountEstimated: existing.amountEstimated ? String(existing.amountEstimated) : '',
        currency: existing.currency || 'USD',
        neededBy: existing.neededBy || '',
        notes: existing.notes || '',
      });
    }
  }, [existing, mode]);

  if (mode === 'edit' && loadingRequest) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-blue-200 border-t-blue-600" />
      </div>
    );
  }

  if (mode === 'edit' && !existing) {
    return (
      <div className="rounded-2xl border border-rose-200 bg-rose-50 p-6 text-sm text-rose-700">
        Request not found.
      </div>
    );
  }

  const parsedAmount = Number(form.amountEstimated);
  const hasValidAmount =
    Boolean(form.amountEstimated) && !Number.isNaN(parsedAmount) && parsedAmount > 0;
  const errors = {
    title: touched.title && !form.title ? 'Please provide a request title.' : null,
    description: touched.description && !form.description ? 'Describe the business need.' : null,
    amount:
      touched.amountEstimated && !hasValidAmount ? 'Estimated amount must be greater than zero.' : null,
  };

  const handleSubmit = async (evt: FormEvent) => {
    evt.preventDefault();
    if (!user || errors.title || errors.description || !hasValidAmount) {
      if (!hasValidAmount) {
        setTouched(prev => ({ ...prev, amountEstimated: true }));
      }
      return;
    }

    try {
      if (mode === 'create') {
        const fd = new FormData();
        fd.append('title', form.title);
        fd.append('description', form.description);
        fd.append('amount_estimated', String(parsedAmount));
        fd.append('currency', form.currency);
        if (form.notes) fd.append('notes', form.notes);
        if (form.neededBy) fd.append('needed_by', form.neededBy);
        if (selectedFile) fd.append('proforma_file', selectedFile);

        const created = await createMutation.mutateAsync(fd);
        toast.success(`Request ${created.reference} created`);
        navigate(`/requests/${created.id}`);
      } else if (id && updateMutation) {
        const payload: Record<string, unknown> = {
          title: form.title,
          description: form.description,
          amount_estimated: parsedAmount,
          currency: form.currency,
          needed_by: form.neededBy || null,
          notes: form.notes || '',
        };
        await updateMutation.mutateAsync(payload);
        toast.success('Request updated');
        navigate(`/requests/${id}`);
      }
    } catch (error) {
      toast.error('Unable to save request. Please review the form and try again.');
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="mx-auto max-w-4xl space-y-6"
    >
      <div>
        <p className="text-sm uppercase tracking-wide text-slate-400">
          {mode === 'create' ? 'New Request' : 'Edit Request'}
        </p>
        <h1 className="text-2xl font-semibold text-slate-900">
          {mode === 'create' ? 'Submit Purchase Request' : existing?.title}
        </h1>
        <p className="text-sm text-slate-500">
          Provide enough context for approvers to make rapid decisions.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        <Card className="p-6">
          <div className="flex items-center gap-3">
            <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 text-blue-600 font-semibold">
              1
            </span>
            <div>
              <p className="text-sm font-semibold text-slate-700">Request details</p>
              <p className="text-xs text-slate-500">Describe what you need and why.</p>
            </div>
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-2">
            <div>
              <label className="text-sm font-medium text-slate-600">Request title</label>
              <input
                type="text"
                value={form.title}
                onChange={e => setForm(prev => ({ ...prev, title: e.target.value }))}
                onBlur={() => setTouched(prev => ({ ...prev, title: true }))}
                className="mt-1 w-full rounded-2xl border border-slate-200 px-4 py-2 focus:border-blue-500 focus:outline-none"
                required
              />
              {errors.title && <p className="mt-1 text-xs text-rose-500">{errors.title}</p>}
            </div>

            <div>
              <label className="text-sm font-medium text-slate-600">Estimated amount</label>
              <input
                type="number"
                value={form.amountEstimated}
                onChange={e => setForm(prev => ({ ...prev, amountEstimated: e.target.value }))}
                onBlur={() => setTouched(prev => ({ ...prev, amountEstimated: true }))}
                className="mt-1 w-full rounded-2xl border border-slate-200 px-4 py-2 focus:border-blue-500 focus:outline-none"
                min={0}
                required
              />
              {errors.amount && <p className="mt-1 text-xs text-rose-500">{errors.amount}</p>}
            </div>

            <div>
              <label className="text-sm font-medium text-slate-600">Currency</label>
              <select
                value={form.currency}
                onChange={e => setForm(prev => ({ ...prev, currency: e.target.value }))}
                className="mt-1 w-full rounded-2xl border border-slate-200 px-4 py-2 focus:border-blue-500 focus:outline-none"
              >
                <option value="USD">USD</option>
                <option value="EUR">EUR</option>
                <option value="RWF">RWF</option>
              </select>
            </div>

            <div>
              <label className="text-sm font-medium text-slate-600">Needed by</label>
              <input
                type="date"
                value={form.neededBy}
                onChange={e => setForm(prev => ({ ...prev, neededBy: e.target.value }))}
                className="mt-1 w-full rounded-2xl border border-slate-200 px-4 py-2 focus:border-blue-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="mt-4">
            <label className="text-sm font-medium text-slate-600">Description</label>
            <textarea
              value={form.description}
              onChange={e => setForm(prev => ({ ...prev, description: e.target.value }))}
              onBlur={() => setTouched(prev => ({ ...prev, description: true }))}
              className="mt-1 w-full rounded-2xl border border-slate-200 px-4 py-2 focus:border-blue-500 focus:outline-none"
              rows={4}
              required
            />
            {errors.description && <p className="mt-1 text-xs text-rose-500">{errors.description}</p>}
          </div>

          <div>
            <label className="text-sm font-medium text-slate-600">Notes</label>
            <textarea
              value={form.notes}
              onChange={e => setForm(prev => ({ ...prev, notes: e.target.value }))}
              className="mt-1 w-full rounded-2xl border border-slate-200 px-4 py-2 focus:border-blue-500 focus:outline-none"
              rows={3}
            />
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-3">
            <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 text-blue-600 font-semibold">
              2
            </span>
            <div>
              <p className="text-sm font-semibold text-slate-700">Documents & extraction</p>
              <p className="text-xs text-slate-500">
                Upload your vendor quotation to trigger AI extraction.
              </p>
            </div>
          </div>

          <div className="mt-4">
            <FileDropzone
              onFileSelect={file => {
                setSelectedFile(file);
                setFileSummary(file ? { name: file.name, size: file.size } : null);
              }}
            />

            {fileSummary && (
              <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">
                <div className="flex items-center gap-3">
                  <div className="rounded-full bg-blue-100 p-2 text-blue-600">
                    <Info className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="font-medium text-slate-800">{fileSummary.name}</p>
                    <p className="text-xs text-slate-500">
                      The proforma will be uploaded with your request and analyzed by AI to extract
                      vendor, items, and totals.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </Card>

        <div className="flex justify-between gap-3">
          <Button variant="ghost" type="button" onClick={() => navigate(-1)} disabled={isSubmitting}>
            Cancel
          </Button>
          <div className="flex gap-2">
            <Button variant="secondary" type="button" disabled={isSubmitting}>
              Save draft
            </Button>
            <Button type="submit" loading={isSubmitting}>
              {mode === 'create' ? 'Submit Request' : 'Save Changes'}
            </Button>
          </div>
        </div>
      </form>
    </motion.div>
  );
};
