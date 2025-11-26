export type Role = 'super_admin' | 'staff' | 'approver_lvl1' | 'approver_lvl2' | 'finance';

export type RequestStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

export interface RequestItem {
  id: string;
  name: string;
  description?: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

export interface ApprovalDecision {
  id: string;
  level: 1 | 2;
  approverName: string;
  role: Role;
  decision: 'approved' | 'rejected';
  comment?: string;
  timestamp: string;
}

export interface PurchaseOrderInfo {
  poNumber: string;
  vendorName: string;
  totalAmount: number;
  currency: string;
  terms?: string;
  firebaseUrl: string;
  structuredData?: Record<string, unknown>;
}

export interface ExtractionSummary {
  vendor_name?: string;
  currency?: string;
  document_date?: string;
  total_amount?: number;
  items?: Array<{
    name: string;
    description?: string;
    quantity: number;
    unit_price: number;
    total_price: number;
  }>;
  terms?: string;
  confidence?: number;
}

export interface DocumentExtractionResult {
  id: string;
  doc_type: 'proforma' | 'receipt' | 'po';
  firebase_url: string;
  raw_text?: string;
  final_data: ExtractionSummary;
  confidence_score: number;
  created_at: string;
}

export interface ValidationVendorMatch {
  expected?: string;
  found?: string;
  similarity?: number;
}

export interface ValidationAmountMatch {
  expected?: number;
  found?: number;
  difference?: number;
}

export interface ValidationItemDifference {
  item_name?: string;
  issue?: string;
  expected_quantity?: number;
  found_quantity?: number;
  expected_unit_price?: number;
  found_unit_price?: number;
}

export interface ValidationLLMAnalysis {
  summary?: string;
  issues?: string[];
  confidence?: number;
}

export interface ValidationDetails {
  is_match: boolean;
  score: number;
  details?: {
    vendor_match?: ValidationVendorMatch;
    total_amount_match?: ValidationAmountMatch;
    item_differences?: ValidationItemDifference[];
    llm_analysis?: ValidationLLMAnalysis;
  };
}

export interface PurchaseRequest {
  id: string;
  reference: string;
  title: string;
  description: string;
  category?: string;
  status: RequestStatus;
  createdAt: string;
  createdBy: {
    id: string;
    name: string;
    role: Role;
  };
  vendorName?: string;
  currency?: string;
  amountEstimated: number;
  amountFromProforma?: number;
  proformaUrl?: string;
  proformaExtraction?: DocumentExtractionResult;
  purchaseOrder?: PurchaseOrderInfo;
  receiptUrl?: string;
  receiptExtraction?: DocumentExtractionResult;
  latestValidation?: ValidationDetails;
  approvals: ApprovalDecision[];
  currentApprovalLevel: number;
  requiredApprovalLevels: number;
  items: RequestItem[];
  notes?: string;
  neededBy?: string;
}
