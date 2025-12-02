import { Pipe, PipeTransform } from '@angular/core';
import { environment } from 'src/environments/environment';

@Pipe({
  name: 'imgUrl',
})
export class ImgUrlPipe implements PipeTransform {
  transform(src: string, type: 'course' | 'avatar' | 'package' = 'course'): string {
    return `${environment.baseUrl}/api/FileManage/Image/${
      type === 'course' ? '1' : type === 'package' ? '2' : '3'
    }/true/${src}`;
  }
}
