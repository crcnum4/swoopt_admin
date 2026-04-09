import type { RecommendedService, TopScoredService, MatchingAddon } from './service-request';

export type OfferStatus =
  | 'pending'
  | 'accepted_by_provider'
  | 'accepted_by_user'
  | 'completed'
  | 'denied_by_provider'
  | 'more_data_requested'
  | 'denied_by_user'
  | 'expired'
  | 'withdrawn'
  | 'not_selected';

export type ProviderDenialReason =
  | 'no_longer_available'
  | 'service_not_offered'
  | 'time_conflict'
  | 'too_short_notice'
  | 'additional_data_needed'
  | 'other';

export interface ProviderDenial {
  reason: ProviderDenialReason;
  comment?: string;
  autoToggleAvailability?: boolean;
  additionalDataRequest?: string;
}

export interface Offer {
  _id: string;
  serviceRequestId: string;
  orgId: string;
  serviceItemId?: string;
  status: OfferStatus;
  respondedByUserId?: string;
  respondedAt?: string;
  priceCents?: number;
  startTime?: string;
  estimatedDurationMinutes?: number;
  serviceName?: string;
  providerDenial?: ProviderDenial;
  distanceMiles?: number;
  matchScore?: number;
  recommendedService?: RecommendedService;
  topScoredServices?: TopScoredService[];
  matchingAddons?: MatchingAddon[];
  serviceRelevanceScore?: number;
  wave: number;
  acceptanceExpiresAt?: string | null;
  isManualOffer: boolean;
  createdByAdmin: string | null;
  expiresAt?: string;
  createdAt: string;
  updatedAt: string;
}
