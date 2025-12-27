/**
 * @file 分析ビューに表示される、AIによる総合レポートカードコンポーネント。
 * Markdown形式のレポートを整形して表示します。
 */
import React from 'react';
import { SparklesIcon, InformationCircleIcon } from './Icons';
import Tooltip from './Tooltip';
import SkeletonLoader from './SkeletonLoader';

interface ComprehensiveReportCardProps {
  report: string | null;
  isLoading: boolean;
}

const ComprehensiveReportCard: React.FC<ComprehensiveReportCardProps> = ({ report, isLoading }) => {
  /**
   * 簡易Markdownレンダラー
   */
  const renderReport = (text: string) => {
    const lines = text.split('\n').filter(line => line.trim() !== '');
    const elements: React.ReactNode[] = [];
    let listItems: string[] = [];

    const flushList = () => {
      if (listItems.length > 0) {
        elements.push(
          <ul key={`ul-${elements.length}`} className="report-list">
            {listItems.map((item, idx) => (
              <li key={idx}>{item}</li>
            ))}
          </ul>
        );
        listItems = [];
      }
    };

    lines.forEach((line, index) => {
      if (line.startsWith('### ')) {
        flushList();
        elements.push(<h4 key={index} className="report-subtitle">{line.substring(4)}</h4>);
      } else if (line.startsWith('* ')) {
        listItems.push(line.substring(2));
      } else {
        flushList();
        elements.push(<p key={index} className="report-text">{line}</p>);
      }
    });

    flushList();
    return elements;
  };

  return (
    <div className="report-card">
      {/* --- ヘッダー --- */}
      <div className="report-header">
        <SparklesIcon className="icon-report-sparkle" />
        <h2 className="report-title">あなたのための総合レポート</h2>
        <Tooltip text="全ての分析を統合し、あなたへのパーソナルなフィードバックと自己成長のヒントをまとめたものです。">
          <InformationCircleIcon className="icon-report-info" />
        </Tooltip>
      </div>

      {/* --- コンテンツ --- */}
      {isLoading ? (
        <div className="report-skeleton">
          <SkeletonLoader className="skeleton-line w-3-4" />
          <SkeletonLoader className="skeleton-line w-full" />
          <SkeletonLoader className="skeleton-line w-5-6" />
          <SkeletonLoader className="skeleton-line w-1-2" />
        </div>
      ) : (
        <div className="report-body">
          {report ? renderReport(report) : <p className="report-text">レポートを生成できませんでした。</p>}
        </div>
      )}
    </div>
  );
};

export default ComprehensiveReportCard;
