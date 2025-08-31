import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { IoBedOutline } from "react-icons/io5";
import { PiBathtub } from "react-icons/pi";
import { MdSquareFoot, MdMeetingRoom } from "react-icons/md";
import { SiLevelsdotfyi } from "react-icons/si";
import { IoIosArrowBack, IoIosArrowForward } from "react-icons/io";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { Button } from "@/components/ui/button";
import { apiUrl } from "@/lib/api";

interface ImgObj {
  imageUrl: string;
}

interface Property {
  propertyId: string;
  title: string;
  city: string;
  price: number | string;
  propertyType: string;
  isForSale: boolean;
  description?: string;
  address?: string;
  state?: string;
  zipCode?: string;
  bedrooms?: number;
  bathrooms?: number;
  floorLevel?: number | string;
  squareFeet?: number;
  spaces?: number;
  orientation?: string;
  heatingSystem?: string;
  furniture?: string;
  additionalFeatures?: string;
  hasOwnershipDocument?: boolean;
  neighborhood?: string;
  builder?: string;
  complex?: string;
  country?: string;
  latitude?: number;
  longitude?: number;
  interiorVideo?: string;
  images?: ImgObj[] | ImgObj | string | null;
}

/* ---------------------- helpers (logic only) ---------------------- */
const API_BASE = (import.meta.env.VITE_API_URL ?? "").replace(/\/+$/, "");
const API_ORIGIN = API_BASE
  ? new URL(API_BASE).origin
  : typeof window !== "undefined"
  ? window.location.origin
  : "";

// extract a likely URL from many shapes
const extractUrl = (val: unknown): string => {
  if (!val) return "";
  if (typeof val === "string") return val;
  if (typeof val === "object") {
    const o = val as any;
    if (typeof o.imageUrl === "string") return o.imageUrl;
    if (typeof o.url === "string") return o.url;
    if (typeof o.src === "string") return o.src;
    if (typeof o.link === "string") return o.link;
    if (typeof o.href === "string") return o.href;
    if (o.imageUrl && typeof o.imageUrl === "object") {
      const nested = extractUrl(o.imageUrl);
      if (nested) return nested;
    }
    // last resort: first string value on the object
    for (const k of Object.keys(o)) {
      if (typeof o[k] === "string") return o[k];
    }
  }
  return "";
};

// make relative paths absolute to the API origin
const toAbsoluteUrl = (u: string): string => {
  if (!u) return "";
  if (/^data:/.test(u) || /^https?:\/\//i.test(u)) return u;
  if (u.startsWith("//")) return `https:${u}`;
  if (u.startsWith("/")) return `${API_ORIGIN}${u}`;
  return u;
};

const toArray = (raw: any): any[] => {
  if (Array.isArray(raw)) return raw;
  if (raw && typeof raw === "object") {
    if (Array.isArray(raw.$values)) return raw.$values;
    if (Array.isArray(raw.data)) return raw.data;
    if (Array.isArray(raw.items)) return raw.items;
    if (Array.isArray(raw.result)) return raw.result;
  }
  return [];
};

function normalizeImages(x: unknown): ImgObj[] {
  // supports: array, single object, comma-separated string, or nested lists
  if (Array.isArray(x)) {
    return (x as any[])
      .map((it, i) => ({
        imageUrl: toAbsoluteUrl(extractUrl(it) || ""),
      }))
      .filter((it) => it.imageUrl);
  }
  if (x && typeof x === "object") {
    const arr = toArray(x);
    if (arr.length) {
      return arr
        .map((it) => ({ imageUrl: toAbsoluteUrl(extractUrl(it) || "") }))
        .filter((it) => it.imageUrl);
    }
    const single = extractUrl(x);
    return single ? [{ imageUrl: toAbsoluteUrl(single) }] : [];
  }
  if (typeof x === "string") {
    return x
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean)
      .map((s) => ({ imageUrl: toAbsoluteUrl(s) }));
  }
  return [];
}

function pickOne<T>(v: unknown): T | null {
  if (Array.isArray(v)) return (v[0] as T) ?? null;
  if (v && typeof v === "object") {
    const o: any = v;
    if (Array.isArray(o.$values) && o.$values.length)
      return (o.$values[0] as T) ?? null;
    if (Array.isArray(o.data) && o.data.length) return (o.data[0] as T) ?? null;
    if (Array.isArray(o.items) && o.items.length)
      return (o.items[0] as T) ?? null;
    if (Array.isArray(o.result) && o.result.length)
      return (o.result[0] as T) ?? null;
  }
  return (v as T) ?? null;
}
/* ------------------------------------------------------------------ */

