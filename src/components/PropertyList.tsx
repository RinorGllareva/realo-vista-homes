import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { ImSortAlphaAsc, ImSortAlphaDesc } from "react-icons/im";
import { MdSortByAlpha } from "react-icons/md";
import PropertyCard from "./PropertyCard";

interface Property {
  propertyId: string | number;
  title: string;
  city: string;
  price: number | string;
  propertyType: string;
  isForSale: boolean;
  bedrooms?: number;
  bathrooms?: number;
  floorLevel?: number | string;
  squareFeet?: number;
  spaces?: number;
  images?: Array<{ imageUrl: string }> | { imageUrl: string } | string | null;
}

interface PropertyListProps {
  filters: {
    propertyType: string;
    minPrice: string;
    maxPrice: string;
    bedrooms: string;
    bathrooms?: string;
    minArea: string;
    maxArea: string;
    isForSale: boolean | null;
    search: string;
  };
}

/* ---------------- helpers ---------------- */
const API_BASE = (import.meta.env.VITE_API_URL ?? "").replace(/\/+$/, "");

function normalizeToArray(raw: unknown): Property[] {
  if (Array.isArray(raw)) return raw as Property[];
  if (!raw || typeof raw !== "object") return [];
  const r = raw as any;
  if (Array.isArray(r.$values)) return r.$values as Property[]; // .NET
  if (Array.isArray(r.data)) return r.data as Property[];
  if (Array.isArray(r.result)) return r.result as Property[];
  if (Array.isArray(r.items)) return r.items as Property[];
  return [];
}

const toNumber = (v: unknown): number => {
  if (typeof v === "number") return v;
  if (typeof v === "string") return Number(v.replace(/[^\d.]/g, ""));
  return NaN;
};

const lower = (s?: string) => (s ?? "").toString().toLowerCase();
/* ----------------------------------------- */

const PropertyList: React.FC<PropertyListProps> = ({ filters }) => {
  const navigate = useNavigate();
  const [properties, setProperties] = useState<Property[]>([]);
  const [sortOrder, setSortOrder] = useState<0 | 1 | 2>(0); // 0: none, 1: asc, 2: desc

  // Fetch all properties
  useEffect(() => {
    const ac = new AbortController();

    (async () => {
      try {
        const url = API_BASE
          ? `${API_BASE}/api/Property/GetProperties`
          : `/api/Property/GetProperties`;
        const { data } = await axios.get(url, {
          headers: { Accept: "application/json" },
          signal: ac.signal,
        });
        setProperties(normalizeToArray(data));
      } catch (e: any) {
        // ignore cancellations; log others and keep UI safe
        if (e?.name !== "CanceledError" && e?.code !== "ERR_CANCELED") {
          console.error("Error fetching properties:", e);
          setProperties([]);
        }
      }
    })();

    return () => ac.abort();
  }, []);

  // Derived: filtered + sorted
  const filteredProperties = useMemo(() => {
    let result = [...properties];

    // search (title/city)
    if (filters.search) {
      const q = lower(filters.search);
      result = result.filter(
        (p) => lower(p.title).includes(q) || lower(p.city).includes(q)
      );
    }

    // property type (case-insensitive)
    if (filters.propertyType) {
      const t = lower(filters.propertyType);
      result = result.filter((p) => lower(p.propertyType) === t);
    }

    // price range
    if (filters.minPrice) {
      const min = Number(filters.minPrice);
      if (!Number.isNaN(min)) {
        result = result.filter((p) => toNumber(p.price) >= min);
      }
    }
    if (filters.maxPrice) {
      const max = Number(filters.maxPrice);
      if (!Number.isNaN(max)) {
        result = result.filter((p) => toNumber(p.price) <= max);
      }
    }

    // bedrooms/bathrooms exact match
    if (filters.bedrooms) {
      const b = parseInt(filters.bedrooms, 10);
      if (!Number.isNaN(b)) {
        result = result.filter((p) => (p.bedrooms ?? -1) === b);
      }
    }
    if (filters.bathrooms) {
      const b = parseInt(filters.bathrooms, 10);
      if (!Number.isNaN(b)) {
        result = result.filter((p) => (p.bathrooms ?? -1) === b);
      }
    }

    // area range
    if (filters.minArea) {
      const minA = parseInt(filters.minArea, 10);
      if (!Number.isNaN(minA)) {
        result = result.filter((p) => (p.squareFeet ?? 0) >= minA);
      }
    }
    if (filters.maxArea) {
      const maxA = parseInt(filters.maxArea, 10);
      if (!Number.isNaN(maxA)) {
        result = result.filter((p) => (p.squareFeet ?? 0) <= maxA);
      }
    }

    // sale/rent
    if (filters.isForSale !== null) {
      result = result.filter((p) => p.isForSale === filters.isForSale);
    }

    // sorting by propertyId (lexicographically)
    if (sortOrder === 1) {
      result.sort((a, b) =>
        String(a.propertyId).localeCompare(String(b.propertyId))
      );
    } else if (sortOrder === 2) {
      result.sort((a, b) =>
        String(b.propertyId).localeCompare(String(a.propertyId))
      );
    }

    return result;
  }, [properties, filters, sortOrder]);

  const handleSort = () =>
    setSortOrder((prev) => (prev === 2 ? 0 : ((prev + 1) as 0 | 1 | 2)));

  const handlePropertyClick = (property: Property) =>
    navigate(
      `/properties/${encodeURIComponent(property.title)}/${property.propertyId}`
    );

  return (
    <div className="pt-40 px-5 pb-10 bg-background min-h-screen">
      {/* Sort Button */}
      <div className="flex justify-start mb-6">
        <button
          onClick={handleSort}
          className="flex items-center gap-2 px-4 py-2 bg-background border border-border rounded-lg hover:bg-accent transition-colors"
        >
          <span className="font-title">Sort</span>
          {sortOrder === 1 ? (
            <ImSortAlphaAsc />
          ) : sortOrder === 2 ? (
            <ImSortAlphaDesc />
          ) : (
            <MdSortByAlpha />
          )}
        </button>
      </div>

      {/* Property Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-7xl mx-auto">
        {filteredProperties.length > 0 ? (
          filteredProperties.map((property) => (
            <PropertyCard
              key={property.propertyId}
              property={property as any}
              onClick={() => handlePropertyClick(property)}
            />
          ))
        ) : (
          <div className="col-span-full text-center py-20">
            <p className="text-muted-foreground text-lg">
              No properties found for the selected filters.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default PropertyList;
