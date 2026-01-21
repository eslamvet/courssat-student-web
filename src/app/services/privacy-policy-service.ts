import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';

export type PrivacyData = {
  title: string;
  type: 'list' | 'numeric_list';
  description: string;
  details?: string[];
};

@Injectable()
export class PrivacyPolicyService {
  http = inject(HttpClient);

  getTerms() {
    return this.http.get<PrivacyData[]>('json/terms.json', {
      params: { d: Date.now() },
    });
  }

  getPrivacyPolicy() {
    return this.http.get<PrivacyData[]>('json/privacy.json', {
      params: { d: Date.now() },
    });
  }
}
