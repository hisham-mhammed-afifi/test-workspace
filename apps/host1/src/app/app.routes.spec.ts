import { describe, it, expect } from 'vitest';
import { appRoutes } from './app.routes';
import { Placeholder } from './placeholder';

describe('host1 appRoutes', () => {
  it('should expose 7 routes (6 remotes + root)', () => {
    expect(appRoutes).toHaveLength(7);
  });

  it('should lazy-load each of the 6 remotes', () => {
    const remotePaths = appRoutes
      .map((r) => r.path)
      .filter((p): p is string => !!p && p.startsWith('remote'));
    expect(remotePaths.sort()).toEqual([
      'remote1',
      'remote2',
      'remote3',
      'remote4',
      'remote5',
      'remote6',
    ]);
    appRoutes
      .filter((r) => r.path?.startsWith('remote'))
      .forEach((r) => expect(r.loadChildren).toBeTypeOf('function'));
  });

  it('should render Placeholder at the empty path', () => {
    const root = appRoutes.find((r) => r.path === '');
    expect(root?.component).toBe(Placeholder);
  });
});
