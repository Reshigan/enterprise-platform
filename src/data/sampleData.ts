import { Contact, Deal, Product, Invoice, TeamMember, Activity } from '../types';

export const sampleContacts: Contact[] = [
  { id: 'c1', name: 'Sarah Chen', email: 'sarah@techcorp.com', phone: '+1-555-0101', company: 'TechCorp Inc', title: 'CTO', tags: ['enterprise', 'tech'], notes: 'Interested in premium tier', status: 'active', createdAt: '2025-12-01', lastContact: '2026-02-28' },
  { id: 'c2', name: 'James Wilson', email: 'james@globalretail.com', phone: '+1-555-0102', company: 'Global Retail', title: 'VP Sales', tags: ['retail', 'partner'], notes: 'Referred by Mike', status: 'active', createdAt: '2025-11-15', lastContact: '2026-03-01' },
  { id: 'c3', name: 'Emily Rodriguez', email: 'emily@finservices.com', phone: '+1-555-0103', company: 'FinServices Ltd', title: 'Head of Procurement', tags: ['finance', 'enterprise'], notes: 'Budget approval pending', status: 'lead', createdAt: '2026-01-10', lastContact: '2026-02-25' },
  { id: 'c4', name: 'Michael Park', email: 'michael@innovateai.com', phone: '+1-555-0104', company: 'InnovateAI', title: 'CEO', tags: ['startup', 'ai'], notes: 'Fast-moving deal', status: 'active', createdAt: '2026-01-20', lastContact: '2026-03-02' },
  { id: 'c5', name: 'Lisa Thompson', email: 'lisa@healthplus.com', phone: '+1-555-0105', company: 'HealthPlus', title: 'Operations Director', tags: ['healthcare'], notes: 'Needs compliance features', status: 'active', createdAt: '2025-10-05', lastContact: '2026-02-20' },
  { id: 'c6', name: 'David Kim', email: 'david@buildright.com', phone: '+1-555-0106', company: 'BuildRight Construction', title: 'Project Manager', tags: ['construction'], notes: 'Multi-site deployment', status: 'lead', createdAt: '2026-02-01', lastContact: '2026-02-28' },
  { id: 'c7', name: 'Amanda Foster', email: 'amanda@edulearn.com', phone: '+1-555-0107', company: 'EduLearn', title: 'Director of IT', tags: ['education', 'saas'], notes: 'Pilot program approved', status: 'active', createdAt: '2025-09-15', lastContact: '2026-03-01' },
  { id: 'c8', name: 'Robert Martinez', email: 'robert@logisticspro.com', phone: '+1-555-0108', company: 'LogisticsPro', title: 'Supply Chain Lead', tags: ['logistics'], notes: 'Integration requirements', status: 'inactive', createdAt: '2025-08-20', lastContact: '2026-01-15' },
  { id: 'c9', name: 'Jennifer Lee', email: 'jennifer@mediagroup.com', phone: '+1-555-0109', company: 'MediaGroup', title: 'Marketing VP', tags: ['media', 'marketing'], notes: 'Interested in analytics module', status: 'active', createdAt: '2026-02-10', lastContact: '2026-03-02' },
  { id: 'c10', name: 'Thomas Brown', email: 'thomas@securenet.com', phone: '+1-555-0110', company: 'SecureNet', title: 'CISO', tags: ['security', 'enterprise'], notes: 'Security audit required first', status: 'lead', createdAt: '2026-02-15', lastContact: '2026-02-27' },
];

