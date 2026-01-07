import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  DOCUMENT,
  Host,
  inject,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
import { UserService } from '@services/user-service';
import { filter, fromEvent } from 'rxjs';

@Component({
  selector: 'app-sidenav-menu',
  imports: [RouterLink],
  host: {
    class:
      'w-full h-full bg-[linear-gradient(255.26deg,rgba(248,177,0,0.07)_-99.48%,rgba(10,62,110,0.07)_105.75%)]',
  },
  templateUrl: './sidenav-menu.html',
  styleUrl: './sidenav-menu.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SidenavMenu implements AfterViewInit {
  userService = inject(UserService);
  document = inject(DOCUMENT);
  destroyRef = inject(DestroyRef);
  user = this.userService.user;

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
