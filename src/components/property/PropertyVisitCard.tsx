import React, { useEffect, useRef, useState } from "react";
import { CalendarDays, MessageCircle, Phone } from "lucide-react";
import { FaWhatsapp } from "react-icons/fa";
import { RealoMark } from "@/components/RealoLoader";
import { PHONE_DISPLAY, PHONE_TEL } from "@/components/Header";

const WHATSAPP_NUMBER = "38348282262";

interface PropertyVisitCardProps {
  propertyId: string | number;
  title: string;
  price: string;
  isForSale: boolean;
  propertyUrl: string;
}

const pad = (n: number) => String(n).padStart(2, "0");
const shortDate = (d: Date) => `${pad(d.getDate())}.${pad(d.getMonth() + 1)}`;
const addDays = (n: number) => {
  const d = new Date();
  d.setDate(d.getDate() + n);
  return d;
};
const toInputDate = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

const TIMES = [
  { value: "Paradite (09–12)", label: "Paradite" },
  { value: "Pasdite (12–17)", label: "Pasdite" },
  { value: "Mbrëmje (17–20)", label: "Mbrëmje" },
];

const chip = (active: boolean) =>
  `rounded-lg border px-3 py-2.5 text-sm font-medium transition ${
    active
      ? "border-real-estate-primary bg-real-estate-primary text-real-estate-secondary"
      : "border-real-estate-primary/15 bg-white text-real-estate-primary hover:border-real-estate-secondary"
  }`;

/**
 * "Request a visit": the visitor picks a day and a time of day, and WhatsApp opens with a
 * complete message (property, link, preferred time) so the agent can confirm right away.
 */
