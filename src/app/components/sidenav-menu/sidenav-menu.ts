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
    class: 'w-full',
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
