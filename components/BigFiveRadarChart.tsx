import React from "react";
import { PersonalityTraits } from "../types/types";
import { InformationCircleIcon } from "./Icons";
import Tooltip from "./Tooltip";
import SkeletonLoader from "./SkeletonLoader";
import ReportButton from "./ReportButton";

const BigFiveRadarChart: React.FC<{
  data: PersonalityTraits | null;
  isLoading: boolean;
  onClickReport: () => void;
}> = ({ data, isLoading, onClickReport }) => {
  const size = 300;
  const center = size / 2;
  const radius = size * 0.35;
  const labels = [
    { name: "開放性", key: "openness" as keyof PersonalityTraits },
    { name: "誠実性", key: "conscientiousness" as keyof PersonalityTraits },
    { name: "外向性", key: "extraversion" as keyof PersonalityTraits },
    { name: "協調性", key: "agreeableness" as keyof PersonalityTraits },
    { name: "神経症傾向", key: "neuroticism" as keyof PersonalityTraits },
  ];

  const chartContent = () => {
    if (!data) return null;

    const points = labels
      .map((label, i) => {
        const angle = (i * 2 * Math.PI) / labels.length - Math.PI / 2;
        const value = data[label.key] / 100;
        const x = center + radius * value * Math.cos(angle);
        const y = center + radius * value * Math.sin(angle);
        return `${x},${y}`;
      })
      .join(" ");

    return (
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        {/* 背景の同心円 */}
        <g>
          {[0.25, 0.5, 0.75, 1].map((r) => (
            <circle
              key={r}
              cx={center}
              cy={center}
              r={radius * r}
              fill="none"
              stroke="#e2e8f0"
              strokeWidth="1"
            />
          ))}
        </g>
        {/* 放射線 */}
        <g>
          {labels.map((label, i) => {
            const angle = (i * 2 * Math.PI) / labels.length - Math.PI / 2;
            const x2 = center + radius * Math.cos(angle);
            const y2 = center + radius * Math.sin(angle);
            return (
              <line
                key={label.key}
                x1={center}
                y1={center}
                x2={x2}
                y2={y2}
                stroke="#e2e8f0"
                strokeWidth="1"
              />
            );
          })}
        </g>
        {/* ラベル */}
        <g>
          {labels.map((label, i) => {
            const angle = (i * 2 * Math.PI) / labels.length - Math.PI / 2;
            const x = center + (radius + 20) * Math.cos(angle);
            const y = center + (radius + 20) * Math.sin(angle);
            return (
              <text
                key={label.key}
                x={x}
                y={y}
                textAnchor="middle"
                dominantBaseline="middle"
                fontSize="12"
                fill="#64748b"
              >
                {label.name}
              </text>
            );
          })}
        </g>
        {/* 多角形 */}
        <polygon
          points={points}
          fill="rgba(20, 184, 166, 0.3)"
          stroke="#0d9488"
          strokeWidth="2"
          style={{ transition: "all 0.5s ease" }}
        />
      </svg>
    );
  };

  return (
    <div className="bigfive-card">
      <div className="bigfive-header">
        <h3 className="bigfive-title">性格特性 (Big Five)</h3>
        <Tooltip text="世界的に広く使われている性格分析モデルです。開放性、誠実性、外向性、協調性、神経症傾向の5つの次元からあなたの性格を捉えます。">
          <InformationCircleIcon className="bigfive-icon" />
        </Tooltip>
      </div>

      <div className="bigfive-chart-area">
        {isLoading ? (
          <SkeletonLoader className="bigfive-skeleton" />
        ) : (
          chartContent()
        )}
      </div>

      <ReportButton
        onClick={onClickReport}
        disabled={
          isLoading || !data || Object.values(data).every((v) => v === 0)
        }
      />
    </div>
  );
};

export default BigFiveRadarChart;
