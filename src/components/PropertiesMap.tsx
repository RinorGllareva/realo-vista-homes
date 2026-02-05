import React, { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import { useNavigate } from "react-router-dom";
import { apiUrl } from "@/lib/api";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";

// Fix for default marker icons in Leaflet with bundlers
import "leaflet/dist/leaflet.css";

interface Property {
  propertyId: string;
  title: string;
  city: string;
  price: number;
  propertyType: string;
  isForSale: boolean;
  isForRent: boolean;
  latitude: number;
  longitude: number;
  images?: Array<{ imageUrl: string }>;
}

// Custom red marker icon
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
    apartment: "Banesa",
    office: "Zyrë",
    store: "Lokal",
    land: "Toka",
    building: "Objekte",
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
              (p.isForSale || p.isForRent)
          )
          .slice(0, 60);

        setProperties(validProperties);
      } catch (err) {
        setError("Nuk mund të ngarkoheshin pronat");
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
      <section className="py-12 md:py-16 bg-[#ebe1cf]">
        <div className="container mx-auto px-4">
          <div className="text-center mb-8">
            <h2 className="font-title text-3xl md:text-4xl text-[#7e7859] mb-2">
              Gjeni Pronat në Hartë
            </h2>
            <p className="text-[#888]">
              Shfleto pronat tona në hartë interaktive
            </p>
          </div>
          <Skeleton className="w-full h-[400px] md:h-[500px] rounded-lg" />
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="py-12 md:py-16 bg-[#ebe1cf]">
        <div className="container mx-auto px-4">
          <div className="text-center mb-8">
            <h2 className="font-title text-3xl md:text-4xl text-[#7e7859] mb-2">
              Gjeni Pronat në Hartë
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
    <section className="py-12 md:py-16 bg-real-estate-dark">
      <div className="container mx-auto px-4">
        <div className="text-center mb-8">
          <h2 className="font-title text-3xl md:text-4xl text-real-estate-secondary mb-2">
            Gjeni Pronat në Hartë
          </h2>
          <p className="text-gray-400">
            Shfleto pronat tona në hartë interaktive
          </p>
        </div>

        <div className="w-full h-[400px] md:h-[500px] rounded-lg overflow-hidden shadow-lg">
          <MapContainer
            center={[42.6629, 21.1655]}
            zoom={11}
            style={{ height: "100%", width: "100%" }}
            scrollWheelZoom={true}
          >
            <TileLayer
              attribution='&copy; <a href="https://carto.com/">CARTO</a> &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
            />

            {properties.map((property) => (
              <Marker
                key={property.propertyId}
                position={[Number(property.latitude), Number(property.longitude)]}
                icon={customIcon}
              >
                <Popup className="property-popup">
                  <div className="p-2 min-w-[200px]">
                    {property.images?.[0]?.imageUrl && (
                      <img
                        src={property.images[0].imageUrl}
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
                      <span className="bg-orange-500 text-white px-2 py-0.5 text-xs rounded">
                        {property.isForSale ? "SHITJE" : "QERA"}
                      </span>
                      <span className="bg-real-estate-secondary text-white px-2 py-0.5 text-xs rounded">
                        {getPropertyTypeName(property.propertyType)}
                      </span>
                    </div>
                    <p className="text-lg font-bold text-real-estate-secondary mb-2">
                      €{property.price.toLocaleString()}
                    </p>
                    <Button
                      size="sm"
                      className="w-full bg-primary hover:bg-primary/90"
                      onClick={() => handlePropertyClick(property)}
                    >
                      Shiko Detajet
                    </Button>
                  </div>
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        </div>

        <p className="text-center text-gray-500 text-sm mt-4">
          {properties.length} prona të gjetura në hartë
        </p>
      </div>
    </section>
  );
};

export default PropertiesMap;
