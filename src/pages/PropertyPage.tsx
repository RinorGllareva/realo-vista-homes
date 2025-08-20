import React, { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import PropertyList from "../components/PropertyList";
import PropertyHeader from "../components/PropertyHeader";
import Footer from "../components/Footer";

interface Filters {
  propertyType: string;
  minPrice: string;
  maxPrice: string;
  bedrooms: string;
  minArea: string;
  maxArea: string;
  isForSale: boolean | null;
  search: string;
}

const PropertyPage = () => {
  const [filters, setFilters] = useState<Filters>({
    propertyType: "",
    minPrice: "",
    maxPrice: "",
    bedrooms: "",
    minArea: "",
    maxArea: "",
    isForSale: null,
    search: ""
  });

  const [searchParams] = useSearchParams();

  useEffect(() => {
    setFilters({
      propertyType: searchParams.get("propertyType") || "",
      minPrice: searchParams.get("minPrice") || "",
      maxPrice: searchParams.get("maxPrice") || "",
      bedrooms: searchParams.get("bedrooms") || "",
      isForSale:
        searchParams.get("isForSale") === "true"
          ? true
          : searchParams.get("isForSale") === "false"
          ? false
          : null,
      minArea: searchParams.get("minArea") || "",
      maxArea: searchParams.get("maxArea") || "",
      search: searchParams.get("search") || "",
    });
  }, [searchParams]);

  return (
    <div className="min-h-screen bg-background">
      <PropertyHeader setFilters={setFilters} />
      <PropertyList filters={filters} />
      <Footer />
    </div>
  );
};

export default PropertyPage;