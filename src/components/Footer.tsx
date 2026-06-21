import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Phone } from "lucide-react";
import logoImage from "../assets/LogoMainSection.png";

const Footer = () => {
  const navigate = useNavigate();
  const [taps, setTaps] = useState(0);
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
    <footer className="bg-real-estate-primary px-5 py-10 text-real-estate-secondary">
      <div className="mx-auto grid max-w-6xl gap-8 md:grid-cols-[1.2fr_1fr_1fr]">
        <div>
          <button
            onClick={() => navigate("/")}
            className="mb-4 flex items-center gap-3"
            aria-label="Go to home page"
          >
            <img src={logoImage} alt="REALO Logo" className="h-14 w-auto" />
            <span className="font-title text-sm tracking-[0.18em]">
              REAL ESTATE
            </span>
          </button>
          <p className="max-w-sm text-sm leading-6 text-white/70">
            Kosovo, Rr. Tirana, Icon Tower, Prishtina 10000
          </p>
          <a
            href="tel:+38348282262"
            className="mt-4 inline-flex items-center gap-2 text-sm text-white/80"
          >
            <Phone className="h-4 w-4 text-real-estate-secondary" />
            +383 48 282 262
          </a>
        </div>

        <div>
          <h3 className="font-text text-sm uppercase tracking-[0.22em]">
            Rreth Realo
          </h3>
          <p className="mt-4 text-sm leading-6 text-white/70">
            Realo Real Estate është një ekip lokal që ju ndihmon të gjeni,
            shisni ose jepni me qira pronën tuaj me më shumë qartësi, kujdes
            dhe informacion të saktë për tregun.
          </p>
          <button
            onClick={() => navigate("/contact-us")}
            className="mt-4 rounded-md border border-real-estate-secondary px-4 py-2 text-sm font-medium transition hover:bg-real-estate-secondary hover:text-real-estate-primary"
          >
            Na Kontaktoni
          </button>
        </div>

        <div>
          <h3 className="font-text text-sm uppercase tracking-[0.22em]">
            Shfleto
          </h3>
          <div className="mt-4 flex flex-col gap-3 text-sm text-white/75">
            <button
              onClick={() => navigate("/")}
              className="text-left transition hover:text-real-estate-secondary"
            >
              Ballina
            </button>
            <button
              onClick={() => navigate("/Property")}
              className="text-left transition hover:text-real-estate-secondary"
            >
              Prona
            </button>
            <button
              onClick={() => navigate("/contact-us")}
              className="text-left transition hover:text-real-estate-secondary"
            >
              Kontakti
            </button>
          </div>
        </div>
      </div>

      <div className="mx-auto mt-8 max-w-6xl border-t border-white/10 pt-5 text-center text-xs text-white/50 md:text-left">
        Faqja u krijua nga Glaxio.
      </div>

      <button
        onClick={handleSecretTap}
        aria-label="open admin"
        title=" "
        className="fixed bottom-3 right-3 h-6 w-6 rounded-full opacity-0 transition-opacity hover:opacity-20 focus:opacity-20"
      />
    </footer>
  );
};

export default Footer;
