import axios from "axios";
import { useQuery } from "@tanstack/react-query";
import { apiUrl, normalizeMediaUrl } from "@/lib/api";

export interface PropertySummary {
  propertyId: string | number;
  title: string;
  city: string;
  price: number | string;
  propertyType: string;
  isForSale: boolean;
  isForRent?: boolean;
  bedrooms?: number;
  bathrooms?: number;
  floorLevel?: number | string;
  squareFeet?: number;
  spaces?: number;
  latitude?: number;
  longitude?: number;
  virtualTourUrl?: string;
  hasPublishedVirtualTour?: boolean;
  floorPlanUrl?: string;
  images?: Array<{ imageUrl: string }> | { imageUrl: string } | string | null;
}

export const PLACEHOLDER_IMAGE =
  "https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=900&auto=format&fit=crop";

export const PROPERTY_TYPES = [
  { value: "House", label: "Shtëpi" },
  { value: "Apartment", label: "Banesë" },
  { value: "Office", label: "Zyrë" },
  { value: "Store", label: "Lokal" },
  { value: "Land", label: "Tokë" },
  { value: "Warehouse", label: "Depo" },
  { value: "Building", label: "Objekt" },
];

export const propertyTypeLabel = (type = "") =>
  PROPERTY_TYPES.find((t) => t.value.toLowerCase() === type.toLowerCase())?.label ||
  type ||
  "Pronë";

export const propertyPath = (property: Pick<PropertySummary, "title" | "propertyId">) =>
  `/properties/${encodeURIComponent(property.title || "prona")}/${property.propertyId}`;

export const firstImage = (images: PropertySummary["images"]) => {
  let url = "";
  if (Array.isArray(images)) url = images[0]?.imageUrl ?? "";
  else if (typeof images === "string") url = images.split(",")[0]?.trim() ?? "";
  else if (images && typeof images === "object") url = images.imageUrl;
  return normalizeMediaUrl(url) || PLACEHOLDER_IMAGE;
};

const toArray = (raw: unknown): PropertySummary[] => {
  if (Array.isArray(raw)) return raw;
  if (!raw || typeof raw !== "object") return [];
  const r = raw as Record<string, unknown>;
  for (const key of ["$values", "data", "result", "items"]) {
    if (Array.isArray(r[key])) return r[key] as PropertySummary[];
  }
  return [];
};

// One shared, cached request for the full list. Home, listings, map, favorites and the
// detail page all read from it, so going back to a list renders instantly from cache.
export const useProperties = () =>
  useQuery({
    queryKey: ["properties"],
    queryFn: async ({ signal }) => {
      const res = await axios.get(apiUrl("api/Property/GetProperties"), {
        headers: { Accept: "application/json" },
        signal,
      });
      return toArray(res.data);
    },
    staleTime: 5 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
  });
