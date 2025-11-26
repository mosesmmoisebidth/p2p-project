import type { RequestItem } from '../types';
import { formatCurrency } from '../utils/format';

interface Props {
  items: RequestItem[] | undefined;
  currency?: string;
  caption?: string;
}

export const ItemsTable = ({ items = [], currency = 'USD', caption }: Props) => {
  if (!items.length) {
    return (
      <div className="rounded-lg border border-dashed border-slate-200 p-4 text-sm text-slate-500">
        No line items available.
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
      {caption && <div className="border-b border-slate-100 px-4 py-2 text-sm font-medium">{caption}</div>}
      <table className="w-full text-sm">
        <thead className="bg-slate-50 text-left text-slate-500">
          <tr>
            <th className="px-4 py-2">Item</th>
            <th className="px-4 py-2">Description</th>
            <th className="px-4 py-2 text-right">Qty</th>
            <th className="px-4 py-2 text-right">Unit Price</th>
            <th className="px-4 py-2 text-right">Total</th>
          </tr>
        </thead>
        <tbody>
          {items.map(item => (
            <tr key={item.id} className="border-t border-slate-100">
              <td className="px-4 py-2 font-medium text-slate-700">{item.name}</td>
              <td className="px-4 py-2 text-slate-500">{item.description || 'N/A'}</td>
              <td className="px-4 py-2 text-right">{item.quantity}</td>
              <td className="px-4 py-2 text-right">{formatCurrency(item.unitPrice, currency)}</td>
              <td className="px-4 py-2 text-right font-semibold">
                {formatCurrency(item.totalPrice, currency)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
