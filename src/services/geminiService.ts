import { WritingPromptItem } from "@/components/AssessmentManager";

// Scoring criteria with detailed meanings
export const scoringCriteria = {
  1: "Needs Significant Improvement: The response shows limited understanding of the prompt with numerous grammar and structure issues.",
  2: "Basic: The response partially addresses the prompt with several grammatical errors and unclear organization.",
  3: "Satisfactory: The response adequately addresses the prompt with decent structure but some minor grammatical issues.",
  4: "Proficient: The response thoroughly addresses the prompt with clear organization, good vocabulary, and minimal errors.",
  5: "Exceptional: The response comprehensively addresses the prompt with sophisticated vocabulary, flawless grammar, and compelling arguments."
};

export type WritingScore = {
  score: number;
  feedback: string;
  promptId: number;
};

export type PersonalityInsight = {
  trait: string;
  description: string;
  confidence: number; // 0-100
};

export type InterviewQuestion = {
  question: string;
  rationale: string;
  category: string; // technical, behavioral, etc.
};

export type DetailedAnalysis = {
  writingStyle: string;
  vocabularyLevel: string;
  criticalThinking: string;
  strengthAreas: string[];
  improvementAreas: string[];
};

export type CandidateProfileMatch = {
  position: string;
  matchPercentage: number;
  keyMatches: string[];
  keyGaps: string[];
};

