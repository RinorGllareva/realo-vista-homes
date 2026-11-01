import React, { useEffect, useState } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { Heart, Mail, Menu, Phone, X } from "lucide-react";
import { FaWhatsapp } from "react-icons/fa";
import logoImage from "../assets/LogoMainSection.png";
import { useFavorites } from "@/lib/favorites";

export const PHONE_DISPLAY = "+383 48 282 262";
export const PHONE_TEL = "tel:+38348282262";
export const WHATSAPP_URL = "https://wa.me/38348282262";
export const EMAIL = "realorealestate11@gmail.com";

const navItems = [
  { label: "Ballina", to: "/", end: true },
  { label: "Prona", to: "/Property" },
  { label: "Lokacioni", to: "/#map" },
  { label: "Kontakti", to: "/contact-us" },
];

const FavoritesLink: React.FC<{ className?: string }> = ({ className = "" }) => {
  const count = useFavorites().length;
  return (
    <Link
      to="/te-preferuarat"
      aria-label={`Të preferuarat (${count})`}
      title="Të preferuarat"
      className={`relative inline-flex h-10 w-10 items-center justify-center rounded-full text-white transition hover:bg-white/10 hover:text-real-estate-secondary ${className}`}
    >
      <Heart className={`h-5 w-5 ${count ? "fill-real-estate-secondary text-real-estate-secondary" : ""}`} />
      {count > 0 && (
        <span className="absolute -right-0.5 -top-0.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-real-estate-secondary px-1 text-[11px] font-bold leading-none text-real-estate-primary">
          {count > 99 ? "99+" : count}
        </span>
      )}
    </Link>
  );
};

