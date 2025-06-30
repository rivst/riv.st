import fs from "fs";

export default function () {
  return {
    layout: "layouts/note.njk",
    tags: ["note"],
    eleventyComputed: {
      lastModified: (data) => {
        const stats = fs.statSync(data.page.inputPath);
        return stats.mtime;
      },
    },
    date: "git Created",
  };
}
