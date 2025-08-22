"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BookOpen, Gamepad2, LogOut } from "lucide-react";
import { quicksand } from "@/lib/fonts";

export default function DashboardTopMenu({ onClose }) {
  const pathname = usePathname();
  const Item = ({ href, Icon, children }) => {
    const active =
      pathname === href ||
      (href !== "/dashboard/learn" && pathname.startsWith(href));
    return (
      <Link
        href={href}
        onClick={onClose}
        className={`
          inline-flex items-center gap-3 rounded-2xl px-4 py-3
          ${active ? "bg-white/14 ring-1 ring-white/25 text-white"
                   : "bg-white/10 ring-1 ring-white/15 text-white/95 hover:bg-white/14"}
          backdrop-blur-lg shadow-sm transition-none
          ${quicksand.className} font-semibold
        `}
      >
        <Icon size={18} />
        <span>{children}</span>
      </Link>
    );
  };

  return (
    <div
      className="
        fixed left-4 right-4 top-16 z-50
        flex flex-col gap-3
      "
    >
      <Item href="/dashboard/learn" Icon={BookOpen}>Learn</Item>
      <Item href="/dashboard/practice" Icon={Gamepad2}>Practice</Item>

      <button
        onClick={onClose}
        className="
          inline-flex items-center justify-center gap-3 rounded-2xl px-4 py-3
          bg-white/14 ring-1 ring-white/25 text-white
          backdrop-blur-lg shadow transition-none
          font-semibold
        "
      >
        <LogOut size={18} />
        Exit
      </button>
    </div>
  );
}
