import { describe, expect, it } from 'vitest';

import { ExampleTemplate } from '@orbyt/template-schema';

import { compileToFo } from './index';

describe('fo-compiler', () => {
  it('creates FO output', () => {
    const fo = compileToFo(ExampleTemplate);
    expect(fo).toContain('<fo:root');
  });
});
