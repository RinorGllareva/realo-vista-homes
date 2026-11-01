import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ChevronDown, Search } from "lucide-react";
import { PROPERTY_TYPES } from "@/lib/properties";

type Deal = "sale" | "rent";

// Budgets make sense per deal type: monthly rent vs. purchase price.
const BUDGETS: Record<Deal, number[]> = {
  sale: [50000, 75000, 100000, 150000, 200000, 300000, 500000, 1000000],
  rent: [200, 300, 400, 500, 750, 1000, 1500, 2500],
};

const QUICK_TYPES = ["Apartment", "House", "Store", "Land"];

const formatBudget = (n: number) =>
  n >= 1000000 ? `€${n / 1000000}M` : n >= 1000 ? `€${n / 1000}k` : `€${n}`;

const MainSection: React.FC = () => {
  const navigate = useNavigate();
  const [deal, setDeal] = useState<Deal>("sale");
  const [propertyType, setPropertyType] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [bedrooms, setBedrooms] = useState("");

  const changeDeal = (next: Deal) => {
    setDeal(next);
    setMaxPrice(""); // sale and rent budgets are not comparable
  };

  const search = (event?: React.FormEvent) => {
    event?.preventDefault();
    const params = new URLSearchParams({ isForSale: String(deal === "sale") });
    if (propertyType) params.set("propertyType", propertyType);
    if (maxPrice) params.set("maxPrice", maxPrice);
    if (bedrooms) params.set("bedrooms", bedrooms);
    navigate(`/Property?${params.toString()}`);
  };

  const field =
    "peer h-12 w-full appearance-none rounded-lg border border-real-estate-primary/15 bg-white pl-3.5 pr-9 text-[15px] font-medium text-real-estate-primary outline-none transition focus:border-real-estate-secondary focus:ring-2 focus:ring-real-estate-secondary/30";
  const label = "mb-1.5 block text-xs font-semibold uppercase tracking-[0.12em] text-real-estate-primary/60";

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

        <form
          onSubmit={search}
          className="mt-7 w-full max-w-5xl rounded-2xl bg-white/95 p-3 text-real-estate-primary shadow-2xl shadow-black/40 backdrop-blur sm:p-4 md:mt-9"
        >
          <div role="tablist" aria-label="Lloji i marrëveshjes" className="mb-3 inline-flex rounded-full bg-real-estate-primary/[0.07] p-1">
            {(
              [
                ["sale", "Në shitje"],
                ["rent", "Me qira"],
              ] as const
            ).map(([value, text]) => (
              <button
                key={value}
                type="button"
                role="tab"
                aria-selected={deal === value}
                onClick={() => changeDeal(value)}
                className={`rounded-full px-5 py-2 text-sm font-semibold transition ${
                  deal === value
                    ? "bg-real-estate-primary text-real-estate-secondary shadow"
                    : "text-real-estate-primary/70 hover:text-real-estate-primary"
                }`}
              >
                {text}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-2 gap-2.5 sm:gap-3 md:grid-cols-[1.2fr_1fr_1fr_auto] md:items-end">
            <label className="col-span-2 md:col-span-1">
              <span className={label}>Lloji i pronës</span>
              <span className="relative block">
                <select value={propertyType} onChange={(e) => setPropertyType(e.target.value)} className={field}>
                  <option value="">Të gjitha llojet</option>
                  {PROPERTY_TYPES.map((t) => (
                    <option key={t.value} value={t.value}>
                      {t.label}
                    </option>
                  ))}
                </select>
                <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-real-estate-primary/50" />
              </span>
            </label>

            <label>
              <span className={label}>{deal === "rent" ? "Qiraja deri" : "Çmimi deri"}</span>
              <span className="relative block">
                <select value={maxPrice} onChange={(e) => setMaxPrice(e.target.value)} className={field}>
                  <option value="">Pa kufi</option>
                  {BUDGETS[deal].map((n) => (
                    <option key={n} value={String(n)}>
                      {formatBudget(n)}
                      {deal === "rent" ? " / muaj" : ""}
                    </option>
                  ))}
                </select>
                <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-real-estate-primary/50" />
              </span>
            </label>

            <label>
              <span className={label}>Dhoma gjumi</span>
              <span className="relative block">
                <select value={bedrooms} onChange={(e) => setBedrooms(e.target.value)} className={field}>
                  <option value="">Çdo numër</option>
                  {["1", "2", "3", "4+"].map((n) => (
                    <option key={n} value={n}>
                      {n}
                    </option>
                  ))}
                </select>
                <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-real-estate-primary/50" />
              </span>
            </label>

            <button
              type="submit"
              className="col-span-2 inline-flex h-12 items-center justify-center gap-2 rounded-lg bg-real-estate-secondary px-6 text-[15px] font-bold text-real-estate-primary transition hover:bg-real-estate-primary hover:text-real-estate-secondary focus:outline-none focus-visible:ring-2 focus-visible:ring-real-estate-primary focus-visible:ring-offset-2 md:col-span-1 md:min-w-[190px]"
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
