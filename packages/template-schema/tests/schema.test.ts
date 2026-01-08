import { describe, expect, it } from "vitest";
import { TemplateSchema } from "../src/schema";
import { exampleTemplate } from "../src/example";

describe("TemplateSchema", () => {
  it("validates the example template", () => {
    const result = TemplateSchema.safeParse(exampleTemplate);
    expect(result.success).toBe(true);
  });

  it("rejects templates missing tenantId", () => {
    const invalid = { ...exampleTemplate, tenantId: "" };
    const result = TemplateSchema.safeParse(invalid);
    expect(result.success).toBe(false);
  });
});
