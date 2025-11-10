export type Review = {
  person__name: string;
  course__title: string;
  review: string;
  gender: 'male' | 'female';
};
