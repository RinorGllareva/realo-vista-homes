import React, { useEffect, useState } from "react";
import { FiHome } from "react-icons/fi";
import { GoSearch } from "react-icons/go";
import { BsShopWindow } from "react-icons/bs";
import { PiBuildingApartment, PiBuildingOffice, PiWarehouse } from "react-icons/pi";
import { TbBuildingSkyscraper, TbChartArea } from "react-icons/tb";
import { X } from "lucide-react";
import AreaFilter from "./AreaFilter";
import PriceFilter from "./PriceFilter";
import type { Filters } from "../pages/PropertyPage";

interface PropertyHeaderProps {
  filters: Filters;
  onChange: (patch: Partial<Filters> | null) => void;
}

const propertyTypes = [
  { type: "House", icon: <FiHome />, label: "Shtëpi" },
  { type: "Apartment", icon: <PiBuildingApartment />, label: "Banesë" },
  { type: "Office", icon: <PiBuildingOffice />, label: "Zyrë" },
  { type: "Store", icon: <BsShopWindow />, label: "Lokal" },
  { type: "Land", icon: <TbChartArea />, label: "Tokë" },
  { type: "Warehouse", icon: <PiWarehouse />, label: "Depo" },
  { type: "Building", icon: <TbBuildingSkyscraper />, label: "Objekt" },
];

const pill = (active: boolean) =>
  `shrink-0 rounded-full border px-4 py-2 text-sm font-semibold transition ${
    active
      ? "border-real-estate-primary bg-real-estate-primary text-real-estate-secondary"
      : "border-real-estate-primary/20 bg-white text-real-estate-primary hover:border-real-estate-secondary"
  }`;

const PropertyHeader: React.FC<PropertyHeaderProps> = ({ filters, onChange }) => {
  // Local text so typing stays smooth; the URL updates shortly after.
  const [search, setSearch] = useState(filters.search);
  useEffect(() => setSearch(filters.search), [filters.search]);
  useEffect(() => {
    if (search === filters.search) return;
    const t = window.setTimeout(() => onChange({ search }), 250);
    return () => window.clearTimeout(t);
  }, [search, filters.search, onChange]);

  const hasActive =
    Boolean(
      filters.search ||
        filters.propertyType ||
        filters.minPrice ||
        filters.maxPrice ||
        filters.minArea ||
        filters.maxArea ||
        filters.bedrooms
    ) || filters.isForSale !== null;

  return (
    <div className="z-40 border-b border-real-estate-primary/10 bg-white/95 shadow-sm backdrop-blur md:sticky md:top-20">
      <div className="mx-auto max-w-7xl px-4 py-3 md:px-5">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
          <label className="relative block flex-1">
            <span className="sr-only">Kërko prona</span>
            <GoSearch className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-real-estate-primary/50" />
            <input
              type="search"
              placeholder="Kërko sipas qytetit ose emrit të pronës"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-full border border-real-estate-primary/15 bg-[#fbfaf7] py-2.5 pl-11 pr-4 text-sm text-real-estate-primary outline-none transition placeholder:text-real-estate-primary/45 focus:border-real-estate-secondary focus:bg-white"
            />
          </label>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              aria-pressed={filters.isForSale === true}
              onClick={() => onChange({ isForSale: filters.isForSale === true ? null : true })}
              className={pill(filters.isForSale === true)}
            >
              Në shitje
            </button>
            <button
              type="button"
              aria-pressed={filters.isForSale === false}
              onClick={() => onChange({ isForSale: filters.isForSale === false ? null : false })}
              className={pill(filters.isForSale === false)}
            >
              Me qira
            </button>
            <AreaFilter
              className="shrink-0"
              value={{ min: filters.minArea, max: filters.maxArea }}
              applyAreaFilter={(min, max) =>
                onChange({ minArea: min === null ? "" : String(min), maxArea: max === null ? "" : String(max) })
              }
            />
            <PriceFilter
              className="shrink-0"
              value={{ min: filters.minPrice, max: filters.maxPrice }}
              applyPriceFilter={(min, max) =>
                onChange({ minPrice: min === null ? "" : String(min), maxPrice: max === null ? "" : String(max) })
              }
            />
            {hasActive && (
              <button
                type="button"
                onClick={() => onChange({ ...Object.fromEntries(Object.keys(filters).filter((k) => k !== "sort").map((k) => [k, ""])), isForSale: null })}
                className="inline-flex shrink-0 items-center gap-1 rounded-full px-3 py-2 text-sm font-semibold text-real-estate-primary/70 underline-offset-4 hover:text-real-estate-primary hover:underline"
              >
                <X className="h-4 w-4" /> Pastro
              </button>
            )}
          </div>
        </div>

        <div className="no-scrollbar -mx-4 mt-3 flex gap-2 overflow-x-auto px-4 md:mx-0 md:px-0">
          {propertyTypes.map(({ type, icon, label }) => {
            const selected = filters.propertyType.toLowerCase() === type.toLowerCase();
            return (
              <button
                key={type}
                type="button"
                aria-pressed={selected}
                onClick={() => onChange({ propertyType: selected ? "" : type })}
                className={`inline-flex shrink-0 items-center gap-2 rounded-lg border px-3 py-2 text-sm font-medium transition ${
                  selected
                    ? "border-real-estate-secondary bg-real-estate-secondary/15 text-real-estate-primary"
                    : "border-transparent text-real-estate-primary/75 hover:bg-real-estate-primary/5 hover:text-real-estate-primary"
                }`}
              >
                <span className="text-lg leading-none">{icon}</span>
                {label}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default PropertyHeader;
