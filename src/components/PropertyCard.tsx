import React from "react";
import { useNavigate } from "react-router-dom";
import { IoBedOutline } from "react-icons/io5";
import { PiBathtub } from "react-icons/pi";
import { MdSquareFoot, MdMeetingRoom } from "react-icons/md";
import { SiLevelsdotfyi } from "react-icons/si";

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

interface PropertyCardProps {
  property: Property;
  onClick: () => void;
}

const PropertyCard: React.FC<PropertyCardProps> = ({ property, onClick }) => {
  const getPropertyTypeName = (propertyType: string) => {
    const typeMapping: Record<string, string> = {
      house: "Shtëpi",
      apartment: "Banesa",
      office: "Zyrë",
      store: "Lokal",
      land: "Toka",
      building: "Objekte",
    };
    return typeMapping[propertyType.toLowerCase()] || propertyType;
  };

  const renderIcons = () => {
    const type = property.propertyType.toLowerCase();
    
    const iconStyle = "text-lg text-muted-foreground";
    const containerStyle = "flex flex-col items-center text-center";
    const labelStyle = "text-xs text-muted-foreground mt-1";
    const valueStyle = "text-sm font-medium";

    switch (type) {
      case "house":
      case "apartment":
        return (
          <>
            <div className={containerStyle}>
              <IoBedOutline className={iconStyle} />
              <span className={valueStyle}>{property.bedrooms || "-"}</span>
              <p className={labelStyle}>Dhoma</p>
            </div>
            <div className={containerStyle}>
              <PiBathtub className={iconStyle} />
              <span className={valueStyle}>{property.bathrooms || "-"}</span>
              <p className={labelStyle}>Banjo</p>
            </div>
            <div className={containerStyle}>
              <SiLevelsdotfyi className={iconStyle} />
              <span className={valueStyle}>{property.floorLevel || "-"}</span>
              <p className={labelStyle}>{type === "house" ? "Katet" : "Kati"}</p>
            </div>
            <div className={containerStyle}>
              <MdSquareFoot className={iconStyle} />
              <span className={valueStyle}>{property.squareFeet || "-"}m²</span>
              <p className={labelStyle}>Sipërfaqja</p>
            </div>
          </>
        );

      case "office":
      case "store":
        return (
          <>
            <div className={containerStyle}>
              <MdMeetingRoom className={iconStyle} />
              <span className={valueStyle}>{property.spaces || "-"}</span>
              <p className={labelStyle}>Hapësirat</p>
            </div>
            <div className={containerStyle}>
              <PiBathtub className={iconStyle} />
              <span className={valueStyle}>{property.bathrooms || "-"}</span>
              <p className={labelStyle}>Banjo</p>
            </div>
            <div className={containerStyle}>
              <SiLevelsdotfyi className={iconStyle} />
              <span className={valueStyle}>{property.floorLevel || "-"}</span>
              <p className={labelStyle}>Kati</p>
            </div>
            <div className={containerStyle}>
              <MdSquareFoot className={iconStyle} />
              <span className={valueStyle}>{property.squareFeet || "-"}m²</span>
              <p className={labelStyle}>Sipërfaqja</p>
            </div>
          </>
        );

      case "land":
        return (
          <div className={`${containerStyle} col-span-4 justify-center`}>
            <MdSquareFoot className={iconStyle} />
            <span className={valueStyle}>{property.squareFeet || "-"}m²</span>
            <p className={labelStyle}>Sipërfaqja</p>
          </div>
        );

      case "building":
        return (
          <>
            <div className={containerStyle}>
              <MdMeetingRoom className={iconStyle} />
              <span className={valueStyle}>{property.spaces || "-"}</span>
              <p className={labelStyle}>Hapësirat</p>
            </div>
            <div className={containerStyle}>
              <SiLevelsdotfyi className={iconStyle} />
              <span className={valueStyle}>{property.floorLevel || "-"}</span>
              <p className={labelStyle}>Kati</p>
            </div>
            <div className={containerStyle}>
              <MdSquareFoot className={iconStyle} />
              <span className={valueStyle}>{property.squareFeet || "-"}m²</span>
              <p className={labelStyle}>Sipërfaqja</p>
            </div>
          </>
        );

      default:
        return null;
    }
  };

  return (
    <div
      onClick={onClick}
      className="relative cursor-pointer bg-card border border-border rounded-lg overflow-hidden 
                 shadow-sm hover:shadow-md hover:transform hover:-translate-y-1 transition-all duration-300"
    >
      {/* Tags */}
      <span className="absolute top-3 left-3 z-10 bg-orange-500 text-white px-2 py-1 text-xs font-bold rounded">
        {property.isForSale ? "SHITJE" : "QERA"}
      </span>
      <span className="absolute top-3 right-3 z-10 bg-real-estate-secondary text-white px-2 py-1 text-xs font-bold rounded">
        {getPropertyTypeName(property.propertyType)}
      </span>

      {/* Image */}
      <div className="relative h-48 overflow-hidden">
        <img
          src={
            property.images?.[0]?.imageUrl ||
            "https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=800"
          }
          alt={property.title}
          className="w-full h-full object-cover"
          loading="lazy"
        />
      </div>

      {/* Details */}
      <div className="p-4">
        <h3 className="font-text text-sm text-muted-foreground">{property.city}</h3>
        <p className="font-text text-base font-bold text-foreground mb-1">{property.title}</p>
        <p className="font-text text-xl text-real-estate-secondary font-light mb-3">
          €{property.price.toLocaleString()}
        </p>

        {/* Separator */}
        <hr className="border-border mb-3" />

        {/* Icons Grid */}
        <div className="grid grid-cols-4 gap-2">
          {renderIcons()}
        </div>
      </div>
    </div>
  );
};

export default PropertyCard;