"use server";

/**
 * @file 日記エントリーを横断的に分析し、長期的なパターンや洞察を抽出するサービス。
 */

import { JournalAnalysis, JournalEntry, User } from "../types/types";
import { aiClient } from "./geminiService";

/**
 * Gemini APIキーが設定されているかチェック
 */
const isGeminiEnabled = !!process.env.GOOGLE_API_KEY;

/**
 * 複数の日記エントリーの要約から、パターンと洞察を分析します。
 */
export const analyzePatternsAndInsights = async (
  entries: JournalEntry[],
  user: User
): Promise<JournalAnalysis> => {
  const fallbackResponse: JournalAnalysis = {
    keywords: [],
    coreValues: [],
    overallInsight:
      "分析するのに十分なデータがありません。日記を3つ以上書くと、より詳細な分析が見られるようになります。",
    monthlyTheme: "",
    personalityTraits: {
      openness: 0,
      conscientiousness: 0,
      extraversion: 0,
      agreeableness: 0,
      neuroticism: 0,
    },
    topStrengths: [],
    comprehensiveReport:
      "### レポート\n分析するのに十分なデータがありません。日記を3つ以上書くと、あなたのための総合レポートが読めるようになります。",
    mbtiType: "",
    mbtiScores: { ei: 0, sn: 0, tf: 0, jp: 0 },
  };

  if (entries.length < 3) return fallbackResponse;

  const journalSummaries = entries
    .slice(0, 30)
    .map((e) => `${e.createdAt.toISOString().split("T")[0]}: ${e.summary}`)
    .join("\n");

  const userProfile = `
ユーザープロフィール:
名前: ${user.name || "未設定"}
自己紹介: ${user.bio || "未設定"}
価値観: ${user.values?.join(", ") || "未設定"}
興味・関心: ${user.interests?.join(", ") || "未設定"}
目標: ${user.goals || "未設定"}
`;

  console.log("=== Gemini Debug Info ===");
  console.log(
    "🔑 GOOGLE_API_KEY:",
    process.env.GOOGLE_API_KEY ? "✅ Loaded" : "❌ Missing"
  );
  console.log(
    "🧠 AI Client:",
    aiClient ? "✅ Initialized" : "❌ Not initialized"
  );
  console.log("📦 Entries:", entries.length);
  console.log("👤 User:", user?.name || "No name");
  console.log("=========================");

  if (!isGeminiEnabled || !aiClient) {
    console.warn("⚠ GOOGLE_API_KEYが未設定のため、AI分析をスキップします。");
    return {
      ...fallbackResponse,
      overallInsight: "AI分析機能が無効化されています。",
      comprehensiveReport:
        "### レポート\n現在、AI分析機能が無効化されています。設定からAPIキーを追加してください。",
    };
  }

  try {
    const model = aiClient.getGenerativeModel({
      model: "gemini-2.0-flash-exp",
    });
    console.log("🚀 Sending request to Gemini API...");

    const prompt = `
あなたは心理学の専門家AIです。以下のユーザー情報と日記の要約リストに基づき、多角的な分析を行ってください。

${userProfile}

要約リスト:
---
${journalSummaries}
---

以下の項目を厳密なJSON形式で抽出・生成してください。
{
  "overallInsight": string,
  "monthlyTheme": string,
  "keywords": string[],
  "coreValues": string[],
  "topStrengths": string[],
  "personalityTraits": {
    "openness": number,
    "conscientiousness": number,
    "extraversion": number,
    "agreeableness": number,
    "neuroticism": number
  },
  "comprehensiveReport": string,
  "mbtiType": string,
  "mbtiScores": {
    "ei": number,
    "sn": number,
    "tf": number,
    "jp": number
  }
}
`;

    const response = await model.generateContent(prompt);
    const text = response.response?.text()?.trim() ?? "";

    if (!text) throw new Error("Empty response from Gemini API");

    console.log("📩 Raw response (first 200 chars):", text.slice(0, 200));

    // ✅ JSONブロック除去 & 安全パース
    const clean = text.replace(/```json|```/g, "").trim();

    let result: JournalAnalysis;
    try {
      result = JSON.parse(clean);
    } catch (e) {
      console.warn("⚠ JSON parse failed, fallback used.");
      return fallbackResponse;
    }

    console.log("✅ Parsed response successfully.");
    return result;
  } catch (error: any) {
    console.error("❌ Gemini分析エラー:", error?.message || error);
    console.error("📄 Stack trace:", error?.stack);
    return {
      ...fallbackResponse,
      overallInsight:
        "現在、AIによる分析を生成できませんでした（APIキーまたはモデル設定を確認してください）。",
    };
  }
};

/**
 * 詳細レポート生成関数（AnalyticsView.tsxで使用）
 */
export const generateDetailedReport = async (
  reportType:
    | "MONTHLY_THEME"
    | "BIG_FIVE"
    | "MBTI"
    | "STRENGTHS_VALUES"
    | "KEYWORDS"
    | "SENTIMENT_TREND",
  analysisData: JournalAnalysis,
  journalSummaries: string,
  user: User
): Promise<string> => {
  if (!isGeminiEnabled || !aiClient) {
    return "AIレポート生成機能が無効です。環境変数 GOOGLE_API_KEY を設定してください。";
  }

  const model = aiClient.getGenerativeModel({ model: "gemini-2.0-flash-exp" });

  const userProfile = `
ユーザープロフィール:
名前: ${user.name || "未設定"}
自己紹介: ${user.bio || "未設定"}
価値観: ${user.values?.join(", ") || "未設定"}
興味・関心: ${user.interests?.join(", ") || "未設定"}
目標: ${user.goals || "未設定"}
`;

  let prompt = `
あなたは内省支援AIです。
以下のデータに基づき、優しく励ますMarkdownレポートを作成してください。

${userProfile}

---
ユーザーの日記要約:
${journalSummaries}
---
`;

  switch (reportType) {
    case "MONTHLY_THEME":
      prompt += `今月のテーマ「${analysisData.monthlyTheme}」についてまとめてください。`;
      break;
    case "BIG_FIVE":
      prompt += `Big Fiveスコア: ${JSON.stringify(
        analysisData.personalityTraits
      )} を日本語で解釈してください。`;
      break;
    case "MBTI":
      prompt += `MBTIタイプ「${analysisData.mbtiType}」(${JSON.stringify(
        analysisData.mbtiScores
      )}) に基づいて説明してください。`;
      break;
    case "STRENGTHS_VALUES":
      prompt += `ユーザーの強み (${analysisData.topStrengths.join(
        ", "
      )}) と価値観 (${analysisData.coreValues.join(
        ", "
      )}) に基づいて内省レポートを生成してください。`;
      break;
    case "KEYWORDS":
      prompt += `最近頻出するキーワード (${analysisData.keywords.join(
        ", "
      )}) をもとに関心の傾向を解釈してください。`;
      break;
    case "SENTIMENT_TREND": // ✅ 新しく追加
      prompt += `最近の日記の感情トレンド（ポジティブ・ネガティブの変化）を要約し、気分やストレス傾向をわかりやすく説明してください。`;
      break;
  }

  try {
    console.log("🚀 Generating detailed report...");
    const response = await model.generateContent(prompt);
    const text =
      response.response?.text()?.trim() ?? "レポート生成に失敗しました。";
    console.log("✅ Detailed report generated.");
    return text;
  } catch (error) {
    console.error("❌ レポート生成エラー:", error);
    return "現在レポートを生成できませんでした。しばらくしてからお試しください。";
  }
};
