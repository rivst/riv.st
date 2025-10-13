import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import bibtexParse from "bibtex-parse-js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function formatAuthorsAPA(authorString) {
  if (!authorString) return "";

  const authors = authorString.split(" and ").map((author) => author.trim());

  return authors
    .map((author, index) => {
      // Extract braced content (used in BibTeX to keep text together)
      const bracedMatches = [];
      let processedAuthor = author.replace(/\{([^}]+)\}/g, (match, content) => {
        const placeholder = `__BRACED_${bracedMatches.length}__`;
        bracedMatches.push(content);
        return placeholder;
      });

      const parts = processedAuthor.split(/\s+/).filter((p) => p);

      if (parts.length === 0) return "";

      const restoredParts = parts.map((part) => {
        return part.replace(/__BRACED_(\d+)__/g, (match, idx) => {
          return bracedMatches[parseInt(idx)];
        });
      });

      // Last part is the last name
      const lastName = restoredParts[restoredParts.length - 1];

      // Everything else becomes initials
      const initials = restoredParts
        .slice(0, -1)
        .map((part) => {
          // Handle names with dots already (like "P.Y.")
          if (part.includes(".")) {
            return part.replace(/\./g, ". ").trim();
          }
          // Regular name - take first letter
          return part[0] + ".";
        })
        .join(" ");

      // Format: "LastName, I. I."
      let formatted = lastName;
      if (initials) {
        formatted += `, ${initials}`;
      }

      if (index === authors.length - 1) {
        return formatted;
      } else if (index === authors.length - 2) {
        return formatted + ", &";
      } else {
        return formatted + ",";
      }
    })
    .join(" ");
}

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

      const parsed = bibtexParse.toJSON(content);

      if (parsed && parsed.length > 0) {
        const entry = parsed[0];

        const authorRaw = entry.entryTags?.AUTHOR || entry.entryTags?.author || "";

        const normalizedEntry = {
          type: entry.entryType || "article",
          key: entry.citationKey || "",
          authorFormatted: formatAuthorsAPA(authorRaw),
          authorRaw: authorRaw,
          title: entry.entryTags?.TITLE || entry.entryTags?.title || "",
          year: entry.entryTags?.YEAR || entry.entryTags?.year || "",
          journal: entry.entryTags?.JOURNAL || entry.entryTags?.journal || "",
          volume: entry.entryTags?.VOLUME || entry.entryTags?.volume || "",
          number: entry.entryTags?.NUMBER || entry.entryTags?.number || "",
          pages: entry.entryTags?.PAGES || entry.entryTags?.pages || "",
          doi: entry.entryTags?.DOI || entry.entryTags?.doi || "",
          url: entry.entryTags?.URL || entry.entryTags?.url || "",
          abstract:
            entry.entryTags?.ABSTRACT || entry.entryTags?.abstract || "",
        };

        bibCache[filename] = normalizedEntry;
      }
    } catch (error) {
      console.error(`Error parsing ${filename}:`, error.message);
    }
  });

  return bibCache;
}
