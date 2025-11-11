/**
 * @file 特定の日記エントリーの詳細情報を表示するためのモーダルコンポーネント。
 * BEATの各項目、AIによる分析結果、画像、AIチャットレポートなどを表示します。
 */
import React, { useEffect } from 'react';
import { JournalEntry } from '../types/types';
import { SparklesIcon, ChatBubbleLeftRightIcon } from './Icons';

interface JournalDetailModalProps {
  entry: JournalEntry | null;
  onClose: () => void;
}

const JournalDetailModal: React.FC<JournalDetailModalProps> = ({ entry, onClose }) => {
  useEffect(() => {
    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [onClose]);

  if (!entry) return null;

  const sections = [
    { title: 'Body (身体)', content: entry.body },
    { title: 'Emotion (感情)', content: entry.emotion },
    { title: 'Action (行動)', content: entry.action },
    { title: 'Thought (思考)', content: entry.thought },
  ];

  return (
    <div className="entry-modal-overlay" onClick={onClose}>
      <div className="entry-modal" onClick={(e) => e.stopPropagation()}>
        {/* ヘッダー */}
        <div className="entry-modal-header">
          <div>
            <h2 className="entry-modal-title">日記の詳細</h2>
            <p className="entry-modal-date">
              {entry.createdAt.toLocaleDateString('ja-JP', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </p>
          </div>
          <button onClick={onClose} className="entry-modal-close">
            <svg xmlns="http://www.w3.org/2000/svg" className="icon-close" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* コンテンツ */}
        <div className="entry-modal-body">
          {entry.image && (
            <div className="entry-image-box">
              <img src={entry.image} alt="Journal entry" className="entry-image-detail" />
            </div>
          )}

          {/* AIによる分析 */}
          <div className="entry-section">
            <div className="entry-section-header">
              <SparklesIcon className="entry-icon-teal" />
              <h3 className="entry-section-title">AIによる分析</h3>
            </div>
            <p className="entry-summary-text">{entry.summary}</p>
            <div className="entry-labels">
              {entry.emotionLabel.map(label => (
                <span key={label} className="entry-emotion">{label}</span>
              ))}
              {entry.tags?.map(tag => (
                <span key={tag} className="entry-tag">#{tag}</span>
              ))}
            </div>
          </div>

          {/* チャットレポート */}
          {entry.chatReport && (
            <div className="entry-section">
              <div className="entry-section-header">
                <ChatBubbleLeftRightIcon className="entry-icon-indigo" />
                <h3 className="entry-section-title">AIチャットレポート</h3>
              </div>
              <div className="entry-report">
                {entry.chatReport.split('\n').filter(Boolean).map((line, i) =>
                  line.startsWith('### ') ? (
                    <h4 key={i} className="entry-report-heading">{line.substring(4)}</h4>
                  ) : (
                    <p key={i} className="entry-report-text">{line}</p>
                  )
                )}
              </div>
            </div>
          )}

          {/* BEAT各項目 */}
          {sections.map(section => (
            <div key={section.title}>
              <h4 className="entry-beat-title">{section.title}</h4>
              <p className="entry-beat-content">{section.content}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default JournalDetailModal;
