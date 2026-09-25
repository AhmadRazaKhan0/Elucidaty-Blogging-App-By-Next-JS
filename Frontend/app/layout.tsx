import type { Metadata } from "next";
import { Newsreader, Instrument_Sans } from "next/font/google";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Providers from "@/components/Providers";
import SmoothScroll from "@/components/SmoothScroll";
import { APP_URL } from "@/lib/utils";
import "lenis/dist/lenis.css";
import "./globals.scss";

// adjustFontFallback:false — Next 14 has no size-adjust metrics for Newsreader, which caused
// "Failed to find font override values for font `Newsreader`". The explicit fallback stack keeps the layout stable.
const serif = Newsreader({ subsets: ["latin"], variable: "--serif", display: "swap", adjustFontFallback: false, fallback: ["Georgia", "Times New Roman", "serif"] });
const sans = Instrument_Sans({ subsets: ["latin"], variable: "--sans", display: "swap", fallback: ["system-ui", "Segoe UI", "Arial", "sans-serif"] });

export const metadata: Metadata = {
  metadataBase: new URL(APP_URL),
  title: { default: "Elucidaty", template: "%s | Elucidaty" },
  description: "Elucidaty is a publication of clear writing on software, design and the work around them.",
  openGraph: { siteName: "Elucidaty", type: "website", title: "Elucidaty", description: "Clear writing on software, design and work." },
  twitter: { card: "summary", title: "Elucidaty" },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${serif.variable} ${sans.variable}`}>
      <body>
        <noscript><style>{`[style*="opacity: 0"],[style*="opacity:0"]{opacity:1!important;transform:none!important}`}</style></noscript>
        <a href="#main" className="skip">Skip to content</a>
        <Providers>
          <SmoothScroll />
          <Navbar />
          <div id="main">{children}</div>
          <Footer />
        </Providers>
      </body>
    </html>
  );
}
