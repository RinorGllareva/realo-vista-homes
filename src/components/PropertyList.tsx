import React, { useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useNavigationType } from "react-router-dom";
import PropertyCard from "./PropertyCard";
import { parsePriceNumber } from "@/lib/price";
import { useProperties } from "@/lib/properties";
import type { Filters } from "../pages/PropertyPage";

interface PropertyListProps {
  filters: Filters;
  onChange: (patch: Partial<Filters> | null) => void;
}

const PAGE_SIZE = 24;
const lower = (s?: string) => (s ?? "").toString().toLowerCase();

const SORTS = [
  { value: "", label: "Të rekomanduara" },
  { value: "newest", label: "Më të rejat" },
  { value: "price-asc", label: "Çmimi: nga më i ulëti" },
  { value: "price-desc", label: "Çmimi: nga më i larti" },
  { value: "area-desc", label: "Sipërfaqja më e madhe" },
];

const priceOrInfinity = (value: unknown, fallback: number) => {
  const n = parsePriceNumber(value);
  return Number.isFinite(n) ? n : fallback;
};

const PropertyList: React.FC<PropertyListProps> = ({ filters, onChange }) => {
  const { data: properties = [], isLoading, isError, refetch } = useProperties();
  const location = useLocation();
  const navigationType = useNavigationType();
  const countKey = `realo:list-count:${location.search}`;

  // How many cards are shown survives Back, so the card you opened is still on the page.
  const [visible, setVisible] = useState(() => {
    if (navigationType !== "POP") return PAGE_SIZE;
    try {
      return Math.max(PAGE_SIZE, Number(sessionStorage.getItem(countKey)) || 0);
    } catch {
      return PAGE_SIZE;
    }
  });

  const filterSignature = JSON.stringify({ ...filters });
  const firstSignature = useRef(filterSignature);
  useEffect(() => {
    if (filterSignature !== firstSignature.current) setVisible(PAGE_SIZE);
  }, [filterSignature]);

  useEffect(() => {
    try {
      sessionStorage.setItem(countKey, String(visible));
    } catch {
      /* storage unavailable */
    }
  }, [countKey, visible]);

  const filtered = useMemo(() => {
    let result = [...properties];

    if (filters.search) {
      const q = lower(filters.search);
      result = result.filter((p) => lower(p.title).includes(q) || lower(p.city).includes(q));
    }
    if (filters.propertyType) {
      const t = lower(filters.propertyType);
      result = result.filter((p) => lower(p.propertyType) === t);
    }
    const min = Number(filters.minPrice);
    if (filters.minPrice && !Number.isNaN(min)) {
      result = result.filter((p) => parsePriceNumber(p.price) >= min);
    }
    const max = Number(filters.maxPrice);
    if (filters.maxPrice && !Number.isNaN(max)) {
      result = result.filter((p) => parsePriceNumber(p.price) <= max);
    }
    if (filters.bedrooms) {
      const b = parseInt(filters.bedrooms, 10);
      const orMore = filters.bedrooms.endsWith("+");
      if (!Number.isNaN(b)) {
        result = result.filter((p) => (orMore ? (p.bedrooms ?? -1) >= b : (p.bedrooms ?? -1) === b));
      }
    }
    const minA = parseInt(filters.minArea, 10);
    if (!Number.isNaN(minA)) result = result.filter((p) => (p.squareFeet ?? 0) >= minA);
    const maxA = parseInt(filters.maxArea, 10);
    if (!Number.isNaN(maxA)) result = result.filter((p) => (p.squareFeet ?? 0) <= maxA);
    if (filters.isForSale !== null) {
      result = result.filter((p) => p.isForSale === filters.isForSale);
    }

    switch (filters.sort) {
      case "newest":
        result.sort((a, b) => Number(b.propertyId) - Number(a.propertyId));
        break;
      case "price-asc":
        result.sort((a, b) => priceOrInfinity(a.price, Infinity) - priceOrInfinity(b.price, Infinity));
        break;
      case "price-desc":
        result.sort((a, b) => priceOrInfinity(b.price, -Infinity) - priceOrInfinity(a.price, -Infinity));
        break;
      case "area-desc":
        result.sort((a, b) => (b.squareFeet ?? 0) - (a.squareFeet ?? 0));
        break;
    }
    return result;
  }, [properties, filters]);

  const shown = filtered.slice(0, visible);

  return (
    <main className="px-4 py-8 md:px-5 md:py-10">
      <div className="mx-auto max-w-7xl">
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="font-title text-3xl text-real-estate-primary">Prona të disponueshme</h2>
            <p className="mt-1 text-sm text-real-estate-primary/60" aria-live="polite">
              {isLoading ? "Duke ngarkuar pronat…" : `${filtered.length} prona`}
            </p>
          </div>
          <label className="flex items-center gap-2 text-sm text-real-estate-primary/70">
            Rendit:
            <select
              value={filters.sort}
              onChange={(e) => onChange({ sort: e.target.value })}
              className="rounded-full border border-real-estate-primary/15 bg-white px-4 py-2 text-sm font-medium text-real-estate-primary outline-none focus:border-real-estate-secondary"
            >
              {SORTS.map((s) => (
                <option key={s.value} value={s.value}>
                  {s.label}
                </option>
              ))}
            </select>
          </label>
        </div>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 lg:gap-6 2xl:grid-cols-4">
          {isLoading &&
            Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="overflow-hidden rounded-xl border border-real-estate-primary/10 bg-white">
                <div className="aspect-[4/3] animate-pulse bg-[#efe8d7]" />
                <div className="space-y-3 p-5">
                  <div className="h-3 w-1/3 animate-pulse rounded bg-[#efe8d7]" />
                  <div className="h-5 w-4/5 animate-pulse rounded bg-[#efe8d7]" />
                  <div className="h-6 w-1/3 animate-pulse rounded bg-[#efe8d7]" />
                </div>
              </div>
            ))}

          {!isLoading &&
            shown.map((property, index) => (
              <PropertyCard key={property.propertyId} property={property} eager={index < 3} />
            ))}

          {!isLoading && isError && (
            <div className="col-span-full rounded-xl border border-real-estate-primary/10 bg-white py-16 text-center">
              <p className="text-lg text-real-estate-primary">Pronat nuk u ngarkuan.</p>
              <button
                onClick={() => refetch()}
                className="mt-4 rounded-full bg-real-estate-primary px-5 py-2.5 text-sm font-semibold text-real-estate-secondary"
              >
                Provo përsëri
              </button>
            </div>
          )}

          {!isLoading && !isError && filtered.length === 0 && (
            <div className="col-span-full rounded-xl border border-dashed border-real-estate-primary/20 bg-white py-16 text-center">
              <p className="text-lg text-real-estate-primary">Nuk u gjet asnjë pronë për filtrat e zgjedhur.</p>
              <button
                onClick={() => onChange(null)}
                className="mt-4 rounded-full bg-real-estate-primary px-5 py-2.5 text-sm font-semibold text-real-estate-secondary"
              >
                Pastro filtrat
              </button>
            </div>
          )}
        </div>

        {filtered.length > visible && (
          <div className="mt-10 flex flex-col items-center gap-3">
            <p className="text-sm text-real-estate-primary/60">
              Po shfaqen {shown.length} nga {filtered.length}
            </p>
            <button
              onClick={() => setVisible((v) => v + PAGE_SIZE)}
              className="rounded-full bg-real-estate-primary px-7 py-3 font-text text-sm font-semibold uppercase tracking-[0.16em] text-real-estate-secondary transition hover:bg-real-estate-primary/90"
            >
              Shfaq më shumë
            </button>
          </div>
        )}
      </div>
    </main>
  );
};

export default PropertyList;
