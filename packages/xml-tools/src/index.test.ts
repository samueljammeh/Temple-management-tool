import { describe, expect, it } from 'vitest';

import { getValue, parseXml } from './index';

describe('xml-tools', () => {
  it('parses and reads a value by path', () => {
    const xml = '<Case><Debts><Debt><Amount>120.5</Amount></Debt></Debts></Case>';
    const parsed = parseXml(xml);
    const value = getValue(parsed, '/Case/Debts/Debt/Amount');
    expect(value).toBe('120.5');
  });
});
