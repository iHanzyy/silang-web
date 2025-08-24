// src/components/dashboard/DashboardShell.jsx
"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
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
// jarak aman dari hamburger saat sidebar TERTUTUP (halaman non-session)
const HAMBURGER_SAFE_OFFSET = 50;

export default function DashboardShell({ children }) {
  const pathname = usePathname();
  const mdUp = useIsMdUp();

  // ⬇️ Anggap halaman sesi practice jika URL /dashboard/practice/mod-*
  const isPracticeSession = /^\/dashboard\/practice\/mod-\d+$/.test(pathname);

  // ===== Desktop: persist open state ketika BUKAN halaman sesi =====
  const [deskOpen, setDeskOpen] = useState(true);
  useEffect(() => {
    const saved = localStorage.getItem("dashSidebarOpen");
    if (saved !== null) setDeskOpen(saved === "1");
  }, []);
  useEffect(() => {
    // tetap disimpan seperti biasa; di halaman sesi, state akan di-override saja
    localStorage.setItem("dashSidebarOpen", deskOpen ? "1" : "0");
  }, [deskOpen]);

  // ===== Mobile drawer =====
  const [mobOpen, setMobOpen] = useState(false);
  useEffect(() => {
    // tutup ketika ganti route pada mobile
    if (!mdUp) setMobOpen(false);
  }, [pathname, mdUp]);

  // tutup paksa ketika masuk halaman sesi practice
  useEffect(() => {
    if (isPracticeSession) setMobOpen(false);
  }, [isPracticeSession]);

  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && setMobOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  // ===== Nilai efektif (override) saat halaman sesi practice =====
  const effectiveDeskOpen = isPracticeSession ? false : deskOpen;
  const showDesktopHamburger = !isPracticeSession;
  const showMobileHamburger = !isPracticeSession;

  const contentLeftPadding =
    !isPracticeSession && !effectiveDeskOpen ? HAMBURGER_SAFE_OFFSET : 0;

  return (
    <div className="relative min-h-screen text-white">
      {/* Hamburger desktop (kiri-atas) — disembunyikan pada halaman sesi */}
      {showDesktopHamburger && (
        <div className="hidden md:block fixed left-4 top-4 z-50">
          <AnimatedHamburgerButton
            initialOpen={deskOpen}
            onToggle={setDeskOpen}
          />
        </div>
      )}

      {/* Hamburger mobile (kanan-atas) — disembunyikan pada halaman sesi */}
      {showMobileHamburger && (
        <div className="md:hidden fixed right-4 top-4 z-50">
          <AnimatedHamburgerButton
            initialOpen={mobOpen}
            onToggle={setMobOpen}
          />
        </div>
      )}

      {/* ==== DESKTOP: sidebar push + content-only scroll ==== */}
      <div
        className="hidden md:grid"
        style={{
          gridTemplateColumns: `${effectiveDeskOpen ? SIDEBAR_W : 0}px 1fr`,
          height: "100vh",
        }}
      >
        {/* Sidebar column */}
        <div className="overflow-hidden">
          {effectiveDeskOpen && (
            <div className="sticky top-0 h-screen">
              <DashboardSidebar onExit={() => (window.location.href = "/")} />
            </div>
          )}
        </div>

        {/* Content column */}
        <div
          className="h-screen overflow-y-auto"
          style={{ paddingLeft: contentLeftPadding }}
        >
          <div className="pb-10">{children}</div>
        </div>
      </div>

      {/* ==== MOBILE: drawer dari atas ==== */}
      <div className="md:hidden min-h-screen">
        {/* Jangan tampilkan top menu saat sesi practice */}
        {!isPracticeSession && mobOpen && (
          <DashboardTopMenu onClose={() => setMobOpen(false)} />
        )}
        <div>{children}</div>
      </div>
    </div>
  );
}
