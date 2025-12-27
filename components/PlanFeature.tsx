/**
 * @file アップグレード画面で、各料金プランの機能リストを表示するためのコンポーネント。
 * チェックマークアイコンとテキストを横並びに表示します。
 */
import React from 'react';
import { CheckCircleIcon } from './Icons';

interface PlanFeatureProps {
  children: React.ReactNode;
}

const PlanFeature: React.FC<PlanFeatureProps> = ({ children }) => (
  <li className="plan-feature">
    <CheckCircleIcon className="plan-feature-icon" />
    <span className="plan-feature-text">{children}</span>
  </li>
);

export default PlanFeature;
