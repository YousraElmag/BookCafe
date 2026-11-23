import { buildGoogleBooksQuery } from "../buildGoogleBooksQuery.js";

describe("buildGoogleBooksQuery", () => {
  it("keeps normal words as they are", () => {
    expect(buildGoogleBooksQuery("harry potter")).toBe("harry potter");
  });

  it("keeps special characters so axios can encode them", () => {
    expect(buildGoogleBooksQuery("tom & jerry")).toBe("tom & jerry");
    expect(buildGoogleBooksQuery("c# programming")).toBe("c# programming");
    expect(buildGoogleBooksQuery("c++ primer")).toBe("c++ primer");
  });

  it("converts author: and category: filters", () => {
    expect(buildGoogleBooksQuery("author:rowling category:fantasy")).toBe(
      "inauthor:rowling subject:fantasy",
    );
  });

  it("supports quoted multi-word filter values", () => {
    expect(
      buildGoogleBooksQuery('author:"j.k. rowling" category:"science fiction"'),
    ).toBe('inauthor:"j.k. rowling" subject:"science fiction"');
  });

  it("treats filter names case-insensitively", () => {
    expect(buildGoogleBooksQuery("Author:Tolkien")).toBe("inauthor:Tolkien");
  });

  it("ignores empty filters and extra spaces", () => {
    expect(buildGoogleBooksQuery("  dune   author:  ")).toBe("dune");
    expect(buildGoogleBooksQuery('author:""')).toBe("");
  });

  it("returns an empty string for empty or invalid input", () => {
    expect(buildGoogleBooksQuery("   ")).toBe("");
    expect(buildGoogleBooksQuery(undefined)).toBe("");
    expect(buildGoogleBooksQuery(["a", "b"])).toBe("");
  });
});
