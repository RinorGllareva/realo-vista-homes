import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FiHome } from "react-icons/fi";
import { PiBuildingOffice, PiWarehouse, PiBuildingApartment } from "react-icons/pi";
import { BsShopWindow } from "react-icons/bs";
import { TbBuildingSkyscraper, TbChartArea } from "react-icons/tb";
import { GoSearch } from "react-icons/go";
import { IoFilterOutline } from "react-icons/io5";
import logoImage from "../assets/LogoMainSection.png";

interface PropertyHeaderProps {
  setFilters: React.Dispatch<React.SetStateAction<any>>;
}

const PropertyHeader: React.FC<PropertyHeaderProps> = ({ setFilters }) => {
  const [selectedPropertyType, setSelectedPropertyType] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [isActiveSell, setIsActiveSell] = useState(false);
  const [isActiveRent, setIsActiveRent] = useState(false);
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
    setIsActiveSell(prev => {
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
    setIsActiveRent(prev => {
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
    setSelectedPropertyType(prevType => {
      const newType = prevType === type ? null : type;
      setFilters((prevFilters: any) => ({
        ...prevFilters,
        propertyType: newType,
      }));
      return newType;
    });
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
        <div className="flex items-center gap-2 cursor-pointer" onClick={handleHomeRedirect}>
          <img src={logoImage} alt="Real Estate Logo" className="w-32" />
          <h3 className="font-title text-lg text-real-estate-secondary">REAL-ESTATE</h3>
        </div>

        <div className="relative flex-1 max-w-md mx-8">
          <input
            type="search"
            placeholder="Kërko..."
            value={search}
            onChange={handleSearchChange}
            className="w-full pl-4 pr-12 py-2 rounded-full border border-border bg-background text-foreground"
          />
          <GoSearch className="absolute right-4 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
        </div>

        <button
          onClick={handleRedirect}
          className="bg-real-estate-dark hover:bg-real-estate-secondary text-real-estate-secondary hover:text-real-estate-primary 
                     border border-real-estate-secondary rounded-full px-6 py-2 font-medium transition-colors"
        >
          Ofroni Pronën Tuaj
        </button>
      </div>

      {/* Bottom Header */}
      <div className="flex justify-between items-center bg-muted px-5 py-4">
        <div className="flex gap-4">
          <button
            onClick={handleSellButtonClick}
            className={`px-6 py-2 rounded-full font-medium transition-all ${
              isActiveSell
                ? "bg-orange-500 text-white border-orange-500"
                : "bg-background text-foreground border border-border hover:bg-accent"
            }`}
          >
            Në Shitje
          </button>
          <button
            onClick={handleRentButtonClick}
            className={`px-6 py-2 rounded-full font-medium transition-all ${
              isActiveRent
                ? "bg-real-estate-secondary text-white border-real-estate-secondary"
                : "bg-background text-foreground border border-border hover:bg-accent"
            }`}
          >
            Me Qera
          </button>
        </div>

        <div className="flex gap-6">
          {propertyTypes.map(({ type, icon, label }) => (
            <div
              key={type}
              onClick={() => handlePropertyTypeFilter(type)}
              className={`flex flex-col items-center cursor-pointer p-3 rounded-lg transition-all ${
                selectedPropertyType === type
                  ? "bg-accent shadow-md transform -translate-y-1"
                  : "hover:bg-accent/50 hover:transform hover:-translate-y-1"
              }`}
            >
              <span className="text-2xl mb-1">{icon}</span>
              <p className="text-sm font-medium">{label}</p>
            </div>
          ))}
        </div>

        <div className="flex gap-4">
          <button className="flex items-center gap-2 px-6 py-2 bg-background border border-border rounded-full hover:bg-accent transition-colors">
            <IoFilterOutline />
            Filter
          </button>
        </div>
      </div>
    </div>
  );
};

export default PropertyHeader;