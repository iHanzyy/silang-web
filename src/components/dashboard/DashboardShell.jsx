// src/components/dashboard/DashboardShell.jsx
"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import { BookOpen, Target, LogOut } from "lucide-react";
import DashboardSidebar from "./DashboardSidebar";
import AnimatedHamburgerButton from "@/components/AnimatedHamburgerButton";
import { orbitron } from "@/lib/fonts";

function useIsMdUp() {
  const [mdUp, setMdUp] = useState(false);
  useEffect(() => {
    const m = window.matchMedia("(min-width: 768px)");
    const handler = () => setMdUp(m.matches);
    handler();
    m.addEventListener("change", handler);
    return () => m.removeEventListener("change", handler);
  }, []);
  return mdUp;
}

const SIDEBAR_W = 232;

export default function DashboardShell({ children }) {
  const pathname = usePathname();
  const mdUp = useIsMdUp();

  const isPracticeSession = /^\/dashboard\/practice\/mod-\d+$/.test(pathname);

  // ===== Desktop: sidebar dimulai dari tertutup =====
  const [deskOpen, setDeskOpen] = useState(false);
  
  useEffect(() => {
    // Simpan state ke localStorage
    localStorage.setItem("dashSidebarOpen", deskOpen ? "1" : "0");
  }, [deskOpen]);

  // ===== Mobile drawer =====
  const [mobOpen, setMobOpen] = useState(false);
  useEffect(() => {
    if (!mdUp) setMobOpen(false);
  }, [pathname, mdUp]);

  useEffect(() => {
    if (isPracticeSession) setMobOpen(false);
  }, [isPracticeSession]);

  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && setMobOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  // ===== Nilai efektif =====
  const effectiveDeskOpen = isPracticeSession ? false : deskOpen;
  const showDesktopHamburger = !isPracticeSession;
  const showMobileHamburger = !isPracticeSession;

  return (
    <div className="relative min-h-screen text-white">
      {/* Hamburger desktop */}
      {showDesktopHamburger && (
        <div className="hidden md:block fixed left-4 top-4 z-50">
          <AnimatedHamburgerButton
            initialOpen={deskOpen}
            onToggle={setDeskOpen}
          />
        </div>
      )}

      {/* Hamburger mobile dengan animasi slide dari kanan */}
      {showMobileHamburger && (
        <motion.div
          initial={{ x: 50, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="md:hidden fixed right-4 top-4 z-50"
        >
          <AnimatedHamburgerButton
            key={pathname} // force remount saat pathname berubah
            initialOpen={false} // selalu mulai dari false
            onToggle={setMobOpen}
          />
        </motion.div>
      )}

      {/* Brand mobile dengan animasi - tampil saat mobile menu terbuka */}
      <AnimatePresence>
        {showMobileHamburger && mobOpen && (
          <motion.div
            initial={{ y: -8, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -8, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="md:hidden fixed left-4 top-4 z-50"
          >
            <Link href="/" className="flex items-center gap-3">
              <Image
                src="/LogoSiLang.png"
                alt="SiLang Logo"
                width={32}
                height={32}
                className="rounded-md"
                priority
              />
              <span
                className={`text-lg font-bold tracking-wide text-white ${orbitron.className}`}
              >
                SiLang
              </span>
            </Link>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ==== DESKTOP: layout dengan animasi ==== */}
      <div className="hidden md:flex h-screen relative">
        {/* Sidebar dengan AnimatePresence */}
        <AnimatePresence>
          {effectiveDeskOpen && (
            <motion.div
              key="sidebar"
              initial={{ x: -SIDEBAR_W }}
              animate={{ x: 0 }}
              exit={{ x: -SIDEBAR_W }}
              transition={{
                duration: 0.4,
                ease: "easeInOut"
              }}
              style={{ width: SIDEBAR_W }}
              className="absolute left-0 top-0 h-full z-10"
            >
              <DashboardSidebar onExit={() => (window.location.href = "/")} />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Content area - initial state full width, bergeser ketika sidebar muncul */}
        <motion.div
          className="w-full h-screen overflow-y-auto"
          animate={{
            transform: effectiveDeskOpen ? `translateX(${SIDEBAR_W}px)` : 'translateX(0px)',
            width: effectiveDeskOpen ? `calc(100% - ${SIDEBAR_W}px)` : '100%'
          }}
          transition={{
            duration: 0.4,
            ease: "easeInOut",
            delay: effectiveDeskOpen ? 0 : 0 // content bergeser setelah sidebar muncul
          }}
        >
          <div className="pb-10">{children}</div>
        </motion.div>
      </div>

      {/* ==== MOBILE: overlay dengan desain sama seperti Navbar ==== */}
      <div className="md:hidden min-h-screen">
        {/* Mobile overlay dengan desain Navbar */}
        <AnimatePresence>
          {!isPracticeSession && mobOpen && (
            <motion.div
              key="mobile-menu"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-x-0 top-0 bottom-0 z-40 bg-gradient-to-b from-[#1A2A80]/85 to-[#05091A]/90"
              onClick={() => setMobOpen(false)}
            >
              <motion.div
                initial={{ y: -8, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: -8, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="mx-auto max-w-7xl px-6 py-3 pt-20"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex flex-col gap-3">
                  <Link
                    href="/dashboard/learn"
                    onClick={() => setMobOpen(false)}
                    className="inline-flex items-center gap-3 rounded-2xl px-4 py-3
                               text-white/95 hover:text-white
                               bg-white/12 hover:bg-white/16
                               ring-1 ring-white/20
                               backdrop-blur-lg shadow-sm transition"
                  >
                    <BookOpen size={20} />
                    <span className="font-semibold text-[16px]">Learn</span>
                  </Link>

                  <Link
                    href="/dashboard/practice"
                    onClick={() => setMobOpen(false)}
                    className="inline-flex items-center gap-3 rounded-2xl px-4 py-3
                               text-white/95 hover:text-white
                               bg-white/12 hover:bg-white/16
                               ring-1 ring-white/20
                               backdrop-blur-lg shadow-sm transition"
                  >
                    <Target size={20} />
                    <span className="font-semibold text-[16px]">Practice</span>
                  </Link>

                  <Link
                    href="/"
                    onClick={() => setMobOpen(false)}
                    className="mt-1 inline-flex items-center justify-center gap-2 rounded-2xl px-4 py-3
                               text-white font-semibold
                               bg-white/14 hover:bg-white/18
                               ring-1 ring-white/25
                               backdrop-blur-lg shadow transition"
                  >
                    <LogOut size={18} aria-hidden />
                    Quit
                  </Link>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        <div>{children}</div>
      </div>
    </div>
  );
}
