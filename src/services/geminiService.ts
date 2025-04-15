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
      .map((prompt: WritingPromptItem) => `Prompt: ${prompt.prompt}\nResponse: ${prompt.response}`)
      .join("\n\n---\n\n");
    
    const promptTemplate = `
You are an objective writing analyst for job candidate assessments. Your task is to analyze writing samples in a consistent, fair manner without making assumptions about the candidate.

# WRITING SAMPLES
${writingResponses}

# ANALYSIS INSTRUCTIONS
Analyze only the text provided above. Focus on writing style, vocabulary level, and critical thinking demonstrated in the responses.

Analyze ONLY these specific aspects:
1. Writing style - formal, technical, conversational, etc.
2. Vocabulary level - basic, intermediate, advanced
3. Critical thinking ability - as demonstrated through logical reasoning, analysis, and problem-solving in writing
4. Three specific strength areas 
5. Three specific areas for improvement

Be factual and objective. Base ALL analysis on the text samples provided.
DO NOT make assumptions about the candidate's background, personality, or characteristics that cannot be directly observed in the writing.

# FORMAT
Return your analysis as a JSON object with this exact structure:
{
  "writingStyle": "Description of writing style, 1-2 sentences only",
  "vocabularyLevel": "Assessment of vocabulary level, 1-2 sentences only",
  "criticalThinking": "Evaluation of critical thinking ability, 1-2 sentences only",
  "strengthAreas": ["strength 1 - one brief sentence", "strength 2 - one brief sentence", "strength 3 - one brief sentence"],
  "improvementAreas": ["improvement 1 - one brief sentence", "improvement 2 - one brief sentence", "improvement 3 - one brief sentence"]
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
            temperature: 0.2, // Reduced temperature for more consistent outputs
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
    
    // Gather relevant assessment data
    const position = assessmentData.candidatePosition || "Not specified";
    const aptitudeScore = assessmentData.aptitudeScore || 0;
    const aptitudeTotal = assessmentData.aptitudeTotal || 0;
    const aptitudePercentage = aptitudeTotal > 0 ? Math.round((aptitudeScore / aptitudeTotal) * 100) : 0;
    const writingScore = assessmentData.overallWritingScore || 0;
    const writingPercentage = Math.round((writingScore / 5) * 100);
    
    // Compile feedback from writing scores if available
    let writingFeedback = [];
    if (assessmentData.writingScores && assessmentData.writingScores.length > 0) {
      writingFeedback = assessmentData.writingScores
        .filter((score: WritingScore) => score.score > 0)
        .map((score: WritingScore) => score.feedback);
    }
    
    // Get strengths/weaknesses if available
    const strengths = assessmentData.strengths || [];
    const weaknesses = assessmentData.weaknesses || [];
    
    const promptTemplate = `
You are an objective interview question generator for job candidate assessments. Your task is to generate fair, relevant interview questions based solely on assessment data.

# CANDIDATE ASSESSMENT DATA
Position: ${position}
Aptitude Score: ${aptitudeScore}/${aptitudeTotal} (${aptitudePercentage}%)
Writing Score: ${writingScore}/5 (${writingPercentage}%)

${writingFeedback.length > 0 ? "Writing Feedback:\n- " + writingFeedback.join("\n- ") : "No writing feedback available."}

${strengths.length > 0 ? "Identified Strengths:\n- " + strengths.join("\n- ") : "No specific strengths identified."}
${weaknesses.length > 0 ? "Identified Improvement Areas:\n- " + weaknesses.join("\n- ") : "No specific improvement areas identified."}

# QUESTION GENERATION INSTRUCTIONS
Generate exactly 5 interview questions that:
1. Are directly relevant to the position specified
2. Help validate the candidate's strengths
3. Explore potential improvement areas
4. Include a mix of technical, behavioral, and situational questions appropriate for the position
5. Are specific and focused, not generic

For each question, provide:
- The question text (clear, direct, and professional)
- A brief rationale explaining why this question is important for this specific candidate
- A category (Technical Skills, Problem Solving, Leadership, Communication, Culture Fit, Experience, Behavioral, or Situational)

DO NOT make assumptions about the candidate's background, personality, or characteristics beyond what is provided in the assessment data.

# FORMAT
Return your questions as a JSON array with this exact structure:
{
  "questions": [
    {
      "question": "Question text here?",
      "rationale": "Brief explanation of why this question is relevant",
      "category": "One of the categories listed above"
    },
    ... (4 more questions with the same structure)
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
            temperature: 0.3, // Reduced temperature for more consistent outputs
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
    
    // Gather all writing samples from prompts
    const writingResponses = assessmentData.completedPrompts
      .map((prompt: WritingPromptItem) => `Prompt: ${prompt.prompt}\nResponse: ${prompt.response}`)
      .join("\n\n---\n\n");
    
    const promptTemplate = `
You are an objective writing style analyst for job candidate assessments. Your task is to analyze writing samples to identify communication styles and tendencies shown in the text.

# WRITING SAMPLES
${writingResponses}

# ANALYSIS INSTRUCTIONS
Analyze ONLY the language patterns and communication tendencies evident in the provided text samples. 
Focus on identifying 5 key communication traits that are objectively demonstrated in the writing.

For each trait:
1. Identify a specific communication tendency or style element displayed in the writing
2. Provide a brief description of how this trait is demonstrated in the text
3. Assess your confidence level (0-100) based on how consistently this trait appears across all samples

Important guidelines:
- Analyze ONLY writing and communication styles, NOT personality traits
- Use neutral, professional language
- Base ALL insights on text evidence, not assumptions
- DO NOT attempt to diagnose personality types or make character judgments
- Provide confidence levels that reflect the evidence strength
- Focus on communication tendencies relevant to professional contexts

# FORMAT
Return your analysis as a JSON object with this exact structure:
{
  "insights": [
    {
      "trait": "Specific communication style element",
      "description": "Brief description of how this is demonstrated in the text",
      "confidence": confidence score as number between 0-100
    },
    ... (4 more traits with the same structure)
  ]
}

Note: These insights represent communication tendencies in writing samples only, not comprehensive personality assessment.
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
            temperature: 0.2, // Reduced temperature for more consistent outputs
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
    
    // Gather relevant assessment data
    const position = assessmentData.candidatePosition || "Not specified";
    const aptitudeScore = assessmentData.aptitudeScore || 0;
    const aptitudeTotal = assessmentData.aptitudeTotal || 0;
    const aptitudePercentage = aptitudeTotal > 0 ? Math.round((aptitudeScore / aptitudeTotal) * 100) : 0;
    const writingScore = assessmentData.overallWritingScore || 0;
    const writingPercentage = Math.round((writingScore / 5) * 100);
    const overallScore = Math.round((aptitudePercentage + writingPercentage) / 2);
    
    // Get strengths/weaknesses if available
    const strengths = assessmentData.strengths || [];
    const weaknesses = assessmentData.weaknesses || [];
    
    const promptTemplate = `
You are an objective profile analyst for job candidate assessments. Your task is to compare assessment results against standard role requirements.

# CANDIDATE ASSESSMENT DATA
Position: ${position}
Aptitude Score: ${aptitudeScore}/${aptitudeTotal} (${aptitudePercentage}%)
Writing Score: ${writingScore}/5 (${writingPercentage}%)
Overall Score: ${overallScore}%

${strengths.length > 0 ? "Identified Strengths:\n- " + strengths.join("\n- ") : "No specific strengths identified."}
${weaknesses.length > 0 ? "Identified Improvement Areas:\n- " + weaknesses.join("\n- ")
