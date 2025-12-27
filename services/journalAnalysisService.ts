"use server";

/**
 * @file Gemini APIを使用して、単一の日記エントリーを分析するサービス。
 * 要約、感情、タグの抽出を行います。
 */
import { GoogleGenAI, Type } from "@google/genai";
import { JournalFormData } from "../types/types";

// --- Geminiクライアント初期化 ---
if (!process.env.GOOGLE_API_KEY) {
  console.warn(
    "⚠ GOOGLE_API_KEY が設定されていません。AI分析機能は動作しません。"
  );
}

const ai = new GoogleGenAI({
  apiKey: process.env.GOOGLE_API_KEY!,
});

/**
 * 日記エントリーをGemini APIに送信し、分析結果（要約、感情、タグ）を取得します。
 * @param entry - 分析対象となる日記のフォームデータ。
 * @returns 分析結果オブジェクト { summary, emotions, tags }
 */
export const analyzeJournalEntry = async (
  entry: JournalFormData
): Promise<{ summary: string; emotions: string[]; tags: string[] }> => {
  // BEATフレームワークの4項目をAIに渡す形式でまとめる
  const fullText = `
身体: ${entry.body}
感情: ${entry.emotion}
行動: ${entry.action}
思考: ${entry.thought}
`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash-exp", // ✅ 最新安定モデル
      contents: [
        {
          role: "user",
          parts: [
            {
              text: `以下の日記エントリーを分析してください。
1. ポジティブで内省的なトーンで、1〜2文の短い要約を作成してください。
2. 主に感じられる感情を1〜2つ特定してください。
3. 内容を分類するためのキーワードタグを日本語で3〜4つ提案してください（例：仕事, 人間関係, 自己成長）。

日記エントリー:
${fullText}`,
            },
          ],
        },
      ],
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            summary: { type: Type.STRING },
            emotions: { type: Type.ARRAY, items: { type: Type.STRING } },
            tags: { type: Type.ARRAY, items: { type: Type.STRING } },
          },
          required: ["summary", "emotions", "tags"],
        },
      },
    });

    // ✅ 最新仕様：候補の中からtextを取得
    const text =
      response.candidates?.[0]?.content?.parts?.[0]?.text?.trim() ?? "";

    if (!text) {
      console.warn("⚠ Gemini APIから空のレスポンスが返されました。");
      throw new Error("Empty response");
    }

    // ✅ Markdown形式で返る場合に対応
    let jsonString = text;
    if (jsonString.startsWith("```json")) {
      jsonString = jsonString.slice(7, -3).trim();
    } else if (jsonString.startsWith("```")) {
      jsonString = jsonString.slice(3, -3).trim();
    }

    const result = JSON.parse(jsonString);

    return {
      summary: result.summary ?? "要約を生成できませんでした。",
      emotions: result.emotions ?? ["不明"],
      tags: result.tags ?? [],
    };
  } catch (error) {
    console.error("❌ Gemini APIによる日記分析に失敗:", error);
    return {
      summary: "現在、要約を生成できませんでした。",
      emotions: ["分析できません"],
      tags: [],
    };
  }
};
