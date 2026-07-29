"use client";

import Link from "next/link";
import { motion } from "framer-motion";

export function Navbar() {
  return (
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      className="fixed top-0 inset-x-0 z-50 border-b border-[rgba(0,0,0,0.06)] bg-[#fbfbfa]/80 backdrop-blur-sm"
    >
      <nav className="mx-auto max-w-6xl flex items-center justify-between px-6 py-4">
        <Link href="/" className="font-medium text-[#111111] tracking-tight">
          Ruang
        </Link>

        <div className="flex items-center gap-6">
          <Link
            href="#locations"
            className="text-sm text-[#787774] hover:text-[#111111] transition-colors"
          >
            Locations
          </Link>
          <Link
            href="#pricing"
            className="text-sm text-[#787774] hover:text-[#111111] transition-colors"
          >
            Pricing
          </Link>
          <Link
            href="/workspace"
            className="text-sm px-4 py-2 bg-[#111111] text-white hover:bg-[#333333] transition-colors rounded"
          >
            Start building
          </Link>
        </div>
      </nav>
    </motion.header>
  );
}
