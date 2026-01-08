import { describe, expect, it } from 'vitest';

import { ExampleTemplate, TemplateSchema } from './index';

describe('TemplateSchema', () => {
  it('validates the example template', () => {
    const result = TemplateSchema.safeParse(ExampleTemplate);
    expect(result.success).toBe(true);
  });
});
