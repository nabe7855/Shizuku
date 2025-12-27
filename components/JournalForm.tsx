"use client";
/**
 * @file 新規の日記エントリーを作成するフォームコンポーネント。
 * BEATフレームワーク（Body, Emotion, Action, Thought）に基づいた入力フィールドを提供。
 * 音声入力・画像アップロード対応。
 */

// ✅ 型定義を追加（TypeScriptエラー対策）
declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

import React, { useEffect, useRef, useState } from "react";
import { JournalFormData } from "../types/types";
import AutoResizingTextarea from "./AutoResizingTextarea";
import {
  CloseIcon,
  ImageIcon,
  MicrophoneIcon,
  SparklesIcon,
  XCircleIcon,
} from "./Icons";

interface JournalFormProps {
  onSave: (entry: JournalFormData) => void;
  onClose: () => void;
  isLoading: boolean;
}

const JournalForm: React.FC<JournalFormProps> = ({
  onSave,
  onClose,
  isLoading,
}) => {
  const [formData, setFormData] = useState<JournalFormData>({
    body: "",
    emotion: "",
    action: "",
    thought: "",
    image: undefined,
  });
  const [isListening, setIsListening] = useState<keyof JournalFormData | null>(
    null
  );
  const [interimTranscript, setInterimTranscript] = useState<string>("");
  const [isSpeechSupported, setIsSpeechSupported] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const recognitionRef = useRef<any>(null);

  // ✅ ブラウザ環境でのみSpeechRecognitionを初期化
  useEffect(() => {
    if (typeof window === "undefined") return;

    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (SpeechRecognition) {
      setIsSpeechSupported(true);
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.lang = "ja-JP";
      recognition.interimResults = true;
      recognitionRef.current = recognition;
    }
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        alert("画像サイズは2MB以下にしてください。");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData((prev) => ({ ...prev, image: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    setFormData((prev) => ({ ...prev, image: undefined }));
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const stopRecognition = () => {
    if (isSpeechSupported && recognitionRef.current && isListening) {
      recognitionRef.current.stop();
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    stopRecognition();
    if (
      Object.values(formData)
        .slice(0, 4)
        .some((v) => typeof v === "string" && v.trim() === "")
    ) {
      alert("画像以外のすべての項目を入力してください。");
      return;
    }
    onSave(formData);
  };

  const handleClose = () => {
    stopRecognition();
    onClose();
  };

  const formFields = [
    {
      name: "body",
      label: "Body (身体)",
      placeholder: "今、身体はどんな感じ？...",
    },
    {
      name: "emotion",
      label: "Emotion (感情)",
      placeholder: "どんな感情を経験している？...",
    },
    {
      name: "action",
      label: "Action (行動)",
      placeholder: "何をした、または何をする？...",
    },
    {
      name: "thought",
      label: "Thought (思考)",
      placeholder: "どんな考えが頭に浮かんでいる？...",
    },
  ] as const;

  const toggleListening = (fieldName: keyof JournalFormData) => {
    const recognition = recognitionRef.current;
    if (!recognition) return;

    if (isListening === fieldName) {
      recognition.stop();
      setIsListening(null);
    } else {
      if (isListening) recognition.stop();
      setIsListening(fieldName);
      setInterimTranscript("");
      recognition.start();
    }
  };

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
      if (isListening && final) {
        setFormData((prev) => {
          const current = prev[isListening] as string;
          return { ...prev, [isListening]: `${current} ${final.trim()}` };
        });
        setInterimTranscript("");
      }
    };
    recognition.onend = () => {
      setIsListening(null);
      setInterimTranscript("");
    };
    recognition.onerror = () => setIsListening(null);

    return () => recognition.stop();
  }, [isListening, isSpeechSupported]);

  return (
    <div className="entry-form-overlay" onClick={handleClose}>
      <div className="entry-form" onClick={(e) => e.stopPropagation()}>
        {/* ヘッダー */}
        <div className="entry-form-header">
          <h2 className="entry-form-title">新規作成</h2>
          <button onClick={handleClose} className="entry-form-close">
            <CloseIcon className="icon-close" />
          </button>
        </div>

        {/* フォーム */}
        <form onSubmit={handleSubmit} className="entry-form-body">
          {formFields.map((field) => (
            <div key={field.name} className="entry-field">
              <div className="entry-field-header">
                <label htmlFor={field.name} className="entry-field-label">
                  {field.label}
                </label>
                <span className="entry-field-count">
                  {(formData[field.name] as string).length} 文字
                </span>
              </div>

              <div className="entry-textarea-wrapper">
                <AutoResizingTextarea
                  id={field.name}
                  name={field.name}
                  value={formData[field.name] as string}
                  onChange={handleChange}
                  placeholder={field.placeholder}
                  disabled={isLoading}
                  className="entry-textarea"
                />
                {isSpeechSupported && (
                  <button
                    type="button"
                    onClick={() => toggleListening(field.name)}
                    className={`entry-mic-btn ${
                      isListening === field.name ? "active" : ""
                    }`}
                  >
                    <MicrophoneIcon className="entry-mic-icon" />
                  </button>
                )}
              </div>

              {isListening === field.name && (
                <div className="entry-interim">
                  {interimTranscript ? (
                    <span className="entry-interim-text">
                      {interimTranscript}
                    </span>
                  ) : (
                    <span className="entry-interim-placeholder">
                      聞き取っています...
                    </span>
                  )}
                </div>
              )}
            </div>
          ))}

          {/* 画像アップロード */}
          <div className="entry-image-upload">
            <label className="entry-image-label">Image (任意)</label>
            {formData.image ? (
              <div className="entry-image-preview">
                <img
                  src={formData.image}
                  alt="Preview"
                  className="entry-image"
                />
                <button
                  type="button"
                  onClick={handleRemoveImage}
                  className="entry-image-remove"
                >
                  <XCircleIcon className="entry-image-remove-icon" />
                </button>
              </div>
            ) : (
              <label htmlFor="image-upload" className="entry-upload-area">
                <div className="entry-upload-inner">
                  <ImageIcon className="entry-upload-icon" />
                  <p className="entry-upload-title">クリックしてアップロード</p>
                  <p className="entry-upload-sub">PNG, JPG, GIF (最大2MB)</p>
                </div>
                <input
                  id="image-upload"
                  type="file"
                  accept="image/*"
                  ref={fileInputRef}
                  className="hidden"
                  onChange={handleImageChange}
                />
              </label>
            )}
          </div>

          {/* 送信ボタン */}
          <div className="entry-form-submit">
            <button
              type="submit"
              disabled={isLoading}
              className="entry-save-btn"
            >
              {isLoading ? (
                <>
                  <span className="entry-spinner"></span>
                  分析中...
                </>
              ) : (
                <>
                  <SparklesIcon className="entry-save-icon" />
                  保存して分析
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default JournalForm;
