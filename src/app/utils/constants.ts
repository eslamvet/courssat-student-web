import { environment } from 'src/environments/environment';

export const categories = [
  { id: 20, name: 'التصميم', imageUrl: '/images/design.svg', path: '/category/design' },
  {
    id: 21,
    name: 'العلوم والتكنولوجيا',
    imageUrl: '/images/science.svg',
    path: '/category/coding-programming',
  },
  { id: 19, name: 'التسويق', imageUrl: '/images/marketing.svg', path: '/category/marketing' },
  { id: 24, name: 'إدارة أعمال', imageUrl: '/images/business.svg', path: '/category/business' },
  { id: 22, name: 'سينما', imageUrl: '/images/cinema.svg', path: '/category/cinema' },
  {
    id: 23,
    name: 'اللغات',
    imageUrl: '/images/language.svg',
    path: '/category/translator-language',
  },
];

export const FAWATEERK_SCRIPT_URL = 'https://app.fawaterk.com/fawaterkPlugin/fawaterkPlugin.min.js';
export const TABBY_SCRIPT_URL = 'https://tap-sdks.b-cdn.net/card/1.0.2/index.js';
