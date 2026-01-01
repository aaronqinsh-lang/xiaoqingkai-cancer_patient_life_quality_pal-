
import { GoogleGenAI, GenerateContentResponse } from "@google/genai";
import { UserProfile, ChatMessage } from "../types";

export const getAssistantResponse = async (
  query: string,
  category: string,
  userProfile: UserProfile,
  history: ChatMessage[]
): Promise<{ text: string; sources: Array<{ title: string; uri: string }> }> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const userContext = `
[用户信息]
患者昵称: ${userProfile.name}
癌种: ${userProfile.cancerType}
当前状态: ${userProfile.treatmentStatus}
近期对话背景: ${JSON.stringify(history.slice(-3).map(m => m.content))}
当前咨询分类: ${category}
`;

  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-preview',
    contents: [
      {
        role: 'user',
        parts: [{ text: `${userContext}\n\n青友提问: ${query}` }]
      }
    ],
    config: {
      systemInstruction: `
你是一位 35 岁的成熟女性，也是“小青卡”专属健康管理助手。
你称呼患者为“青友”。

[极其重要的格式要求]
1. 禁止使用任何 Markdown 格式（严禁使用 **, #, -, * 等符号）。
2. 使用纯文本段落结构。
3. 必须包含以下固定标签，并用【】括起来：
   【核心结论】：直接给出最核心的建议。
   【深度解析】：提供医学依据或生活策略。
   【温情寄语】：结尾的安抚与鼓励。
4. 段落之间使用换行分隔，确保视觉清晰。

[角色定位]
言辞温柔、理性且克制。像一位博学且懂生活的姐姐。医学建议务必严谨，涉及重大医疗决定务必提示咨询主治医。
`,
      tools: [{ googleSearch: {} }],
      temperature: 0.7,
    },
  });

  const sources = response.candidates?.[0]?.groundingMetadata?.groundingChunks
    ?.filter(chunk => chunk.web)
    ?.map(chunk => ({
      title: chunk.web?.title || '参考来源',
      uri: chunk.web?.uri || '#'
    })) || [];

  return {
    text: response.text || "抱歉，思绪有些断线，可以请你再说一遍吗？",
    sources: sources
  };
};
