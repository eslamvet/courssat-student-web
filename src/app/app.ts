import { Component, inject } from '@angular/core';
import { NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { Header } from '@components/header/header';
import { Footer } from '@components/footer/footer';
import { SidenavMenu } from '@components/sidenav-menu/sidenav-menu';
import { filter, map } from 'rxjs';
import { AsyncPipe } from '@angular/common';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, Header, Footer, SidenavMenu, AsyncPipe],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {
  isHomeUrl$ = inject(Router).events.pipe(
    filter((ev) => ev instanceof NavigationEnd),
    map((ev) => ev.urlAfterRedirects == '/')
  );
}
