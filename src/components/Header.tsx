import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { CiPhone } from "react-icons/ci";
import logoImage from "../assets/logo.png";

const Header = () => {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 50) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };

  const handleViewMore = () => {
    navigate("/Property");
  };
  
  const handleRedirect = () => {
    navigate("/contact-us");
  };
  
  const handleHomeRedirect = () => {
    navigate("/");
  };

  return (
    <>
      {/* Top bar */}
      <div 
        className={`fixed top-0 left-0 w-full z-[1000] transition-all duration-300 ease-in-out ${
          scrolled 
            ? "bg-real-estate-dark text-white" 
            : "bg-real-estate-light text-muted-foreground"
        }`}
      >
        <div className="flex justify-start items-center pt-2 px-5 text-base font-bold">
          <p className="flex items-center gap-1">
            <CiPhone /> 
            <span className="text-real-estate-secondary font-bold">+38348262282</span>
          </p>
        </div>
      </div>

      {/* Main Header */}
      <header 
        className={`fixed w-full transition-all duration-300 ease-in-out z-[999] ${
          scrolled
            ? "bg-real-estate-primary text-white py-2 top-10"
            : "bg-transparent py-5 top-10"
        }`}
      >
        <div className="flex justify-between items-center max-w-full mx-0 px-5 pt-5">
          <div 
            className={`flex items-center gap-2 cursor-pointer ${
              scrolled ? "text-real-estate-secondary" : "text-white"
            }`}
            onClick={handleHomeRedirect}
          >
            <img src={logoImage} alt="REALO Logo" className="w-40" />
            <h3 className="font-title text-lg">REAL-ESTATE</h3>
          </div>

          {/* Navigation Links */}
          <nav 
            className={`hidden md:flex items-center gap-5 ${
              menuOpen ? "flex" : "hidden md:flex"
            } md:relative md:flex-row md:bg-transparent md:w-auto md:h-auto md:pt-0`}
          >
            <a 
              onClick={handleViewMore}
              className={`font-text cursor-pointer text-xl font-medium transition-colors hover:text-real-estate-secondary ${
                scrolled ? "text-real-estate-secondary" : "text-real-estate-secondary"
              }`}
            >
              Pronat
            </a>
            <a 
              href="/"
              className={`font-text cursor-pointer text-xl font-medium transition-colors hover:text-real-estate-secondary ${
                scrolled ? "text-real-estate-secondary" : "text-real-estate-secondary"
              }`}
            >
              Lokacioni
            </a>
            <a 
              onClick={handleRedirect}
              className={`font-text cursor-pointer text-xl font-medium font-bold uppercase px-3 py-2 border-2 rounded transition-all hover:text-real-estate-secondary ${
                scrolled 
                  ? "text-real-estate-secondary border-real-estate-secondary/60" 
                  : "text-real-estate-secondary border-gray-400"
              }`}
            >
              Ofroni Pronën Tuaj
            </a>
          </nav>

          {/* Burger Icon */}
          <div 
            className="md:hidden text-3xl cursor-pointer text-white"
            onClick={toggleMenu}
          >
            {menuOpen ? (
              <span className="absolute right-5 top-5 text-real-estate-secondary z-[11000]">✕</span>
            ) : (
              <span className="text-white z-[11000]">☰</span>
            )}
          </div>
        </div>

        {/* Mobile Menu */}
        {menuOpen && (
          <>
            <div 
              className="fixed top-0 left-0 w-full h-full bg-real-estate-primary/60 z-[9999]"
              onClick={toggleMenu}
            ></div>
            <nav className="fixed top-0 right-0 w-64 h-full bg-real-estate-primary pt-16 z-[10000] flex flex-col items-center md:hidden">
              <a 
                onClick={handleViewMore}
                className="mt-20 text-base font-text text-real-estate-secondary cursor-pointer"
              >
                Pronat
              </a>
              <a 
                href="/"
                className="mt-20 text-base font-text text-real-estate-secondary cursor-pointer"
              >
                Lokacioni
              </a>
              <a 
                onClick={handleRedirect}
                className="mt-20 text-base font-text text-real-estate-secondary cursor-pointer"
              >
                Ofroni Pronën Tuaj
              </a>
            </nav>
          </>
        )}
      </header>
    </>
  );
};

export default Header;