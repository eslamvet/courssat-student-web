import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-auth',
  imports: [RouterOutlet],
  template:
    '<div class="container flex justify-center items-center pt-6 pb-10 lg:py-16"><router-outlet></router-outlet></div>',
})
export class Auth {}
