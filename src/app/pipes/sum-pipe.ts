import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'sum',
  standalone: true,
})
export class SumPipe<T> implements PipeTransform {
  transform(arr: T[], field: keyof T): number {
    return arr.reduce((acc, el) => acc + (el[field] as number), 0);
  }
}
