import React, { useEffect, useMemo, useState } from "react";
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
import { PublicVirtualTour } from "@/components/PublicVirtualTour";
import { Button } from "@/components/ui/button";
import { apiUrl } from "@/lib/api";
import { formatPublicPrice } from "@/lib/price";
import type { VirtualTour } from "@/types/virtualTour";
import logoImage from "../assets/LogoMainSection.png";
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
  if (!url) return "";
  if (/^data:/.test(url) || /^https?:\/\//i.test(url)) return url;
  if (url.startsWith("//")) return `https:${url}`;
  if (url.startsWith("/")) return `${API_ORIGIN}${url}`;
  return url;
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

const normalizeProperties = (raw: unknown): Property[] => toArray(raw) as Property[];

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
  const [properties, setProperties] = useState<Property[]>([]);
  const [internalTour, setInternalTour] = useState<VirtualTour | null>(null);
  const [activeImage, setActiveImage] = useState(0);
  const [activeMediaPanel, setActiveMediaPanel] = useState<"tour" | "floor">("tour");
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxImageIndex, setLightboxImageIndex] = useState(0);
  const [lightboxZoom, setLightboxZoom] = useState(1);

  useEffect(() => {
    if (!id) return;
    const ac = new AbortController();

    Promise.all([
      axios.get(apiUrl(`api/Property/GetProperty/${id}`), {
        headers: { Accept: "application/json" },
        signal: ac.signal,
      }),
      axios.get(apiUrl("api/Property/GetProperties"), {
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
      .then(([propertyRes, propertiesRes, mediaRes, tourRes]) => {
        const current = pickOne(propertyRes.data);
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
        setProperties(normalizeProperties(propertiesRes.data));
      })
      .catch((error) => {
        if (error?.name !== "CanceledError" && error?.code !== "ERR_CANCELED") {
          console.error("Error fetching property data:", error);
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

  if (!property) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#06130f]">
        <div className="h-9 w-9 animate-spin rounded-full border-4 border-real-estate-primary border-t-real-estate-secondary" />
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

  const openGalleryImage = (index: number) => {
    setActiveImage(index);
    setLightboxImageIndex(index);
    setLightboxZoom(1);
    setLightboxOpen(true);
  };
  const nextImage = () => setActiveImage((index) => (index + 1) % galleryImages.length);
  const previousImage = () =>
    setActiveImage((index) => (index - 1 + galleryImages.length) % galleryImages.length);
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
    <div className="min-h-screen bg-[#ebe1cf] text-real-estate-primary">
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

      <section className="bg-[#ebe1cf] px-5 py-16">
        <div className="mx-auto max-w-7xl">
        <div className="mb-6 flex items-end justify-between gap-4">
          <div>
            <p className="font-text text-sm uppercase tracking-[0.28em] text-real-estate-secondary">Galeria</p>
            <h2 className="mt-2 font-title text-4xl text-real-estate-primary md:text-5xl">Fotot dhe turi virtual</h2>
          </div>
          <div className="hidden items-center gap-3 md:flex">
            {hasVirtualTour && (
              <a href="#virtual-tour" className="inline-flex items-center gap-2 border border-real-estate-secondary px-4 py-3 font-text text-sm uppercase tracking-[0.2em] text-real-estate-secondary">
                <Compass size={17} /> Hap turin 360°
              </a>
            )}
            <button
              type="button"
              onClick={handleShareProperty}
              className="inline-flex items-center gap-2 border border-real-estate-secondary px-4 py-3 font-text text-sm uppercase tracking-[0.2em] text-real-estate-secondary transition hover:bg-real-estate-secondary hover:text-real-estate-primary"
            >
              <Share2 size={17} /> Shpërndaje
            </button>
          </div>
        </div>
        <div className="relative h-[300px] overflow-hidden rounded-md border border-real-estate-primary/15 bg-[#f5efe1] shadow-xl sm:h-[420px] md:h-[680px]">
          <button
            type="button"
            onClick={() => openGalleryImage(activeImage)}
            className="h-full w-full cursor-zoom-in"
            aria-label="Open image fullscreen"
          >
            <img loading="lazy" src={heroImage} alt={`${property.title} gallery`} className="h-full w-full object-cover" />
          </button>
          <button
            type="button"
            onClick={() => openGalleryImage(activeImage)}
            className="absolute right-4 top-4 inline-flex items-center gap-2 bg-black/65 px-3 py-2 font-text text-xs uppercase tracking-[0.16em] text-real-estate-secondary"
          >
            <Maximize2 className="h-4 w-4" /> Fullscreen
          </button>
          {galleryImages.length > 1 && (
            <>
              <button onClick={previousImage} className="absolute left-4 top-1/2 bg-black/60 p-3 text-real-estate-secondary">
                <ArrowLeft />
              </button>
              <button onClick={nextImage} className="absolute right-4 top-1/2 bg-black/60 p-3 text-real-estate-secondary">
                <ArrowRight />
              </button>
            </>
          )}
        </div>
        <div className="realo-scrollbar mt-4 flex gap-3 overflow-x-auto pb-2">
          {galleryImages.map((img, index) => (
            <button
              key={`${img.imageUrl}-${index}`}
              onClick={() => openGalleryImage(index)}
              className={`h-20 w-28 shrink-0 overflow-hidden border bg-white sm:h-24 sm:w-36 ${
                index === activeImage ? "border-real-estate-secondary" : "border-real-estate-secondary/20"
              }`}
            >
              <img loading="lazy" src={img.imageUrl} alt="" className="h-full w-full object-cover" />
            </button>
          ))}
          {hasVirtualTour && (
            <a href="#virtual-tour" className="grid h-24 w-40 shrink-0 place-items-center border border-real-estate-secondary bg-real-estate-secondary/10 text-center font-text text-sm uppercase tracking-[0.18em] text-real-estate-secondary">
              <span><Play className="mx-auto mb-1" size={20} />Tur 360°</span>
            </a>
          )}
        </div>
        </div>
      </section>

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

      {false && (hasVirtualTour || hasFloorPlan) && (
        <section id="virtual-tour" className="scroll-mt-24 border-y border-real-estate-secondary/20 bg-[#050706] text-[#f8f0df]">
          <div className="mx-auto max-w-7xl px-5 py-16 md:py-20">
            <div className="mb-8 flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
              <div>
                <p className="font-text text-sm uppercase tracking-[0.34em] text-real-estate-secondary">Prezantim imersiv</p>
                <h2 className="mt-3 max-w-4xl font-title text-[clamp(2.4rem,5vw,5rem)] leading-none">Photos And Virtual Tour</h2>
              </div>
              {hasVirtualTour && (
                <a href={property.virtualTourUrl} target="_blank" rel="noreferrer" className="inline-flex w-fit items-center gap-2 border border-real-estate-secondary px-5 py-3 font-text text-sm uppercase tracking-[0.22em] text-real-estate-secondary transition hover:bg-real-estate-secondary hover:text-real-estate-primary">
                  <Compass size={17} /> Hape
                </a>
              )}
            </div>
            <div className="mb-5 flex flex-wrap gap-3">
              {hasVirtualTour && (
                <button type="button" onClick={() => setActiveMediaPanel("tour")} className={`inline-flex items-center gap-2 border px-5 py-3 font-text text-sm uppercase tracking-[0.22em] transition ${mediaPanel === "tour" ? "border-real-estate-secondary bg-real-estate-secondary text-real-estate-primary" : "border-real-estate-secondary/55 bg-transparent text-real-estate-secondary hover:bg-real-estate-secondary hover:text-real-estate-primary"}`}>
                  <Compass size={17} /> 360° Panorama
                </button>
              )}
              {hasFloorPlan && (
                <button type="button" onClick={() => setActiveMediaPanel("floor")} className={`inline-flex items-center gap-2 border px-5 py-3 font-text text-sm uppercase tracking-[0.22em] transition ${mediaPanel === "floor" ? "border-real-estate-secondary bg-real-estate-secondary text-real-estate-primary" : "border-real-estate-secondary/55 bg-transparent text-real-estate-secondary hover:bg-real-estate-secondary hover:text-real-estate-primary"}`}>
                  <FileText size={17} /> Plan
                </button>
              )}
            </div>
            <div className="overflow-hidden rounded-md border border-real-estate-secondary/25 bg-black shadow-2xl shadow-black/50">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-real-estate-secondary/15 bg-[#0a0d0b] px-4 py-3">
                <span className="font-text text-xs uppercase tracking-[0.28em] text-real-estate-secondary">{mediaPanel === "tour" ? "Pioneer 360°" : "Floor Plan"}</span>
                <div className="flex flex-wrap gap-2">
                  {mediaPanel === "tour" && hasVirtualTour && (
                    <a href={property.virtualTourUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 border border-real-estate-secondary/50 px-3 py-2 font-text text-xs uppercase tracking-[0.18em] text-real-estate-secondary hover:bg-real-estate-secondary hover:text-real-estate-primary">
                      <ExternalLink size={15} /> Open
                    </a>
                  )}
                  {mediaPanel === "floor" && hasFloorPlan && (
                    <a href={property.floorPlanUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 border border-real-estate-secondary/50 px-3 py-2 font-text text-xs uppercase tracking-[0.18em] text-real-estate-secondary hover:bg-real-estate-secondary hover:text-real-estate-primary">
                      <Download size={15} /> Download
                    </a>
                  )}
                  <Button variant="outline" className="h-auto border-real-estate-secondary/50 bg-transparent px-3 py-2 font-text text-xs uppercase tracking-[0.18em] text-real-estate-secondary hover:bg-real-estate-secondary hover:text-real-estate-primary" onClick={() => document.getElementById("realo-media-frame")?.requestFullscreen()}>
                    <Maximize2 className="mr-2 h-4 w-4" /> Full Screen
                  </Button>
                </div>
              </div>
              <div id="realo-media-frame" className="relative min-h-[360px] bg-[#050706] md:min-h-[650px]">
                {mediaPanel === "tour" && hasVirtualTour && (
                  <iframe title={`${property.title} virtual tour`} src={property.virtualTourUrl} className="h-[420px] w-full bg-black md:h-[680px]" allow="fullscreen; accelerometer; gyroscope; xr-spatial-tracking" allowFullScreen loading="lazy" />
                )}
                {mediaPanel === "floor" && hasFloorPlan && (
                  isFloorPlanPdf ? (
                    <iframe title={`${property.title} floor plan`} src={property.floorPlanUrl} className="h-[420px] w-full bg-white md:h-[680px]" loading="lazy" />
                  ) : (
                    <div className="flex min-h-[420px] items-center justify-center bg-[#11150f] p-4 md:min-h-[680px]">
                      <img src={property.floorPlanUrl} alt={`${property.title} floor plan`} className="max-h-[640px] w-full object-contain" loading="lazy" />
                    </div>
                  )
                )}
              </div>
              <div className="flex flex-wrap gap-3 border-t border-real-estate-secondary/15 bg-[#050706] p-4">
                {hasVirtualTour && (
                  <button type="button" onClick={() => setActiveMediaPanel("tour")} className={`border px-5 py-3 font-text text-xs uppercase tracking-[0.24em] ${mediaPanel === "tour" ? "border-real-estate-secondary bg-real-estate-secondary text-real-estate-primary" : "border-real-estate-secondary/50 text-real-estate-secondary"}`}>Reception</button>
                )}
                {hasFloorPlan && (
                  <button type="button" onClick={() => setActiveMediaPanel("floor")} className={`border px-5 py-3 font-text text-xs uppercase tracking-[0.24em] ${mediaPanel === "floor" ? "border-real-estate-secondary bg-real-estate-secondary text-real-estate-primary" : "border-real-estate-secondary/50 text-real-estate-secondary"}`}>Plan</button>
                )}
              </div>
            </div>
          </div>
        </section>
      )}

      {false && (hasVirtualTour || hasFloorPlan) && (
        <section id="virtual-tour" className="scroll-mt-24 border-y border-real-estate-secondary/20 bg-real-estate-primary">
          <div className="mx-auto max-w-7xl px-5 py-16">
            <p className="font-text text-sm uppercase tracking-[0.32em] text-real-estate-secondary">Tur imersiv i pronës</p>
            <h2 className="mt-3 max-w-4xl font-title text-[clamp(2.6rem,5.6vw,5.4rem)] leading-none text-[#f8f0df]">
              Shëtit nëpër {property.title}
            </h2>
            <p className="mt-5 max-w-2xl text-[#f8f0df]/70">
              Eksploro prezantimin 360° dhe planimetrinë pa dalë nga faqja e pronës.
            </p>
            <div className="mt-10 flex flex-wrap gap-3">
              {hasVirtualTour && (
                <a href={property.virtualTourUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 border border-real-estate-secondary bg-real-estate-secondary px-5 py-3 font-text text-sm uppercase tracking-[0.2em] text-real-estate-primary">
                  <ExternalLink size={17} /> Hap turin
                </a>
              )}
              {hasFloorPlan && (
                <a href="#floor-plan" className="inline-flex items-center gap-2 border border-real-estate-secondary/70 px-5 py-3 font-text text-sm uppercase tracking-[0.2em] text-real-estate-secondary">
                  <FileText size={17} /> Planimetria
                </a>
              )}
            </div>
            {hasVirtualTour && (
              <div className="mt-8 overflow-hidden rounded-md border border-real-estate-secondary/20 bg-black">
                <div className="flex justify-end border-b border-real-estate-secondary/15 p-3">
                  <Button
                    variant="outline"
                    className="border-real-estate-secondary/50 bg-transparent text-real-estate-secondary hover:bg-real-estate-secondary hover:text-real-estate-primary"
                    onClick={() => document.getElementById("pioneer-tour-frame")?.requestFullscreen()}
                  >
                    <Maximize2 className="mr-2 h-4 w-4" /> Ekran i plotë
                  </Button>
                </div>
                <iframe
                  id="pioneer-tour-frame"
                  title={`${property.title} virtual tour`}
                  src={property.virtualTourUrl}
                  className="h-[420px] w-full md:h-[620px]"
                  allow="fullscreen; accelerometer; gyroscope; xr-spatial-tracking"
                  allowFullScreen
                  loading="lazy"
                />
              </div>
            )}
          </div>
        </section>
      )}

      {false && hasFloorPlan && (
        <section id="floor-plan" className="bg-[#f5efe1] px-5 py-16">
          <div className="mx-auto max-w-7xl">
          <div className="mb-6 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="font-text text-sm uppercase tracking-[0.28em] text-real-estate-secondary">Planimetria</p>
              <h2 className="mt-2 font-title text-5xl text-real-estate-primary">Plani i katit</h2>
            </div>
            <a href={property.floorPlanUrl} target="_blank" rel="noreferrer" className="inline-flex w-fit items-center gap-2 border border-real-estate-secondary px-4 py-3 font-text text-sm uppercase tracking-[0.2em] text-real-estate-secondary">
              <Download size={17} /> Hap planimetrinë
            </a>
          </div>
          <div className="overflow-hidden rounded-md border border-real-estate-primary/15 bg-white p-4 shadow-xl">
            {isFloorPlanPdf ? (
              <iframe title={`${property.title} floor plan`} src={property.floorPlanUrl} className="h-[680px] w-full bg-white" />
            ) : (
              <img src={property.floorPlanUrl} alt={`${property.title} floor plan`} className="max-h-[760px] w-full object-contain" loading="lazy" />
            )}
          </div>
          </div>
        </section>
      )}

      <section className="border-y border-real-estate-secondary/20 bg-[#f5efe1]">
          <div className="mx-auto grid max-w-7xl gap-8 px-5 py-16 lg:grid-cols-[1fr_380px]">
          <div>
            <h2 className="font-title text-5xl text-real-estate-primary">Detajet e pronës</h2>
            <p className="mt-5 max-w-3xl text-lg leading-8 text-real-estate-primary/75">
              {property.description || "Nuk ka përshkrim të disponueshëm."}
            </p>
            {detailFacts.length > 0 && (
              <div className="mt-8 grid gap-3 sm:grid-cols-2 md:grid-cols-3">
                {detailFacts.map(({ icon: Icon, label, value }) => (
                  <span key={label} className="flex items-center gap-3 border border-real-estate-primary/15 bg-white/65 p-3 text-real-estate-primary/75">
                    <Icon size={17} className="text-real-estate-secondary" />
                    <span><strong className="text-real-estate-primary">{value}</strong> {label}</span>
                  </span>
                ))}
              </div>
            )}
            {features.length > 0 && (
              <div className="mt-8 grid gap-3 sm:grid-cols-2 md:grid-cols-4">
                {features.map((feature) => (
                  <span key={String(feature)} className="flex items-center gap-2 border border-real-estate-primary/15 bg-white/65 p-3 text-real-estate-primary/70">
                    <Check size={16} className="text-real-estate-secondary" /> {feature}
                  </span>
                ))}
              </div>
            )}
            {hasCoordinates && (
              <div className="mt-10 overflow-hidden rounded-md border border-real-estate-secondary/20 bg-black">
                <iframe
                  title="Lokacioni i pronës"
                  src={`https://www.google.com/maps?q=${property.latitude},${property.longitude}&z=15&output=embed`}
                  className="h-[360px] w-full"
                  loading="lazy"
                  allowFullScreen
                />
              </div>
            )}
          </div>
          <aside className="h-fit border border-real-estate-primary/15 bg-white p-6 shadow-xl lg:sticky lg:top-28">
            <div className="flex items-center gap-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-md bg-real-estate-primary p-2">
                <img src={logoImage} alt="Realo Real Estate" className="h-full w-full object-contain" />
              </div>
              <div>
                <h3 className="text-xl text-real-estate-primary">Realo Real Estate</h3>
                <a href="tel:+38348282262" className="text-real-estate-secondary">+383 48 282 262</a>
              </div>
            </div>
            <Button
              asChild
              className="mt-6 w-full bg-real-estate-secondary text-real-estate-primary hover:bg-white"
            >
              <a href={whatsappUrl} target="_blank" rel="noreferrer">
              Kërko vizitë
              </a>
            </Button>
          </aside>
        </div>
      </section>

      {similarProperties.length > 0 && (
        <section className="bg-[#ebe1cf] px-5 py-16">
          <div className="mx-auto max-w-7xl">
          <p className="font-text text-sm uppercase tracking-[0.3em] text-real-estate-secondary">Prona të ngjashme</p>
          <div className="mt-8 grid gap-6 md:grid-cols-4">
            {similarProperties.map((item) => (
              <PropertyCard
                key={String(item.propertyId)}
                property={item as any}
                onClick={() => navigate(`/properties/${encodeURIComponent(item.title)}/${item.propertyId}`)}
              />
            ))}
          </div>
          </div>
        </section>
      )}

      {lightboxOpen && (
        <div className="fixed inset-0 z-[100] flex flex-col bg-black/95 text-white">
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

          <div className="relative flex min-h-0 flex-1 items-center justify-center overflow-auto p-4">
            {galleryImages.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={previousLightboxImage}
                  className="fixed left-4 top-1/2 z-10 bg-black/70 p-3 text-real-estate-secondary hover:bg-black"
                  aria-label="Previous image"
                >
                  <ArrowLeft />
                </button>
                <button
                  type="button"
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
        </div>
      )}

      <Footer />
    </div>
  );
};

export default PropertyDetailedPage;
