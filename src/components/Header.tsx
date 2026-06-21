import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Menu, Phone, X } from "lucide-react";
import logoImage from "../assets/LogoMainSection.png";

const Header = () => {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const fixedGreen =
    location.pathname.startsWith("/properties/") ||
    location.pathname === "/contact-us" ||
    location.pathname === "/Property";

  useEffect(() => {
    if (fixedGreen) {
      setScrolled(true);
      return;
    }

    const onScroll = () => setScrolled(window.scrollY > 50);
    onScroll();
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, [fixedGreen]);

  const navItems = [
    { label: "Ballina", action: () => navigate("/") },
    { label: "Prona", action: () => navigate("/Property") },
    { label: "Lokacioni", action: () => navigate("/#map") },
    { label: "Kontakti", action: () => navigate("/contact-us") },
  ];

  return (
    <header
      className={`fixed left-0 top-0 z-[1000] w-full transition-all duration-300 ${
        scrolled
          ? "border-b border-white/10 bg-real-estate-primary shadow-lg"
          : "bg-gradient-to-b from-black/55 to-transparent"
      }`}
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 md:px-6">
        <button
          onClick={() => navigate("/")}
          className="flex items-center gap-3"
          aria-label="Go to home page"
        >
          <img src={logoImage} alt="REALO Logo" className="h-12 w-auto" />
          <span className="hidden font-title text-sm tracking-[0.18em] text-real-estate-secondary sm:inline">
            REAL ESTATE
          </span>
        </button>

        <nav className="hidden items-center gap-7 md:flex">
          {navItems.map((item) => (
            <button
              key={item.label}
              onClick={item.action}
              className="font-text text-sm uppercase tracking-[0.18em] text-white/85 transition-colors hover:text-real-estate-secondary"
            >
              {item.label}
            </button>
          ))}
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          <a
            href="tel:+38348282262"
            className="inline-flex items-center gap-2 text-sm text-white/80"
          >
            <Phone className="h-4 w-4 text-real-estate-secondary" />
            +383 48 282 262
          </a>
          <button
            onClick={() => navigate("/contact-us")}
            className="rounded-md border border-real-estate-secondary bg-real-estate-secondary px-4 py-2 font-text text-sm font-semibold uppercase tracking-[0.14em] text-real-estate-primary transition hover:bg-white"
          >
            Ofroni Pronën
          </button>
        </div>

        <button
          className="inline-flex h-10 w-10 items-center justify-center rounded-md border border-white/20 text-white md:hidden"
          onClick={() => setMenuOpen((open) => !open)}
          aria-label="Toggle navigation"
        >
          {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {menuOpen && (
        <div className="border-t border-white/10 bg-real-estate-primary px-4 pb-5 md:hidden">
          <nav className="flex flex-col gap-2 pt-3">
            {navItems.map((item) => (
              <button
                key={item.label}
                onClick={() => {
                  item.action();
                  setMenuOpen(false);
                }}
                className="rounded-md px-3 py-3 text-left font-text text-sm uppercase tracking-[0.16em] text-white hover:bg-white/10"
              >
                {item.label}
              </button>
            ))}
            <button
              onClick={() => {
                navigate("/contact-us");
                setMenuOpen(false);
              }}
              className="mt-2 rounded-md bg-real-estate-secondary px-3 py-3 text-left font-text text-sm font-semibold uppercase tracking-[0.16em] text-real-estate-primary"
            >
              Ofroni Pronën
            </button>
          </nav>
        </div>
      )}
    </header>
  );
};

export default Header;
