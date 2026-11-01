import React, { useCallback, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { Helmet } from "react-helmet";
import Header from "../components/Header";
import PropertyList from "../components/PropertyList";
import PropertyHeader from "../components/PropertyHeader";
import Footer from "../components/Footer";

export interface Filters {
  propertyType: string;
  minPrice: string;
  maxPrice: string;
  bedrooms: string;
  minArea: string;
  maxArea: string;
  isForSale: boolean | null;
  search: string;
  sort: string;
}

const KEYS = ["propertyType", "minPrice", "maxPrice", "bedrooms", "minArea", "maxArea", "search", "sort"] as const;

const PropertyPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  // The URL is the single source of truth, so Back, refresh and shared links all keep
  // the same filtered list.
  const filters = useMemo<Filters>(() => {
    const sale = searchParams.get("isForSale");
    return {
      ...(Object.fromEntries(KEYS.map((k) => [k, searchParams.get(k) || ""])) as Omit<Filters, "isForSale">),
      isForSale: sale === "true" ? true : sale === "false" ? false : null,
    };
  }, [searchParams]);

  const updateFilters = useCallback(
    (patch: Partial<Filters> | null) => {
      setSearchParams(
        (prev) => {
          if (patch === null) return new URLSearchParams();
          const next = new URLSearchParams(prev);
          Object.entries(patch).forEach(([key, value]) => {
            if (value === null || value === undefined || value === "") next.delete(key);
            else next.set(key, String(value));
          });
          return next;
        },
        { replace: true }
      );
    },
    [setSearchParams]
  );

  return (
    <div className="min-h-screen bg-[#fbfaf7]">
      <Helmet>
        <title>Prona ne Shitje dhe me Qera | Realo Real Estate</title>
        <meta
          name="description"
          content="Shfletoni lista te pronave per shitje dhe me qera ne Prishtine dhe Kosove. Shtepi, banesa, troje, lokale dhe me shume."
        />
        <meta
          name="keywords"
          content="prona ne shitje, prona me qera, shtepi prishtine, banesa kosove, troje per shitje, lokale per shitje"
        />
        <link rel="canonical" href="https://realo-realestate.com/Property" />
      </Helmet>
      <Header />
      <section className="relative overflow-hidden bg-real-estate-primary px-5 pb-12 pt-28 text-white md:pb-16 md:pt-36">
        <img
          src="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1600&auto=format&fit=crop"
          alt=""
          className="absolute inset-0 h-full w-full object-cover opacity-30"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-real-estate-primary via-real-estate-primary/85 to-real-estate-primary/40" />
        <div className="relative mx-auto max-w-7xl">
          <p className="font-text text-xs uppercase tracking-[0.28em] text-real-estate-secondary sm:text-sm">
            Prona të veçanta
          </p>
          <h1 className="mt-3 max-w-3xl font-title text-[clamp(2rem,7vw,3.75rem)] leading-[1.08]">
            Gjej pronën që i përshtatet mënyrës si jeton.
          </h1>
          <p className="mt-4 max-w-2xl text-sm leading-6 text-white/80 sm:text-base">
            Shfleto shtëpi, banesa, hapësira komerciale dhe toka me media më të qarta, filtra
            më të pastër dhe ture 360° kur janë të disponueshme.
          </p>
        </div>
      </section>
      <PropertyHeader filters={filters} onChange={updateFilters} />
      <PropertyList filters={filters} onChange={updateFilters} />
      <Footer />
    </div>
  );
};

export default PropertyPage;
