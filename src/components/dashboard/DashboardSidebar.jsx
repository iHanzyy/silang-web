// components/dashboard/DashboardSidebar.jsx
"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { BookOpen, Gamepad2, LogOut } from "lucide-react";
import { orbitron, quicksand } from "@/lib/fonts";

const NAV = [
  { href: "/dashboard/learn", label: "Learn", Icon: BookOpen },
  { href: "/dashboard/practice", label: "Practice", Icon: Gamepad2 },
];

export default function DashboardSidebar({ onExit }) {
  const pathname = usePathname();

  return (
    <aside
      className="
        h-full w-[232px] shrink-0
        bg-[#17246a]/92 text-white
        border-r border-white/10
        flex flex-col
      "
    >
      {/* Brand */}
      <div className="h-16 pr-4 pl-4 md:pl-16 flex items-center gap-3">
        <Image src="/LogoSiLang.png" alt="SiLang" width={36} height={36} />
        <span className={`text-lg font-bold ${orbitron.className}`}>SiLang</span>
      </div>

      <div className="border-t border-white/15" />

      {/* Nav */}
      <nav className="p-4 flex-1 space-y-2">
        {NAV.map(({ href, label, Icon }) => {
          const active =
            pathname === href ||
            (href !== "/dashboard/learn" && pathname.startsWith(href));
          return (
            <Link
              key={href}
              href={href}
              className={`
                group flex items-center gap-3 px-3 py-3 rounded-xl
                ${active ? "bg-white/10 text-white ring-1 ring-white/20"
                         : "text-white/90 hover:bg-white/10 hover:ring-white/15 ring-1 ring-transparent"}
                ${quicksand.className} font-semibold
              `}
            >
              <Icon size={18} className={active ? "text-[#B2B0E8]" : ""} />
              <span>{label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Exit */}
      <button
        onClick={onExit}
        className="m-4 mt-auto flex items-center gap-3 px-3 py-3 rounded-xl
                   text-white/90 hover:bg-white/10 ring-1 ring-white/10 cursor-pointer"
      >
        <LogOut size={18} />
        <span className={`${quicksand.className} font-semibold`}>Exit</span>
      </button>
    </aside>
  );
}
