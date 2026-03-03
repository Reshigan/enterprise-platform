import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Contact, Deal, DealStage, Product, Invoice, InvoiceItem, TeamMember, Activity, CompanySettings } from '../types';
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
  settings: CompanySettings;

  // Contact actions
  addContact: (c: Omit<Contact, 'id' | 'createdAt'>) => void;
  updateContact: (id: string, c: Partial<Contact>) => void;
  deleteContact: (id: string) => void;

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
      settings: {
        name: 'Acme Corporation',
        email: 'admin@acmecorp.com',
        phone: '+1-555-0100',
        address: '123 Business Ave, Suite 400, San Francisco, CA 94105',
        taxRate: 15,
        currency: 'USD',
        logo: '',
      },

      addContact: (c) =>
        set((s) => ({
          contacts: [...s.contacts, { ...c, id: `c${uid()}`, createdAt: new Date().toISOString().slice(0, 10) }],
          activities: [
            { id: `a${uid()}`, type: 'contact_added', description: `Added new contact: ${c.name} (${c.company})`, userId: 't1', userName: 'System', timestamp: new Date().toISOString() },
            ...s.activities,
          ],
        })),

      updateContact: (id, c) =>
        set((s) => ({ contacts: s.contacts.map((x) => (x.id === id ? { ...x, ...c } : x)) })),

      deleteContact: (id) =>
        set((s) => ({ contacts: s.contacts.filter((x) => x.id !== id) })),

      addDeal: (d) =>
        set((s) => ({
          deals: [...s.deals, { ...d, id: `d${uid()}`, createdAt: new Date().toISOString().slice(0, 10) }],
          activities: [
            { id: `a${uid()}`, type: 'note', description: `New deal created: ${d.title} ($${d.value.toLocaleString()})`, userId: 't1', userName: 'System', timestamp: new Date().toISOString() },
            ...s.activities,
          ],
        })),

      updateDeal: (id, d) =>
        set((s) => ({ deals: s.deals.map((x) => (x.id === id ? { ...x, ...d } : x)) })),

      moveDeal: (id, stage) =>
        set((s) => {
          const deal = s.deals.find((x) => x.id === id);
          const actType = stage === 'closed_won' ? 'deal_won' : stage === 'closed_lost' ? 'deal_lost' : 'note';
          const desc = stage === 'closed_won'
            ? `Won deal: ${deal?.title} ($${deal?.value.toLocaleString()})`
            : stage === 'closed_lost'
            ? `Lost deal: ${deal?.title} ($${deal?.value.toLocaleString()})`
            : `Moved ${deal?.title} to ${stage.replace('_', ' ')}`;
          return {
            deals: s.deals.map((x) => (x.id === id ? { ...x, stage } : x)),
            activities: [
              { id: `a${uid()}`, type: actType, description: desc, userId: 't1', userName: 'System', timestamp: new Date().toISOString(), relatedId: id },
              ...s.activities,
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
              { id: `a${uid()}`, type: 'invoice_sent', description: `Created invoice ${num} for ${inv.contactName} ($${inv.total.toLocaleString()})`, userId: 't1', userName: 'System', timestamp: new Date().toISOString() },
              ...s.activities,
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

      updateSettings: (s2) =>
        set((s) => ({ settings: { ...s.settings, ...s2 } })),
    }),
    { name: 'enterprise-platform-store' }
  )
);
