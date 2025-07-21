import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class AuthService {
  getToken(): string | null {
    const token = localStorage.getItem('auth_token');
    console.log('✅ AuthService token:', token);
    return token;
  }

  isLoggedIn(): boolean {
    return !!this.getToken();
  }

  logout() {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('auth_user');
  }
}


