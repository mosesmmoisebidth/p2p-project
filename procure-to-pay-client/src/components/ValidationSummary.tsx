import { AlertTriangle } from 'lucide-react';
import type {
  ExtractionSummary,
  PurchaseOrderInfo,
  ValidationDetails,
} from '../types';
import { formatCurrency } from '../utils/format';

interface Props {
  validation?: ValidationDetails;
  purchaseOrder?: PurchaseOrderInfo;
  receiptData?: ExtractionSummary;
  currency?: string;
}

export const ValidationSummary = ({ validation, purchaseOrder, receiptData, currency }: Props) => {
  if (!validation) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-5 text-sm text-slate-500">
        <p>No validation has been recorded yet.</p>
        <p className="mt-1 text-xs text-slate-400">
          Upload a receipt after approval to compare it with the purchase order.
        </p>
      </div>
    );
  }

  const vendorMatch = validation.details?.vendor_match;
  const amountMatch = validation.details?.total_amount_match;
  const itemDifferences = validation.details?.item_differences ?? [];
  const llmAnalysis = validation.details?.llm_analysis;

  const resolvedCurrency =
    currency || purchaseOrder?.currency || receiptData?.currency || 'USD';
  const poAmount = purchaseOrder?.totalAmount ?? amountMatch?.expected ?? 0;
  const receiptAmount =
    receiptData?.total_amount ?? amountMatch?.found ?? amountMatch?.expected ?? 0;
  const delta = receiptAmount - poAmount;
  const totalForBar = Math.max(poAmount, receiptAmount, 1);
  const poWidth = Math.min(100, Math.round((poAmount / totalForBar) * 100));
  const receiptWidth = Math.min(100, Math.round((receiptAmount / totalForBar) * 100));

  const issueList = Array.isArray(llmAnalysis?.issues) ? llmAnalysis?.issues : [];

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-slate-500">Receipt vs PO validation</p>
          <p
            className={`mt-2 inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
              validation.is_match ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'
            }`}
          >
            {validation.is_match ? 'Matched' : 'Mismatched'}
          </p>
        </div>
        <div className="w-32">
          <p className="text-xs text-slate-500">Score</p>
          <div className="mt-2 h-2 w-full rounded-full bg-slate-200">
            <div
              className={`h-2 rounded-full ${
                validation.is_match ? 'bg-emerald-500' : 'bg-rose-500'
              }`}
              style={{ width: `${Math.round((validation.score || 0) * 100)}%` }}
            />
          </div>
          <p className="mt-1 text-sm font-semibold text-slate-800">
            {Math.round((validation.score || 0) * 100)}%
          </p>
        </div>
      </div>
      {llmAnalysis?.summary && (
        <p className="mt-3 text-sm text-slate-600">{llmAnalysis.summary}</p>
      )}
      <div className="mt-4 rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3">
        <div className="flex items-center justify-between text-sm text-slate-600">
          <div>
            <p className="text-xs uppercase tracking-wide text-slate-400">Vendor expected</p>
            <p className="font-semibold text-slate-900">{vendorMatch?.expected || 'N/A'}</p>
          </div>
          <div className="text-right">
            <p className="text-xs uppercase tracking-wide text-slate-400">Vendor found</p>
            <p className="font-semibold text-slate-900">{vendorMatch?.found || 'N/A'}</p>
          </div>
        </div>
        <p
          className={`mt-2 text-xs font-semibold ${
            (vendorMatch?.similarity ?? 0) >= 0.9 ? 'text-emerald-600' : 'text-rose-600'
          }`}
        >
          Similarity: {Math.round((vendorMatch?.similarity ?? 0) * 100)}%
        </p>
      </div>

      <div className="mt-4 space-y-3">
        <div>
          <p className="text-xs uppercase tracking-wide text-slate-400">Amount comparison</p>
          <div className="mt-2 space-y-2 text-sm text-slate-600">
            <div>
              <div className="flex justify-between text-xs text-slate-400">
                <span>Purchase order</span>
                <span>{formatCurrency(poAmount, resolvedCurrency)}</span>
              </div>
              <div className="mt-1 h-2 rounded-full bg-slate-100">
                <div className="h-2 rounded-full bg-slate-700" style={{ width: `${poWidth}%` }} />
              </div>
            </div>
            <div>
              <div className="flex justify-between text-xs text-slate-400">
                <span>Receipt</span>
                <span>{formatCurrency(receiptAmount, resolvedCurrency)}</span>
              </div>
              <div className="mt-1 h-2 rounded-full bg-emerald-50">
                <div
                  className={`h-2 rounded-full ${
                    validation.is_match ? 'bg-emerald-500' : 'bg-amber-500'
                  }`}
                  style={{ width: `${receiptWidth}%` }}
                />
              </div>
            </div>
          </div>
          <p className="mt-2 text-xs font-semibold text-slate-600">
            {delta === 0
              ? 'Totals perfectly align.'
              : delta > 0
                ? `Receipt higher by ${formatCurrency(Math.abs(delta), resolvedCurrency)}`
                : `Receipt lower by ${formatCurrency(Math.abs(delta), resolvedCurrency)}`}
          </p>
        </div>
      </div>

      <div className="mt-4">
        <div className="flex items-center gap-2 text-sm font-semibold text-slate-700">
          <AlertTriangle className="h-4 w-4 text-amber-500" />
          Line item review
        </div>
        {itemDifferences.length === 0 ? (
          <p className="mt-2 text-sm text-slate-500">No line item differences detected.</p>
        ) : (
          <div className="mt-3 space-y-2 rounded-2xl border border-slate-100 bg-slate-50 p-3 text-sm text-slate-600">
            {itemDifferences.map(diff => (
              <div
                key={`${diff.item_name}-${diff.issue}`}
                className="rounded-xl border border-slate-100 bg-white px-3 py-2"
              >
                <p className="font-semibold text-slate-900">{diff.item_name || 'Item'}</p>
                <p className="text-xs uppercase tracking-wide text-rose-600">{diff.issue}</p>
                <div className="mt-1 text-xs text-slate-500">
                  {diff.expected_quantity !== undefined && diff.found_quantity !== undefined && (
                    <p>
                      Qty expected {diff.expected_quantity} vs receipt {diff.found_quantity}
                    </p>
                  )}
                  {diff.expected_unit_price !== undefined &&
                    diff.found_unit_price !== undefined && (
                      <p>
                        Unit price {diff.expected_unit_price} vs receipt {diff.found_unit_price}
                      </p>
                    )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {issueList.length > 0 && (
        <div className="mt-4 rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3">
          <p className="text-xs uppercase tracking-wide text-slate-400">AI insights</p>
          <ul className="mt-2 list-disc space-y-1 pl-4 text-sm text-slate-600">
            {issueList.map(issue => (
              <li key={issue}>{issue}</li>
            ))}
          </ul>
        </div>
      )}
      {llmAnalysis?.confidence !== undefined && (
        <p className="mt-2 text-xs text-slate-500">
          Confidence: {Math.round(llmAnalysis.confidence * 100)}%
        </p>
      )}
    </section>
  );
};
