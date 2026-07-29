import Link from "next/link";
import { ScrollReveal } from "./scroll-reveal";

const plans = [
  {
    label: "Basic Desk",
    price: "150K IDR",
    unit: "per day",
    description: "Standing desk, ergonomic chair, and fiber internet.",
    features: ["Sit-stand desk", "Herman Miller Sayl", "300 Mbps fiber"],
  },
  {
    label: "Pro Setup",
    price: "250K IDR",
    unit: "per day",
    description: "Full workstation with 4K monitor and call booth access.",
    features: [
      "Everything in Basic",
      "Dell 27\" 4K USB-C monitor",
      "2 hours call booth / day",
      "Mechanical keyboard + mouse",
    ],
    highlighted: true,
  },
  {
    label: "Private Booth",
    price: "75K IDR",
    unit: "per hour",
    description: "Sound-dampened booth for calls, recordings, or deep work.",
    features: [
      "Acoustic treatment",
      "4K monitor built in",
      "Book by the hour",
    ],
  },
];

export function Pricing() {
  return (
    <section id="pricing" className="py-32 px-6 bg-[#fbfbfa]">
      <div className="max-w-6xl mx-auto">
        <ScrollReveal>
          <span className="text-xs uppercase tracking-[0.1em] text-[#787774] font-medium">
            Straightforward pricing
          </span>
          <h2
            className="text-[clamp(1.75rem,4vw,2.5rem)] leading-[1.2] tracking-[-0.02em] text-[#111111] mt-4 mb-16"
            style={{ fontFamily: "var(--font-newsreader), serif" }}
          >
            Pay for what you use.
          </h2>
        </ScrollReveal>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {plans.map((plan, i) => (
            <ScrollReveal key={plan.label} delay={i * 0.1} as="article">
              <div
                className={`border rounded-lg p-8 bg-white h-full flex flex-col transition-shadow duration-200 hover:shadow-[0_2px_8px_rgba(0,0,0,0.04)] ${
                  plan.highlighted ? "border-[#111111]" : "border-[#EAEAEA]"
                }`}
              >
                <h3 className="text-sm font-medium text-[#111111] mb-1">
                  {plan.label}
                </h3>
                <div className="flex items-baseline gap-1 mb-1">
                  <span className="text-2xl font-medium text-[#111111]">
                    {plan.price}
                  </span>
                  <span className="text-sm text-[#787774]">{plan.unit}</span>
                </div>
                <p className="text-sm text-[#787774] mb-6 leading-relaxed">
                  {plan.description}
                </p>
                <ul className="space-y-2.5 mb-8 flex-1">
                  {plan.features.map((feat) => (
                    <li
                      key={feat}
                      className="text-sm text-[#787774] flex items-start gap-2"
                    >
                      <svg
                        width="14"
                        height="14"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="mt-0.5 flex-shrink-0 text-[#346538]"
                      >
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                      {feat}
                    </li>
                  ))}
                </ul>
                <Link
                  href="/workspace"
                  className={`inline-flex items-center justify-center w-full py-2.5 text-sm font-medium rounded transition-colors duration-200 active:scale-[0.98] ${
                    plan.highlighted
                      ? "bg-[#111111] text-white hover:bg-[#333333]"
                      : "border border-[#EAEAEA] text-[#111111] hover:bg-[#f7f6f3]"
                  }`}
                >
                  Book now
                </Link>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}
