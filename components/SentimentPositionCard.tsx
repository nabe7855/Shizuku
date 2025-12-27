/**
 * @file 過去30日間の感情の推移を「心のポジション」として折れ線グラフで可視化するコンポーネント。
 */
import React, { useMemo } from 'react';
import { JournalEntry } from '../types/types';
import { InformationCircleIcon } from './Icons';
import ReportButton from './ReportButton';
import Tooltip from './Tooltip';

const sentimentMap: { [key: string]: number } = {
  '喜び': 1, '感謝': 1, '充実感': 1, '期待': 1, '嬉しい': 1, '楽しい': 1, '幸せ': 1, '安心': 1,
  '不安': -1, '悲しい': -1, '怒り': -1, 'イライラ': -1, '疲れ': -1, '心配': -1, '後悔': -1,
  '穏やか': 0, '普通': 0, 'リラックス': 0,
};

const getSentimentScore = (emotion: string): number => {
  for (const key in sentimentMap) {
    if (emotion.includes(key)) return sentimentMap[key];
  }
  return 0;
};

interface SentimentPositionCardProps {
  entries: JournalEntry[];
  onClickReport: () => void;
}

const SentimentPositionCard: React.FC<SentimentPositionCardProps> = ({ entries, onClickReport }) => {
  const chartData = useMemo(() => {
    const dailyScores: { [date: string]: number } = {};
    const labels: string[] = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    for (let i = 29; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(today.getDate() - i);
      const dateString = date.toISOString().split('T')[0];
      labels.push(`${date.getMonth() + 1}/${date.getDate()}`);
      dailyScores[dateString] = 0;
    }

    const thirtyDaysAgo = new Date(today);
    thirtyDaysAgo.setDate(today.getDate() - 29);

    entries.forEach((entry) => {
      const entryDate = new Date(entry.createdAt);
      if (entryDate >= thirtyDaysAgo) {
        const dateString = entryDate.toISOString().split('T')[0];
        if (dailyScores.hasOwnProperty(dateString)) {
          let dayScore = 0;
          entry.emotionLabel.forEach((label) => (dayScore += getSentimentScore(label)));
          dailyScores[dateString] += dayScore;
        }
      }
    });

    let cumulativeScore = 0;
    const cumulativeData = labels.map((_, i) => {
      const date = new Date(today);
      date.setDate(today.getDate() - (29 - i));
      const dateString = date.toISOString().split('T')[0];
      cumulativeScore += dailyScores[dateString] || 0;
      return cumulativeScore;
    });

    return { labels, data: cumulativeData };
  }, [entries]);

  const minScore = Math.min(0, ...chartData.data);
  const maxScore = Math.max(5, ...chartData.data);
  const range = (maxScore - minScore) || 1;
  const hasData = entries.length > 0 && chartData.data.length > 0;

  const chartWidth = 800;
  const chartHeight = 400;
  const margin = { top: 20, right: 20, bottom: 50, left: 50 };
  const innerWidth = chartWidth - margin.left - margin.right;
  const innerHeight = chartHeight - margin.top - margin.bottom;

  const getX = (i: number) => margin.left + (i / (chartData.labels.length - 1)) * innerWidth;
  const getY = (point: number) => margin.top + innerHeight - ((point - minScore) / range) * innerHeight;

  const getPathData = (data: number[]) =>
    data.reduce((path, point, i) => (i === 0 ? `M ${getX(0)} ${getY(point)}` : `${path} L ${getX(i)} ${getY(point)}`), '');

  const getAreaPathData = (data: number[]) => {
    if (data.length < 2) return '';
    const path = getPathData(data);
    const bottomY = chartHeight - margin.bottom;
    const firstX = getX(0);
    const lastX = getX(data.length - 1);
    return `${path} L ${lastX} ${bottomY} L ${firstX} ${bottomY} Z`;
  };

  const zeroLineY = getY(0);
  const currentScore = hasData ? chartData.data[chartData.data.length - 1] : 0;

  return (
    <div className="sentiment-card">
      <div className="sentiment-header">
        <div className="sentiment-title">
          <h3>心のポジション推移 (過去30日)</h3>
          <Tooltip text="日々の感情をスコア化し、その累積で心のエネルギーの傾向を可視化します。">
            <InformationCircleIcon className="sentiment-info-icon" />
          </Tooltip>
        </div>
        {hasData && (
          <div className="sentiment-current">
            <span className="sentiment-current-label">現在値</span>
            <span
              className={`sentiment-current-value ${
                currentScore > 0 ? 'positive' : currentScore < 0 ? 'negative' : 'neutral'
              }`}
            >
              {currentScore > 0 ? '+' : ''}
              {currentScore}
            </span>
          </div>
        )}
      </div>

      {hasData ? (
        <div className="sentiment-chart-wrapper">
          <svg viewBox={`0 0 ${chartWidth} ${chartHeight}`} className="sentiment-chart">
            <defs>
              <clipPath id="clip-positive">
                <rect x={margin.left} y={margin.top} width={innerWidth} height={Math.max(0, zeroLineY - margin.top)} />
              </clipPath>
              <clipPath id="clip-negative">
                <rect x={margin.left} y={zeroLineY} width={innerWidth} height={Math.max(0, chartHeight - margin.bottom - zeroLineY)} />
              </clipPath>
              <linearGradient id="gradient-positive" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#14b8a6" stopOpacity="0.4" />
                <stop offset="100%" stopColor="#14b8a6" stopOpacity="0" />
              </linearGradient>
              <linearGradient id="gradient-negative" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#ec4899" stopOpacity="0" />
                <stop offset="100%" stopColor="#ec4899" stopOpacity="0.3" />
              </linearGradient>
            </defs>

            {/* 軸ラベルと線 */}
            <text x={margin.left - 8} y={getY(maxScore) + 4} textAnchor="end" fontSize="12" fill="#94a3b8">
              {Math.ceil(maxScore)}
            </text>
            <text x={margin.left - 8} y={getY(minScore) + 4} textAnchor="end" fontSize="12" fill="#94a3b8">
              {Math.floor(minScore)}
            </text>
            <line x1={margin.left} y1={zeroLineY} x2={chartWidth - margin.right} y2={zeroLineY} stroke="#cbd5e1" strokeDasharray="3 3" />
            <text x={margin.left - 8} y={zeroLineY + 4} textAnchor="end" fontSize="12" fill="#94a3b8">
              0
            </text>

            {/* 日付ラベル（7日ごと） */}
            {chartData.labels.map((label, i) =>
              i % 7 === 0 ? (
                <text key={i} x={getX(i)} y={chartHeight - margin.bottom + 20} textAnchor="middle" fontSize="12" fill="#94a3b8">
                  {label}
                </text>
              ) : null
            )}

            {/* 塗りと折れ線 */}
            <path d={getAreaPathData(chartData.data)} fill="url(#gradient-positive)" clipPath="url(#clip-positive)" />
            <path d={getAreaPathData(chartData.data)} fill="url(#gradient-negative)" clipPath="url(#clip-negative)" />
            <path d={getPathData(chartData.data)} fill="none" stroke="#0d9488" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
            <circle cx={getX(chartData.data.length - 1)} cy={getY(currentScore)} r="8" fill="#0d9488" fillOpacity="0.2" className="pulse" />
            <circle cx={getX(chartData.data.length - 1)} cy={getY(currentScore)} r="4" fill="#0d9488" stroke="white" strokeWidth="2" />
          </svg>
        </div>
      ) : (
        <p className="sentiment-empty">表示するデータがありません。</p>
      )}

      <ReportButton onClick={onClickReport} disabled={!hasData} />
    </div>
  );
};

export default SentimentPositionCard;
