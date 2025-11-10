import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Package, PackageJson } from '@models/package';

@Injectable()
export class PackageService {
  http = inject(HttpClient);
  getLatestPackages(count: any) {
    return this.http.get<Package[]>(`/api/Packages/Latest/${count}`);
  }
  getCoursePackageJson() {
    return this.http.get<PackageJson>('/json/course-package.json', {
      params: { d: Date.now() },
    });
  }
}
