export type CourseCertificate = {
  id: string;
  certificateName_EN: string;
  certificateName_AR: string;
  certificateURL: string;
  courseId: number;
  userCourseId?: number;
  courseStartDate?: string;
  courseEndDate?: string;
  courseName: string;
  userId: string;
};
