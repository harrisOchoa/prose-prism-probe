
import { AptitudeQuestion } from "@/utils/aptitudeQuestions";
import { WritingPromptQuestion } from "@/utils/questionBank";
import { AntiCheatingMetrics } from "@/firebase/assessmentService";

export enum Stage {
  LANDING,  // Landing page
  INFO,     // Name/position collection
  INTRO,    // Instructions
  GENERATING_PROMPTS, // Added: prompt generation after info
  SELECT_PROMPTS, // Added: prompt selection before writing
  APTITUDE, // Aptitude test
  WRITING,  // Writing assessment
  COMPLETE  // Thank you page
}

export interface WritingPromptItem extends WritingPromptQuestion {
  response: string;
  wordCount: number;
}

export interface AssessmentManagerProps {
  children: (props: AssessmentContextValue) => React.ReactNode;
}

export interface AssessmentContextValue {
  stage: Stage;
  candidateName: string;
  candidatePosition: string;
  candidateSkills: string;
  currentPromptIndex: number;
  prompts: WritingPromptItem[];
  availablePrompts: WritingPromptQuestion[];
  selectedPromptIds: number[];
  aptitudeQuestions: AptitudeQuestion[];
  aptitudeScore: number;
  antiCheatingMetrics?: AntiCheatingMetrics;
  startAssessment: () => void;
  handleInfoSubmit: (name: string, position: string, skills: string) => void;
  handleStart: () => void;
  handleAptitudeComplete: (answers: number[], score: number, metrics?: AntiCheatingMetrics) => void;
  handlePromptSubmit: (text: string, metrics?: AntiCheatingMetrics) => void;
  handlePromptSelection: (selectedPromptIds: number[]) => void;
  restartAssessment: () => void;
}
