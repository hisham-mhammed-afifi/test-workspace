import { describe, it, expect } from 'vitest';
import config from '../module-federation.config';

describe('remote3 module-federation.config', () => {
  it('should declare remote3 as the federation name', () => {
    expect(config.name).toBe('remote3');
  });

  it('should expose ./Routes pointing to entry.routes', () => {
    expect(config.exposes).toEqual({
      './Routes': 'apps/remote3/src/app/remote-entry/entry.routes.ts',
    });
  });
});
