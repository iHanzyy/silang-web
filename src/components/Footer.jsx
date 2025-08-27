"use client";

import Image from "next/image";
import Link from "next/link";
import { Github } from "lucide-react";
import { motion } from "framer-motion";
import { orbitron, quicksand } from "@/lib/fonts";

export default function Footer() {
  return (
    <motion.footer
      className="mt-2 bg-transparent"
      initial={{
        y: 100,
        opacity: 0,
      }}
      animate={{
        y: 0,
        opacity: 1,
      }}
      transition={{
        duration: 0.8,
        ease: "easeOut",
        delay: 0.3,
      }}
    >
      <div className="mx-auto max-w-7xl px-6 text-white">
        {/* ===== Top area (3 kolom) ===== */}
        <div className="py-12">
          {/* Mobile: center semua. Desktop: 3 kolom sama lebar & gap konsisten */}
          <div
            className="
              mx-auto max-w-5xl
              grid grid-cols-1 md:grid-cols-3
              gap-y-10 md:gap-x-16
              place-items-center md:place-items-start
              text-center md:text-left
            "
          >
            {/* Brand */}
            <div>
              <div className="flex items-center justify-center md:justify-start gap-3">
                <Image
                  src="/LogoSiLang.png"
                  alt="SiLang"
                  width={40}
                  height={40}
                  className="block select-none shrink-0"
                  priority
                />
                <span
                  className={`font-bold leading-none tracking-[0.03em] text-[28px] ${orbitron.className}`}
                >
                  SiLang
                </span>
              </div>

              <p
                className={`mt-4 mx-auto md:mx-0 max-w-[340px] text-[16px] leading-7 text-white/90 font-semibold ${quicksand.className}`}
              >
                Sign language transforms silence into trust, love, and endless
                stories.
              </p>
            </div>

            {/* Quick Links */}
            <div>
              <h4 className={`text-2xl font-bold ${orbitron.className}`}>
                Quick Links
              </h4>
              <ul className="mt-4 space-y-3">
                <li>
                  <Link
                    href="/"
                    className={`text-white/80 hover:text-white font-semibold text-[15px] ${quicksand.className}`}
                  >
                    Home
                  </Link>
                </li>
                <li>
                  <Link
                    href="/about"
                    className={`text-white/80 hover:text-white font-semibold text-[15px] ${quicksand.className}`}
                  >
                    About
                  </Link>
                </li>
              </ul>
            </div>

            {/* Contact (sudah ikut grid & gap yang sama) */}
            <div>
              <h4 className={`text-2xl font-bold ${orbitron.className}`}>
                Contact With Us
              </h4>

              {/* Ikon center di mobile, kiri di desktop */}
              <div className="mt-4 flex items-center justify-center md:justify-start gap-3">
                <a
                  href="https://github.com/iHanzyy/silang-web"
                  className="
                    inline-flex h-10 w-10 items-center justify-center
                    rounded-full bg-white/10 hover:bg-white/20
                    ring-1 ring-white/10 transition
                  "
                  aria-label="GitHub"
                  title="GitHub"
                >
                  <Github size={20} />
                </a>
                {/* tambahkan ikon lain jika perlu, jarak tetap konsisten */}
              </div>
            </div>
          </div>
        </div>

        {/* ===== Divider (lebar sama dgn container) ===== */}
        <div className="mx-auto max-w-7xl">
          <div className="h-[2px] w-full bg-[#B2B0E8]" />
        </div>

        {/* ===== Bottom bar (tengah) ===== */}
        <div className="py-6 text-center">
          <p className={`text-[15px] font-semibold ${quicksand.className}`}>
            © 2025 SiLang. All rights reserved.
          </p>
          <p className={`text-[15px] font-semibold ${quicksand.className}`}>
            Developed by SiLang Team
          </p>
        </div>
      </div>
    </motion.footer>
  );
}
