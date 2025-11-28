import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { CartService } from '@services/cart-service';
import { ThemeService } from '@services/theme-service';
import { UserService } from '@services/user-service';

@Component({
  selector: 'app-header',
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './header.html',
  styleUrl: './header.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Header {
  userService = inject(UserService);
  cart = inject(CartService).cart;
  themeService = inject(ThemeService);
  currentTheme = this.themeService.currentTheme;
  user = this.userService.user;

  logoutHandler() {
    this.userService.logout();
  }

  toggleThemeHandler() {
    this.themeService.toggleTheme();
  }
}
