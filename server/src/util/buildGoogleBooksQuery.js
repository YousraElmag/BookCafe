/**
 * Turn the user's search text into a Google Books API query.
 *
 * Supported filters:
 *   author:rowling             -> inauthor:rowling
 *   author:"j.k. rowling"      -> inauthor:"j.k. rowling"   (quotes for multi-word values)
 *   category:fantasy           -> subject:fantasy
 *   category:"science fiction" -> subject:"science fiction"
 * All other words are passed on as normal search terms.
 *
 * The result is NOT URL-encoded: pass it to axios via `params` so axios encodes it.
 */
const FILTERS = {
  author: "inauthor",
  category: "subject",
};

// A filter with a quoted or single-word value, or a quoted phrase, or a single word
const TOKEN_REGEX = /(author|category):("[^"]*"|\S*)|"[^"]*"|\S+/gi;

export const buildGoogleBooksQuery = (rawQuery) => {
  if (typeof rawQuery !== "string") return "";

  const terms = [];
  for (const match of rawQuery.trim().matchAll(TOKEN_REGEX)) {
    const [token, filterName, filterValue] = match;

    if (!filterName) {
      terms.push(token);
      continue;
    }

    const value = filterValue.trim();
    // Skip empty filters like `author:` or `author:""`
    if (value === "" || value === '""') continue;

    terms.push(`${FILTERS[filterName.toLowerCase()]}:${value}`);
  }

  return terms.join(" ");
};
