import { GoogleGenAI } from "@google/genai";

class GeminiClient {
    constructor(apiKey) {
        if (!apiKey) {
            throw new Error("API Key is required for GeminiClient");
        }
        this.client = new GoogleGenAI({ apiKey });

        // Define model priority order
        this.models = [
            "gemini-2.5-flash",
            "gemini-3-flash", // Assumed name, will fail to fallback if invalid
            "gemini-2.5-pro",
            "gemini-1.5-flash" // Last resort
        ];
    }

    /**
     * Generate content with fallback logic
     * @param {string} prompt 
     * @param {object} options - Optional config like temperature, etc.
     * @returns {Promise<string>} Generated text
     */
    async generateContent(prompt, options = {}) {
        let lastError = null;

        for (const modelName of this.models) {
            for (let attempt = 1; attempt <= 3; attempt++) {
                try {
                    // console.log(`Attempting generation with model: ${modelName} (Attempt ${attempt}/3)`);
                    const response = await this.client.models.generateContent({
                        model: modelName,
                        contents: [{ parts: [{ text: prompt }] }],
                        config: options
                    });

                    if (response && response.text) {
                        return typeof response.text === 'function' ? response.text() : response.text;
                    } else if (response && response.candidates && response.candidates[0].content.parts[0].text) {
                        return response.candidates[0].content.parts[0].text;
                    } else {
                        throw new Error(`Empty response from ${modelName}`);
                    }

                } catch (error) {
                    console.warn(`Model ${modelName} (Attempt ${attempt}/3) failed:`, error.message);
                    lastError = error;

                    if (attempt < 3) {
                        await new Promise(resolve => setTimeout(resolve, 2000)); // Wait 2s before retry
                    }
                }
            }
        }

        throw new Error(`All Gemini models failed after retries. Last error: ${lastError ? lastError.message : "Unknown error"}`);
    }

    /**
     * Generate JSON content with fallback logic
     * @param {string} prompt 
     * @param {object} options 
     * @returns {Promise<object>} Parsed JSON object
     */
    async generateJSON(prompt, options = {}) {
        const jsonPrompt = `${prompt}\n\nIMPORTANT: Respond with valid JSON only. Do not wrap in markdown code blocks.`;

        // Ensure response MIME type is set to application/json if supported by SDK/Model, 
        // but for safety with multiple models, we'll enforce via prompt and post-processing.
        const config = { ...options, responseMimeType: "application/json" };

        try {
            const textResponse = await this.generateContent(jsonPrompt, config);

            // Robust JSON extraction
            const jsonStart = textResponse.indexOf('{');
            const jsonEnd = textResponse.lastIndexOf('}');

            if (jsonStart !== -1 && jsonEnd !== -1 && jsonEnd > jsonStart) {
                const jsonString = textResponse.substring(jsonStart, jsonEnd + 1);
                return JSON.parse(jsonString);
            }

            // Fallback: try parsing the whole cleaned string if braces extraction failed (e.g. array response or plain number, though prompt asks for object)
            const cleanedText = textResponse.replace(/```json/g, '').replace(/```/g, '').trim();
            return JSON.parse(cleanedText);
        } catch (error) {
            console.error("JSON Generation failed:", error);
            console.error("Raw response was:", await this.generateContent(jsonPrompt, config).catch(() => "Could not reproduce"));
            throw error;
        }
    }
}

export default GeminiClient;
