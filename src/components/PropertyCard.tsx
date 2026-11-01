import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Bath, BedDouble, Box, Eye, FileText, MapPin, Ruler } from "lucide-react";
import { formatPublicPrice } from "@/lib/price";
import {
  PLACEHOLDER_IMAGE,
  firstImage,
  propertyPath,
  propertyTypeLabel,
  type PropertySummary,
} from "@/lib/properties";
import FavoriteButton from "./FavoriteButton";

interface PropertyCardProps {
  property: PropertySummary;
  className?: string;
  /** Load the image immediately (first row of a list). */
  eager?: boolean;
}

const hasPositive = (value?: number | string) => {
  const n = Number(value);
  return Number.isFinite(n) && n > 0;
};

const PropertyCard: React.FC<PropertyCardProps> = ({ property, className = "", eager = false }) => {
  const [image, setImage] = useState(() => firstImage(property.images));
  const hasTour = Boolean(property.hasPublishedVirtualTour || property.virtualTourUrl);
  const hasFloorPlan = Boolean(property.floorPlanUrl);
  const details = [
    hasPositive(property.bedrooms) ? { icon: BedDouble, label: `${property.bedrooms} Dhoma` } : null,
    hasPositive(property.bathrooms) ? { icon: Bath, label: `${property.bathrooms} Banjo` } : null,
    hasPositive(property.squareFeet) ? { icon: Ruler, label: `${property.squareFeet} m²` } : null,
    hasPositive(property.spaces) ? { icon: Box, label: `${property.spaces} Hapësira` } : null,
  ].filter(Boolean) as Array<{ icon: React.ElementType; label: string }>;

  return (
    <article
      className={`group relative flex h-full flex-col overflow-hidden rounded-xl border border-real-estate-primary/10 bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:border-real-estate-secondary/60 hover:shadow-xl ${className}`}
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-[#efe8d7]">
        <img
          src={image}
          alt={property.title}
          loading={eager ? "eager" : "lazy"}
          decoding="async"
          onError={() => setImage(PLACEHOLDER_IMAGE)}
          className="h-full w-full object-cover transition duration-700 group-hover:scale-105"
        />
        <div className="pointer-events-none absolute inset-x-0 top-0 h-20 bg-gradient-to-b from-black/45 to-transparent" />

        <div className="absolute left-3 top-3 flex flex-wrap gap-1.5">
          <span
            className={`rounded-md px-2.5 py-1 text-[11px] font-bold uppercase tracking-[0.12em] ${
              property.isForSale
                ? "bg-real-estate-primary text-real-estate-secondary"
                : "bg-real-estate-secondary text-real-estate-primary"
            }`}
          >
            {property.isForSale ? "Në shitje" : "Me qira"}
          </span>
          <span className="rounded-md bg-black/55 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-white backdrop-blur-sm">
            {propertyTypeLabel(property.propertyType)}
          </span>
        </div>

        {(hasTour || hasFloorPlan) && (
          <div className="absolute bottom-3 left-3 flex flex-wrap gap-1.5">
            {hasTour && (
              <span className="inline-flex items-center gap-1 rounded-md bg-black/70 px-2 py-1 text-[11px] font-semibold uppercase tracking-[0.1em] text-real-estate-secondary">
                <Eye className="h-3.5 w-3.5" /> Tur 360°
              </span>
            )}
            {hasFloorPlan && (
              <span className="inline-flex items-center gap-1 rounded-md bg-black/70 px-2 py-1 text-[11px] font-semibold uppercase tracking-[0.1em] text-real-estate-secondary">
                <FileText className="h-3.5 w-3.5" /> Planimetri
              </span>
            )}
          </div>
        )}
      </div>

      <div className="flex flex-1 flex-col p-4 sm:p-5">
        <div className="flex items-center gap-1.5 text-xs font-medium uppercase tracking-[0.14em] text-real-estate-primary/60">
          <MapPin className="h-3.5 w-3.5 shrink-0 text-real-estate-secondary" />
          <span className="truncate">{property.city || "Kosovë"}</span>
        </div>
        <h3 className="mt-2 line-clamp-2 min-h-[2.5em] font-title text-lg leading-tight text-real-estate-primary sm:text-xl">
          {/* Stretched link: the whole card is clickable, opens in a new tab with ctrl/cmd. */}
          <Link to={propertyPath(property)} className="after:absolute after:inset-0 focus:outline-none focus-visible:after:rounded-xl focus-visible:after:ring-2 focus-visible:after:ring-real-estate-secondary">
            {property.title}
          </Link>
        </h3>
        <p className="mt-2 font-title text-2xl text-real-estate-primary">
          {formatPublicPrice(property.price)}
        </p>

        {details.length > 0 && (
          <div className="mt-auto pt-4">
            <div className="flex flex-wrap gap-x-4 gap-y-2 border-t border-real-estate-primary/10 pt-3 text-sm text-real-estate-primary/75">
              {details.map(({ icon: Icon, label }) => (
                <span key={label} className="inline-flex items-center gap-1.5">
                  <Icon className="h-4 w-4 text-real-estate-secondary" />
                  {label}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      <FavoriteButton
        propertyId={property.propertyId}
        title={property.title}
        className="absolute right-3 top-3 z-10"
      />
    </article>
  );
};

export default PropertyCard;
