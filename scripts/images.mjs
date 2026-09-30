// Pre-optimises raster assets for the static export (next/image can't optimise at runtime there).
//   pnpm images   →  app/apple-icon.png from app/icon.svg, and public/portrait.{avif,webp,jpg}
//                    from assets/portrait-src.(jpg|jpeg|png) if you've added one.
import { existsSync } from "node:fs";
import sharp from "sharp";

await sharp("app/icon.svg", { density: 600 }).resize(180, 180).png().toFile("app/apple-icon.png");
console.log("✓ app/apple-icon.png");

const src = ["assets/portrait-src.jpg", "assets/portrait-src.jpeg", "assets/portrait-src.png"].find(existsSync);
if (src) {
  const base = sharp(src).rotate().resize(900, 1125, { fit: "cover", position: "attention" });
  await base.clone().avif({ quality: 55 }).toFile("public/portrait.avif");
  await base.clone().webp({ quality: 74 }).toFile("public/portrait.webp");
  await base.clone().jpeg({ quality: 78, mozjpeg: true }).toFile("public/portrait.jpg");
  console.log(`✓ portrait from ${src} — now set site.portrait = "/portrait" in content/site.ts`);
} else {
  console.log("· no assets/portrait-src.jpg yet — skipping portrait");
}
