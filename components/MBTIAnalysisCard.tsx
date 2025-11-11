/**
 * @file MBTIパーソナリティ分析の結果を表示するカードコンポーネント。
 * 推定されたMBTIタイプと、各指標の傾向をスライダーで可視化します。
 */
import React from 'react';
import { MBTIScores } from '../types/types';
import { InformationCircleIcon } from './Icons';
import SkeletonLoader from './SkeletonLoader';
import Tooltip from './Tooltip';
import ReportButton from './ReportButton';

const mbtiInfo: Record<
  string,
  { name: string; description: string; colorClass: string }
> = {
  ISTJ: { name: '管理者', description: '実用的で事実に基づき、信頼性が高い。', colorClass: 'mbti-tag-gray' },
  ISFJ: { name: '擁護者', description: '献身的で心温かく、人々を守る。', colorClass: 'mbti-tag-cyan' },
  INFJ: { name: '提唱者', description: '静かで神秘的だが、非常に感動的な理想主義者。', colorClass: 'mbti-tag-green' },
  INTJ: { name: '建築家', description: '想像力豊かで戦略的な思考家。', colorClass: 'mbti-tag-purple' },
  ISTP: { name: '巨匠', description: '大胆で実践的な実験者。', colorClass: 'mbti-tag-slate' },
  ISFP: { name: '冒険家', description: '柔軟で魅力的な芸術家。', colorClass: 'mbti-tag-yellow' },
  INFP: { name: '仲介者', description: '詩的で親切な利他主義者。', colorClass: 'mbti-tag-teal' },
  INTP: { name: '論理学者', description: '知識への渇望を持つ独創的な発明家。', colorClass: 'mbti-tag-indigo' },
  ESTP: { name: '起業家', description: '賢く、エネルギッシュで、非常に知覚が鋭い人々。', colorClass: 'mbti-tag-red' },
  ESFP: { name: 'エンターテイナー', description: '自発的で、エネルギッシュで、熱心な人々。', colorClass: 'mbti-tag-orange' },
  ENFP: { name: '運動家', description: '熱心で創造的で社交的な自由人。', colorClass: 'mbti-tag-lime' },
  ENTP: { name: '討論者', description: '賢くて好奇心旺盛な思想家。', colorClass: 'mbti-tag-amber' },
  ESTJ: { name: '幹部', description: '優れた管理者。', colorClass: 'mbti-tag-sky' },
  ESFJ: { name: '領事', description: '思いやりがあり、社交的で人気がある人々。', colorClass: 'mbti-tag-rose' },
  ENFJ: { name: '主人公', description: 'カリスマ性があり、人々を惹きつけるリーダー。', colorClass: 'mbti-tag-emerald' },
  ENTJ: { name: '指揮官', description: '大胆で想像力豊かで意志が強いリーダー。', colorClass: 'mbti-tag-blue' },
};

const MBTIAnalysisCard: React.FC<{
  mbtiType: string | null;
  scores: MBTIScores | null;
  isLoading: boolean;
  onClickReport: () => void;
}> = ({ mbtiType, scores, isLoading, onClickReport }) => {
  const info = mbtiType ? mbtiInfo[mbtiType.toUpperCase()] : null;

  const dimensions = [
    { key: 'ei', label: '興味関心の方向', left: { type: 'I', name: '内向型' }, right: { type: 'E', name: '外向型' } },
    { key: 'sn', label: 'ものの見方', left: { type: 'N', name: '直感型' }, right: { type: 'S', name: '感覚型' } },
    { key: 'tf', label: '判断の仕方', left: { type: 'F', name: '感情型' }, right: { type: 'T', name: '思考型' } },
    { key: 'jp', label: '外界への接し方', left: { type: 'P', name: '知覚型' }, right: { type: 'J', name: '判断型' } },
  ];

  const MBTISlider: React.FC<{ value: number }> = ({ value }) => {
    const percentage = (value + 100) / 2;
    return (
      <div className="mbti-slider">
        <div className="mbti-slider-bar"></div>
        <div className="mbti-slider-handle" style={{ left: `${percentage}%` }}></div>
      </div>
    );
  };

  return (
    <div className="mbti-card">
      <div className="mbti-card-body">
        <div className="mbti-header">
          <h3 className="mbti-title">MBTIパーソナリティ分析</h3>
          <Tooltip text="4つの指標に基づいて16タイプに分類し、あなたの思考・行動傾向を可視化します。">
            <InformationCircleIcon className="icon-info" />
          </Tooltip>
        </div>

        {isLoading ? (
          <div className="mbti-loading">
            <SkeletonLoader className="skeleton-title" />
            {[...Array(4)].map((_, i) => (
              <div key={i} className="mbti-skeleton-line">
                <SkeletonLoader className="skeleton-label" />
                <SkeletonLoader className="skeleton-bar" />
              </div>
            ))}
          </div>
        ) : info && mbtiType && scores ? (
          <div className="mbti-content">
            <div className={`mbti-tag ${info.colorClass}`}>
              {mbtiType.toUpperCase()} - {info.name}
            </div>
            <p className="mbti-description">{info.description}</p>

            <div className="mbti-dimensions">
              {dimensions.map((dim) => (
                <div key={dim.key} className="mbti-dimension">
                  <p className="mbti-dim-label">{dim.label}</p>
                  <div className="mbti-dim-flex">
                    <div className="mbti-side">
                      <p className="mbti-side-type">{dim.left.type}</p>
                      <p className="mbti-side-name">{dim.left.name}</p>
                    </div>
                    <MBTISlider value={scores[dim.key as keyof MBTIScores]} />
                    <div className="mbti-side">
                      <p className="mbti-side-type">{dim.right.type}</p>
                      <p className="mbti-side-name">{dim.right.name}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <p className="mbti-empty">まだ分析できません。もう少し日記を書いてみましょう。</p>
        )}
      </div>

      <ReportButton onClick={onClickReport} disabled={isLoading || !mbtiType} />
    </div>
  );
};

export default MBTIAnalysisCard;
