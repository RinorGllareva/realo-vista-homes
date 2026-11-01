import React, { useRef, useState } from "react";
import { Expand, Images, Play } from "lucide-react";

interface PropertyGalleryProps {
  images: Array<{ imageUrl: string }>;
  title: string;
  hasVirtualTour: boolean;
  onOpen: (index: number) => void;
}

// Desktop: one large photo with up to four beside it. Phones: a swipeable full-width strip.
const tileLayout = (count: number, index: number) => {
  if (count === 1) return "col-span-4 row-span-2";
  if (count === 2) return "col-span-2 row-span-2";
  if (index === 0) return "col-span-2 row-span-2";
  if (count === 3) return "col-span-2 row-span-1";
  if (count === 4 && index === 1) return "col-span-2 row-span-1";
  return "col-span-1 row-span-1";
};

const PropertyGallery: React.FC<PropertyGalleryProps> = ({ images, title, hasVirtualTour, onOpen }) => {
  const [current, setCurrent] = useState(0);
  const stripRef = useRef<HTMLDivElement>(null);
  const tiles = images.slice(0, 5);

  const onStripScroll = () => {
    const el = stripRef.current;
    if (!el) return;
    setCurrent(Math.round(el.scrollLeft / el.clientWidth));
  };

  const tourChip = hasVirtualTour && (
    <a
      href="#virtual-tour"
      className="absolute left-3 top-3 z-10 inline-flex items-center gap-1.5 rounded-full bg-real-estate-primary/90 px-3.5 py-2 text-xs font-semibold uppercase tracking-[0.12em] text-real-estate-secondary shadow-lg backdrop-blur transition hover:bg-real-estate-primary"
    >
      <Play className="h-3.5 w-3.5 fill-current" /> Tur 360°
    </a>
  );

  return (
    <section className="bg-[#fbfaf7] px-4 pb-4 pt-10 md:px-5 md:pt-14">
      <div className="mx-auto max-w-7xl">
        <div className="mb-5 flex items-end justify-between gap-4">
          <h2 className="font-title text-3xl text-real-estate-primary md:text-4xl">
            Fotot <span className="text-real-estate-primary/40">({images.length})</span>
          </h2>
          <button
            type="button"
            onClick={() => onOpen(0)}
            className="hidden items-center gap-2 rounded-full border border-real-estate-primary/15 bg-white px-4 py-2 text-sm font-semibold text-real-estate-primary transition hover:border-real-estate-secondary md:inline-flex"
          >
            <Expand className="h-4 w-4" /> Ekran i plotë
          </button>
        </div>

        {/* Phones and small tablets */}
        <div className="relative -mx-4 md:hidden">
          {tourChip}
          <div
            ref={stripRef}
            onScroll={onStripScroll}
            className="no-scrollbar flex snap-x snap-mandatory overflow-x-auto"
          >
            {images.map((img, index) => (
              <button
                key={`${img.imageUrl}-${index}`}
                type="button"
                onClick={() => onOpen(index)}
                className="aspect-[4/3] w-full shrink-0 snap-center bg-[#efe8d7]"
                aria-label={`Hap foton ${index + 1} nga ${images.length}`}
              >
                <img
                  src={img.imageUrl}
                  alt={index === 0 ? title : ""}
                  loading={index === 0 ? "eager" : "lazy"}
                  decoding="async"
                  className="h-full w-full object-cover"
                />
              </button>
            ))}
          </div>
          {images.length > 1 && (
            <span className="pointer-events-none absolute bottom-3 right-3 rounded-full bg-black/65 px-3 py-1 text-xs font-semibold tabular-nums text-white">
              {current + 1} / {images.length}
            </span>
          )}
        </div>

        {/* Tablets and desktop */}
        <div className="relative hidden h-[clamp(380px,48vw,560px)] grid-cols-4 grid-rows-2 gap-2 overflow-hidden rounded-2xl md:grid">
          {tourChip}
          {tiles.map((img, index) => {
            return (
              <button
                key={`${img.imageUrl}-${index}`}
                type="button"
                onClick={() => onOpen(index)}
                className={`group relative overflow-hidden bg-[#efe8d7] ${tileLayout(tiles.length, index)}`}
                aria-label={`Hap foton ${index + 1} nga ${images.length}`}
              >
                <img
                  src={img.imageUrl}
                  alt={index === 0 ? title : ""}
                  loading={index === 0 ? "eager" : "lazy"}
                  decoding="async"
                  className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.03]"
                />
                <span className="absolute inset-0 bg-black/0 transition group-hover:bg-black/10" />
              </button>
            );
          })}
          {images.length > 1 && (
            <button
              type="button"
              onClick={() => onOpen(0)}
              className="absolute bottom-4 right-4 inline-flex items-center gap-2 rounded-full bg-white px-4 py-2.5 text-sm font-semibold text-real-estate-primary shadow-lg transition hover:bg-real-estate-secondary"
            >
              <Images className="h-4 w-4" /> Shiko të gjitha {images.length} fotot
            </button>
          )}
        </div>
      </div>
    </section>
  );
};

export default PropertyGallery;
