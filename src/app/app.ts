import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Header } from '@components/header/header';
import { Footer } from '@components/footer/footer';
import { SidenavMenu } from '@components/sidenav-menu/sidenav-menu';
import { Toaster } from '@components/toaster/toaster';
import { Loader } from '@components/loader/loader';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, Header, Footer, SidenavMenu, Toaster, Loader],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {}
