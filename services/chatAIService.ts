"use server";

/**
 * @file AIとのチャット機能に関連するサービス。
 * メッセージの送受信や、対話履歴からのレポート生成を行います。
 */
import { ChatMessage, User } from "../types/types";
import { getChatSession, aiClient } from "./geminiService";

/**
 * AIとのチャットメッセージを送受信します。
 * @param journalContext - AIが対話の文脈として使用する、過去の日記の要約。
 * @param history - これまでのチャット履歴。
 * @param newMessage - ユーザーからの新しいメッセージ。
 * @param user - 対話をパーソナライズするためのユーザー情報。
 * @returns {Promise<string>} AIからの応答メッセージ文字列のPromise。
 */
export const chatWithAI = async (
  journalContext: string,
  history: { role: "user" | "model"; parts: { text: string }[] }[],
  newMessage: string,
  user: User
): Promise<string> => {
  try {
    const chatSession = getChatSession();

    if (!chatSession) {
      console.warn("No active chat session found");
      return "AIとのセッションを開始できませんでした。もう一度お試しください。";
    }

    const isFirstUserMessage = !history.some((msg) => msg.role === "user");

    if (isFirstUserMessage) {
      const userProfile = `
ユーザープロフィール:
名前: ${user.name || "未設定"}
自己紹介: ${user.bio || "未設定"}
価値観: ${user.values?.join(", ") || "未設定"}
興味・関心: ${user.interests?.join(", ") || "未設定"}
目標: ${user.goals || "未設定"}
`;

      const initialPrompt = `あなたは「Shizuku」という名のマインドフルネスパートナーです。
ユーザーのプロフィールと過去の日記の要約に基づき、穏やかで内省的な対話を行ってください。
ユーザーの感情に寄り添い、気づきを促すような友人・メンターのように接します。

${userProfile}

以下はユーザーの日記の要約です。
---
${journalContext}
---

それでは、ユーザーからの最初のメッセージに返信してください。`;

      // ✅ 初回メッセージ（文字列として渡す）
      const response = await chatSession.sendMessage(
        `${initialPrompt}\n\nUSER: ${newMessage}`
      );

      const text: string =
        response.response?.candidates?.[0]?.content?.parts?.[0]?.text?.trim() ??
        "";
      return text;
    } else {
      // ✅ 2回目以降
      const response = await chatSession.sendMessage(newMessage);
      const text: string =
        response.response?.candidates?.[0]?.content?.parts?.[0]?.text?.trim() ??
        "";
      return text;
    }
  } catch (error) {
    console.error("Error chatting with Gemini API:", error);
    return "申し訳ありません、現在AIとの対話ができません。後ほどもう一度お試しください。";
  }
};

/**
 * チャットの対話履歴から要約レポートを生成します。
 * @param messages - レポート生成の元となるチャットメッセージの配列。
 * @returns {Promise<string>} 生成されたMarkdown形式のレポート文字列のPromise。
 */
export const generateChatReport = async (
  messages: ChatMessage[]
): Promise<string> => {
  const conversationHistory = messages
    .slice(1)
    .map((msg) => `${msg.role === "user" ? "USER" : "MODEL"}: ${msg.content}`)
    .join("\n");

  if (messages.length < 3) {
    return "レポートを作成するには、もう少し会話を続ける必要があります。";
  }

  try {
    // ✅ aiClientからモデルを取得
    if (!aiClient) {
      console.warn("⚠ Geminiクライアントが初期化されていません。");
      return "AIクライアントが初期化されていません。環境変数を確認してください。";
    }

    const model = aiClient.getGenerativeModel({
      model: "gemini-2.0-flash-exp",
    });

    // ✅ 直接文字列を渡す形式に修正
    const prompt = `
あなたは思慮深いAIアシスタントです。以下のユーザーとの対話履歴に基づき、
簡潔で洞察に満ちたレポートを作成してください。
レポートは、ユーザーが自分自身を振り返るのに役立つように、
優しく励ますようなトーンで書きます。

以下の構成で日本語のレポートを作成してください：

### 対話のテーマ
この会話の中心となったトピックや感情について1〜2文で要約します。

### 得られた気づき
対話の中から見えてきた、ユーザーにとって重要だと思われる気づきや発見を2〜3つの箇条書きでまとめます。

### 次のステップへのヒント
ユーザーがさらに内省を深めるための、具体的なアクションや問いかけを1つ提案します。

---
対話履歴:
${conversationHistory}
---
`;

    const response = await model.generateContent(prompt);

    const text: string =
      response.response?.text()?.trim() ?? "レポートを生成できませんでした。";

    return text;
  } catch (error) {
    console.error("Error generating chat report with Gemini API:", error);
    return "申し訳ありません、現在レポートを作成できませんでした。";
  }
};
