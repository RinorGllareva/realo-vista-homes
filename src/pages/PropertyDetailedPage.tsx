import React, { useEffect, useMemo, useRef, useState } from "react";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";
import { Helmet } from "react-helmet";
import {
  ArrowLeft,
  ArrowRight,
  Bath,
  BedDouble,
  Building2,
  CalendarDays,
  Check,
  Compass,
  Download,
  ExternalLink,
  FileText,
  Home,
  MapPin,
  Navigation,
  Maximize2,
  Play,
  Ruler,
  Share2,
  X,
  ZoomIn,
  ZoomOut,
} from "lucide-react";
import Header from "../components/Header";
import Footer from "../components/Footer";
import PropertyCard from "../components/PropertyCard";
import FavoriteButton from "../components/FavoriteButton";
import PropertyGallery from "../components/property/PropertyGallery";
import PropertyVisitCard from "../components/property/PropertyVisitCard";
import { RealoLoader } from "@/components/RealoLoader";
import { firstImage, useProperties, type PropertySummary } from "@/lib/properties";
import { PublicVirtualTour } from "@/components/PublicVirtualTour";
import { Button } from "@/components/ui/button";
import { apiUrl, normalizeMediaUrl } from "@/lib/api";
import { formatPublicPrice } from "@/lib/price";
import type { VirtualTour } from "@/types/virtualTour";
import { useToast } from "@/hooks/use-toast";

type ImgObj = { imageUrl: string };

interface Property {
  propertyId: string | number;
  title: string;
  city: string;
  price: number | string;
  propertyType: string;
  isForSale: boolean;
  isForRent?: boolean;
  description?: string;
  address?: string;
  bedrooms?: number;
  bathrooms?: number;
  squareFeet?: number;
  floor?: number | string;
  floorLevel?: number | string;
  yearBuilt?: number | string;
  parking?: boolean | string;
  furniture?: string;
  hasOwnershipDocument?: boolean;
  latitude?: number;
  longitude?: number;
  floorPlanUrl?: string;
  virtualTourUrl?: string;
  images?: ImgObj[] | ImgObj | string | null;
}

const API_BASE = (import.meta.env.VITE_API_URL ?? "").replace(/\/+$/, "");
const API_ORIGIN = API_BASE
  ? new URL(API_BASE).origin
  : typeof window !== "undefined"
  ? window.location.origin
  : "";

const extractUrl = (value: unknown): string => {
  if (!value) return "";
  if (typeof value === "string") return value;
  if (typeof value === "object") {
    const o = value as any;
    if (typeof o.imageUrl === "string") return o.imageUrl;
    if (typeof o.ImageUrl === "string") return o.ImageUrl;
    if (typeof o.url === "string") return o.url;
    if (typeof o.src === "string") return o.src;
  }
  return "";
};

