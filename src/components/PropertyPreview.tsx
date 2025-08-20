import React, { useRef, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { IoIosArrowBack, IoIosArrowForward } from "react-icons/io";
import { IoBedOutline } from "react-icons/io5";
import { PiBathtub } from "react-icons/pi";
import { MdSquareFoot } from "react-icons/md";
import { SiLevelsdotfyi } from "react-icons/si";
import { MdMeetingRoom } from "react-icons/md";
import { Button } from "@/components/ui/button";

interface Property {
  propertyId: string;
  title: string;
  city: string;
  price: number;
  propertyType: string;
  isForSale: boolean;
  bedrooms?: number;
  bathrooms?: number;
  floorLevel?: number;
  squareFeet?: number;
  spaces?: number;
  images?: Array<{ imageUrl: string }>;
}

const PropertyPreview = () => {
  const navigate = useNavigate();
  const propertyGridRef = useRef<HTMLDivElement>(null);
  const [properties, setProperties] = useState<Property[]>([]);

  // Fetch all properties from API
  useEffect(() => {
    const fetchProperties = async () => {
      try {
        const response = await axios.get(
          "https://realo-realestate.com/api/api/Property/GetProperties"
        );
        setProperties(response.data); // Set the fetched properties
      } catch (error) {
        console.error("Error fetching properties:", error);
        // Set some mock data for demo purposes
        setProperties([
          {
            propertyId: "1",
            title: "Beautiful Apartment in Downtown",
            city: "Prishtinë",
            price: 150000,
            propertyType: "apartment",
            isForSale: true,
            bedrooms: 3,
            bathrooms: 2,
            floorLevel: 5,
            squareFeet: 120,
            images: [{ imageUrl: "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=400" }]
          },
          {
            propertyId: "2", 
            title: "Modern House with Garden",
            city: "Prishtinë",
            price: 280000,
            propertyType: "house",
            isForSale: true,
            bedrooms: 4,
            bathrooms: 3,
            floorLevel: 2,
            squareFeet: 250,
            images: [{ imageUrl: "https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=400" }]
          },
          {
            propertyId: "3",
            title: "Commercial Office Space",
            city: "Prishtinë", 
            price: 200000,
            propertyType: "office",
            isForSale: false,
            spaces: 6,
            bathrooms: 2,
            floorLevel: 3,
            squareFeet: 180,
            images: [{ imageUrl: "https://images.unsplash.com/photo-1497366216548-37526070297c?w=400" }]
          }
        ]);
      }
    };
    fetchProperties();
  }, []);

  const handlePropertyClick = (property: Property) => {
    navigate(`/properties/${property.title}/${property.propertyId}`);
  };
  
  const getPropertyTypeName = (propertyType: string) => {
    const typeMapping: { [key: string]: string } = {
      house: "Shtëpi",
      apartment: "Banesa",
      office: "Zyrë",
      store: "Lokal",
      land: "Toka",
      building: "Objekte",
    };

    // Return the mapped name or the original type if not found
    return typeMapping[propertyType.toLowerCase()] || propertyType;
  };

  const scrollLeft = () => {
    if (propertyGridRef.current) {
      propertyGridRef.current.scrollBy({
        left: -propertyGridRef.current.clientWidth,
        behavior: "smooth",
      });
    }
  };

  const scrollRight = () => {
    if (propertyGridRef.current) {
      propertyGridRef.current.scrollBy({
        left: propertyGridRef.current.clientWidth,
        behavior: "smooth",
      });
    }
  };

  const handleViewMore = () => {
    navigate("/Property");
  };

  const renderIcons = (property: Property) => {
    switch (property.propertyType.toLowerCase()) {
      case "house":
      case "apartment":
        return (
          <>
            <div className="flex items-center gap-1 text-sm text-gray-600">
              <IoBedOutline /> {property.bedrooms} Dhoma
            </div>
            <div className="flex items-center gap-1 text-sm text-gray-600">
              <PiBathtub /> {property.bathrooms} Banjo
            </div>
            <div className="flex items-center gap-1 text-sm text-gray-600">
              <SiLevelsdotfyi /> {property.floorLevel} Kati
            </div>
            <div className="flex items-center gap-1 text-sm text-gray-600">
              <MdSquareFoot /> {property.squareFeet}m²
            </div>
          </>
        );

      case "office":
      case "store":
        return (
          <>
            <div className="flex items-center gap-1 text-sm text-gray-600">
              <MdMeetingRoom /> {property.spaces} Hapësira
            </div>
            <div className="flex items-center gap-1 text-sm text-gray-600">
              <PiBathtub /> {property.bathrooms} Banjo
            </div>
            <div className="flex items-center gap-1 text-sm text-gray-600">
              <SiLevelsdotfyi /> {property.floorLevel} Kati
            </div>
            <div className="flex items-center gap-1 text-sm text-gray-600">
              <MdSquareFoot /> {property.squareFeet}m²
            </div>
          </>
        );

      case "land":
        return (
          <div className="flex items-center gap-1 text-sm text-gray-600">
            <MdSquareFoot /> {property.squareFeet}m²
          </div>
        );

      case "building":
        return (
          <>
            <div className="flex items-center gap-1 text-sm text-gray-600">
              <MdMeetingRoom /> {property.spaces} Hapësira
            </div>
            <div className="flex items-center gap-1 text-sm text-gray-600">
              <SiLevelsdotfyi /> {property.floorLevel} Kati
            </div>
            <div className="flex items-center gap-1 text-sm text-gray-600">
              <MdSquareFoot /> {property.squareFeet}m²
            </div>
          </>
        );

      default:
        return null;
    }
  };

  return (
    <section className="relative px-5 py-10 bg-real-estate-accent overflow-hidden">
      <div className="text-center mb-8">
        <div className="flex justify-center items-center gap-2 font-title">
          <h1 className="text-4xl md:text-5xl font-light text-gray-700">REALO's</h1>
          <h3 className="text-3xl md:text-4xl font-light text-gray-700">New Properties</h3>
        </div>
        <hr className="w-24 mx-auto mt-4 border-gray-400" />
      </div>

      <button 
        className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-transparent text-black border-none p-2 rounded-full cursor-pointer text-2xl z-30"
        onClick={scrollLeft}
      >
        <IoIosArrowBack />
      </button>
      <button 
        className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-transparent text-black border-none p-2 rounded-full cursor-pointer text-2xl z-30"
        onClick={scrollRight}
      >
        <IoIosArrowForward />
      </button>

      <div 
        className="flex gap-5 overflow-x-auto scroll-smooth pb-5 overflow-hidden"
        ref={propertyGridRef}
      >
        {properties.map((property) => (
          <div
            className="flex-none w-60 border border-gray-300 rounded-lg overflow-hidden shadow-card transition-transform hover:shadow-hover hover:-translate-y-1 bg-white relative cursor-pointer"
            key={property.propertyId}
            onClick={() => handlePropertyClick(property)}
          >
            <span className="absolute top-2 left-2 bg-orange-600 text-white px-2 py-1 text-xs font-bold font-text rounded z-20">
              {property.isForSale ? "SHITJE" : "QERA"}
            </span>
            <span className="absolute top-2 right-2 bg-real-estate-primary text-white px-2 py-1 text-xs font-bold font-text rounded z-20">
              {getPropertyTypeName(property.propertyType)}
            </span>
            <div className="relative overflow-hidden h-44">
              <img
                src={property.images?.[0]?.imageUrl || "https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=400"}
                alt={property.title}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="p-4 text-left">
              <h3 className="font-text text-sm text-gray-500">{property.city}</h3>
              <p className="font-text text-base font-bold mb-1 text-gray-800">{property.title}</p>
              <p className="font-text text-xl text-real-estate-secondary font-light mt-1">
                €{property.price.toLocaleString()}
              </p>
              <div className="flex flex-wrap justify-between mt-2 gap-1">
                {renderIcons(property)}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="text-center mt-8">
        <Button 
          onClick={handleViewMore} 
          className="bg-gray-600 text-white px-5 py-2 border-none rounded font-text text-lg cursor-pointer transition-colors hover:bg-gray-800"
        >
          Shikoni Të Gjitha Pronat
        </Button>
      </div>
    </section>
  );
};

export default PropertyPreview;