/**
 * @file 「詳細レポートを見る」ための共通ボタンコンポーネント。
 */
import React from 'react';
import { DocumentTextIcon } from './Icons';

interface ReportButtonProps {
  onClick: () => void;
  disabled: boolean;
}

const ReportButton: React.FC<ReportButtonProps> = ({ onClick, disabled }) => (
  <div className="report-btn-container">
    <button
      onClick={onClick}
      disabled={disabled}
      className={`report-btn ${disabled ? 'is-disabled' : ''}`}
    >
      <DocumentTextIcon className="report-btn-icon" />
      詳細レポートを見る
    </button>
  </div>
);

export default ReportButton;
