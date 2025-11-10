export type Coupon = {
  coboneType: 0 | 1 | 2 | 3;
  daysNo: number;
  id: number;
  status: number;
  value: number;
  userId: string;
  coboneCode: string;
  courseId: number | null;
};

export const COUPONTYPE = {
  FREE: 'FREE',
  PERCENTAGE: 'PERCENTAGE',
  AMOUNT: 'AMOUNT',
  PAYASYOUWANT: 'PAYASYOUWANT',
};
