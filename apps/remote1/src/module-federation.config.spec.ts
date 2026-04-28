import { describe, it, expect } from 'vitest';
import config from '../module-federation.config';

describe('remote1 module-federation.config', () => {
  it('should declare remote1 as the federation name', () => {
    expect(config.name).toBe('remote1');
  });

  it('should expose ./Routes pointing to entry.routes', () => {
    expect(config.exposes).toEqual({
      './Routes': 'apps/remote1/src/app/remote-entry/entry.routes.ts',
    });
  });
});
