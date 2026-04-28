import { describe, it, expect } from 'vitest';
import config from '../module-federation.config';

describe('remote5 module-federation.config', () => {
  it('should declare remote5 as the federation name', () => {
    expect(config.name).toBe('remote5');
  });

  it('should expose ./Routes pointing to entry.routes', () => {
    expect(config.exposes).toEqual({
      './Routes': 'apps/remote5/src/app/remote-entry/entry.routes.ts',
    });
  });
});
