export type User = {
  id: string;
  email: string;
  imageURL: string;
  isActive: boolean;
  roleType?: number;
  familyName: string;
  firstName: string;
  country?: string;
  address?: string;
  city?: string;
  phoneNumber?: string;
  socialProvider?: SOCIALPROVIDER;
};

export type SocialUser = {
  UserId: string | null;
  FirstName: string | null;
  EmailAddress: string | null;
  LastName: string | null;
  Provider: SOCIALPROVIDER;
  OauthToken: string;
  PictureUrl: string;
  IsStudent: boolean;
};

export type SOCIALPROVIDER = 'GOOGLE';
