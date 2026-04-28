import { describe, it, expect } from 'vitest';
import config from '../module-federation.config';

describe('host3 module-federation.config', () => {
  it('should declare host3 as the federation name', () => {
    expect(config.name).toBe('host3');
  });

  it('should consume all 6 remotes', () => {
    expect(config.remotes).toEqual([
      'remote1',
      'remote2',
      'remote3',
      'remote4',
      'remote5',
      'remote6',
    ]);
  });
});
