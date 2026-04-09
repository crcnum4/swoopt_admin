export interface RatingEntry {
  stars: number;
  comment: string | null;
  submittedAt: string;
}

export interface OrgRatingEntry extends RatingEntry {
  ratedByUserId: string;
}

export interface Rating {
  _id: string;
  serviceRequestId: string;
  offerId: string;
  userId: string;
  orgId: string;
  userToOrg?: RatingEntry;
  orgToUser?: OrgRatingEntry;
  bothSubmitted: boolean;
  revealedAt: string | null;
  createdAt: string;
  updatedAt: string;
}
