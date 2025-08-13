import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import ServiceWorkerRegistration from "../components/ServiceWorkerRegistration";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "Camisas de Fútbol - Colección Completa",
  description: "Descubre nuestra amplia colección de camisas de fútbol: Jugador, Retro y Aficionado. Réplicas oficiales de alta calidad con múltiples imágenes de cada modelo.",
  keywords: "camisas fútbol, camisetas fútbol, réplicas oficiales, camisas jugador, camisas retro, camisas aficionado",
  author: "Tu Tienda de Camisas",
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-gray-50`}
      >
        <ServiceWorkerRegistration />
        {children}
      </body>
    </html>
  );
}
