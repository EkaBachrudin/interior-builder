import { ScrollReveal } from "./scroll-reveal";

const features = [
  {
    title: "Ergonomic Chairs",
    description:
      "Herman Miller Aerons and Sayls at every desk. Your back will notice the difference by hour four.",
    accentClass: "bg-[#FDEBEB] text-[#9F2F2D]",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M16 4h2a2 2 0 012 2v14a2 2 0 01-2 2H6a2 2 0 01-2-2V6a2 2 0 012-2h2" />
        <rect x="8" y="2" width="8" height="4" rx="1" />
        <path d="M9 14v2" /><path d="M15 14v2" /><path d="M12 14v3" />
      </svg>
    ),
  },
  {
    title: "4K Monitors",
    description:
      "Dell UltraSharp USB-C displays, one cable to rule them all. Up to 32-inch screens available.",
    accentClass: "bg-[#E1F3FE] text-[#1F6C9F]",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="3" width="20" height="14" rx="2" />
        <line x1="8" y1="21" x2="16" y2="21" /><line x1="12" y1="17" x2="12" y2="21" />
      </svg>
    ),
  },
  {
    title: "Standing Desks",
    description:
      "Motorized sit-stand desks with programmable height memory. 140x70cm bamboo surfaces.",
    accentClass: "bg-[#EDF3EC] text-[#346538]",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="1" y="3" width="22" height="2" rx="0.5" /><rect x="1" y="9" width="22" height="2" rx="0.5" />
        <rect x="10" y="11" width="4" height="8" rx="1" /><rect x="8" y="19" width="8" height="2" rx="0.5" />
      </svg>
    ),
  },
  {
    title: "Fiber Internet",
    description:
      "Dedicated 300 Mbps symmetric fiber per desk. Stable enough for 4K calls and large deploys.",
    accentClass: "bg-[#FBF3DB] text-[#956400]",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" /><circle cx="12" cy="12" r="4" />
        <line x1="4.93" y1="4.93" x2="9.17" y2="9.17" /><line x1="14.83" y1="14.83" x2="19.07" y2="19.07" />
        <line x1="14.83" y1="9.17" x2="19.07" y2="4.93" /><line x1="4.93" y1="19.07" x2="9.17" y2="14.83" />
      </svg>
    ),
  },
  {
    title: "Private Booths",
    description:
      "Sound-dampened call booths for meetings, recordings, and deep focus. Book by the hour.",
    accentClass: "bg-[#EDF3EC] text-[#346538]",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
        <circle cx="12" cy="12" r="3" />
      </svg>
    ),
  },
  {
    title: "Coffee & Tea Bar",
    description:
      "Espresso machine, pour-over station, and cold brew on tap. Included with every booking.",
    accentClass: "bg-[#FDEBEB] text-[#9F2F2D]",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M18 8h1a4 4 0 010 8h-1" /><path d="M2 8h16v9a4 4 0 01-4 4H6a4 4 0 01-4-4V8z" />
        <line x1="6" y1="1" x2="6" y2="4" /><line x1="10" y1="1" x2="10" y2="4" /><line x1="14" y1="1" x2="14" y2="4" />
      </svg>
    ),
  },
];

export function FeatureBento() {
  return (
    <section id="features" className="py-32 px-6">
      <div className="max-w-6xl mx-auto">
        <ScrollReveal>
          <span className="text-xs uppercase tracking-[0.1em] text-[#787774] font-medium">
            What we provide
          </span>
          <h2
            className="text-[clamp(1.75rem,4vw,2.5rem)] leading-[1.2] tracking-[-0.02em] text-[#111111] mt-4 mb-4"
            style={{ fontFamily: "var(--font-newsreader), serif" }}
          >
            Everything a desk needs.
          </h2>
          <p className="text-base text-[#787774] max-w-lg mb-16 leading-relaxed">
            We stock each location with the same high-spec gear. Just show up
            with your laptop. Everything else is already plugged in.
          </p>
        </ScrollReveal>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {features.map((feature, i) => (
            <ScrollReveal key={feature.title} delay={i * 0.08} as="article">
              <div className="group border border-[#EAEAEA] rounded-lg p-8 bg-white h-full transition-shadow duration-200 hover:shadow-[0_2px_8px_rgba(0,0,0,0.04)]">
                <div
                  className={`inline-flex items-center justify-center w-10 h-10 rounded-lg mb-6 ${feature.accentClass}`}
                >
                  {feature.icon}
                </div>
                <h3 className="text-base font-medium text-[#111111] mb-2">
                  {feature.title}
                </h3>
                <p className="text-sm text-[#787774] leading-relaxed">
                  {feature.description}
                </p>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}
