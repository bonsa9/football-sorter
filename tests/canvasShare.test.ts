import { describe, expect, it } from "vitest";
import { generateShareCanvas, downloadShareCard, shareToSocial } from "../src/lib/canvasShare";

describe("Canvas Share Poster Module", () => {
  it("exports required share functions", () => {
    expect(typeof generateShareCanvas).toBe("function");
    expect(typeof downloadShareCard).toBe("function");
    expect(typeof shareToSocial).toBe("function");
  });
});

