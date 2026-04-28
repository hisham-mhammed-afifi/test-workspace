import { describe, it, expect } from 'vitest';
import config from '../module-federation.config';

describe('remote6 module-federation.config', () => {
  it('should declare remote6 as the federation name', () => {
    expect(config.name).toBe('remote6');
  });

  it('should expose ./Routes pointing to entry.routes', () => {
    expect(config.exposes).toEqual({
      './Routes': 'apps/remote6/src/app/remote-entry/entry.routes.ts',
    });
  });
});
