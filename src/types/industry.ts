export type IndustryCategory = 'beauty' | 'automotive' | 'health' | 'legal' | 'home' | 'personal';

export interface IndustrySpecialRules {
  exemptFromStartingPrice: boolean;
  requiresInsuranceCheck: boolean;
  holdFeeAmount: number;
}

export interface Industry {
  _id: string;
  label: string;
  displayLabel: string;
  category: IndustryCategory;
  specialRules: IndustrySpecialRules;
  defaultFollowupQuestions: string[];
  active: boolean;
  createdAt: string;
  updatedAt: string;
}
