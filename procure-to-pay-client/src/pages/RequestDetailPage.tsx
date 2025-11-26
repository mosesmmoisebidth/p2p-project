import { useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FileText, Upload } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import {
  useApproveRequest,
  useDocumentExtraction,
  useRejectRequest,
  useRequestDetail,
  useSubmitReceipt,
} from '../hooks/useApiRequests';
import { useToast } from '../hooks/useToast';
import { StatusBadge } from '../components/StatusBadge';
import { formatCurrency, formatDate } from '../utils/format';
import { ItemsTable } from '../components/ItemsTable';
import { DocumentLink } from '../components/DocumentLink';
import { ApprovalTimeline } from '../components/ApprovalTimeline';
import { ValidationSummary } from '../components/ValidationSummary';
import { Button } from '../components/ui/Button';
import { ReceiptUploadModal } from '../components/ReceiptUploadModal';
import { ApprovalDecisionModal } from '../components/ApprovalDecisionModal';
import type { DocumentExtractionResult, ValidationDetails } from '../types';

export const RequestDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  const { user } = useAuth();
  const { data: request, isLoading } = useRequestDetail(id);
  const approveMutation = id ? useApproveRequest(id) : null;
  const rejectMutation = id ? useRejectRequest(id) : null;
  const receiptMutation = id ? useSubmitReceipt(id) : null;
  const { data: receiptExtraction } = useDocumentExtraction(
    id,
    request?.receiptUrl ? 'receipt' : undefined,
  );

  const [showUploadModal, setShowUploadModal] = useState(false);
  const [decisionMode, setDecisionMode] = useState<'approve' | 'reject' | null>(null);
  const [latestReceiptInsight, setLatestReceiptInsight] = useState<{
    extraction: DocumentExtractionResult;
    validation: ValidationDetails;
  } | null>(null);

  const amountCards = useMemo(() => {
    if (!request) {
      return [];
    }
    return [
      {
        label: 'Estimated budget',
        value: formatCurrency(request.amountEstimated, request.currency),
        tone: 'text-slate-900',
      },
      {
        label: 'Proforma total',
        value: request.amountFromProforma
          ? formatCurrency(request.amountFromProforma, request.currency)
          : 'N/A',
        tone: 'text-blue-700',
      },
      {
        label: 'Purchase order',
        value: request.purchaseOrder
          ? formatCurrency(
              request.purchaseOrder.totalAmount,
              request.purchaseOrder.currency || request.currency,
            )
          : 'Pending',
        tone: request.purchaseOrder ? 'text-emerald-700' : 'text-slate-500',
      },
    ];
  }, [request]);

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(4)].map((_, idx) => (
          <div key={idx} className="h-24 animate-pulse rounded-2xl bg-slate-100" />
        ))}
      </div>
    );
  }

  if (!request || !id) {
    return (
      <div className="rounded-2xl border border-rose-200 bg-rose-50 p-6">
        <p className="text-sm text-rose-700">Request not found.</p>
        <Link to="/" className="text-blue-600">
          Go back
        </Link>
      </div>
    );
  }

  const isOwner = user?.id === request.createdBy.id;
  const canApprove =
    user &&
    request.status === 'PENDING' &&
    ((user.role === 'approver_lvl1' && request.currentApprovalLevel === 1) ||
      (user.role === 'approver_lvl2' && request.currentApprovalLevel === 2));

  const decisionLoading =
    decisionMode === 'approve'
      ? approveMutation?.isPending
      : decisionMode === 'reject'
        ? rejectMutation?.isPending
        : false;

  const receiptInsights = latestReceiptInsight?.extraction ?? receiptExtraction;
  const validationResult = latestReceiptInsight?.validation ?? request.latestValidation;

  const handleDecision = async (mode: 'approve' | 'reject', comment?: string) => {
    try {
      if (mode === 'approve' && approveMutation) {
        const updated = await approveMutation.mutateAsync({ comment });
        if (updated?.status === 'APPROVED') {
          toast.success('Request fully approved. Staff and finance have been notified via email.');
        } else {
          toast.success('Approval recorded. Requester and next approver have been notified via email.');
        }
      } else if (mode === 'reject' && rejectMutation) {
        await rejectMutation.mutateAsync({ comment });
        toast.error('Request rejected. Requester has been notified via email.');
      }
    } catch {
      toast.error('Unable to record decision. Please try again.');
    } finally {
      setDecisionMode(null);
    }
  };

  const handleReceiptSubmit = async (file: File) => {
    if (!receiptMutation) return;
    const formData = new FormData();
    formData.append('receipt', file);
    try {
      const result = await receiptMutation.mutateAsync(formData);
      setLatestReceiptInsight({
        extraction: result.extraction,
        validation: result.validation,
      });
      toast.success('Receipt submitted. Validation is running now.');
      setShowUploadModal(false);
    } catch {
      toast.error('Unable to submit receipt. Try again later.');
      throw new Error('Upload failed. Please try again.');
    }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-sm text-slate-500">{request.reference}</p>
          <h1 className="text-3xl font-semibold text-slate-900">{request.title}</h1>
          <div className="mt-2 flex flex-wrap items-center gap-3 text-sm text-slate-500">
            <span>Created by {request.createdBy.name}</span>
            <span aria-hidden="true" className="text-slate-300">
              |
            </span>
            <span>{formatDate(request.createdAt)}</span>
            <StatusBadge status={request.status} />
          </div>
        </div>
        <div className="flex flex-wrap gap-3">
          {isOwner && request.status === 'PENDING' && (
            <Button variant="ghost" onClick={() => navigate(`/requests/${request.id}/edit`)}>
              Edit
            </Button>
          )}
          {isOwner && request.status === 'APPROVED' && (
            <Button
              variant="secondary"
              onClick={() => setShowUploadModal(true)}
              loading={receiptMutation?.isPending}
            >
              <Upload className="mr-2 h-4 w-4" />
              {request.receiptUrl ? 'Replace Receipt' : 'Upload Receipt'}
            </Button>
          )}
          {canApprove && (
            <>
              <Button variant="ghost" onClick={() => setDecisionMode('reject')}>
                Reject
              </Button>
              <Button onClick={() => setDecisionMode('approve')}>Approve</Button>
            </>
          )}
        </div>
      </div>

      {receiptMutation?.isPending && (
        <div className="rounded-2xl border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-700">
          Receipt is being processed by our AI models. This usually takes less than a minute.
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <h3 className="text-lg font-semibold text-slate-900">Overview</h3>
            <p className="mt-2 text-sm text-slate-600">{request.description}</p>
            <div className="mt-4 grid gap-4 sm:grid-cols-3">
              {amountCards.map(card => (
                <div
                  key={card.label}
                  className="rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3"
                >
                  <p className="text-xs uppercase tracking-wide text-slate-400">{card.label}</p>
                  <p className={`text-lg font-semibold ${card.tone}`}>{card.value}</p>
                </div>
              ))}
            </div>
            <dl className="mt-6 grid gap-4 sm:grid-cols-2">
              <div>
                <dt className="text-xs uppercase tracking-wide text-slate-400">Vendor</dt>
                <dd className="text-sm font-medium text-slate-800">{request.vendorName || 'N/A'}</dd>
              </div>
              <div>
                <dt className="text-xs uppercase tracking-wide text-slate-400">Needed by</dt>
                <dd className="text-sm font-medium text-slate-800">
                  {request.neededBy ? formatDate(request.neededBy) : 'N/A'}
                </dd>
              </div>
              <div>
                <dt className="text-xs uppercase tracking-wide text-slate-400">Category</dt>
                <dd className="text-sm font-medium text-slate-800">{request.category || 'N/A'}</dd>
              </div>
              <div>
                <dt className="text-xs uppercase tracking-wide text-slate-400">Notes</dt>
                <dd className="text-sm text-slate-600">{request.notes || 'N/A'}</dd>
              </div>
            </dl>
          </section>

          <ItemsTable items={request.items} currency={request.currency} caption="Request Items" />

          <ApprovalTimeline approvals={request.approvals} currentLevel={request.currentApprovalLevel} />
        </div>
        <div className="space-y-6">
          <section className="rounded-2xl border border-slate-200 bg-white p-5">
            <div className="flex items-center justify-between">
              <h4 className="text-base font-semibold text-slate-900">Documents & actions</h4>
              <FileText className="h-5 w-5 text-slate-400" />
            </div>
            <div className="mt-4 space-y-3">
              <DocumentLink label="View Proforma" url={request.proformaUrl} />
              <DocumentLink label="View Purchase Order" url={request.purchaseOrder?.firebaseUrl} />
              <DocumentLink label="View Receipt" url={request.receiptUrl} />
            </div>
            {isOwner && request.status === 'APPROVED' && !request.receiptUrl && (
              <div className="mt-4 rounded-2xl border border-dashed border-amber-200 bg-amber-50 p-4 text-sm text-amber-700">
                <p>Upload the vendor receipt to start automatic validation.</p>
                <Button
                  variant="secondary"
                  size="sm"
                  className="mt-3"
                  onClick={() => setShowUploadModal(true)}
                >
                  Upload receipt
                </Button>
              </div>
            )}
          </section>

          <section className="rounded-2xl border border-slate-200 bg-white p-5">
            <div className="flex items-center justify-between">
              <h4 className="text-base font-semibold text-slate-900">Receipt insight</h4>
              {receiptInsights && (
                <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
                  Confidence {Math.round((receiptInsights.confidence_score || 0) * 100)}%
                </span>
              )}
            </div>
            {receiptInsights ? (
              <div className="mt-4 grid gap-3 text-sm text-slate-600">
                <div className="flex items-center justify-between">
                  <p className="text-slate-500">Vendor</p>
                  <p className="font-medium text-slate-900">
                    {receiptInsights.final_data.vendor_name || 'Unknown'}
                  </p>
                </div>
                <div className="flex items-center justify-between">
                  <p className="text-slate-500">Document date</p>
                  <p className="font-medium text-slate-900">
                    {receiptInsights.final_data.document_date
                      ? formatDate(receiptInsights.final_data.document_date)
                      : 'N/A'}
                  </p>
                </div>
                <div className="flex items-center justify-between">
                  <p className="text-slate-500">Total amount</p>
                  <p className="font-medium text-slate-900">
                    {receiptInsights.final_data.total_amount
                      ? formatCurrency(
                          Number(receiptInsights.final_data.total_amount),
                          receiptInsights.final_data.currency || request.currency,
                        )
                      : 'N/A'}
                  </p>
                </div>
                <div className="flex items-center justify-between">
                  <p className="text-slate-500">Items detected</p>
                  <p className="font-medium text-slate-900">
                    {receiptInsights.final_data.items?.length ?? 0}
                  </p>
                </div>
              </div>
            ) : (
              <p className="mt-3 text-sm text-slate-500">
                No receipt has been uploaded yet. Once it is, we will show the extracted totals here.
              </p>
            )}
          </section>

          <ValidationSummary
            validation={validationResult}
            purchaseOrder={request.purchaseOrder}
            receiptData={receiptInsights?.final_data}
            currency={request.purchaseOrder?.currency || request.currency}
          />
        </div>
      </div>

      <ReceiptUploadModal
        open={showUploadModal}
        onClose={() => setShowUploadModal(false)}
        onSubmit={handleReceiptSubmit}
        loading={receiptMutation?.isPending}
      />

      <ApprovalDecisionModal
        open={decisionMode !== null}
        mode={decisionMode ?? 'approve'}
        onClose={() => !decisionLoading && setDecisionMode(null)}
        onConfirm={comment => {
          if (!decisionMode) return;
          handleDecision(decisionMode, comment);
        }}
        loading={decisionLoading}
      />
    </motion.div>
  );
};
