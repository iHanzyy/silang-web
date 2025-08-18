import Image from "next/image";

export default function HeroSection() {
  return (
    <section className="mx-auto max-w-7xl px-6 pt-14 pb-24">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
        {/* Left text */}
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-slate-300/80">
            Sign Language, a Universal Connection
          </p>

          <h1 className="mt-4 text-4xl sm:text-5xl md:text-6xl font-extrabold leading-tight text-slate-50">
            Through <span className="text-slate-200">hands</span> we
            <br />
            share <span className="text-blue-200">emotions</span>,
            <br />
            break <span className="text-blue-200">barriers</span>,
            <br />
            and build
            <br />
            <span className="text-blue-200">understanding</span>.
          </h1>

          <div className="mt-10 flex flex-wrap items-center gap-4">
            <a
              id="get-started"
              href="#learn"
              className="inline-flex items-center justify-center rounded-xl bg-white text-slate-900 px-5 py-3 font-medium shadow hover:shadow-lg transition"
            >
              Start Learning →
            </a>
            <a
              href="/about"
              className="inline-flex items-center justify-center rounded-xl border border-white/20 px-5 py-3 font-medium text-slate-200 hover:bg-white/10 transition"
            >
              About SiLang
            </a>
          </div>

          {/* Mini tagline (seperti di footer kiri) */}
          <div className="mt-12 flex items-start gap-3">
            <Image
              src="/LogoSiLang.png"
              alt="SiLang"
              width={32}
              height={32}
              className="rounded-md"
            />
            <p className="text-sm text-slate-300/90 max-w-md">
              Sign language transforms silence into trust, love, and endless stories.
            </p>
          </div>
        </div>

        {/* Right image card */}
        <div className="rounded-3xl card-ivory p-8 md:p-12 shadow-2xl">
          <div className="aspect-[16/10] w-full relative rounded-2xl overflow-hidden">
            <Image
              src="/LogoSiLang.png"
              alt="SiLang wordmark & gestures"
              fill
              sizes="(max-width: 768px) 100vw, 600px"
              className="object-contain p-6"
              priority
            />
          </div>
        </div>
      </div>
    </section>
  );
}
