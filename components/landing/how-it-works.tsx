import { ScrollReveal } from "./scroll-reveal";

const steps = [
  {
    step: "01",
    title: "Choose your gear",
    description:
      "Pick a desk, chair, monitor, and any extras from the catalog. See your setup in 3D before booking.",
  },
  {
    step: "02",
    title: "Select location & dates",
    description:
      "Pick from our spaces in Canggu, Ubud, or Seminyak. Book by the day, week, or month.",
  },
  {
    step: "03",
    title: "Arrive and work",
    description:
      "Your setup will be ready when you arrive. Walk in, plug in, and get to work.",
  },
];

export function HowItWorks() {
  return (
    <section className="py-32 px-6 bg-[#fbfbfa]">
      <div className="max-w-6xl mx-auto">
        <ScrollReveal>
          <span className="text-xs uppercase tracking-[0.1em] text-[#787774] font-medium">
            How it works
          </span>
        </ScrollReveal>

        <div className="mt-16 flex flex-col">
          {steps.map((step, i) => (
            <ScrollReveal key={step.step} delay={i * 0.1}>
              <div className="group flex items-start gap-8 py-10 border-b border-[#EAEAEA] last:border-b-0">
                <span className="text-sm font-mono text-[#787774] w-12 flex-shrink-0 pt-0.5">
                  {step.step}
                </span>
                <div>
                  <h3 className="text-lg font-medium text-[#111111] mb-2">
                    {step.title}
                  </h3>
                  <p className="text-sm text-[#787774] leading-relaxed max-w-md">
                    {step.description}
                  </p>
                </div>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}
