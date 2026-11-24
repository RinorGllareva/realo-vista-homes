import React, { useMemo } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import MarkerClusterGroup from "react-leaflet-cluster";
import L from "leaflet";
import { Link } from "react-router-dom";
import { ArrowRight, MapPin } from "lucide-react";
import { sizedImage } from "@/lib/api";
import {
  PLACEHOLDER_IMAGE,
  firstImage,
  propertyPath,
  propertyTypeLabel,
  useProperties,
  type PropertySummary,
} from "@/lib/properties";
import { Skeleton } from "@/components/ui/skeleton";
import { formatPublicPrice } from "@/lib/price";
import { logoPathA, logoPathB } from "./RealoLoader";

import "leaflet/dist/leaflet.css";

// The Realo "O" logo, drawn inside the pins and clusters.
const realoMark = (size: number, x = 0, y = 0) =>
  `<svg class="realo-mark" x="${x}" y="${y}" width="${size}" height="${size}" viewBox="0 0 155.74 156.09"><path d="${logoPathA}"/><path d="${logoPathB}"/></svg>`;

// Brand pin: dark green with a gold edge and the gold logo; turns gold on hover and while open.
const pinIcon = L.divIcon({
  className: "realo-pin",
  html: `
    <svg width="38" height="48" viewBox="0 0 40 50" xmlns="http://www.w3.org/2000/svg">
      <path class="realo-pin-body" d="M20 48.5S3 31.6 3 19a17 17 0 1 1 34 0c0 12.6-17 29.5-17 29.5z"/>
      ${realoMark(20, 10, 9)}
    </svg>
  `,
  iconSize: [38, 48],
  iconAnchor: [19, 47],
  popupAnchor: [0, -42],
});

// Groups of nearby pins, sized by how many they hold. No number on purpose: the site does not
// show how many listings there are.
const clusterIcon = (cluster: { getChildCount: () => number }) => {
  const count = cluster.getChildCount();
  const size = count < 10 ? 44 : count < 50 ? 52 : 60;
  return L.divIcon({
    className: "realo-cluster",
    html: `<span style="width:${size}px;height:${size}px"><svg width="${Math.round(size * 0.5)}" height="${Math.round(size * 0.5)}" viewBox="0 0 155.74 156.09" class="realo-mark"><path d="${logoPathA}"/><path d="${logoPathB}"/></svg></span>`,
    iconSize: [size, size],
  });
};

// Keeps the pin gold while its card is open.
const pinEvents = {
  popupopen: (e: L.LeafletEvent) => (e.target as L.Marker).getElement()?.classList.add("is-active"),
  popupclose: (e: L.LeafletEvent) => (e.target as L.Marker).getElement()?.classList.remove("is-active"),
};

// Rough box around Kosovo, to leave out listings with broken coordinates (e.g. 0,0).
const inKosovo = (lat: number, lng: number) => lat > 41.5 && lat < 43.5 && lng > 19.5 && lng < 22;

const Heading = () => (
  <div className="mb-8 text-center">
    <h2 className="mb-2 font-title text-3xl text-real-estate-secondary md:text-4xl">Shfleto pronat në hartë</h2>
    <p className="text-white/70">Shiko pronat e disponueshme përmes hartës interaktive.</p>
  </div>
);

const PopupCard: React.FC<{ property: PropertySummary }> = ({ property }) => {
  const image = firstImage(property.images);
  return (
    <div className="w-[260px]">
      <div className="relative h-[150px] bg-[#efe8d7]">
        <img
          src={sizedImage(image, 480)}
          alt={property.title}
          loading="lazy"
          decoding="async"
          onError={(e) => (e.currentTarget.src = PLACEHOLDER_IMAGE)}
          className="h-full w-full object-cover"
        />
        <div className="absolute bottom-2 left-2 flex gap-1.5">
          <span
            className={`rounded px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.12em] ${
              property.isForSale
                ? "bg-real-estate-primary text-real-estate-secondary"
                : "bg-real-estate-secondary text-real-estate-primary"
            }`}
          >
            {property.isForSale ? "Në shitje" : "Me qira"}
          </span>
          <span className="rounded bg-black/60 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-white">
            {propertyTypeLabel(property.propertyType)}
          </span>
        </div>
      </div>
      <div className="p-3.5">
        <h3 className="line-clamp-2 font-title text-[15px] leading-snug text-real-estate-primary">{property.title}</h3>
        {property.city && (
          <p className="mt-1 flex items-center gap-1 text-xs text-real-estate-primary/60">
            <MapPin className="h-3.5 w-3.5 text-real-estate-secondary" />
            {property.city}
          </p>
        )}
        <p className="mt-2 text-lg font-bold text-real-estate-primary">
          {formatPublicPrice(property.price)}
          {!property.isForSale && Number(property.price) > 0 && (
            <span className="text-xs font-medium text-real-estate-primary/60"> / muaj</span>
          )}
        </p>
        <Link
          to={propertyPath(property)}
          className="mt-3 flex items-center justify-center gap-1.5 rounded-lg bg-real-estate-primary px-3 py-2.5 text-sm font-semibold !text-real-estate-secondary transition hover:bg-real-estate-primary/90"
        >
          Shiko detajet <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </div>
  );
};

const PropertiesMap: React.FC = () => {
  const { data, isLoading, isError } = useProperties();

  const properties = useMemo(
    () =>
      (data ?? []).filter((p) => {
        const lat = Number(p.latitude);
        const lng = Number(p.longitude);
        return p.latitude && p.longitude && inKosovo(lat, lng) && (p.isForSale || p.isForRent);
      }),
    [data],
  );

  return (
    <section id="map" className="scroll-mt-20 border-y border-real-estate-secondary/20 bg-real-estate-primary py-16 md:py-20">
      <div className="container mx-auto px-4">
        <Heading />

        {isLoading ? (
          <Skeleton className="mx-auto h-[400px] w-full max-w-7xl rounded-lg md:h-[520px]" />
        ) : isError ? (
          <div className="mx-auto flex h-[400px] w-full max-w-7xl items-center justify-center rounded-lg bg-white/5 md:h-[520px]">
            <p className="text-white/70">Pronat nuk mund të ngarkohen.</p>
          </div>
        ) : (
          <div className="mx-auto h-[440px] w-full max-w-7xl overflow-hidden rounded-xl border border-real-estate-secondary/30 bg-white p-1.5 shadow-2xl md:h-[560px]">
            <MapContainer
              center={[42.6629, 21.1655]}
              zoom={12}
              style={{ height: "100%", width: "100%", borderRadius: "0.6rem" }}
              scrollWheelZoom={false}
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              <MarkerClusterGroup
                chunkedLoading
                showCoverageOnHover={false}
                maxClusterRadius={45}
                iconCreateFunction={clusterIcon}
              >
                {properties.map((property) => (
                  <Marker
                    key={property.propertyId}
                    position={[Number(property.latitude), Number(property.longitude)]}
                    icon={pinIcon}
                    eventHandlers={pinEvents}
                  >
                    <Popup className="property-popup" minWidth={260} maxWidth={260} autoPanPadding={[24, 24]}>
                      <PopupCard property={property} />
                    </Popup>
                  </Marker>
                ))}
              </MarkerClusterGroup>
            </MapContainer>
          </div>
        )}

        <div className="mx-auto mt-10 w-[70%] border-t border-[#bdb8a1]" />
      </div>
    </section>
  );
};

export default PropertiesMap;
