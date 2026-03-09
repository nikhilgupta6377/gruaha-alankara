import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

export async function getInteriorRecommendations(imageBase64, style) {
  const model = "gemini-3-flash-preview";
  
  const prompt = `Analyze this room image and provide interior design recommendations for a ${style} style. 
  Return a JSON array of furniture recommendations. Each object should have:
  - furnitureName: string
  - placementSuggestion: string
  - colorTheme: string
  - description: string`;

  const response = await ai.models.generateContent({
    model,
    contents: [
      {
        parts: [
          { text: prompt },
          {
            inlineData: {
              mimeType: "image/jpeg",
              data: imageBase64.split(",")[1] || imageBase64,
            },
          },
        ],
      },
    ],
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            furnitureName: { type: Type.STRING },
            placementSuggestion: { type: Type.STRING },
            colorTheme: { type: Type.STRING },
            description: { type: Type.STRING },
          },
          required: ["furnitureName", "placementSuggestion", "colorTheme", "description"],
        },
      },
    },
  });

  return JSON.parse(response.text || "[]");
}

export async function chatWithBuddy(message, context) {
  const chat = ai.chats.create({
    model: "gemini-3-flash-preview",
    config: {
      systemInstruction: "You are 'Buddy', an AI interior design assistant for Gruha Alankara. You help users with furniture recommendations, design tips, and booking furniture. You are friendly, creative, and professional. You can respond in English, Hindi, or Telugu if requested.",
    },
  });

  const response = await chat.sendMessage({ message });
  return response.text;
}
