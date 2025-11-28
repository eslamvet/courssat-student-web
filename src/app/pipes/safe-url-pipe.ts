import { inject, Pipe, PipeTransform } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

@Pipe({
  name: 'safeUrl',
  standalone: true,
})
export class SafeUrlPipe implements PipeTransform {
  sanitizer = inject(DomSanitizer);
  transform(videoUrl?: string, autoplay?: boolean): SafeResourceUrl {
    if (videoUrl) {
      if (videoUrl?.includes('mediadelivery')) {
        videoUrl =
          videoUrl.replace('play', 'embed') +
          (autoplay ? '?autoplay=true&enableApi=true' : '?api=true&playerId=bunny123');
      } else if (videoUrl?.includes('youtube')) {
        videoUrl =
          'https://www.youtube.com/embed/' +
          videoUrl.split('?v=')[1].split('&')[0] +
          (autoplay ? '?autoplay=true' : '');
      } else {
        videoUrl =
          'https://player.vimeo.com/video/' +
          videoUrl?.replace('https://vimeo.com/', '') +
          (autoplay ? '?autoplay=1&portrait=false' : '');
      }
    }
    return this.sanitizer.bypassSecurityTrustResourceUrl(videoUrl ?? '');
  }
}
