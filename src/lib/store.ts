import { useSyncExternalStore } from "react";
import {
  type AppRole,
  type Batch,
  type BatchState,
  type FintechFacility,
  type Order,
  type Organization,
  type Product,
  type RegulatoryIncident,
  type SupplyEvent,
  type VerificationResult,
  INITIAL_BATCHES,
  INITIAL_FINTECH,
  INITIAL_ORDERS,
  INITIAL_ORGANIZATIONS,
  INITIAL_PRODUCTS,
  INITIAL_REGULATORY_INCIDENTS,
  INITIAL_SUPPLY_EVENTS,
} from "./pharmtrace-data";

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface UserSession {
  name: string;
  email: string;
  role: AppRole;
  organizationId: string;
  organizationName: string;
  licenseNumber: string;
}

export interface AppState {
  currentRole: AppRole;
  session: UserSession;
  organizations: Organization[];
  products: Product[];
  batches: Batch[];
  supplyEvents: SupplyEvent[];
  orders: Order[];
  fintech: FintechFacility;
  incidents: RegulatoryIncident[];
  cart: CartItem[];
  recentScans: VerificationResult[];

  // Actions
  setRole: (role: AppRole) => void;
  setOrganization: (orgId: string) => void;
  addBatch: (batch: Omit<Batch, "id" | "createdAt" | "complianceScore">) => Batch;
  updateBatchState: (batchId: string, state: BatchState, reason?: string) => void;
  addSupplyEvent: (event: Omit<SupplyEvent, "id" | "occurredAt">) => SupplyEvent;
  addToCart: (product: Product, quantity?: number) => void;
  removeFromCart: (productId: string) => void;
  updateCartQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  placeOrder: (paymentMethod: "prepaid" | "bnpl_30" | "bnpl_60", deliveryAddress?: string) => Order | null;
  repayInvoice: (invoiceId: string, amount?: number) => void;
  addRegulatoryIncident: (incident: Omit<RegulatoryIncident, "id" | "reportedAt">) => RegulatoryIncident;
  updateIncidentStatus: (id: string, status: RegulatoryIncident["status"], action?: string) => void;
  addScanResult: (scan: VerificationResult) => void;
  resetToDefaults: () => void;
}

const STORAGE_KEY = "pharmtrace_system_state_v1";

function getInitialState(): Omit<AppState, keyof AppStateActions> {
  if (typeof window !== "undefined" && typeof window.localStorage !== "undefined") {
    try {
      const stored = window.localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed && parsed.batches && parsed.products) {
          return parsed;
        }
      }
    } catch {
      // In headless test environments or restricted iframes, ignore and fallback to seed
    }
  }

  return {
    currentRole: "manufacturer",
    session: {
      name: "Dr. Babatunde Adeleke, FPSN",
      email: "adeleke@emzorpharma.com",
      role: "manufacturer",
      organizationId: "org-emzor",
      organizationName: "Emzor Pharmaceutical Industries Ltd",
      licenseNumber: "NAF-MAN-0104",
    },
    organizations: INITIAL_ORGANIZATIONS,
    products: INITIAL_PRODUCTS,
    batches: INITIAL_BATCHES,
    supplyEvents: INITIAL_SUPPLY_EVENTS,
    orders: INITIAL_ORDERS,
    fintech: INITIAL_FINTECH,
    incidents: INITIAL_REGULATORY_INCIDENTS,
    cart: [],
    recentScans: [],
  };
}

type AppStateActions = {
  setRole: AppState["setRole"];
  setOrganization: AppState["setOrganization"];
  addBatch: AppState["addBatch"];
  updateBatchState: AppState["updateBatchState"];
  addSupplyEvent: AppState["addSupplyEvent"];
  addToCart: AppState["addToCart"];
  removeFromCart: AppState["removeFromCart"];
  updateCartQuantity: AppState["updateCartQuantity"];
  clearCart: AppState["clearCart"];
  placeOrder: AppState["placeOrder"];
  repayInvoice: AppState["repayInvoice"];
  addRegulatoryIncident: AppState["addRegulatoryIncident"];
  updateIncidentStatus: AppState["updateIncidentStatus"];
  addScanResult: AppState["addScanResult"];
  resetToDefaults: AppState["resetToDefaults"];
};

