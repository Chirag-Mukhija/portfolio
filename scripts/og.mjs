// Renders scripts/og.html (1200×630) with headless Chrome, then compresses it to public/og.jpg.
import { execFileSync } from "node:child_process";
import { rmSync } from "node:fs";
import path from "node:path";
import sharp from "sharp";

const CHROME = process.env.CHROME_PATH ?? "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const tmp = path.resolve("scripts/.og.png");
execFileSync(
  CHROME,
  [
    "--headless=new",
    "--hide-scrollbars",
    "--force-device-scale-factor=1",
    "--window-size=1200,630",
    "--virtual-time-budget=6000",
    `--screenshot=${tmp}`,
    `file://${path.resolve("scripts/og.html")}`,
  ],
  { stdio: "ignore" },
);
await sharp(tmp).jpeg({ quality: 84, mozjpeg: true }).toFile("public/og.jpg");
rmSync(tmp);
console.log("✓ public/og.jpg");
