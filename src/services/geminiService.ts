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
