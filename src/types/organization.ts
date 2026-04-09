export interface GeoPoint {
  type: 'Point';
  coordinates: [number, number]; // [lng, lat]
}

export interface Address {
  line1?: string;
  line2?: string;
  city?: string;
  region?: string;
  postalCode?: string;
  country?: string;
  // Some endpoints use street/state/zip format
  street?: string;
  state?: string;
  zip?: string;
}

export interface SavedLocation {
  _id: string;
  label: string;
  point: GeoPoint;
  address: Address;
  isDefault: boolean;
  notes?: string;
}

export interface OrgVerification {
  verified: boolean;
  verifiedAt: string | null;
  method: 'email' | 'manual' | 'stripe' | 'other';
  insured: boolean;
  insuredAt: string | null;
  licensed: boolean;
  licensedAt: string | null;
}

export interface OrgPayout {
  provider: 'stripe' | 'paypal' | 'other';
  accountId: string | null;
}

export interface OrgAlertConfig {
  escalateAfterSeconds: number | null;
}

export type OrgStatus = 'active' | 'inactive' | 'pending_verification' | 'pending_deletion' | 'blocked';

export interface Organization {
  _id: string;
  name: string;
  slug: string;
  industryId: string | null;
  status: OrgStatus;
  isAvailable: boolean;
  description: string | null;
  website: string | null;
  phone: string | null;
  email: string | null;
  verification: OrgVerification;
  payout: OrgPayout;
  alertConfig: OrgAlertConfig;
  location: SavedLocation;
  totalRatings: number;
  currentRating: number;
  createdByAdmin: string | null;
  createdAt: string;
  updatedAt: string;
}

// Provider search result (from GET /admin/providers/search)
export interface ProviderSearchResult {
  _id: string;
  name: string;
  slug: string;
  industryId: string | null;
  isAvailable: boolean;
  currentRating: number;
  totalRatings: number;
  verification: OrgVerification;
  phone: string | null;
  email: string | null;
  location: { label: string };
  distanceMiles: number;
  serviceCount: number;
}
