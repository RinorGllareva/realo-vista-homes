import React from "react";
import aboutImage from "../assets/about-us.jpg";

const AboutSection = () => {
  return (
    <div className="max-w-6xl mx-auto my-12 px-5">
      <div className="flex flex-col lg:flex-row items-center gap-8">
        {/* Image Column - Reversed on smaller screens */}
        <div className="lg:w-1/2 order-2 lg:order-2">
          <img
            src={aboutImage}
            alt="About Realo Real Estate"
            className="w-full rounded-lg object-cover"
          />
        </div>

        {/* Text Column */}
        <div className="lg:w-1/2 order-1 lg:order-1">
          <div className="about-text">
            <div className="mb-6">
              <div className="flex items-baseline gap-3 mb-4">
                <h2 className="font-title text-3xl font-bold relative">
                  Rreth
                  <span className="absolute -bottom-3 left-0 w-16 h-0.5 bg-black"></span>
                </h2>
                <div className="font-title text-real-estate-secondary font-black flex items-center gap-1">
                  <h1 className="text-3xl">REALO</h1>
                  <h3 className="text-2xl">REAL-ESTATE</h3>
                </div>
              </div>
            </div>
            <p className="font-text text-base leading-relaxed mb-5 text-gray-700">
              Mirë se vini në Realo Real Estate – vendi ku pasioni për pasuritë
              e paluajtshme dhe përkushtimi ndaj klientit bashkohen për të
              krijuar përvoja unike! Si një kompani e pavarur dhe lidere në
              treg, ne jemi krenarë të ndërtojmë marrëdhënie të forta me
              klientët tanë, bazuar në besueshmëri, profesionalizëm dhe suksese
              të vazhdueshme. Me një histori suksesi që daton prej vitesh, ne
              vazhdojmë të rritemi falë rekomandimeve të shumta dhe besnikërisë
              që kemi fituar.
            </p>
            <p className="font-text text-base leading-relaxed mb-5 text-gray-700">
              Ekipi ynë dinamik ndodhet në zemër të qytetit dhe mbulon zonat
              kryesore urbane dhe periferike, duke ju garantuar një shërbim të
              personalizuar për çdo nevojë tuajën.
            </p>
            <p className="font-text text-base leading-relaxed mb-5 text-gray-700">
              Për ne, çdo klient është unik, dhe ne përkushtohemi për të sjellë
              zgjidhjet më të mira dhe më të përshtatshme për secilin. Realo
              është zgjedhja e parë për ata që kërkojnë cilësi, përkujdesje dhe
              sukses në çdo bashkëpunim mes nesh!
            </p>
            <h5 className="font-text text-lg font-medium">Prona juaj, Prioriteti jonë!</h5>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AboutSection;