import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { ImSortAlphaAsc, ImSortAlphaDesc } from "react-icons/im";
import { MdSortByAlpha } from "react-icons/md";
import PropertyCard from "./PropertyCard";

interface Property {
  propertyId: string;
  title: string;
  city: string;
  price: number;
  propertyType: string;
  isForSale: boolean;
  bedrooms?: number;
  bathrooms?: number;
  floorLevel?: number | string;
  squareFeet?: number;
  spaces?: number;
  images?: Array<{ imageUrl: string }>;
}

interface PropertyListProps {
  filters: {
    propertyType: string;
    minPrice: string;
    maxPrice: string;
    bedrooms: string;
    bathrooms?: string;
    minArea: string;
    maxArea: string;
    isForSale: boolean | null;
    search: string;
  };
}

const PropertyList: React.FC<PropertyListProps> = ({ filters }) => {
  const [filteredProperties, setFilteredProperties] = useState<Property[]>([]);
  const [properties, setProperties] = useState<Property[]>([]);
  const [sortOrder, setSortOrder] = useState(0);
  const navigate = useNavigate();

  const handlePropertyClick = (property: Property) => {
    navigate(`/properties/${property.title}/${property.propertyId}`);
  };

  // Fetch all properties from API
  useEffect(() => {
    const fetchProperties = async () => {
      try {
        const response = await axios.get(
          "https://realo-realestate.com/api/api/Property/GetProperties"
        );
        setProperties(response.data || []);
        setFilteredProperties(response.data || []);
      } catch (error) {
        console.error("Error fetching properties:", error);
      }
    };
    fetchProperties();
  }, []);

  // Sort function
  const handleSort = () => {
    let newOrder: number;
    let newItems: Property[];

    if (sortOrder === 0) {
      newOrder = 1;
      newItems = [...filteredProperties].sort((a, b) =>
        String(a.propertyId).localeCompare(String(b.propertyId))
      );
    } else if (sortOrder === 1) {
      newOrder = 2;
      newItems = [...filteredProperties].sort((a, b) =>
        String(b.propertyId).localeCompare(String(a.propertyId))
      );
    } else {
      newOrder = 0;
      newItems = [...properties];
    }

    setSortOrder(newOrder);
    setFilteredProperties(newItems);
  };

  // Apply filters when they change
  useEffect(() => {
    let filteredData = properties;

    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filteredData = filteredData.filter(
        (property) =>
          property.title.toLowerCase().includes(searchLower) ||
          property.city.toLowerCase().includes(searchLower)
      );
    }

    if (filters.propertyType) {
      filteredData = filteredData.filter(
        (property) => property.propertyType === filters.propertyType
      );
    }

    if (filters.minPrice) {
      filteredData = filteredData.filter(
        (property) => property.price >= parseInt(filters.minPrice)
      );
    }

    if (filters.maxPrice) {
      filteredData = filteredData.filter(
        (property) => property.price <= parseInt(filters.maxPrice)
      );
    }

    if (filters.bedrooms) {
      filteredData = filteredData.filter(
        (property) => property.bedrooms === parseInt(filters.bedrooms)
      );
    }

    if (filters.bathrooms) {
      filteredData = filteredData.filter(
        (property) => property.bathrooms === parseInt(filters.bathrooms)
      );
    }

    if (filters.minArea) {
      filteredData = filteredData.filter(
        (property) => property.squareFeet && property.squareFeet >= parseInt(filters.minArea)
      );
    }

    if (filters.maxArea) {
      filteredData = filteredData.filter(
        (property) => property.squareFeet && property.squareFeet <= parseInt(filters.maxArea)
      );
    }

    if (filters.isForSale !== null) {
      filteredData = filteredData.filter(
        (property) => property.isForSale === filters.isForSale
      );
    }

    setFilteredProperties(filteredData);
  }, [filters, properties]);

  return (
    <div className="pt-40 px-5 pb-10 bg-background min-h-screen">
      {/* Sort Button */}
      <div className="flex justify-start mb-6">
        <button
          onClick={handleSort}
          className="flex items-center gap-2 px-4 py-2 bg-background border border-border rounded-lg hover:bg-accent transition-colors"
        >
          <span className="font-title">Sort</span>
          {sortOrder === 1 ? (
            <ImSortAlphaAsc />
          ) : sortOrder === 2 ? (
            <ImSortAlphaDesc />
          ) : (
            <MdSortByAlpha />
          )}
        </button>
      </div>

      {/* Property Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-7xl mx-auto">
        {filteredProperties.length > 0 ? (
          filteredProperties.map((property) => (
            <PropertyCard
              key={property.propertyId}
              property={property}
              onClick={() => handlePropertyClick(property)}
            />
          ))
        ) : (
          <div className="col-span-full text-center py-20">
            <p className="text-muted-foreground text-lg">
              No properties found for the selected filters.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default PropertyList;