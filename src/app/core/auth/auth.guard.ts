import { inject } from '@angular/core';
import { CanActivateChildFn, CanActivateFn, Router } from '@angular/router';

import { AuthService } from './auth.service';

export const authGuard: CanActivateFn = (_route, state) => {
  return requireAuthenticatedSession(state.url);
};

export const authChildGuard: CanActivateChildFn = (_route, state) => {
  return requireAuthenticatedSession(state.url);
};

function requireAuthenticatedSession(returnUrl: string): true | ReturnType<Router['createUrlTree']> {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.isAuthenticated()) {
    return true;
  }

  return router.createUrlTree(['/login'], {
    queryParams: {
      returnUrl,
    },
  });
}
