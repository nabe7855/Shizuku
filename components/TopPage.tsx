/**
 * @file アプリケーションのトップページ。
 * Supabaseを使って会員登録・ログインを行う本物の認証画面。
 */

import React, { useState } from "react";
import { DropletIcon, GoogleIcon } from "./Icons";

// ★ Supabase 認証ロジック
import { register, login } from "../services/authService";

import { User } from "../types/types";

import { logout } from "../services/authService";


interface TopPageProps {
  onLoginSuccess: (user: User) => void;
}

const handleLogout = async () => {
  const result = await logout();
  if (result.success) {
    alert("ログアウトしました！");
    // ログインページに戻るなど
    window.location.reload();
  } else {
    alert("ログアウトに失敗しました…");
  }
};

const TopPage: React.FC<TopPageProps> = ({ onLoginSuccess }) => {
  const [isRegisterMode, setIsRegisterMode] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // ------------------------
  // Googleログイン（後で実装する！）
  // ------------------------
  const handleGoogleLogin = () => {
    alert("Googleログインは後で実装します💙");
  };

  // ------------------------
  // フォーム送信（会員登録 or ログイン）
  // ------------------------
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    // ■✦ 会員登録モード ✦■
    if (isRegisterMode) {
      if (password !== confirmPassword) {
        setError("パスワードが一致しません。");
        setIsLoading(false);
        return;
      }

      if (password.length < 6) {
        setError("パスワードは6文字以上にしてください。");
        setIsLoading(false);
        return;
      }

      const result = await register(email, password);

      if (!result.success) {
        setError(result.message);
        setIsLoading(false);
        return;
      }

      alert("確認メールを送ったよ！メールをチェックしてね💙");
      setIsLoading(false);
      return;
    }

    // ■✦ ログインモード ✦■
    const result = await login(email, password);

    if (!result.success || !result.user) {
setError(result.message ?? "");
      setIsLoading(false);
      return;
    }

    // ログイン成功 → 親コンポーネントへユーザーを渡す
    onLoginSuccess({
      email: result.user.email ?? "",
      name: result.user.email?.split("@")[0] ?? "",
    });

    setIsLoading(false);
  };

  return (
    <div className="toppage">
      <div className="auth-card">
        <div className="auth-header">
          <DropletIcon className="auth-logo" />
          <h1 className="auth-title">Mii/Shizuku</h1>
          <p className="auth-subtitle">
            {isRegisterMode ? "新しい旅を始める" : "おかえりなさい"}
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
            className={`auth-button ${isLoading ? "loading" : ""}`}
          >
            {isLoading
              ? "処理中..."
              : isRegisterMode
              ? "登録して始める"
              : "ログイン"}
          </button>
        </form>

        <div className="auth-divider">
          <div className="line" />
          <span>OR</span>
          <div className="line" />
        </div>

        <div className="auth-google">
          <button type="button" onClick={handleGoogleLogin}>
            <GoogleIcon className="google-icon" />
            Googleでログイン
          </button>
        </div>

        <div className="auth-switch">
          <button
            onClick={() => {
              setIsRegisterMode(!isRegisterMode);
              setError("");
            }}
          >
            {isRegisterMode
              ? "既にアカウントがありますか？ ログイン"
              : "初めてですか？ 会員登録"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default TopPage;
