export interface Contact {
  id: string;
  name: string;
  email: string;
  phone: string;
  company: string;
  title: string;
  tags: string[];
  notes: string;
  status: 'active' | 'inactive' | 'lead';
  createdAt: string;
  lastContact: string;
}

export interface Deal {
  id: string;
  title: string;
  value: number;
  probability: number;
  stage: DealStage;
  contactId: string;
  contactName: string;
  expectedCloseDate: string;
  description: string;
  createdAt: string;
  assignedTo: string;
}

export type DealStage = 'prospect' | 'qualified' | 'proposal' | 'negotiation' | 'closed_won' | 'closed_lost';

export interface Product {
  id: string;
  name: string;
  category: string;
  price: number;
  tier: 'basic' | 'standard' | 'premium';
  inventory: number;
  description: string;
  sku: string;
  active: boolean;
}

export interface Invoice {
  id: string;
  number: string;
  dealId: string;
  contactId: string;
  contactName: string;
  items: InvoiceItem[];
  subtotal: number;
  tax: number;
  total: number;
  status: 'draft' | 'sent' | 'paid' | 'overdue';
  issueDate: string;
  dueDate: string;
}

export interface InvoiceItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

export interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'manager' | 'rep';
  avatar: string;
  dealsWon: number;
  revenue: number;
  activitiesCount: number;
  commissionRate: number;
  commissionEarned: number;
}

export interface Activity {
  id: string;
  type: 'call' | 'email' | 'meeting' | 'note' | 'deal_won' | 'deal_lost' | 'invoice_sent' | 'contact_added';
  description: string;
  userId: string;
  userName: string;
  timestamp: string;
  relatedId?: string;
}

export interface CompanySettings {
  name: string;
  email: string;
  phone: string;
  address: string;
  taxRate: number;
  currency: string;
  logo: string;
}
