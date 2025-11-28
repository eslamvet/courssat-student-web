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
  private userSignal = signal<Partial<User> | null>({
    id: '18f17fac-5a3f-473b-b00a-a9aacef27426',
  });
  readonly user = this.userSignal.asReadonly();

  setUser(user: User | null) {
    this.userSignal.set(user);
  }

  getUser() {
    return this.userSignal();
  }

  getUserProfile(userId?: string) {
    return iif(() => !!userId, this.http.get<User>(`/api/User/Profile/${userId}`), of(null));
  }

  logout() {
    this.userSignal.set(null);
    localStorage.removeItem('auth_token');
    if (['/profile', '/cart', '/checkout'].some((url) => this.router.url.startsWith(url))) {
      this.router.navigateByUrl('/', { replaceUrl: true });
    }
  }
}
