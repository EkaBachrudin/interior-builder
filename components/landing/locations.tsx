import { ScrollReveal } from "./scroll-reveal";

const locations = [
  {
    name: "Canggu",
    address: "Jl. Pantai Batu Bolong 84",
    image: "https://picsum.photos/seed/canggu-space/800/500",
    tags: ["Desks", "Booths", "Coffee bar"],
    available: "12 desks available",
    tagClass: "bg-[#FBF3DB] text-[#956400]",
  },
  {
    name: "Ubud",
    address: "Jl. Raya Sanggingan 27",
    image: "https://picsum.photos/seed/ubud-space/800/500",
    tags: ["Desks", "Monitors", "Garden"],
    available: "8 desks available",
    tagClass: "bg-[#EDF3EC] text-[#346538]",
  },
  {
    name: "Seminyak",
    address: "Jl. Kayu Aya 42",
    image: "https://picsum.photos/seed/seminyak-space/800/500",
    tags: ["Desks", "Booths", "Monitors", "Rooftop"],
    available: "15 desks available",
    tagClass: "bg-[#E1F3FE] text-[#1F6C9F]",
  },
];

export function Locations() {
  return (
    <section id="locations" className="py-32 px-6">
      <div className="max-w-6xl mx-auto">
        <ScrollReveal>
          <span className="text-xs uppercase tracking-[0.1em] text-[#787774] font-medium">
            Where to find us
          </span>
          <h2
            className="text-[clamp(1.75rem,4vw,2.5rem)] leading-[1.2] tracking-[-0.02em] text-[#111111] mt-4 mb-4"
            style={{ fontFamily: "var(--font-newsreader), serif" }}
          >
            Three spaces across Bali.
          </h2>
          <p className="text-base text-[#787774] max-w-lg mb-16 leading-relaxed">
            Each location stocked with the same equipment. Pick the one closest
            to your villa.
          </p>
        </ScrollReveal>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {locations.map((loc, i) => (
            <ScrollReveal key={loc.name} delay={i * 0.1} as="article">
              <div className="group border border-[#EAEAEA] rounded-lg overflow-hidden bg-white transition-shadow duration-200 hover:shadow-[0_2px_8px_rgba(0,0,0,0.04)]">
                <div
                  className="h-48 bg-cover bg-center"
                  style={{ backgroundImage: `url(${loc.image})` }}
                />
                <div className="p-6">
                  <h3 className="text-base font-medium text-[#111111] mb-1">
                    {loc.name}
                  </h3>
                  <p className="text-sm text-[#787774] mb-4">{loc.address}</p>
                  <div className="flex flex-wrap gap-1.5 mb-4">
                    {loc.tags.map((tag) => (
                      <span
                        key={tag}
                        className={`text-[11px] px-2.5 py-0.5 rounded-full uppercase tracking-[0.04em] font-medium ${loc.tagClass}`}
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                  <p className="text-xs text-[#787774]">{loc.available}</p>
                </div>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}
