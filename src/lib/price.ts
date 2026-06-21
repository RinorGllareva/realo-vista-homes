const euroFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "EUR",
  maximumFractionDigits: 0,
});

const numberFormatter = new Intl.NumberFormat("en-US", {
  maximumFractionDigits: 0,
});

const parseNumberText = (value: string) => {
  const normalized = value.trim();
  if (!normalized) return NaN;
  const cleaned = (() => {
    if (normalized.includes(",") && normalized.includes(".")) {
      return normalized.replace(/,/g, "");
    }
    if (/^\d{1,3}(,\d{3})+$/.test(normalized)) {
      return normalized.replace(/,/g, "");
    }
    if (/^\d{1,3}(\.\d{3})+$/.test(normalized)) {
      return normalized.replace(/\./g, "");
    }
    return normalized.replace(/,/g, ".");
  })();
  return Number(cleaned);
};

export const parsePriceNumber = (value: unknown): number => {
  if (typeof value === "number") return Number.isFinite(value) ? value : NaN;
  if (typeof value !== "string") return NaN;

  const match = value.match(/\d[\d.,]*/);
  return match ? parseNumberText(match[0]) : NaN;
};

export const formatPublicPrice = (value: number | string | null | undefined) => {
  if (typeof value === "number") {
    return Number.isFinite(value) ? euroFormatter.format(value) : "Çmimi me kërkesë";
  }

  const raw = String(value ?? "").trim();
  if (!raw) return "Çmimi me kërkesë";

  const perSquareMeter = raw.match(/^€?\s*(\d[\d.,]*)\s*\/\s*(m2|m²|sqm|sq m)$/i);
  if (perSquareMeter) {
    const amount = parseNumberText(perSquareMeter[1]);
    return Number.isFinite(amount) ? `€${numberFormatter.format(amount)}/m²` : raw.replace(/m2/gi, "m²");
  }

  const plainNumber = raw.match(/^€?\s*\d[\d.,]*$/);
  if (plainNumber) {
    const amount = parseNumberText(raw.replace("€", ""));
    return Number.isFinite(amount) ? euroFormatter.format(amount) : raw;
  }

  return raw.replace(/m2/gi, "m²");
};
