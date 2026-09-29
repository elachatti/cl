import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";

import AppProviders from "@/components/providers/AppProviders";

import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "CLUBI",
    template: "%s · CLUBI",
  },
  description:
    "Discover computer science hackathons, competitions, workshops and conferences, with an AI assistant to help you choose and prepare.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

// Applies the saved (or system) theme before first paint to avoid a light/dark flash.
const themeScript = `
(function () {
  try {
    var saved = window.localStorage.getItem('theme');
    var dark = saved ? saved === 'dark' : window.matchMedia('(prefers-color-scheme: dark)').matches;
    document.documentElement.classList.toggle('dark', dark);
  } catch (e) {}
})();
`;

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;600;700&family=Inter:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body>
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}
