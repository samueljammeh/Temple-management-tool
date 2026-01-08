import { describe, expect, it } from "vitest";
import { compileTemplateToFo } from "../src";
import { exampleTemplate } from "@orbyt/template-schema";

const xml = `<Case><Account><Name>Orbyt</Name></Account></Case>`;

describe("compileTemplateToFo", () => {
  it("creates deterministic FO output", () => {
    const fo = compileTemplateToFo(exampleTemplate, xml);
    expect(fo).toContain("<fo:root");
    expect(fo).toContain("A4");
  });
});
