import { Orbitron, Baloo_2 } from "next/font/google";
import "./globals.css";

const orbitron = Orbitron({
  variable: "--font-orbitron",
  subsets: ["latin"],
});

const baloo = Baloo_2({
  variable: "--font-baloo",
  subsets: ["latin"],
});

export const metadata = {
  title: "SiLang: Sign Language",
  description: "A web application for sign language translation",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body
        className={`${orbitron.variable} ${baloo.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
