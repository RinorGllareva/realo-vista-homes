import React, { useMemo, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, ZoomControl } from "react-leaflet";
import MarkerClusterGroup from "react-leaflet-cluster";
import L from "leaflet";
import { Link } from "react-router-dom";
import { ArrowRight, MapPin, MousePointerClick } from "lucide-react";
import { sizedImage } from "@/lib/api";
import {
  PLACEHOLDER_IMAGE,
  PROPERTY_TYPES,
  firstImage,
  propertyPath,
  propertyTypeLabel,
  useProperties,
  type PropertySummary,
} from "@/lib/properties";
import { Skeleton } from "@/components/ui/skeleton";
import { formatPublicPrice } from "@/lib/price";

import "leaflet/dist/leaflet.css";

type Deal = "all" | "sale" | "rent";

const PIN_SVG = `
  <svg width="32" height="40" viewBox="0 0 32 40" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M16 0C7.164 0 0 7.164 0 16c0 12 16 24 16 24s16-12 16-24c0-8.836-7.164-16-16-16z" fill="#c69937"/>
    <circle cx="16" cy="14" r="6" fill="#0a4834"/>
  </svg>
`;

// Brand pin, shared by every marker.
const pinIcon = L.divIcon({
  className: "custom-property-marker",
  html: PIN_SVG,
  iconSize: [32, 40],
  iconAnchor: [16, 40],
  popupAnchor: [0, -36],
});

// Groups of nearby pins. No number on purpose: the site does not show how many listings there are.
const clusterIcon = (cluster: { getChildCount: () => number }) => {
  const count = cluster.getChildCount();
  const size = count < 10 ? 38 : count < 50 ? 46 : 54;
  return L.divIcon({
    className: "realo-cluster",
    html: `<span style="width:${size}px;height:${size}px"><i></i></span>`,
    iconSize: [size, size],
  });
};

// Rough box around Kosovo, to leave out listings with broken coordinates (e.g. 0,0).
const inKosovo = (lat: number, lng: number) => lat > 41.5 && lat < 43.5 && lng > 19.5 && lng < 22;

const DEALS: Array<[Deal, string]> = [
  ["all", "Të gjitha"],
  ["sale", "Në shitje"],
  ["rent", "Me qira"],
];

