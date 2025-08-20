import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const MainSection = () => {
  const [filters, setFilters] = useState({
    propertyType: "",
    minPrice: "",
    maxPrice: "",
    bedrooms: "",
  });

  const navigate = useNavigate();

  // Handle the change in the filter input
  const handleInputChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFilters({
      ...filters,
      [name]: value,
    });
  };

  const handleSearch = () => {
    const queryParams = new URLSearchParams(filters).toString();
    navigate(`/Property?${queryParams}`); // Redirect to /Property page with filters as query params
  };

  const minPriceOptions = [
    300, 1000, 5000, 10000, 20000, 30000, 50000, 75000, 100000, 200000, 300000,
    400000, 500000, 600000, 700000, 800000, 900000, 1000000, 1500000, 2000000,
    2500000, 3000000, 3500000, 4000000, 4500000, 5000000, 6000000, 7000000,
    8000000, 9000000,
  ];

  const maxPriceOptions = [
    300, 1000, 5000, 10000, 20000, 30000, 50000, 75000, 100000, 200000, 300000,
    400000, 500000, 600000, 700000, 800000, 900000, 1000000, 1500000, 2000000,
    2500000, 3000000, 3500000, 4000000, 4500000, 5000000, 6000000, 7000000,
    8000000, 9000000,
  ];

  return (
    <div className="relative h-screen flex justify-center items-center text-white">
      {/* Video Background */}
      <video 
        className="absolute top-0 left-0 w-full h-full object-cover -z-10"
        autoPlay 
        loop 
        muted
        playsInline
      >
        <source src="/Prishtina - Made with Clipchamp.mp4" type="video/mp4" />
      </video>

      <div className="absolute top-0 left-0 w-full h-full bg-gradient-hero z-0"></div>

      <div className="absolute bottom-72 text-center z-20">
        <div className="flex justify-center items-center gap-3 mb-4">
          <h3 className="font-text text-4xl md:text-5xl font-normal text-yellow-400">WELCOME TO</h3>
          <h1 className="font-title text-5xl md:text-7xl font-normal text-yellow-400">REALO</h1>
          <h3 className="font-text text-4xl md:text-5xl font-normal text-yellow-400">REAL ESTATE</h3>
        </div>
      </div>

      {/* Filters Section */}
      <div className="absolute bottom-16 text-center w-full z-20 flex flex-col items-center px-4">
        <div className="mb-2">
          <h3 className="font-text text-lg md:text-xl text-white text-left ml-5 mb-1">
            Prona juaj ideale në Prishtinë…
          </h3>
        </div>
        
        <div className="flex flex-col md:flex-row gap-3 max-w-4xl">
          <select
            name="propertyType"
            value={filters.propertyType}
            onChange={handleInputChange}
            className="px-8 py-2 text-white font-text font-bold text-lg md:text-xl border-4 border-yellow-600 rounded bg-white/10 focus:outline-none focus:ring-2 focus:ring-yellow-500"
          >
            <option value="" className="bg-real-estate-primary text-white">Lloji i pronës</option>
            <option value="House" className="bg-real-estate-primary text-white">Shtëpi</option>
            <option value="Apartment" className="bg-real-estate-primary text-white">Banesa</option>
            <option value="Land" className="bg-real-estate-primary text-white">Troje</option>
            <option value="Store" className="bg-real-estate-primary text-white">Lokale</option>
            <option value="Warehouse" className="bg-real-estate-primary text-white">Depo</option>
            <option value="Building" className="bg-real-estate-primary text-white">Objekte</option>
            <option value="Office" className="bg-real-estate-primary text-white">Zyre</option>
          </select>

          <select
            name="minPrice"
            value={filters.minPrice}
            onChange={handleInputChange}
            className="px-8 py-2 text-white font-text font-bold text-lg md:text-xl border-4 border-yellow-600 rounded bg-white/10 focus:outline-none focus:ring-2 focus:ring-yellow-500"
          >
            <option value="" className="bg-real-estate-primary text-white">Min Çmimi</option>
            {minPriceOptions.map((price) => (
              <option key={price} value={price} className="bg-real-estate-primary text-white">
                {price.toLocaleString("en-US")}
              </option>
            ))}
          </select>

          <select
            name="maxPrice"
            value={filters.maxPrice}
            onChange={handleInputChange}
            className="px-8 py-2 text-white font-text font-bold text-lg md:text-xl border-4 border-yellow-600 rounded bg-white/10 focus:outline-none focus:ring-2 focus:ring-yellow-500"
          >
            <option value="" className="bg-real-estate-primary text-white">Max Çmimi</option>
            {maxPriceOptions.map((price) => (
              <option key={price} value={price} className="bg-real-estate-primary text-white">
                {price.toLocaleString("en-US")}
              </option>
            ))}
          </select>

          <select
            name="bedrooms"
            value={filters.bedrooms}
            onChange={handleInputChange}
            className="px-8 py-2 text-white font-text font-bold text-lg md:text-xl border-4 border-yellow-600 rounded bg-white/10 focus:outline-none focus:ring-2 focus:ring-yellow-500"
          >
            <option value="" className="bg-real-estate-primary text-white">Dhomat</option>
            <option value="1" className="bg-real-estate-primary text-white">1</option>
            <option value="2" className="bg-real-estate-primary text-white">2</option>
            <option value="3" className="bg-real-estate-primary text-white">3</option>
            <option value="4" className="bg-real-estate-primary text-white">4</option>
            <option value="5" className="bg-real-estate-primary text-white">5</option>
            <option value="6" className="bg-real-estate-primary text-white">6</option>
            <option value="7" className="bg-real-estate-primary text-white">7</option>
            <option value="8+" className="bg-real-estate-primary text-white">8+</option>
          </select>

          <button 
            onClick={handleSearch}
            className="bg-real-estate-primary text-yellow-600 font-text font-bold text-lg md:text-xl px-8 py-2 border-none rounded cursor-pointer transition-all hover:bg-real-estate-primary/80 hover:text-yellow-500"
          >
            Kerko
          </button>
        </div>
      </div>
    </div>
  );
};

export default MainSection;