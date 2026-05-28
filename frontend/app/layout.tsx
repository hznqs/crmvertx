import type { Metadata, Viewport } from "next";
import "./globals.css";
import { Providers } from "@/app/providers";
import { AppShell } from "@/components/app/app-shell";
import { getSessionUser } from "@/lib/auth/session";
import { brandAssets } from "@/lib/brand/assets";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"),
  applicationName: brandAssets.productName,
  title: {
    default: brandAssets.productName,
    template: `%s | ${brandAssets.productName}`
  },
  description: brandAssets.description,
  manifest: "/manifest.webmanifest",
  icons: {
    icon: [
      {
        url: brandAssets.icons.favicon32,
        sizes: "32x32",
        type: "image/png"
      },
      {
        url: brandAssets.icons.icon192,
        sizes: "192x192",
        type: "image/png"
      }
    ],
    shortcut: brandAssets.icons.favicon32,
    apple: [
      {
        url: brandAssets.icons.apple,
        sizes: "180x180",
        type: "image/png"
      }
    ]
  },
  appleWebApp: {
    capable: true,
    title: brandAssets.productName,
    statusBarStyle: "black-translucent"
  },
  openGraph: {
    title: brandAssets.productName,
    description: brandAssets.description,
    images: [
      {
        url: brandAssets.logo.src,
        width: brandAssets.logo.width,
        height: brandAssets.logo.height,
        alt: brandAssets.logo.alt
      }
    ]
  }
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: dark)", color: brandAssets.themeColor },
    { media: "(prefers-color-scheme: light)", color: brandAssets.accentColor }
  ],
  colorScheme: "dark"
};

export default async function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  const user = await getSessionUser();

  return (
    <html lang="pt-BR" className="dark" data-crm-theme="enterprise-dark">
      <body>
        <Providers role={user?.role ?? null}>
          <AppShell user={user}>{children}</AppShell>
        </Providers>
      </body>
    </html>
  );
}