export const sampleDeals: Deal[] = [
  { id: 'd1', title: 'TechCorp Enterprise License', value: 120000, probability: 80, stage: 'negotiation', contactId: 'c1', contactName: 'Sarah Chen', expectedCloseDate: '2026-03-30', description: 'Enterprise license for 500 users', createdAt: '2026-01-15', assignedTo: 'Alice Johnson' },
  { id: 'd2', title: 'Global Retail Integration', value: 85000, probability: 60, stage: 'proposal', contactId: 'c2', contactName: 'James Wilson', expectedCloseDate: '2026-04-15', description: 'POS integration across 50 stores', createdAt: '2026-01-20', assignedTo: 'Bob Smith' },
  { id: 'd3', title: 'FinServices Compliance Suite', value: 200000, probability: 40, stage: 'qualified', contactId: 'c3', contactName: 'Emily Rodriguez', expectedCloseDate: '2026-05-01', description: 'Full compliance module deployment', createdAt: '2026-02-01', assignedTo: 'Alice Johnson' },
  { id: 'd4', title: 'InnovateAI Starter Pack', value: 25000, probability: 90, stage: 'negotiation', contactId: 'c4', contactName: 'Michael Park', expectedCloseDate: '2026-03-15', description: 'AI starter package with API access', createdAt: '2026-02-10', assignedTo: 'Carol Davis' },
  { id: 'd5', title: 'HealthPlus Platform', value: 150000, probability: 70, stage: 'proposal', contactId: 'c5', contactName: 'Lisa Thompson', expectedCloseDate: '2026-04-30', description: 'Healthcare platform with HIPAA compliance', createdAt: '2025-12-01', assignedTo: 'Bob Smith' },
  { id: 'd6', title: 'BuildRight Multi-site', value: 45000, probability: 30, stage: 'prospect', contactId: 'c6', contactName: 'David Kim', expectedCloseDate: '2026-06-01', description: 'Construction project management for 10 sites', createdAt: '2026-02-15', assignedTo: 'Carol Davis' },
  { id: 'd7', title: 'EduLearn Annual License', value: 60000, probability: 95, stage: 'closed_won', contactId: 'c7', contactName: 'Amanda Foster', expectedCloseDate: '2026-02-28', description: 'Annual license renewal with premium support', createdAt: '2025-11-01', assignedTo: 'Alice Johnson' },
  { id: 'd8', title: 'LogisticsPro Tracking', value: 35000, probability: 10, stage: 'closed_lost', contactId: 'c8', contactName: 'Robert Martinez', expectedCloseDate: '2026-01-31', description: 'Supply chain tracking module', createdAt: '2025-10-15', assignedTo: 'Bob Smith' },
  { id: 'd9', title: 'MediaGroup Analytics', value: 75000, probability: 50, stage: 'qualified', contactId: 'c9', contactName: 'Jennifer Lee', expectedCloseDate: '2026-05-15', description: 'Marketing analytics dashboard', createdAt: '2026-02-20', assignedTo: 'Alice Johnson' },
  { id: 'd10', title: 'SecureNet Audit Package', value: 95000, probability: 20, stage: 'prospect', contactId: 'c10', contactName: 'Thomas Brown', expectedCloseDate: '2026-07-01', description: 'Security audit and monitoring suite', createdAt: '2026-02-25', assignedTo: 'Carol Davis' },
];

export const sampleProducts: Product[] = [
  { id: 'p1', name: 'Platform Starter', category: 'Software', price: 99, tier: 'basic', inventory: 999, description: 'Basic platform access for small teams', sku: 'PLT-STR-001', active: true },
  { id: 'p2', name: 'Platform Professional', category: 'Software', price: 299, tier: 'standard', inventory: 999, description: 'Professional features with analytics', sku: 'PLT-PRO-001', active: true },
  { id: 'p3', name: 'Platform Enterprise', category: 'Software', price: 799, tier: 'premium', inventory: 999, description: 'Full enterprise suite with custom integrations', sku: 'PLT-ENT-001', active: true },
  { id: 'p4', name: 'API Access Pack', category: 'Add-on', price: 149, tier: 'standard', inventory: 999, description: 'API access with 100K requests/month', sku: 'API-ACC-001', active: true },
  { id: 'p5', name: 'Premium Support', category: 'Service', price: 199, tier: 'premium', inventory: 50, description: '24/7 dedicated support with SLA', sku: 'SUP-PRM-001', active: true },
  { id: 'p6', name: 'Data Migration', category: 'Service', price: 2500, tier: 'premium', inventory: 10, description: 'Full data migration and onboarding service', sku: 'SVC-MIG-001', active: true },
  { id: 'p7', name: 'Analytics Module', category: 'Add-on', price: 99, tier: 'standard', inventory: 999, description: 'Advanced analytics and reporting', sku: 'MOD-ANL-001', active: true },
  { id: 'p8', name: 'Compliance Pack', category: 'Add-on', price: 349, tier: 'premium', inventory: 999, description: 'HIPAA, SOC2, GDPR compliance tools', sku: 'MOD-CMP-001', active: true },
];

export const sampleInvoices: Invoice[] = [
  { id: 'inv1', number: 'INV-2026-001', dealId: 'd7', contactId: 'c7', contactName: 'Amanda Foster', items: [{ id: 'li1', description: 'Platform Enterprise - Annual License', quantity: 1, unitPrice: 60000, total: 60000 }], subtotal: 60000, tax: 9000, total: 69000, status: 'paid', issueDate: '2026-02-01', dueDate: '2026-03-01' },
  { id: 'inv2', number: 'INV-2026-002', dealId: 'd1', contactId: 'c1', contactName: 'Sarah Chen', items: [{ id: 'li2', description: 'Platform Enterprise x 500 users', quantity: 500, unitPrice: 200, total: 100000 }, { id: 'li3', description: 'Premium Support', quantity: 1, unitPrice: 20000, total: 20000 }], subtotal: 120000, tax: 18000, total: 138000, status: 'sent', issueDate: '2026-03-01', dueDate: '2026-04-01' },
  { id: 'inv3', number: 'INV-2026-003', dealId: 'd5', contactId: 'c5', contactName: 'Lisa Thompson', items: [{ id: 'li4', description: 'Platform Enterprise + Compliance', quantity: 1, unitPrice: 150000, total: 150000 }], subtotal: 150000, tax: 22500, total: 172500, status: 'draft', issueDate: '2026-03-02', dueDate: '2026-04-02' },
  { id: 'inv4', number: 'INV-2026-004', dealId: 'd4', contactId: 'c4', contactName: 'Michael Park', items: [{ id: 'li5', description: 'Platform Starter + API Pack', quantity: 1, unitPrice: 25000, total: 25000 }], subtotal: 25000, tax: 3750, total: 28750, status: 'overdue', issueDate: '2026-01-15', dueDate: '2026-02-15' },
];

