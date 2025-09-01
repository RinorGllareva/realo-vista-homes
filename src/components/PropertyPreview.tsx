import React, { useRef, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { IoIosArrowBack, IoIosArrowForward } from "react-icons/io";
import { IoBedOutline } from "react-icons/io5";
import { PiBathtub } from "react-icons/pi";
import { MdSquareFoot, MdMeetingRoom } from "react-icons/md";
import { SiLevelsdotfyi } from "react-icons/si";
import { apiUrl } from "@/lib/api";

interface Property {
  propertyId: string | number;
  title: string;
  city: string;
  price:string;
  propertyType: string;
  isForSale: boolean;
  bedrooms?: number;
  bathrooms?: number;
  floorLevel?: number | string;
  squareFeet?: number;
  spaces?: number;
  images?: Array<{ imageUrl: string }> | { imageUrl: string } | string | null;
}

/* ---------------- helpers ---------------- */
const API_BASE = (import.meta.env.VITE_API_URL ?? "").replace(/\/+$/, "");

function normalizeToArray(raw: unknown): Property[] {
  if (Array.isArray(raw)) return raw as Property[];
  if (!raw || typeof raw !== "object") return [];
  const r = raw as any;
  if (Array.isArray(r.$values)) return r.$values as Property[]; // .NET
  if (Array.isArray(r.data)) return r.data as Property[];
  if (Array.isArray(r.result)) return r.result as Property[];
  if (Array.isArray(r.items)) return r.items as Property[];
  return [];
}

function normalizeImages(x: unknown): Array<{ imageUrl: string }> {
  if (Array.isArray(x)) return x as Array<{ imageUrl: string }>;
  if (x && typeof x === "object" && "imageUrl" in (x as any)) {
    return [x as { imageUrl: string }];
  }
  if (typeof x === "string") {
    return x
      .split(",")
      .map((s) => ({ imageUrl: s.trim() }))
      .filter((o) => o.imageUrl);
  }
  return [];
}
/* ----------------------------------------- */

const PropertyPreview: React.FC = () => {
  const navigate = useNavigate();
  const trackRef = useRef<HTMLDivElement>(null);
  const [properties, setProperties] = useState<Property[]>([]);

  useEffect(() => {
    const ac = new AbortController();
    (async () => {
      try {
        const res = await axios.get(apiUrl("api/Property/GetProperties"), {
          headers: { Accept: "application/json" },
          signal: ac.signal,
        });

        const ct = String(res.headers?.["content-type"] || "");
        if (!ct.includes("application/json")) {
          console.error(
            "Expected JSON but got",
            ct,
            "from",
            res.request?.responseURL
          );
          setProperties([]); // keep UI safe
          return;
        }

        setProperties(normalizeToArray(res.data));
      } catch (e: any) {
        if (e?.name !== "CanceledError" && e?.code !== "ERR_CANCELED") {
          console.error("Error fetching properties:", e);
          setProperties([]);
        }
      }
    })();
    return () => ac.abort();
  }, []);

  const getTypeLabel = (t: string) => {
    const map: Record<string, string> = {
      house: "Shtëpi",
      apartment: "Banesa",
      office: "Zyrë",
      store: "Lokal",
      land: "Toka",
      building: "Objekte",
      warehouse: "Depo",
    };
    return map[t?.toLowerCase?.()] || t || "";
  };

  const scrollLeft = () =>
    trackRef.current?.scrollBy({
      left: -(trackRef.current?.clientWidth || 0),
      behavior: "smooth",
    });

  const scrollRight = () =>
    trackRef.current?.scrollBy({
      left: trackRef.current?.clientWidth || 0,
      behavior: "smooth",
    });

  const openDetail = (p: Property) =>
    navigate(`/properties/${encodeURIComponent(p.title)}/${p.propertyId}`);

  const spec = (icon: React.ReactNode, label: string) => (
    <div className="flex flex-col items-center justify-start w-1/4 min-w-[56px]">
      <div className="text-[1.15rem] text-[#666]">{icon}</div>
      <span className="mt-1 text-[0.72rem] leading-tight text-[#666] text-center">
        {label}
      </span>
    </div>
  );

  const list = Array.isArray(properties) ? properties : [];

  return (
    <section className="relative bg-[#ebe1cf] px-5 py-10 overflow-hidden">
      {/* header */}
      <div className="mb-6 text-center">
        <div className="flex items-center justify-center gap-3">
          <h1 className="font-title text-[#7e7859] font-light text-4xl md:text-5xl">
            REALO&apos;s
          </h1>
        </div>
        <h3 className="font-title text-[#7e7859] font-light text-3xl md:text-4xl">
          New Properties
        </h3>
        <hr className="mt-4 w-24 mx-auto border-[#bdb8a1]" />
      </div>

      {/* arrows */}
      <button
        onClick={scrollLeft}
        aria-label="Scroll left"
        className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full bg-black/50 hover:bg-black/70 text-white p-2 text-2xl z-30 transition"
      >
        <IoIosArrowBack />
      </button>
      <button
        onClick={scrollRight}
        aria-label="Scroll right"
        className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-black/50 hover:bg-black/70 text-white p-2 text-2xl z-30 transition"
      >
        <IoIosArrowForward />
      </button>

      {/* track */}
      <div
        ref={trackRef}
        className="flex gap-5 pb-5 overflow-x-auto scroll-smooth [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {list.map((p) => {
          const type = p.propertyType?.toLowerCase?.() || "";
          const priceNumber =
            typeof p.price === "string"
              ? Number(p.price.replace(/[^\d.]/g, ""))
              : Number(p.price ?? 0);

          const firstImg =
            normalizeImages(p.images)[0]?.imageUrl ||
            "https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=800&auto=format&fit=crop";

          return (
            <div
              key={String(p.propertyId)}
              onClick={() => openDetail(p)}
              className="relative cursor-pointer flex-none basis-[55%] max-w-[300px] min-w-[250px]
                         md:basis-[45%] sm:basis-[60%] max-[450px]:basis-[40%]
                         bg-white border border-gray-200 rounded-[8px]
                         shadow-[0_4px_10px_rgba(0,0,0,0.1)] transition-transform hover:-translate-y-[5px]"
            >
              <span className="absolute top-2 left-2 z-20 bg-[#d46905] text-white px-2 py-1 text-[12px] font-bold rounded">
                {p.isForSale ? "SHITJE" : "QERA"}
              </span>
              <span className="absolute top-2 right-2 z-20 bg-[#d4b505] text-white px-2 py-1 text-[12px] font-bold rounded">
                {getTypeLabel(p.propertyType)}
              </span>

              <div className="relative h-[180px] overflow-hidden">
                <img
                  src={firstImg}
                  alt={p.title}
                  className="h-full w-full object-cover"
                  loading="lazy"
                />
              </div>

              <div className="p-[15px] text-left">
                <h3 className="font-[Montserrat] text-[14px] text-[#888]">
                  {p.city}
                </h3>
                <p className="font-[Montserrat] text-[16px] font-bold text-[#333] mb-1">
                  {p.title}
                </p>
                <p className="font-[Montserrat] text-[20px] text-[#d4b505] font-[200] mt-1">
                  €{p.price}
                </p>

                <div className="mt-3 flex flex-wrap justify-between gap-0">
                  {type === "house" || type === "apartment" ? (
                    <>
                      {spec(<IoBedOutline />, `${p.bedrooms ?? "-"} Dhoma`)}
                      {spec(<PiBathtub />, `${p.bathrooms ?? "-"} Banjo`)}
                      {spec(<SiLevelsdotfyi />, `${p.floorLevel ?? "-"} Kati`)}
                      {spec(<MdSquareFoot />, `${p.squareFeet ?? "-"}m²`)}
                    </>
                  ) : type === "office" || type === "store" ? (
                    <>
                      {spec(<MdMeetingRoom />, `${p.spaces ?? "-"} Hapësira`)}
                      {spec(<PiBathtub />, `${p.bathrooms ?? "-"} Banjo`)}
                      {spec(<SiLevelsdotfyi />, `${p.floorLevel ?? "-"} Kati`)}
                      {spec(<MdSquareFoot />, `${p.squareFeet ?? "-"}m²`)}
                    </>
                  ) : type === "land" ? (
                    spec(<MdSquareFoot />, `${p.squareFeet ?? "-"}m²`)
                  ) : type === "building" ? (
                    <>
                      {spec(<MdMeetingRoom />, `${p.spaces ?? "-"} Hapësira`)}
                      {spec(<SiLevelsdotfyi />, `${p.floorLevel ?? "-"} Kati`)}
                      {spec(<MdSquareFoot />, `${p.squareFeet ?? "-"}m²`)}
                    </>
                  ) : null}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-8 text-center">
        <button
          onClick={() => navigate("/Property")}
          className="bg-[#4a5968] hover:bg-[#333] text-white px-5 py-2 rounded font-text text-[1.2rem] transition-colors"
        >
          Shikoni Të Gjitha Pronat
        </button>
      </div>
    </section>
  );
};

export default PropertyPreview;
