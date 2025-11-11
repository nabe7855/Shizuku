/**
 * @file ホバー時に補足情報を表示する、再利用可能なツールチップコンポーネント。
 */
import React from 'react';

/**
 * TooltipコンポーネントのPropsの型定義。
 * @param text - ツールチップ内に表示するテキスト。
 * @param children - ツールチップを適用する対象の要素。
 */
const Tooltip: React.FC<{ text: string; children: React.ReactNode }> = ({ text, children }) => {
  return (
    // 'group'クラスを親要素に設定し、'group-hover'で子のツールチップの表示を制御します。
    <div className="relative flex items-center group">
      {children}
      {/* ツールチップの本体。通常は非表示で、ホバー時に表示されます。 */}
      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 p-3 text-sm text-white bg-slate-700 rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10 pointer-events-none">
        {text}
        {/* ツールチップの吹き出しの矢印部分 */}
        <div className="absolute top-full left-1/2 -translate-x-1/2 w-0 h-0 border-x-4 border-x-transparent border-t-4 border-t-slate-700"></div>
      </div>
    </div>
  );
};

export default Tooltip;
