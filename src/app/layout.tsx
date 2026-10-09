import type { Metadata } from "next";
import { Cormorant_Garamond, Inter, Tiro_Devanagari_Hindi } from "next/font/google";

import { MotionProvider } from "@/components/motion";
import "./globals.css";
import Script from "next/script";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const cormorant = Cormorant_Garamond({
  variable: "--font-cormorant",
  subsets: ["latin"],
  weight: ["500", "600", "700"],
});

// Devanagari fallback for the Hindi name and pillar words.
const tiro = Tiro_Devanagari_Hindi({
  variable: "--font-deva",
  subsets: ["devanagari", "latin"],
  weight: "400",
});

export const metadata: Metadata = {
  title: { default: "Vidhi Ekta Sngh", template: "%s · Vidhi Ekta Sngh" },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${cormorant.variable} ${tiro.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col">
        <MotionProvider>{children}</MotionProvider>

        {process.env.NEXT_PUBLIC_GA_ID && (
          <>
            <Script
              src={`https://www.googletagmanager.com/gtag/js?id=${process.env.NEXT_PUBLIC_GA_ID}`}
              strategy="afterInteractive"
            />
            <Script id="google-analytics" strategy="afterInteractive">
              {`
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', '${process.env.NEXT_PUBLIC_GA_ID}');
              `}
            </Script>
          </>
        )}
      </body>
    </html>
  );
}
