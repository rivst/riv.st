import { Cite } from "@citation-js/core";
import "@citation-js/plugin-bibtex";
import "@citation-js/plugin-csl";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default function () {
  const bibDir = path.join(__dirname, "litstash", "bib");
  const bibCache = {};

  if (!fs.existsSync(bibDir)) {
    console.warn(`BibTeX directory not found: ${bibDir}`);
    return bibCache;
  }

  const files = fs.readdirSync(bibDir).filter((file) => file.endsWith(".bib"));

  files.forEach((filename) => {
    try {
      const filePath = path.join(bibDir, filename);
      const content = fs.readFileSync(filePath, "utf-8");

      const cite = new Cite(content);

      const formattedCitation = cite.format("bibliography", {
        format: "html",
      });

      bibCache[filename] = formattedCitation;
    } catch (error) {
      console.error(`Error parsing ${filename}:`, error.message);
    }
  });

  return bibCache;
}
