import { Routes } from '@angular/router';

import { authChildGuard, authGuard } from './core/auth/auth.guard';

export const routes: Routes = [
  {
    path: 'login',
    loadComponent: () => import('./pages/login/login.page').then((m) => m.LoginPage),
  },
  {
    path: '',
    canActivate: [authGuard],
    canActivateChild: [authChildGuard],
    loadComponent: () => import('./layout/main-layout/main-layout').then((m) => m.MainLayout),
    children: [
      {
        path: '',
        pathMatch: 'full',
        redirectTo: 'overview',
      },
      {
        path: 'overview',
        loadComponent: () =>
          import('./pages/placeholder/placeholder.page').then((m) => m.PlaceholderPage),
        data: {
          eyebrow: 'Command center',
          title: 'Overview',
          description: 'Resumen ejecutivo de rendimiento, senales y pipeline de oportunidades.',
          badge: 'Shell ready',
        },
      },
      {
        path: 'discovery',
        loadComponent: () =>
          import('./pages/discovery/discovery.page').then((m) => m.DiscoveryPage),
      },
      {
        path: 'lead-inspector',
        loadComponent: () =>
          import('./pages/placeholder/placeholder.page').then((m) => m.PlaceholderPage),
        data: {
          eyebrow: 'Signal detail',
          title: 'Lead Inspector',
          description: 'Base preparada para inspeccionar leads cuando entre la logica de negocio.',
          badge: 'Placeholder',
        },
      },
      {
        path: 'lead-inspector/:id',
        loadComponent: () =>
          import('./pages/lead-inspector/lead-inspector.page').then((m) => m.LeadInspectorPage),
      },
      {
        path: 'campaigns',
        loadComponent: () =>
          import('./pages/placeholder/placeholder.page').then((m) => m.PlaceholderPage),
        data: {
          eyebrow: 'Activation',
          title: 'Campaigns',
          description: 'Vista inicial para coordinar campanas y experimentos comerciales.',
          badge: 'Placeholder',
        },
      },
      {
        path: 'models',
        loadComponent: () =>
          import('./pages/placeholder/placeholder.page').then((m) => m.PlaceholderPage),
        data: {
          eyebrow: 'AI layer',
          title: 'Models',
          description: 'Zona futura para modelos, scoring y configuracion de inteligencia.',
          badge: 'Placeholder',
        },
      },
      {
        path: 'ops',
        loadComponent: () =>
          import('./pages/ops/ops.page').then((m) => m.OpsPage),
      },
    ],
  },
  {
    path: '**',
    redirectTo: 'overview',
  },
];
