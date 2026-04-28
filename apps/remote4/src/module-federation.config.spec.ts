import { describe, it, expect } from 'vitest';
import config from '../module-federation.config';

describe('remote4 module-federation.config', () => {
  it('should declare remote4 as the federation name', () => {
    expect(config.name).toBe('remote4');
  });

  it('should expose ./Routes pointing to entry.routes', () => {
    expect(config.exposes).toEqual({
      './Routes': 'apps/remote4/src/app/remote-entry/entry.routes.ts',
    });
  });
});
