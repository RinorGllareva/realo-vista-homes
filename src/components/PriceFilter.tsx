import React, { useEffect, useRef, useState } from "react";
import { MdOutlineEuro } from "react-icons/md";

type PriceFilterProps = {
  applyPriceFilter: (min: number | null, max: number | null) => void;
  className?: string;
  scrolled?: boolean;
};

const PriceFilter: React.FC<PriceFilterProps> = ({ applyPriceFilter, className, scrolled }) => {
  const [open, setOpen] = useState(false);
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const ref = useRef<HTMLDivElement | null>(null);
  const active = Boolean(minPrice || maxPrice);

  useEffect(() => {
    const onDocClick = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, []);

  const apply = () => {
    const min = minPrice ? parseInt(minPrice, 10) : null;
    const max = maxPrice ? parseInt(maxPrice, 10) : null;
    applyPriceFilter(Number.isNaN(min as number) ? null : min, Number.isNaN(max as number) ? null : max);
    setOpen(false);
  };

  return (
    <div ref={ref} className={`relative ${className ?? ""}`}>
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className={`inline-flex w-full items-center justify-center gap-1 rounded-full border px-2 py-2 text-xs font-semibold shadow-sm transition sm:text-sm md:w-auto md:gap-2 md:px-5 md:py-2.5 ${
          active || open
            ? "border-real-estate-secondary bg-real-estate-secondary text-real-estate-primary"
            : scrolled
            ? "border-white/35 bg-transparent text-white hover:border-real-estate-secondary"
            : "border-real-estate-primary/25 bg-transparent text-real-estate-primary hover:border-real-estate-secondary"
        }`}
      >
        <MdOutlineEuro className="text-sm md:text-base" />
        Çmimi
      </button>

      {open && (
        <div className="absolute right-0 z-50 mt-3 w-[min(92vw,380px)] rounded-lg border border-slate-200 bg-white p-3 shadow-2xl">
          <div className="grid grid-cols-[1fr_auto_1fr_auto] items-center gap-2">
            <input
              type="number"
              inputMode="numeric"
              placeholder="Min"
              value={minPrice}
              onChange={(event) => setMinPrice(event.target.value)}
              className="min-w-0 rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:border-real-estate-secondary focus:outline-none"
            />
            <span className="text-gray-400">-</span>
            <input
              type="number"
              inputMode="numeric"
              placeholder="Maks"
              value={maxPrice}
              onChange={(event) => setMaxPrice(event.target.value)}
              className="min-w-0 rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:border-real-estate-secondary focus:outline-none"
            />
            <button
              type="button"
              onClick={apply}
              className="rounded-md bg-slate-900 px-3 py-2 text-sm font-semibold text-white transition hover:bg-real-estate-primary"
            >
              Apliko
            </button>
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            {[
              [0, 50000, "<= 50k"],
              [50000, 100000, "50k-100k"],
              [100000, 200000, "100k-200k"],
              [200000, null, ">= 200k"],
            ].map(([min, max, label]) => (
              <button
                key={label as string}
                type="button"
                onClick={() => {
                  setMinPrice(min === null ? "" : String(min));
                  setMaxPrice(max === null ? "" : String(max));
                  applyPriceFilter(min as number | null, max as number | null);
                  setOpen(false);
                }}
                className="rounded-full border border-slate-300 px-3 py-1 text-xs text-slate-700 transition hover:border-real-estate-secondary hover:bg-real-estate-secondary/10"
              >
                {label as string}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default PriceFilter;
