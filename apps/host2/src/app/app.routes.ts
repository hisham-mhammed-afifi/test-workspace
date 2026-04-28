import { Placeholder } from './placeholder';
import { Route } from '@angular/router';

export const appRoutes: Route[] = [
  {
    path: 'remote6',
    loadChildren: () => import('remote6/Routes').then((m) => m!.remoteRoutes),
  },
  {
    path: 'remote5',
    loadChildren: () => import('remote5/Routes').then((m) => m!.remoteRoutes),
  },
  {
    path: 'remote4',
    loadChildren: () => import('remote4/Routes').then((m) => m!.remoteRoutes),
  },
  {
    path: 'remote3',
    loadChildren: () => import('remote3/Routes').then((m) => m!.remoteRoutes),
  },
  {
    path: 'remote2',
    loadChildren: () => import('remote2/Routes').then((m) => m!.remoteRoutes),
  },
  {
    path: 'remote1',
    loadChildren: () => import('remote1/Routes').then((m) => m!.remoteRoutes),
  },
  {
    path: '',
    component: Placeholder,
  },
];
