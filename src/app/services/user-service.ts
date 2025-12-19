import { HttpClient } from '@angular/common/http';
import { inject, Injectable, RendererFactory2, signal } from '@angular/core';
import { Router } from '@angular/router';
import { User } from '@models/user';
import { GOOGLE_SIGNIN_SCRIPT_URL } from '@utils/constants';
import { loadScriptWithRetries } from '@utils/helpers';
import { iif, of } from 'rxjs';
declare var google: any;

@Injectable({
  providedIn: 'root',
})
export class UserService {
  router = inject(Router);
  http = inject(HttpClient);
  renderer = inject(RendererFactory2).createRenderer(document.body, null);
  private userSignal = signal<User | null>(null);
  readonly user = this.userSignal.asReadonly();

  setUser(user: User | null) {
    this.userSignal.set(user);
  }

  getUserProfile(userId?: string | null) {
    return iif(() => !!userId, this.http.get<User>(`/api/User/Profile/${userId}`), of(null));
  }

  logout() {
    this.userSignal.set(null);
    localStorage.removeItem('courssat-user-token');
    localStorage.removeItem('courssat-user-id');
    if (typeof google === 'undefined') {
      loadScriptWithRetries(
        GOOGLE_SIGNIN_SCRIPT_URL,
        this.renderer,
        (error) => {
          if (!error) {
            google?.accounts?.id.disableAutoSelect();
          }
        },
        true
      );
    } else {
      google.accounts.id.disableAutoSelect();
    }
    if (['/profile', '/cart', '/checkout'].some((url) => this.router.url.startsWith(url))) {
      this.router.navigateByUrl('/', { replaceUrl: true });
    }
  }
}
