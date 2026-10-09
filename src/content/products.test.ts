import { products, nextProduct, getProduct } from "./products";

describe("products config", () => {
  it("has the four launch products with unique slugs", () => {
    expect(products.map((p) => p.slug)).toEqual(["acre", "pinpoints", "prism", "nod"]);
  });
  it("never uses em dashes in public copy", () => {
    const text = JSON.stringify(products);
    expect(text).not.toMatch(/—/);
  });
  it("gives every product a real call to action", () => {
    for (const p of products) expect(p.cta.href).toMatch(/^(https:\/\/|mailto:)/);
  });
  it("cycles next experiment back to the start", () => {
    expect(nextProduct("nod").slug).toBe("acre");
    expect(getProduct("missing")).toBeUndefined();
  });
});
