/**
 * @file データロード中に表示される、汎用的なスケルトンローダーコンポーネント。
 * コンテンツの形状を模したプレースホルダーを表示します。
 */
import React from 'react';

interface SkeletonLoaderProps {
  /** スケルトンの追加クラス（例：幅・高さ） */
  className?: string;
}

const SkeletonLoader: React.FC<SkeletonLoaderProps> = ({ className = '' }) => {
  return <div className={`skeleton-loader ${className}`} />;
};

export default SkeletonLoader;