const PropertyDetailedPage = () => {
  const navigate = useNavigate();
  const { title, id } = useParams();
  const [property, setProperty] = useState<Property | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [photoIndex, setPhotoIndex] = useState(0);
  const sliderRef = useRef<Slider>(null);
  const virtualPortRef = useRef<HTMLDivElement>(null);

  const scrollToVirtualTour = () => {
    virtualPortRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleContactClick = () => {
    navigate("/contact-us");
  };

  const scrollLeft = () => {
    sliderRef.current?.slickPrev();
  };

  const scrollRight = () => {
    sliderRef.current?.slickNext();
  };

  useEffect(() => {
    const ac = new AbortController();

    const fetchPropertyData = async () => {
      try {
        const url = apiUrl(`api/Property/GetProperty/${id}`);
        const { data } = await axios.get(url, {
          headers: { Accept: "application/json" },
          signal: ac.signal,
        });

        // Some APIs return a list/special shapes; pick one robustly
        let p = pickOne<Property>(data) ?? (data as Property);

        // Normalize images: handle arrays, objects, strings, nested $values, etc.
        const imgs =
          normalizeImages((p as any)?.images) ||
          normalizeImages((p as any)?.propertyImages) ||
          [];

        p = { ...(p as Property), images: imgs };

        setProperty(p);
      } catch (error: any) {
        if (error?.name === "CanceledError" || error?.code === "ERR_CANCELED")
          return;
        console.error("Error fetching property data:", error);
        setProperty(null);
      }
    };

    if (id) fetchPropertyData();
    return () => ac.abort();
  }, [id]);

  if (!property) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-muted-foreground">
            Loading property details...
          </p>
        </div>
      </div>
    );
  }

  const sliderSettings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    arrows: false,
    centerMode: true,
  } as const;

  const images = normalizeImages(property.images);
  const imageUrls = images.map((img) => img.imageUrl);

  const handleImageClick = (index: number) => {
    setPhotoIndex(index);
    setIsOpen(true);
  };

  const renderIcons = () => {
    const type = (property.propertyType || "").toLowerCase();

    switch (type) {
      case "house":
        return (
          <>
            <span className="flex items-center gap-2 text-foreground">
              <IoBedOutline className="text-xl" /> {property.bedrooms ?? "-"}{" "}
              Dhoma
            </span>
            <span className="text-muted-foreground">|</span>
            <span className="flex items-center gap-2 text-foreground">
              <PiBathtub className="text-xl" /> {property.bathrooms ?? "-"}{" "}
              Banjo
            </span>
            <span className="text-muted-foreground">|</span>
            <span className="flex items-center gap-2 text-foreground">
              <SiLevelsdotfyi className="text-xl" />{" "}
              {property.floorLevel ?? "-"} Katet
            </span>
            <span className="text-muted-foreground">|</span>
            <span className="flex items-center gap-2 text-foreground">
              <MdSquareFoot className="text-xl" /> {property.squareFeet ?? "-"}{" "}
              m²
            </span>
          </>
        );

      case "apartment":
        return (
          <>
            <span className="flex items-center gap-2 text-foreground">
              <IoBedOutline className="text-xl" /> {property.bedrooms ?? "-"}{" "}
              Dhoma
            </span>
            <span className="text-muted-foreground">|</span>
            <span className="flex items-center gap-2 text-foreground">
              <PiBathtub className="text-xl" /> {property.bathrooms ?? "-"}{" "}
              Banjo
            </span>
            <span className="text-muted-foreground">|</span>
            <span className="flex items-center gap-2 text-foreground">
              <SiLevelsdotfyi className="text-xl" />{" "}
              {property.floorLevel ?? "-"} Kati
            </span>
            <span className="text-muted-foreground">|</span>
            <span className="flex items-center gap-2 text-foreground">
              <MdSquareFoot className="text-xl" /> {property.squareFeet ?? "-"}{" "}
              m²
            </span>
          </>
        );

      case "office":
      case "store":
        return (
          <>
            <span className="flex items-center gap-2 text-foreground">
              <MdMeetingRoom className="text-xl" /> {property.spaces ?? "-"}{" "}
              Hapësira
            </span>
            <span className="text-muted-foreground">|</span>
            <span className="flex items-center gap-2 text-foreground">
              <PiBathtub className="text-xl" /> {property.bathrooms ?? "-"}{" "}
              Banjo
            </span>
            <span className="text-muted-foreground">|</span>
            <span className="flex items-center gap-2 text-foreground">
              <SiLevelsdotfyi className="text-xl" />{" "}
              {property.floorLevel ?? "-"} Kati
            </span>
            <span className="text-muted-foreground">|</span>
            <span className="flex items-center gap-2 text-foreground">
              <MdSquareFoot className="text-xl" /> {property.squareFeet ?? "-"}{" "}
              m²
            </span>
          </>
        );

      case "land":
        return (
          <span className="flex items-center gap-2 text-foreground">
            <MdSquareFoot className="text-xl" /> {property.squareFeet ?? "-"} m²
          </span>
        );

      case "building":
        return (
          <>
            <span className="flex items-center gap-2 text-foreground">
              <MdMeetingRoom className="text-xl" /> {property.spaces ?? "-"}{" "}
              Hapësira
            </span>
            <span className="text-muted-foreground">|</span>
            <span className="flex items-center gap-2 text-foreground">
              <SiLevelsdotfyi className="text-xl" />{" "}
              {property.floorLevel ?? "-"} Kati
            </span>
            <span className="text-muted-foreground">|</span>
            <span className="flex items-center gap-2 text-foreground">
              <MdSquareFoot className="text-xl" /> {property.squareFeet ?? "-"}{" "}
              m²
            </span>
          </>
        );

      default:
        return null;
    }
  };

  const priceText =
    typeof property.price === "number"
      ? property.price.toLocaleString()
      : String(property.price ?? "");

  return (
    <div className="min-h-screen bg-background">
      <Header />

      {/* Property Header */}
      <div className="pt-40 px-4 md:px-16 max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-baseline mb-4">
          <h1 className="text-2xl md:text-4xl font-filter text-foreground">
            {property.title}, {property.city}
          </h1>
          <p className="text-2xl md:text-3xl font-filter font-bold text-real-estate-secondary mt-2 md:mt-0">
            €{priceText}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3 text-sm md:text-base text-muted-foreground">
          {renderIcons()}
        </div>
      </div>

      {/* Image Slider */}
      <div className="relative w-full mt-8">
        <Slider ref={sliderRef} {...sliderSettings}>
          {images.map((image, index) => (
            <div key={index} className="relative">
              <img
                src={image.imageUrl}
                alt={`Property ${index + 1}`}
                className="w-full h-76 md:h-[500px] object-cover cursor-pointer"
                onClick={() => handleImageClick(index)}
              />
            </div>
          ))}
        </Slider>

        <button
          onClick={scrollLeft}
          className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-3 rounded-full text-2xl z-10 transition-colors"
        >
          <IoIosArrowBack />
        </button>
        <button
          onClick={scrollRight}
          className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-3 rounded-full text-2xl z-10 transition-colors"
        >
          <IoIosArrowForward />
        </button>
      </div>

      {/* Image Modal */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-4xl w-full p-0 bg-black">
          <div className="relative">
            <img
              src={imageUrls[photoIndex]}
              alt={`Property ${photoIndex + 1}`}
              className="w-full h-auto max-h-[80vh] object-contain"
            />

            {/* Navigation arrows */}
            <button
              onClick={() =>
                setPhotoIndex((photoIndex + images.length - 1) % images.length)
              }
              className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-3 rounded-full text-2xl transition-colors"
            >
              <IoIosArrowBack />
            </button>
            <button
              onClick={() => setPhotoIndex((photoIndex + 1) % images.length)}
              className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-3 rounded-full text-2xl transition-colors"
            >
              <IoIosArrowForward />
            </button>

            {/* Image counter */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/50 text-white px-3 py-1 rounded">
              {photoIndex + 1} / {images.length}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Navigation Bar */}
      <div className="bg-slate-600 text-white px-4 md:px-8 py-4 flex flex-col md:flex-row justify-between items-center gap-4 -mt-8 relative z-20">
        <Button
          onClick={handleContactClick}
          className="bg-real-estate-secondary hover:bg-real-estate-secondary/90 text-black font-title font-bold"
        >
          Book A Viewing
        </Button>
        <div className="flex gap-4 md:gap-8 text-sm md:text-base font-text">
          <a
            href="#details"
            className="hover:text-real-estate-secondary transition-colors"
          >
            DETAJET
          </a>
          {property.interiorVideo && (
            <a
              href="#virtual-tour"
              onClick={scrollToVirtualTour}
              className="hover:text-real-estate-secondary transition-colors cursor-pointer"
            >
              VIRTUAL TOUR
            </a>
          )}
        </div>
      </div>

      {/* Property Details */}
      <div id="details" className="bg-gray-100 px-4 md:px-8 py-8">
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Description */}
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl md:text-3xl font-logo font-bold text-foreground mb-4">
                Informatat e Pronës
              </h2>
              <hr className="border-gray-300 mb-4" />
              <p className="text-muted-foreground leading-relaxed mb-6 font-text">
                {property.description || "No description available."}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm font-text">
              <div className="space-y-3">
                {property.address &&
                  property.city &&
                  property.state &&
                  property.zipCode && (
                    <p>
                      <strong className="text-foreground">Adresa:</strong>{" "}
                      {property.address}, {property.city}, {property.state},{" "}
                      {property.zipCode}
                    </p>
                  )}
                {property.bedrooms && (
                  <p>
                    <strong className="text-foreground">Dhomat:</strong>{" "}
                    {property.bedrooms}
                    {property.bathrooms && (
                      <>
                        {" | "}
                        <strong className="text-foreground">
                          Banjot:
                        </strong>{" "}
                        {property.bathrooms}
                      </>
                    )}
                  </p>
                )}
                {property.squareFeet && (
                  <p>
                    <strong className="text-foreground">Siperfaqja:</strong>{" "}
                    {property.squareFeet} m²
                  </p>
                )}
                {property.orientation &&
                  property.orientation !== "N/A" &&
                  property.orientation !== "string" && (
                    <p>
                      <strong className="text-foreground">Orientimi:</strong>{" "}
                      {property.orientation}
                    </p>
                  )}
                {property.heatingSystem &&
                  property.heatingSystem !== "N/A" &&
                  property.heatingSystem !== "string" && (
                    <p>
                      <strong className="text-foreground">
                        Sistemi i Ngrohjes:
                      </strong>{" "}
                      {property.heatingSystem}
                    </p>
                  )}
                {property.furniture &&
                  property.furniture !== "N/A" &&
                  property.furniture !== "string" && (
                    <p>
                      <strong className="text-foreground">Mobile:</strong>{" "}
                      {property.furniture}
                    </p>
                  )}
              </div>

              <div className="space-y-3">
                {property.hasOwnershipDocument !== undefined && (
                  <p>
                    <strong className="text-foreground">Fleta Poseduse:</strong>{" "}
                    {property.hasOwnershipDocument ? "Po" : "Jo"}
                  </p>
                )}
                {property.floorLevel &&
                  property.floorLevel !== "N/A" &&
                  property.floorLevel !== "string" && (
                    <p>
                      <strong className="text-foreground">Kati:</strong>{" "}
                      {property.floorLevel}
                    </p>
                  )}
                {property.neighborhood &&
                  property.neighborhood !== "N/A" &&
                  property.neighborhood !== "string" && (
                    <p>
                      <strong className="text-foreground">Lagjia:</strong>{" "}
                      {property.neighborhood}
                    </p>
                  )}
                {property.builder &&
                  property.builder !== "N/A" &&
                  property.builder !== "string" && (
                    <p>
                      <strong className="text-foreground">Ndertuesit:</strong>{" "}
                      {property.builder}
                    </p>
                  )}
                {property.complex &&
                  property.complex !== "N/A" &&
                  property.complex !== "string" && (
                    <p>
                      <strong className="text-foreground">
                        Kompleksi Banesor:
                      </strong>{" "}
                      {property.complex}
                    </p>
                  )}
                {property.country &&
                  property.country !== "N/A" &&
                  property.country !== "string" && (
                    <p>
                      <strong className="text-foreground">Shteti:</strong>{" "}
                      {property.country}
                    </p>
                  )}
                {property.additionalFeatures &&
                  property.additionalFeatures !== "N/A" &&
                  property.additionalFeatures !== "string" && (
                    <p>
                      <strong className="text-foreground">
                        Vecori të Tjera:
                      </strong>{" "}
                      {property.additionalFeatures}
                    </p>
                  )}
              </div>
            </div>
          </div>

          {/* Map */}
          <div className="h-96 rounded-lg overflow-hidden border border-gray-300">
            <iframe
              title="Property Location"
              width="100%"
              height="100%"
              frameBorder="0"
              src={`https://www.google.com/maps?q=${
                property.latitude || 42.6629
              },${property.longitude || 21.1655}&z=15&output=embed`}
              allowFullScreen
              className="w-full h-full"
            />
          </div>
        </div>
      </div>

      {/* Virtual Tour */}
      {property.interiorVideo && (
        <div
          id="virtual-tour"
          ref={virtualPortRef}
          className="bg-amber-50 px-4 md:px-8 py-8"
        >
          <div className="max-w-4xl mx-auto">
            <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-4 text-center">
              Property Virtual Tour
            </h2>
            <hr className="border-gray-300 mb-6 w-24 mx-auto" />
            <div className="aspect-video rounded-lg overflow-hidden">
              <iframe
                src={property.interiorVideo}
                width="100%"
                height="100%"
                frameBorder="0"
                allowFullScreen
                title="Virtual Tour"
                className="w-full h-full"
              />
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
};

export default PropertyDetailedPage;
