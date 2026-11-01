import React from "react";
import { Heart } from "lucide-react";
import { toggleFavorite, useIsFavorite } from "@/lib/favorites";

interface FavoriteButtonProps {
  propertyId: string | number;
  title?: string;
  variant?: "overlay" | "outline";
  className?: string;
}

const FavoriteButton: React.FC<FavoriteButtonProps> = ({
  propertyId,
  title,
  variant = "overlay",
  className = "",
}) => {
  const saved = useIsFavorite(propertyId);
  const label = saved ? "Hiqe nga të preferuarat" : "Ruaje te të preferuarat";

  const onClick = (event: React.MouseEvent) => {
    // Cards are links; the heart must not open the property.
    event.preventDefault();
    event.stopPropagation();
    toggleFavorite(propertyId);
  };

  const base =
    variant === "overlay"
      ? `h-10 w-10 justify-center rounded-full bg-white/90 text-real-estate-primary shadow-md backdrop-blur hover:bg-white`
      : `gap-2 border border-real-estate-secondary/70 px-5 py-3 font-text text-sm font-bold uppercase tracking-[0.22em] text-real-estate-secondary hover:bg-real-estate-secondary hover:text-real-estate-primary`;

  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={saved}
      aria-label={title ? `${label}: ${title}` : label}
      title={label}
      className={`inline-flex items-center transition active:scale-90 ${base} ${className}`}
    >
      <Heart
        className={`h-5 w-5 transition ${saved ? "fill-red-500 text-red-500" : ""}`}
        strokeWidth={2}
      />
      {variant === "outline" && <span>{saved ? "E ruajtur" : "Ruaje"}</span>}
    </button>
  );
};

export default FavoriteButton;
