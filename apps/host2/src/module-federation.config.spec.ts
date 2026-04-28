import { describe, it, expect } from 'vitest';
import config from '../module-federation.config';

describe('host2 module-federation.config', () => {
  it('should declare host2 as the federation name', () => {
    expect(config.name).toBe('host2');
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
