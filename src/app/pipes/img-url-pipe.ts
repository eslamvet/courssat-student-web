import { Pipe, PipeTransform } from '@angular/core';
import { environment } from 'src/environments/environment';

@Pipe({
  name: 'imgUrl',
})
export class ImgUrlPipe implements PipeTransform {
  transform(src: string, isPackageImage = false): string {
    return `${environment.baseUrl}/api/FileManage/Image/${isPackageImage ? '2' : '1'}/true/${src}`;
  }
}
