import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Contact, Deal, DealStage, Product, Invoice, TeamMember, Activity, AuditEntry, CompanySettings } from '../types';
import { sampleContacts, sampleDeals, sampleProducts, sampleInvoices, sampleTeam, sampleActivities } from '../data/sampleData';

function uid(): string {
  return Math.random().toString(36).slice(2, 10);
}

interface AppState {
  contacts: Contact[];
  deals: Deal[];
  products: Product[];
  invoices: Invoice[];
  team: TeamMember[];
  activities: Activity[];
  auditLog: AuditEntry[];
  settings: CompanySettings;

  // Contact actions
  addContact: (c: Omit<Contact, 'id' | 'createdAt'>) => void;
  updateContact: (id: string, c: Partial<Contact>) => void;
  deleteContact: (id: string) => void;
  importContacts: (contacts: Omit<Contact, 'id' | 'createdAt'>[]) => void;

  // Deal actions
  addDeal: (d: Omit<Deal, 'id' | 'createdAt'>) => void;
  updateDeal: (id: string, d: Partial<Deal>) => void;
  moveDeal: (id: string, stage: DealStage) => void;
  deleteDeal: (id: string) => void;

  // Product actions
  addProduct: (p: Omit<Product, 'id'>) => void;
  updateProduct: (id: string, p: Partial<Product>) => void;
  deleteProduct: (id: string) => void;

  // Invoice actions
  addInvoice: (inv: Omit<Invoice, 'id' | 'number'>) => void;
  updateInvoice: (id: string, inv: Partial<Invoice>) => void;
  deleteInvoice: (id: string) => void;

  // Activity actions
  addActivity: (a: Omit<Activity, 'id' | 'timestamp'>) => void;

  // Audit actions
  addAuditEntry: (entry: Omit<AuditEntry, 'id' | 'timestamp'>) => void;

  // Settings
  updateSettings: (s: Partial<CompanySettings>) => void;
}

