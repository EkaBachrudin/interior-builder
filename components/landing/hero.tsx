import Link from "next/link";
import { ScrollReveal } from "./scroll-reveal";

export function Hero() {
  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden">
      {/* Ambient radial blob */}
      <div
        className="pointer-events-none fixed inset-0"
        style={{
          background:
            "radial-gradient(600px at 50% 40%, rgba(180,160,130,0.04), transparent 80%)",
          animation: "ambient-drift 24s ease-in-out infinite alternate",
        }}
      />

      {/* Background image overlay */}
      <div
        className="absolute inset-0 opacity-[0.06]"
        style={{
          backgroundImage: "url(https://picsum.photos/seed/bali-rice/1800/1200)",
          backgroundSize: "cover",
          backgroundPosition: "center",
          mixBlendMode: "multiply",
        }}
      />

      <div className="relative z-10 max-w-4xl mx-auto px-6 text-center py-32">
        <ScrollReveal>
          <span className="inline-block text-xs uppercase tracking-[0.1em] text-[#787774] mb-8 font-medium">
            Workspace equipment for freelancers in Bali
          </span>
        </ScrollReveal>

        <ScrollReveal delay={0.1}>
          <h1
            className="text-[clamp(2.75rem,7vw,5rem)] leading-[1.08] tracking-[-0.03em] text-[#111111] mb-8"
            style={{ fontFamily: "var(--font-newsreader), serif" }}
          >
            Show up.
            <br />
            Sit down.
            <br />
            <span className="italic">Start working.</span>
          </h1>
        </ScrollReveal>

        <ScrollReveal delay={0.2}>
          <p className="text-lg text-[#787774] max-w-xl mx-auto mb-12 leading-relaxed">
            Rent desks, monitors, chairs, and full workstation setups across
            Canggu, Ubud, and Seminyak. No memberships. No long commitments.
            Just the gear you need to do your best work.
          </p>
        </ScrollReveal>

        <ScrollReveal delay={0.3}>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/workspace"
              className="inline-flex items-center justify-center px-7 py-3.5 bg-[#111111] text-white text-sm font-medium hover:bg-[#333333] transition-colors duration-200 rounded active:scale-[0.98]"
            >
              Design your setup
            </Link>
            <Link
              href="#locations"
              className="inline-flex items-center justify-center px-7 py-3.5 border border-[#EAEAEA] text-[#111111] text-sm font-medium hover:bg-[#f7f6f3] transition-colors duration-200 rounded active:scale-[0.98]"
            >
              See locations
            </Link>
          </div>
        </ScrollReveal>
      </div>


    </section>
  );
}
