import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { ChevronLeft, ChevronRight, Eye, FileText } from "lucide-react";
import { apiUrl, normalizeMediaUrl } from "@/lib/api";
import { formatPublicPrice } from "@/lib/price";

interface Property {
  propertyId: string | number;
  title: string;
  city: string;
  price: string | number;
  propertyType: string;
  isForSale: boolean;
  virtualTourUrl?: string;
  hasPublishedVirtualTour?: boolean;
  floorPlanUrl?: string;
  images?: Array<{ imageUrl: string }> | { imageUrl: string } | string | null;
}

const normalizeToArray = (raw: unknown): Property[] => {
  if (Array.isArray(raw)) return raw as Property[];
  if (raw && typeof raw === "object") {
    const r = raw as any;
    if (Array.isArray(r.$values)) return r.$values;
    if (Array.isArray(r.data)) return r.data;
    if (Array.isArray(r.result)) return r.result;
    if (Array.isArray(r.items)) return r.items;
  }
  return [];
};

const normalizeImages = (value: unknown): Array<{ imageUrl: string }> => {
  if (Array.isArray(value)) return value as Array<{ imageUrl: string }>;
  if (value && typeof value === "object" && "imageUrl" in (value as any)) {
    return [value as { imageUrl: string }];
  }
  if (typeof value === "string") {
    return value
      .split(",")
      .map((imageUrl) => ({ imageUrl: imageUrl.trim() }))
      .filter((image) => image.imageUrl);
  }
  return [];
};

const PropertyPreview: React.FC = () => {
  const navigate = useNavigate();
  const trackRef = useRef<HTMLDivElement>(null);
  const [properties, setProperties] = useState<Property[]>([]);

  useEffect(() => {
    const ac = new AbortController();
    axios
      .get(apiUrl("api/Property/GetProperties"), {
        headers: { Accept: "application/json" },
        signal: ac.signal,
      })
      .then((res) => setProperties(normalizeToArray(res.data)))
      .catch((error) => {
        if (error?.name !== "CanceledError" && error?.code !== "ERR_CANCELED") {
          console.error("Error fetching properties:", error);
        }
      });

    return () => ac.abort();
  }, []);

  const scroll = (direction: -1 | 1) =>
    trackRef.current?.scrollBy({
      left: direction * (trackRef.current.clientWidth || 0),
      behavior: "smooth",
    });

  return (
    <section className="relative overflow-hidden border-y border-real-estate-secondary/20 bg-[#ebe1cf] px-4 py-14 md:px-8">
      <div className="mx-auto mb-7 max-w-7xl text-center">
        <p className="font-text text-sm uppercase tracking-[0.28em] text-real-estate-secondary">
          Prona të reja
        </p>
        <h2 className="mt-2 font-title text-4xl text-real-estate-primary md:text-5xl">
          Pronat e reja të Realo
        </h2>
      </div>

      <button
        onClick={() => scroll(-1)}
        aria-label="Scroll left"
        className="absolute left-2 top-1/2 z-30 rounded-md bg-real-estate-primary/85 p-2 text-real-estate-secondary transition hover:bg-real-estate-primary md:left-6"
      >
        <ChevronLeft />
      </button>
      <button
        onClick={() => scroll(1)}
        aria-label="Scroll right"
        className="absolute right-2 top-1/2 z-30 rounded-md bg-real-estate-primary/85 p-2 text-real-estate-secondary transition hover:bg-real-estate-primary md:right-6"
      >
        <ChevronRight />
      </button>

      <div
        ref={trackRef}
        className="mx-auto flex w-full max-w-[calc(100vw-2rem)] gap-5 overflow-x-auto pb-5 scroll-smooth md:max-w-[calc(100vw-4rem)] [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {properties.map((property) => {
          const image =
            normalizeMediaUrl(normalizeImages(property.images)[0]?.imageUrl) ||
            "https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=900&auto=format&fit=crop";
          const hasTour = Boolean(property.hasPublishedVirtualTour || property.virtualTourUrl);
          const hasFloorPlan = Boolean(property.floorPlanUrl);
          return (
            <article
              key={String(property.propertyId)}
              onClick={() =>
                navigate(`/properties/${encodeURIComponent(property.title)}/${property.propertyId}`)
              }
              className="group relative w-[min(82vw,340px)] shrink-0 cursor-pointer overflow-hidden rounded-lg border border-real-estate-primary/10 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-xl sm:w-[min(44vw,360px)] lg:w-[min(28vw,380px)] 2xl:w-[420px]"
            >
              <div className="relative h-48 overflow-hidden bg-[#efe8d7]">
                <img
                  src={image}
                  alt={property.title}
                  className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                  loading="lazy"
                />
                <span
                  className={`absolute left-3 top-3 rounded-md px-2.5 py-1 text-xs font-bold uppercase tracking-[0.14em] ${
                    property.isForSale
                      ? "bg-real-estate-primary text-real-estate-secondary"
                      : "bg-real-estate-secondary text-real-estate-primary"
                  }`}
                >
                  {property.isForSale ? "Në shitje" : "Me qira"}
                </span>
                {hasTour && (
                  <span className="absolute bottom-3 left-3 inline-flex items-center gap-1 rounded-md bg-black/70 px-2.5 py-1 text-xs font-semibold uppercase tracking-[0.12em] text-real-estate-secondary">
                    <Eye className="h-3.5 w-3.5" />
                    Tur 360°
                  </span>
                )}
                {hasFloorPlan && (
                  <span className={`absolute left-3 inline-flex items-center gap-1 rounded-md bg-black/70 px-2.5 py-1 text-xs font-semibold uppercase tracking-[0.12em] text-real-estate-secondary ${hasTour ? "bottom-12" : "bottom-3"}`}>
                    <FileText className="h-3.5 w-3.5" />
                    Planimetri
                  </span>
                )}
              </div>
              <div className="p-4">
                <p className="text-sm text-muted-foreground">{property.city}</p>
                <h3 className="mt-1 line-clamp-2 font-title text-xl text-real-estate-primary">
                  {property.title}
                </h3>
                <p className="mt-2 font-title text-2xl text-real-estate-secondary">
                  {formatPublicPrice(property.price)}
                </p>
              </div>
            </article>
          );
        })}
      </div>

      <div className="mt-6 text-center">
        <button
          onClick={() => navigate("/Property")}
          className="rounded-md bg-real-estate-primary px-5 py-3 font-text text-sm font-semibold uppercase tracking-[0.16em] text-real-estate-secondary transition hover:bg-real-estate-primary/90"
        >
          Shiko të gjitha pronat
        </button>
      </div>
    </section>
  );
};

export default PropertyPreview;
