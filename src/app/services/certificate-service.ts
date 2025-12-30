import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { ListApi } from '@models/Api';
import { CourseCertificate } from '@models/certificate';

@Injectable()
export class CertificateService {
  http = inject(HttpClient);

  getUserCertificates(userId: string, pageNo: number) {
    return this.http.get<ListApi<CourseCertificate>>(`/api/Certificate/${pageNo}/${userId}`);
  }

  createCourseCertificate(data: CourseCertificate) {
    return this.http.post('/api/Certificate', data);
  }
}
