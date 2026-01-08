import { describe, expect, it } from "vitest";
import { getValue, listPaths, parseXml } from "../src";

describe("xml-tools", () => {
  const xml = `<Case><Account><Name>Orbyt</Name></Account></Case>`;
  const parsed = parseXml(xml);

  it("reads values by absolute path", () => {
    expect(getValue(parsed, "/Case/Account/Name")).toBe("Orbyt");
  });

  it("lists paths", () => {
    const paths = listPaths(parsed);
    expect(paths).toContain("/Case/Account/Name");
  });
});
