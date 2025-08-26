// src/components/filters/AreaFilter.tsx
import React, { useEffect, useRef, useState } from "react";
import { FiLayout } from "react-icons/fi";

type AreaFilterProps = {
  applyAreaFilter: (min: number | null, max: number | null) => void;
  className?: string; // optional wrapper styling
};

const AreaFilter: React.FC<AreaFilterProps> = ({
  applyAreaFilter,
  className,
}) => {
  const [open, setOpen] = useState(false);
  const [minArea, setMinArea] = useState<string>("");
  const [maxArea, setMaxArea] = useState<string>("");
  const ref = useRef<HTMLDivElement | null>(null);

  const toggle = () => setOpen((v) => !v);

  const apply = () => {
    const min = minArea ? parseInt(minArea, 10) : null;
    const max = maxArea ? parseInt(maxArea, 10) : null;
    applyAreaFilter(
      Number.isNaN(min as number) ? null : min,
      Number.isNaN(max as number) ? null : max
    );
    setOpen(false);
  };

  // close on outside click
  useEffect(() => {
    const onDocClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node))
        setOpen(false);
    };
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, []);

  return (
    <div ref={ref} className={`relative ${className ?? ""}`}>
      {/* Trigger */}
      <button
        type="button"
        onClick={toggle}
        className="
    hidden md:flex inline-flex items-center gap-1
    rounded-full border border-gray-300 bg-white
    px-4 py-2
    text-sm font-medium text-gray-900
    shadow-sm
    hover:bg-gray-50 hover:border-gray-400
    focus:outline-none focus:ring-2 focus:ring-yellow-500/40
    transition
  "
      >
        <FiLayout className="text-gray-700 text-lg -mt-[1px]" />
        <span>Sipërfaqja</span>
        <svg
          className={`ml-1 h-3.5 w-3.5 text-gray-600 transition-transform ${
            open ? "rotate-180" : ""
          }`}
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path
            fillRule="evenodd"
            d="M5.23 7.21a.75.75 0 011.06.02L10 10.94l3.71-3.71a.75.75 0 111.06 1.06l-4.24 4.24a.75.75 0 01-1.06 0L5.21 8.29a.75.75 0 01.02-1.08z"
            clipRule="evenodd"
          />
        </svg>
      </button>

      {/* Dropdown */}
      {open && (
        <div
          className="
            absolute z-50 mt-3 left-100 sm:right-0
            rounded-lg border border-gray-200 bg-white p-3 shadow-lg
          "
        >
          <div className="flex items-center gap-2">
            <input
              type="number"
              inputMode="numeric"
              placeholder="Min"
              value={minArea}
              onChange={(e) => setMinArea(e.target.value)}
              className="
                w-24 rounded-md border border-gray-300 px-3 py-2 text-sm
                focus:border-yellow-500 focus:outline-none focus:ring-2 focus:ring-yellow-200
              "
            />
            <span className="px-1 text-lg text-gray-500">–</span>
            <input
              type="number"
              inputMode="numeric"
              placeholder="Max"
              value={maxArea}
              onChange={(e) => setMaxArea(e.target.value)}
              className="
                w-24 rounded-md border border-gray-300 px-3 py-2 text-sm
                focus:border-yellow-500 focus:outline-none focus:ring-2 focus:ring-yellow-200
              "
            />
            <button
              type="button"
              onClick={apply}
              className="
                ml-auto rounded-md bg-gray-800 px-3 py-2 text-sm font-medium text-white
                hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-300
              "
            >
              Apliko
            </button>
          </div>

          {/* Optional preset chips */}
          <div className="mt-3 flex flex-wrap gap-2">
            {[
              [null, 50, "≤ 50 m²"],
              [50, 100, "50–100 m²"],
              [100, 200, "100–200 m²"],
              [200, null, "≥ 200 m²"],
            ].map(([min, max, label]) => (
              <button
                key={label as string}
                onClick={() => {
                  setMinArea(min === null ? "" : String(min));
                  setMaxArea(max === null ? "" : String(max));
                }}
                className="
                  rounded-full border border-gray-300 px-3 py-1 text-xs text-gray-700
                  hover:border-yellow-500 hover:text-yellow-700
                "
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

export default AreaFilter;
