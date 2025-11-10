import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
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
  isLoggedIn;
  currentTheme;
  constructor(private userService: UserService, private themeService: ThemeService) {
    this.isLoggedIn = this.userService.isLoggedIn;
    this.currentTheme = this.themeService.currentTheme;
  }

  logoutHandler() {
    this.userService.logout();
  }

  toggleThemeHandler() {
    this.themeService.toggleTheme();
  }
}
