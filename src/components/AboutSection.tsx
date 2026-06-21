import { Building2, Home, KeyRound, MapPinned } from "lucide-react";

const marketCards = [
  { label: "Qendra kryesore", value: "Prishtinë", icon: MapPinned },
  { label: "Kërkesa më e lartë", value: "Banesa", icon: Building2 },
  { label: "Segment aktiv", value: "Qira & shitje", icon: KeyRound },
  { label: "Fokusi i blerësve", value: "70-120 m²", icon: Home },
];

const AboutSection = () => (
  <section className="bg-white px-5 py-14 md:py-20">
    <div className="mx-auto max-w-6xl">
      <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="font-text text-sm uppercase tracking-[0.28em] text-real-estate-secondary">
            Analitika e tregut
          </p>
          <h2 className="mt-2 font-title text-3xl text-real-estate-primary md:text-5xl">
            Pasqyra e tregut në Kosovë
          </h2>
        </div>
        <p className="max-w-xl text-sm leading-6 text-muted-foreground md:text-base">
          Indikatorë të përgjithshëm të tregut të patundshmërive në Kosovë,
          të përmbledhur për t&apos;ju ndihmuar të orientoheni më lehtë para se të
          shfletoni pronat.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        {marketCards.map(({ label, value, icon: Icon }) => (
          <div
            key={label}
            className="rounded-lg border border-real-estate-primary/10 bg-[#fbfaf7] p-4 shadow-sm sm:p-5"
          >
            <div className="mb-4 flex h-9 w-9 items-center justify-center rounded-md bg-real-estate-primary text-real-estate-secondary sm:h-10 sm:w-10">
              <Icon className="h-4 w-4 sm:h-5 sm:w-5" />
            </div>
            <div className="font-title text-xl text-real-estate-primary sm:text-2xl">
              {value}
            </div>
            <p className="mt-1 text-xs text-muted-foreground sm:text-sm">{label}</p>
          </div>
        ))}
      </div>
    </div>
  </section>
);

export default AboutSection;
