import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { App } from './app/app';

const hash = window.location.hash;

if (hash && hash.startsWith('#/')) {
  const newUrl = hash.substring(1);
  history.replaceState(null, '', newUrl);
}

bootstrapApplication(App, appConfig).catch((err) => console.error(err));
