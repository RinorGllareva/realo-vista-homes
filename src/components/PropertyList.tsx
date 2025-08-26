import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { ImSortAlphaAsc, ImSortAlphaDesc } from "react-icons/im";
import { MdSortByAlpha } from "react-icons/md";
import PropertyCard from "./PropertyCard";

// ✅ Rename to avoid clashing with other "Property" types and make id a string
interface RealoProperty {
  propertyId: string; // <-- canonical: string
  title: string;
  city: string;
  price: number | string; // tolerate string
  propertyType: string;
  isForSale: boolean;
  bedrooms?: number;
  bathrooms?: number;
  floorLevel?: number | string;
  squareFeet?: number;
  spaces?: number;
  images?: Array<{ imageUrl: string }>;
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
const API = (() => {
  let v = (import.meta as any)?.env?.VITE_API_URL as string | undefined;
  if (!v || v === "undefined" || v === "null") {
    v = (import.meta as any)?.env?.PROD
      ? "https://api.realo-realestate.com"
      : "";
  }
  return v.replace(/\/+$/, "");
})();

const toArray = <T,>(raw: any): T[] => {
  if (Array.isArray(raw)) return raw as T[];
  if (raw && typeof raw === "object") {
    if (Array.isArray(raw.$values)) return raw.$values as T[];
    if (Array.isArray(raw.data)) return raw.data as T[];
    if (Array.isArray(raw.result)) return raw.result as T[];
    if (Array.isArray(raw.items)) return raw.items as T[];
  }
  return [];
};

const toNumber = (v: number | string | undefined | null) => {
  if (typeof v === "number") return v;
  if (typeof v === "string") {
    const n = Number(v.replace?.(/[^\d.]/g, "") ?? v);
    return Number.isFinite(n) ? n : NaN;
  }
  return NaN;
};
/* ----------------------------------------- */

const PropertyList: React.FC<PropertyListProps> = ({ filters }) => {
  const [properties, setProperties] = useState<RealoProperty[]>([]);
  const [filteredProperties, setFilteredProperties] = useState<RealoProperty[]>(
    []
  );
  const [sortOrder, setSortOrder] = useState(0);
  const navigate = useNavigate();

  const handlePropertyClick = (property: RealoProperty) => {
    navigate(
      `/properties/${encodeURIComponent(property.title)}/${property.propertyId}`
    );
  };

  // Fetch all properties from API
  useEffect(() => {
    const fetchProperties = async () => {
      try {
        const { data } = await axios.get(`${API}/api/Property/GetProperties`, {
          headers: { Accept: "application/json" },
        });

        // ✅ Normalize id to string so it matches PropertyCard’s expected type
        const list = toArray<any>(data).map((p) => ({
          ...p,
          propertyId: String(p?.propertyId ?? ""),
        })) as RealoProperty[];

        setProperties(list);
        setFilteredProperties(list);
      } catch (error) {
        console.error("Error fetching properties:", error);
        setProperties([]);
        setFilteredProperties([]);
      }
    };
    fetchProperties();
  }, []);

  // Sort function (0 none, 1 asc, 2 desc)
  const handleSort = () => {
    const src = [...filteredProperties];
    if (sortOrder === 0) {
      setFilteredProperties(
        src.sort((a, b) =>
          String(a.propertyId).localeCompare(String(b.propertyId))
        )
      );
      setSortOrder(1);
    } else if (sortOrder === 1) {
      setFilteredProperties(
        src.sort((a, b) =>
          String(b.propertyId).localeCompare(String(a.propertyId))
        )
      );
      setSortOrder(2);
    } else {
      setFilteredProperties([...properties]);
      setSortOrder(0);
    }
  };

  // Apply filters when they change
  useEffect(() => {
    let data = [...properties];

    if (filters.search?.trim()) {
      const q = filters.search.toLowerCase();
      data = data.filter(
        (p) =>
          p.title?.toLowerCase().includes(q) ||
          p.city?.toLowerCase().includes(q)
      );
    }

    if (filters.propertyType) {
      data = data.filter((p) => p.propertyType === filters.propertyType);
    }

    if (filters.minPrice) {
      const min = Number(filters.minPrice);
      data = data.filter((p) => toNumber(p.price) >= min);
    }
    if (filters.maxPrice) {
      const max = Number(filters.maxPrice);
      data = data.filter((p) => toNumber(p.price) <= max);
    }

    if (filters.bedrooms) {
      const n = Number(filters.bedrooms);
      data = data.filter((p) => (p.bedrooms ?? -1) === n);
    }
    if (filters.bathrooms) {
      const n = Number(filters.bathrooms);
      data = data.filter((p) => (p.bathrooms ?? -1) === n);
    }

    if (filters.minArea) {
      const minA = Number(filters.minArea);
      data = data.filter((p) => (p.squareFeet ?? 0) >= minA);
    }
    if (filters.maxArea) {
      const maxA = Number(filters.maxArea);
      data = data.filter((p) => (p.squareFeet ?? 0) <= maxA);
    }

    if (filters.isForSale !== null) {
      data = data.filter((p) => p.isForSale === filters.isForSale);
    }

    setFilteredProperties(data);
  }, [filters, properties]);

  const list = Array.isArray(filteredProperties) ? filteredProperties : [];

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
        {list.length > 0 ? (
          list.map((property) => (
            <PropertyCard
              key={property.propertyId}
              property={{
                ...property,
                price: toNumber(property.price),
              }}
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
