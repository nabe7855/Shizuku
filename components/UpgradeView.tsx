/**
 * @file 料金プラン（無料・プレミアム）を比較・表示し、アップグレードを促すためのビューコンポーネント。
 */
import React from 'react';
import { SparklesIcon } from './Icons';
import PlanFeature from './PlanFeature';

const UpgradeView: React.FC = () => {
  return (
    <div className="upgrade-view">
      {/* ヘッダー */}
      <div className="upgrade-header">
        <h1>プランを選択</h1>
        <p>あなたのマインドフルネスの旅を、さらに深く。</p>
      </div>

      <div className="plan-grid">
        {/* 無料プラン */}
        <div className="plan-card free">
          <h2>無料プラン</h2>
          <p className="desc">基本的な機能でジャーナリングを開始できます。</p>
          <p className="price">
            <span className="amount">¥0</span>
            <span className="unit">/ 月</span>
          </p>
          <button className="plan-button current" disabled>
            現在のプラン
          </button>
          <ul className="feature-list">
            <PlanFeature>日記の記録 (無制限)</PlanFeature>
            <PlanFeature>AIによる日記の要約とタグ付け</PlanFeature>
            <PlanFeature>カレンダービュー</PlanFeature>
            <PlanFeature>基本的な感情分析</PlanFeature>
          </ul>
        </div>

        {/* プレミアムプラン */}
        <div className="plan-card premium">
          <div className="badge">おすすめ</div>
          <h2>プレミアムプラン</h2>
          <p className="desc">全ての機能で、自己理解を最大限に深めます。</p>
          <p className="price">
            <span className="amount">¥580</span>
            <span className="unit">/ 月</span>
          </p>
          <button
            className="plan-button upgrade"
            onClick={() => alert('現在この機能はご利用いただけません。')}
          >
            アップグレード
          </button>
          <ul className="feature-list">
            <PlanFeature>無料プランの全機能</PlanFeature>
            <PlanFeature>AIチャットとの無制限の対話</PlanFeature>
            <PlanFeature>Big Five, MBTIなどの詳細な性格分析</PlanFeature>
            <PlanFeature>感情の長期的な傾向分析</PlanFeature>
            <PlanFeature>音声入力機能</PlanFeature>
            <li className="highlight-feature">
              <SparklesIcon className="icon" />
              <span>今後追加される全ての新機能</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default UpgradeView;
