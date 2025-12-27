/**
 * @file ユーザーのプロフィール設定とAIのパーソナライズ設定を行うためのビューコンポーネント。
 */
import React, { useState, useRef } from 'react';
import { User } from '../types/types';
import { CameraIcon, UserCircleIcon, InformationCircleIcon } from './Icons';
import Tooltip from './Tooltip';
import TagInput from './TagInput';

interface SettingsViewProps {
  user: User;
  onUpdateUser: (updatedUser: User) => void;
}

const SettingsView: React.FC<SettingsViewProps> = ({ user, onUpdateUser }) => {
  const [name, setName] = useState(user.name || '');
  const [picture, setPicture] = useState(user.picture);
  const [bio, setBio] = useState(user.bio || '');
  const [values, setValues] = useState<string[]>(user.values || []);
  const [interests, setInterests] = useState<string[]>(user.interests || []);
  const [goals, setGoals] = useState(user.goals || '');
  const [feedback, setFeedback] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handlePictureChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        setFeedback('画像サイズは2MB以下にしてください。');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setPicture(reader.result as string);
        setFeedback('');
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveChanges = () => {
    const updatedUser: User = {
      ...user,
      name: name.trim(),
      picture: picture,
      bio: bio.trim(),
      values,
      interests,
      goals: goals.trim(),
    };
    onUpdateUser(updatedUser);
    setFeedback('設定を保存しました。');
    setTimeout(() => setFeedback(''), 3000);
  };

  return (
    <div className="settings">
      {/* --- プロフィール設定 --- */}
      <section className="settings-section">
        <h2 className="settings-section-title">プロフィール設定</h2>

        <div className="settings-profile">
          <div className="avatar-wrapper">
            {picture ? (
              <img src={picture} alt="Avatar" className="avatar-image" />
            ) : (
              <UserCircleIcon className="avatar-placeholder" />
            )}
            <button
              onClick={() => fileInputRef.current?.click()}
              className="avatar-edit-btn"
              aria-label="プロフィール画像を変更"
            >
              <CameraIcon className="avatar-edit-icon" />
            </button>
            <input
              type="file"
              ref={fileInputRef}
              className="avatar-input"
              accept="image/*"
              onChange={handlePictureChange}
            />
          </div>

          <div className="settings-field">
            <label htmlFor="username" className="settings-label">
              ユーザーネーム (AIがあなたを呼ぶ名前)
            </label>
            <input
              id="username"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="例: しずく"
              className="settings-input"
            />
          </div>

          <div className="settings-field">
            <label htmlFor="email" className="settings-label">
              メールアドレス
            </label>
            <input
              id="email"
              type="email"
              value={user.email}
              disabled
              className="settings-input disabled"
            />
          </div>
        </div>
      </section>

      {/* --- AIパーソナライズデータ --- */}
      <section className="settings-section">
        <h2 className="settings-section-title">AIパーソナライズデータ</h2>

        <div className="settings-field">
          <label htmlFor="bio" className="settings-label with-tooltip">
            <span>自己紹介</span>
            <Tooltip text="AIがあなたの性格や背景を理解するのに役立ちます。">
              <InformationCircleIcon className="info-icon" />
            </Tooltip>
          </label>
          <textarea
            id="bio"
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            rows={3}
            placeholder="私はこんな人間です..."
            className="settings-textarea"
          />
        </div>

        <div className="settings-field">
          <label className="settings-label with-tooltip">
            <span>価値観</span>
            <Tooltip text="あなたが大切にしていることをAIに教えることで、より価値観に沿ったアドバイスを受けられます。">
              <InformationCircleIcon className="info-icon" />
            </Tooltip>
          </label>
          <TagInput tags={values} setTags={setValues} placeholder="例: 成長、自由 (Enterで追加)" />
        </div>

        <div className="settings-field">
          <label className="settings-label with-tooltip">
            <span>興味・関心</span>
            <Tooltip text="あなたの好きなことを共有すると、関連トピックで対話が弾みます。">
              <InformationCircleIcon className="info-icon" />
            </Tooltip>
          </label>
          <TagInput tags={interests} setTags={setInterests} placeholder="例: 読書、旅行 (Enterで追加)" />
        </div>

        <div className="settings-field">
          <label htmlFor="goals" className="settings-label with-tooltip">
            <span>目標</span>
            <Tooltip text="AIはあなたの目標達成をサポートするように励ましの言葉を返します。">
              <InformationCircleIcon className="info-icon" />
            </Tooltip>
          </label>
          <textarea
            id="goals"
            value={goals}
            onChange={(e) => setGoals(e.target.value)}
            rows={2}
            placeholder="今、目指していることは何ですか？"
            className="settings-textarea"
          />
        </div>
      </section>

      {/* --- 保存ボタン --- */}
      <div className="settings-footer">
        {feedback && <p className="feedback-message">{feedback}</p>}
        <button onClick={handleSaveChanges} className="save-btn">
          変更を保存
        </button>
      </div>
    </div>
  );
};

export default SettingsView;
