/**
 * @file 分析ビューに表示される、「今月のテーマ」カードコンポーネント。
 */
import React from 'react';
import { InformationCircleIcon } from './Icons';
import SkeletonLoader from './SkeletonLoader';
import Tooltip from './Tooltip';
import ReportButton from './ReportButton';

interface MonthlyThemeCardProps {
  theme: string | null;
  isLoading: boolean;
  onClickReport: () => void;
}

const MonthlyThemeCard: React.FC<MonthlyThemeCardProps> = ({
  theme,
  isLoading,
  onClickReport,
}) => (
  <div className="theme-card">
    <div className="theme-card-body">
      <div className="theme-header">
        <h3 className="theme-title">今月のテーマ</h3>
        <Tooltip text="日記全体を貫く中心的な感情や出来事を一言で表します。">
          <InformationCircleIcon className="theme-icon" />
        </Tooltip>
      </div>

      {isLoading ? (
        <SkeletonLoader className="theme-skeleton" />
      ) : theme ? (
        <p className="theme-text">「{theme}」</p>
      ) : (
        <p className="theme-text theme-placeholder">
          AI分析を実行すると今月のテーマが表示されます。
        </p>
      )}
    </div>

    <ReportButton onClick={onClickReport} disabled={isLoading || !theme} />
  </div>
);

export default MonthlyThemeCard;
