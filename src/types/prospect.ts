export type ProspectStatus =
  | 'new'
  | 'pending_validation'
  | 'validated'
  | 'rejected'
  | 'message_generated'
  | 'sent'
  | 'failed';

export type CommercialPotential = 'faible' | 'moyen' | 'eleve';
export type Urgency = 'faible' | 'moyenne' | 'haute';

export interface ScoreBreakdown {
  locatedInKankan: boolean;
  emailFound: boolean;
  phoneFound: boolean;
  websiteFound: boolean;
  activeFacebookPage: boolean;
  mentionsManagement: boolean;
  mentionsStock: boolean;
  mentionsInvoicing: boolean;
  seekingSoftware: boolean;
  recentPublication: boolean;
}

export interface ClaudeAnalysis {
  companyName: string;
  city: string | null;
  sector: string | null;
  address: string | null;
  phone: string | null;
  email: string | null;
  website: string | null;
  facebookUrl: string | null;
  linkedinUrl: string | null;
  description: string | null;
  probableNeeds: string[];
  currentSoftware: string | null;
  commercialPotential: CommercialPotential;
  urgency: Urgency;
  suggestedScore: number;
  scoreReason: string;
  scoreBreakdown: ScoreBreakdown;
}

export interface Prospect {
  id: string;
  companyName: string;
  city: string | null;
  sector: string | null;
  address: string | null;
  phone: string | null;
  email: string | null;
  website: string | null;
  facebookUrl: string | null;
  linkedinUrl: string | null;
  description: string | null;
  probableNeeds: string[];
  currentSoftware: string | null;
  commercialPotential: CommercialPotential;
  urgency: Urgency;
  score: number;
  scoreReason: string;
  scoreBreakdown: ScoreBreakdown;
  sourceUrls: string[];
  searchQuery: string | null;
  dedupHash: string;
  status: ProspectStatus;
  generatedMessage: string | null;
  validatedBy: string | null;
  validatedAt: Date | null;
  sentAt: Date | null;
  sentChannel: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface NewProspectInput {
  companyName: string;
  city: string | null;
  sector: string | null;
  address: string | null;
  phone: string | null;
  email: string | null;
  website: string | null;
  facebookUrl: string | null;
  linkedinUrl: string | null;
  description: string | null;
  probableNeeds: string[];
  currentSoftware: string | null;
  commercialPotential: CommercialPotential;
  urgency: Urgency;
  score: number;
  scoreReason: string;
  scoreBreakdown: ScoreBreakdown;
  sourceUrls: string[];
  searchQuery: string | null;
  dedupHash: string;
}
