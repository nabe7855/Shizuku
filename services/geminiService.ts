/**
 * @file Google Gemini APIクライアントの初期化とチャットセッションの管理を行います。
 * @description シングルトンパターンでGeminiチャットセッションを提供します。
 */

import { GoogleGenerativeAI, GenerativeModel, ChatSession } from "@google/generative-ai";

// === 環境変数チェック ===
const GEMINI_API_KEY = process.env.GOOGLE_API_KEY;
if (!GEMINI_API_KEY) {
  console.warn("⚠ GOOGLE_API_KEY が設定されていません。Gemini AI機能は無効になります。");
}

// === クライアント初期化 ===
export const aiClient: GoogleGenerativeAI | null = GEMINI_API_KEY
  ? new GoogleGenerativeAI(GEMINI_API_KEY)
  : null;

// === モデルとチャットセッション ===
let model: GenerativeModel | null = null;
let chat: ChatSession | null = null;

/**
 * Geminiチャットセッションを取得または作成する。
 * @returns ChatSession または null
 */
export const getChatSession = (): ChatSession | null => {
  if (!aiClient) {
    console.error("❌ Geminiクライアントが初期化されていません。APIキーを確認してください。");
    return null;
  }

  // モデル初期化（初回のみ）
  if (!model) {
    model = aiClient.getGenerativeModel({
      model: "gemini-2.0-flash-exp", // ✅ 最新安定モデル
    });
    console.log("🧠 Geminiモデル初期化完了: gemini-2.0-flash-exp");
  }

  // 既にチャットセッションが存在する場合は再利用
  if (chat) return chat;

  // 新しいチャットセッションを開始
  chat = model.startChat({
    history: [], // 必要に応じて過去履歴を保持可能
    generationConfig: {
      maxOutputTokens: 2048,
      temperature: 0.8,
    },
  });

  console.log("💬 新しいGeminiチャットセッションを開始しました。");
  return chat;
};
