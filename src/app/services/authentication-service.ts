import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { User } from '@models/user';
import { iif, of, switchMap } from 'rxjs';

@Injectable()
export class AuthenticationService {
  http = inject(HttpClient);

  login(data: { email: string; password: string }) {
    return this.http.post<{ token: string; user: User; code: number; message_AR?: string }>(
      '/api/User/Login',
      data
    );
  }

  socialLogin(model: {
    UserId: string;
    Provider: string;
    FirstName: string;
    LastName: string;
    EmailAddress: string;
    PictureUrl: string;
    OauthToken: string;
    IsStudent: boolean;
  }) {
    return this.http
      .post<{ token: string; user: User; code: number; message_AR?: string }>(
        '/api/User/ExternalLogin',
        model
      )
      .pipe(
        switchMap((res) =>
          iif(
            () => !!res.token,
            of(res),
            this.http.post<{ token: string; user: User; code: number; message_AR?: string }>(
              '/api/User/ExternalLogin',
              model
            )
          )
        )
      );
  }

  registerUser(data: User) {
    return this.http.post<{ token: string; user: User; code: number; message_AR?: string }>(
      '/api/User',
      data
    );
  }
}