const Header = () => {
  const location = useLocation();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const overHero = location.pathname === "/";
  const solid = !overHero || scrolled || menuOpen;

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => setMenuOpen(false), [location.pathname, location.hash]);

  useEffect(() => {
    if (!menuOpen) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setMenuOpen(false);
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = previous;
      window.removeEventListener("keydown", onKey);
    };
  }, [menuOpen]);

  const isActive = (to: string, end?: boolean) => {
    if (to.includes("#")) return location.pathname === "/" && location.hash === to.slice(1);
    if (end) return location.pathname === to && !location.hash;
    return location.pathname.toLowerCase().startsWith(to.toLowerCase()) ||
      (to === "/Property" && location.pathname.startsWith("/properties/"));
  };

  return (
    <>
      <header
        className={`fixed inset-x-0 top-0 z-[1000] transition-[background-color,box-shadow] duration-300 ${
          solid
            ? "bg-real-estate-primary/95 shadow-[0_8px_30px_-12px_rgba(0,0,0,0.45)] backdrop-blur-md"
            : "bg-gradient-to-b from-black/60 via-black/25 to-transparent"
        }`}
      >
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 md:h-20 md:px-6">
          <Link to="/" className="flex shrink-0 items-center gap-3" aria-label="Realo Real Estate – Ballina">
            <img src={logoImage} alt="" width={96} height={48} className="h-9 w-auto md:h-11" />
            <span className="hidden border-l border-real-estate-secondary/40 pl-3 font-title text-[11px] leading-tight tracking-[0.22em] text-real-estate-secondary sm:block">
              REAL
              <br />
              ESTATE
            </span>
          </Link>

          <nav aria-label="Navigimi kryesor" className="hidden items-center gap-1 lg:flex">
            {navItems.map((item) => {
              const active = isActive(item.to, item.end);
              return (
                <NavLink
                  key={item.label}
                  to={item.to}
                  aria-current={active ? "page" : undefined}
                  className={`relative rounded-md px-4 py-2 font-text text-sm uppercase tracking-[0.16em] transition-colors after:absolute after:inset-x-4 after:-bottom-0.5 after:h-px after:origin-left after:bg-real-estate-secondary after:transition-transform ${
                    active
                      ? "text-real-estate-secondary after:scale-x-100"
                      : "text-white/85 after:scale-x-0 hover:text-white hover:after:scale-x-100"
                  }`}
                >
                  {item.label}
                </NavLink>
              );
            })}
          </nav>

          <div className="flex items-center gap-1 sm:gap-2">
            <a
              href={PHONE_TEL}
              className="hidden items-center gap-2 rounded-full px-3 py-2 text-sm text-white/85 transition hover:text-real-estate-secondary xl:inline-flex"
            >
              <Phone className="h-4 w-4 text-real-estate-secondary" />
              {PHONE_DISPLAY}
            </a>
            <FavoritesLink />
            <Link
              to="/contact-us"
              className="ml-1 hidden rounded-full bg-real-estate-secondary px-5 py-2.5 font-text text-xs font-semibold uppercase tracking-[0.16em] text-real-estate-primary transition hover:bg-white md:inline-flex"
            >
              Ofroni pronën
            </Link>
            <button
              type="button"
              className="inline-flex h-10 w-10 items-center justify-center rounded-full text-white transition hover:bg-white/10 lg:hidden"
              onClick={() => setMenuOpen((open) => !open)}
              aria-expanded={menuOpen}
              aria-controls="mobile-menu"
              aria-label={menuOpen ? "Mbyll menunë" : "Hap menunë"}
            >
              {menuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </header>

        {/* Outside <header>: its backdrop blur would otherwise trap this fixed panel. */}
        {menuOpen && (
          <div
            id="mobile-menu"
            className="fixed inset-x-0 bottom-0 top-16 z-[999] overflow-y-auto border-t border-white/10 bg-real-estate-primary md:top-20 lg:hidden"
          >
            <nav aria-label="Menuja" className="mx-auto flex max-w-lg flex-col px-5 py-6">
              {navItems.map((item) => {
                const active = isActive(item.to, item.end);
                return (
                  <Link
                    key={item.label}
                    to={item.to}
                    onClick={() => setMenuOpen(false)}
                    aria-current={active ? "page" : undefined}
                    className={`flex items-center justify-between border-b border-white/10 py-4 font-title text-2xl transition ${
                      active ? "text-real-estate-secondary" : "text-white hover:text-real-estate-secondary"
                    }`}
                  >
                    {item.label}
                    <span aria-hidden className="text-base text-real-estate-secondary/70">→</span>
                  </Link>
                );
              })}
              <Link
                to="/te-preferuarat"
                onClick={() => setMenuOpen(false)}
                className="flex items-center justify-between border-b border-white/10 py-4 font-title text-2xl text-white transition hover:text-real-estate-secondary"
              >
                Të preferuarat
                <Heart className="h-5 w-5 text-real-estate-secondary" />
              </Link>

              <Link
                to="/contact-us"
                onClick={() => setMenuOpen(false)}
                className="mt-8 rounded-full bg-real-estate-secondary px-5 py-4 text-center font-text text-sm font-semibold uppercase tracking-[0.16em] text-real-estate-primary"
              >
                Ofroni pronën
              </Link>
              <div className="mt-3 grid grid-cols-2 gap-3">
                <a
                  href={PHONE_TEL}
                  className="inline-flex items-center justify-center gap-2 rounded-full border border-white/20 px-4 py-3.5 text-sm font-semibold text-white"
                >
                  <Phone className="h-4 w-4 text-real-estate-secondary" /> Telefono
                </a>
                <a
                  href={WHATSAPP_URL}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center justify-center gap-2 rounded-full border border-white/20 px-4 py-3.5 text-sm font-semibold text-white"
                >
                  <FaWhatsapp className="h-4 w-4 text-real-estate-secondary" /> WhatsApp
                </a>
              </div>
              <a href={`mailto:${EMAIL}`} className="mt-6 inline-flex items-center gap-2 text-sm text-white/60">
                <Mail className="h-4 w-4" /> {EMAIL}
              </a>
            </nav>
          </div>
        )}
    </>
  );
};

export default Header;
