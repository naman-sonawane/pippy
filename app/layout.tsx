import type { Metadata, Viewport } from "next";
import { Montserrat } from "next/font/google";
import "./globals.css";

const montserrat = Montserrat({
  variable: "--font-montserrat",
  subsets: ["latin"],
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
  style: ["normal", "italic"],
});

export const metadata: Metadata = {
  title: "pippy",
  description: "track your hours!",
  generator: "Next.js",
  manifest: "/favicon/site.webmanifest",
  keywords: ["nextjs", "time tracker", "productivity", "hours logger"],
  icons: {
    icon: [
      {
        url: "/favicon/favicon-96x96.png",
        type: "image/png",
        sizes: "96x96",
      },
      {
        url: "/favicon/favicon.svg",
        type: "image/svg+xml",
      },
    ],
    apple: [
      {
        url: "/favicon/apple-touch-icon.png",
        sizes: "180x180",
        type: "image/png",
      },
    ],
    shortcut: ["/favicon/favicon.ico"],
  },
  appleWebApp: {
    title: "pippy.",
  },
  other: {
    "google-fonts":
      "Montserrat:ital,wght@0,100..900;1,100..900&family=Petit+Formal+Script",
  },
};

export const viewport: Viewport = {
  themeColor: [{ media: "(prefers-color-scheme: light)", color: "#fce7e7" }],
  width: "device-width",
  initialScale: 1,
  minimumScale: 1,
  maximumScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Montserrat:ital,wght@0,100..900;1,100..900&family=Petit+Formal+Script&display=swap"
          rel="stylesheet"
        />
      </head>
      <body
        className={`${montserrat.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
