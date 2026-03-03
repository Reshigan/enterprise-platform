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
  score: number;
  source: string;
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
  score: number;
  stageHistory: StageChange[];
  nextAction: string;
  nextActionDate: string;
  lostReason?: string;
}

export interface StageChange {
  from: DealStage;
  to: DealStage;
  date: string;
  daysInStage: number;
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
  costPrice: number;
  margin: number;
  salesCount: number;
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
  paidDate?: string;
  notes: string;
  paymentMethod?: string;
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
  quota: number;
  quotaAttainment: number;
  avgDealCycle: number;
}

export interface Activity {
  id: string;
  type: 'call' | 'email' | 'meeting' | 'note' | 'deal_won' | 'deal_lost' | 'invoice_sent' | 'contact_added' | 'stage_change' | 'task';
  description: string;
  userId: string;
  userName: string;
  timestamp: string;
  relatedId?: string;
  relatedType?: 'contact' | 'deal' | 'invoice' | 'product';
  metadata?: Record<string, string>;
}

export interface AuditEntry {
  id: string;
  action: string;
  entity: string;
  entityId: string;
  entityName: string;
  userId: string;
  userName: string;
  timestamp: string;
  changes: string;
}

export interface CompanySettings {
  name: string;
  email: string;
  phone: string;
  address: string;
  taxRate: number;
  currency: string;
  logo: string;
  fiscalYearStart: string;
  defaultPaymentTerms: number;
}

export interface PipelineMetrics {
  avgDealSize: number;
  avgCycleDays: number;
  velocityScore: number;
  conversionByStage: Record<DealStage, number>;
  totalPipelineValue: number;
  weightedPipeline: number;
}
