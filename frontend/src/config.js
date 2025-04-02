// API URL
export const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

// Document types
export const DOCUMENT_TYPES = [
  { value: 'bank_statement', label: 'Bank Statement' },
  { value: 'credit_card_statement', label: 'Credit Card Statement' },
  { value: 'utility_bill', label: 'Utility Bill' },
  { value: 'invoice', label: 'Invoice' },
  { value: 'receipt', label: 'Receipt' },
  { value: 'other', label: 'Other' }
];

// Transaction categories
export const TRANSACTION_CATEGORIES = [
  'Housing',
  'Transportation',
  'Food',
  'Utilities',
  'Insurance',
  'Healthcare',
  'Debt Payments',
  'Savings',
  'Personal Spending',
  'Entertainment',
  'Education',
  'Gifts & Donations',
  'Travel',
  'Business',
  'Other'
];

// Insight types
export const INSIGHT_TYPES = {
  spending_pattern: {
    label: 'Spending Pattern',
    color: '#1976d2'
  },
  anomaly: {
    label: 'Anomaly',
    color: '#d32f2f'
  },
  recommendation: {
    label: 'Recommendation',
    color: '#2e7d32'
  },
  summary: {
    label: 'Summary',
    color: '#9c27b0'
  },
  system: {
    label: 'System',
    color: '#757575'
  }
};

// Dispute reasons
export const DISPUTE_REASONS = [
  { value: 'unauthorized_charge', label: 'Unauthorized Charge' },
  { value: 'duplicate_charge', label: 'Duplicate Charge' },
  { value: 'incorrect_amount', label: 'Incorrect Amount' },
  { value: 'service_not_provided', label: 'Service Not Provided' },
  { value: 'product_not_received', label: 'Product Not Received' },
  { value: 'defective_product', label: 'Defective Product' },
  { value: 'incorrect_fee', label: 'Incorrect Fee' },
  { value: 'billing_error', label: 'Billing Error' },
  { value: 'other', label: 'Other' }
];