export const useStore = create<AppState>()(
  persist(
    (set) => ({
      contacts: sampleContacts,
      deals: sampleDeals,
      products: sampleProducts,
      invoices: sampleInvoices,
      team: sampleTeam,
      activities: sampleActivities,
      auditLog: [],
      settings: {
        name: 'Acme Corporation',
        email: 'admin@acmecorp.com',
        phone: '+1-555-0100',
        address: '123 Business Ave, Suite 400, San Francisco, CA 94105',
        taxRate: 15,
        currency: 'USD',
        logo: '',
        fiscalYearStart: '2026-01-01',
        defaultPaymentTerms: 30,
      },

      addContact: (c) =>
        set((s) => ({
          contacts: [...s.contacts, { ...c, id: `c${uid()}`, createdAt: new Date().toISOString().slice(0, 10) }],
          activities: [
            { id: `a${uid()}`, type: 'contact_added', description: `Added new contact: ${c.name} (${c.company})`, userId: 't1', userName: 'System', timestamp: new Date().toISOString(), relatedType: 'contact' },
            ...s.activities,
          ],
          auditLog: [
            { id: `au${uid()}`, action: 'create', entity: 'contact', entityId: c.name, entityName: c.name, userId: 't1', userName: 'System', timestamp: new Date().toISOString(), changes: `Created contact: ${c.name}` },
            ...s.auditLog,
          ],
        })),

      updateContact: (id, c) =>
        set((s) => ({
          contacts: s.contacts.map((x) => (x.id === id ? { ...x, ...c } : x)),
          auditLog: [
            { id: `au${uid()}`, action: 'update', entity: 'contact', entityId: id, entityName: s.contacts.find(x => x.id === id)?.name || id, userId: 't1', userName: 'System', timestamp: new Date().toISOString(), changes: `Updated contact fields: ${Object.keys(c).join(', ')}` },
            ...s.auditLog,
          ],
        })),

      deleteContact: (id) =>
        set((s) => {
          const contact = s.contacts.find((x) => x.id === id);
          return {
            contacts: s.contacts.filter((x) => x.id !== id),
            auditLog: [
              { id: `au${uid()}`, action: 'delete', entity: 'contact', entityId: id, entityName: contact?.name || id, userId: 't1', userName: 'System', timestamp: new Date().toISOString(), changes: `Deleted contact: ${contact?.name || id}` },
              ...s.auditLog,
            ],
          };
        }),

      importContacts: (newContacts) =>
        set((s) => {
          const imported = newContacts.map((c) => ({ ...c, id: `c${uid()}`, createdAt: new Date().toISOString().slice(0, 10) }));
          return {
            contacts: [...s.contacts, ...imported],
            activities: [
              { id: `a${uid()}`, type: 'contact_added', description: `Imported ${imported.length} contacts via CSV`, userId: 't1', userName: 'System', timestamp: new Date().toISOString(), relatedType: 'contact' },
              ...s.activities,
            ],
            auditLog: [
              { id: `au${uid()}`, action: 'import', entity: 'contact', entityId: 'bulk', entityName: `${imported.length} contacts`, userId: 't1', userName: 'System', timestamp: new Date().toISOString(), changes: `Imported ${imported.length} contacts` },
              ...s.auditLog,
            ],
          };
        }),

      addDeal: (d) =>
        set((s) => ({
          deals: [...s.deals, { ...d, id: `d${uid()}`, createdAt: new Date().toISOString().slice(0, 10) }],
          activities: [
            { id: `a${uid()}`, type: 'note', description: `New deal created: ${d.title} ($${d.value.toLocaleString()})`, userId: 't1', userName: 'System', timestamp: new Date().toISOString(), relatedType: 'deal' },
            ...s.activities,
          ],
          auditLog: [
            { id: `au${uid()}`, action: 'create', entity: 'deal', entityId: d.title, entityName: d.title, userId: 't1', userName: 'System', timestamp: new Date().toISOString(), changes: `Created deal: ${d.title} ($${d.value.toLocaleString()})` },
            ...s.auditLog,
          ],
        })),

      updateDeal: (id, d) =>
        set((s) => ({
          deals: s.deals.map((x) => (x.id === id ? { ...x, ...d } : x)),
          auditLog: [
            { id: `au${uid()}`, action: 'update', entity: 'deal', entityId: id, entityName: s.deals.find(x => x.id === id)?.title || id, userId: 't1', userName: 'System', timestamp: new Date().toISOString(), changes: `Updated deal fields: ${Object.keys(d).join(', ')}` },
            ...s.auditLog,
          ],
        })),

      moveDeal: (id, stage) =>
        set((s) => {
          const deal = s.deals.find((x) => x.id === id);
          if (!deal) return s;
          const actType = stage === 'closed_won' ? 'deal_won' as const : stage === 'closed_lost' ? 'deal_lost' as const : 'stage_change' as const;
          const desc = stage === 'closed_won'
            ? `Won deal: ${deal.title} ($${deal.value.toLocaleString()})`
            : stage === 'closed_lost'
            ? `Lost deal: ${deal.title} ($${deal.value.toLocaleString()})`
            : `Moved ${deal.title} to ${stage.replace('_', ' ')}`;
          const now = new Date().toISOString();
          const daysInStage = deal.stageHistory.length > 0
            ? Math.round((Date.now() - new Date(deal.stageHistory[deal.stageHistory.length - 1].date).getTime()) / 86400000)
            : Math.round((Date.now() - new Date(deal.createdAt).getTime()) / 86400000);
          const newHistory = [...deal.stageHistory, { from: deal.stage, to: stage, date: now.slice(0, 10), daysInStage }];
          return {
            deals: s.deals.map((x) => (x.id === id ? { ...x, stage, stageHistory: newHistory } : x)),
            activities: [
              { id: `a${uid()}`, type: actType, description: desc, userId: 't1', userName: 'System', timestamp: now, relatedId: id, relatedType: 'deal' as const, metadata: { from: deal.stage, to: stage } },
              ...s.activities,
            ],
            auditLog: [
              { id: `au${uid()}`, action: 'stage_change', entity: 'deal', entityId: id, entityName: deal.title, userId: 't1', userName: 'System', timestamp: now, changes: `Stage: ${deal.stage} -> ${stage}` },
              ...s.auditLog,
            ],
          };
        }),

      deleteDeal: (id) =>
        set((s) => ({ deals: s.deals.filter((x) => x.id !== id) })),

      addProduct: (p) =>
        set((s) => ({ products: [...s.products, { ...p, id: `p${uid()}` }] })),

      updateProduct: (id, p) =>
        set((s) => ({ products: s.products.map((x) => (x.id === id ? { ...x, ...p } : x)) })),

      deleteProduct: (id) =>
        set((s) => ({ products: s.products.filter((x) => x.id !== id) })),

      addInvoice: (inv) =>
        set((s) => {
          const num = `INV-2026-${String(s.invoices.length + 1).padStart(3, '0')}`;
          return {
            invoices: [...s.invoices, { ...inv, id: `inv${uid()}`, number: num }],
            activities: [
              { id: `a${uid()}`, type: 'invoice_sent', description: `Created invoice ${num} for ${inv.contactName} ($${inv.total.toLocaleString()})`, userId: 't1', userName: 'System', timestamp: new Date().toISOString(), relatedType: 'invoice' },
              ...s.activities,
            ],
            auditLog: [
              { id: `au${uid()}`, action: 'create', entity: 'invoice', entityId: num, entityName: num, userId: 't1', userName: 'System', timestamp: new Date().toISOString(), changes: `Created invoice ${num}: $${inv.total.toLocaleString()}` },
              ...s.auditLog,
            ],
          };
        }),

      updateInvoice: (id, inv) =>
        set((s) => ({ invoices: s.invoices.map((x) => (x.id === id ? { ...x, ...inv } : x)) })),

      deleteInvoice: (id) =>
        set((s) => ({ invoices: s.invoices.filter((x) => x.id !== id) })),

      addActivity: (a) =>
        set((s) => ({
          activities: [{ ...a, id: `a${uid()}`, timestamp: new Date().toISOString() }, ...s.activities],
        })),

      addAuditEntry: (entry) =>
        set((s) => ({
          auditLog: [{ ...entry, id: `au${uid()}`, timestamp: new Date().toISOString() }, ...s.auditLog],
        })),

      updateSettings: (s2) =>
        set((s) => ({
          settings: { ...s.settings, ...s2 },
          auditLog: [
            { id: `au${uid()}`, action: 'update', entity: 'settings', entityId: 'company', entityName: 'Company Settings', userId: 't1', userName: 'System', timestamp: new Date().toISOString(), changes: `Updated settings: ${Object.keys(s2).join(', ')}` },
            ...s.auditLog,
          ],
        })),
    }),
    { name: 'enterprise-platform-store' }
  )
);