const chip = (active: boolean) =>
  `shrink-0 rounded-full border px-3.5 py-1.5 text-sm font-semibold transition ${
    active
      ? "border-real-estate-secondary bg-real-estate-secondary text-real-estate-primary"
      : "border-white/20 text-white/80 hover:border-real-estate-secondary hover:text-white"
  }`;

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
  const [deal, setDeal] = useState<Deal>("all");
  const [type, setType] = useState("");

  const mapped = useMemo(
    () =>
      (data ?? []).filter((p) => {
        const lat = Number(p.latitude);
        const lng = Number(p.longitude);
        return p.latitude && p.longitude && inKosovo(lat, lng) && (p.isForSale || p.isForRent);
      }),
    [data],
  );

  const shown = useMemo(
    () =>
      mapped.filter(
        (p) =>
          (deal === "all" || (deal === "sale" ? p.isForSale : !p.isForSale)) &&
          (!type || p.propertyType?.toLowerCase() === type.toLowerCase()),
      ),
    [mapped, deal, type],
  );

  // The same filters on the full listings page.
  const listLink = useMemo(() => {
    const params = new URLSearchParams();
    if (deal !== "all") params.set("isForSale", String(deal === "sale"));
    if (type) params.set("propertyType", type);
    const query = params.toString();
    return query ? `/Property?${query}` : "/Property";
  }, [deal, type]);

  return (
    <section
      id="map"
      className="relative scroll-mt-20 overflow-hidden bg-real-estate-primary py-16 text-white md:py-24"
    >
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_15%_20%,rgba(198,153,55,0.14),transparent_45%),radial-gradient(circle_at_85%_90%,rgba(6,19,15,0.7),transparent_55%)]" />

      <div className="relative mx-auto grid max-w-7xl grid-cols-1 gap-8 px-4 md:px-6 lg:grid-cols-[340px_1fr] lg:gap-10">
        {/* Panel: title, filters and legend */}
        <div className="flex min-w-0 flex-col">
          <p className="font-text text-xs uppercase tracking-[0.3em] text-real-estate-secondary sm:text-sm">
            Harta e pronave
          </p>
          <h2 className="mt-3 font-title text-[clamp(2rem,5vw,2.9rem)] leading-[1.08] [text-wrap:balance]">
            Shfleto pronat në hartë
          </h2>
          <p className="mt-3 text-[15px] leading-relaxed text-white/70">
            Gjej pronat sipas lagjes. Zgjidh llojin, pastaj kliko një pin për foto, çmim dhe detaje.
          </p>

          <div className="mt-7">
            <p className="mb-2.5 text-[11px] font-semibold uppercase tracking-[0.2em] text-white/50">Marrëveshja</p>
            <div className="flex flex-wrap gap-2">
              {DEALS.map(([value, label]) => (
                <button
                  key={value}
                  type="button"
                  aria-pressed={deal === value}
                  onClick={() => setDeal(value)}
                  className={chip(deal === value)}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-5">
            <p className="mb-2.5 text-[11px] font-semibold uppercase tracking-[0.2em] text-white/50">Lloji i pronës</p>
            <div className="no-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4 lg:mx-0 lg:flex-wrap lg:overflow-visible lg:px-0">
              <button type="button" aria-pressed={!type} onClick={() => setType("")} className={chip(!type)}>
                Të gjitha
              </button>
              {PROPERTY_TYPES.map((t) => (
                <button
                  key={t.value}
                  type="button"
                  aria-pressed={type === t.value}
                  onClick={() => setType(type === t.value ? "" : t.value)}
                  className={chip(type === t.value)}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-7 hidden space-y-2.5 border-t border-white/10 pt-6 text-sm text-white/70 lg:block">
            <p className="flex items-center gap-3">
              <span className="w-6 shrink-0" dangerouslySetInnerHTML={{ __html: PIN_SVG.replace('width="32" height="40"', 'width="20" height="25"') }} />
              Një pronë
            </p>
            <p className="flex items-center gap-3">
              <span className="flex w-6 shrink-0 justify-center">
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-real-estate-secondary shadow-[0_0_0_4px_rgba(198,153,55,0.3)]">
                  <span className="h-2 w-2 rounded-full bg-real-estate-primary" />
                </span>
              </span>
              Disa prona afër njëra-tjetrës. Kliko për t'i parë
            </p>
          </div>

          <Link
            to={listLink}
            className="mt-7 inline-flex items-center justify-center gap-2 self-start rounded-full border border-real-estate-secondary/60 px-5 py-2.5 text-sm font-semibold text-real-estate-secondary transition hover:bg-real-estate-secondary hover:text-real-estate-primary lg:mt-auto"
          >
            Shiko këto prona në listë <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        {/* Map */}
        <div className="realo-map relative h-[440px] overflow-hidden rounded-2xl border border-real-estate-secondary/35 bg-[#efe8d7] shadow-[0_30px_80px_-25px_rgba(0,0,0,0.8)] sm:h-[520px] lg:h-[620px]">
          {isLoading ? (
            <Skeleton className="h-full w-full rounded-none bg-[#efe8d7]" />
          ) : isError ? (
            <div className="flex h-full items-center justify-center">
              <p className="text-real-estate-primary/70">Pronat nuk mund të ngarkohen.</p>
            </div>
          ) : (
            <>
              <MapContainer
                center={[42.6629, 21.1655]}
                zoom={12}
                zoomControl={false}
                scrollWheelZoom={false}
                style={{ height: "100%", width: "100%" }}
              >
                <TileLayer
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                <ZoomControl position="bottomright" />
                <MarkerClusterGroup
                  // Re-group when the filters change.
                  key={`${deal}-${type}`}
                  chunkedLoading
                  showCoverageOnHover={false}
                  maxClusterRadius={45}
                  iconCreateFunction={clusterIcon}
                >
                  {shown.map((property) => (
                    <Marker
                      key={property.propertyId}
                      position={[Number(property.latitude), Number(property.longitude)]}
                      icon={pinIcon}
                    >
                      <Popup className="property-popup" minWidth={260} maxWidth={260} autoPanPadding={[24, 24]}>
                        <PopupCard property={property} />
                      </Popup>
                    </Marker>
                  ))}
                </MarkerClusterGroup>
              </MapContainer>

              <div className="pointer-events-none absolute left-3 top-3 z-[400] inline-flex items-center gap-2 rounded-full bg-real-estate-primary/90 px-3.5 py-2 text-xs font-semibold text-white shadow-lg backdrop-blur">
                <MousePointerClick className="h-4 w-4 text-real-estate-secondary" />
                Kliko një pin për detaje
              </div>
              {shown.length === 0 && (
                <div className="absolute inset-0 z-[400] flex items-center justify-center bg-[#06130f]/40">
                  <p className="rounded-xl bg-white px-5 py-3 text-sm font-semibold text-real-estate-primary shadow-xl">
                    Nuk ka prona në hartë për këtë zgjedhje.
                  </p>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </section>
  );
};

export default PropertiesMap;
