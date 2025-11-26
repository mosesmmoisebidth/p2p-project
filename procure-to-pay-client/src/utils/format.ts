import type { Role } from '../types';

const sanitizeCurrency = (currency?: string) => {
  if (!currency) return 'USD';
  const match = currency.match(/[A-Za-z]{3}/);
  return match ? match[0].toUpperCase() : 'USD';
};

export const formatCurrency = (value: number, currency = 'USD') => {
  const normalized = sanitizeCurrency(currency);
  try {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: normalized }).format(value);
  } catch {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value);
  }
};

export const formatDate = (value?: string) => {
  if (!value) return 'N/A';
  return new Date(value).toLocaleDateString();
};

export const formatRole = (role: Role) => {
  switch (role) {
    case 'super_admin':
      return 'Super Admin';
    case 'approver_lvl1':
      return 'Approver Level 1';
    case 'approver_lvl2':
      return 'Approver Level 2';
    case 'finance':
      return 'Finance';
    case 'staff':
    default:
      return 'Staff';
  }
};
