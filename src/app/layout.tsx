import type { Metadata, Viewport } from "next";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export const metadata: Metadata = {
  metadataBase: new URL("https://observalo.com"),
  title: {
    default: "Observalo · Observatorio de Bitcoin",
    template: "%s | Observalo",
  },
  description:
    "Observatorio de Bitcoin en español. Datos de la red en tiempo real: distribución por cohortes, ondas HODL, flujos de exchanges, minería, precio Rainbow Chart con proyección a 2040, escasez y derivados.",
  keywords: [
    "Bitcoin", "observatorio", "análisis", "datos de la red", "ondas HODL",
    "Rainbow Chart", "distribución Bitcoin", "flujos exchanges", "minería Bitcoin",
    "halving", "escasez", "derivados", "open interest", "hashrate",
    "mempool", "precio Bitcoin", "acumuladores", "soberanía financiera",
    "español", "tiempo real",
  ],
  authors: [{ name: "Observalo" }],
  creator: "Observalo",
  openGraph: {
    title: "Observalo · Observatorio de Bitcoin",
    description:
      "Datos de la red Bitcoin en tiempo real: distribución, ondas HODL, flujos de exchanges, minería, Rainbow Chart y más — todo en español.",
    url: "https://observalo.com",
    siteName: "Observalo",
    locale: "es_CL",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Observalo · Observatorio de Bitcoin",
    description:
      "Datos de la red Bitcoin en tiempo real — distribución, ondas HODL, flujos, minería, Rainbow Chart y más. En español.",
  },
  alternates: {
    canonical: "https://observalo.com",
  },
  icons: {
    icon: "/favicon.svg",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

const themeScript = `(function(){var t=localStorage.getItem("theme");if(!t)t=window.matchMedia("(prefers-color-scheme:light)").matches?"light":"dark";document.documentElement.setAttribute("data-theme",t)})()`;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body style={{ margin: 0, padding: 0 }}>
        {children}
        <Analytics />
      </body>
    </html>
  );
}
