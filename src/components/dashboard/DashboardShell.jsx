"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import DashboardSidebar from "./DashboardSidebar";
import DashboardTopMenu from "./DashboardTopMenu";
import AnimatedHamburgerButton from "@/components/AnimatedHamburgerButton";

// hook kecil untuk breakpoint md
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

  // desktop sidebar (persist)
  const [deskOpen, setDeskOpen] = useState(true);
  useEffect(() => {
    const saved = localStorage.getItem("dashSidebarOpen");
    if (saved !== null) setDeskOpen(saved === "1");
  }, []);
  useEffect(() => {
    localStorage.setItem("dashSidebarOpen", deskOpen ? "1" : "0");
  }, [deskOpen]);

  // mobile drawer
  const [mobOpen, setMobOpen] = useState(false);

  // tutup mobile saat route berubah; desktop tetap (sesuai jawaban #2)
  useEffect(() => {
    if (!mdUp) setMobOpen(false);
  }, [pathname, mdUp]);

  // ESC menutup menu (mobile saja)
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") setMobOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <div className="relative min-h-screen text-white">
      {/* Hamburger desktop: kiri-atas */}
      <div className="hidden md:block fixed left-4 top-4 z-50">
        <AnimatedHamburgerButton
          initialOpen={deskOpen}
          onToggle={setDeskOpen}
        />
      </div>

      {/* Hamburger mobile: kanan-atas */}
      <div className="md:hidden fixed right-4 top-4 z-50">
        <AnimatedHamburgerButton
          initialOpen={mobOpen}
          onToggle={setMobOpen}
        />
      </div>

      {/* DESKTOP LAYOUT (push) */}
      <div
        className="hidden md:grid min-h-screen"
        style={{
          gridTemplateColumns: `${deskOpen ? SIDEBAR_W : 0}px 1fr`,
          transition: "none", // no animation
        }}
      >
        {/* kolom sidebar */}
        <div className="overflow-hidden">
          {deskOpen && (
            <DashboardSidebar onExit={() => (window.location.href = "/")} />
          )}
        </div>

        {/* kolom konten */}
        <div className="min-h-screen">{children}</div>
      </div>

      {/* MOBILE LAYOUT (drawer dari atas) */}
      <div className="md:hidden min-h-screen">
        {/* panel top menu */}
        {mobOpen && <DashboardTopMenu onClose={() => setMobOpen(false)} />}

        {/* konten */}
        <div className="min-h-screen">{children}</div>
      </div>
    </div>
  );
}
