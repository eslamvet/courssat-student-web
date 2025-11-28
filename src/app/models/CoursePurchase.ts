import { Coupon } from './coupon';

export type CoursePurchase = {
  id: number;
  userId: string;
  userName: string;
  userEmail: string;
  totalOriginalValue: number;
  totalValue: number;
  cobonId?: number;
  paymentDetailVMs: CoursePurchaseItem[] | string;
};

export type CoursePurchaseItem = {
  id: number;
  paymentId: number;
  courseName: string;
  courseId: number | null;
  packagesId: number | null;
  originalValue: number;
  totalValue: number;
  cobonId?: number;
  coupon?: Coupon;
  instructorId: string;
  courseNames?: string[];
  courseIds?: number[];
};
