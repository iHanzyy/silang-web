import "./globals.css";
import { orbitron, baloo, quicksand } from "@/lib/fonts";


export const metadata = {
  title: "SiLang: Sign Language",
  description: "A web application for sign language translation",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${orbitron.variable} ${baloo.variable} ${quicksand.variable} antialiased bg-gradient-to-b from-[#1A2A80] to-[#05091A] bg-fixed`}>
        {children}
      </body>
    </html>
  );
}
