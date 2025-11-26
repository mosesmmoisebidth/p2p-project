import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '../api/client';
import type {
  ApprovalDecision,
  DocumentExtractionResult,
  PurchaseOrderInfo,
  PurchaseRequest,
  RequestItem,
  Role,
  ValidationDetails,
} from '../types';

type ApiRequest = {
  id: string;
  reference: string;
  title: string;
  description: string;
  category?: string;
  amount_estimated: string;
  amount_from_proforma?: string;
  currency?: string;
  vendor_name?: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  current_approval_level: number;
  required_approval_levels: number;
  created_by: {
    id: string;
    username: string;
    full_name: string;
    role: Role;
  };
  needed_by?: string;
  notes?: string;
  proforma_url?: string;
  purchase_order_url?: string;
  receipt_url?: string;
  items: Array<{
    id: string;
    name: string;
    description?: string;
    quantity: number;
    unit_price: string;
    total_price: string;
  }>;
  approvals: Array<{
    id: string;
    level: number;
    approver: {
      id: string;
      username: string;
      full_name: string;
      role: Role;
    };
    decision: 'approved' | 'rejected';
    comment?: string;
    created_at: string;
  }>;
  purchase_order: null | {
    po_number: string;
    vendor_name: string;
    currency: string;
    total_amount: string;
    firebase_url: string;
    structured_data?: Record<string, unknown>;
  };
  latest_validation: null | {
    is_match: boolean;
    score: number;
    details: Record<string, unknown>;
  };
  created_at: string;
  updated_at: string;
};

type PaginatedResponse<T> = {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
};

const normalizeItem = (item: ApiRequest['items'][number]): RequestItem => ({
  id: item.id,
  name: item.name,
  description: item.description,
  quantity: item.quantity,
  unitPrice: Number(item.unit_price),
  totalPrice: Number(item.total_price),
});

const normalizeApproval = (approval: ApiRequest['approvals'][number]): ApprovalDecision => ({
  id: approval.id,
  level: approval.level as 1 | 2,
  approverName: approval.approver.full_name || approval.approver.username,
  role: approval.approver.role,
  decision: approval.decision,
  comment: approval.comment,
  timestamp: approval.created_at,
});

const normalizePO = (po: NonNullable<ApiRequest['purchase_order']>): PurchaseOrderInfo => ({
  poNumber: po.po_number,
  vendorName: po.vendor_name,
  currency: po.currency,
  totalAmount: Number(po.total_amount),
  firebaseUrl: po.firebase_url,
  structuredData: po.structured_data,
});

const normalizeRequest = (data: ApiRequest): PurchaseRequest => ({
  id: data.id,
  reference: data.reference,
  title: data.title,
  description: data.description,
  category: data.category || undefined,
  status: data.status,
  createdAt: data.created_at,
  createdBy: {
    id: data.created_by.id,
    name: data.created_by.full_name || data.created_by.username,
    role: data.created_by.role,
  },
  vendorName: data.vendor_name || '',
  currency: data.currency || 'USD',
  amountEstimated: Number(data.amount_estimated),
  amountFromProforma: data.amount_from_proforma ? Number(data.amount_from_proforma) : undefined,
  proformaUrl: data.proforma_url || undefined,
  receiptUrl: data.receipt_url || undefined,
  items: (data.items || []).map(normalizeItem),
  approvals: (data.approvals || []).map(normalizeApproval),
  purchaseOrder: data.purchase_order ? normalizePO(data.purchase_order) : undefined,
  latestValidation: data.latest_validation || undefined,
  currentApprovalLevel: data.current_approval_level,
  requiredApprovalLevels: data.required_approval_levels,
  notes: data.notes || undefined,
  neededBy: data.needed_by || undefined,
});

type StaffFilters = {
  status?: 'PENDING' | 'APPROVED' | 'REJECTED';
  search?: string;
};