let currentState: AppState;
const listeners = new Set<() => void>();

function persistState() {
  if (typeof window !== "undefined" && typeof window.localStorage !== "undefined") {
    try {
      const dataToSave = {
        currentRole: currentState.currentRole,
        session: currentState.session,
        organizations: currentState.organizations,
        products: currentState.products,
        batches: currentState.batches,
        supplyEvents: currentState.supplyEvents,
        orders: currentState.orders,
        fintech: currentState.fintech,
        incidents: currentState.incidents,
        cart: currentState.cart,
        recentScans: currentState.recentScans,
      };
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(dataToSave));
    } catch {
      // Ignore storage errors in restricted contexts
    }
  }
}

function notify() {
  listeners.forEach((fn) => fn());
  persistState();
}

function createActions(): AppStateActions {
  return {
    setRole: (role) => {
      let session = currentState.session;
      if (role === "manufacturer") {
        session = {
          name: "Dr. Babatunde Adeleke, FPSN",
          email: "adeleke@emzorpharma.com",
          role: "manufacturer",
          organizationId: "org-emzor",
          organizationName: "Emzor Pharmaceutical Industries Ltd",
          licenseNumber: "NAF-MAN-0104",
        };
      } else if (role === "pharmacy") {
        session = {
          name: "Pharm. Olumide Johnson",
          email: "superintendent@medplusnig.com",
          role: "pharmacy",
          organizationId: "org-medplus",
          organizationName: "Medplus Pharmacy (Lekki Flagship)",
          licenseNumber: "PCN-2018-8821",
        };
      } else if (role === "regulator") {
        session = {
          name: "Dr. Amina Danjuma",
          email: "amina.danjuma@nafdac.gov.ng",
          role: "regulator",
          organizationId: "org-nafdac",
          organizationName: "NAFDAC Post-Marketing & Pharmacovigilance Directorate",
          licenseNumber: "FGN-NAFDAC-PV-01",
        };
      } else {
        session = {
          name: "Engr. Nnamdi Eze",
          email: "admin@pharmtrace.gov.ng",
          role: "super_admin",
          organizationId: "org-nafdac",
          organizationName: "PharmTrace National Trust Mesh Administration",
          licenseNumber: "SYS-ADMIN-001",
        };
      }

      currentState = {
        ...currentState,
        currentRole: role,
        session,
      };
      notify();
    },

    setOrganization: (orgId) => {
      const org = currentState.organizations.find((o) => o.id === orgId);
      if (!org) return;

      currentState = {
        ...currentState,
        session: {
          ...currentState.session,
          organizationId: org.id,
          organizationName: org.name,
          licenseNumber: org.licenseNumber,
        },
      };
      notify();
    },

    addBatch: (batchData) => {
      const newBatch: Batch = {
        ...batchData,
        id: `batch-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        complianceScore: 100,
        createdAt: new Date().toISOString(),
      };

      // Also record initial commissioning supply event automatically!
      const commissioningEvent: SupplyEvent = {
        id: `evt-comm-${Date.now()}`,
        batchId: newBatch.id,
        batchNumber: newBatch.batchNumber,
        productName: newBatch.productName,
        eventType: "commissioning",
        location: `${currentState.session.organizationName} Serialization Line`,
        performedBy: currentState.session.name,
        occurredAt: new Date().toISOString(),
        notes: `GS1 unit-level serialization commissioned. GTIN ${newBatch.gtin} registered on NAFDAC mesh.`,
        organizationId: newBatch.organizationId,
        organizationName: currentState.session.organizationName,
        tamperSealIntact: true,
      };

      currentState = {
        ...currentState,
        batches: [newBatch, ...currentState.batches],
        supplyEvents: [commissioningEvent, ...currentState.supplyEvents],
      };
      notify();
      return newBatch;
    },

    updateBatchState: (batchId, state, reason) => {
      currentState = {
        ...currentState,
        batches: currentState.batches.map((b) =>
          b.id === batchId ? { ...b, state } : b,
        ),
      };

      // If recalled or quarantined, add a regulatory incident log if reason provided
      if ((state === "recalled" || state === "quarantined") && reason) {
        const batch = currentState.batches.find((b) => b.id === batchId);
        if (batch) {
          const inc: RegulatoryIncident = {
            id: `inc-${Date.now()}`,
            reportNumber: `NAF-ACTION-${Date.now().toString().slice(-4)}`,
            batchNumber: batch.batchNumber,
            productName: batch.productName,
            reportedBy: currentState.session.name,
            reporterOrg: currentState.session.organizationName,
            reportedAt: new Date().toISOString(),
            incidentType: state === "recalled" ? "suspect_counterfeit" : "48_hour_deviation",
            severity: "critical",
            description: reason,
            status: state,
            nafdacActionTaken: `Batch status changed to ${state.toUpperCase()} across all pharmacy nodes.`,
          };
          currentState = {
            ...currentState,
            incidents: [inc, ...currentState.incidents],
          };
        }
      }

      notify();
    },

    addSupplyEvent: (eventData) => {
      const newEvent: SupplyEvent = {
        ...eventData,
        id: `evt-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        occurredAt: new Date().toISOString(),
      };

      // Update current holder in the batch if shipping or receiving
      const batch = currentState.batches.find((b) => b.id === eventData.batchId);
      let updatedBatches = currentState.batches;
      if (batch) {
        let currentHolder = batch.currentHolder;
        if (eventData.eventType === "shipping" && eventData.actorOrganizationName) {
          currentHolder = `In Transit via ${eventData.actorOrganizationName}`;
        } else if (eventData.eventType === "receiving") {
          currentHolder = eventData.organizationName;
        }
        updatedBatches = currentState.batches.map((b) =>
          b.id === batch.id ? { ...b, currentHolder } : b,
        );
      }

      currentState = {
        ...currentState,
        batches: updatedBatches,
        supplyEvents: [newEvent, ...currentState.supplyEvents],
      };
      notify();
      return newEvent;
    },

    addToCart: (product, quantity = 1) => {
      const existing = currentState.cart.find((item) => item.product.id === product.id);
      let newCart: CartItem[];
      if (existing) {
        newCart = currentState.cart.map((item) =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + quantity }
            : item,
        );
      } else {
        newCart = [...currentState.cart, { product, quantity }];
      }

      currentState = {
        ...currentState,
        cart: newCart,
      };
      notify();
    },

    removeFromCart: (productId) => {
      currentState = {
        ...currentState,
        cart: currentState.cart.filter((item) => item.product.id !== productId),
      };
      notify();
    },

    updateCartQuantity: (productId, quantity) => {
      if (quantity <= 0) {
        currentState.removeFromCart(productId);
        return;
      }
      currentState = {
        ...currentState,
        cart: currentState.cart.map((item) =>
          item.product.id === productId ? { ...item, quantity } : item,
        ),
      };
      notify();
    },

    clearCart: () => {
      currentState = {
        ...currentState,
        cart: [],
      };
      notify();
    },

    placeOrder: (paymentMethod, deliveryAddress) => {
      if (currentState.cart.length === 0) return null;

      const totalAmount = currentState.cart.reduce(
        (sum, item) => sum + item.product.unitPrice * item.quantity,
        0,
      );

      const firstSupplier = currentState.cart[0]?.product;
      const supplierOrgId = firstSupplier?.organizationId || "org-emzor";
      const supplierName = firstSupplier?.manufacturerName || "Emzor Pharmaceutical Industries Ltd";

      const orderNumber = `PT-ORD-2026-${Date.now().toString().slice(-4)}`;
      const orderId = `ord-${Date.now()}`;

      const newOrder: Order = {
        id: orderId,
        orderNumber,
        buyerOrganizationId: currentState.session.organizationId,
        buyerName: currentState.session.organizationName,
        supplierOrganizationId: supplierOrgId,
        supplierName,
        items: currentState.cart.map((item) => ({
          productId: item.product.id,
          productName: item.product.name,
          manufacturerName: item.product.manufacturerName,
          quantity: item.quantity,
          unitPrice: item.product.unitPrice,
          totalPrice: item.product.unitPrice * item.quantity,
          gtin: item.product.gtin,
        })),
        totalAmount,
        status: "processing",
        paymentMethod,
        paymentStatus: paymentMethod.startsWith("bnpl") ? "financed" : "paid",
        createdAt: new Date().toISOString(),
        estimatedDelivery: new Date(Date.now() + 3 * 86400000).toISOString(),
        deliveryAddress: deliveryAddress || "Registered Pharmacy Address, Lagos",
      };

      // If BNPL payment, adjust Fintech credit ledger!
      let updatedFintech = currentState.fintech;
      if (paymentMethod.startsWith("bnpl")) {
        const days = paymentMethod === "bnpl_60" ? 60 : 30;
        const dueDate = new Date(Date.now() + days * 86400000).toISOString().slice(0, 10);
        const newInvoice = {
          id: `inv-${Date.now()}`,
          invoiceNo: `INV-${Date.now().toString().slice(-6)}`,
          orderId,
          supplierName,
          amount: totalAmount,
          issueDate: new Date().toISOString().slice(0, 10),
          dueDate,
          status: "active" as const,
        };

        updatedFintech = {
          ...currentState.fintech,
          drawnBalance: currentState.fintech.drawnBalance + totalAmount,
          availableBalance: Math.max(0, currentState.fintech.availableBalance - totalAmount),
          activeInvoices: [newInvoice, ...currentState.fintech.activeInvoices],
        };
      }

      currentState = {
        ...currentState,
        orders: [newOrder, ...currentState.orders],
        fintech: updatedFintech,
        cart: [],
      };
      notify();
      return newOrder;
    },

    repayInvoice: (invoiceId, amount) => {
      const invoice = currentState.fintech.activeInvoices.find((i) => i.id === invoiceId);
      if (!invoice) return;

      const repayAmount = amount || invoice.amount;
      const updatedInvoices = currentState.fintech.activeInvoices.map((inv) =>
        inv.id === invoiceId ? { ...inv, status: "paid" as const } : inv,
      );

      currentState = {
        ...currentState,
        fintech: {
          ...currentState.fintech,
          drawnBalance: Math.max(0, currentState.fintech.drawnBalance - repayAmount),
          availableBalance: Math.min(
            currentState.fintech.creditLimit,
            currentState.fintech.availableBalance + repayAmount,
          ),
          activeInvoices: updatedInvoices,
        },
      };
      notify();
    },

    addRegulatoryIncident: (incidentData) => {
      const newInc: RegulatoryIncident = {
        ...incidentData,
        id: `inc-${Date.now()}`,
        reportedAt: new Date().toISOString(),
      };
      currentState = {
        ...currentState,
        incidents: [newInc, ...currentState.incidents],
      };
      notify();
      return newInc;
    },

    updateIncidentStatus: (id, status, action) => {
      currentState = {
        ...currentState,
        incidents: currentState.incidents.map((inc) =>
          inc.id === id
            ? {
                ...inc,
                status,
                nafdacActionTaken: action || inc.nafdacActionTaken,
              }
            : inc,
        ),
      };
      notify();
    },

    addScanResult: (scan) => {
      currentState = {
        ...currentState,
        recentScans: [scan, ...currentState.recentScans.slice(0, 19)],
      };
      notify();
    },

    resetToDefaults: () => {
      if (typeof window !== "undefined" && typeof window.localStorage !== "undefined") {
        try {
          window.localStorage.removeItem(STORAGE_KEY);
        } catch {
          // ignore
        }
      }
      currentState = {
        ...getInitialState(),
        ...createActions(),
      };
      notify();
    },
  };
}

// Initialize singleton
const initialStateData = getInitialState();
const actions = createActions();
currentState = {
  ...initialStateData,
  ...actions,
};

/**
 * Custom React hook for state management (Zustand-compatible interface).
 * Supports selector pattern: `const batches = useStore(state => state.batches);`
 */
export function useStore(): AppState;
export function useStore<T>(selector: (state: AppState) => T): T;
export function useStore<T>(selector?: (state: AppState) => T): T | AppState {
  return useSyncExternalStore(
    (callback) => {
      listeners.add(callback);
      return () => listeners.delete(callback);
    },
    () => (selector ? selector(currentState) : currentState),
    () => (selector ? selector(currentState) : currentState),
  );
}

// Direct state getter for imperative calls
export const getStoreState = () => currentState;
