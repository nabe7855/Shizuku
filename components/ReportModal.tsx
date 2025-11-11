/**
 * @file AIが生成した詳細レポートを表示するためのモーダルコンポーネント。
 * Markdown形式のテキストを適切なHTML要素に変換して表示します。
 */
import React, { useEffect } from 'react';
import { CloseIcon, SparklesIcon } from './Icons';
import SkeletonLoader from './SkeletonLoader';

interface ReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  content: string | null;
  isLoading: boolean;
}

const renderMarkdown = (text: string) => {
  const lines = text.split('\n').filter((line) => line.trim() !== '');
  const elements: React.ReactNode[] = [];
  let listItems: string[] = [];

  const flushList = () => {
    if (listItems.length > 0) {
      elements.push(
        <ul key={`ul-${elements.length}`} className="report-list">
          {listItems.map((item, idx) => (
            <li key={idx} className="report-list-item">
              {item}
            </li>
          ))}
        </ul>
      );
      listItems = [];
    }
  };

  lines.forEach((line, index) => {
    if (line.startsWith('### ')) {
      flushList();
      elements.push(
        <h4 key={index} className="report-heading">
          {line.substring(4)}
        </h4>
      );
    } else if (line.startsWith('* ') || line.startsWith('- ')) {
      listItems.push(line.substring(2));
    } else {
      flushList();
      elements.push(
        <p key={index} className="report-paragraph">
          {line}
        </p>
      );
    }
  });

  flushList();
  return elements;
};

const ReportModal: React.FC<ReportModalProps> = ({
  isOpen,
  onClose,
  title,
  content,
  isLoading,
}) => {
  useEffect(() => {
    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    if (isOpen) window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="report-modal-overlay" onClick={onClose}>
      <div className="report-modal" onClick={(e) => e.stopPropagation()}>
        {/* ヘッダー */}
        <div className="report-modal-header">
          <h2 className="report-modal-title">
            <SparklesIcon className="report-modal-icon" />
            {title}
          </h2>
          <button onClick={onClose} className="report-modal-close">
            <CloseIcon className="close-icon" />
          </button>
        </div>

        {/* ボディ */}
        <div className="report-modal-body">
          {isLoading ? (
            <div className="report-skeleton">
              <SkeletonLoader className="h-5 w-1/3" />
              <SkeletonLoader className="h-4 w-full" />
              <SkeletonLoader className="h-4 w-5/6" />
              <div className="pt-4 space-y-2">
                <SkeletonLoader className="h-5 w-1/2" />
                <SkeletonLoader className="h-4 w-full" />
                <SkeletonLoader className="h-4 w-4/6" />
              </div>
            </div>
          ) : content ? (
            <div className="report-content">{renderMarkdown(content)}</div>
          ) : (
            <p className="report-error">レポートの生成中にエラーが発生しました。</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default ReportModal;
