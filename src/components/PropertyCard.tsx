import React from "react";
import { Bath, BedDouble, Box, Eye, MapPin, Ruler } from "lucide-react";
import { formatPublicPrice } from "@/lib/price";

interface Property {
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
  virtualTourUrl?: string;
  floorPlanUrl?: string;
  images?: Array<{ imageUrl: string }>;
}

interface PropertyCardProps {
  property: Property;
  onClick: () => void;
}

const getPropertyTypeName = (propertyType = "") => {
  const typeMapping: Record<string, string> = {
    house: "Shtëpi",
    apartment: "Banesë",
    office: "Zyrë",
    store: "Lokal",
    land: "Tokë",
    building: "Objekt",
    warehouse: "Depo",
  };
  return typeMapping[propertyType.toLowerCase()] || propertyType || "Pronë";
};

const hasPositive = (value?: number | string) => {
  const n = Number(value);
  return Number.isFinite(n) && n > 0;
};

const PropertyCard: React.FC<PropertyCardProps> = ({ property, onClick }) => {
  const image =
    property.images?.[0]?.imageUrl ||
    "https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=900&auto=format&fit=crop";
  const transaction = property.isForSale ? "Në shitje" : "Me qira";
  const details = [
    hasPositive(property.bedrooms)
      ? { icon: BedDouble, label: `${property.bedrooms} Dhoma` }
      : null,
    hasPositive(property.bathrooms)
      ? { icon: Bath, label: `${property.bathrooms} Banjo` }
      : null,
    hasPositive(property.squareFeet)
      ? { icon: Ruler, label: `${property.squareFeet} m²` }
      : null,
    hasPositive(property.spaces)
      ? { icon: Box, label: `${property.spaces} Hapësira` }
      : null,
  ].filter(Boolean) as Array<{ icon: React.ElementType; label: string }>;

  return (
    <article
      onClick={onClick}
      className="group relative min-h-[460px] cursor-pointer overflow-hidden rounded-lg border border-real-estate-secondary/40 bg-[#07130f] shadow-sm transition duration-300 hover:-translate-y-1 hover:border-real-estate-secondary hover:shadow-2xl hover:shadow-real-estate-primary/20"
    >
      <div className="absolute inset-0 overflow-hidden">
        <img
          src={image}
          alt={property.title}
          className="h-full w-full object-cover transition duration-700 group-hover:scale-105"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-real-estate-primary/55 to-black/10" />
      </div>

      <div className="relative flex min-h-[460px] flex-col justify-between p-6 text-white">
        <div className="flex items-start justify-between gap-2">
          <span
            className={`rounded-md px-2.5 py-1 text-xs font-bold uppercase tracking-[0.14em] ${
              property.isForSale
                ? "bg-real-estate-primary text-real-estate-secondary"
                : "bg-real-estate-secondary text-real-estate-primary"
            }`}
          >
            {transaction}
          </span>
          <span className="rounded-md border border-real-estate-secondary/60 bg-black/30 px-2.5 py-1 text-xs font-semibold uppercase tracking-[0.12em] text-real-estate-secondary">
            {getPropertyTypeName(property.propertyType)}
          </span>
        </div>
        {property.virtualTourUrl && (
          <span className="absolute right-6 top-16 inline-flex items-center gap-1 rounded-md border border-real-estate-secondary/60 bg-black/40 px-2.5 py-1 text-xs font-semibold uppercase tracking-[0.12em] text-real-estate-secondary">
            <Eye className="h-3.5 w-3.5" />
            Tur 360°
          </span>
        )}

        <div>
          <div className="mb-3 flex items-center gap-2 text-sm uppercase tracking-[0.18em] text-real-estate-secondary">
          <MapPin className="h-4 w-4 text-real-estate-secondary" />
          <span>{property.city || "Kosovë"}</span>
        </div>
          <h3 className="line-clamp-2 max-w-[95%] font-title text-2xl leading-tight text-white md:text-3xl">
          {property.title}
        </h3>
          <div className="mt-3 font-title text-3xl text-real-estate-secondary">
          {formatPublicPrice(property.price)}
        </div>

        {details.length > 0 && (
            <div className="mt-5 flex flex-wrap gap-3 border-t border-real-estate-secondary/20 pt-4">
            {details.slice(0, 4).map(({ icon: Icon, label }) => (
                <div key={label} className="flex items-center gap-2 text-sm text-white/85">
                <Icon className="h-4 w-4 text-real-estate-secondary" />
                <span>{label}</span>
              </div>
            ))}
          </div>
        )}
        </div>
      </div>
    </article>
  );
};

export default PropertyCard;
