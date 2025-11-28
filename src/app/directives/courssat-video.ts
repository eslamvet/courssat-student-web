import { Directive, effect, ElementRef, input, NgZone, output, Renderer2 } from '@angular/core';
declare var Vimeo: any;
declare var playerjs: any;

@Directive({
  selector: '[appCourssatVideo]',
  standalone: true,
})
export class CourssatVideoDirective {
  videoSrc = input.required<string>({ alias: 'data-src' });
  vimeoPlayer!: any;
  bunnyPlayer!: any;
  videoEnd = output();
  constructor(
    private EleRef: ElementRef<HTMLIFrameElement>,
    private renderer: Renderer2,
    private ngZone: NgZone
  ) {
    effect(() => {
      if (!['youtu', 'iframe.mediadelivery.net'].some((el) => this.videoSrc()?.includes(el))) {
        if (this.vimeoPlayer) {
          this.vimeoPlayer.off('ended');
          new Promise<any>((resolve) => {
            let timer = setTimeout(() => {
              resolve(timer);
            }, 1000);
          }).then((timer) => {
            clearTimeout(timer);
            this.vimeoPlayer.on('ended', () => this.videoEnd.emit());
          });
        } else {
          if (typeof Vimeo === 'undefined') {
            const vimeoPlayerScript = this.renderer.createElement('script');
            this.renderer.setAttribute(vimeoPlayerScript, 'src', 'vimeo-player.js');
            this.renderer.setAttribute(vimeoPlayerScript, 'defer', 'true');
            this.renderer.listen(vimeoPlayerScript, 'load', this.loadVimeoPlayer.bind(this, false));
            this.renderer.appendChild(document.body, vimeoPlayerScript);
          } else {
            this.loadVimeoPlayer();
          }
        }
      } else if (this.videoSrc()?.includes('iframe.mediadelivery.net')) {
        if (this.bunnyPlayer) {
          this.bunnyPlayer.off('ended');
          new Promise<any>((resolve) => {
            let timeout = setTimeout(() => {
              resolve(timeout);
            }, 2000);
          }).then((timeout) => {
            clearTimeout(timeout);
            this.bunnyPlayer.on('ended', () => this.videoEnd.emit());
          });
        } else {
          if (typeof playerjs == 'undefined') {
            const bunnyPlayerScript = renderer.createElement('script');
            renderer.setAttribute(bunnyPlayerScript, 'src', 'bunny-player.js');
            renderer.setAttribute(bunnyPlayerScript, 'defer', 'true');
            renderer.listen(bunnyPlayerScript, 'load', this.loadBunnyPlayer.bind(this, false));
            renderer.appendChild(document.body, bunnyPlayerScript);
          } else {
            this.loadBunnyPlayer();
          }
        }
      }
    });
  }

  loadBunnyPlayer(autoplay = false) {
    if (this.videoSrc() && typeof playerjs != 'undefined') {
      this.ngZone.runOutsideAngular(() => {
        const bunnyPlayer = new playerjs.Player(this.EleRef.nativeElement);
        bunnyPlayer.on('ready', () => {
          bunnyPlayer.on('ended', () => this.videoEnd.emit());
          autoplay && bunnyPlayer.play();
        });
        this.ngZone.run(() => {
          this.bunnyPlayer = bunnyPlayer;
        });
      });
    }
  }

  loadVimeoPlayer(autoplay = false) {
    if (this.videoSrc() && typeof Vimeo !== 'undefined') {
      this.ngZone.runOutsideAngular(() => {
        const vimeoPlayer = new Vimeo.Player(this.EleRef.nativeElement);
        autoplay && vimeoPlayer.play().catch(console.log);
        vimeoPlayer.on('ended', () => this.videoEnd.emit());
        this.ngZone.run(() => {
          this.vimeoPlayer = vimeoPlayer;
        });
      });
    }
  }
}
