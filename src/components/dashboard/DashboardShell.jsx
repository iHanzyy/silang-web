// src/components/dashboard/DashboardShell.jsx
"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import DashboardSidebar from "./DashboardSidebar";
import DashboardTopMenu from "./DashboardTopMenu";
import AnimatedHamburgerButton from "@/components/AnimatedHamburgerButton";

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

      {/* Hamburger mobile */}
      {showMobileHamburger && (
        <div className="md:hidden fixed right-4 top-4 z-50">
          <AnimatedHamburgerButton
            initialOpen={mobOpen}
            onToggle={setMobOpen}
          />
        </div>
      )}

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

      {/* ==== MOBILE: drawer dari atas ==== */}
      <div className="md:hidden min-h-screen">
        {!isPracticeSession && mobOpen && (
          <DashboardTopMenu onClose={() => setMobOpen(false)} />
        )}
        <div>{children}</div>
      </div>
    </div>
  );
}
