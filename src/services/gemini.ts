import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

export async function askAssistant(prompt: string) {
  if (!process.env.GEMINI_API_KEY) {
    return "يرجى تهيئة مفتاح API الخاص بـ Gemini لاستخدام هذه الميزة.";
  }

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        systemInstruction: "أنت مساعد ذكي عربي مدمج في تطبيق المساعد الذكي. ساعد المستخدم في إدارة ملاحظاته، حساباته المالية، أو تحويلات القياس. كن مختصراً وودوداً.",
      },
    });

    return response.text;
  } catch (error) {
    console.error("Gemini Error:", error);
    return "عذراً، حدث خطأ أثناء الاتصال بالمساعد الذكي.";
  }
}
