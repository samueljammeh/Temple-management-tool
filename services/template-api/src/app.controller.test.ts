import { describe, expect, it } from 'vitest';

import { AppController } from './app.controller';

describe('AppController', () => {
  it('returns hello payload', () => {
    const controller = new AppController();
    expect(controller.getHello()).toEqual({ status: 'ok', service: 'template-api' });
  });
});
