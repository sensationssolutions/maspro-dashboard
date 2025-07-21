import { CanActivateFn } from '@angular/router';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth';
import { environment } from '../environments/environment';

export const authGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const token = auth.getToken();
  if (token) {
    return true;
  } else {
    window.location.href = `${environment.frontendUrl}/login`;
    return false;
  }
};
