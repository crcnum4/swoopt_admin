export type ScanStatus = 'pending' | 'processing' | 'review' | 'confirmed' | 'failed';

export interface ExtractedService {
  name: string;
  startingAtPrice: number;
  duration: number | null;
  category: string | null;
  isAddon: boolean;
  requiresConsultation: boolean;
  industryId: string | null;
  metadata: Record<string, unknown> | null;
}

export interface ServiceScanJob {
  _id: string;
  orgId: string;
  initiatedBy: string;
  sourceType: 'pdf' | 'url';
  sourceUrl: string | null;
  scannedUrls: string[];
  sourceFileName: string | null;
  status: ScanStatus;
  extractedServices: ExtractedService[];
  confirmedServiceIds: string[];
  error: string | null;
  createdAt: string;
  updatedAt: string;
}
