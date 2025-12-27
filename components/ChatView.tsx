"use client";

import React, { useEffect, useRef, useState } from "react";
import { chatWithAI, generateChatReport } from "../services/chatAIService";
import { ChatMessage, JournalEntry, User } from "../types/types";
import { MicrophoneIcon, SparklesIcon } from "./Icons";

interface ChatViewProps {
  entries: JournalEntry[];
  onSaveReport: (report: string) => void;
  hasTodaysEntry: boolean;
  user: User;
}

// ✅ 型定義（ブラウザ専用）
declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

const ChatView: React.FC<ChatViewProps> = ({
  entries,
  onSaveReport,
  hasTodaysEntry,
  user,
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [report, setReport] = useState<string | null>(null);
  const [isReportLoading, setIsReportLoading] = useState(false);
  const [isReportSaved, setIsReportSaved] = useState(false);

  const [isListening, setIsListening] = useState(false);
  const [interimTranscript, setInterimTranscript] = useState("");
  const [isSpeechSupported, setIsSpeechSupported] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);

  const latestEntry = entries.length > 0 ? entries[0] : null;

  const journalContext = entries
    .slice(0, 15)
    .map((e) => `${e.createdAt.toLocaleDateString("ja-JP")}: ${e.summary}`)
    .join("\n");

  // ✅ 音声認識の初期化を「ブラウザ環境でのみ」実行
  useEffect(() => {
    // window がない SSR ではスキップ
    if (typeof window === "undefined") return;

    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) return;

    setIsSpeechSupported(true);
    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.lang = "ja-JP";
    recognition.interimResults = true;
    recognitionRef.current = recognition;
  }, []);

  // 初回メッセージ設定
  useEffect(() => {
    if (messages.length === 0) {
      setMessages([
        {
          role: "model",
          content: `こんにちは、${
            user.name || "さん"
          }。私はShizuku、あなたのマインドフルネスパートナーです。何かお話ししたいことはありますか？`,
        },
      ]);
    }
  }, []);

  // スクロール追従
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, report, interimTranscript]);

  const stopRecognition = () => {
    if (isSpeechSupported && recognitionRef.current && isListening) {
      recognitionRef.current.stop();
    }
  };

  // ✅ メッセージ送信
  const sendMessage = async (messageContent: string) => {
    if (!messageContent.trim() || isLoading) return;
    stopRecognition();

    const userMessage: ChatMessage = { role: "user", content: messageContent };
    const historyForAPI = messages.map((msg) => ({
      role: msg.role,
      parts: [{ text: msg.content }],
    }));

    setMessages((prev) => [...prev, userMessage]);
    setIsLoading(true);

    try {
      const aiResponse = await chatWithAI(
        journalContext,
        historyForAPI,
        messageContent,
        user
      );
      setMessages((prev) => [...prev, { role: "model", content: aiResponse }]);
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: "model", content: "エラーが発生しました。" },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(input);
    setInput("");
  };

  const handleLatestEntryClick = () => {
    if (!latestEntry || isLoading) return;
    const prompt = `私の最新の日記の要約は「${latestEntry.summary}」です。これについて、深く考えるきっかけになるような質問を1つしてください。`;
    sendMessage(prompt);
  };

  const handleGenerateReport = async () => {
    setIsReportLoading(true);
    const generatedReport = await generateChatReport(messages);
    setReport(generatedReport);
    setIsReportLoading(false);
  };

  const handleSaveReport = () => {
    if (report && hasTodaysEntry) {
      onSaveReport(report);
      setIsReportSaved(true);
    }
  };

  // ✅ 音声認識トグル
  const toggleListening = () => {
    const recognition = recognitionRef.current;
    if (!recognition) return;

    if (isListening) {
      recognition.stop();
    } else {
      setIsListening(true);
      setInterimTranscript("");
      recognition.start();
    }
  };

  // ✅ onresult イベントの登録
  useEffect(() => {
    const recognition = recognitionRef.current;
    if (!isSpeechSupported || !recognition) return;

    recognition.onresult = (event: any) => {
      let interim = "";
      let final = "";
      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) final += event.results[i][0].transcript;
        else interim += event.results[i][0].transcript;
      }
      setInterimTranscript(interim);
      if (final) {
        setInput((prev) => (prev ? prev.trim() + " " : "") + final.trim());
        setInterimTranscript("");
      }
    };

    recognition.onend = () => {
      setIsListening(false);
      setInterimTranscript("");
    };

    recognition.onerror = () => {
      setIsListening(false);
      setInterimTranscript("");
    };

    return () => recognition.stop();
  }, [isSpeechSupported, isListening]);

  const userMessageCount = messages.filter((m) => m.role === "user").length;

  return (
    <div className="chat-container">
      {/* --- メッセージリスト --- */}
      <div className="chat-messages">
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`chat-message ${
              msg.role === "user" ? "chat-user" : "chat-ai"
            }`}
          >
            <div
              className={`chat-bubble ${
                msg.role === "user" ? "chat-bubble-user" : "chat-bubble-ai"
              }`}
            >
              {msg.role === "model" && i === 0 && (
                <SparklesIcon className="icon-sparkle" />
              )}
              <p>{msg.content}</p>
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="chat-ai">
            <div className="chat-bubble chat-bubble-ai">
              <div className="typing-dots">
                <span></span>
                <span></span>
                <span></span>
              </div>
            </div>
          </div>
        )}

        {!report && !isReportLoading && userMessageCount >= 2 && (
          <div className="chat-report-button">
            <button
              onClick={handleGenerateReport}
              className="btn-generate-report"
            >
              <SparklesIcon className="icon-sparkle" />
              対話のレポートを作成
            </button>
          </div>
        )}

        {isReportLoading && (
          <div className="chat-ai">
            <div className="chat-bubble chat-bubble-ai">
              <SparklesIcon className="icon-sparkle animate" />
              <span>レポートを作成中...</span>
            </div>
          </div>
        )}

        {report && (
          <div className="chat-report animate-fade-in">
            <div className="chat-report-header">
              <SparklesIcon className="icon-sparkle" />
              <h3>AIチャットレポート</h3>
            </div>
            <div className="chat-report-body">{report}</div>
            <button
              onClick={handleSaveReport}
              disabled={!hasTodaysEntry || isReportSaved}
              className={`btn-save-report ${isReportSaved ? "saved" : ""}`}
            >
              {isReportSaved ? "保存しました" : "今日の日記に保存"}
            </button>
            {!hasTodaysEntry && (
              <p className="chat-hint">
                レポートを保存するには、まず今日の日記を作成してください。
              </p>
            )}
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* --- 入力エリア --- */}
      <div className="chat-input-area">
        {latestEntry && (
          <button
            onClick={handleLatestEntryClick}
            disabled={isLoading}
            className="btn-latest-entry"
          >
            <SparklesIcon className="icon-sparkle" />
            <div>
              <p>最新の日記について話す</p>
              <span>"{latestEntry.summary}"</span>
            </div>
          </button>
        )}
        {isListening && (
          <div className="voice-transcript">
            {interimTranscript || "聞き取っています..."}
          </div>
        )}
        <form onSubmit={handleSend} className="chat-form">
          {isSpeechSupported && (
            <button
              type="button"
              onClick={toggleListening}
              className={`btn-mic ${isListening ? "active" : ""}`}
            >
              <MicrophoneIcon className="icon-mic" />
            </button>
          )}
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="メッセージを送信..."
            disabled={isLoading}
            className="chat-input"
          />
          <button
            type="submit"
            disabled={isLoading || !input.trim()}
            className="btn-send"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="icon-send"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
            </svg>
          </button>
        </form>
      </div>
    </div>
  );
};

export default ChatView;
