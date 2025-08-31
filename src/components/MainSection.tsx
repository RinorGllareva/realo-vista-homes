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

  const handleInputChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  const handleSearch = () => {
    // Only include non-empty filters
    const entries = Object.entries(filters).filter(
      ([, v]) => v !== "" && v != null
    );
    const queryParams = new URLSearchParams(
      entries as [string, string][]
    ).toString();
    navigate(`/Property?${queryParams}`);
  };

  const minPriceOptions = [
    300, 1000, 5000, 10000, 20000, 30000, 50000, 75000, 100000, 200000, 300000,
    400000, 500000, 600000, 700000, 800000, 900000, 1000000, 1500000, 2000000,
    2500000, 3000000, 3500000, 4000000, 4500000, 5000000, 6000000, 7000000,
    8000000, 9000000,
  ];
  const maxPriceOptions = [...minPriceOptions];

  return (
    <section className="relative h-screen text-white flex items-center justify-center">
      {/* Background video */}
      <video
        className="absolute inset-0 h-full w-full object-cover -z-10"
        autoPlay
        loop
        muted
        playsInline
      >
        <source src="/Prishtina - Made with Clipchamp.mp4" type="video/mp4" />
      </video>

      {/* Dark overlay */}
      <div className="absolute inset-0 bg-black/60 -z-0" />

      {/* Title */}
      <div
        className="
          absolute text-center z-20
          bottom-[300px] md:bottom-[300px] sm:bottom-[350px]
          max-sm:bottom-[300px] [@media(max-width:768px)]:bottom-[400px]
          [@media(max-width:480px)]:bottom-[280px] [@media(max-width:390px)]:bottom-0
        "
      >
        <div className="flex items-center justify-center gap-2 sm:gap-3 mb-2 sm:mb-4">
          <h3 className="font-text text-[25px] sm:text-[35px] lg:text-[45px] font-normal text-real-estate-secondary max-[480px]:text-[20px] max-[390px]:text-[1.1rem]">
            WELCOME TO
          </h3>
          <h1 className="font-title text-[35px] sm:text-[55px] lg:text-[75px] font-normal text-real-estate-secondary max-[480px]:text-[35px] max-[390px]:text-[2rem]">
            REALO
          </h1>
          <h3 className="font-text text-[25px] sm:text-[35px] lg:text-[45px] font-normal text-real-estate-secondary max-[480px]:text-[20px] max-[390px]:text-[1.1rem]">
            REAL ESTATE
          </h3>
        </div>
      </div>

      {/* Filters */}
      <div
        className="
          absolute z-20 w-full flex flex-col items-center text-center px-4
          bottom-[70px] sm:bottom-20 max-[768px]:bottom-4 max-[480px]:bottom-8 max-[390px]:bottom-8
        "
      >
        <div className="w-full max-w-5xl">
          <h3
            className="
              font-[Montserrat] text-[20px] text-white text-left ml-5 mb-1
              max-[768px]:text-[19px] max-[480px]:text-[16px] max-[390px]:text-[16px]
            "
          >
            Prona juaj ideale në Prishtinë…
          </h3>
        </div>

        <div
          className="
            inline-flex gap-2 sm:gap-3
            max-[768px]:flex-col max-[768px]:gap-2
            w-full max-w-5xl items-center
          "
        >
          {/* Property Type */}
          <select
            name="propertyType"
            value={filters.propertyType}
            onChange={handleInputChange}
            className="
              px-10 py-2 text-white font-text font-bold text-lg md:text-xl
              border-4 border-[#9f8151] rounded bg-white/10
              focus:outline-none focus:ring-2 focus:ring-yellow-500
              max-[1024px]:px-8 max-[1024px]:text-[16px]
              max-[768px]:w-[22rem] max-[768px]:px-6 max-[768px]:py-3 max-[768px]:border-[3px]
              max-[480px]:w-full
            "
          >
            <option className="bg-[#0a4834] text-white" value="">
              Lloji i pronës
            </option>
            <option className="bg-[#0a4834] text-white" value="House">
              Shtëpi
            </option>
            <option className="bg-[#0a4834] text-white" value="Apartment">
              Banesa
            </option>
            <option className="bg-[#0a4834] text-white" value="Land">
              Troje
            </option>
            <option className="bg-[#0a4834] text-white" value="Store">
              Lokale
            </option>
            <option className="bg-[#0a4834] text-white" value="Warehouse">
              Depo
            </option>
            <option className="bg-[#0a4834] text-white" value="Building">
              Objekte
            </option>
            <option className="bg-[#0a4834] text-white" value="Office">
              Zyre
            </option>
          </select>

          {/* Min Price */}
          <select
            name="minPrice"
            value={filters.minPrice}
            onChange={handleInputChange}
            className="
              px-10 py-2 text-white font-text font-bold text-lg md:text-xl
              border-4 border-[#9f8151] rounded bg-white/10
              focus:outline-none focus:ring-2 focus:ring-yellow-500
              max-[1024px]:px-8 max-[1024px]:text-[16px]
              max-[768px]:w-[22rem] max-[768px]:px-6 max-[768px]:py-3 max-[768px]:border-[3px]
              max-[480px]:w-full
            "
          >
            <option className="bg-[#0a4834] text-white" value="">
              Min Çmimi
            </option>
            {minPriceOptions.map((price) => (
              <option
                key={price}
                value={String(price)}
                className="bg-[#0a4834] text-white"
              >
                {price.toLocaleString("en-US")}
              </option>
            ))}
          </select>

          {/* Max Price */}
          <select
            name="maxPrice"
            value={filters.maxPrice}
            onChange={handleInputChange}
            className="
              px-10 py-2 text-white font-text font-bold text-lg md:text-xl
              border-4 border-[#9f8151] rounded bg-white/10
              focus:outline-none focus:ring-2 focus:ring-yellow-500
              max-[1024px]:px-8 max-[1024px]:text-[16px]
              max-[768px]:w-[22rem] max-[768px]:px-6 max-[768px]:py-3 max-[768px]:border-[3px]
              max-[480px]:w-full
            "
          >
            <option className="bg-[#0a4834] text-white" value="">
              Max Çmimi
            </option>
            {maxPriceOptions.map((price) => (
              <option
                key={price}
                value={String(price)}
                className="bg-[#0a4834] text-white"
              >
                {price.toLocaleString("en-US")}
              </option>
            ))}
          </select>

          {/* Bedrooms */}
          <select
            name="bedrooms"
            value={filters.bedrooms}
            onChange={handleInputChange}
            className="
              px-10 py-2 text-white font-text font-bold text-lg md:text-xl
              border-4 border-[#9f8151] rounded bg-white/10
              focus:outline-none focus:ring-2 focus:ring-yellow-500
              max-[1024px]:px-8 max-[1024px]:text-[16px]
              max-[768px]:w-[22rem] max-[768px]:px-6 max-[768px]:py-3 max-[768px]:border-[3px]
              max-[480px]:w-full
            "
          >
            <option className="bg-[#0a4834] text-white" value="">
              Dhomat
            </option>
            {[1, 2, 3, 4, 5, 6, 7].map((n) => (
              <option
                key={n}
                value={String(n)}
                className="bg-[#0a4834] text-white"
              >
                {n}
              </option>
            ))}
            <option value="8+" className="bg-[#0a4834] text-white">
              8+
            </option>
          </select>

          {/* Search button */}
          <button
            onClick={handleSearch}
            className="
              bg-[#0a4834] text-[#9f8151] font-text font-bold
              text-lg md:text-xl px-10 py-2 rounded transition-all
              hover:bg-[#073627] hover:text-[#d4b505]
              focus:outline-none focus:ring-2 focus:ring-yellow-500
              max-[768px]:w-[22rem] max-[768px]:py-3
              max-[480px]:w-full
            "
          >
            Kerko
          </button>
        </div>
      </div>
    </section>
  );
};

export default MainSection;
