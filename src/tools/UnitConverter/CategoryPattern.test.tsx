import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import CategoryPattern from "./CategoryPattern";

describe("CategoryPattern Component", () => {
  const categories = [
    "distance",
    "temperature",
    "area",
    "volume",
    "mass",
    "speed",
    "digital",
    "time",
    "pressure",
    "energy",
  ];

  categories.forEach((cat) => {
    it(`renders unique SVG geometric pattern for "${cat}"`, () => {
      const { container } = render(<CategoryPattern categoryId={cat} />);
      const svg = container.querySelector("svg");
      expect(svg).toBeTruthy();
      expect(svg?.getAttribute("class")).toContain(`pattern-${cat}`);

      const pattern = container.querySelector(`#geom-pat-${cat}`);
      expect(pattern).toBeTruthy();

      const rect = container.querySelector(".category-pattern-rect");
      expect(rect?.getAttribute("fill")).toBe(`url(#geom-pat-${cat})`);
    });
  });

  it("renders default geometric pattern fallback for unknown category", () => {
    const { container } = render(<CategoryPattern categoryId="unknown_category" />);
    const pattern = container.querySelector("#geom-pat-unknown_category");
    expect(pattern).toBeTruthy();
  });
});
