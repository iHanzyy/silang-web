"use client";

import Image from "next/image";
import Link from "next/link";
import { Instagram, Github } from "lucide-react";
import { orbitron, quicksand } from "@/lib/fonts";

export default function AboutHero() {
  return (
    <section className="mx-auto max-w-7xl px-6 pt-14 pb-20">
      {/* Title + subtitle */}
      <h1 className={`text-center text-5xl font-bold text-white ${orbitron.className}`}>
        About SiLang
      </h1>
      <p className={`mt-3 text-center text-white text-xl ${quicksand.className} font-semibold`}>
        Every sign speaks, every gesture connects, every silence tells a story.
      </p>

      {/* Main content */}
      <div className="mt-22 grid grid-cols-1 lg:grid-cols-12 gap-10 lg:items-center">
        {/* Left: two profile cards */}
        <div className="lg:col-span-5 lg:self-center">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <TeamCard
              imgSrc="/about/jonah.jpg"
              imgAlt="Mohammad Jonah S."
              name="Mohammad Jonah S."
              role="Web Developer"
              quote="Choose people who choose you, you're not a backup plan"
              igHref="https://www.instagram.com/mojostwn/"
              ghHref="https://github.com/iHanzyy"
            />
            <TeamCard
              imgSrc="/about/faiz.jpg"
              imgAlt="Faiz Zaenal Muttaqin"
              name="Faiz Zaenal Muttaqin"
              role="UI / UX Designer"
              quote="Diatas langit masih ada faiz"
              igHref="https://www.instagram.com/cuiras_13/"
              ghHref="https://github.com/faizaenal"
            />
          </div>
        </div>

        {/* Right: story */}
        <div className="lg:col-span-7 lg:self-center">
          <h3 className={`text-2xl font-semibold text-white ${orbitron.className}`}>Our Story</h3>
          <div className="mt-2 h-[2px] w-[130px] rounded bg-white" />
          <div
            className={`mt-5 space-y-5 text-white leading-relaxed text-[15.5px] md:text-xl ${quicksand.className} font-semibold text-justify`}
          >
            <p>
              Two friends, just days away from finishing their journey in vocational school, found
              themselves with a little extra time and a lot of curiosity. On a whim, we decided to
              join a web development competition with the theme of education. While brainstorming,
              an idea sparked—what if we built something meaningful, something that could help others learn?
            </p>
            <p>
              That’s how SiLang was born: a simple yet heartfelt website to introduce and teach the
              alphabet in sign language. More than just a project, SiLang is our way of sharing a tool
              for connection, understanding, and learning. What started as a playful idea quickly became
              something we truly care about.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ---------------- Team Card: notch setengah lingkaran pada BACKGROUND ---------------- */

function TeamCard({ imgSrc, imgAlt, name, role, quote, igHref, ghHref }) {
  // Ukuran avatar; notch mengikuti diameter ini:
  const OUTER = 118;         // diameter cincin terluar (px)
  const R = OUTER / 3;       // radius notch = OUTER/3
  const INNER_IMG = 94;      // diameter foto di dalam ring putih
  const AVATAR_OFFSET = -(R) + 6; // fine-tune supaya center di notch

  // Mask untuk layer background (bukan pada card/parent):
  const notchMask =
    `radial-gradient(circle var(--r) at 50% 0, transparent calc(var(--r) - .5px), ` +
    `#000 calc(var(--r) + .5px)), linear-gradient(#000,#000)`;

  return (
    <article
      className="
        relative overflow-visible
        rounded-[40px] px-8 pt-24 pb-8 text-center text-white
        backdrop-blur-md
        shadow-[0_16px_40px_rgba(0,0,0,0.35)]
      "
    >
      {/* LAYER BACKGROUND dengan MASK (membuat notch) */}
      <div
        className="absolute inset-0 -z-10 rounded-[40px] ring-1 ring-white/15"
        style={{
          WebkitMask: notchMask,
          mask: notchMask,
          ["--r"]: `${R}px`,
          background:
            "linear-gradient(180deg, rgba(255,255,255,0.12) 0%, rgba(255,255,255,0.06) 100%)",
        }}
      />

      {/* Avatar melayang (FULL circle), TIDAK ikut ter-mask */}
      <div
        className="absolute left-1/2 -translate-x-1/2 z-10"
        style={{ top: AVATAR_OFFSET }}
      >
        <div style={{ width: OUTER, height: OUTER }} className="relative">
          {/* outer ring gelap + glow */}
          <div className="absolute inset-0 rounded-full bg-[#27306D] shadow-[0_10px_24px_rgba(0,0,0,0.45)]" />
          {/* ring putih + foto (utuh) */}
          <div className="absolute inset-[10px] rounded-full overflow-hidden ring-4 ring-white">
            <Image
              src={imgSrc}
              alt={imgAlt}
              width={INNER_IMG}
              height={INNER_IMG}
              className="h-full w-full object-cover"
            />
          </div>
        </div>
      </div>

      {/* Konten */}
      <h4 className={`mt-2 text-[20px] font-bold text-white ${quicksand.className}`}>{name}</h4>
      <p className="mt-1 text-[14px] text-white/70">{role}</p>

      <p className={`mt-6 text-[15px] italic leading-relaxed text-white ${quicksand.className}`}>
        {quote}
      </p>

      <div className="mt-8 flex items-center justify-center gap-5">
        <SocialCircle href={igHref} label="Instagram">
          <Instagram size={18} />
        </SocialCircle>
        <SocialCircle href={ghHref} label="GitHub">
          <Github size={18} />
        </SocialCircle>
      </div>

      {/* inner border halus */}
      <div className="pointer-events-none absolute inset-0 rounded-[40px] ring-1 ring-white/10" />
    </article>
  );
}

function SocialCircle({ href = "#", label, children }) {
  return (
    <Link
      href={href}
      aria-label={label}
      className="
        inline-flex h-11 w-11 items-center justify-center
        rounded-full bg-black/25 backdrop-blur-md
        ring-2 ring-[#B2B0E8] text-white
        hover:bg-black/35 hover:ring-[#C9C6F2]
        transition
      "
    >
      {children}
    </Link>
  );
}
