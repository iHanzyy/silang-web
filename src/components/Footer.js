import Image from "next/image";
import Link from "next/link";
import { Github } from "lucide-react";
import { orbitron, quicksand } from "@/lib/fonts"; // sesuaikan importmu

export default function Footer() {
  return (
    <footer className="mt-2 bg-transparent">
      {/* Container utama */}
      <div className="mx-auto max-w-7xl px-1 text-white">
        {/* 3 kolom (brand / links / contact) */}
        <div className="py-12">
          {/* inner container supaya ketiga bloknya terpusat dan tidak terlalu melebar */}
          <div
            className="mx-auto max-w-5xl 
                  grid grid-cols-1 
                  md:grid-flow-col md:auto-cols-max md:justify-center 
                  gap-y-10 md:gap-x-24 text-white ml-11"
          >
{/* Brand (logo + wordmark, tagline di bawah) */}
<div className="justify-self-center md:justify-self-end">
  {/* baris logo + tulisan SiLang */}
  <div className="flex items-center gap-3">
    <Image
      src="/LogoSiLang.png"
      alt="SiLang"
      width={40}               // sesuaikan 40–48 biar pas
      height={40}
      className="block select-none shrink-0" // tidak menambah styling lain
      priority
    />
    <span
      className={`font-bold leading-none tracking-[0.03em] text-[28px] text-white ${orbitron.className}`}
    >
      SiLang
    </span>
  </div>

  {/* tagline */}
  <p
    className={`mt-4 max-w-[320px] text-[16px] leading-7 text-white/90 font-semibold ${quicksand.className}`}
  >
    Sign language transforms silence into trust, love, and
    endless stories.
  </p>
</div>


            {/* Quick Links */}
            <div className="justify-self-center text-center md:text-left">
              <h4 className={`text-2xl font-bold ${orbitron.className}`}>
                Quick Links
              </h4>
              <ul className="mt-4 space-y-3">
                <li>
                  <Link
                    href="/"
                    className={`text-white/80 hover:text-white font-semibold ${quicksand.className} text-[15px]`}
                  >
                    Home
                  </Link>
                </li>
                <li>
                  <Link
                    href="/about"
                    className={`text-white/80 hover:text-white font-semibold ${quicksand.className} text-[15px]`}
                  >
                    About
                  </Link>
                </li>
              </ul>
            </div>

            {/* Contact */}
            <div className="justify-self-center md:justify-self-start text-center md:text-left">
              <h4 className={`text-2xl font-bold ${orbitron.className}`}>
                Contact With Us
              </h4>
              <div className="mt-4 flex items-center justify-center md:justify-start gap-3">
                <a
                  href="https://github.com/iHanzyy/silang-web"
                  className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-white/10 hover:bg-white/20"
                  aria-label="GitHub"
                  title="GitHub"
                >
                  <Github size={20} />
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Divider/garis tipis sesuai lebar container */}
        <div className="mx-auto max-w-7xl px-6">
          <div className="h-[2px] w-full bg-[#B2B0E8]" />
        </div>

        {/* Bottom bar: teks tengah */}
        <div className="py-6 text-center">
          <p
            className={`text-[15px] font-semibold text-white ${quicksand.className}`}
          >
            © 2025 SiLang. All rights reserved.
          </p>
          <p
            className={`text-[15px] font-semibold text-white ${quicksand.className}`}
          >
            Developed by SiLang Team
          </p>
        </div>
      </div>
    </footer>
  );
}