export const sampleTeam: TeamMember[] = [
  { id: 't1', name: 'Alice Johnson', email: 'alice@company.com', role: 'manager', avatar: 'AJ', dealsWon: 12, revenue: 480000, activitiesCount: 156, commissionRate: 8, commissionEarned: 38400 },
  { id: 't2', name: 'Bob Smith', email: 'bob@company.com', role: 'rep', avatar: 'BS', dealsWon: 8, revenue: 320000, activitiesCount: 134, commissionRate: 6, commissionEarned: 19200 },
  { id: 't3', name: 'Carol Davis', email: 'carol@company.com', role: 'rep', avatar: 'CD', dealsWon: 15, revenue: 550000, activitiesCount: 201, commissionRate: 7, commissionEarned: 38500 },
  { id: 't4', name: 'Dan Wright', email: 'dan@company.com', role: 'admin', avatar: 'DW', dealsWon: 0, revenue: 0, activitiesCount: 45, commissionRate: 0, commissionEarned: 0 },
  { id: 't5', name: 'Eva Martinez', email: 'eva@company.com', role: 'rep', avatar: 'EM', dealsWon: 6, revenue: 210000, activitiesCount: 98, commissionRate: 5, commissionEarned: 10500 },
];

export const sampleActivities: Activity[] = [
  { id: 'a1', type: 'deal_won', description: 'Closed deal: EduLearn Annual License ($60,000)', userId: 't1', userName: 'Alice Johnson', timestamp: '2026-03-02T14:30:00Z', relatedId: 'd7' },
  { id: 'a2', type: 'email', description: 'Sent proposal to Sarah Chen at TechCorp', userId: 't1', userName: 'Alice Johnson', timestamp: '2026-03-02T11:15:00Z', relatedId: 'c1' },
  { id: 'a3', type: 'call', description: 'Discovery call with Emily Rodriguez', userId: 't2', userName: 'Bob Smith', timestamp: '2026-03-02T09:00:00Z', relatedId: 'c3' },
  { id: 'a4', type: 'meeting', description: 'Product demo for Global Retail team', userId: 't2', userName: 'Bob Smith', timestamp: '2026-03-01T15:00:00Z', relatedId: 'c2' },
  { id: 'a5', type: 'invoice_sent', description: 'Sent Invoice INV-2026-002 to TechCorp ($138,000)', userId: 't1', userName: 'Alice Johnson', timestamp: '2026-03-01T10:00:00Z', relatedId: 'inv2' },
  { id: 'a6', type: 'contact_added', description: 'Added new contact: Thomas Brown (SecureNet)', userId: 't3', userName: 'Carol Davis', timestamp: '2026-02-28T16:00:00Z', relatedId: 'c10' },
  { id: 'a7', type: 'note', description: 'Updated notes for HealthPlus deal - compliance req', userId: 't2', userName: 'Bob Smith', timestamp: '2026-02-28T14:30:00Z', relatedId: 'd5' },
  { id: 'a8', type: 'deal_lost', description: 'Lost deal: LogisticsPro Tracking ($35,000)', userId: 't2', userName: 'Bob Smith', timestamp: '2026-02-27T11:00:00Z', relatedId: 'd8' },
  { id: 'a9', type: 'call', description: 'Follow-up call with Michael Park', userId: 't3', userName: 'Carol Davis', timestamp: '2026-02-27T09:30:00Z', relatedId: 'c4' },
  { id: 'a10', type: 'email', description: 'Sent pricing breakdown to Jennifer Lee', userId: 't1', userName: 'Alice Johnson', timestamp: '2026-02-26T13:00:00Z', relatedId: 'c9' },
  { id: 'a11', type: 'meeting', description: 'Quarterly review with InnovateAI', userId: 't3', userName: 'Carol Davis', timestamp: '2026-02-25T10:00:00Z', relatedId: 'c4' },
  { id: 'a12', type: 'contact_added', description: 'Added new contact: David Kim (BuildRight)', userId: 't3', userName: 'Carol Davis', timestamp: '2026-02-24T09:00:00Z', relatedId: 'c6' },
];
