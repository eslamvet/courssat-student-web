export type Package = {
  id: number;
  packageName_AR: string;
  packageDescription_AR: string;
  originalPrice: number;
  discountPrice: number;
  imageUrl: string;
  firstName: string;
  familyName: string;
  departmentName: string;
  userId: string;
  courseCount: number;
  isPaid: boolean;
};

export type PackageJson = {
  eg_packages: { id: number; price: number }[];
  sa_packages: { id: number; price: number }[];
  default_packages: { id: number; price: number }[];
  show_timer: boolean;
  default_section_title: string;
  eg_section_title: string;
  sa_section_title: string;
  end_date: string;
};

export type PackageData = {
  hasTimer?: boolean;
  title?: string;
  data: Package[];
  startTime?: number;
};
