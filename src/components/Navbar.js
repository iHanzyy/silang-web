"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { Menu, X, Home as HomeIcon, Info } from "lucide-react";

const NavLink = ({ href, children, icon: Icon }) => (
  <Link
    href={href}
    className="inline-flex items-center gap-2 px-3 py-2 rounded-md text-slate-200 hover:text-white hover:bg-white/10 transition"
  >
    {Icon ? <Icon size={16} /> : null}
    <span>{children}</span>
  </Link>
);

export default function Navbar() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-white/10 backdrop-blur-md">
      <nav className="mx-auto max-w-7xl px-6 py-4 flex items-center justify-between">
        {/* Left: Brand */}
        <Link href="/" className="flex items-center gap-3">
          <Image
            src="/LogoSiLang.png"
            alt="SiLang Logo"
            width={36}
            height={36}
            className="rounded-md"
            priority
          />
          <span className="text-lg font-semibold tracking-wide">SiLang</span>
        </Link>

        {/* Desktop links */}
        <div className="hidden md:flex items-center gap-1">
          <NavLink href="/" icon={HomeIcon}>Home</NavLink>
          <NavLink href="/about" icon={Info}>About</NavLink>
        </div>

        {/* Right: CTA */}
        <div className="hidden md:block">
          <Link
            href="#get-started"
            className="inline-flex items-center gap-2 rounded-xl bg-white text-slate-900 px-4 py-2 font-medium shadow hover:shadow-lg transition"
          >
            Get Started <span aria-hidden>→</span>
          </Link>
        </div>

        {/* Mobile toggle */}
        <button
          aria-label="Toggle menu"
          onClick={() => setOpen((v) => !v)}
          className="md:hidden inline-flex items-center justify-center p-2 rounded-md hover:bg-white/10"
        >
          {open ? <X /> : <Menu />}
        </button>
      </nav>

      {/* Mobile menu */}
      {open && (
        <div className="md:hidden border-t border-white/10">
          <div className="mx-auto max-w-7xl px-6 py-3 flex flex-col gap-2">
            <NavLink href="/" icon={HomeIcon}>Home</NavLink>
            <NavLink href="/about" icon={Info}>About</NavLink>
            <Link
              href="#get-started"
              className="inline-flex items-center justify-center rounded-xl bg-white text-slate-900 px-4 py-2 font-medium shadow mt-2"
              onClick={() => setOpen(false)}
            >
              Get Started →
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
