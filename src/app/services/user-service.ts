import { HttpClient } from '@angular/common/http';
import { computed, inject, Injectable, signal } from '@angular/core';
import { Router } from '@angular/router';
import { User } from '@models/user';
import { iif, of, tap } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  router = inject(Router);
  http = inject(HttpClient);
  private user = signal<Partial<User> | null>({
    id: '1',
  });
  readonly isLoggedIn = computed(() => !!this.user());

  setUser(user: User | null) {
    this.user.set(user);
  }

  getUser() {
    return this.user();
  }

  getUserProfile(userId?: string) {
    return iif(() => !!userId, this.http.get<User>(`/api/User/Profile/${userId}`), of(null));
  }

  logout() {
    this.user.set(null);
    localStorage.removeItem('auth_token');
    if (['/profile', '/cart', '/checkout'].some((url) => this.router.url.startsWith(url))) {
      this.router.navigateByUrl('/', { replaceUrl: true });
    }
  }
}