export const evaluateWritingResponse = async (prompt: string, userResponse: string): Promise<WritingScore> => {
  try {
    console.log("Starting evaluation for prompt:", prompt.substring(0, 30) + "...");
    console.log("Response length:", userResponse.length, "characters");
    
    const apiKey = "AIzaSyApWiYP8pkZKNMrCDKmdbRJVoiWUCANow0";
    const url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent";
    
    const promptTemplate = `
You are an expert writing evaluator for job candidates.
Evaluate the following writing response based on a 5-point scale where:
1: Needs Significant Improvement
2: Basic
3: Satisfactory
4: Proficient
5: Exceptional

Consider the following aspects:
- Relevance to the prompt
- Organization and structure
- Grammar and spelling
- Vocabulary and language use
- Critical thinking and depth of analysis

Writing Prompt: "${prompt}"

Candidate's Response: "${userResponse}"

Return your evaluation as JSON with the following structure:
{
  "score": [score as a number between 1-5],
  "feedback": [2-3 sentences explaining the score and providing constructive feedback]
}
`;

    console.log("Sending request to Gemini API with updated model...");
    
    try {
      const apiResponse = await fetch(`${url}?key=${apiKey}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: promptTemplate
                }
              ]
            }
          ],
          generationConfig: {
            temperature: 0.2,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 1024,
          }
        })
      });
      
      if (!apiResponse.ok) {
        const errorData = await apiResponse.text();
        console.error("Gemini API error status:", apiResponse.status);
        console.error("Error response:", errorData);
        throw new Error(`API error: ${apiResponse.status} - ${errorData}`);
      }

      const data = await apiResponse.json();
      console.log("Gemini API response received:", JSON.stringify(data).substring(0, 500) + "...");
      
      if (!data.candidates || !data.candidates[0] || !data.candidates[0].content || !data.candidates[0].content.parts) {
        console.error("Unexpected API response structure:", JSON.stringify(data));
        throw new Error("Invalid API response structure");
      }
      
      const text = data.candidates[0].content.parts[0].text;
      console.log("Raw text response:", text);
      
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      
      if (!jsonMatch) {
        console.error("Failed to extract JSON from response");
        throw new Error("Failed to parse evaluation results");
      }
      
      try {
        const evaluation = JSON.parse(jsonMatch[0]);
        console.log("Parsed evaluation:", evaluation);
        
        const score = Number(evaluation.score);
        
        if (isNaN(score)) {
          console.error("Invalid score (not a number):", evaluation.score);
          throw new Error("Invalid score format");
        }
        
        return { 
          score: score, 
          feedback: evaluation.feedback || "No feedback provided",
          promptId: 0
        };
      } catch (parseError) {
        console.error("Error parsing JSON:", parseError, "JSON string:", jsonMatch[0]);
        throw new Error("Error parsing evaluation results");
      }
    } catch (fetchError) {
      console.error("Fetch error:", fetchError);
      throw new Error(`Network error: ${fetchError.message}`);
    }
  } catch (error) {
    console.error("Error evaluating writing:", error);
    return { score: 0, feedback: `Error evaluating writing: ${error.message}. Please check manually.`, promptId: 0 };
  }
};

export const evaluateAllWritingPrompts = async (prompts: WritingPromptItem[]): Promise<WritingScore[]> => {
  console.log("Starting evaluation of all writing prompts:", prompts);
  
  if (!prompts || prompts.length === 0) {
    console.log("No prompts to evaluate");
    return [];
  }
  
  try {
    const evaluationPromises = prompts.map(prompt => {
      console.log(`Evaluating prompt ID ${prompt.id}: "${prompt.prompt.substring(0, 30)}..."`);
      return evaluateWritingResponse(prompt.prompt, prompt.response)
        .then(result => {
          console.log(`Evaluation completed for prompt ID ${prompt.id}:`, result);
          return { ...result, promptId: prompt.id };
        })
        .catch(error => {
          console.error(`Error evaluating prompt ID ${prompt.id}:`, error);
          return { 
            score: 0, 
            feedback: `Evaluation failed: ${error.message}. Please check manually.`, 
            promptId: prompt.id 
          };
        });
    });

    const results = await Promise.all(evaluationPromises);
    console.log("All evaluations completed:", results);
    return results;
  } catch (error) {
    console.error("Error in evaluateAllWritingPrompts:", error);
    return [];
  }
};

export const generateCandidateSummary = async (assessmentData: any): Promise<string> => {
  try {
    console.log("Generating candidate summary for:", assessmentData.candidateName);
    
    const apiKey = "AIzaSyApWiYP8pkZKNMrCDKmdbRJVoiWUCANow0";
    const url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent";
    
    const aptitudePercentage = assessmentData.aptitudeTotal 
      ? Math.round((assessmentData.aptitudeScore / assessmentData.aptitudeTotal) * 100) 
      : 0;
    
    const writingScorePercentage = assessmentData.overallWritingScore 
      ? Math.round((assessmentData.overallWritingScore / 5) * 100) 
      : 0;
    
    const overallScore = assessmentData.overallWritingScore
      ? Math.round((aptitudePercentage + writingScorePercentage) / 2)
      : aptitudePercentage;
    
    let writingFeedback = "No writing assessment data available.";
    if (assessmentData.writingScores && assessmentData.writingScores.length > 0) {
      writingFeedback = assessmentData.writingScores
        .filter((score: WritingScore) => score.score > 0)
        .map((score: WritingScore) => score.feedback)
        .join(" ");
    }
    
    const promptTemplate = `
As an HR AI assistant, create a professional, unbiased 3-4 sentence summary of a job candidate based on their assessment results.

Candidate: ${assessmentData.candidateName}
Position: ${assessmentData.candidatePosition}
Aptitude Score: ${assessmentData.aptitudeScore}/${assessmentData.aptitudeTotal} (${aptitudePercentage}%)
Writing Score: ${assessmentData.overallWritingScore ? `${assessmentData.overallWritingScore}/5 (${writingScorePercentage}%)` : "Not available"}
Overall Score: ${overallScore}%
Writing Feedback: ${writingFeedback}

Your summary should:
1. Highlight the candidate's strengths and potential areas for growth
2. Provide hiring managers with actionable insights based solely on assessment data
3. Be constructive and professional in tone
4. Be concise (3-4 sentences maximum)
5. Focus only on assessment performance, not making assumptions about the candidate's character
`;

    console.log("Sending request to Gemini API for candidate summary...");
    
    try {
      const apiResponse = await fetch(`${url}?key=${apiKey}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: promptTemplate
                }
              ]
            }
          ],
          generationConfig: {
            temperature: 0.4,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 512,
          }
        })
      });
      
      if (!apiResponse.ok) {
        const errorData = await apiResponse.text();
        console.error("Gemini API error status:", apiResponse.status);
        console.error("Error response:", errorData);
        throw new Error(`API error: ${apiResponse.status} - ${errorData}`);
      }

      const data = await apiResponse.json();
      console.log("Gemini API response received for summary");
      
      if (!data.candidates || !data.candidates[0] || !data.candidates[0].content || !data.candidates[0].content.parts) {
        console.error("Unexpected API response structure:", JSON.stringify(data));
        throw new Error("Invalid API response structure");
      }
      
      const summaryText = data.candidates[0].content.parts[0].text;
      console.log("Generated summary:", summaryText);
      
      return summaryText.trim();
    } catch (fetchError) {
      console.error("Fetch error:", fetchError);
      throw new Error(`Network error: ${fetchError.message}`);
    }
  } catch (error) {
    console.error("Error generating candidate summary:", error);
    return "Unable to generate candidate summary at this time. Please try again later.";
  }
};

