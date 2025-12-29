import GeminiClient from "../utils/GeminiClient.js";

export const checkSpam = async (content, rating = null) => {
    try {
        const client = new GeminiClient(process.env.GEMINI_API_KEY);

        const contentDisplay = content && content.trim().length > 0 ? content : "N/A";
        const ratingDisplay = rating !== null && rating !== undefined ? `${rating}/5 sao` : "N/A";

        const prompt = `You are a content moderation AI. 
        Analyze the following comment and determine:
        1. If it is SPAM, OFFENSIVE, or INAPPROPRIATE.
        2. The SENTIMENT of the comment (POSITIVE, NEUTRAL, or NEGATIVE).
        
        Comment: "${contentDisplay}"
        Rating: ${ratingDisplay}

        Respond with a JSON object ONLY:
        {
            "isSpam": boolean,
            "reason": "short explanation",
            "sentiment": "POSITIVE" | "NEUTRAL" | "NEGATIVE"
        }`;

        const analysis = await client.generateJSON(prompt);
        console.log(`[AI Check] Content: "${contentDisplay.substring(0, 50)}${contentDisplay.length > 50 ? '...' : ''}" | Rating: ${ratingDisplay} -> Result:`, JSON.stringify(analysis));
        return analysis;

    } catch (error) {
        console.error("AI Spam Check Error:", error);
        // Fail open (allow comment if AI fails) or fail closed? 
        // Let's return isSpam: false but log error.
        return { isSpam: false, reason: "AI Error" };
    }
};
