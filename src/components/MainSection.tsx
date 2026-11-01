import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ChevronDown, Search } from "lucide-react";
import { PROPERTY_TYPES } from "@/lib/properties";

const PRICES = [
  300, 1000, 5000, 10000, 20000, 30000, 50000, 75000, 100000, 200000, 300000, 400000, 500000,
  600000, 700000, 800000, 900000, 1000000, 1500000, 2000000, 2500000, 3000000, 3500000, 4000000,
  4500000, 5000000, 6000000, 7000000, 8000000, 9000000,
];
const BEDROOMS = ["1", "2", "3", "4", "5", "6", "7", "8+"];

const QUICK_TYPES = ["Apartment", "House", "Store", "Land"];

const formatPrice = (n: number) => `€${n.toLocaleString("en-US")}`;

/** A field with a small gold label above the value, like a premium search form. */
const Field: React.FC<{ label: string; className?: string; children: React.ReactNode }> = ({
  label,
  className = "",
  children,
}) => (
  <label
    className={`group relative block rounded-xl border border-real-estate-secondary/35 bg-real-estate-primary/80 transition focus-within:border-real-estate-secondary focus-within:bg-real-estate-primary hover:border-real-estate-secondary/70 ${className}`}
  >
    <span className="pointer-events-none absolute left-4 top-2.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-real-estate-secondary">
      {label}
    </span>
    {children}
    <ChevronDown className="pointer-events-none absolute right-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-real-estate-secondary transition group-focus-within:rotate-180" />
  </label>
);

const MainSection: React.FC = () => {
  const navigate = useNavigate();
  const [propertyType, setPropertyType] = useState("");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [bedrooms, setBedrooms] = useState("");

  const search = (event?: React.FormEvent) => {
    event?.preventDefault();
    const params = new URLSearchParams();
    if (propertyType) params.set("propertyType", propertyType);
    if (minPrice) params.set("minPrice", minPrice);
    if (maxPrice) params.set("maxPrice", maxPrice);
    if (bedrooms) params.set("bedrooms", bedrooms);
    navigate(`/Property?${params.toString()}`);
  };

  const field =
    "h-[60px] w-full cursor-pointer appearance-none rounded-xl bg-transparent pl-4 pr-10 pt-5 text-[15px] font-semibold text-white outline-none";
  const option = "bg-real-estate-primary text-white";

  return (
    <section className="relative flex min-h-[100svh] items-end overflow-hidden text-white md:items-center">
      <video
        className="absolute inset-0 h-full w-full object-cover"
        autoPlay
        loop
        muted
        playsInline
        preload="auto"
        poster="/video/hero-poster.jpg"
        aria-hidden="true"
      >
        <source src="/video/hero-720.mp4" type="video/mp4" media="(max-width: 767px)" />
        <source src="/video/hero-1280.mp4" type="video/mp4" />
      </video>
      {/* Darker at the bottom on phones where the text sits, even on desktop. */}
      <div className="absolute inset-0 bg-gradient-to-t from-[#06130f] via-black/55 to-black/35 md:bg-gradient-to-r md:from-black/75 md:via-black/45 md:to-black/20" />

      <div className="relative z-10 mx-auto w-full max-w-7xl px-4 pb-8 pt-28 md:px-6 md:pb-16 md:pt-32">
        <div className="max-w-3xl">
          <p className="font-text text-xs uppercase tracking-[0.3em] text-real-estate-secondary sm:text-sm">
            Welcome to Realo Real Estate
          </p>
          <h1 className="mt-3 font-title text-[clamp(2.15rem,7.5vw,4.75rem)] leading-[1.04] text-white [text-wrap:balance]">
            Gjej pronën ideale në Prishtinë
          </h1>
          <p className="mt-4 max-w-xl text-[15px] leading-relaxed text-white/80 sm:text-lg">
            Banesa, shtëpi, lokale dhe toka për shitje ose me qira, me foto të qarta dhe ture 360°.
          </p>
        </div>

        {/* The original hero filters (type, min/max price, bedrooms), in a gold-edged glass panel. */}
        <form
          onSubmit={search}
          className="mt-7 w-full max-w-5xl rounded-2xl border border-real-estate-secondary/40 bg-gradient-to-br from-white/[0.10] to-white/[0.03] p-2.5 shadow-[0_30px_80px_-20px_rgba(0,0,0,0.7)] ring-1 ring-inset ring-white/5 backdrop-blur-md sm:p-3 md:mt-9"
        >
          <div className="grid grid-cols-2 gap-2 sm:gap-2.5 lg:grid-cols-[1.25fr_1fr_1fr_1fr_auto]">
            <Field label="Lloji i pronës" className="col-span-2 lg:col-span-1">
              <select value={propertyType} onChange={(e) => setPropertyType(e.target.value)} className={field}>
                <option className={option} value="">
                  Të gjitha
                </option>
                {PROPERTY_TYPES.map((t) => (
                  <option key={t.value} className={option} value={t.value}>
                    {t.label}
                  </option>
                ))}
              </select>
            </Field>

            <Field label="Çmimi min.">
              <select value={minPrice} onChange={(e) => setMinPrice(e.target.value)} className={field}>
                <option className={option} value="">
                  Pa kufi
                </option>
                {PRICES.map((n) => (
                  <option key={n} className={option} value={String(n)}>
                    {formatPrice(n)}
                  </option>
                ))}
              </select>
            </Field>

            <Field label="Çmimi maks.">
              <select value={maxPrice} onChange={(e) => setMaxPrice(e.target.value)} className={field}>
                <option className={option} value="">
                  Pa kufi
                </option>
                {PRICES.filter((n) => !minPrice || n >= Number(minPrice)).map((n) => (
                  <option key={n} className={option} value={String(n)}>
                    {formatPrice(n)}
                  </option>
                ))}
              </select>
            </Field>

            <Field label="Dhoma gjumi" className="col-span-2 sm:col-span-1">
              <select value={bedrooms} onChange={(e) => setBedrooms(e.target.value)} className={field}>
                <option className={option} value="">
                  Çdo numër
                </option>
                {BEDROOMS.map((n) => (
                  <option key={n} className={option} value={n}>
                    {n}
                  </option>
                ))}
              </select>
            </Field>

            <button
              type="submit"
              className="col-span-2 inline-flex h-[60px] items-center justify-center gap-2 rounded-xl bg-gradient-to-b from-[#d9b25a] to-real-estate-secondary px-8 text-[15px] font-bold uppercase tracking-[0.16em] text-real-estate-primary shadow-lg shadow-black/30 transition hover:brightness-110 focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-real-estate-primary sm:col-span-1 lg:min-w-[170px]"
            >
              <Search className="h-5 w-5" />
              Kërko
            </button>
          </div>
        </form>

        <div className="mt-4 flex flex-wrap items-center gap-2 text-sm">
          <span className="text-white/70">Kërkime të shpejta:</span>
          {QUICK_TYPES.map((type) => (
            <Link
              key={type}
              to={`/Property?propertyType=${type}`}
              className="rounded-full border border-white/25 bg-black/20 px-3.5 py-1.5 font-medium text-white backdrop-blur-sm transition hover:border-real-estate-secondary hover:text-real-estate-secondary"
            >
              {PROPERTY_TYPES.find((t) => t.value === type)?.label}
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};

export default MainSection;