export const generateStrengthsAndWeaknesses = async (assessmentData: any): Promise<{strengths: string[], weaknesses: string[]}> => {
  try {
    console.log("Generating strengths and weaknesses for:", assessmentData.candidateName);
    
    const apiKey = "AIzaSyApWiYP8pkZKNMrCDKmdbRJVoiWUCANow0";
    const url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent";
    
    const aptitudePercentage = assessmentData.aptitudeTotal 
      ? Math.round((assessmentData.aptitudeScore / assessmentData.aptitudeTotal) * 100) 
      : 0;
    
    const writingScorePercentage = assessmentData.overallWritingScore 
      ? Math.round((assessmentData.overallWritingScore / 5) * 100) 
      : 0;
    
    let writingFeedback = "No writing assessment data available.";
    if (assessmentData.writingScores && assessmentData.writingScores.length > 0) {
      writingFeedback = assessmentData.writingScores
        .filter((score: WritingScore) => score.score > 0)
        .map((score: WritingScore) => score.feedback)
        .join(" ");
    }
    
    const promptTemplate = `
As an HR AI assistant, analyze this candidate's assessment data and identify 3 key strengths and 3 areas for improvement.

Candidate: ${assessmentData.candidateName}
Position: ${assessmentData.candidatePosition}
Aptitude Score: ${assessmentData.aptitudeScore}/${assessmentData.aptitudeTotal} (${aptitudePercentage}%)
Writing Score: ${assessmentData.overallWritingScore ? `${assessmentData.overallWritingScore}/5 (${writingScorePercentage}%)` : "Not available"}
Writing Feedback: ${writingFeedback}

Return your analysis as JSON with the following structure:
{
  "strengths": ["strength 1", "strength 2", "strength 3"],
  "weaknesses": ["area for improvement 1", "area for improvement 2", "area for improvement 3"]
}

Each strength and weakness should be 1-2 sentences maximum, specific and actionable.
`;

    console.log("Sending request to Gemini API for strengths/weaknesses...");
    
    try {
      const apiResponse = await fetch(`${url}?key=${apiKey}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: promptTemplate
                }
              ]
            }
          ],
          generationConfig: {
            temperature: 0.3,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 1024,
          }
        })
      });
      
      if (!apiResponse.ok) {
        const errorData = await apiResponse.text();
        console.error("Gemini API error status:", apiResponse.status);
        console.error("Error response:", errorData);
        throw new Error(`API error: ${apiResponse.status} - ${errorData}`);
      }

      const data = await apiResponse.json();
      console.log("Gemini API response received for strengths/weaknesses");
      
      if (!data.candidates || !data.candidates[0] || !data.candidates[0].content || !data.candidates[0].content.parts) {
        console.error("Unexpected API response structure:", JSON.stringify(data));
        throw new Error("Invalid API response structure");
      }
      
      const text = data.candidates[0].content.parts[0].text;
      console.log("Generated strengths/weaknesses raw text:", text);
      
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      
      if (!jsonMatch) {
        console.error("Failed to extract JSON from response");
        throw new Error("Failed to parse analysis results");
      }
      
      try {
        const analysis = JSON.parse(jsonMatch[0]);
        console.log("Parsed analysis:", analysis);
        
        return { 
          strengths: analysis.strengths || ["No strengths identified"], 
          weaknesses: analysis.weaknesses || ["No areas for improvement identified"]
        };
      } catch (parseError) {
        console.error("Error parsing JSON:", parseError);
        throw new Error("Error parsing analysis results");
      }
    } catch (fetchError) {
      console.error("Fetch error:", fetchError);
      throw new Error(`Network error: ${fetchError.message}`);
    }
  } catch (error) {
    console.error("Error generating strengths and weaknesses:", error);
    return {
      strengths: ["Unable to generate strengths at this time."],
      weaknesses: ["Unable to generate areas for improvement at this time."]
    };
  }
};

export const generateDetailedWritingAnalysis = async (assessmentData: any): Promise<DetailedAnalysis> => {
  try {
    console.log("Generating detailed writing analysis for:", assessmentData.candidateName);
    
    const apiKey = "AIzaSyApWiYP8pkZKNMrCDKmdbRJVoiWUCANow0";
    const url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent";
    
    const writingResponses = assessmentData.completedPrompts
      .map((prompt: WritingPromptItem) => prompt.response)
      .join("\n\n");
    
    const promptTemplate = `
As an AI writing analyst, provide a detailed analysis of the following writing samples from a job candidate.

Writing Samples:
"""
${writingResponses}
"""

Focus on the following aspects:
1. Writing style (formal, conversational, technical, etc.)
2. Vocabulary level (basic, intermediate, advanced)
3. Critical thinking ability
4. Specific strength areas (2-3 points)
5. Areas for improvement (2-3 points)

Return your analysis as JSON with the following structure:
{
  "writingStyle": "description of the candidate's writing style",
  "vocabularyLevel": "assessment of vocabulary level",
  "criticalThinking": "evaluation of critical thinking ability",
  "strengthAreas": ["strength 1", "strength 2", "strength 3"],
  "improvementAreas": ["area for improvement 1", "area for improvement 2", "area for improvement 3"]
}
`;

    console.log("Sending request to Gemini API for detailed writing analysis...");
    
    try {
      const apiResponse = await fetch(`${url}?key=${apiKey}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: promptTemplate
                }
              ]
            }
          ],
          generationConfig: {
            temperature: 0.3,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 1024,
          }
        })
      });
      
      if (!apiResponse.ok) {
        const errorData = await apiResponse.text();
        console.error("Gemini API error status:", apiResponse.status);
        console.error("Error response:", errorData);
        throw new Error(`API error: ${apiResponse.status} - ${errorData}`);
      }

      const data = await apiResponse.json();
      console.log("Gemini API response received for detailed writing analysis");
      
      if (!data.candidates || !data.candidates[0] || !data.candidates[0].content || !data.candidates[0].content.parts) {
        console.error("Unexpected API response structure:", JSON.stringify(data));
        throw new Error("Invalid API response structure");
      }
      
      const text = data.candidates[0].content.parts[0].text;
      console.log("Generated detailed analysis raw text:", text);
      
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      
      if (!jsonMatch) {
        console.error("Failed to extract JSON from response");
        throw new Error("Failed to parse analysis results");
      }
      
      try {
        const analysis = JSON.parse(jsonMatch[0]);
        console.log("Parsed detailed analysis:", analysis);
        
        return { 
          writingStyle: analysis.writingStyle || "Unable to analyze writing style",
          vocabularyLevel: analysis.vocabularyLevel || "Unable to analyze vocabulary level",
          criticalThinking: analysis.criticalThinking || "Unable to analyze critical thinking",
          strengthAreas: analysis.strengthAreas || ["No specific strengths identified"],
          improvementAreas: analysis.improvementAreas || ["No specific areas for improvement identified"]
        };
      } catch (parseError) {
        console.error("Error parsing JSON:", parseError);
        throw new Error("Error parsing analysis results");
      }
    } catch (fetchError) {
      console.error("Fetch error:", fetchError);
      throw new Error(`Network error: ${fetchError.message}`);
    }
  } catch (error) {
    console.error("Error generating detailed writing analysis:", error);
    return {
      writingStyle: "Analysis failed",
      vocabularyLevel: "Analysis failed",
      criticalThinking: "Analysis failed",
      strengthAreas: ["Unable to analyze strengths at this time"],
      improvementAreas: ["Unable to analyze areas for improvement at this time"]
    };
  }
};

