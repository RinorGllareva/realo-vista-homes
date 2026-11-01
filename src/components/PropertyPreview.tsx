import React, { useMemo, useRef } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";
import PropertyCard from "./PropertyCard";
import { useProperties } from "@/lib/properties";

const PropertyPreview: React.FC = () => {
  const trackRef = useRef<HTMLDivElement>(null);
  const { data = [], isLoading } = useProperties();

  // The newest dozen; the full catalogue lives on /Property.
  const latest = useMemo(
    () => [...data].sort((a, b) => Number(b.propertyId) - Number(a.propertyId)).slice(0, 12),
    [data]
  );

  const scroll = (direction: -1 | 1) =>
    trackRef.current?.scrollBy({
      left: direction * (trackRef.current.clientWidth * 0.9 || 0),
      behavior: "smooth",
    });

  return (
    <section className="border-y border-real-estate-secondary/20 bg-[#ebe1cf] py-14 md:py-20">
      <div className="mx-auto mb-8 flex max-w-7xl flex-col gap-4 px-5 sm:flex-row sm:items-end sm:justify-between md:px-6">
        <div>
          <p className="font-text text-xs uppercase tracking-[0.28em] text-real-estate-primary/70 sm:text-sm">
            Të shtuara së fundmi
          </p>
          <h2 className="mt-2 font-title text-3xl text-real-estate-primary md:text-5xl">
            Pronat e reja të Realo
          </h2>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => scroll(-1)}
            aria-label="Pronat e mëparshme"
            className="hidden h-11 w-11 items-center justify-center rounded-full border border-real-estate-primary/20 text-real-estate-primary transition hover:bg-real-estate-primary hover:text-real-estate-secondary sm:inline-flex"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button
            onClick={() => scroll(1)}
            aria-label="Pronat e radhës"
            className="hidden h-11 w-11 items-center justify-center rounded-full border border-real-estate-primary/20 text-real-estate-primary transition hover:bg-real-estate-primary hover:text-real-estate-secondary sm:inline-flex"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
          <Link
            to="/Property"
            className="inline-flex items-center gap-2 rounded-full bg-real-estate-primary px-5 py-3 font-text text-xs font-semibold uppercase tracking-[0.16em] text-real-estate-secondary transition hover:bg-real-estate-primary/90 sm:ml-2"
          >
            Të gjitha pronat <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>

      <div
        ref={trackRef}
        className="no-scrollbar flex snap-x snap-mandatory gap-4 overflow-x-auto scroll-px-5 px-5 pb-4 pt-2 md:gap-5 md:scroll-px-6 md:px-6 xl:px-[max(1.5rem,calc((100vw-80rem)/2+1.5rem))]"
      >
        {isLoading
          ? Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="w-[min(82vw,340px)] shrink-0 overflow-hidden rounded-xl bg-white sm:w-[340px]">
                <div className="aspect-[4/3] animate-pulse bg-[#efe8d7]" />
                <div className="space-y-3 p-5">
                  <div className="h-5 w-4/5 animate-pulse rounded bg-[#efe8d7]" />
                  <div className="h-6 w-1/3 animate-pulse rounded bg-[#efe8d7]" />
                </div>
              </div>
            ))
          : latest.map((property) => (
              <div key={String(property.propertyId)} className="w-[min(82vw,340px)] shrink-0 snap-start sm:w-[340px]">
                <PropertyCard property={property} />
              </div>
            ))}
      </div>
    </section>
  );
};

export default PropertyPreview;