const PropertyVisitCard: React.FC<PropertyVisitCardProps> = ({ propertyId, title, price, isForSale, propertyUrl }) => {
  const [day, setDay] = useState<"today" | "tomorrow" | "pick">("tomorrow");
  const [pickedDate, setPickedDate] = useState(toInputDate(addDays(2)));
  const [time, setTime] = useState(TIMES[1].value);
  const [name, setName] = useState("");
  const cardRef = useRef<HTMLDivElement>(null);
  const [cardVisible, setCardVisible] = useState(false);

  // The phone bottom bar hides while the card itself is on screen.
  useEffect(() => {
    const el = cardRef.current;
    if (!el || typeof IntersectionObserver === "undefined") return;
    const observer = new IntersectionObserver(([entry]) => setCardVisible(entry.isIntersecting), { threshold: 0.2 });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const dayText = () => {
    if (day === "today") return `Sot (${shortDate(new Date())})`;
    if (day === "tomorrow") return `Nesër (${shortDate(addDays(1))})`;
    const [y, m, d] = pickedDate.split("-").map(Number);
    return y ? shortDate(new Date(y, m - 1, d)) : "Sipas marrëveshjes";
  };

  const send = () => {
    const lines = [
      "Përshëndetje Realo,",
      `dëshiroj të vizitoj këtë pronë: ${title} (ID ${propertyId})`,
      propertyUrl,
      "",
      `Dita: ${dayText()}`,
      `Koha: ${time}`,
      name.trim() ? `Emri: ${name.trim()}` : "",
    ].filter((line, i, all) => line !== "" || all[i - 1] !== "");
    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(lines.join("\n").trim())}`, "_blank", "noopener");
  };

  const askUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(
    `Përshëndetje Realo, kam një pyetje për pronën: ${title} (ID ${propertyId})\n${propertyUrl}`
  )}`;
  const priceSuffix = !isForSale && !/[/]|muaj/i.test(price) ? " / muaj" : "";

  return (
    <>
      <div
        ref={cardRef}
        id="kerko-vizite"
        className="scroll-mt-28 overflow-hidden rounded-2xl border border-real-estate-primary/10 bg-white shadow-xl shadow-real-estate-primary/5"
      >
        <div className="bg-real-estate-primary px-6 py-5 text-white">
          <span
            className={`inline-block rounded-md px-2.5 py-1 text-[11px] font-bold uppercase tracking-[0.14em] ${
              isForSale ? "bg-white/10 text-real-estate-secondary" : "bg-real-estate-secondary text-real-estate-primary"
            }`}
          >
            {isForSale ? "Në shitje" : "Me qira"}
          </span>
          <p className="mt-2 font-title text-3xl text-real-estate-secondary">
            {price}
            <span className="text-base text-white/60">{priceSuffix}</span>
          </p>
        </div>

        <div className="space-y-5 p-6">
          <div>
            <h3 className="flex items-center gap-2 text-lg font-semibold text-real-estate-primary">
              <CalendarDays className="h-5 w-5 text-real-estate-secondary" /> Kërko vizitë
            </h3>
            <p className="mt-1 text-sm text-real-estate-primary/60">Zgjidhni kur ju përshtatet; ne ju konfirmojmë në WhatsApp.</p>
          </div>

          <fieldset>
            <legend className="mb-2 text-xs font-semibold uppercase tracking-[0.12em] text-real-estate-primary/55">Dita</legend>
            <div className="grid grid-cols-3 gap-2">
              <button type="button" aria-pressed={day === "today"} onClick={() => setDay("today")} className={chip(day === "today")}>
                Sot
              </button>
              <button type="button" aria-pressed={day === "tomorrow"} onClick={() => setDay("tomorrow")} className={chip(day === "tomorrow")}>
                Nesër
              </button>
              <button type="button" aria-pressed={day === "pick"} onClick={() => setDay("pick")} className={chip(day === "pick")}>
                Tjetër
              </button>
            </div>
            {day === "pick" && (
              <input
                type="date"
                value={pickedDate}
                min={toInputDate(new Date())}
                onChange={(e) => setPickedDate(e.target.value)}
                aria-label="Data e vizitës"
                className="mt-2 h-11 w-full rounded-lg border border-real-estate-primary/15 px-3 text-sm text-real-estate-primary outline-none focus:border-real-estate-secondary"
              />
            )}
          </fieldset>

          <fieldset>
            <legend className="mb-2 text-xs font-semibold uppercase tracking-[0.12em] text-real-estate-primary/55">Koha</legend>
            <div className="grid grid-cols-3 gap-2">
              {TIMES.map((t) => (
                <button key={t.value} type="button" aria-pressed={time === t.value} onClick={() => setTime(t.value)} className={chip(time === t.value)}>
                  {t.label}
                </button>
              ))}
            </div>
          </fieldset>

          <label className="block">
            <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.12em] text-real-estate-primary/55">
              Emri <span className="normal-case tracking-normal text-real-estate-primary/40">(opsional)</span>
            </span>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoComplete="name"
              placeholder="Emri juaj"
              className="h-11 w-full rounded-lg border border-real-estate-primary/15 px-3 text-sm text-real-estate-primary outline-none placeholder:text-real-estate-primary/35 focus:border-real-estate-secondary"
            />
          </label>

          <button
            type="button"
            onClick={send}
            className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-lg bg-[#25D366] text-[15px] font-bold text-white transition hover:bg-[#1ebe5b] focus:outline-none focus-visible:ring-2 focus-visible:ring-real-estate-primary focus-visible:ring-offset-2"
          >
            <FaWhatsapp className="h-5 w-5" /> Dërgo kërkesën në WhatsApp
          </button>

          <div className="grid grid-cols-2 gap-2">
            <a
              href={PHONE_TEL}
              className="inline-flex h-11 items-center justify-center gap-2 rounded-lg border border-real-estate-primary/15 text-sm font-semibold text-real-estate-primary transition hover:border-real-estate-secondary"
            >
              <Phone className="h-4 w-4" /> Telefono
            </a>
            <a
              href={askUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex h-11 items-center justify-center gap-2 rounded-lg border border-real-estate-primary/15 text-sm font-semibold text-real-estate-primary transition hover:border-real-estate-secondary"
            >
              <MessageCircle className="h-4 w-4" /> Bëj pyetje
            </a>
          </div>

          <div className="flex items-center gap-3 border-t border-real-estate-primary/10 pt-5">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-real-estate-primary">
              <RealoMark className="h-7 w-7" />
            </span>
            <div className="min-w-0">
              <p className="font-semibold text-real-estate-primary">Realo Real Estate</p>
              <a href={PHONE_TEL} className="text-sm text-real-estate-primary/60 hover:text-real-estate-primary">
                {PHONE_DISPLAY}
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Phones: keep the main action one tap away while reading. */}
      <div
        className={`fixed inset-x-0 bottom-0 z-40 border-t border-real-estate-primary/10 bg-white/95 px-4 py-3 shadow-[0_-8px_30px_-12px_rgba(0,0,0,0.25)] backdrop-blur transition-transform duration-300 lg:hidden ${
          cardVisible ? "translate-y-full" : "translate-y-0"
        }`}
        style={{ paddingBottom: "max(0.75rem, env(safe-area-inset-bottom))" }}
      >
        <div className="mx-auto flex max-w-xl items-center gap-3">
          <div className="min-w-0 flex-1">
            <p className="truncate font-title text-xl leading-tight text-real-estate-primary">
              {price}
              <span className="text-sm text-real-estate-primary/50">{priceSuffix}</span>
            </p>
            <p className="text-xs text-real-estate-primary/55">{isForSale ? "Në shitje" : "Me qira"}</p>
          </div>
          <a
            href={PHONE_TEL}
            aria-label="Telefono"
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border border-real-estate-primary/15 text-real-estate-primary"
          >
            <Phone className="h-5 w-5" />
          </a>
          <button
            type="button"
            onClick={() => cardRef.current?.scrollIntoView({ behavior: "smooth", block: "start" })}
            className="h-11 shrink-0 rounded-lg bg-real-estate-secondary px-5 text-sm font-bold text-real-estate-primary"
          >
            Kërko vizitë
          </button>
        </div>
      </div>
    </>
  );
};

export default PropertyVisitCard;
