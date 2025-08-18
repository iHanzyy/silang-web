import Image from "next/image";
import Link from "next/link";

export default function Footer() {
  return (
    <footer className="mt-10 border-t border-white/10">
      <div className="mx-auto max-w-7xl px-6 py-12 grid grid-cols-1 md:grid-cols-3 gap-10">
        {/* Brand */}
        <div className="flex items-start gap-4">
          <Image
            src="/LogoSiLang.png"
            alt="SiLang"
            width={40}
            height={40}
            className="rounded-md"
          />
          <div>
            <h4 className="font-semibold text-lg">SiLang</h4>
            <p className="mt-2 text-sm text-slate-300/90 max-w-xs">
              Sign language transforms silence into trust, love, and endless stories.
            </p>
          </div>
        </div>

        {/* Quick Links */}
        <div>
          <h4 className="font-semibold text-lg">Quick Links</h4>
          <ul className="mt-4 space-y-2">
            <li>
              <Link href="/" className="text-slate-300 hover:text-white">
                Home
              </Link>
            </li>
            <li>
              <Link href="/about" className="text-slate-300 hover:text-white">
                About
              </Link>
            </li>
          </ul>
        </div>

        {/* Contact */}
        <div>
          <h4 className="font-semibold text-lg">Contact With Us</h4>
          <div className="mt-4 flex items-center gap-3">
            {/* Placeholder untuk ikon sosmed */}
            <a
              href="mailto:contact@silang.example"
              className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20"
              aria-label="Email us"
              title="Email"
            >
              ✉
            </a>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-white/10">
        <div className="mx-auto max-w-7xl px-6 py-6 text-sm flex flex-col md:flex-row items-center justify-between gap-3 text-slate-300/90">
          <p>© 2025 SiLang. All rights reserved.</p>
          <p>Developed by SiLang Team</p>
        </div>
      </div>
    </footer>
  );
}
