import type { PurchaseRequest } from '../types';

const now = new Date();

const addDays = (days: number) => {
  const date = new Date(now);
  date.setDate(date.getDate() + days);
  return date.toISOString();
};

export const mockRequests: PurchaseRequest[] = [
  {
    id: 'REQ-2025-0001',
    reference: 'REQ-2025-0001',
    title: 'Engineering Laptops',
    description: 'Purchase of laptops for the new engineering cohort.',
    status: 'PENDING',
    createdAt: addDays(-4),
    createdBy: { id: 'user-staff-1', name: 'Alice Mutesi', role: 'staff' },
    vendorName: 'Tech Hub Africa',
    currency: 'USD',
    amountEstimated: 12000,
    amountFromProforma: 11850,
    proformaUrl: '#',
    proformaExtraction: {
      id: 'extract-proforma-1',
      doc_type: 'proforma',
      firebase_url: '#',
      final_data: {
        vendor_name: 'Tech Hub Africa',
        currency: 'USD',
        total_amount: 11850,
        items: [
          { name: 'Dell Latitude 7420', quantity: 10, unit_price: 1185, total_price: 11850 },
        ],
        confidence: 0.88,
      },
      confidence_score: 0.88,
      created_at: addDays(-4),
    },
    approvals: [
      {
        id: 'apr-1',
        level: 1,
        approverName: 'Brian Kamau',
        role: 'approver_lvl1',
        decision: 'approved',
        comment: 'Looks good.',
        timestamp: addDays(-2),
      },
    ],
    currentApprovalLevel: 2,
    requiredApprovalLevels: 1,
    items: [
      {
        id: 'itm-1',
        name: 'Dell Latitude 7420',
        description: 'i7, 16GB RAM, 512GB SSD',
        quantity: 10,
        unitPrice: 1185,
        totalPrice: 11850,
      },
    ],
    notes: 'Urgent for onboarding.',
    neededBy: addDays(10),
  },
  {
    id: 'REQ-2025-0002',
    reference: 'REQ-2025-0002',
    title: 'Office Furniture',
    description: 'Reception area furniture set.',
    status: 'APPROVED',
    createdAt: addDays(-14),
    createdBy: { id: 'user-staff-2', name: 'Daniel Okello', role: 'staff' },
    vendorName: 'Urban Interiors',
    currency: 'USD',
    amountEstimated: 8000,
    amountFromProforma: 7900,
    proformaUrl: '#',
    proformaExtraction: {
      id: 'extract-proforma-2',
      doc_type: 'proforma',
      firebase_url: '#',
      final_data: {
        vendor_name: 'Urban Interiors',
        currency: 'USD',
        total_amount: 7900,
        items: [
          { name: 'Reception Desk', quantity: 1, unit_price: 2500, total_price: 2500 },
          { name: 'Guest Sofa Set', quantity: 2, unit_price: 2700, total_price: 5400 },
        ],
        confidence: 0.9,
      },
      confidence_score: 0.9,
      created_at: addDays(-14),
    },
    purchaseOrder: {
      poNumber: 'PO-2025-0101',
      vendorName: 'Urban Interiors',
      totalAmount: 7900,
      currency: 'USD',
      terms: 'Net 30',
      firebaseUrl: '#',
    },
    receiptUrl: '#',
    receiptExtraction: {
      id: 'extract-receipt-1',
      doc_type: 'receipt',
      firebase_url: '#',
      final_data: {
        vendor_name: 'Urban Interiors Ltd',
        currency: 'USD',
        total_amount: 7950,
        items: [
          { name: 'Reception Desk', quantity: 1, unit_price: 2500, total_price: 2500 },
          { name: 'Guest Sofa Set', quantity: 2, unit_price: 2725, total_price: 5450 },
        ],
        confidence: 0.82,
      },
      confidence_score: 0.82,
      created_at: addDays(-10),
    },
    latestValidation: {
      is_match: false,
      score: 0.6,
      details: {
        total_amount_match: { expected: 7900, found: 7950, difference: 50 },
        item_differences: [
          {
            item_name: 'Guest Sofa Set',
            issue: 'unit price mismatch',
            expected_unit_price: 2700,
            found_unit_price: 2725,
          },
        ],
      },
    },
    approvals: [
      {
        id: 'apr-2',
        level: 1,
        approverName: 'Brian Kamau',
        role: 'approver_lvl1',
        decision: 'approved',
        timestamp: addDays(-12),
      },
      {
        id: 'apr-3',
        level: 2,
        approverName: 'Cynthia Arinaitwe',
        role: 'approver_lvl2',
        decision: 'approved',
        timestamp: addDays(-11),
      },
    ],
    currentApprovalLevel: 2,
    requiredApprovalLevels: 0,
    items: [
      { id: 'itm-2', name: 'Reception Desk', quantity: 1, unitPrice: 2500, totalPrice: 2500 },
      { id: 'itm-3', name: 'Guest Sofa Set', quantity: 2, unitPrice: 2700, totalPrice: 5400 },
    ],
    notes: 'Deliver during off-peak hours.',
    neededBy: addDays(-2),
  },
  {
    id: 'REQ-2025-0003',
    reference: 'REQ-2025-0003',
    title: 'Cloud Subscription Renewal',
    description: 'Annual renewal for Smart P2P cloud stack.',
    status: 'REJECTED',
    createdAt: addDays(-20),
    createdBy: { id: 'user-staff-3', name: 'Emma Twine', role: 'staff' },
    vendorName: 'CloudScale Ltd',
    currency: 'USD',
    amountEstimated: 15000,
    proformaUrl: '#',
    approvals: [
      {
        id: 'apr-4',
        level: 1,
        approverName: 'Brian Kamau',
        role: 'approver_lvl1',
        decision: 'rejected',
        comment: 'Need updated usage report.',
        timestamp: addDays(-18),
      },
    ],
    currentApprovalLevel: 1,
    requiredApprovalLevels: 2,
    items: [],
  },
];
