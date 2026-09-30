// Pre-optimises raster assets for the static export (next/image can't optimise at runtime there).
//   pnpm images   →  app/apple-icon.png from app/icon.svg, and public/portrait.{avif,webp,jpg}
//                    from private/portrait-src.jpg (git-ignored: the original carries GPS EXIF).
// sharp drops all metadata unless asked to keep it, so the published files have no location data.
import { existsSync } from "node:fs";
import sharp from "sharp";

await sharp("app/icon.svg", { density: 600 }).resize(180, 180).png().toFile("app/apple-icon.png");
console.log("✓ app/apple-icon.png");

const src = "private/portrait-src.jpg";
if (existsSync(src)) {
  const { width, height } = await sharp(src).rotate().metadata();
  // 4:5 crop, centred on the subject (58.5% across the frame), trimmed a little from the top.
  const top = Math.round(height * 0.055);
  const cropH = height - top;
  const cropW = Math.round(cropH * 0.8);
  const left = Math.min(width - cropW, Math.max(0, Math.round(width * 0.585 - cropW / 2)));
  const base = sharp(src).rotate().extract({ left, top, width: cropW, height: cropH }).resize(900, 1125);
  await base.clone().avif({ quality: 52 }).toFile("public/portrait.avif");
  await base.clone().webp({ quality: 72 }).toFile("public/portrait.webp");
  await base.clone().jpeg({ quality: 78, mozjpeg: true }).toFile("public/portrait.jpg");
  console.log("✓ public/portrait.{avif,webp,jpg}");
} else {
  console.log(`· no ${src} — skipping portrait`);
}
