import { Coupon } from './coupon';

export type CoursePurchase = {
  id: number;
  userId: string;
  userName: string;
  userEmail: string;
  totalOriginalValue: number;
  totalValue: number;
  cobonId?: number;
  paymentDetailVMs: CoursePurchaseItem[];
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

export const PAYMENTMETHOD = {
  PAYPAL: 'PAYPAL',
  STRIPE: 'STRIPE',
  FREE: 'FREE',
  TAP: 'TAP',
  FAWATEERK: 'FAWATEERK',
} as const;

export const PRODUCTTYPE = {
  COURSE: 'COURSE',
} as const;

export type ConfirmCourseOrder = {
  student_name: string;
  student_email: string;
  total_price: number;
  courses_names: string[];
  courses_ids: number[];
  instructor_id: string;
  package?: string;
  coupon?: {
    code: string;
    type: string;
    discount?: string | number;
    userId?: string;
  };
};
