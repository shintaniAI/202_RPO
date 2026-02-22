export interface DailyData {
  date: string;
  impressions: number;
  clicks: number;
  cost: number;
  applications: number;
  cpa: number;
}

export interface ClientInfo {
  name: string;
  jobTitle: string;
  monthlyGoal: string;
  notes: string;
}

export interface ClientPreset {
  clientName: string;
  spreadsheetUrl: string;
  targetAgeMin: number | null;
  targetAgeMax: number | null;
  targetGender: string;
  targetNationality: string;
  targetPersonaDescription: string;
  note: string;
}

export interface WebSource {
  uri: string;
  title: string;
}

export interface DemographicData {
  name: string;
  value: number;
}

export interface ApplicantDemographics {
  ageGroups: DemographicData[];
  genderRatio: DemographicData[];
  nationalityRatio: DemographicData[];
}

export interface AnalysisResult {
  executiveSummary: string;
  performanceContent: string;
  candidateAnalysis: string;
  applicantDemographics?: ApplicantDemographics;
  trendsContent: string;
  marketExamples: string[];
  strategyContent: string;
  recommendedActions: string[];
  interviewQuestions: string[];
  personaImageUrl?: string;
  webSources: WebSource[];
}

export interface AppConfig {
  webhookUrl?: string;
  spreadsheetUrl?: string;
}

export enum LoadingState {
  IDLE = 'IDLE',
  READING_FILES = 'READING_FILES',
  ANALYZING = 'ANALYZING',
  SUCCESS = 'SUCCESS',
  ERROR = 'ERROR'
}
