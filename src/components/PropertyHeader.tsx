import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FiHome } from "react-icons/fi";
import PriceFilter from "./PriceFilter";
import AreaFilter from "./AreaFilter";
import {
  PiBuildingOffice,
  PiWarehouse,
  PiBuildingApartment,
} from "react-icons/pi";
import { BsShopWindow } from "react-icons/bs";
import { TbBuildingSkyscraper, TbChartArea } from "react-icons/tb";
import { GoSearch } from "react-icons/go";
import { IoFilterOutline } from "react-icons/io5";
import logoImage from "../assets/LogoMainSection.png";

interface PropertyHeaderProps {
  setFilters: React.Dispatch<React.SetStateAction<any>>;
}

const PropertyHeader: React.FC<PropertyHeaderProps> = ({ setFilters }) => {
  const [selectedPropertyType, setSelectedPropertyType] = useState<
    string | null
  >(null);
  const [search, setSearch] = useState("");
  const [isActiveSell, setIsActiveSell] = useState(false);
  const [isActiveRent, setIsActiveRent] = useState(false);
  const [showMobileSearch, setShowMobileSearch] = useState(false);
  const navigate = useNavigate();

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const searchValue = e.target.value;
    setSearch(searchValue);
    setFilters((prevFilters: any) => ({
      ...prevFilters,
      search: searchValue,
    }));
  };

  const handleSellButtonClick = () => {
    setIsActiveSell((prev) => {
      const newState = !prev;
      setIsActiveRent(false);
      setFilters((prevFilters: any) => ({
        ...prevFilters,
        isForSale: newState ? true : null,
      }));
      return newState;
    });
  };

  const handleRentButtonClick = () => {
    setIsActiveRent((prev) => {
      const newState = !prev;
      setIsActiveSell(false);
      setFilters((prevFilters: any) => ({
        ...prevFilters,
        isForSale: newState ? false : null,
      }));
      return newState;
    });
  };

  const handlePropertyTypeFilter = (type: string) => {
    const newType = selectedPropertyType === type ? null : type;
    setSelectedPropertyType(newType);
    setFilters((prevFilters: any) => ({
      ...prevFilters,
      propertyType: newType,
    }));
  };

  const applyPriceFilter = (minPrice, maxPrice) => {
    setFilters((prevFilters) => ({
      ...prevFilters,
      minPrice: minPrice || undefined,
      maxPrice: maxPrice || undefined,
    }));
  };

  const applyAreaFilter = (minArea, maxArea) => {
    setFilters((prevFilters) => ({
      ...prevFilters,
      minArea: minArea || undefined,
      maxArea: maxArea || undefined,
    }));
  };

  const handleRedirect = () => navigate("/contact-us");
  const handleHomeRedirect = () => navigate("/");

  const propertyTypes = [
    { type: "House", icon: <FiHome />, label: "Shtëpi" },
    { type: "Apartment", icon: <PiBuildingApartment />, label: "Banesa" },
    { type: "Office", icon: <PiBuildingOffice />, label: "Zyre" },
    { type: "Store", icon: <BsShopWindow />, label: "Lokale" },
    { type: "Land", icon: <TbChartArea />, label: "Troje" },
    { type: "Warehouse", icon: <PiWarehouse />, label: "Depo" },
    { type: "Building", icon: <TbBuildingSkyscraper />, label: "Objekte" },
  ];

  return (
    <div className="fixed top-0 left-0 w-full z-50 bg-background border-b border-border">
      {/* Top Header */}
      <div className="flex justify-between items-center bg-real-estate-primary px-5 py-3">
        <div
          className="flex items-center gap-2 cursor-pointer"
          onClick={handleHomeRedirect}
        >
          <img src={logoImage} alt="Real Estate Logo" className="w-32" />
          <h3 className="font-title text-lg text-real-estate-secondary hidden md:block lg:block">
            REAL-ESTATE
          </h3>
        </div>

        {/* Desktop Search */}
        <div className="relative flex-1 max-w-md mx-8 hidden md:block">
          <input
            type="search"
            placeholder="Kërko..."
            value={search}
            onChange={handleSearchChange}
            className="w-full pl-4 pr-12 py-2 rounded-full border border-border bg-background text-foreground"
          />
          <GoSearch className="absolute right-4 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
        </div>

        {/* Mobile Search Toggle */}
        <div className="md:hidden">
          <button
            onClick={() => setShowMobileSearch(!showMobileSearch)}
            className="p-2 text-real-estate-secondary hover:text-white transition-colors"
          >
            <GoSearch className="w-6 h-6" />
          </button>
        </div>

        {/* Desktop Action Button */}
        <button
          onClick={handleRedirect}
          className="bg-real-estate-dark hover:bg-real-estate-secondary text-real-estate-secondary hover:text-real-estate-primary 
                     border border-real-estate-secondary rounded-full px-6 py-2 font-medium transition-colors hidden md:block"
        >
          Ofroni Pronën Tuaj
        </button>
      </div>

      {/* Mobile Search Bar */}
      {showMobileSearch && (
        <div className="bg-real-estate-primary px-5 py-3 md:hidden">
          <div className="relative">
            <input
              type="search"
              placeholder="Kërko..."
              value={search}
              onChange={handleSearchChange}
              className="w-full pl-4 pr-12 py-2 rounded-full border border-border bg-background text-foreground"
            />
            <GoSearch className="absolute right-4 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
          </div>
        </div>
      )}

      {/* Bottom Header */}
      <div className="flex justify-between items-center bg-muted px-5 py-4 max-[400px]:px-0 py-0">
        {/* Sell/Rent buttons - only on desktop */}
        <div className="hidden md:flex gap-4">
          <button
            onClick={handleSellButtonClick}
            className={`border-gray-400 px-6 py-2 rounded-full font-medium transition-all max-[400px]:px-0${
              isActiveSell
                ? "bg-orange-500 text-white border-orange-500"
                : "bg-background text-foreground border border-border hover:bg-accent "
            }`}
          >
            Në Shitje
          </button>
          <button
            onClick={handleRentButtonClick}
            className={`border-gray-400 px-6 py-2 rounded-full font-medium transition-all ${
              isActiveRent
                ? "bg-real-estate-secondary text-white border-real-estate-secondary"
                : "bg-background text-foreground border border-border hover:bg-accent"
            }`}
          >
            Me Qera
          </button>
        </div>

        {/* Spacer for mobile/tablet */}

        <div className="">
          <div
            className="
            flex items-center justify-between
            bg-transparent rounded-lg px-4 py-3
            transition-all max-[400px]:px-0 py-2
    "
          >
            {propertyTypes.map(({ type, icon, label }) => {
              const isSelected = selectedPropertyType === type;
              return (
                <button
                  key={type}
                  type="button"
                  onClick={() => handlePropertyTypeFilter(type)}
                  aria-pressed={isSelected}
                  className={`
            flex flex-col items-center justify-center 
             px-3 py-2 sm:px-4 sm:py-3
            transition-all
            ${
              isSelected
                ? "bg-accent text-accent-foreground border-transparent shadow-md ring-1 ring-accent/60 -translate-y-0.5"
                : "bg-transparent border-gray-200 hover:bg-accent/40 hover:ring-1 hover:ring-accent/40 hover:-translate-y-0.5"
            }
          `}
                >
                  <span className="mb-1 text-xl sm:text-2xl md:text-3xl leading-none">
                    {icon}
                  </span>
                  <span
                    className="
              text-[11px] sm:text-sm md:text-base font-medium
              text-center leading-tight
            "
                  >
                    {label}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="filter-options-component flex items-center gap-9 px-6 py-4 bg-transparent">
          <div className="hidden lg:block">
            <AreaFilter applyAreaFilter={applyAreaFilter} />
          </div>

          <div className="hidden lg:block">
            <PriceFilter applyPriceFilter={applyPriceFilter} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default PropertyHeader;
