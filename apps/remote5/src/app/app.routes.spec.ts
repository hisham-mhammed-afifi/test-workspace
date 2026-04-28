import { describe, it, expect } from 'vitest';
import { appRoutes } from './app.routes';

describe('remote5 appRoutes', () => {
  it('should expose a single lazy-loaded root route', () => {
    expect(appRoutes).toHaveLength(1);
    expect(appRoutes[0].path).toBe('');
    expect(appRoutes[0].loadChildren).toBeTypeOf('function');
  });

  it('should resolve loadChildren to remoteRoutes', async () => {
    const loaded = await (appRoutes[0].loadChildren as () => Promise<unknown>)();
    expect(loaded).toBeDefined();
    expect(Array.isArray(loaded)).toBe(true);
  });
});