export const generateInterviewQuestions = async (assessmentData: any): Promise<InterviewQuestion[]> => {
  try {
    console.log("Generating interview questions for:", assessmentData.candidateName);
    
    const apiKey = "AIzaSyApWiYP8pkZKNMrCDKmdbRJVoiWUCANow0";
    const url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent";
    
    const aptitudePercentage = assessmentData.aptitudeTotal 
      ? Math.round((assessmentData.aptitudeScore / assessmentData.aptitudeTotal) * 100) 
      : 0;
    
    const writingScorePercentage = assessmentData.overallWritingScore 
      ? Math.round((assessmentData.overallWritingScore / 5) * 100) 
      : 0;
    
    let writingFeedback = "No writing assessment data available.";
    if (assessmentData.writingScores && assessmentData.writingScores.length > 0) {
      writingFeedback = assessmentData.writingScores
        .filter((score: WritingScore) => score.score > 0)
        .map((score: WritingScore) => score.feedback)
        .join(" ");
    }
    
    let strengths = assessmentData.strengths || [];
    let weaknesses = assessmentData.weaknesses || [];
    
    const promptTemplate = `
As an AI interview assistant, generate 5 targeted interview questions for this candidate based on their assessment results.

Candidate: ${assessmentData.candidateName}
Position: ${assessmentData.candidatePosition}
Aptitude Score: ${assessmentData.aptitudeScore}/${assessmentData.aptitudeTotal} (${aptitudePercentage}%)
Writing Score: ${assessmentData.overallWritingScore ? `${assessmentData.overallWritingScore}/5 (${writingScorePercentage}%)` : "Not available"}
Writing Feedback: ${writingFeedback}

Identified Strengths: ${strengths.join(", ")}
Areas for Improvement: ${weaknesses.join(", ")}

Generate interview questions that:
1. Validate the candidate's strengths
2. Explore areas for improvement
3. Include a mix of technical, behavioral, and situational questions
4. Are specific to the position (${assessmentData.candidatePosition})

Return your questions as JSON with the following structure:
{
  "questions": [
    {
      "question": "question text",
      "rationale": "why this question is important",
      "category": "technical/behavioral/situational"
    },
    ... (4 more questions)
  ]
}
`;

    console.log("Sending request to Gemini API for interview questions...");
    
    try {
      const apiResponse = await fetch(`${url}?key=${apiKey}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: promptTemplate
                }
              ]
            }
          ],
          generationConfig: {
            temperature: 0.7,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 1024,
          }
        })
      });
      
      if (!apiResponse.ok) {
        const errorData = await apiResponse.text();
        console.error("Gemini API error status:", apiResponse.status);
        console.error("Error response:", errorData);
        throw new Error(`API error: ${apiResponse.status} - ${errorData}`);
      }

      const data = await apiResponse.json();
      console.log("Gemini API response received for interview questions");
      
      if (!data.candidates || !data.candidates[0] || !data.candidates[0].content || !data.candidates[0].content.parts) {
        console.error("Unexpected API response structure:", JSON.stringify(data));
        throw new Error("Invalid API response structure");
      }
      
      const text = data.candidates[0].content.parts[0].text;
      console.log("Generated interview questions raw text:", text);
      
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      
      if (!jsonMatch) {
        console.error("Failed to extract JSON from response");
        throw new Error("Failed to parse questions results");
      }
      
      try {
        const questionsData = JSON.parse(jsonMatch[0]);
        console.log("Parsed interview questions:", questionsData);
        
        if (!questionsData.questions || !Array.isArray(questionsData.questions)) {
          throw new Error("Invalid questions format");
        }
        
        return questionsData.questions.map((q: any) => ({
          question: q.question || "Invalid question",
          rationale: q.rationale || "No rationale provided",
          category: q.category || "general"
        }));
      } catch (parseError) {
        console.error("Error parsing JSON:", parseError);
        throw new Error("Error parsing questions results");
      }
    } catch (fetchError) {
      console.error("Fetch error:", fetchError);
      throw new Error(`Network error: ${fetchError.message}`);
    }
  } catch (error) {
    console.error("Error generating interview questions:", error);
    return [
      {
        question: "Unable to generate questions at this time",
        rationale: "An error occurred during generation",
        category: "error"
      }
    ];
  }
};

export const generatePersonalityInsights = async (assessmentData: any): Promise<PersonalityInsight[]> => {
  try {
    console.log("Generating personality insights for:", assessmentData.candidateName);
    
    const apiKey = "AIzaSyApWiYP8pkZKNMrCDKmdbRJVoiWUCANow0";
    const url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent";
    
    const writingResponses = assessmentData.completedPrompts
      .map((prompt: WritingPromptItem) => prompt.response)
      .join("\n\n");
    
    const promptTemplate = `
As an AI personality analyst, analyze the writing style of this candidate to identify personality traits.

Writing Samples:
"""
${writingResponses}
"""

Based on writing style, word choice, and content, identify 5 likely personality traits of the candidate.
For each trait, provide:
1. The trait name
2. A short description of how this trait manifests in their writing
3. A confidence level (0-100) for this assessment

Return your analysis as JSON with the following structure:
{
  "insights": [
    {
      "trait": "trait name",
      "description": "description of how this trait manifests",
      "confidence": confidence score as number between 0-100
    },
    ... (4 more traits)
  ]
}

Note: This is based solely on writing style analysis and should be considered an initial impression only.
`;

    console.log("Sending request to Gemini API for personality insights...");
    
    try {
      const apiResponse = await fetch(`${url}?key=${apiKey}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: promptTemplate
                }
              ]
            }
          ],
          generationConfig: {
            temperature: 0.4,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 1024,
          }
        })
      });
      
      if (!apiResponse.ok) {
        const errorData = await apiResponse.text();
        console.error("Gemini API error status:", apiResponse.status);
        console.error("Error response:", errorData);
        throw new Error(`API error: ${apiResponse.status} - ${errorData}`);
      }

      const data = await apiResponse.json();
      console.log("Gemini API response received for personality insights");
      
      if (!data.candidates || !data.candidates[0] || !data.candidates[0].content || !data.candidates[0].content.parts) {
        console.error("Unexpected API response structure:", JSON.stringify(data));
        throw new Error("Invalid API response structure");
      }
      
      const text = data.candidates[0].content.parts[0].text;
      console.log("Generated personality insights raw text:", text);
      
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      
      if (!jsonMatch) {
        console.error("Failed to extract JSON from response");
        throw new Error("Failed to parse insights results");
      }
      
      try {
        const insightsData = JSON.parse(jsonMatch[0]);
        console.log("Parsed personality insights:", insightsData);
        
        if (!insightsData.insights || !Array.isArray(insightsData.insights)) {
          throw new Error("Invalid insights format");
        }
        
        return insightsData.insights.map((i: any) => ({
          trait: i.trait || "Unknown trait",
          description: i.description || "No description provided",
          confidence: i.confidence || 0
        }));
      } catch (parseError) {
        console.error("Error parsing JSON:", parseError);
        throw new Error("Error parsing insights results");
      }
    } catch (fetchError) {
      console.error("Fetch error:", fetchError);
      throw new Error(`Network error: ${fetchError.message}`);
    }
  } catch (error) {
    console.error("Error generating personality insights:", error);
    return [
      {
        trait: "Unable to analyze personality",
        description: "An error occurred during analysis",
        confidence: 0
      }
    ];
  }
};

