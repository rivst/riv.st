export default function (eleventyConfig) {
  eleventyConfig.addPassthroughCopy("style.css");
  eleventyConfig.addPassthroughCopy("assets/fonts");
  eleventyConfig.addPassthroughCopy("now.txt");
  eleventyConfig.addFilter("post_date", (dateObj) => {
    return `${dateObj.toLocaleString("default", {
      dateStyle: "medium",
      timeStyle: "short",
    })}`;
  });
  eleventyConfig.addFilter("exclude", (collection, stringToFilter) => {
    if (!stringToFilter) {
      return collection;
    }
    return (collection ?? []).filter((item) => item !== stringToFilter);
  });
}
