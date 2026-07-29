import Link from "next/link";
import { ScrollReveal } from "./scroll-reveal";

export function CtaSection() {
  return (
    <section className="relative py-40 px-6 overflow-hidden">
      {/* Ambient radial light */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(500px at 50% 50%, rgba(180,160,130,0.06), transparent 70%)",
        }}
      />

      <div className="relative z-10 max-w-3xl mx-auto text-center">
        <ScrollReveal>
          <h2
            className="text-[clamp(1.75rem,5vw,3rem)] leading-[1.12] tracking-[-0.03em] text-[#111111] mb-6"
            style={{ fontFamily: "var(--font-newsreader), serif" }}
          >
            Your desk is ready.
            <br />
            <span className="italic">Are you?</span>
          </h2>
        </ScrollReveal>

        <ScrollReveal delay={0.1}>
          <p className="text-base text-[#787774] max-w-md mx-auto mb-10 leading-relaxed">
            Design your ideal workstation in 3D, pick your dates, and we will
            have it set up before you land.
          </p>
        </ScrollReveal>

        <ScrollReveal delay={0.2}>
          <Link
            href="/workspace"
            className="inline-flex items-center justify-center px-7 py-3.5 bg-[#111111] text-white text-sm font-medium hover:bg-[#333333] transition-colors duration-200 rounded active:scale-[0.98]"
          >
            Start building your setup
          </Link>
        </ScrollReveal>
      </div>
    </section>
  );
}
