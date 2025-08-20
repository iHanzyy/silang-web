"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import { Home as HomeIcon, Info, ArrowRight } from "lucide-react";
import AnimatedHamburgerButton from "@/components/AnimatedHamburgerButton";
import { orbitron, quicksand } from "@/lib/fonts";

const NavLink = ({ href, children, icon: Icon, iconSize = 20 }) => (
  <Link
    href={href}
    className={`inline-flex items-center gap-2 px-3 py-2 rounded-md text-slate-200 hover:text-white hover:bg-white/10 transition ${quicksand.className} font-semibold text-xl`}
  >
    {Icon ? <Icon size={iconSize} strokeWidth={1.75} /> : null}
    <span>{children}</span>
  </Link>
);

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-transparent">
      <nav className="mx-auto max-w-7xl px-6 py-4 flex items-center justify-between">
        {/* Brand */}
        <Link href="/" className="flex items-center gap-3">
          <Image
            src="/LogoSiLang.png"
            alt="SiLang Logo"
            width={36}
            height={36}
            className="rounded-md"
            priority
          />
          <span className={`text-lg sm:text-xl font-bold tracking-wide text-white ${orbitron.className}`}>
            SiLang
          </span>
        </Link>

        {/* Desktop links */}
        <div className="hidden md:flex items-center gap-1">
          <NavLink href="/" icon={HomeIcon}>Home</NavLink>
          <NavLink href="/about" icon={Info}>About</NavLink>
        </div>

        {/* Desktop CTA */}
        <div className="hidden md:block">
          <Link
            href="#get-started"
            className="inline-flex items-center gap-2 rounded-xl bg-white text-[#3B38A0] px-4 py-2 font-medium shadow hover:shadow-lg transition"
          >
            Get Started
            <ArrowRight size={20} aria-hidden="true" />
          </Link>
        </div>

        {/* Mobile hamburger */}
        <div className="md:hidden">
          {/* onToggle hanya dipanggil dari useEffect di child → tidak memicu error */}
          <AnimatedHamburgerButton onToggle={setMobileOpen} />
        </div>
      </nav>

      {/* Mobile dropdown menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            key="mobile-menu"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="md:hidden border-t border-white/10"
          >
            <div className="mx-auto max-w-7xl px-6 py-3 flex flex-col gap-2">
              <Link
                href="/"
                onClick={() => setMobileOpen(false)}
                className="inline-flex items-center gap-2 rounded-md px-3 py-2 text-white/90 hover:bg-white/10"
              >
                <HomeIcon size={20} />
                Home
              </Link>
              <Link
                href="/about"
                onClick={() => setMobileOpen(false)}
                className="inline-flex items-center gap-2 rounded-md px-3 py-2 text-white/90 hover:bg-white/10"
              >
                <Info size={20} />
                About
              </Link>
              <Link
                href="#get-started"
                onClick={() => setMobileOpen(false)}
                className="mt-2 inline-flex items-center justify-center gap-2 rounded-xl bg-white text-[#3B38A0] px-4 py-2 font-medium shadow"
              >
                Get Started
                <ArrowRight size={18} aria-hidden="true" />
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
