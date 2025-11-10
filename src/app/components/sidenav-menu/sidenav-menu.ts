import { AfterViewInit, Component, DestroyRef, DOCUMENT, Host, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
import { UserService } from '@services/user-service';
import { filter, fromEvent } from 'rxjs';

@Component({
  selector: 'app-sidenav-menu',
  imports: [RouterLink],
  host: {
    class: 'w-full',
  },
  templateUrl: './sidenav-menu.html',
  styleUrl: './sidenav-menu.css',
})
export class SidenavMenu implements AfterViewInit {
  isLoggedIn;
  document = inject(DOCUMENT);
  destroyRef = inject(DestroyRef);
  constructor(private userService: UserService) {
    this.isLoggedIn = this.userService.isLoggedIn;
  }

  ngAfterViewInit(): void {
    fromEvent(this.document.getElementById('sidenav-menu')!, 'click')
      .pipe(
        filter((ev) => !!(ev.target as HTMLElement).getAttribute('routerlink')),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe(() => {
        this.document.getElementById('main-drawer')?.click();
      });
  }

  logoutHandler() {
    this.userService.logout();
  }
}
