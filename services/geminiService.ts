import { GoogleGenAI } from "@google/genai";
import { DashboardStats, User, ConnectedApp } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const generateDashboardInsight = async (
  stats: DashboardStats,
  recentUsers: User[],
  apps: ConnectedApp[]
): Promise<string> => {
  try {
    const prompt = `
      You are an AI assistant for a Developer Hub Dashboard called "SnailLabs DevHub".
      
      Here is the current system snapshot:
      - Total Users: ${stats.totalUsers}
      - Pending Approvals: ${stats.pendingApprovals}
      - Active Apps: ${apps.map(a => a.name).join(', ')}
      - Recent User Activity: ${recentUsers.slice(0, 5).map(u => `${u.name} (${u.status})`).join(', ')}

      Analyze this data and provide a concise, 2-sentence executive summary of the system's health and any immediate actions required (like approving users). 
      Keep the tone professional and administrative.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
    });

    return response.text || "System analysis unavailable at this time.";
  } catch (error) {
    console.error("Failed to generate insight:", error);
    return "AI Insight module is currently offline. Please check API configuration.";
  }
};
