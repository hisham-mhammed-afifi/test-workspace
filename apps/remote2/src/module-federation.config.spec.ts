import { describe, it, expect } from 'vitest';
import config from '../module-federation.config';

describe('remote2 module-federation.config', () => {
  it('should declare remote2 as the federation name', () => {
    expect(config.name).toBe('remote2');
  });

  it('should expose ./Routes pointing to entry.routes', () => {
    expect(config.exposes).toEqual({
      './Routes': 'apps/remote2/src/app/remote-entry/entry.routes.ts',
    });
  });
});
