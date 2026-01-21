import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Course } from '@models/course';
import { Package, PackageJson } from '@models/package';

@Injectable()
export class PackageService {
  http = inject(HttpClient);
  getLatestPackages(count: any) {
    return this.http.get<Package[]>(`/api/Packages/Latest/${count}`);
  }
  getCoursePackageJson() {
    return this.http.get<PackageJson>('json/course-package.json', {
      params: { d: Date.now() },
    });
  }
  getPackageDetails(packageId: number, userId?: string) {
    return this.http.get<{ pacakge: Package; courses: Course[] }>(
      `/api/Packages/Courses/${packageId}/${userId}`
    );
  }
}
