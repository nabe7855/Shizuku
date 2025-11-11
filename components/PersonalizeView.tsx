/**
 * @file AIの応答スタイルや通知設定など、アプリケーションの動作をパーソナライズするためのビューコンポーネント。
 */
import React, { useState } from 'react';
import ToggleSwitch from './ToggleSwitch';

const PersonalizeView: React.FC = () => {
  const [aiStyle, setAiStyle] = useState('フレンドリー');
  const [notifications, setNotifications] = useState({ summary: true, weekly: false });
  const [feedback, setFeedback] = useState('');

  const handleSave = () => {
    setFeedback('設定を保存しました。');
    setTimeout(() => setFeedback(''), 3000);
  };

  return (
    <div className="personalize-container">
      {/* AI設定 */}
      <div className="personalize-section">
        <h2 className="personalize-title">AI設定</h2>
        <div className="personalize-block">
          <h3 className="personalize-subtitle">AIの応答スタイル</h3>
          <div className="personalize-style-grid">
            {['フレンドリー', 'プロフェッショナル', '簡潔', '詩的'].map((style) => (
              <button
                key={style}
                onClick={() => setAiStyle(style)}
                className={`personalize-style-btn ${
                  aiStyle === style ? 'is-active' : ''
                }`}
              >
                {style}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 通知設定 */}
      <div className="personalize-section">
        <h2 className="personalize-title">通知設定</h2>
        <div className="personalize-block">
          <ToggleSwitch
            label="日記の要約完了通知"
            enabled={notifications.summary}
            onChange={(enabled) =>
              setNotifications((prev) => ({ ...prev, summary: enabled }))
            }
          />
          <ToggleSwitch
            label="週間のまとめレポート通知"
            enabled={notifications.weekly}
            onChange={(enabled) =>
              setNotifications((prev) => ({ ...prev, weekly: enabled }))
            }
          />
        </div>
      </div>

      {/* 保存ボタン */}
      <div className="personalize-footer">
        {feedback && <p className="personalize-feedback">{feedback}</p>}
        <button onClick={handleSave} className="personalize-save-btn">
          設定を保存
        </button>
      </div>
    </div>
  );
};

export default PersonalizeView;
