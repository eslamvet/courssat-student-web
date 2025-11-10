import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  inject,
  NgZone,
  signal,
} from '@angular/core';

@Component({
  selector: 'app-hero-section',
  imports: [],
  templateUrl: './hero-section.html',
  styleUrl: './hero-section.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HeroSection implements AfterViewInit {
  ngZone = inject(NgZone);
  gridCols = signal(
    Array.from({ length: 8 }, () => Array.from({ length: 5 }, () => `/images/instructor-11.jpg`))
  );
  ngAfterViewInit(): void {
    this.ngZone.runOutsideAngular(() => {
      const galleryImages = document.querySelectorAll('.gallery__grid__col');
      const galleryContainer = document.getElementById('gallery__grid') as HTMLDivElement;
      let num = 0;
      let inverted = false;
      const animate = () => {
        if (num && num == galleryContainer.scrollHeight - galleryContainer.clientHeight)
          inverted = true;
        else if (num == 0 && inverted) inverted = false;
        galleryImages.forEach((img) => {
          img.setAttribute('style', `transform:translateY(-${num}px)`);
        });
        !inverted ? num++ : num--;
        window.requestAnimationFrame(animate);
      };
      window.requestAnimationFrame(animate);
    });
  }
}
