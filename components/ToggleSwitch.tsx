/**
 * @file オン/オフを切り替えるための、再利用可能なトグルスイッチUIコンポーネント。
 */
import React from 'react';

interface ToggleSwitchProps {
  label: string;
  enabled: boolean;
  onChange: (enabled: boolean) => void;
}

const ToggleSwitch: React.FC<ToggleSwitchProps> = ({ label, enabled, onChange }) => {
  return (
    <div className="toggle">
      <span className="toggle-label">{label}</span>
      <button
        onClick={() => onChange(!enabled)}
        className={`toggle-button ${enabled ? 'on' : 'off'}`}
        aria-pressed={enabled}
      >
        <span className={`toggle-handle ${enabled ? 'on' : 'off'}`} />
      </button>
    </div>
  );
};

export default ToggleSwitch;
