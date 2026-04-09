export interface UserRatingStats {
  totalRatings: number;
  currentRating: number;
}

export interface UserSettings {
  defaultDistance: number;
}

export interface User {
  _id: string;
  email: string;
  emailVerifiedAt: string | null;
  phone: string | null;
  tokenVersion: number;
  platformAdmin: boolean;
  banned: boolean;
  banReason: string | null;
  requirePasswordReset: boolean;
  createdByAdmin: string | null;
  creditBalanceCents: number;
  settings: UserSettings;
  ratingStats: UserRatingStats;
  createdAt: string;
  updatedAt: string;
}
