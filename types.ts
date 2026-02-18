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
  executiveSummary: string;   // High-level management summary
  performanceContent: string; // Internal data analysis
  candidateAnalysis: string;  // Qualitative analysis of applicant data
  applicantDemographics?: ApplicantDemographics; // New: Structured demographic data
  trendsContent: string;      // General market trends
  marketExamples: string[];   // Competitor job posting examples
  strategyContent: string;    // Competitor research & broad strategy (KPT format)
  recommendedActions: string[]; // Concrete actionable measures (施策)
  interviewQuestions: string[]; // Suggested interview questions
  personaImageUrl?: string;     // Generated image of the target candidate
  webSources: WebSource[];
}

export enum LoadingState {
  IDLE = 'IDLE',
  READING_FILES = 'READING_FILES',
  ANALYZING = 'ANALYZING',
  SUCCESS = 'SUCCESS',
  ERROR = 'ERROR'
}