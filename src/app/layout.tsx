import type { Metadata, Viewport } from "next";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export const metadata: Metadata = {
  title: "Observalo · Observatorio de Bitcoin",
  description: "Análisis de la red Bitcoin en español — distribución, ondas HODL, flujos de exchanges y minería en tiempo real",
  openGraph: {
    title: "Observalo · Observatorio de Bitcoin",
    description: "Análisis de la red Bitcoin en español — distribución, ondas HODL, flujos de exchanges y minería en tiempo real",
    url: "https://observalo.com",
    siteName: "Observalo",
    locale: "es_CL",
    type: "website",
  },
  icons: {
    icon: "/favicon.svg",
  },
  robots: {
    index: true,
    follow: true,
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
