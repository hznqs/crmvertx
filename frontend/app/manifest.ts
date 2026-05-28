import type { MetadataRoute } from "next";
import { brandAssets } from "@/lib/brand/assets";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: brandAssets.productName,
    short_name: "VX CRM",
    description: brandAssets.description,
    start_url: "/dashboard",
    display: "standalone",
    background_color: brandAssets.themeColor,
    theme_color: brandAssets.themeColor,
    icons: [
      {
        src: brandAssets.icons.icon192,
        sizes: "192x192",
        type: "image/png",
        purpose: "any"
      },
      {
        src: brandAssets.icons.icon512,
        sizes: "512x512",
        type: "image/png",
        purpose: "any"
      },
      {
        src: brandAssets.icons.icon512,
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable"
      }
    ]
  };
}
