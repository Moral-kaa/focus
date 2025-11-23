import { GoogleGenAI, Type } from "@google/genai";
import { TimerMode, SystemStatus } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const getSystemStatus = async (mode: TimerMode): Promise<SystemStatus> => {
  try {
    const prompt = mode === TimerMode.STUDY
      ? "用户正在开始高强度专注会话。你是一个先进的生产力操作系统（OS）。请生成一条技术性的、数据驱动的状态消息来鼓励专注。使用诸如“神经校准”、“延迟减少”、“优化中”、“核心处理”之类的术语。请用中文回复。"
      : "用户正在休息充电。你是一个先进的生产力操作系统。请生成关于系统冷却、缓存清理或资源再生的技术状态消息。请用中文回复。";

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        systemInstruction: "你是 FOCUS-OS v4.2。返回一个 JSON 对象。不要使用 Markdown 代码块。格式：{ \"module\": \"SYSTEM_MODULE_NAME\", \"message\": \"中文技术状态消息。\" }。保持 module 字段为英文大写技术术语，message 字段为中文。",
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            module: { type: Type.STRING },
            message: { type: Type.STRING }
          },
          required: ["module", "message"]
        }
      }
    });

    const text = response.text;
    if (!text) {
      throw new Error("Empty response from AI");
    }
    
    return JSON.parse(text) as SystemStatus;

  } catch (error) {
    console.error("Gemini API Error:", error);
    return {
      module: "KERNEL_PANIC_PREVENTION",
      message: mode === TimerMode.STUDY 
        ? "正在分配最大资源至前台任务。后台进程已挂起。" 
        : "系统冷却已激活。正在降低时钟频率以延长寿命。"
    };
  }
};