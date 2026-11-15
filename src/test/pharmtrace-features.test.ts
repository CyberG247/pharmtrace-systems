import { describe, expect, it } from "vitest";
import {
  calculateGtin14CheckDigit,
  isValidGtin,
  buildGs1DataMatrixPayload,
  parseGs1DataMatrix,
  verifyProductScan,
  INITIAL_BATCHES,
  INITIAL_PRODUCTS,
  INITIAL_SUPPLY_EVENTS,
} from "@/lib/pharmtrace-data";
import { getStoreState } from "@/lib/store";

describe("PharmTrace GS1 DataMatrix Engine", () => {
  it("computes correct GS1 check digit for 13-digit prefix", () => {
    // 0501234567890 -> check digit 0
    expect(calculateGtin14CheckDigit("0501234567890")).toBe(0);
    // 0615141234567 -> check digit 9
    expect(calculateGtin14CheckDigit("0615141234567")).toBe(9);
    // 0750123456789 -> check digit 3
    expect(calculateGtin14CheckDigit("0750123456789")).toBe(3);
    // 0890123456789 -> check digit 0
    expect(calculateGtin14CheckDigit("0890123456789")).toBe(0);
  });

  it("validates authentic GTIN-14 strings", () => {
    expect(isValidGtin("05012345678900")).toBe(true);
    expect(isValidGtin("06151412345679")).toBe(true);
    expect(isValidGtin("07501234567893")).toBe(true);
    expect(isValidGtin("08901234567890")).toBe(true);
    expect(isValidGtin("05012345678901")).toBe(false);
    expect(isValidGtin("12345")).toBe(false);
  });

  it("parses GS1 bracket notation", () => {
    const raw = "(01)05012345678900(17)281231(10)LOT-2026-EMZ01(21)PT-EMZ-LON-9041";
    const parsed = parseGs1DataMatrix(raw);
    expect(parsed.gtin).toBe("05012345678900");
    expect(parsed.expiry).toBe("2028-12-31");
    expect(parsed.batch).toBe("LOT-2026-EMZ01");
    expect(parsed.serial).toBe("PT-EMZ-LON-9041");
  });

  it("parses raw GS1 DataMatrix string with group separator", () => {
    const raw = "01050123456789001728123110LOT-2026-EMZ01\u001d21PT-EMZ-LON-9041";
    const parsed = parseGs1DataMatrix(raw);
    expect(parsed.gtin).toBe("05012345678900");
    expect(parsed.expiry).toBe("2028-12-31");
    expect(parsed.batch).toBe("LOT-2026-EMZ01");
    expect(parsed.serial).toBe("PT-EMZ-LON-9041");
  });
});

describe("PharmTrace Central Ledger Verification", () => {
  it("verifies genuine Lonart DS pack with full provenance", () => {
    const result = verifyProductScan("PT-EMZ-LON-9041", INITIAL_BATCHES, INITIAL_PRODUCTS, INITIAL_SUPPLY_EVENTS);
    expect(result.isAuthentic).toBe(true);
    expect(result.status).toBe("authentic");
    expect(result.product?.name).toContain("Lonart DS");
    expect(result.custodyChain?.length).toBeGreaterThan(0);
  });

  it("detects and flags suspect counterfeit serials with crimson alert", () => {
    const result = verifyProductScan("PHARMTRACE-FAKE-9921", INITIAL_BATCHES, INITIAL_PRODUCTS, INITIAL_SUPPLY_EVENTS);
    expect(result.isAuthentic).toBe(false);
    expect(result.status).toBe("counterfeit");
    expect(result.headline).toContain("CRITICAL ALERT");
  });

  it("detects and flags officially recalled batch", () => {
    const result = verifyProductScan("PT-RECALL-AUG-0012", INITIAL_BATCHES, INITIAL_PRODUCTS, INITIAL_SUPPLY_EVENTS);
    expect(result.isAuthentic).toBe(false);
    expect(result.status).toBe("recalled");
    expect(result.headline).toContain("RECALL");
  });

  it("detects expired pharmaceutical stock", () => {
    const result = verifyProductScan("PT-SWP-EXP-9901", INITIAL_BATCHES, INITIAL_PRODUCTS, INITIAL_SUPPLY_EVENTS);
    expect(result.isAuthentic).toBe(false);
    expect(result.status).toBe("expired");
    expect(result.headline).toContain("EXPIRED");
  });
});