const toAbsoluteUrl = (url: string) => {
  const cleanUrl = normalizeMediaUrl(url);
  if (!cleanUrl) return "";
  if (/^data:/.test(cleanUrl) || /^https?:\/\//i.test(cleanUrl)) return cleanUrl;
  if (cleanUrl.startsWith("//")) return `https:${cleanUrl}`;
  if (cleanUrl.startsWith("/")) return `${API_ORIGIN}${cleanUrl}`;
  return cleanUrl;
};

const toArray = (raw: unknown): any[] => {
  if (Array.isArray(raw)) return raw;
  if (raw && typeof raw === "object") {
    const r = raw as any;
    if (Array.isArray(r.$values)) return r.$values;
    if (Array.isArray(r.data)) return r.data;
    if (Array.isArray(r.items)) return r.items;
    if (Array.isArray(r.result)) return r.result;
  }
  return [];
};

const normalizeImages = (value: unknown): ImgObj[] => {
  if (Array.isArray(value)) {
    return value.map((item) => ({ imageUrl: toAbsoluteUrl(extractUrl(item)) })).filter((item) => item.imageUrl);
  }
  if (typeof value === "string") {
    return value
      .split(",")
      .map((url) => ({ imageUrl: toAbsoluteUrl(url.trim()) }))
      .filter((item) => item.imageUrl);
  }
  const url = toAbsoluteUrl(extractUrl(value));
  return url ? [{ imageUrl: url }] : [];
};


const pickOne = (raw: unknown): Property | null => {
  const arr = toArray(raw);
  if (arr.length) return arr[0] as Property;
  return raw && typeof raw === "object" ? (raw as Property) : null;
};

const hasText = (value?: string | number | null) =>
  value !== undefined && value !== null && String(value).trim() !== "";

const hasPositive = (value?: number | string | null) => {
  const n = Number(value);
  return Number.isFinite(n) && n > 0;
};

const translateType = (type: string) => {
  const map: Record<string, string> = {
    house: "Shtëpi",
    apartment: "Banesë",
    office: "Zyrë",
    store: "Lokal",
    land: "Tokë",
    warehouse: "Depo",
    building: "Objekt",
  };
  return map[type.toLowerCase()] || type;
};

const getAny = (property: Property, keys: string[]) => {
  const source = property as any;
  for (const key of keys) {
    if (hasText(source[key])) return source[key];
  }
  return undefined;
};

const PropertyDetailedPage = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { toast } = useToast();
  const [property, setProperty] = useState<Property | null>(null);
  const { data: properties = [] } = useProperties();
  const [failed, setFailed] = useState(false);
  const [internalTour, setInternalTour] = useState<VirtualTour | null>(null);
  const [activeImage, setActiveImage] = useState(0);
  const [activeMediaPanel, setActiveMediaPanel] = useState<"tour" | "floor">("tour");
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxImageIndex, setLightboxImageIndex] = useState(0);
  const [lightboxZoom, setLightboxZoom] = useState(1);
  const [descriptionOpen, setDescriptionOpen] = useState(false);
  const touchStartX = useRef(0);

  useEffect(() => {
    if (!id) return;
    const ac = new AbortController();
    setFailed(false);

    Promise.all([
      axios.get(apiUrl(`api/Property/GetProperty/${id}`), {
        headers: { Accept: "application/json" },
        signal: ac.signal,
      }),
      axios
        .get(apiUrl(`/api/Property/UpdatePropertyMedia/${id}`), {
          headers: { Accept: "application/json" },
          signal: ac.signal,
        })
        .catch(() => ({ data: null })),
      axios
        .get(apiUrl(`/api/VirtualTour/GetByProperty/${id}`), {
          headers: { Accept: "application/json" },
          signal: ac.signal,
        })
        .catch(() => ({ data: null })),
    ])
      .then(([propertyRes, mediaRes, tourRes]) => {
        const current = pickOne(propertyRes.data);
        if (!current) setFailed(true);
        if (current) {
          const directImages = normalizeImages((current as any).images);
          const media =
            mediaRes?.data && typeof mediaRes.data === "object"
              ? (mediaRes.data as Partial<Property>)
              : {};
          setProperty({
            ...current,
            floorPlanUrl: media.floorPlanUrl ?? current.floorPlanUrl,
            virtualTourUrl: media.virtualTourUrl ?? current.virtualTourUrl,
            images: directImages.length ? directImages : normalizeImages((current as any).propertyImages),
          });
        }
        const tour = tourRes?.data as VirtualTour | null;
        setInternalTour(tour?.isPublished && tour.rooms?.length ? tour : null);
      })
      .catch((error) => {
        if (error?.name !== "CanceledError" && error?.code !== "ERR_CANCELED") {
          console.error("Error fetching property data:", error);
          setFailed(true);
        }
      });

    return () => ac.abort();
  }, [id]);

  useEffect(() => {
    if (!property) return;
    if (internalTour?.rooms?.length || hasText(property.virtualTourUrl)) {
      setActiveMediaPanel("tour");
    } else if (hasText(property.floorPlanUrl)) {
      setActiveMediaPanel("floor");
    }
  }, [internalTour?.rooms?.length, property?.propertyId, property?.virtualTourUrl, property?.floorPlanUrl]);

  useEffect(() => {
    if (!lightboxOpen) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setLightboxOpen(false);
      if (event.key === "ArrowRight") document.getElementById("lightbox-next")?.click();
      if (event.key === "ArrowLeft") document.getElementById("lightbox-prev")?.click();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [lightboxOpen]);

  const similarProperties = useMemo(() => {
    if (!property) return [];
    return properties
      .filter((item) => String(item.propertyId) !== String(property.propertyId))
      .map((item) => ({
        ...item,
        score:
          (item.propertyType === property.propertyType ? 2 : 0) +
          (item.city === property.city ? 1 : 0),
      }))
      .filter((item) => item.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 4);
  }, [properties, property]);

  if (!property || String(property.propertyId) !== String(id)) {
    // Show what we already know from the cached list while the full details load.
    const summary = properties.find((p) => String(p.propertyId) === String(id));
    return (
      <div className="min-h-screen bg-[#ebe1cf]">
        <Header />
        <section className="relative flex min-h-[74vh] items-end overflow-hidden bg-[#06130f] md:min-h-[82vh]">
          {summary && (
            <img src={firstImage(summary.images)} alt="" className="absolute inset-0 h-full w-full object-cover" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-[#06130f] via-[#06130f]/60 to-black/25" />
          <div className="relative mx-auto w-full max-w-7xl px-5 pb-10 pt-28 md:pb-14">
            {failed ? (
              <>
                <h1 className="font-title text-4xl text-white md:text-5xl">Prona nuk u gjet</h1>
                <p className="mt-3 text-white/70">Mund të jetë hequr ose linku nuk është i saktë.</p>
                <button
                  onClick={() => navigate("/Property")}
                  className="mt-6 rounded-full bg-real-estate-secondary px-6 py-3 font-text text-xs font-semibold uppercase tracking-[0.16em] text-real-estate-primary"
                >
                  Shfleto pronat
                </button>
              </>
            ) : (
              <>
                <h1 className="max-w-5xl font-title text-[clamp(2.2rem,6.2vw,5.8rem)] leading-[0.95] text-white">
                  {summary?.title ?? <span className="inline-block h-14 w-2/3 animate-pulse rounded bg-white/10" />}
                </h1>
                <RealoLoader size="sm" label="Duke ngarkuar detajet…" className="mt-6 !flex-row !gap-3" />
              </>
            )}
          </div>
        </section>
      </div>
    );
  }

  const images = normalizeImages(property.images);
  const galleryImages = images.length
    ? images
    : [{ imageUrl: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1800&auto=format&fit=crop" }];
  const heroImage = galleryImages[activeImage]?.imageUrl;
  const shareImage = galleryImages[0]?.imageUrl || heroImage;
  const propertyId = String(property.propertyId ?? id ?? "");
  const encodedTitle = encodeURIComponent(property.title || "property");
  const propertyUrl = `https://www.realo-realestate.com/properties/${encodedTitle}/${propertyId}`;
  const shareVersion = encodeURIComponent((shareImage || propertyId).split("/").pop()?.slice(0, 80) || propertyId);
  const shareUrl = `https://www.realo-realestate.com/share/${propertyId}?v=${shareVersion}`;
  const whatsappMessage = encodeURIComponent(
    `Pershendetje Realo, jam i/e interesuar per kete prone: ${property.title} - ${propertyUrl}`
  );
  const whatsappUrl = `https://wa.me/38348282262?text=${whatsappMessage}`;
  const hasCoordinates = hasPositive(property.latitude) && hasPositive(property.longitude);
  const hasFloorPlan = hasText(property.floorPlanUrl);
  const hasInternalTour = !!internalTour?.isPublished && !!internalTour.rooms?.length;
  const hasVirtualTour = hasInternalTour || hasText(property.virtualTourUrl);
  const isFloorPlanPdf = /\.pdf($|\?)/i.test(property.floorPlanUrl ?? "");
  const mediaPanel = hasVirtualTour
    ? activeMediaPanel
    : hasFloorPlan
      ? "floor"
      : "tour";
  const floor = getAny(property, ["floor", "floorLevel", "Floor", "FloorLevel"]);
  const yearBuilt = getAny(property, ["yearBuilt", "YearBuilt", "builtYear", "BuiltYear"]);
  const parking = getAny(property, ["parking", "Parking", "hasParking", "HasParking"]);

  const heroFacts = [
    hasPositive(property.bedrooms) ? { icon: BedDouble, label: `${property.bedrooms} Dhoma` } : null,
    hasPositive(property.bathrooms) ? { icon: Bath, label: `${property.bathrooms} Banjo` } : null,
    hasPositive(property.squareFeet) ? { icon: Ruler, label: `${property.squareFeet} m²` } : null,
    hasText(floor) ? { icon: Building2, label: `Kati ${floor}` } : null,
    hasText(yearBuilt) ? { icon: CalendarDays, label: String(yearBuilt) } : null,
  ].filter(Boolean) as Array<{ icon: React.ElementType; label: string }>;

  const detailFacts = [
    hasPositive(property.bedrooms) ? { icon: BedDouble, label: "Dhoma", value: property.bedrooms } : null,
    hasPositive(property.bathrooms) ? { icon: Bath, label: "Banjo", value: property.bathrooms } : null,
    hasPositive(property.squareFeet) ? { icon: Ruler, label: "Sipërfaqe", value: `${property.squareFeet} m²` } : null,
    hasText(floor) ? { icon: Building2, label: "Kati", value: floor } : null,
    hasText(yearBuilt) ? { icon: CalendarDays, label: "Viti i ndërtimit", value: yearBuilt } : null,
    hasText(parking) ? { icon: Home, label: "Vendparkim", value: parking === true || String(parking).toLowerCase() === "true" ? "Po" : parking } : null,
  ].filter(Boolean) as Array<{ icon: React.ElementType; label: string; value: string | number }>;

  const features = [
    property.furniture && property.furniture !== "N/A" ? `Mobilimi: ${property.furniture}` : null,
    property.hasOwnershipDocument !== undefined
      ? `Dokument pronësie: ${property.hasOwnershipDocument ? "Po" : "Jo"}`
      : null,
    property.propertyType ? `Lloji: ${translateType(property.propertyType)}` : null,
    property.city ? `Qyteti: ${property.city}` : null,
  ].filter(Boolean);

  const longDescription = (property.description?.trim().length ?? 0) > 600;
  const yesNo = (value: unknown) => (value === true || String(value).toLowerCase() === "true" ? "Po" : "Jo");
  const infoRows = [
    ["Lloji", property.propertyType ? translateType(property.propertyType) : ""],
    ["Statusi", property.isForSale ? "Në shitje" : "Me qira"],
    ["Qyteti", property.city],
    ["Adresa", property.address],
    ["Mobilimi", property.furniture && property.furniture !== "N/A" ? property.furniture : ""],
    ["Dokument pronësie", property.hasOwnershipDocument !== undefined ? yesNo(property.hasOwnershipDocument) : ""],
    ["ID e pronës", propertyId],
  ].filter(([, value]) => hasText(value as string)) as Array<[string, string]>;
  const mapsQuery = hasCoordinates
    ? `${property.latitude},${property.longitude}`
    : encodeURIComponent([property.address, property.city, "Kosovo"].filter(hasText).join(", "));
  const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${mapsQuery}`;
  const directionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${mapsQuery}`;

  const openGalleryImage = (index: number) => {
    setActiveImage(index);
    setLightboxImageIndex(index);
    setLightboxZoom(1);
    setLightboxOpen(true);
  };
  const nextLightboxImage = () => {
    setLightboxZoom(1);
    setLightboxImageIndex((index) => (index + 1) % galleryImages.length);
  };
  const previousLightboxImage = () => {
    setLightboxZoom(1);
    setLightboxImageIndex((index) => (index - 1 + galleryImages.length) % galleryImages.length);
  };
  const handleShareProperty = async () => {
    const shareTitle = `${property.title} | Realo Real Estate`;
    const shareText = [property.city, formatPublicPrice(property.price)]
      .filter(Boolean)
      .join(" - ");

    try {
      if (navigator.share) {
        await navigator.share({
          title: shareTitle,
          text: shareText,
          url: shareUrl,
        });
        return;
      }
    } catch (error) {
      if ((error as DOMException)?.name === "AbortError") return;
    }

    try {
      await navigator.clipboard.writeText(shareUrl);
      toast({
        title: "Linku u kopjua",
        description: "Linku i pronës është gati për Viber, WhatsApp ose Facebook.",
      });
    } catch {
      toast({
        title: "Nuk u kopjua linku",
        description: shareUrl,
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-[#ebe1cf] pb-[76px] text-real-estate-primary lg:pb-0">
      <Helmet>
        <title>{`${property.title}, ${property.city} | Realo Real Estate`}</title>
        <meta
          name="description"
          content={`${property.title} ne ${property.city}. ${
            property.bedrooms ? `${property.bedrooms} dhoma, ` : ""
          }${
            property.squareFeet ? `${property.squareFeet} m². ` : ""
          }Çmimi: ${formatPublicPrice(property.price)}. Realo Real Estate.`}
        />
        <link
          rel="canonical"
          href={propertyUrl}
        />
        <meta property="og:type" content="website" />
        <meta property="og:title" content={`${property.title} | Realo Real Estate`} />
        <meta
          property="og:description"
          content={`${property.city ? `${property.city} - ` : ""}${formatPublicPrice(property.price)}`}
        />
        <meta property="og:url" content={propertyUrl} />
        <meta property="og:image" content={shareImage} />
        <meta property="og:image:secure_url" content={shareImage} />
        <meta property="og:image:type" content="image/jpeg" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={`${property.title} | Realo Real Estate`} />
        <meta name="twitter:image" content={shareImage} />
      </Helmet>
      <Header />

      <section className="relative flex min-h-[74vh] items-end overflow-hidden md:min-h-[82vh]">
        <img src={heroImage} alt={property.title} className="absolute inset-0 h-full w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#06130f] via-[#06130f]/60 to-black/25" />
        <div className="relative mx-auto w-full max-w-7xl px-5 pb-10 pt-28 md:pb-14 md:pt-32">
          <p className="font-text text-xs uppercase tracking-[0.24em] text-real-estate-secondary md:text-sm md:tracking-[0.28em]">
            <button onClick={() => navigate("/")}>Ballina</button> &gt;{" "}
            <button onClick={() => navigate("/Property")}>Prona</button> &gt; {property.title}
          </p>
          <h1 className="mt-4 max-w-5xl font-title text-[clamp(2.7rem,6.2vw,5.8rem)] leading-[0.95] text-white">
            {property.title}
          </h1>
          <p className="mt-5 inline-block border border-real-estate-secondary bg-black/45 px-4 py-2 font-title text-2xl text-real-estate-secondary md:text-3xl">
            {formatPublicPrice(property.price)}
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            {hasVirtualTour && (
              <a
                href="#virtual-tour"
                className="inline-flex items-center gap-2 border border-real-estate-secondary bg-real-estate-secondary px-5 py-3 font-text text-sm font-bold uppercase tracking-[0.22em] text-real-estate-primary transition hover:bg-white"
              >
                <Play size={17} /> Fillo turin virtual
              </a>
            )}
            {hasVirtualTour && (
              <a
                href="#virtual-tour"
                className="inline-flex items-center gap-2 border border-real-estate-secondary/70 px-5 py-3 font-text text-sm font-bold uppercase tracking-[0.22em] text-real-estate-secondary transition hover:bg-real-estate-secondary hover:text-real-estate-primary"
              >
                <Compass size={17} /> Dhoma 360°
              </a>
            )}
            <button
              type="button"
              onClick={handleShareProperty}
              className="inline-flex items-center gap-2 border border-real-estate-secondary/70 px-5 py-3 font-text text-sm font-bold uppercase tracking-[0.22em] text-real-estate-secondary transition hover:bg-real-estate-secondary hover:text-real-estate-primary"
            >
              <Share2 size={17} /> Shpërndaje
            </button>
            <FavoriteButton propertyId={property.propertyId} title={property.title} variant="outline" />
          </div>
          {heroFacts.length > 0 && (
            <div className="mt-6 flex flex-nowrap gap-2 overflow-x-auto border-y border-real-estate-secondary/25 py-4 font-text text-[11px] uppercase tracking-[0.12em] text-white/80 sm:flex-wrap sm:text-xs md:grid md:grid-cols-5 md:gap-3 md:overflow-visible md:text-sm md:tracking-[0.18em]">
              {heroFacts.map(({ icon: Icon, label }) => (
                <span key={label} className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-real-estate-secondary/25 bg-black/20 px-2.5 py-1.5 md:rounded-none md:border-0 md:bg-transparent md:px-0 md:py-0">
                  <Icon className="h-4 w-4 text-real-estate-secondary" />
                  {label}
                </span>
              ))}
            </div>
          )}
        </div>
      </section>

      <PropertyGallery
        images={galleryImages}
        title={property.title}
        hasVirtualTour={hasVirtualTour}
        onOpen={openGalleryImage}
      />

      {(hasVirtualTour || hasFloorPlan) && (
        <section id="virtual-tour" className="scroll-mt-24 bg-[#ebe1cf] px-5 py-14 md:py-20">
          <div className="mx-auto max-w-7xl">
            <div className="mb-7">
              <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
                <div>
                  <p className="font-text text-sm uppercase tracking-[0.34em] text-real-estate-secondary">
                    Prezantim imersiv
                  </p>
                  <h2 className="mt-2 max-w-4xl font-title text-[clamp(2.25rem,6vw,4.2rem)] leading-[0.98] text-real-estate-primary">
                    Turi 360° dhe planimetria
                  </h2>
                </div>
                <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap sm:justify-end">
                  {mediaPanel === "tour" && hasText(property.virtualTourUrl) && !hasInternalTour && (
                    <a
                      href={property.virtualTourUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex min-h-11 items-center justify-center gap-2 rounded-sm bg-real-estate-primary px-3 py-2 font-text text-[11px] uppercase tracking-[0.16em] text-real-estate-secondary transition hover:bg-real-estate-primary/90 sm:px-4 sm:text-xs"
                    >
                      <ExternalLink size={16} /> Hape
                    </a>
                  )}
                  {mediaPanel === "floor" && hasFloorPlan && (
                    <a
                      href={property.floorPlanUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex min-h-11 items-center justify-center gap-2 rounded-sm bg-real-estate-primary px-3 py-2 font-text text-[11px] uppercase tracking-[0.16em] text-real-estate-secondary transition hover:bg-real-estate-primary/90 sm:px-4 sm:text-xs"
                    >
                      <ExternalLink size={16} /> Hape
                    </a>
                  )}
                  {!(mediaPanel === "tour" && hasInternalTour) && (
                    <button
                      type="button"
                      className="inline-flex min-h-11 items-center justify-center gap-2 rounded-sm bg-real-estate-primary px-3 py-2 font-text text-[11px] uppercase tracking-[0.16em] text-real-estate-secondary transition hover:bg-real-estate-primary/90 sm:px-4 sm:text-xs"
                      onClick={() => document.getElementById("realo-media-frame")?.requestFullscreen()}
                    >
                      <Maximize2 size={16} /> Ekran
                    </button>
                  )}
                </div>
              </div>
              <div className="mt-4 grid grid-cols-2 gap-2 sm:flex sm:flex-wrap">
                {hasVirtualTour && (
                  <button
                    type="button"
                    onClick={() => setActiveMediaPanel("tour")}
                    className={`inline-flex min-h-11 items-center justify-center gap-2 rounded-sm px-3 py-2 font-text text-[11px] uppercase tracking-[0.16em] transition sm:px-4 sm:text-xs ${
                      mediaPanel === "tour"
                        ? "bg-real-estate-secondary text-real-estate-primary"
                        : "bg-real-estate-primary text-real-estate-secondary hover:bg-real-estate-primary/90"
                    }`}
                  >
                    <Compass size={17} /> 360°
                  </button>
                )}
                {hasFloorPlan && (
                  <button
                    type="button"
                    onClick={() => setActiveMediaPanel("floor")}
                    className={`inline-flex min-h-11 items-center justify-center gap-2 rounded-sm px-3 py-2 font-text text-[11px] uppercase tracking-[0.16em] transition sm:px-4 sm:text-xs ${
                      mediaPanel === "floor"
                        ? "bg-real-estate-secondary text-real-estate-primary"
                        : "bg-real-estate-primary text-real-estate-secondary hover:bg-real-estate-primary/90"
                    }`}
                  >
                    <FileText size={17} /> Plan
                  </button>
                )}
              </div>
            </div>

            <div className="mb-3 font-text text-xs uppercase tracking-[0.28em] text-real-estate-secondary">
              <span>{mediaPanel === "tour" ? (hasInternalTour ? "Realo 360°" : "Pioneer / Panoee 360°") : isFloorPlanPdf ? "Planimetri PDF" : "Planimetri"}</span>
            </div>

            {mediaPanel === "tour" && hasInternalTour && internalTour && (
              <PublicVirtualTour tour={internalTour} propertyTitle={property.title} />
            )}
            {mediaPanel !== "tour" || !hasInternalTour ? (
            <div id="realo-media-frame" className="relative overflow-hidden rounded-md bg-[#050706] shadow-xl">
              {mediaPanel === "tour" && hasText(property.virtualTourUrl) && (
                <iframe
                  title={`${property.title} virtual tour`}
                  src={property.virtualTourUrl}
                  className="h-[430px] w-full bg-black sm:h-[560px] lg:h-[720px]"
                  allow="fullscreen; accelerometer; gyroscope; xr-spatial-tracking"
                  allowFullScreen
                  loading="lazy"
                />
              )}
              {mediaPanel === "floor" && hasFloorPlan && (
                isFloorPlanPdf ? (
                  <iframe
                    title={`${property.title} floor plan`}
                    src={property.floorPlanUrl}
                    className="h-[430px] w-full bg-white sm:h-[560px] lg:h-[720px]"
                    loading="lazy"
                  />
                ) : (
                  <div className="flex min-h-[430px] items-center justify-center bg-[#120f0a] p-4 sm:min-h-[560px] lg:min-h-[720px]">
                    <img
                      src={property.floorPlanUrl}
                      alt={`${property.title} floor plan`}
                      className="max-h-[680px] w-full object-contain"
                      loading="lazy"
                    />
                  </div>
                )
              )}
            </div>
            ) : null}

            <div className="hidden">
              {hasVirtualTour && (
                <button
                  type="button"
                  onClick={() => setActiveMediaPanel("tour")}
                  className={`border px-5 py-3 font-text text-xs uppercase tracking-[0.24em] transition ${
                    mediaPanel === "tour"
                      ? "border-real-estate-secondary bg-real-estate-secondary text-real-estate-primary"
                      : "border-real-estate-secondary/45 text-real-estate-secondary hover:border-real-estate-secondary"
                  }`}
                >
                  360°
                </button>
              )}
              {hasFloorPlan && (
                <button
                  type="button"
                  onClick={() => setActiveMediaPanel("floor")}
                  className={`border px-5 py-3 font-text text-xs uppercase tracking-[0.24em] transition ${
                    mediaPanel === "floor"
                      ? "border-real-estate-secondary bg-real-estate-secondary text-real-estate-primary"
                      : "border-real-estate-secondary/45 text-real-estate-secondary hover:border-real-estate-secondary"
                  }`}
                >
                  Floor Plan
                </button>
              )}
            </div>
          </div>
        </section>
      )}

      <section className="bg-[#fbfaf7] px-4 pb-16 pt-8 md:px-5 md:pt-12">
        <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-[minmax(0,1fr)_380px] lg:gap-10">
          <div className="min-w-0 space-y-6">
            {detailFacts.length > 0 && (
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                {detailFacts.map(({ icon: Icon, label, value }) => (
                  <div key={label} className="flex items-center gap-3 rounded-xl border border-real-estate-primary/10 bg-white p-4">
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-real-estate-secondary/15 text-real-estate-primary">
                      <Icon size={18} />
                    </span>
                    <span className="min-w-0">
                      <span className="block truncate text-lg font-semibold leading-tight text-real-estate-primary">{value}</span>
                      <span className="block text-xs uppercase tracking-[0.1em] text-real-estate-primary/55">{label}</span>
                    </span>
                  </div>
                ))}
              </div>
            )}

            <div className="rounded-2xl border border-real-estate-primary/10 bg-white p-6 md:p-8">
              <h2 className="font-title text-3xl text-real-estate-primary">Përshkrimi</h2>
              <div className="relative mt-4">
                <p
                  className={`whitespace-pre-line text-[15px] leading-7 text-real-estate-primary/80 md:text-base ${
                    longDescription && !descriptionOpen ? "max-h-56 overflow-hidden" : ""
                  }`}
                >
                  {property.description?.trim() || "Nuk ka përshkrim të disponueshëm."}
                </p>
                {longDescription && !descriptionOpen && (
                  <div className="pointer-events-none absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-white to-transparent" />
                )}
              </div>
              {longDescription && (
                <button
                  type="button"
                  onClick={() => setDescriptionOpen((open) => !open)}
                  className="mt-3 text-sm font-semibold text-real-estate-primary underline decoration-real-estate-secondary decoration-2 underline-offset-4"
                >
                  {descriptionOpen ? "Shfaq më pak" : "Lexo më shumë"}
                </button>
              )}

              {infoRows.length > 0 && (
                <>
                  <h3 className="mt-8 font-title text-2xl text-real-estate-primary">Informacione</h3>
                  <dl className="mt-3 grid gap-x-8 sm:grid-cols-2">
                    {infoRows.map(([label, value]) => (
                      <div key={label} className="flex items-baseline justify-between gap-4 border-b border-real-estate-primary/10 py-3 text-sm">
                        <dt className="text-real-estate-primary/60">{label}</dt>
                        <dd className="text-right font-semibold text-real-estate-primary">{value}</dd>
                      </div>
                    ))}
                  </dl>
                </>
              )}
            </div>

            {(hasCoordinates || hasText(property.address)) && (
              <div className="rounded-2xl border border-real-estate-primary/10 bg-white p-6 md:p-8">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                  <div>
                    <h2 className="font-title text-3xl text-real-estate-primary">Lokacioni</h2>
                    <p className="mt-2 flex items-start gap-2 text-real-estate-primary/75">
                      <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-real-estate-secondary" />
                      {[property.address, property.city].filter(hasText).join(", ") || "Kosovë"}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <a
                      href={mapsUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-2 rounded-full border border-real-estate-primary/15 px-4 py-2 text-sm font-semibold text-real-estate-primary transition hover:border-real-estate-secondary"
                    >
                      <ExternalLink className="h-4 w-4" /> Google Maps
                    </a>
                    <a
                      href={directionsUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-2 rounded-full bg-real-estate-primary px-4 py-2 text-sm font-semibold text-real-estate-secondary transition hover:bg-real-estate-primary/90"
                    >
                      <Navigation className="h-4 w-4" /> Udhëzime
                    </a>
                  </div>
                </div>
                {hasCoordinates && (
                  <div className="mt-5 overflow-hidden rounded-xl border border-real-estate-primary/10 bg-[#efe8d7]">
                    <iframe
                      title="Lokacioni i pronës"
                      src={`https://www.google.com/maps?q=${property.latitude},${property.longitude}&z=15&output=embed`}
                      className="h-[300px] w-full md:h-[380px]"
                      loading="lazy"
                      allowFullScreen
                    />
                  </div>
                )}
              </div>
            )}
          </div>

          <aside className="h-fit lg:sticky lg:top-28">
            <PropertyVisitCard
              propertyId={propertyId}
              title={property.title}
              price={formatPublicPrice(property.price)}
              isForSale={property.isForSale}
              propertyUrl={propertyUrl}
            />
          </aside>
        </div>
      </section>

      {similarProperties.length > 0 && (
        <section className="bg-[#ebe1cf] px-5 py-16">
          <div className="mx-auto max-w-7xl">
          <h2 className="font-title text-3xl text-real-estate-primary md:text-4xl">Prona të ngjashme</h2>
          <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {similarProperties.map((item) => (
              <PropertyCard key={String(item.propertyId)} property={item as PropertySummary} />
            ))}
          </div>
          </div>
        </section>
      )}

      {lightboxOpen && (
        <div className="fixed inset-0 z-[1100] flex flex-col bg-black/95 text-white">
          <div className="flex items-center justify-between gap-3 border-b border-white/10 px-4 py-3">
            <div className="min-w-0">
              <p className="truncate font-text text-xs uppercase tracking-[0.22em] text-real-estate-secondary">
                {property.title}
              </p>
              <p className="mt-1 text-xs text-white/55">
                {lightboxImageIndex + 1} / {galleryImages.length}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setLightboxZoom((value) => Math.max(1, Number((value - 0.25).toFixed(2))))}
                className="grid h-10 w-10 place-items-center border border-white/20 text-real-estate-secondary hover:bg-white/10"
                aria-label="Zoom out"
              >
                <ZoomOut className="h-5 w-5" />
              </button>
              <span className="w-16 text-center font-text text-xs text-white/70">
                {Math.round(lightboxZoom * 100)}%
              </span>
              <button
                type="button"
                onClick={() => setLightboxZoom((value) => Math.min(4, Number((value + 0.25).toFixed(2))))}
                className="grid h-10 w-10 place-items-center border border-white/20 text-real-estate-secondary hover:bg-white/10"
                aria-label="Zoom in"
              >
                <ZoomIn className="h-5 w-5" />
              </button>
              <button
                type="button"
                onClick={() => setLightboxOpen(false)}
                className="grid h-10 w-10 place-items-center border border-white/20 text-real-estate-secondary hover:bg-white/10"
                aria-label="Close fullscreen image"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>

          <div
            className="relative flex min-h-0 flex-1 items-center justify-center overflow-auto p-4"
            onTouchStart={(e) => {
              touchStartX.current = e.touches[0].clientX;
            }}
            onTouchEnd={(e) => {
              const dx = e.changedTouches[0].clientX - touchStartX.current;
              if (lightboxZoom === 1 && Math.abs(dx) > 50) (dx < 0 ? nextLightboxImage : previousLightboxImage)();
            }}
          >
            {galleryImages.length > 1 && (
              <>
                <button
                  type="button"
                  id="lightbox-prev"
                  onClick={previousLightboxImage}
                  className="fixed left-4 top-1/2 z-10 bg-black/70 p-3 text-real-estate-secondary hover:bg-black"
                  aria-label="Previous image"
                >
                  <ArrowLeft />
                </button>
                <button
                  type="button"
                  id="lightbox-next"
                  onClick={nextLightboxImage}
                  className="fixed right-4 top-1/2 z-10 bg-black/70 p-3 text-real-estate-secondary hover:bg-black"
                  aria-label="Next image"
                >
                  <ArrowRight />
                </button>
              </>
            )}
            <img
              src={galleryImages[lightboxImageIndex]?.imageUrl || heroImage}
              alt={`${property.title} fullscreen`}
              className="max-h-[82vh] max-w-full object-contain transition-transform duration-200"
              style={{ transform: `scale(${lightboxZoom})` }}
            />
          </div>
          {galleryImages.length > 1 && (
            <div className="no-scrollbar flex gap-2 overflow-x-auto border-t border-white/10 px-4 py-3">
              {galleryImages.map((img, index) => (
                <button
                  key={`${img.imageUrl}-thumb-${index}`}
                  type="button"
                  onClick={() => {
                    setLightboxZoom(1);
                    setLightboxImageIndex(index);
                  }}
                  aria-label={`Foto ${index + 1}`}
                  className={`h-14 w-20 shrink-0 overflow-hidden rounded-md border-2 transition ${
                    index === lightboxImageIndex ? "border-real-estate-secondary" : "border-transparent opacity-60 hover:opacity-100"
                  }`}
                >
                  <img src={img.imageUrl} alt="" loading="lazy" className="h-full w-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      <Footer />
    </div>
  );
};

export default PropertyDetailedPage;
