import type { GeoPoint, Address } from './organization';

export type ServiceRequestStatus =
  | 'draft'
  | 'parsing'
  | 'followup_needed'
  | 'routing'
  | 'offering'
  | 'user_accepted'
  | 'in_progress'
  | 'completed'
  | 'rated'
  | 'user_denied'
  | 'cancelled'
  | 'expired'
  | 'exhausted';

export const SERVICE_REQUEST_STATUS_GROUPS = {
  active: ['routing', 'offering', 'user_accepted', 'in_progress'] as ServiceRequestStatus[],
  history: ['completed', 'rated', 'cancelled', 'expired', 'user_denied', 'exhausted'] as ServiceRequestStatus[],
  drafts: ['draft'] as ServiceRequestStatus[],
  pending: ['parsing', 'followup_needed'] as ServiceRequestStatus[],
} as const;

export interface ParsedIntent {
  serviceType?: string;
  industryId?: string;
  attributes?: Record<string, unknown>;
  confidence?: number;
}

export interface TimeWindow {
  earliest?: string;
  latest?: string;
  timezone?: string | null;
  flexible?: boolean;
}

export interface RequestLocation {
  label?: string;
  address?: Address;
  point?: GeoPoint;
}

export interface FollowupQuestion {
  question: string;
  answer?: string;
  answeredAt?: string;
}

export interface RecommendedService {
  serviceItemId: string;
  name: string;
  startingPrice: number;
  estimatedDurationMinutes: number | null;
  isConsultation: boolean;
}

export interface TopScoredService {
  serviceItemId: string;
  name: string;
  startingPrice: number;
  relevanceScore: number;
  isConsultation: boolean;
}

export interface MatchingAddon {
  serviceItemId: string;
  name: string;
  tags: string[];
}

export interface RankedProvider {
  orgId: string;
  matchScore: number;
  distanceMiles: number;
  serviceRelevanceScore: number;
  recommendedService: RecommendedService;
  topScoredServices: TopScoredService[];
  matchingAddons: MatchingAddon[];
  sent: boolean;
}

export interface AppointmentDetails {
  checkedInAt: string | null;
  completedAt: string | null;
  completedBy: string | null;
  noShow: boolean;
  noShowMarkedAt: string | null;
}

export type UserDenialReason = 'too_pricey' | 'too_far' | 'wrong_time' | 'changed_mind' | 'other';

export interface UserDenial {
  reason: UserDenialReason;
  comment?: string;
  deniedAt?: string;
}

export interface ServiceRequest {
  _id: string;
  userId: string;
  rawText: string;
  inputMethod: 'text' | 'voice';
  parsedIntent: ParsedIntent;
  timeWindow: TimeWindow;
  location?: RequestLocation;
  maxDistanceMiles: number;
  followupQuestions: FollowupQuestion[];
  excludeOrgIds: string[];
  maxPriceCents?: number;
  status: ServiceRequestStatus;
  acceptedOfferId?: string;
  acceptedOrgId?: string | null;
  userDenial?: UserDenial;
  appointmentDetails: AppointmentDetails;
  rankedProviders: RankedProvider[];
  currentWave: number;
  nextWaveAt: string | null;
  waveSize: number;
  expiresAt?: string;
  createdAt: string;
  updatedAt: string;
}
