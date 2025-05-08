
import { useState } from "react";
import { WritingPromptQuestion, getRandomQuestions } from "@/utils/questionBank";
import { generatePositionSpecificPrompts } from "@/services/gemini/positionPrompts";
import { toast } from "@/components/ui/use-toast";

const QUESTIONS_PER_ASSESSMENT = 3;

export const usePromptGeneration = () => {
  const [availablePrompts, setAvailablePrompts] = useState<WritingPromptQuestion[]>([]);
  const [isGeneratingPrompts, setIsGeneratingPrompts] = useState(false);
  const [usePositionPrompts] = useState(true);

  const generatePrompts = async (position: string, skills: string) => {
    setIsGeneratingPrompts(true);
    try {
      let questions: WritingPromptQuestion[];
      if (usePositionPrompts && position) {
        console.log("Generating position-specific prompts for:", position);
        questions = await generatePositionSpecificPrompts(position, QUESTIONS_PER_ASSESSMENT, skills);
      } else {
        console.log("Using random questions");
        questions = getRandomQuestions(QUESTIONS_PER_ASSESSMENT);
      }
      setAvailablePrompts(questions);
      console.log("Generated prompts:", questions.length);
      return questions;
    } catch (e) {
      console.error("Error generating prompts:", e);
      toast({
        title: "Error generating prompts",
        description: "Using general prompts instead",
        variant: "destructive",
      });
      const fallbackQuestions = getRandomQuestions(QUESTIONS_PER_ASSESSMENT);
      setAvailablePrompts(fallbackQuestions);
      return fallbackQuestions;
    } finally {
      setIsGeneratingPrompts(false);
    }
  };

  return {
    availablePrompts,
    isGeneratingPrompts,
    generatePrompts
  };
};
