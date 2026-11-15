export type SupplyEventType = "commissioning" | "packing" | "shipping" | "receiving";

export const eventLabels: Record<SupplyEventType, string> = {
  commissioning: "Commissioned",
  packing: "Packed",
  shipping: "Shipped",
  receiving: "Received",
};

export function isValidGtin(gtin: string): boolean {
  if (!/^\d{14}$/.test(gtin)) return false;
  const digits = gtin.split("").map(Number);
  const expected = digits.slice(0, 13).reverse().reduce(
    (sum, digit, index) => sum + digit * (index % 2 === 0 ? 3 : 1),
    0,
  );
  return (10 - (expected % 10)) % 10 === digits[13];
}

export function buildGs1DataMatrixPayload(input: {
  gtin: string;
  batch: string;
  expiry: string;
  serial: string;
}): string {
  if (!isValidGtin(input.gtin)) throw new Error("Enter a valid 14-digit GTIN.");
  if (!/^\d{4}-\d{2}-\d{2}$/.test(input.expiry)) throw new Error("Enter an expiry date.");
  const date = new Date(`${input.expiry}T00:00:00.000Z`);
  if (Number.isNaN(date.valueOf()) || date.toISOString().slice(0, 10) !== input.expiry) {
    throw new Error("Enter a real expiry date.");
  }
  if (!/^[\x21-\x7E]{1,20}$/.test(input.batch) || !/^[\x21-\x7E]{1,20}$/.test(input.serial)) {
    throw new Error("Batch and serial values must contain 1–20 printable characters.");
  }
  const yyMMdd = input.expiry.slice(2).replaceAll("-", "");
  return `01${input.gtin}17${yyMMdd}10${input.batch}\u001d21${input.serial}`;
}

export function formatNaira(amount: number): string {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    maximumFractionDigits: 0,
  }).format(amount);
}

export function createDemoStyleSerial(): string {
  return `PHARMTRACE${crypto.randomUUID().replaceAll("-", "").slice(0, 12).toUpperCase()}`;
}