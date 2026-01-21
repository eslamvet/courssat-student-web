import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'paginator',
})
export class PaginatorPipe implements PipeTransform {
  transform(
    totalRecords: number,
    rows: number,
    currentPage: number,
    pageLinkSize: number = 5
  ): (number | string)[] {
    if (!totalRecords || !rows) return [];

    const totalPages = Math.ceil(totalRecords / rows);
    const pages: (number | string)[] = [];

    const visiblePages = Math.min(pageLinkSize, totalPages);
    const half = Math.floor(visiblePages / 2);

    const current = currentPage + 1;

    let start = current - half;
    let end = current + half;

    if (start < 1) {
      start = 1;
      end = visiblePages;
    }

    if (end > totalPages) {
      end = totalPages;
      start = totalPages - visiblePages + 1;
      if (start < 1) start = 1;
    }

    if (start > 1) {
      pages.push(1);
      if (start > 2) {
        pages.push('...');
      }
    }

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }

    if (end < totalPages) {
      if (end < totalPages - 1) {
        pages.push('...');
      }
      pages.push(totalPages);
    }

    return pages;
  }
}
