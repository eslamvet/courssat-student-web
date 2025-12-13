import { AfterViewInit, Directive, inject, NgZone } from '@angular/core';
declare var fawaterkCheckout: any;

@Directive({
  selector: '[appFawaterk]',
})
export class Fawaterk implements AfterViewInit {
  ngZone = inject(NgZone);
  ngAfterViewInit(): void {
    this.ngZone.runOutsideAngular(() => {
      fawaterkCheckout(window.pluginConfig);
    });
    const fawaterkStyle = document.querySelector('link[href*="fawaterkPlugin.min.css"]');
    const fawaterkHorStyle = document.querySelector('link[href*="fawaterkPluginHor"]');
    const overrideFawaterkStyle = document.querySelector('link[href*="fawaterk.css"]');
    if (overrideFawaterkStyle) {
      fawaterkStyle?.remove();
      fawaterkHorStyle?.remove();
    } else {
      fawaterkStyle?.setAttribute('href', 'fawaterk.css');
    }
  }
}
