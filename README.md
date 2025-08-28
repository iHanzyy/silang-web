<div align="center">
  <img src="public/LogoSiLang.png" alt="SiLang Logo" width="80" height="80">
  <h1>SiLang - Sign Language Learning Platform</h1>
  <p><strong>Platform pembelajaran bahasa isyarat BISINDO interaktif dengan AI detection</strong></p>
  
  ![Next.js](https://img.shields.io/badge/Next.js-14-black?style=flat-square&logo=next.js)
  ![React](https://img.shields.io/badge/React-18-blue?style=flat-square&logo=react)
  ![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3-06B6D4?style=flat-square&logo=tailwindcss)
  ![Framer Motion](https://img.shields.io/badge/Framer_Motion-Animation-FF6B9D?style=flat-square)
</div>

---

## 📖 Tentang SiLang

**SiLang (Sign Language)** adalah platform pembelajaran bahasa isyarat Indonesia (BISINDO) yang interaktif dan mudah digunakan. Dikembangkan untuk semua usia, SiLang memanfaatkan teknologi **AI hand detection** untuk mendeteksi gerakan tangan secara real-time dan memberikan feedback langsung kepada pengguna.

### ✨ Fitur Utama

- **📚 Learn Mode** – Belajar bentuk isyarat tangan untuk huruf A–Z dengan visualisasi jelas.  
- **🎯 Practice Modules** – 6 modul latihan terstruktur:
  - Modul 1–5: Latihan huruf per kelompok (A–E, F–J, K–O, P–T, U–Z)  
  - Modul 6: Latihan kata kerja dasar dalam bahasa isyarat  
- **🤖 AI Detection** – Deteksi gerakan tangan real-time menggunakan webcam.  
- **📱 Responsive Design** – Optimized untuk desktop dan mobile.  
- **🎨 Interactive UI** – Animasi smooth dengan Framer Motion.  
- **💾 Progress Tracking** – Simpan progres belajar otomatis dengan localStorage.  

### 🎯 Target Pengguna

Ditujukan untuk semua kalangan yang ingin belajar BISINDO:
- Pelajar & mahasiswa  
- Guru & tenaga pendidik  
- Keluarga dengan anggota tunarungu  
- Masyarakat umum  

---

## 🚀 Demo

🌐 **Live Demo**: [https://silang-web.vercel.app](https://silang-web.vercel.app) *(coming soon)*

---

## 📸 Screenshots
Screenshots fitur utama akan ditambahkan setelah deployment.

---

## 🛠️ Tech Stack

- **Framework**: Next.js 14, React 18  
- **Styling**: Tailwind CSS  
- **Animations**: Framer Motion  
- **AI Detection**: MediaPipe / Custom Hand Detection Model  
- **Fonts**: Orbitron, Quicksand  
- **Storage**: localStorage  
- **Icons**: Lucide React  

---

## 📦 Instalasi & Setup

### Prasyarat
- Node.js 18+  
- Package manager: npm / yarn / pnpm / bun  

### Clone Repository
```bash
git clone https://github.com/your-username/silang-web.git
cd silang-web
```

### Install Dependencies
```bash
npm install
# atau
yarn install
# atau
pnpm install
# atau
bun install
```

### Jalankan Development Server
```bash
npm run dev
# atau
yarn dev
# atau
pnpm dev
# atau
bun dev
```

Buka [http://localhost:3000](http://localhost:3000) di browser.

### Build untuk Production
```bash
npm run build
npm start
```

---

## 📁 Struktur Proyek

```
silang-web/
├── src/
│   ├── app/                 # App Router (Next.js 14)
│   │   ├── dashboard/       # Dashboard pages
│   │   │   ├── learn/       # Learn mode
│   │   │   └── practice/    # Practice modules
│   │   └── about/           # About page
│   ├── components/          # Reusable components
│   │   ├── dashboard/       # Dashboard-specific components
│   │   ├── practice/        # Practice session components
│   │   └── ui/              # General UI components
│   ├── lib/                 # Utilities and configurations
│   └── styles/              # Global styles
├── public/
│   ├── letters/             # Sign language images (A–Z)
│   └── LogoSiLang.png
└── README.md
```

---

## 🎮 Cara Penggunaan

1. Mulai dengan **Learn Mode** untuk mempelajari bentuk huruf.  
2. Lanjut ke **Practice Modules** sesuai kemampuan.  
3. Aktifkan **Webcam** untuk deteksi AI.  
4. Ikuti instruksi dan dapatkan **feedback real-time**.  
5. Pantau progres belajar Anda di dashboard.  

---

## 👥 Tim Pengembang

- **[Mohammad Jonah Setiawan](https://github.com/iHanzyy)** – Web Developer  
- **[Faiz Zaenal Muttaqin](https://github.com/faizaenal)** – UI/UX Designer  

---

## 📚 Referensi

Referensi bahasa isyarat mengacu pada **BISINDO (Bahasa Isyarat Indonesia)** sebagai sistem resmi di Indonesia.

---

## 🤝 Kontribusi

Kami sangat terbuka untuk kontribusi.  

1. Fork repository ini  
2. Buat branch fitur baru (`git checkout -b feature/AmazingFeature`)  
3. Commit perubahan Anda (`git commit -m 'Add some AmazingFeature'`)  
4. Push ke branch (`git push origin feature/AmazingFeature`)  
5. Buat Pull Request  

### Guidelines
- Ikuti konvensi kode yang ada  
- Tambahkan dokumentasi untuk fitur baru  
- Lakukan testing sebelum PR  
- Pertahankan konsistensi UI/UX  

---

## 📄 License

Proyek ini bersifat open-source di bawah [MIT License](LICENSE).

---

## 🙏 Acknowledgments

- Terima kasih kepada komunitas BISINDO  
- Inspirasi dari kebutuhan aksesibel pembelajaran bahasa isyarat  
- Semua tim tester & beta users  

---

<div align="center">
  <p>Dibuat dengan ❤️ oleh Tim SiLang</p>
  <p>© 2025 SiLang. All rights reserved.</p>
</div>