export const useStaffRequests = (filters?: StaffFilters) =>
  useQuery<PaginatedResponse<PurchaseRequest>>({
    queryKey: ['requests', 'staff', filters?.status ?? 'ALL', filters?.search ?? ''],
    queryFn: async () => {
      const res = await api.get('/requests/', {
        params: {
          mine: true,
          status: filters?.status,
          search: filters?.search,
        },
      });
      return {
        ...res.data,
        results: res.data.results.map(normalizeRequest),
      };
    },
  });

export const useRequestDetail = (id?: string) =>
  useQuery({
    queryKey: ['request', id],
    enabled: !!id,
    queryFn: async () => {
      const res = await api.get(`/requests/${id}/`);
      return normalizeRequest(res.data);
    },
  });

export const useCreateRequest = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (formData: FormData) => {
      const res = await api.post('/requests/', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return normalizeRequest(res.data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['requests'] });
    },
  });
};

export const useUpdateRequest = (id: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: Record<string, unknown>) => {
      const res = await api.patch(`/requests/${id}/`, payload);
      return normalizeRequest(res.data);
    },
    onSuccess: data => {
      queryClient.setQueryData(['request', id], data);
      queryClient.invalidateQueries({ queryKey: ['requests'] });
    },
  });
};

export const useApproveRequest = (id: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: { comment?: string }) => {
      const res = await api.patch(`/requests/${id}/approve/`, payload);
      return normalizeRequest(res.data);
    },
    onSuccess: data => {
      queryClient.setQueryData(['request', id], data);
      queryClient.invalidateQueries({ queryKey: ['requests'] });
    },
  });
};

export const useRejectRequest = (id: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: { comment?: string }) => {
      const res = await api.patch(`/requests/${id}/reject/`, payload);
      return normalizeRequest(res.data);
    },
    onSuccess: data => {
      queryClient.setQueryData(['request', id], data);
      queryClient.invalidateQueries({ queryKey: ['requests'] });
    },
  });
};

export const useSubmitReceipt = (id: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (formData: FormData) => {
      const res = await api.post(`/requests/${id}/submit-receipt/`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return {
        request: normalizeRequest(res.data.request),
        extraction: res.data.extraction as DocumentExtractionResult,
        validation: res.data.validation as ValidationDetails,
      };
    },
    onSuccess: data => {
      queryClient.setQueryData(['request', id], data.request);
      queryClient.invalidateQueries({ queryKey: ['requests'] });
    },
  });
};

type ApproverFilters = { search?: string };

export const useApproverRequests = (filters?: ApproverFilters) =>
  useQuery<PaginatedResponse<PurchaseRequest>>({
    queryKey: ['requests', 'approver', filters?.search ?? ''],
    queryFn: async () => {
      const res = await api.get('/requests/', {
        params: { pending_for_me: true, search: filters?.search },
      });
      return {
        ...res.data,
        results: res.data.results.map(normalizeRequest),
      };
    },
  });

type FinanceFilters = {
  validation?: 'matched' | 'mismatched' | 'pending';
  search?: string;
};

export const useFinanceRequests = (filters?: FinanceFilters) =>
  useQuery<PaginatedResponse<PurchaseRequest>>({
    queryKey: ['requests', 'finance', filters?.validation ?? 'all', filters?.search ?? ''],
    queryFn: async () => {
      const params: Record<string, string> = { status: 'APPROVED' };
      if (filters?.validation) {
        params.validation = filters.validation;
      }
      if (filters?.search) {
        params.search = filters.search;
      }
      const res = await api.get('/finance/requests/', { params });
      return {
        ...res.data,
        results: res.data.results.map(normalizeRequest),
      };
    },
  });

export const useDocumentExtraction = (id?: string, docType?: 'proforma' | 'receipt') =>
  useQuery({
    queryKey: ['extraction', id, docType],
    enabled: Boolean(id && docType),
    queryFn: async () => {
      const res = await api.get(`/requests/${id}/extraction/${docType}/`);
      return res.data as DocumentExtractionResult;
    },
  });
