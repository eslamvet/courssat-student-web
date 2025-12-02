import { inject, Injectable } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { RouterStateSnapshot, TitleStrategy } from '@angular/router';

@Injectable({
  providedIn: 'root',
})
export class CourssatTitleStrategy extends TitleStrategy {
  title = inject(Title);
  override updateTitle(snapshot: RouterStateSnapshot): void {
    const dynamicTitle = history.state['title'];
    if (dynamicTitle) {
      this.title.setTitle(`Courssat | ${dynamicTitle}`);
      return;
    }
    const title = this.buildTitle(snapshot);
    if (title) {
      this.title.setTitle(`Courssat | ${title}`);
    }
  }
}
