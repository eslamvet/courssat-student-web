import { ListApi } from './Api';
import { Coupon } from './coupon';

export type Course = {
  id: number;
  courseName_AR: string;
  videoPromoURL: string;
  departmentName: string;
  departmentsId: number;
  courseDescription_AR: string;
  updateDate: Date;
  firstName: string;
  familyName: string;
  languageName: string;
  branchName: string;
  originalPrice: number;
  discountPrice: number;
  price: number;
  hourCount: number;
  coverImageURL: string;
  courseLevel: number;
  studentsCount: number;
  lessonCount: number;
  likeCount: number;
  disLikeCount: number;
  viewsCount: number;
  coupon?: Coupon;
  instructorBuyDegree: string;
  isPaied: boolean;
  topics: CourseTopic[];
  courseDataVMs: courseDataVM[];
  reviews?: CourseReview[];
  updateUserCourses?: boolean;
  packageId?: number | null;
  userId: string;
  refresh?: boolean;
  showCoupon?: boolean;
  paymentLabel?: string;
  instructorBrief?: string;
  redirect_url?: string;
  openKeys: CourseKeyword[];
  currentPurchasedCourseId?: number;
  attachments?: { title: string; data: CourseAttachment[] }[];
  relatedCourses?: Course[];
  priceBeforeCoupon: number;
  courseNames?: string[];
  courseIds?: string[];
  packageName?: string;
};

export type CourseTopic = {
  id: number;
  topicName_AR: string;
  isActive?: boolean;
  isWatched?: boolean;
  fileList?: CourseAttachment[];
  lessonList: CourseLesson[];
};

export type CourseKeyword = {
  id: number;
  name: string;
};

export type CourseLesson = {
  id: number;
  name_AR: string;
  videoUrl: string;
  fileUrl?: string;
  fileExternalUrl?: string;
  fileName?: string;
  fileUrlName?: string;
  lessonType?: number;
  isActive?: boolean;
  isDisabled?: boolean;
  isWatched?: boolean;
  isFullScreen?: boolean;
  autoplay?: boolean;
  courseId?: number;
  lIndex?: number;
  tIndex?: number;
  public?: boolean;
};

export type courseDataVM = {
  id: number;
  question: string;
  answers: courseDataVMAnswer[];
};

export type courseDataVMAnswer = {
  id: number;
  answer: string;
};

export type CourseReview = {
  id: number;
  isLike: boolean;
  evaluationComment: string;
  firstName: string;
  familyName: string;
  imageURL: string;
  date: string | number;
  userId?: string;
  courseId: number;
};

export type CourseAttachment = {
  lessonName: string;
  attachmentName?: string;
  attachmentsExternalLink?: string;
  attachmentLink?: string;
  attachmentFileName?: string;
  id: number;
};

export type CustomCourseData = {
  id: number;
  hourCount?: number;
  lessonCount?: number;
  studentsCount?: number;
  likeCount?: number;
  disLikeCount?: number;
  sections_with_free_lessons: {
    index: number;
    free_lessons_indexes: number[];
  }[];
  reviews?: CourseReview[];
  redirect_url?: string;
};

export type CustomCoursePrice = {
  'course-id': number;
  'egp-price': number;
  'sar-price': number;
};

export type CustomCourseLabel = {
  label: string;
  allCourses: boolean;
  course_ids: number[];
};