export const compareWithIdealProfile = async (assessmentData: any): Promise<CandidateProfileMatch> => {
  try {
    console.log("Comparing candidate with ideal profile:", assessmentData.candidateName);
    
    const apiKey = "AIzaSyApWiYP8pkZKNMrCDKmdbRJVoiWUCANow0";
    const url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent";
    
    const aptitudePercentage = assessmentData.aptitudeTotal 
      ? Math.round((assessmentData.aptitudeScore / assessmentData.aptitudeTotal) * 100) 
      : 0;
    
    const writingScorePercentage = assessmentData.overallWritingScore 
      ? Math.round((assessmentData.overallWritingScore / 5) * 100) 
      : 0;
    
    const overallScore = assessmentData.overallWritingScore
      ? Math.round((aptitudePercentage + writingScorePercentage) / 2)
      : aptitudePercentage;
    
    let strengths = assessmentData.strengths || [];
    let weaknesses = assessmentData.weaknesses || [];
    
    const promptTemplate = `
As an AI recruitment assistant, compare this candidate's profile against an ideal candidate for the position.

Candidate: ${assessmentData.candidateName}
Position: ${assessmentData.candidatePosition}
Aptitude Score: ${assessmentData.aptitudeScore}/${assessmentData.aptitudeTotal} (${aptitudePercentage}%)
Writing Score: ${assessmentData.overallWritingScore ? `${assessmentData.overallWritingScore}/5 (${writingScorePercentage}%)` : "Not available"}
Overall Score: ${overallScore}%

Identified Strengths: ${strengths.join(", ")}
Areas for Improvement: ${weaknesses.join(", ")}

For a typical ${assessmentData.candidatePosition} role, analyze:
1. Overall match percentage
2. Key areas where the candidate matches the ideal profile
3. Key gaps compared to the ideal profile

Return your analysis as JSON with the following structure:
{
  "position": "${assessmentData.candidatePosition}",
  "matchPercentage": match percentage as number between 0-100,
  "keyMatches": ["match point 1", "match point 2", "match point 3"],
  "keyGaps": ["gap point 1", "gap point 2", "gap point 3"]
}
`;

    console.log("Sending request to Gemini API for profile comparison...");
    
    try {
      const apiResponse = await fetch(`${url}?key=${apiKey}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: promptTemplate
                }
              ]
            }
          ],
          generationConfig: {
            temperature: 0.3,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 1024,
          }
        })
      });
      
      if (!apiResponse.ok) {
        const errorData = await apiResponse.text();
        console.error("Gemini API error status:", apiResponse.status);
        console.error("Error response:", errorData);
        throw new Error(`API error: ${apiResponse.status} - ${errorData}`);
      }

      const data = await apiResponse.json();
      console.log("Gemini API response received for profile comparison");
      
      if (!data.candidates || !data.candidates[0] || !data.candidates[0].content || !data.candidates[0].content.parts) {
        console.error("Unexpected API response structure:", JSON.stringify(data));
        throw new Error("Invalid API response structure");
      }
      
      const text = data.candidates[0].content.parts[0].text;
      console.log("Generated profile comparison raw text:", text);
      
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      
      if (!jsonMatch) {
        console.error("Failed to extract JSON from response");
        throw new Error("Failed to parse comparison results");
      }
      
      try {
        const comparisonData = JSON.parse(jsonMatch[0]);
        console.log("Parsed profile comparison:", comparisonData);
        
        return {
          position: comparisonData.position || assessmentData.candidatePosition,
          matchPercentage: comparisonData.matchPercentage || 0,
          keyMatches: comparisonData.keyMatches || ["No specific matches identified"],
          keyGaps: comparisonData.keyGaps || ["No specific gaps identified"]
        };
      } catch (parseError) {
        console.error("Error parsing JSON:", parseError);
        throw new Error("Error parsing comparison results");
      }
    } catch (fetchError) {
      console.error("Fetch error:", fetchError);
      throw new Error(`Network error: ${fetchError.message}`);
    }
  } catch (error) {
    console.error("Error generating profile comparison:", error);
    return {
      position: assessmentData.candidatePosition,
      matchPercentage: 0,
      keyMatches: ["Unable to identify matches at this time"],
      keyGaps: ["Unable to identify gaps at this time"]
    };
  }
};
