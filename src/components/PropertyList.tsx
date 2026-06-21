import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { ImSortAlphaAsc, ImSortAlphaDesc } from "react-icons/im";
import { MdSortByAlpha } from "react-icons/md";
import PropertyCard from "./PropertyCard";
import { apiUrl } from "@/lib/api";
import { parsePriceNumber } from "@/lib/price";

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
  virtualTourUrl?: string;
  floorPlanUrl?: string;
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

const lower = (s?: string) => (s ?? "").toString().toLowerCase();
/* ----------------------------------------- */

const PropertyList: React.FC<PropertyListProps> = ({ filters }) => {
  const navigate = useNavigate();
  const [properties, setProperties] = useState<Property[]>([]);
  const [sortOrder, setSortOrder] = useState<0 | 1 | 2>(0); // 0: none, 1: asc, 2: desc

  // Fetch all properties (API call centralized via apiUrl)
  useEffect(() => {
    const ac = new AbortController();

    (async () => {
      try {
        const url = apiUrl("/api/Property/GetProperties");
        const res = await axios.get(url, {
          headers: { Accept: "application/json" },
          signal: ac.signal,
        });
        setProperties(normalizeToArray(res.data));
      } catch (error: any) {
        if (error?.name === "CanceledError" || error?.code === "ERR_CANCELED")
          return;
        console.error("Error fetching properties:", error);
        setProperties([]); // keep UI safe
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
        result = result.filter((p) => parsePriceNumber(p.price) >= min);
      }
    }
    if (filters.maxPrice) {
      const max = Number(filters.maxPrice);
      if (!Number.isNaN(max)) {
        result = result.filter((p) => parsePriceNumber(p.price) <= max);
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
    <main className="bg-real-estate-primary">
      <section className="relative -mt-[7.75rem] overflow-hidden bg-real-estate-primary px-5 pb-14 pt-[11.75rem] text-white sm:-mt-28 sm:pt-44 md:pb-20">
        <div className="absolute inset-0 opacity-35">
          <img
            src="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1800&auto=format&fit=crop"
            alt=""
            className="h-full w-full object-cover"
          />
        </div>
        <div className="absolute inset-0 bg-gradient-to-r from-real-estate-primary via-real-estate-primary/85 to-real-estate-primary/35" />
        <div className="relative mx-auto max-w-7xl">
          <p className="font-text text-xs uppercase tracking-[0.28em] text-real-estate-secondary sm:text-sm">
            Prona të veçanta
          </p>
          <h1 className="mt-3 max-w-3xl font-title text-[clamp(2.1rem,9vw,3.75rem)] leading-[1.08] md:text-6xl">
            Gjej pronën që i përshtatet mënyrës si jeton.
          </h1>
          <p className="mt-4 max-w-2xl text-sm leading-6 text-white/80 sm:text-base">
            Shfleto shtëpi, banesa, hapësira komerciale dhe toka me media më të
            qarta, filtra më të pastër dhe ture 360° kur janë të disponueshme.
          </p>
        </div>
      </section>

      <section className="bg-[#fbfaf7] px-5 py-10">
        <div className="mx-auto mb-6 flex max-w-7xl flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="font-title text-3xl text-real-estate-primary">
              Prona të disponueshme
            </h2>
          </div>
          <button
            onClick={handleSort}
            className="inline-flex w-fit items-center gap-2 rounded-md border border-real-estate-primary/15 bg-white px-4 py-2 text-sm font-medium text-real-estate-primary transition hover:border-real-estate-secondary"
          >
            <span>Rendit</span>
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
      <div className="grid grid-cols-1 gap-y-6 gap-x-[34px] max-w-7xl mx-auto sm:grid-cols-2 lg:grid-cols-3">
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
              Nuk u gjet asnjë pronë për filtrat e zgjedhur.
            </p>
          </div>
        )}
      </div>
      </section>
    </main>
  );
};

export default PropertyList;
