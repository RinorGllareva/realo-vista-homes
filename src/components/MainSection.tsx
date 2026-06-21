import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const MainSection: React.FC = () => {
  const [filters, setFilters] = useState({
    propertyType: "",
    minPrice: "",
    maxPrice: "",
    bedrooms: "",
  });

  const navigate = useNavigate();

  const handleInputChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = event.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  const handleSearch = () => {
    const entries = Object.entries(filters).filter(([, value]) => value);
    navigate(`/Property?${new URLSearchParams(entries).toString()}`);
  };

  const minPriceOptions = [
    300, 1000, 5000, 10000, 20000, 30000, 50000, 75000, 100000, 200000, 300000,
    400000, 500000, 600000, 700000, 800000, 900000, 1000000, 1500000, 2000000,
    2500000, 3000000, 3500000, 4000000, 4500000, 5000000, 6000000, 7000000,
    8000000, 9000000,
  ];

  const selectClass =
    "w-full rounded-md border border-real-estate-secondary bg-real-estate-primary/90 px-4 py-3 font-text text-base font-semibold text-white outline-none transition focus:ring-2 focus:ring-real-estate-secondary md:w-auto md:min-w-[160px]";
  const propertyTypes = [
    { value: "House", label: "Shtëpi" },
    { value: "Apartment", label: "Banesë" },
    { value: "Land", label: "Tokë" },
    { value: "Store", label: "Lokal" },
    { value: "Warehouse", label: "Depo" },
    { value: "Building", label: "Objekt" },
    { value: "Office", label: "Zyrë" },
  ];

  return (
    <section className="relative flex min-h-screen items-center justify-center overflow-hidden px-4 text-white">
      <video
        className="absolute inset-0 h-full w-full object-cover"
        autoPlay
        loop
        muted
        playsInline
      >
        <source src="/Prishtina - Made with Clipchamp.mp4" type="video/mp4" />
      </video>
      <div className="absolute inset-0 bg-black/60" />

      <div className="relative z-10 flex min-h-screen w-full max-w-6xl flex-col justify-end pb-10 pt-28 md:pb-20">
        <div className="mb-10 text-center">
          <div
            className="mx-auto flex max-w-full flex-nowrap items-baseline justify-center gap-x-[clamp(0.25rem,1vw,0.75rem)] whitespace-nowrap text-real-estate-secondary"
            aria-label="WELCOME TO REALO REAL ESTATE"
          >
            <span className="font-text text-[clamp(1.5rem,4.5vw,4.5rem)] leading-none">
              WELCOME TO
            </span>
            <h1 className="font-title text-[clamp(1.75rem,8.5vw,5.5rem)] leading-none">
              REALO
            </h1>
            <span className="font-text text-[clamp(1.5rem,4.5vw,4.5rem)] leading-tight">
              REAL ESTATE
            </span>
          </div>
        </div>

        <div className="mx-auto w-full max-w-5xl">
          <h2 className="mb-3 text-left font-[Montserrat] text-lg font-medium text-white md:text-xl">
            Gjej pronën ideale në Prishtinë
          </h2>
          <div className="grid gap-3 rounded-lg border border-real-estate-secondary/30 bg-white/5 p-3 shadow-2xl backdrop-blur-[2px] md:grid-cols-[repeat(4,minmax(0,1fr))_auto]">
            <select
              name="propertyType"
              value={filters.propertyType}
              onChange={handleInputChange}
              className={selectClass}
            >
              <option className="bg-real-estate-primary" value="">
                Lloji i pronës
              </option>
              {propertyTypes.map(
                (type) => (
                  <option key={type.value} className="bg-real-estate-primary" value={type.value}>
                    {type.label}
                  </option>
                )
              )}
            </select>

            <select
              name="minPrice"
              value={filters.minPrice}
              onChange={handleInputChange}
              className={selectClass}
            >
              <option className="bg-real-estate-primary" value="">
                Çmimi min.
              </option>
              {minPriceOptions.map((price) => (
                <option key={price} value={String(price)} className="bg-real-estate-primary">
                  {price.toLocaleString("en-US")}
                </option>
              ))}
            </select>

            <select
              name="maxPrice"
              value={filters.maxPrice}
              onChange={handleInputChange}
              className={selectClass}
            >
              <option className="bg-real-estate-primary" value="">
                Çmimi maks.
              </option>
              {minPriceOptions.map((price) => (
                <option key={price} value={String(price)} className="bg-real-estate-primary">
                  {price.toLocaleString("en-US")}
                </option>
              ))}
            </select>

            <select
              name="bedrooms"
              value={filters.bedrooms}
              onChange={handleInputChange}
              className={selectClass}
            >
              <option className="bg-real-estate-primary" value="">
                Dhoma gjumi
              </option>
              {[1, 2, 3, 4, 5, 6, 7].map((count) => (
                <option key={count} value={String(count)} className="bg-real-estate-primary">
                  {count}
                </option>
              ))}
              <option value="8+" className="bg-real-estate-primary">
                8+
              </option>
            </select>

            <button
              onClick={handleSearch}
              className="rounded-md bg-real-estate-secondary px-7 py-3 font-text text-base font-bold uppercase tracking-[0.14em] text-real-estate-primary transition hover:bg-white"
            >
              Kërko
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default MainSection;
