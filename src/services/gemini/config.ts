
export const GEMINI_API_KEY = "AIzaSyDo5WgNl3Taqjen8a2O0pDEdFsveKQUGAo";
export const GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent";

/**
 * Makes a request to the Gemini API with exponential backoff retry
 */
export const makeGeminiRequest = async (promptTemplate: string, temperature: number = 0.3, maxRetries: number = 3): Promise<string> => {
  let retries = 0;
  let retryDelay = 2000; // Start with a 2-second delay

  console.log(`Making Gemini request with ${promptTemplate.length} chars, temperature: ${temperature}`);

  // Check if API key is valid before making any request
  if (!GEMINI_API_KEY || GEMINI_API_KEY.length < 10) {
    throw new Error("Invalid Gemini API key configuration. Please check your API key settings.");
  }

  while (retries <= maxRetries) {
    try {
      console.log(`Attempt ${retries + 1} of ${maxRetries + 1}`);
      
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
        const errorText = await apiResponse.text();
        console.error("Gemini API error:", apiResponse.status, errorText);
        
        // Log detailed error information
        try {
          const errorData = JSON.parse(errorText);
          console.error("Parsed error data:", errorData);
          
          // Check if the error is related to the API key
          if (errorData.error && errorData.error.status === 'PERMISSION_DENIED') {
            throw new Error("API key issue: Permission denied. Your Gemini API key may be invalid or restricted.");
          }
          
          if (errorData.error && errorData.error.message) {
            throw new Error(`API error: ${errorData.error.message}`);
          }
        } catch (e) {
          // If it's not JSON, just log the text
        }
        
        throw new Error(`API error ${apiResponse.status}: ${errorText.substring(0, 100)}...`);
      }

      const data = await apiResponse.json();
      console.log("Gemini API response received successfully");
      
      if (!data.candidates?.[0]?.content?.parts?.[0]?.text) {
        console.error("Invalid API response structure:", data);
        throw new Error("Invalid API response structure. The AI model returned an unexpected format.");
      }

      return data.candidates[0].content.parts[0].text;
    } catch (error) {
      console.error(`Attempt ${retries + 1} failed:`, error);
      
      if (retries >= maxRetries) {
        console.error("Gemini API request failed after all retries:", error);
        throw error;
      }
      
      console.warn(`Retrying in ${retryDelay/1000} seconds...`);
      await new Promise(resolve => setTimeout(resolve, retryDelay));
      retryDelay *= 2; // Exponential backoff
      retries++;
    }
  }

  throw new Error(`Failed after ${maxRetries} retries`);
};

export const parseJsonResponse = (text: string) => {
  try {
    // First try to parse directly in case it's already clean JSON
    return JSON.parse(text);
  } catch (error) {
    // If direct parsing fails, try to extract JSON from the text
    try {
      // Try to find JSON-like content with multiple regex patterns
      let jsonMatch = text.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        // Try alternative pattern with square brackets for arrays
        jsonMatch = text.match(/\[[\s\S]*\]/);
      }
      
      if (!jsonMatch) {
        console.error("Failed to extract JSON from response:", text);
        throw new Error("Failed to extract JSON from response");
      }
      
      return JSON.parse(jsonMatch[0]);
    } catch (innerError) {
      console.error("Error parsing extracted JSON:", innerError);
      console.error("Raw text was:", text);
      throw new Error("Error parsing analysis results");
    }
  }
};
