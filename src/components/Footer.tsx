import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import logoImage from "../assets/LogoMainSection.png";
import { GiGalaxy } from "react-icons/gi";

const Footer = () => {
  const navigate = useNavigate();

  const handleRedirect = () => navigate("/contact-us");
  const handleHomeRedirect = () => navigate("/");
  const handlePropertyRedirect = () => navigate("/Property");

  /* ---------- Secret login trigger ---------- */
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

  // OPTIONAL: Ctrl+Shift+L to go to /login
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.shiftKey && e.key.toLowerCase() === "l") {
        navigate("/login");
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [navigate]);
  /* ----------------------------------------- */

  return (
    <footer className="w-full font-text py-10 text-lg bg-real-estate-primary text-real-estate-secondary">
      <div className="max-w-6xl mx-auto px-5">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
          {/* Logo and Address Section */}
          <div className="text-center md:text-left">
            <div className="flex items-center justify-center md:justify-start gap-2 mb-4">
              <img src={logoImage} alt="REALO Logo" className="w-32" />
              <h3 className="font-title text-sm">REAL-ESTATE</h3>
            </div>
            <p className="text-base">
              Kosovo, Rr.Tirana, Icon Tower, Prishtina 10000
            </p>
          </div>

          {/* About Company Section */}
          <div className="text-center md:text-left">
            <h6 className="font-text text-lg mb-5 relative">
              Rreth Kompanisë
              <span className="absolute -bottom-2 left-0 md:left-0 w-12 h-px bg-gray-500"></span>
            </h6>
            <p className="text-base mb-4">
              Ekipi ynë, në zemër të qytetit, ofron shërbim të personalizuar për
              çdo nevojë.
            </p>
            <div className="flex flex-col gap-2">
              <a
                href="/about"
                className="inline-block text-real-estate-secondary border border-real-estate-secondary rounded-full px-4 py-1 text-sm transition-colors hover:bg-real-estate-secondary hover:text-real-estate-primary"
              >
                Na Kontaktoni
              </a>
              <a
                onClick={handleRedirect}
                className="inline-block text-real-estate-secondary border border-real-estate-secondary rounded-full px-4 py-1 text-sm transition-colors hover:bg-real-estate-secondary hover:text-real-estate-primary cursor-pointer"
              >
                +38348282262
              </a>
            </div>
          </div>

          {/* Help Us Section */}
          <div className="text-center md:text-left">
            <h6 className="font-text text-lg mb-5 relative">
              Na Ndihmoni
              <span className="absolute -bottom-2 left-0 md:left-0 w-12 h-px bg-gray-500"></span>
            </h6>
            <ul className="list-none space-y-2">
              <li>
                <a
                  onClick={handleHomeRedirect}
                  className="font-text text-real-estate-secondary cursor-pointer hover:text-white transition-colors"
                >
                  Home
                </a>
              </li>
              <li>
                <a
                  href="/about"
                  className="font-text text-real-estate-secondary hover:text-white transition-colors"
                >
                  Rreth Nesh
                </a>
              </li>
              <li>
                <a
                  onClick={handleRedirect}
                  className="font-text text-real-estate-secondary cursor-pointer hover:text-white transition-colors"
                >
                  Kontakoni
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="text-center md:text-right mt-8">
          <p className="text-sm flex items-center justify-center md:justify-end gap-1">
            Website Created By Glaxio <GiGalaxy />
          </p>
        </div>
      </div>

      {/* Secret, non-intrusive button: fixed so it doesn't affect layout */}
      <button
        onClick={handleSecretTap}
        aria-label="open admin"
        title=" "
        className="fixed bottom-3 right-3 h-6 w-6 rounded-full opacity-0 hover:opacity-20 focus:opacity-20 transition-opacity"
      />
    </footer>
  );
};

export default Footer;
