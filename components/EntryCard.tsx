/**
 * @file 日記一覧画面で個々のエントリーを表示するためのカードコンポーネント。
 * 日付、AIによる要約、感情ラベル、タグなどを簡潔に表示します。
 */
import React from "react";
import { JournalEntry } from "../types/types";
import { SparklesIcon } from "./Icons";

interface EntryCardProps {
  entry: JournalEntry;
  onSelect: () => void;
}

const EntryCard: React.FC<EntryCardProps> = ({ entry, onSelect }) => {
  return (
    <div className="entry-card" onClick={onSelect}>
      {/* 画像がある場合のみ表示 */}
      {"image" in entry && entry.image && (
        <img src={entry.image} alt="Journal entry" className="entry-image" />
      )}

      <div className="entry-content">
        {/* --- 日付 --- */}
        <p className="entry-date">
          {entry.createdAt.toLocaleDateString("ja-JP", {
            year: "numeric",
            month: "long",
            day: "numeric",
          })}
        </p>

        {/* --- AIによる要約 --- */}
        <div className="entry-summary">
          <SparklesIcon className="entry-icon" />
          <div>
            <h3 className="entry-summary-title">AIによる要約</h3>
            <p className="entry-summary-text">{entry.summary}</p>
          </div>
        </div>

        {/* --- 感情ラベル・タグ --- */}
        <div className="entry-labels">
          {Array.isArray(entry.emotionLabel) &&
            entry.emotionLabel.map((label) => (
              <span key={label} className="entry-emotion">
                {label}
              </span>
            ))}

          {Array.isArray(entry.tags) &&
            entry.tags.map((tag) => (
              <span key={tag} className="entry-tag">
                #{tag}
              </span>
            ))}
        </div>
      </div>
    </div>
  );
};

export default EntryCard;
