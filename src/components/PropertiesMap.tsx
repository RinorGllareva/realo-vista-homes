import React, { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import { useNavigate } from "react-router-dom";
import { apiUrl, normalizeMediaUrl } from "@/lib/api";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { formatPublicPrice } from "@/lib/price";

// Fix for default marker icons in Leaflet with bundlers
import "leaflet/dist/leaflet.css";

interface Property {
  propertyId: string;
  title: string;
  city: string;
  price: number | string;
  propertyType: string;
  isForSale: boolean;
  isForRent: boolean;
  latitude: number;
  longitude: number;
  images?: Array<{ imageUrl: string }>;
}

// Custom brand marker icon
const createCustomIcon = () => {
  return L.divIcon({
    className: "custom-property-marker",
    html: `
      <svg width="32" height="40" viewBox="0 0 32 40" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M16 0C7.164 0 0 7.164 0 16c0 12 16 24 16 24s16-12 16-24c0-8.836-7.164-16-16-16z" fill="#c9ab03"/>
        <circle cx="16" cy="14" r="6" fill="#0a4834"/>
      </svg>
    `,
    iconSize: [32, 40],
    iconAnchor: [16, 40],
    popupAnchor: [0, -40],
  });
};

const getPropertyTypeName = (propertyType: string) => {
  const typeMapping: Record<string, string> = {
    house: "Shtëpi",
    apartment: "Banesë",
    office: "Zyrë",
    store: "Lokal",
    land: "Tokë",
    warehouse: "Depo",
    building: "Objekt",
  };
  return typeMapping[propertyType.toLowerCase()] || propertyType;
};

const PropertiesMap: React.FC = () => {
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProperties = async () => {
      try {
        const response = await fetch(apiUrl("api/Property/GetProperties"));
        if (!response.ok) throw new Error("Failed to fetch properties");
        const data = await response.json();

        // Filter properties with valid coordinates
        const validProperties = data
          .filter(
            (p: Property) =>
              p.latitude &&
              p.longitude &&
              !isNaN(Number(p.latitude)) &&
              !isNaN(Number(p.longitude)) &&
              (p.isForSale || p.isForRent),
          )
          .slice(0, 60);

        setProperties(validProperties);
      } catch (err) {
        setError("Pronat nuk mund të ngarkohen.");
        console.error("Error fetching properties:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchProperties();
  }, []);

  const handlePropertyClick = (property: Property) => {
    const slug = property.title
      .toLowerCase()
      .replace(/\s+/g, "-")
      .replace(/[^\w-]+/g, "");
    navigate(`/properties/${slug}/${property.propertyId}`);
  };

  const customIcon = createCustomIcon();

  if (loading) {
    return (
      <section className="border-y border-real-estate-secondary/20 bg-real-estate-primary py-12 md:py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-8">
            <h2 className="font-title text-3xl md:text-4xl text-real-estate-secondary mb-2">
              Shfleto pronat në hartë
            </h2>
            <p className="text-white/70">
              Shiko pronat e disponueshme përmes hartës interaktive.
            </p>
          </div>
          <Skeleton className="w-full h-[400px] md:h-[500px] rounded-lg" />
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="border-y border-real-estate-secondary/20 bg-real-estate-primary py-12 md:py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-8">
            <h2 className="font-title text-3xl md:text-4xl text-real-estate-secondary mb-2">
              Shfleto pronat në hartë
            </h2>
          </div>
          <div className="w-full h-[400px] md:h-[500px] rounded-lg bg-muted flex items-center justify-center">
            <p className="text-muted-foreground">{error}</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="border-y border-real-estate-secondary/20 bg-real-estate-primary py-16 md:py-20">
      <div className="container mx-auto px-4">
        <div className="text-center mb-8">
          <h2 className="font-title text-3xl md:text-4xl text-real-estate-secondary mb-2">
            Shfleto pronat në hartë
          </h2>
          <p className="text-gray-400">
            Shiko pronat e disponueshme përmes hartës interaktive.
          </p>
        </div>

        <div className="mx-auto h-[400px] w-full max-w-7xl overflow-hidden rounded-lg border border-real-estate-secondary/30 bg-white p-2 shadow-2xl md:h-[520px]">
          <MapContainer
            center={[42.6629, 21.1655]}
            zoom={11}
            style={{ height: "100%", width: "100%" }}
            scrollWheelZoom={true}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />

            {properties.map((property) => (
              <Marker
                key={property.propertyId}
                position={[
                  Number(property.latitude),
                  Number(property.longitude),
                ]}
                icon={customIcon}
              >
                <Popup className="property-popup">
                  <div className="p-2 min-w-[200px]">
                    {property.images?.[0]?.imageUrl && (
                      <img
                        src={normalizeMediaUrl(property.images[0].imageUrl)}
                        alt={property.title}
                        className="w-full h-24 object-cover rounded mb-2"
                      />
                    )}
                    <h3 className="font-bold text-sm text-foreground mb-1">
                      {property.title}
                    </h3>
                    <p className="text-xs text-muted-foreground mb-1">
                      {property.city}
                    </p>
                    <div className="flex items-center gap-2 mb-2">
                      <span className="bg-real-estate-primary text-real-estate-secondary px-2 py-0.5 text-xs rounded">
                        {property.isForSale ? "Shitje" : "Qira"}
                      </span>
                      <span className="bg-real-estate-secondary text-white px-2 py-0.5 text-xs rounded">
                        {getPropertyTypeName(property.propertyType)}
                      </span>
                    </div>
                    <p className="text-lg font-bold text-real-estate-secondary mb-2">
                      {formatPublicPrice(property.price)}
                    </p>
                    <Button
                      size="sm"
                      className="w-full bg-primary hover:bg-primary/90"
                      onClick={() => handlePropertyClick(property)}
                    >
                      Shiko detajet
                    </Button>
                  </div>
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        </div>

        {/* Section divider */}
        <div className="w-[70%] mx-auto border-t border-[#bdb8a1] mt-10" />
      </div>
    </section>
  );
};

export default PropertiesMap;
