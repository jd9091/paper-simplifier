export type UserLevel = 'expert' | 'graduate' | 'undergraduate' | 'highschool' | 'general';

export interface PaperMetadata {
  title: string;
  authors: string[];
  abstract?: string;
  source?: string;
  url?: string;
  doi?: string;
}

export interface PaperSection {
  title: string;
  originalContent: string;
  simplifiedContent: string;
  diagram?: string; // Mermaid syntax
}

export interface KeyFinding {
  finding: string;
  evidence: string;
  significance: string;
}

export interface KeyFindings {
  research_question: string;
  key_findings: KeyFinding[];
  main_conclusion: string;
  limitations: string[];
  implications: string;
}

export interface ProcessedPaper {
  id: string;
  metadata: PaperMetadata;
  sections: PaperSection[];
  keyFindings?: KeyFindings;
  userLevel: UserLevel;
  createdAt: string;
}

export interface UploadResponse {
  success: boolean;
  text?: string;
  metadata?: PaperMetadata;
  error?: string;
}

export interface ProcessingRequest {
  text: string;
  metadata?: PaperMetadata;
  userLevel: UserLevel;
}

export interface ProcessingResponse {
  success: boolean;
  id?: string;
  error?: string;
}

export const USER_LEVELS: { value: UserLevel; label: string; description: string }[] = [
  {
    value: 'expert',
    label: 'Expert',
    description: 'Maintain technical terminology and assume domain expertise',
  },
  {
    value: 'graduate',
    label: 'Graduate Student',
    description: 'Explain advanced concepts with some technical detail',
  },
  {
    value: 'undergraduate',
    label: 'Undergraduate',
    description: 'Simplify concepts with clear examples and analogies',
  },
  {
    value: 'highschool',
    label: 'High School',
    description: 'Break down into fundamental concepts with everyday language',
  },
  {
    value: 'general',
    label: 'General Audience',
    description: 'Maximum simplification for non-technical readers',
  },
];
