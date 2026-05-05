import type { Metadata } from "next";
import { Bebas_Neue, Montserrat } from "next/font/google";
import "./globals.css";
import { AppProvider } from "@/context/AppContext";

const bebasNeue = Bebas_Neue({
  weight: "400",
  variable: "--font-bebas",
  subsets: ["latin"],
});

const montserrat = Montserrat({
  variable: "--font-montserrat",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "Ninetynine Shoe",
    template: "%s | Ninetynine Shoe",
  },
  description: "Premium Shoe Cleaning Services",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css" />
      </head>
      <body className={`${bebasNeue.variable} ${montserrat.variable} antialiased bg-slate-50 text-slate-800 font-montserrat`}>
        <AppProvider>
          {children}
        </AppProvider>
      </body>
    </html>
  );
}
