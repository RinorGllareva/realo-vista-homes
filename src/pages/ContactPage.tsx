import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet";
import { Mail, MapPin, Phone } from "lucide-react";
import Header from "../components/Header";
import Footer from "../components/Footer";

const ContactPage = () => {
  const navigate = useNavigate();
  const [taps, setTaps] = useState(0);
  const resetTimer = useRef<number | null>(null);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    event.currentTarget.reset();
    alert("Faleminderit që kontaktuat Realo. Do t'ju përgjigjemi së shpejti.");
  };

  const handleSecretTap = () => {
    setTaps((count) => {
      const next = count + 1;
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

  const field =
    "w-full rounded-md border border-real-estate-primary/15 bg-white px-4 py-3 text-sm text-real-estate-primary outline-none transition placeholder:text-muted-foreground focus:border-real-estate-secondary";

  return (
    <div className="relative min-h-screen bg-[#fbfaf7]">
      <Helmet>
        <title>Na Kontaktoni | Realo Real Estate</title>
        <meta
          name="description"
          content="Kontaktoni Realo Real Estate per shtepi, banesa dhe prona ne Prishtine. Telefoni: +383-48-262-282."
        />
        <meta
          name="keywords"
          content="kontakt realo, agjenci imobiliare prishtine, prona kosove kontakt"
        />
        <link rel="canonical" href="https://realo-realestate.com/contact-us" />
      </Helmet>
      <Header />

      <main className="px-5 pb-16 pt-28 md:pt-36">
        <section className="mx-auto grid max-w-6xl gap-8 lg:grid-cols-[0.85fr_1.15fr]">
          <div className="rounded-lg bg-real-estate-primary p-7 text-white md:p-10">
            <p className="font-text text-sm uppercase tracking-[0.28em] text-real-estate-secondary">
              Kontakto Realo
            </p>
            <h1 className="mt-3 font-title text-4xl leading-tight md:text-6xl">
              Le të flasim për hapin tuaj të ardhshëm.
            </h1>
            <p className="mt-5 max-w-lg text-white/75">
              Na dërgoni detajet e pronës, kërkesën për vizitë ose pyetjet për
              investim. Ekipi ynë do t&apos;ju ndihmojë të zgjidhni hapin e duhur.
            </p>

            <div className="mt-8 space-y-4">
              <a
                href="mailto:realorealestate11@gmail.com"
                className="flex items-center gap-3 rounded-md border border-white/10 bg-white/5 p-4 text-white/85"
              >
                <Mail className="h-5 w-5 text-real-estate-secondary" />
                realorealestate11@gmail.com
              </a>
              <a
                href="tel:+38348282262"
                className="flex items-center gap-3 rounded-md border border-white/10 bg-white/5 p-4 text-white/85"
              >
                <Phone className="h-5 w-5 text-real-estate-secondary" />
                +383 48 282 262
              </a>
              <div className="flex items-center gap-3 rounded-md border border-white/10 bg-white/5 p-4 text-white/85">
                <MapPin className="h-5 w-5 text-real-estate-secondary" />
                Icon Tower, Prishtina, Kosovo
              </div>
            </div>
          </div>

          <div className="rounded-lg border border-real-estate-primary/10 bg-white p-6 shadow-sm md:p-8">
            <h2 className="font-title text-3xl text-real-estate-primary">
              Dërgo mesazh
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Na tregoni çfarë ju duhet dhe do t&apos;ju përgjigjemi sa më shpejt.
            </p>

            <form onSubmit={handleSubmit} className="mt-6 grid gap-4">
              <div className="grid gap-4 md:grid-cols-2">
                <label className="grid gap-2 text-sm font-medium text-real-estate-primary">
                  Emri
                  <input name="name" required className={field} />
                </label>
                <label className="grid gap-2 text-sm font-medium text-real-estate-primary">
                  Telefoni
                  <input name="phone" type="tel" required className={field} />
                </label>
              </div>
              <label className="grid gap-2 text-sm font-medium text-real-estate-primary">
                Email
                <input name="email" type="email" required className={field} />
              </label>
              <label className="grid gap-2 text-sm font-medium text-real-estate-primary">
                Si mund t&apos;ju ndihmojmë?
                <textarea name="description" rows={6} className={`${field} resize-y`} />
              </label>
              <button
                type="submit"
                className="rounded-md bg-real-estate-primary px-6 py-3 font-text text-sm font-semibold uppercase tracking-[0.16em] text-real-estate-secondary transition hover:bg-real-estate-primary/90"
              >
                Dërgo kërkesën
              </button>
            </form>
          </div>
        </section>
      </main>

      <button
        onClick={handleSecretTap}
        aria-label="open admin"
        title=" "
        className="absolute bottom-3 right-3 h-6 w-6 rounded-full opacity-0 transition-opacity hover:opacity-20 focus:opacity-20"
      />

      <Footer />
    </div>
  );
};

export default ContactPage;
