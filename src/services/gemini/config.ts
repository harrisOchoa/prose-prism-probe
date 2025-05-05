
export const GEMINI_API_KEY = "AIzaSyApWiYP8pkZKNMrCDKmdbRJVoiWUCANow0";
export const GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent";

/**
 * Makes a request to the Gemini API with exponential backoff retry
 */
export const makeGeminiRequest = async (promptTemplate: string, temperature: number = 0.3, maxRetries: number = 3): Promise<string> => {
  let retries = 0;
  let retryDelay = 2000; // Start with a 2-second delay

  while (retries <= maxRetries) {
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

      if (apiResponse.status === 429) {
        // Rate limit error - parse the response to get retry delay if available
        const errorData = await apiResponse.json();
        console.warn("Gemini API rate limit hit:", errorData);
        
        // Check if we have a RetryInfo object with a delay
        let retryAfterSeconds = 0;
        try {
          const retryInfo = errorData.error?.details?.find((d: any) => d["@type"]?.includes("RetryInfo"));
          if (retryInfo?.retryDelay) {
            // Parse the retry delay (format might be like "53s")
            const retryDelayStr = retryInfo.retryDelay;
            retryAfterSeconds = parseInt(retryDelayStr.replace(/[^0-9]/g, ''));
          }
        } catch (parseError) {
          console.error("Error parsing retry info:", parseError);
        }
        
        // Use the suggested delay if available, otherwise use exponential backoff
        const delayMs = retryAfterSeconds > 0 ? retryAfterSeconds * 1000 : retryDelay;
        console.log(`Rate limit hit, retrying in ${delayMs/1000} seconds...`);
        
        // Wait before retrying
        await new Promise(resolve => setTimeout(resolve, delayMs));
        
        // Increase the retry delay for next attempt (exponential backoff)
        retryDelay *= 2;
        retries++;
        continue;
      }

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
      if (retries >= maxRetries) {
        console.error("Gemini API request failed after retries:", error);
        throw error;
      }
      
      console.warn(`Attempt ${retries + 1} failed, retrying in ${retryDelay/1000} seconds...`);
      await new Promise(resolve => setTimeout(resolve, retryDelay));
      retryDelay *= 2; // Exponential backoff
      retries++;
    }
  }

  throw new Error(`Failed after ${maxRetries} retries`);
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
