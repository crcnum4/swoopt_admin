export type ServiceSource = 'pdf' | 'url' | 'manual';

export interface ServiceItem {
  _id: string;
  orgId: string;
  industryId: string | null;
  name: string;
  description: string | null;
  startingPrice: number;
  estimatedDurationMinutes: number | null;
  category: string | null;
  normalizedName: string | null;
  tags: string[];
  source: ServiceSource;
  isAddon: boolean;
  requiresConsultation: boolean;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}
