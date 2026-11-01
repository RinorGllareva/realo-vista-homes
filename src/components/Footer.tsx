import React, { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowUpRight, Heart, Mail, MapPin, Phone } from "lucide-react";
import { FaWhatsapp } from "react-icons/fa";
import logoImage from "../assets/LogoMainSection.png";
import { PROPERTY_TYPES } from "@/lib/properties";
import { EMAIL, PHONE_DISPLAY, PHONE_TEL, WHATSAPP_URL } from "./Header";

const heading = "font-text text-xs uppercase tracking-[0.24em] text-real-estate-secondary";
const link = "text-sm text-white/70 transition hover:text-white";

const Footer = () => {
  const navigate = useNavigate();
  const [, setTaps] = useState(0);
  const resetTimer = useRef<number | null>(null);

  const handleSecretTap = () => {
    setTaps((n) => {
      const next = n + 1;
      if (next >= 3) {
        navigate("/login");
        if (resetTimer.current) window.clearTimeout(resetTimer.current);
        return 0;
      }
      if (resetTimer.current) window.clearTimeout(resetTimer.current);
      resetTimer.current = window.setTimeout(() => setTaps(0), 2000);
      return next;
    });
  };

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.ctrlKey && event.shiftKey && event.key.toLowerCase() === "l") {
        navigate("/login");
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [navigate]);

  return (
    <footer className="relative overflow-hidden bg-[#06130f] text-white">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,rgba(10,72,52,0.75),transparent_60%)]" />

      {/* Call to action band */}
      <div className="relative border-b border-white/10">
        <div className="mx-auto flex max-w-7xl flex-col gap-6 px-5 py-10 md:flex-row md:items-center md:justify-between md:px-6 md:py-12">
          <div>
            <p className={heading}>Keni një pronë?</p>
            <p className="mt-2 max-w-xl font-title text-2xl leading-tight text-white md:text-3xl">
              Na tregoni për të — ne kujdesemi për fotot, turin 360° dhe blerësit.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link
              to="/contact-us"
              className="inline-flex items-center gap-2 rounded-full bg-real-estate-secondary px-6 py-3 font-text text-xs font-semibold uppercase tracking-[0.16em] text-real-estate-primary transition hover:bg-white"
            >
              Ofroni pronën <ArrowUpRight className="h-4 w-4" />
            </Link>
            <a
              href={WHATSAPP_URL}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 rounded-full border border-white/25 px-6 py-3 text-sm font-semibold text-white transition hover:border-real-estate-secondary hover:text-real-estate-secondary"
            >
              <FaWhatsapp className="h-4 w-4" /> WhatsApp
            </a>
          </div>
        </div>
      </div>

      <div className="relative mx-auto grid max-w-7xl grid-cols-2 gap-x-6 gap-y-10 px-5 py-12 md:px-6 lg:grid-cols-[1.4fr_1fr_1fr_1.3fr]">
        <div className="col-span-2 lg:col-span-1">
          <Link to="/" className="inline-flex items-center gap-3" aria-label="Realo Real Estate – Ballina">
            <img src={logoImage} alt="" width={112} height={56} className="h-12 w-auto" />
            <span className="border-l border-real-estate-secondary/40 pl-3 font-title text-[11px] leading-tight tracking-[0.22em] text-real-estate-secondary">
              REAL
              <br />
              ESTATE
            </span>
          </Link>
          <p className="mt-5 max-w-xs text-sm leading-6 text-white/65">
            Ekip lokal që ju ndihmon të gjeni, shisni ose jepni me qira pronën tuaj me më shumë
            qartësi, kujdes dhe informacion të saktë për tregun.
          </p>
        </div>

        <nav aria-label="Shfleto">
          <p className={heading}>Shfleto</p>
          <ul className="mt-5 space-y-3">
            <li><Link to="/" className={link}>Ballina</Link></li>
            <li><Link to="/Property" className={link}>Të gjitha pronat</Link></li>
            <li><Link to="/Property?isForSale=true" className={link}>Në shitje</Link></li>
            <li><Link to="/Property?isForSale=false" className={link}>Me qira</Link></li>
            <li>
              <Link to="/te-preferuarat" className={`${link} inline-flex items-center gap-1.5`}>
                <Heart className="h-3.5 w-3.5" /> Të preferuarat
              </Link>
            </li>
            <li><Link to="/contact-us" className={link}>Kontakti</Link></li>
          </ul>
        </nav>

        <nav aria-label="Llojet e pronave">
          <p className={heading}>Llojet</p>
          <ul className="mt-5 space-y-3">
            {PROPERTY_TYPES.map((t) => (
              <li key={t.value}>
                <Link to={`/Property?propertyType=${t.value}`} className={link}>
                  {t.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="col-span-2 lg:col-span-1">
          <p className={heading}>Kontakti</p>
          <ul className="mt-5 space-y-4 text-sm">
            <li>
              <a href={PHONE_TEL} className="group flex items-center gap-3 text-white/80 transition hover:text-white">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-white/15 text-real-estate-secondary group-hover:border-real-estate-secondary">
                  <Phone className="h-4 w-4" />
                </span>
                {PHONE_DISPLAY}
              </a>
            </li>
            <li>
              <a href={`mailto:${EMAIL}`} className="group flex items-center gap-3 break-all text-white/80 transition hover:text-white">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-white/15 text-real-estate-secondary group-hover:border-real-estate-secondary">
                  <Mail className="h-4 w-4" />
                </span>
                {EMAIL}
              </a>
            </li>
            <li>
              <a
                href="https://www.google.com/maps/search/?api=1&query=Icon+Tower+Prishtina"
                target="_blank"
                rel="noreferrer"
                className="group flex items-center gap-3 text-white/80 transition hover:text-white"
              >
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-white/15 text-real-estate-secondary group-hover:border-real-estate-secondary">
                  <MapPin className="h-4 w-4" />
                </span>
                Rr. Tirana, Icon Tower, Prishtinë 10000
              </a>
            </li>
          </ul>
        </div>
      </div>

      <div className="relative border-t border-white/10">
        <div className="mx-auto flex max-w-7xl flex-col gap-2 px-5 py-5 text-xs text-white/45 sm:flex-row sm:items-center sm:justify-between md:px-6">
          <p>© {new Date().getFullYear()} Realo Real Estate. Të gjitha të drejtat e rezervuara.</p>
          <p>
            Faqja u krijua nga{" "}
            <a href="https://gllarix.com" target="_blank" rel="noreferrer" className="text-real-estate-secondary transition hover:text-white">
              Gllarix
            </a>
          </p>
        </div>
      </div>

      <button
        onClick={handleSecretTap}
        aria-hidden="true"
        tabIndex={-1}
        className="absolute bottom-3 right-3 h-6 w-6 rounded-full opacity-0"
      />
    </footer>
  );
};

export default Footer;
