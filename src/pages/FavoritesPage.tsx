import React, { useMemo } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Helmet } from "react-helmet";
import { Heart, Share2 } from "lucide-react";
import Header from "../components/Header";
import Footer from "../components/Footer";
import PropertyCard from "../components/PropertyCard";
import { addFavorites, useFavorites } from "@/lib/favorites";
import { useProperties } from "@/lib/properties";
import { useToast } from "@/hooks/use-toast";

const FavoritesPage = () => {
  const myIds = useFavorites();
  const [searchParams, setSearchParams] = useSearchParams();
  // A list someone shared with ?ids=… is shown read-only until the visitor saves it.
  const sharedIds = searchParams.get("ids")?.split(",").filter(Boolean) ?? null;
  const ids = sharedIds ?? myIds;
  const { data: properties = [], isLoading } = useProperties();
  const { toast } = useToast();

  // Keep the order the visitor saved them in (newest first).
  const saved = useMemo(() => {
    const byId = new Map(properties.map((p) => [String(p.propertyId), p]));
    return ids.map((id) => byId.get(id)).filter(Boolean) as typeof properties;
  }, [ids, properties]);

  const shareList = async () => {
    const url = `${window.location.origin}/te-preferuarat?ids=${ids.join(",")}`;
    try {
      if (navigator.share) {
        await navigator.share({ title: "Pronat e mia të preferuara | Realo", url });
        return;
      }
      await navigator.clipboard.writeText(url);
      toast({ title: "Linku u kopjua", description: "Dërgojeni në Viber ose WhatsApp." });
    } catch {
      /* cancelled */
    }
  };

  return (
    <div className="min-h-screen bg-[#fbfaf7]">
      <Helmet>
        <title>Të preferuarat | Realo Real Estate</title>
        <meta name="robots" content="noindex" />
      </Helmet>
      <Header />

      <section className="bg-real-estate-primary px-5 pb-10 pt-28 text-white md:pb-14 md:pt-36">
        <div className="mx-auto flex max-w-7xl flex-col gap-5 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="font-text text-xs uppercase tracking-[0.28em] text-real-estate-secondary sm:text-sm">
              Lista juaj
            </p>
            <h1 className="mt-3 font-title text-[clamp(2rem,7vw,3.5rem)] leading-tight">
              {sharedIds ? "Lista e ndarë me ju" : "Të preferuarat"}
            </h1>
            <p className="mt-3 max-w-xl text-sm leading-6 text-white/75">
              Pronat që ruani me <Heart className="inline h-4 w-4 fill-real-estate-secondary text-real-estate-secondary" /> mbeten
              këtu në këtë pajisje — pa llogari dhe pa regjistrim.
            </p>
          </div>
          {sharedIds ? (
            <button
              type="button"
              onClick={() => {
                addFavorites(sharedIds);
                setSearchParams({}, { replace: true });
                toast({ title: "U ruajtën", description: "Pronat u shtuan te të preferuarat tuaja." });
              }}
              className="inline-flex w-fit items-center gap-2 rounded-full bg-real-estate-secondary px-5 py-2.5 text-sm font-semibold text-real-estate-primary transition hover:bg-white"
            >
              <Heart className="h-4 w-4" /> Ruaji te të preferuarat e mia
            </button>
          ) : saved.length > 0 && (
            <button
              type="button"
              onClick={shareList}
              className="inline-flex w-fit items-center gap-2 rounded-full border border-white/25 px-5 py-2.5 text-sm font-semibold transition hover:border-real-estate-secondary hover:text-real-estate-secondary"
            >
              <Share2 className="h-4 w-4" /> Shpërndaje listën
            </button>
          )}
        </div>
      </section>

      <main className="mx-auto max-w-7xl px-4 py-10 md:px-5">
        {isLoading && ids.length > 0 ? (
          <p className="py-16 text-center text-real-estate-primary/60">Duke ngarkuar…</p>
        ) : saved.length === 0 ? (
          <div className="mx-auto max-w-md rounded-2xl border border-dashed border-real-estate-primary/20 bg-white px-6 py-14 text-center">
            <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-real-estate-secondary/15">
              <Heart className="h-7 w-7 text-real-estate-secondary" />
            </span>
            <h2 className="mt-5 font-title text-2xl text-real-estate-primary">Ende asnjë pronë e ruajtur</h2>
            <p className="mt-2 text-sm leading-6 text-real-estate-primary/65">
              Shtypni zemrën në çdo pronë për ta ruajtur këtu dhe për ta krahasuar më vonë.
            </p>
            <Link
              to="/Property"
              className="mt-6 inline-flex rounded-full bg-real-estate-primary px-6 py-3 font-text text-xs font-semibold uppercase tracking-[0.16em] text-real-estate-secondary"
            >
              Shfleto pronat
            </Link>
          </div>
        ) : (
          <>
            <p className="mb-5 text-sm text-real-estate-primary/60">{saved.length} prona të ruajtura</p>
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 lg:gap-6 2xl:grid-cols-4">
              {saved.map((property) => (
                <PropertyCard key={property.propertyId} property={property} />
              ))}
            </div>
          </>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default FavoritesPage;
