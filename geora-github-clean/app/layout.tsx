import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  manifest: "/manifest.webmanifest",
  title: "Giratlas · Descubre el mundo",
  description:
    "Descubre el mundo, país a país. Banderas, capitales, mapas y expediciones.",
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body className="antialiased">
        <a className="skip-link" href="#main-content">
          Ir al contenido
        </a>
        {children}
      </body>
    </html>
  );
}
