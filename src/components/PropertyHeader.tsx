import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FiHome } from "react-icons/fi";
import { GoSearch } from "react-icons/go";
import { BsShopWindow } from "react-icons/bs";
import {
  PiBuildingApartment,
  PiBuildingOffice,
  PiWarehouse,
} from "react-icons/pi";
import { TbBuildingSkyscraper, TbChartArea } from "react-icons/tb";
import AreaFilter from "./AreaFilter";
import PriceFilter from "./PriceFilter";
import logoImage from "../assets/LogoMainSection.png";

interface PropertyHeaderProps {
  setFilters: React.Dispatch<React.SetStateAction<any>>;
}

const PropertyHeader: React.FC<PropertyHeaderProps> = ({ setFilters }) => {
  const [selectedPropertyType, setSelectedPropertyType] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [isActiveSell, setIsActiveSell] = useState(false);
  const [isActiveRent, setIsActiveRent] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 90);
    onScroll();
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const searchValue = event.target.value;
    setSearch(searchValue);
    setFilters((prev: any) => ({ ...prev, search: searchValue }));
  };

  const handleSellButtonClick = () => {
    const next = !isActiveSell;
    setIsActiveSell(next);
    setIsActiveRent(false);
    setFilters((old: any) => ({ ...old, isForSale: next ? true : null }));
  };

  const handleRentButtonClick = () => {
    const next = !isActiveRent;
    setIsActiveRent(next);
    setIsActiveSell(false);
    setFilters((old: any) => ({ ...old, isForSale: next ? false : null }));
  };

  const handlePropertyTypeFilter = (type: string) => {
    const next = selectedPropertyType === type ? null : type;
    setSelectedPropertyType(next);
    setFilters((old: any) => ({ ...old, propertyType: next }));
  };

  const propertyTypes = [
    { type: "House", icon: <FiHome />, label: "Shtëpi" },
    { type: "Apartment", icon: <PiBuildingApartment />, label: "Banesë" },
    { type: "Office", icon: <PiBuildingOffice />, label: "Zyrë" },
    { type: "Store", icon: <BsShopWindow />, label: "Lokal" },
    { type: "Land", icon: <TbChartArea />, label: "Tokë" },
    { type: "Warehouse", icon: <PiWarehouse />, label: "Depo" },
    { type: "Building", icon: <TbBuildingSkyscraper />, label: "Objekt" },
  ];

  return (
    <div
      className="sticky top-0 z-50 bg-transparent transition-colors duration-500"
    >
      <div className="border-b border-white/10 bg-real-estate-primary shadow-lg">
        <div className="mx-auto flex max-w-7xl flex-col gap-3 px-4 py-3 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center justify-center gap-4 md:justify-start">
            <button
              onClick={() => navigate("/")}
              className="flex shrink-0 items-center justify-center gap-3"
              aria-label="Go to home page"
            >
              <img src={logoImage} alt="REALO Logo" className="h-12 w-auto md:h-11" />
              <span
                className="hidden font-title text-sm tracking-[0.18em] text-real-estate-secondary transition-colors sm:inline"
              >
                REAL ESTATE
              </span>
            </button>
            <button
              onClick={() => navigate("/contact-us")}
              className={`hidden rounded-md px-4 py-2 text-sm font-semibold uppercase tracking-[0.14em] transition-colors sm:inline-flex ${
                "bg-real-estate-secondary text-real-estate-primary hover:bg-white"
              }`}
            >
              Ofroni Pronën
            </button>
          </div>

          <div className="relative w-full md:max-w-md">
            <input
              type="search"
              placeholder="Kërko sipas qytetit ose emrit të pronës"
              value={search}
              onChange={handleSearchChange}
              className="w-full rounded-md border border-real-estate-primary/15 bg-white py-2.5 pl-4 pr-11 text-sm outline-none transition focus:border-real-estate-secondary"
            />
            <GoSearch className="absolute right-4 top-1/2 -translate-y-1/2 text-real-estate-primary/55" />
          </div>
        </div>
      </div>

      <div className="bg-transparent px-2 pb-3 pt-2">
        <div
          className={`mx-auto max-w-7xl rounded-xl border px-2 py-2 shadow-sm backdrop-blur-xl transition-all duration-500 md:px-4 lg:grid lg:grid-cols-[auto_1fr_auto] lg:items-center lg:gap-4 ${
            "border-real-estate-secondary/45 bg-transparent"
          }`}
        >
          <div className="order-1 grid grid-cols-7 gap-1 md:flex md:items-center md:justify-center md:gap-3 lg:order-2 lg:min-w-0 lg:justify-center lg:gap-2 xl:gap-4">
            {propertyTypes.map(({ type, icon, label }) => {
              const selected = selectedPropertyType === type;
              return (
                <button
                  key={type}
                  type="button"
                  onClick={() => handlePropertyTypeFilter(type)}
                  aria-pressed={selected}
                  className={`flex min-w-0 flex-col items-center justify-center gap-1 rounded-md px-1 py-1.5 text-[10px] font-semibold transition sm:text-xs md:min-w-[64px] md:px-2 md:text-sm ${
                    selected
                      ? "bg-real-estate-secondary text-real-estate-primary"
                      : "text-white drop-shadow hover:text-real-estate-secondary"
                  }`}
                >
                  <span className="text-[18px] leading-none sm:text-xl md:text-2xl">{icon}</span>
                  <span className="max-w-full truncate">{label}</span>
                </button>
              );
            })}
          </div>

          <div className="order-2 mt-2 grid grid-cols-4 gap-2 md:flex md:items-center md:justify-center md:gap-3 lg:contents">
            <div className="contents md:flex md:gap-3 lg:order-1 lg:flex lg:justify-start">
              <button
                onClick={handleSellButtonClick}
                className={`min-w-0 rounded-full border px-2 py-2 text-xs font-semibold transition sm:text-sm md:px-5 md:py-2.5 ${
                  isActiveSell
                    ? "border-real-estate-secondary bg-real-estate-secondary text-real-estate-primary"
                    : "border-white/45 bg-transparent text-white hover:border-real-estate-secondary"
                }`}
              >
                Në shitje
              </button>
              <button
                onClick={handleRentButtonClick}
                className={`min-w-0 rounded-full border px-2 py-2 text-xs font-semibold transition sm:text-sm md:px-5 md:py-2.5 ${
                  isActiveRent
                    ? "border-real-estate-secondary bg-real-estate-secondary text-real-estate-primary"
                    : "border-white/45 bg-transparent text-white hover:border-real-estate-secondary"
                }`}
              >
                Me qira
              </button>
            </div>
            <div className="contents md:flex md:gap-2 lg:order-3 lg:flex lg:justify-end">
              <AreaFilter
                className="min-w-0"
                scrolled={true}
                applyAreaFilter={(minArea, maxArea) =>
                  setFilters((old: any) => ({
                    ...old,
                    minArea: minArea === null ? "" : String(minArea),
                    maxArea: maxArea === null ? "" : String(maxArea),
                  }))
                }
              />
              <PriceFilter
                className="min-w-0"
                scrolled={true}
                applyPriceFilter={(minPrice, maxPrice) =>
                  setFilters((old: any) => ({
                    ...old,
                    minPrice: minPrice === null ? "" : String(minPrice),
                    maxPrice: maxPrice === null ? "" : String(maxPrice),
                  }))
                }
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PropertyHeader;
