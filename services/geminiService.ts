import { GoogleGenAI } from "@google/genai";
import { UserProfile, ChatMessage } from "../types";

/**
 * Generates a response from the Gemini assistant based on user query and profile.
 * Follows the latest @google/genai guidelines for model interaction.
 */
export const getAssistantResponse = async (
  query: string,
  category: string,
  userProfile: UserProfile,
  history: ChatMessage[]
): Promise<{ text: string; sources: Array<{ title: string; uri: string }> }> => {
  try {
    // Initializing the AI client within the function scope to ensure the latest API key is used.
    // Named parameter 'apiKey' is required.
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    // Constructing detailed user context to provide more personalized medical living advice.
    const userContext = `【用户信息】
昵称: ${userProfile.name}
癌种: ${userProfile.cancerType}
当前阶段: ${userProfile.treatmentStatus}
身体指标: 身高 ${userProfile.height || '--'}cm, 体重 ${userProfile.weight || '--'}kg
咨询专题: ${category}`;

    // Using a simplified string prompt to maximize compatibility and reduce 500 errors.
    const prompt = `${userContext}\n\n【用户提问】\n${query}`;

    // Calling the generateContent API with gemini-3-flash-preview for balanced speed and intelligence.
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        // Updated system instruction to be more explicit and formatted for pure text display.
        systemInstruction: "你是一位专业且充满同理心的抗癌管家。请始终使用中文，语调要温暖而坚定。回答结构固定为：【核心结论】、【深度解析】、【温情寄语】。禁止使用 Markdown 符号（如 #, *, -, > 等），通过自然换行进行排版。",
        temperature: 0.7,
        topP: 0.95,
        topK: 40,
        // Using thinking budget for better reasoning in Gemini 3 models if needed, 
        // but for flash-preview we keep it default/simple for speed.
      },
    });

    // Accessing .text as a property as per the latest SDK standards.
    const responseText = response.text;
    
    if (!responseText) {
      throw new Error("Received an empty response from the AI model.");
    }

    return {
      text: responseText,
      sources: [] // Search grounding can be integrated here in the future.
    };
  } catch (error: any) {
    // Detailed logging for debugging server-side issues.
    console.error("Gemini Assistant Detailed Error:", error);
    
    // Graceful error message based on common failure modes.
    let feedback = "AI 服务暂时休眠中，请稍后再试。";
    
    if (error.status === 429) {
      feedback = "当前咨询量较大，小青正在努力排队，请稍等片刻。";
    } else if (error.message?.includes('fetch') || !navigator.onLine) {
      feedback = "网络连接不稳定，请检查您的网络设置。";
    } else if (error.status === 500) {
      feedback = "服务器由于过于忙碌暂时无法响应，请稍后再问我一次。";
    }

    return { text: feedback, sources: [] };
  }
};