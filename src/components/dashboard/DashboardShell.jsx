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
// ⬇️ jarak aman dari hamburger saat sidebar TERTUTUP
const HAMBURGER_SAFE_OFFSET = 50; // ubah ke 64/80 sesuai selera

export default function DashboardShell({ children }) {
  const pathname = usePathname();
  const mdUp = useIsMdUp();

  // desktop: persist open state
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
  useEffect(() => {
    if (!mdUp) setMobOpen(false); // close when route changes on mobile
  }, [pathname, mdUp]);

  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && setMobOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <div className="relative min-h-screen text-white">
      {/* Hamburger desktop (kiri-atas) */}
      <div className="hidden md:block fixed left-4 top-4 z-50">
        <AnimatedHamburgerButton initialOpen={deskOpen} onToggle={setDeskOpen} />
      </div>

      {/* Hamburger mobile (kanan-atas) */}
      <div className="md:hidden fixed right-4 top-4 z-50">
        <AnimatedHamburgerButton initialOpen={mobOpen} onToggle={setMobOpen} />
      </div>

      {/* ==== DESKTOP: sidebar push + content-only scroll ==== */}
      <div
        className="hidden md:grid"
        style={{
          gridTemplateColumns: `${deskOpen ? SIDEBAR_W : 0}px 1fr`,
          height: "100vh",
        }}
      >
        {/* Sidebar column */}
        <div className="overflow-hidden">
          {deskOpen && (
            <div className="sticky top-0 h-screen">
              <DashboardSidebar onExit={() => (window.location.href = "/")} />
            </div>
          )}
        </div>

        {/* Content column */}
        <div
          className="h-screen overflow-y-auto"
          // ⬇️ saat sidebar tertutup, kasih padding kiri supaya konten gak nabrak hamburger
          style={{ paddingLeft: deskOpen ? 0 : HAMBURGER_SAFE_OFFSET }}
        >
          <div className="pb-10">{children}</div>
        </div>
      </div>

      {/* ==== MOBILE: drawer dari atas ==== */}
      <div className="md:hidden min-h-screen">
        {mobOpen && <DashboardTopMenu onClose={() => setMobOpen(false)} />}
        <div>{children}</div>
      </div>
    </div>
  );
}
