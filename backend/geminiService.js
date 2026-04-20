const { GoogleGenAI } = require("@google/genai");
const dotenv = require("dotenv");

dotenv.config();

const API_KEY = process.env.GEMINI_API_KEY;

if (!API_KEY) {
    throw new Error("GEMINI_API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: API_KEY });

const model = 'gemini-2.5-flash';

const systemInstruction = `You are a STRICT HTML/React Code Generator. Follow ABSOLUTE RULES:

RESPONSE FORMAT (MANDATORY):
1. Return ONLY valid HTML or React code - NOTHING ELSE
2. NO explanations, NO comments, NO markdown
3. NO text before or after the code
4. NO "here is the code", NO descriptions
5. NO line numbers, NO code blocks, NO backticks

CODE REQUIREMENTS:
- Generate complete, executable HTML with Tailwind CSS only
- Include <!DOCTYPE html>, <html>, <head>, <body> if HTML
- All styling MUST be inline or in <style> tags with Tailwind
- Code MUST work directly in an iframe
- NO external dependencies except Tailwind CDN
- NO JavaScript imports or complex modules

EXAMPLE OUTPUT (exactly like this):
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>UI</title>
    <script src="https://cdn.tailwindcss.com"></script>
</head>
<body>
    <!-- Your HTML here -->
</body>
</html>

CRITICAL: Start with <!DOCTYPE or <html immediately. Output ONLY code.`;

const getPromptResponse = async (prompt="Generate ui for homepage of hotel booking website") => {
    try {
        console.log('Gemini service: calling API with prompt length:', prompt.length);
        const response = await ai.models.generateContent({
            model,
            contents: [{
                role: "user",
                parts: [{
                    text: prompt
                }]
            }],
            systemInstruction,
        });
        console.log('Gemini API response received');
        
        // Attempt to locate the generated HTML text across possible response shapes.
        const getTextFromResponse = (resp) => {
            if (!resp) return "";

            // Common response shapes observed in different versions of the SDK / API.
            const candidatesText = resp?.candidates?.[0]?.content?.parts?.[0]?.text;
            if (candidatesText) return candidatesText;

            const legacyText = resp?.text;
            if (legacyText) return legacyText;

            const outputText = resp?.output_text;
            if (outputText) return outputText;

            const outputContentText = resp?.output?.[0]?.content?.[0]?.text;
            if (outputContentText) return outputContentText;

            // Fallback to a stringified version (for debugging / logs) if present.
            if (typeof resp === "string") return resp;

            return "";
        };

        let generatedText = getTextFromResponse(response);

        // If the response is still empty, dump the raw response to help with debugging.
        if (!generatedText) {
            console.error("Gemini response had no text. Raw response:", JSON.stringify(response, null, 2));
            throw new Error("Empty response from Gemini API");
        }

        // ==================== AGGRESSIVE CODE EXTRACTION ====================
        // Remove markdown code blocks if present
        generatedText = generatedText.replace(/```html\n?/g, "").replace(/```jsx\n?/g, "").replace(/```\n?/g, "");

        // Extract content between <!DOCTYPE or <html tags
        let codeMatch = generatedText.match(/<!DOCTYPE[\s\S]*?<\/html>/i);
        if (codeMatch) {
            generatedText = codeMatch[0];
        } else {
            // Fallback: try to find <html> ... </html>
            codeMatch = generatedText.match(/<html[\s\S]*?<\/html>/i);
            if (codeMatch) {
                generatedText = codeMatch[0];
            }
        }

        // Remove common explanatory text patterns
        const removePhrases = [
            /Here's the code:?[\s\n]*/gi,
            /Here's a complete[\s\S]*?:[\s\n]*/gi,
            /This creates[\s\S]*?[\n\r]/gi,
            /The code[\s\S]*?:[\s\n]*/gi,
            /Below is[\s\S]*?:[\s\n]*/gi,
            /I've created[\s\S]*?[\n\r]/gi,
            /This HTML[\s\S]*?[\n\r]/gi,
            /^[^<]*Before the code/gi,
            /Note:[\s\S]*?[\n\r]/gi,
            /---[\s\n]*/g,
        ];

        removePhrases.forEach(phrase => {
            generatedText = generatedText.replace(phrase, "");
        });

        generatedText = generatedText.trim();

        // Ensure it starts with < (HTML tag)
        if (!generatedText.startsWith("<")) {
            // Find the first < and extract from there
            const firstTagIndex = generatedText.indexOf("<");
            if (firstTagIndex !== -1) {
                generatedText = generatedText.substring(firstTagIndex);
            }
        }

        // Ensure it ends with >
        if (!generatedText.endsWith(">")) {
            const lastTagIndex = generatedText.lastIndexOf(">");
            if (lastTagIndex !== -1) {
                generatedText = generatedText.substring(0, lastTagIndex + 1);
            }
        }

        console.log("Generated content length:", generatedText.length);
        console.log("Starts with:", generatedText.substring(0, 50));
        console.log("Ends with:", generatedText.substring(Math.max(0, generatedText.length - 50)));

        if (!generatedText || generatedText.length < 100) {
            throw new Error("Generated code is too short or invalid");
        }

        return generatedText;
    } catch (error) {
        console.error("Error calling Gemini API:", error.message);
        console.error("Full error:", error);
        
        // If API is overloaded or has errors, provide a helpful error message
        if (error.status === 503 || error.message?.includes('UNAVAILABLE')) {
            throw new Error('Gemini API is currently overloaded. Please try again in a few moments.');
        }
        
        throw error;
    }
};


// getPromptResponse();

module.exports = { getPromptResponse };