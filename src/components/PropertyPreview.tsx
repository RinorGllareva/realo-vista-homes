import React, { useRef, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { IoIosArrowBack, IoIosArrowForward } from "react-icons/io";
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

const PropertyPreview: React.FC = () => {
  const navigate = useNavigate();
  const trackRef = useRef<HTMLDivElement>(null);
  const [properties, setProperties] = useState<Property[]>([]);

  useEffect(() => {
    (async () => {
      try {
        const { data } = await axios.get(
          "https://realo-realestate.com/api/api/Property/GetProperties"
        );
        setProperties(data || []);
      } catch (e) {
        console.error("Error fetching properties:", e);
      }
    })();
  }, []);

  const getTypeLabel = (t: string) => {
    const map: Record<string, string> = {
      house: "Shtëpi",
      apartment: "Banesa",
      office: "Zyrë",
      store: "Lokal",
      land: "Toka",
      building: "Objekte",
    };
    return map[t?.toLowerCase?.()] || t;
  };

  const scrollLeft = () => {
    if (!trackRef.current) return;
    trackRef.current.scrollBy({
      left: -trackRef.current.clientWidth,
      behavior: "smooth",
    });
  };
  const scrollRight = () => {
    if (!trackRef.current) return;
    trackRef.current.scrollBy({
      left: trackRef.current.clientWidth,
      behavior: "smooth",
    });
  };

  const openDetail = (p: Property) =>
    navigate(`/properties/${p.title}/${p.propertyId}`);

  // Small helper to render a vertical icon+label
  const spec = (icon: React.ReactNode, label: string) => (
    <div className="flex flex-col items-center justify-start w-1/4 min-w-[56px]">
      <div className="text-[1.15rem] text-[#666]">{icon}</div>
      <span className="mt-1 text-[0.72rem] leading-tight text-[#666] text-center">
        {label}
      </span>
    </div>
  );

  return (
    <section className="relative bg-[#ebe1cf] px-5 py-10 overflow-hidden">
      {/* header */}
      <div className="mb-6 text-center">
        <div className="flex items-center justify-center gap-3">
          <h1 className="font-title text-[#7e7859] font-light text-4xl md:text-5xl">
            REALO's
          </h1>
          <h3 className="font-title text-[#7e7859] font-light text-3xl md:text-4xl">
            New Properties
          </h3>
        </div>
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
        className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg黑/50 hover:bg黑/70 text-white p-2 text-2xl z-30 transition"
      >
        <IoIosArrowForward />
      </button>

      {/* track */}
      <div
        ref={trackRef}
        className="
          flex gap-5 pb-5 overflow-x-auto scroll-smooth
          [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden
        "
      >
        {properties.map((p) => {
          const type = p.propertyType?.toLowerCase?.();

          return (
            <div
              key={p.propertyId}
              onClick={() => openDetail(p)}
              className="
                relative cursor-pointer
                flex-none
                basis-[55%] max-w-[300px] min-w-[250px]
                md:basis-[45%]
                sm:basis-[60%]
                max-[450px]:basis-[40%]
                bg-white border border-gray-200 rounded-[8px]
                shadow-[0_4px_10px_rgba(0,0,0,0.1)]
                transition-transform hover:-translate-y-[5px]
              "
            >
              {/* SALE/RENT tag */}
              <span className="absolute top-2 left-2 z-20 bg-[#d46905] text-white px-2 py-1 text-[12px] font-bold rounded">
                {p.isForSale ? "SHITJE" : "QERA"}
              </span>
              {/* type tag */}
              <span className="absolute top-2 right-2 z-20 bg-[#d4b505] text-white px-2 py-1 text-[12px] font-bold rounded">
                {getTypeLabel(p.propertyType)}
              </span>

              {/* image */}
              <div className="relative h-[180px] overflow-hidden">
                <img
                  src={
                    p.images?.[0]?.imageUrl ||
                    "https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=800"
                  }
                  alt={p.title}
                  className="h-full w-full object-cover"
                  loading="lazy"
                />
              </div>

              {/* details */}
              <div className="p-[15px] text-left">
                <h3 className="font-[Montserrat] text-[14px] text-[#888]">
                  {p.city}
                </h3>
                <p className="font-[Montserrat] text-[16px] font-bold text-[#333] mb-1">
                  {p.title}
                </p>
                <p className="font-[Montserrat] text-[20px] text-[#d4b505] font-[200] mt-1">
                  €{(p.price ?? 0).toLocaleString()}
                </p>

                {/* icons grid: icons on top, numbers+labels below */}
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

      {/* view more */}
      <div className="mt-8 text-center">
        <button
          onClick={() => navigate("/Property")}
          className="
            bg-[#4a5968] hover:bg-[#333] text-white
            px-5 py-2 rounded
            font-text text-[1.2rem]
            transition-colors
          "
        >
          Shikoni Të Gjitha Pronat
        </button>
      </div>
    </section>
  );
};

export default PropertyPreview;