describe("PharmTrace Reactive Store & Working Capital Ledger", () => {
  it("tracks cart additions and BNPL financing", () => {
    const store = getStoreState();
    store.clearCart();
    const initialAvailable = store.fintech.availableBalance;

    const sampleProd = store.products[0]!;
    store.addToCart(sampleProd, 10);

    const updatedStore = getStoreState();
    expect(updatedStore.cart.length).toBe(1);
    expect(updatedStore.cart[0]?.quantity).toBe(10);

    const order = updatedStore.placeOrder("bnpl_30", "Test Pharmacy Lekki");
    expect(order).not.toBeNull();
    expect(order?.paymentStatus).toBe("financed");

    const storeAfterOrder = getStoreState();
    // Check available balance was drawn down
    expect(storeAfterOrder.fintech.availableBalance).toBeLessThan(initialAvailable);

    // Repay the new invoice
    const newInvoice = storeAfterOrder.fintech.activeInvoices[0]!;
    storeAfterOrder.repayInvoice(newInvoice.id);
    const storeAfterRepay = getStoreState();
    expect(storeAfterRepay.fintech.availableBalance).toBe(initialAvailable);
  });

  it("updates active role and switches session persona correctly", () => {
    const store = getStoreState();
    store.setRole("pharmacy");
    expect(getStoreState().currentRole).toBe("pharmacy");
    expect(getStoreState().session.role).toBe("pharmacy");
    expect(getStoreState().session.organizationName).toContain("Medplus");

    store.setRole("regulator");
    expect(getStoreState().currentRole).toBe("regulator");
    expect(getStoreState().session.role).toBe("regulator");
    expect(getStoreState().session.organizationName).toContain("NAFDAC");

    store.setRole("manufacturer");
    expect(getStoreState().currentRole).toBe("manufacturer");
  });

  it("creates a new batch and logs an EPCIS supply event", () => {
    const store = getStoreState();
    const initialBatchesCount = store.batches.length;
    const initialEventsCount = store.supplyEvents.length;

    const newBatch = store.addBatch({
      organizationId: store.session.organizationId,
      productId: store.products[0]!.id,
      productName: store.products[0]!.name,
      gtin: store.products[0]!.gtin,
      batchNumber: "LOT-TEST-2026-X1",
      serialNumber: "PT-TEST-SN-001",
      manufacturingDate: "2026-03-01",
      expiryDate: "2029-03-01",
      state: "active",
      unitsCommissioned: 5000,
      unitsRemaining: 5000,
      currentHolder: "Emzor Packaging Hall",
      coldChainTemperature: "20-25°C",
      nafdacNotified: true,
    });

    expect(getStoreState().batches.length).toBe(initialBatchesCount + 1);
    expect(newBatch.batchNumber).toBe("LOT-TEST-2026-X1");

    store.addSupplyEvent({
      batchId: newBatch.id,
      batchNumber: newBatch.batchNumber,
      productName: newBatch.productName,
      eventType: "shipping",
      location: "Lagos Distribution Hub",
      performedBy: store.session.name,
      notes: "Dispatched to regional pharmacy warehouse",
      organizationId: store.session.organizationId,
      organizationName: store.session.organizationName,
      temperatureCelsius: 22.5,
      tamperSealIntact: true,
    });

    // addBatch automatically logs a commissioning event (+1), and addSupplyEvent adds a shipping event (+1)
    expect(getStoreState().supplyEvents.length).toBe(initialEventsCount + 2);

    // Verify regulatory enforcement state update
    store.updateBatchState(newBatch.id, "recalled", "Sub-potent assay warning");
    const updated = getStoreState().batches.find((b) => b.id === newBatch.id);
    expect(updated?.state).toBe("recalled");
  });
});
