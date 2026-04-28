import { describe, it, expect } from 'vitest';
import { remoteRoutes } from './entry.routes';
import { RemoteEntry } from './entry';

describe('remote6 remoteRoutes', () => {
  it('should expose a single root route', () => {
    expect(remoteRoutes).toHaveLength(1);
    expect(remoteRoutes[0].path).toBe('');
  });

  it('should render RemoteEntry at the root', () => {
    expect(remoteRoutes[0].component).toBe(RemoteEntry);
  });
});
