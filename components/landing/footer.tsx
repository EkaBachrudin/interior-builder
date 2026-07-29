import Link from "next/link";

export function Footer() {
  return (
    <footer className="border-t border-[#EAEAEA] bg-[#fbfbfa]">
      <div className="max-w-6xl mx-auto px-6 py-12 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
        <div>
          <Link
            href="/"
            className="text-sm font-medium text-[#111111] tracking-tight"
          >
            Ruang
          </Link>
          <p className="text-xs text-[#787774] mt-1">
            Workspace equipment rental in Bali.
          </p>
        </div>

        <div className="flex items-center gap-6 text-xs text-[#787774]">
          <Link
            href="#features"
            className="hover:text-[#111111] transition-colors"
          >
            Equipment
          </Link>
          <Link
            href="#locations"
            className="hover:text-[#111111] transition-colors"
          >
            Locations
          </Link>
          <Link
            href="#pricing"
            className="hover:text-[#111111] transition-colors"
          >
            Pricing
          </Link>
          <Link
            href="/workspace"
            className="hover:text-[#111111] transition-colors"
          >
            Builder
          </Link>
        </div>
      </div>
    </footer>
  );
}
