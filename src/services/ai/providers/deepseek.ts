
import { AIProvider } from "../types";

const DEEPSEEK_API_KEY = "sk-07423288de1f43ceaa4f75ac835390a4";
const DEEPSEEK_BASE_URL = "https://api.deepseek.com/chat/completions";

export class DeepSeekProvider implements AIProvider {
  name = "DeepSeek";

  async isAvailable(): Promise<boolean> {
    try {
      const response = await fetch(DEEPSEEK_BASE_URL, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${DEEPSEEK_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "deepseek-chat",
          messages: [{ role: "user", content: "test" }],
          max_tokens: 1
        })
      });
      return response.ok || response.status === 429; // 429 means rate limited but service is available
    } catch {
      return false;
    }
  }

  private async makeRequest(prompt: string, temperature: number = 0.2): Promise<string> {
    const response = await fetch(DEEPSEEK_BASE_URL, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${DEEPSEEK_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "deepseek-chat",
        messages: [
          {
            role: "user",
            content: prompt
          }
        ],
        temperature,
        max_tokens: 4000
      })
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`DeepSeek API error: ${response.status} - ${error}`);
    }

    const data = await response.json();
    return data.choices[0]?.message?.content || "";
  }

  private parseJsonResponse(text: string): any {
    try {
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
      return JSON.parse(text);
    } catch (error) {
      console.error("Failed to parse JSON response:", text);
      throw new Error("Invalid JSON response from DeepSeek");
    }
  }

  async generateWritingEvaluation(prompts: any[]): Promise<any[]> {
    const scores = [];
    
    for (const prompt of prompts) {
      try {
        const evaluationPrompt = `
Evaluate this writing response on a scale of 1-5 based on clarity, relevance, grammar, and depth.

PROMPT: ${prompt.prompt}
RESPONSE: ${prompt.response}

Return your evaluation as JSON:
{
  "score": [1-5 number],
  "feedback": "specific feedback explaining the score"
}
`;

        const text = await this.makeRequest(evaluationPrompt, 0.1);
        const result = this.parseJsonResponse(text);
        
        scores.push({
          score: Math.min(5, Math.max(1, result.score || 1)),
          feedback: result.feedback || "No feedback provided"
        });
      } catch (error) {
        console.error("Error evaluating prompt with DeepSeek:", error);
        scores.push({ score: 0, feedback: "Evaluation failed" });
      }
    }
    
    return scores;
  }

  async generateCandidateSummary(assessmentData: any): Promise<string> {
    const prompt = `
Generate a professional candidate summary based on this assessment data:

Position: ${assessmentData.candidatePosition || "Not specified"}
Aptitude Score: ${assessmentData.aptitudeScore || 0}/${assessmentData.aptitudeTotal || 0}
Writing Score: ${assessmentData.overallWritingScore || 0}/5

Writing Responses:
${assessmentData.completedPrompts?.map((p: any, i: number) => `${i + 1}. ${p.prompt}\nResponse: ${p.response}`).join('\n\n') || 'No writing responses'}

Provide a 2-3 paragraph professional summary of the candidate's performance and capabilities.
`;

    return await this.makeRequest(prompt, 0.3);
  }

  async generateStrengthsAndWeaknesses(assessmentData: any): Promise<{ strengths: string[], weaknesses: string[] }> {
    const prompt = `
Analyze this assessment data and identify strengths and weaknesses:

Position: ${assessmentData.candidatePosition || "Not specified"}
Aptitude Score: ${assessmentData.aptitudeScore || 0}/${assessmentData.aptitudeTotal || 0}
Writing Score: ${assessmentData.overallWritingScore || 0}/5

Return as JSON:
{
  "strengths": ["strength 1", "strength 2", "strength 3"],
  "weaknesses": ["weakness 1", "weakness 2", "weakness 3"]
}
`;

    const text = await this.makeRequest(prompt, 0.2);
    const result = this.parseJsonResponse(text);
    
    return {
      strengths: result.strengths || ["Assessment data insufficient for analysis"],
      weaknesses: result.weaknesses || ["Assessment data insufficient for analysis"]
    };
  }

  async generateDetailedWritingAnalysis(assessmentData: any): Promise<any> {
    const prompt = `
Analyze the writing samples and provide detailed analysis:

${assessmentData.completedPrompts?.map((p: any, i: number) => `PROMPT ${i + 1}: ${p.prompt}\nRESPONSE: ${p.response}\n---`).join('\n') || 'No writing samples'}

Return as JSON:
{
  "writingStyle": "analysis of writing style",
  "vocabularyLevel": "vocabulary assessment", 
  "criticalThinking": "critical thinking analysis",
  "strengthAreas": ["strength 1", "strength 2"],
  "improvementAreas": ["area 1", "area 2"]
}
`;

    const text = await this.makeRequest(prompt, 0.2);
    return this.parseJsonResponse(text);
  }

  async generatePersonalityInsights(assessmentData: any): Promise<any> {
    const prompt = `
Analyze communication patterns from writing samples:

${assessmentData.completedPrompts?.map((p: any, i: number) => `PROMPT ${i + 1}: ${p.prompt}\nRESPONSE: ${p.response}\n---`).join('\n') || 'No writing samples'}

Return as JSON:
{
  "insights": [
    {
      "trait": "communication trait",
      "description": "detailed description with evidence",
      "confidence": 85
    }
  ]
}
`;

    const text = await this.makeRequest(prompt, 0.2);
    return this.parseJsonResponse(text);
  }

  async generateInterviewQuestions(assessmentData: any): Promise<any> {
    const prompt = `
Generate interview questions based on assessment performance:

Position: ${assessmentData.candidatePosition || "Not specified"}
Aptitude: ${assessmentData.aptitudeScore || 0}/${assessmentData.aptitudeTotal || 0}
Writing: ${assessmentData.overallWritingScore || 0}/5

Return as JSON:
{
  "questions": [
    {
      "question": "specific question",
      "rationale": "why this question based on assessment",
      "category": "category"
    }
  ]
}
`;

    const text = await this.makeRequest(prompt, 0.3);
    return this.parseJsonResponse(text);
  }

  async generateProfileMatch(assessmentData: any): Promise<any> {
    const prompt = `
Compare candidate performance with role requirements:

Position: ${assessmentData.candidatePosition || "Not specified"}
Aptitude: ${assessmentData.aptitudeScore || 0}/${assessmentData.aptitudeTotal || 0} (${Math.round((assessmentData.aptitudeScore || 0) / (assessmentData.aptitudeTotal || 1) * 100)}%)
Writing: ${assessmentData.overallWritingScore || 0}/5 (${Math.round((assessmentData.overallWritingScore || 0) / 5 * 100)}%)

Return as JSON:
{
  "position": "${assessmentData.candidatePosition || "Not specified"}",
  "matchPercentage": 75,
  "keyMatches": ["match 1", "match 2"],
  "keyGaps": ["gap 1", "gap 2"]
}
`;

    const text = await this.makeRequest(prompt, 0.3);
    return this.parseJsonResponse(text);
  }

  async generateAptitudeAnalysis(assessmentData: any): Promise<any> {
    const aptitudePercentage = Math.round((assessmentData.aptitudeScore || 0) / (assessmentData.aptitudeTotal || 1) * 100);
    
    const prompt = `
Analyze aptitude performance:

Score: ${assessmentData.aptitudeScore || 0}/${assessmentData.aptitudeTotal || 0} (${aptitudePercentage}%)
Position: ${assessmentData.candidatePosition || "Not specified"}

Return as JSON:
{
  "performance": "performance assessment with score reference",
  "strengthCategories": ["strength 1", "strength 2"],
  "weaknessCategories": ["weakness 1", "weakness 2"], 
  "recommendations": ["recommendation 1", "recommendation 2"]
}
`;

    const text = await this.makeRequest(prompt, 0.2);
    return this.parseJsonResponse(text);
  }
}
