import type { Metadata } from "next";
import "./globals.css";

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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body style={{ margin: 0, padding: 0, background: "#080c12" }}>
        {children}
      </body>
    </html>
  );
}
