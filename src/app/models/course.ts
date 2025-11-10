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
  reviewsRes: CourseReviewsRes;
  updateUserCourses?: boolean;
  packageId?: number | null;
  userId: string;
  refresh?: boolean;
  showCoupon?: boolean;
  currentPurchasedCourseId?: number;
};

export type CourseReviewsRes = {
  loading: boolean;
  data: ListApi<CourseReview>;
};

export type CourseTopic = {
  id: number;
  topicName_AR: string;
  fileList?: CourseAttachment[];
  lessonList: CourseLesson[];
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
  cachedVideoUrl?: string;
  isActive?: boolean;
  isDisabled?: boolean;
  isWatched?: boolean;
  isFullScreen?: boolean;
  autoplay?: boolean;
  courseId?: number;
  lIndex?: number;
  tIndex?: number;
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
  isLike?: boolean;
  evaluationComment?: string;
  firstName: string;
  familyName: string;
  imageURL: string;
  date: string | number;
  userId?: string;
  courseId?: number;
};

export type CourseAttachment = {
  lessonName: string;
  attachmentName?: string;
  attachmentsExternalLink?: string;
  attachmentLink?: string;
  attachmentFileName?: string;
  id: number;
};
