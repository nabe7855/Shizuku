/**
 * @file アプリケーションのトップページ。
 * 未ログインのユーザーに対して、ログインフォームまたは会員登録フォームを表示します。
 * メール/パスワード認証とGoogleアカウントによる認証をサポートします。
 */
import React, { useState, useEffect } from 'react';
import { DropletIcon, GoogleIcon } from './Icons';
import * as authService from '../services/authService';
import { User } from '../types/types';

declare global {
  interface Window {
    google: any;
  }
}

interface TopPageProps {
  onLoginSuccess: (user: User) => void;
}

const TopPage: React.FC<TopPageProps> = ({ onLoginSuccess }) => {
  const [isRegisterMode, setIsRegisterMode] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoginEnabled, setIsGoogleLoginEnabled] = useState(false);

  useEffect(() => {
    const handleCredentialResponse = (response: any) => {
      setIsLoading(true);
      setError('');
      try {
        const result = authService.loginOrRegisterWithGoogle(response.credential);
        if (result.success && result.user) {
          onLoginSuccess(result.user);
        } else {
          setError(result.message);
        }
      } catch {
        setError('Googleログイン中にエラーが発生しました。');
      } finally {
        setIsLoading(false);
      }
    };

    const clientId = process.env.GOOGLE_CLIENT_ID;

    if (window.google && clientId) {
      setIsGoogleLoginEnabled(true);
      try {
        window.google.accounts.id.initialize({
          client_id: clientId,
          callback: handleCredentialResponse,
        });
        window.google.accounts.id.renderButton(
          document.getElementById('googleSignInButton'),
          {
            theme: 'outline',
            size: 'large',
            type: 'standard',
            text: 'signin_with',
            shape: 'pill',
            width: '336',
          }
        );
      } catch (e) {
        console.error('Google Identity Servicesの初期化に失敗しました:', e);
        setIsGoogleLoginEnabled(false);
      }
    } else {
      setIsGoogleLoginEnabled(false);
      if (!clientId) {
        console.warn('GOOGLE_CLIENT_IDが設定されていません。');
      }
    }
  }, [onLoginSuccess]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    if (isRegisterMode) {
      if (password !== confirmPassword) {
        setError('パスワードが一致しません。');
        setIsLoading(false);
        return;
      }
      if (password.length < 6) {
        setError('パスワードは6文字以上で設定してください。');
        setIsLoading(false);
        return;
      }
      const result = authService.register(email, password);
      if (result.success && result.user) {
        onLoginSuccess(result.user);
      } else {
        setError(result.message);
      }
    } else {
      const result = authService.login(email, password);
      if (result.success && result.user) {
        onLoginSuccess(result.user);
      } else {
        setError(result.message);
      }
    }
    setIsLoading(false);
  };

  return (
    <div className="toppage">
      <div className="auth-card">
        <div className="auth-header">
          <DropletIcon className="auth-logo" />
          <h1 className="auth-title">Mii/Shizuku</h1>
          <p className="auth-subtitle">
            {isRegisterMode ? '新しい旅を始める' : 'おかえりなさい'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          <input
            type="email"
            placeholder="メールアドレス"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="auth-input"
          />
          <input
            type="password"
            placeholder="パスワード"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="auth-input"
          />
          {isRegisterMode && (
            <input
              type="password"
              placeholder="パスワード (確認用)"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              className="auth-input"
            />
          )}

          {error && <p className="auth-error">{error}</p>}

          <button
            type="submit"
            disabled={isLoading}
            className={`auth-button ${isLoading ? 'loading' : ''}`}
          >
            {isLoading ? '処理中...' : isRegisterMode ? '登録して始める' : 'ログイン'}
          </button>
        </form>

        <div className="auth-divider">
          <div className="line" />
          <span>OR</span>
          <div className="line" />
        </div>

        {isGoogleLoginEnabled ? (
          <div id="googleSignInButton" className="auth-google" />
        ) : (
          <div className="auth-google">
            <button type="button" disabled className="google-disabled">
              <GoogleIcon className="google-icon" />
              Googleでログイン
            </button>
          </div>
        )}

        <div className="auth-switch">
          <button
            onClick={() => {
              setIsRegisterMode(!isRegisterMode);
              setError('');
            }}
          >
            {isRegisterMode
              ? '既にアカウントをお持ちですか？ ログイン'
              : '初めてですか？ 会員登録'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default TopPage;
