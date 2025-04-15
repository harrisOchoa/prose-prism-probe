
export const GEMINI_API_KEY = "AIzaSyApWiYP8pkZKNMrCDKmdbRJVoiWUCANow0";
export const GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent";

export const makeGeminiRequest = async (promptTemplate: string, temperature: number = 0.3) => {
  try {
    const apiResponse = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
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
          temperature,
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
    
    if (!data.candidates?.[0]?.content?.parts?.[0]?.text) {
      throw new Error("Invalid API response structure");
    }

    return data.candidates[0].content.parts[0].text;
  } catch (error) {
    console.error("Gemini API request failed:", error);
    throw error;
  }
};

export const parseJsonResponse = (text: string) => {
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    throw new Error("Failed to extract JSON from response");
  }
  try {
    return JSON.parse(jsonMatch[0]);
  } catch (error) {
    console.error("Error parsing JSON:", error);
    throw new Error("Error parsing analysis results");
  }
};
