"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { Home as HomeIcon, Info, ArrowRight } from "lucide-react";
import AnimatedHamburgerButton from "@/components/AnimatedHamburgerButton";
import { orbitron, quicksand } from "@/lib/fonts";
import RoundedSlideButton from "@/components/RoundedSlideButton";

/** Warna aktif untuk desktop nav */
const ACTIVE = "#B2B0E8";

/** Desktop nav dengan underline animasi (hanya tampil di md+) */
function DesktopNav() {
  const pathname = usePathname();
  const items = [
    { href: "/", label: "Home", Icon: HomeIcon, isActive: pathname === "/" },
    {
      href: "/about",
      label: "About",
      Icon: Info,
      // aktif juga untuk sub-routes /about/*
      isActive: pathname === "/about" || pathname.startsWith("/about/"),
    },
  ];

  return (
    <div className="hidden md:flex items-center gap-6">
      {items.map(({ href, label, Icon, isActive }) => (
        <Link key={href} href={href} className="inline-flex items-center gap-2">
          <Icon
            size={20}
            strokeWidth={1.75}
            className={isActive ? "text-[#B2B0E8]" : "text-white"}
          />
          {/* Bungkus teks dengan container relative agar garis hanya sepanjang teks */}
          <span
            className={`relative pb-1 text-xl font-semibold ${
              isActive ? "text-[#B2B0E8]" : "text-white/90"
            } ${quicksand.className}`}
          >
            {label}
            {/* Garis yang berpindah menggunakan shared layoutId */}
            {isActive && (
              <motion.span
                layoutId="nav-underline"
                transition={{ type: "spring", stiffness: 500, damping: 40 }}
                className="absolute left-0 right-0 -bottom-[4px] h-[2px] rounded bg-[#B2B0E8]"
              />
            )}
          </span>
        </Link>
      ))}
    </div>
  );
}

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <>
      {/* ===== Fixed header (blur) ===== */}
      <header
        className="
          fixed inset-x-0 top-0 z-50
          border-b border-white/10
          bg-white/8 backdrop-blur-md
          supports-[backdrop-filter]:bg-white/8
        "
      >
        <nav className="mx-auto max-w-7xl px-6 h-16 md:h-20 flex items-center justify-between">
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
            <span
              className={`text-lg sm:text-xl font-bold tracking-wide text-white ${orbitron.className}`}
            >
              SiLang
            </span>
          </Link>

          {/* Desktop links (punya underline animasi) */}
          <DesktopNav />

          {/* Desktop CTA (boleh tetap glass) */}
          <div className="hidden md:block">
            <RoundedSlideButton
              href="/dashboard"
              label="Get started"
              iconPlacement="right"
            />
          </div>

          {/* Mobile hamburger */}
          <div className="md:hidden">
            <AnimatedHamburgerButton onToggle={setMobileOpen} />
          </div>
        </nav>
      </header>

      {/* Spacer agar konten tidak ketutup header fixed */}
      <div className="h-16 md:h-20" />

      {/* ===== Mobile overlay (scrim gelap, chip glass) ===== */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            key="mobile-menu"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="
              md:hidden fixed inset-x-0 top-16 bottom-0 z-40
              bg-gradient-to-b from-[#1A2A80]/85 to-[#05091A]/90
            "
            onClick={() => setMobileOpen(false)}
          >
            <motion.div
              initial={{ y: -8, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -8, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="mx-auto max-w-7xl px-6 py-3"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex flex-col gap-3">
                <Link
                  href="/"
                  onClick={() => setMobileOpen(false)}
                  className="inline-flex items-center gap-3 rounded-2xl px-4 py-3
                             text-white/95 hover:text-white
                             bg-white/12 hover:bg-white/16
                             ring-1 ring-white/20
                             backdrop-blur-lg shadow-sm transition"
                >
                  <HomeIcon size={20} />
                  <span className="font-semibold text-[16px]">Home</span>
                </Link>

                <Link
                  href="/about"
                  onClick={() => setMobileOpen(false)}
                  className="inline-flex items-center gap-3 rounded-2xl px-4 py-3
                             text-white/95 hover:text-white
                             bg-white/12 hover:bg-white/16
                             ring-1 ring-white/20
                             backdrop-blur-lg shadow-sm transition"
                >
                  <Info size={20} />
                  <span className="font-semibold text-[16px]">About</span>
                </Link>

                <Link
                  href="#get-started"
                  onClick={() => setMobileOpen(false)}
                  className="mt-1 inline-flex items-center justify-center gap-2 rounded-2xl px-4 py-3
                             text-white font-semibold
                             bg-white/14 hover:bg-white/18
                             ring-1 ring-white/25
                             backdrop-blur-lg shadow transition"
                >
                  Get Started
                  <ArrowRight size={18} aria-hidden />
                </Link>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
