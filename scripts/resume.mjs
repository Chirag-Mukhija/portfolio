// Renders resume/resume.html to PDF with headless Chrome.
//   public/Chirag-Mukhija-Resume.pdf        — linked from the site; phone number removed
//   private/Chirag-Mukhija-Resume-full.pdf  — for applications; git-ignored
import { execFileSync } from "node:child_process";
import { mkdirSync, readFileSync, writeFileSync, rmSync } from "node:fs";
import path from "node:path";

const CHROME = process.env.CHROME_PATH ?? "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const src = readFileSync("resume/resume.html", "utf8");

function render(html, out) {
  const tmp = path.resolve(`resume/.render-${path.basename(out, ".pdf")}.html`);
  writeFileSync(tmp, html);
  execFileSync(
    CHROME,
    [
      "--headless=new",
      "--disable-gpu",
      "--no-pdf-header-footer",
      `--print-to-pdf=${path.resolve(out)}`,
      `file://${tmp}`,
    ],
    { stdio: "ignore" },
  );
  rmSync(tmp);
  console.log(`✓ ${out}`);
}

mkdirSync("private", { recursive: true });
render(src.replace(/<span class="phone">[^<]*<\/span>/, ""), "public/Chirag-Mukhija-Resume.pdf");
render(src, "private/Chirag-Mukhija-Resume-full.pdf");
