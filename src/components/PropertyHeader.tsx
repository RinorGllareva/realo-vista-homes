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
  `min-w-0 rounded-full border px-2 py-2 text-xs font-semibold transition sm:text-sm md:px-5 md:py-2.5 ${
    active
      ? "border-real-estate-secondary bg-real-estate-secondary text-real-estate-primary"
      : "border-white/45 bg-transparent text-white hover:border-real-estate-secondary"
  }`;

/** The original listing filters: search, then a gold-edged glass bar with type icons,
 * sale/rent and area/price. Sits on the dark hero of the listings page. */
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
    <div className="mt-8 md:mt-10">
      <label className="relative block w-full md:max-w-md">
        <span className="sr-only">Kërko prona</span>
        <input
          type="search"
          placeholder="Kërko sipas qytetit ose emrit të pronës"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full rounded-md border border-real-estate-primary/15 bg-white py-2.5 pl-4 pr-11 text-sm text-real-estate-primary outline-none transition placeholder:text-real-estate-primary/50 focus:border-real-estate-secondary"
        />
        <GoSearch className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-real-estate-primary/55" />
      </label>

      <div className="relative mt-3 rounded-xl border border-real-estate-secondary/45 px-2 py-2 shadow-sm md:px-4 lg:grid lg:grid-cols-[auto_1fr_auto] lg:items-center lg:gap-4">
        {/* Blur on its own layer: a blurred parent would trap the filters' fixed popovers on phones. */}
        <div className="pointer-events-none absolute inset-0 rounded-xl bg-white/[0.04] backdrop-blur-xl" />

        <div className="relative order-1 grid grid-cols-7 gap-1 md:flex md:items-center md:justify-center md:gap-3 lg:order-2 lg:min-w-0 lg:gap-2 xl:gap-4">
          {propertyTypes.map(({ type, icon, label }) => {
            const selected = filters.propertyType.toLowerCase() === type.toLowerCase();
            return (
              <button
                key={type}
                type="button"
                aria-pressed={selected}
                onClick={() => onChange({ propertyType: selected ? "" : type })}
                className={`flex min-w-0 flex-col items-center justify-center gap-1 rounded-md px-1 py-1.5 text-[10px] font-semibold transition sm:text-xs md:min-w-[64px] md:px-2 md:text-sm ${
                  selected
                    ? "bg-real-estate-secondary text-real-estate-primary"
                    : "text-white drop-shadow hover:text-real-estate-secondary"
                }`}
              >
                <span className="text-[18px] leading-none sm:text-xl md:text-2xl">{icon}</span>
                <span className="max-w-full truncate">{label}</span>
              </button>
            );
          })}
        </div>

        <div className="relative order-2 mt-2 grid grid-cols-4 gap-2 md:flex md:items-center md:justify-center md:gap-3 lg:contents">
          <div className="contents md:flex md:gap-3 lg:relative lg:order-1 lg:flex lg:justify-start">
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
          </div>
          <div className="contents md:flex md:gap-2 lg:relative lg:order-3 lg:flex lg:justify-end">
            <AreaFilter
              className="min-w-0"
              scrolled
              value={{ min: filters.minArea, max: filters.maxArea }}
              applyAreaFilter={(min, max) =>
                onChange({ minArea: min === null ? "" : String(min), maxArea: max === null ? "" : String(max) })
              }
            />
            <PriceFilter
              className="min-w-0"
              scrolled
              value={{ min: filters.minPrice, max: filters.maxPrice }}
              applyPriceFilter={(min, max) =>
                onChange({ minPrice: min === null ? "" : String(min), maxPrice: max === null ? "" : String(max) })
              }
            />
          </div>
        </div>
      </div>

      {hasActive && (
        <div className="mt-2 flex justify-end">
          <button
            type="button"
            onClick={() => onChange({ ...Object.fromEntries(Object.keys(filters).filter((k) => k !== "sort").map((k) => [k, ""])), isForSale: null })}
            className="inline-flex items-center gap-1 rounded-full px-2 py-1 text-sm font-semibold text-white/75 underline-offset-4 transition hover:text-real-estate-secondary hover:underline"
          >
            <X className="h-4 w-4" /> Pastro filtrat
          </button>
        </div>
      )}
    </div>
  );
};

export default PropertyHeader;
