import { supabase } from "../lib/supabaseClient";

const missingConfigMessage =
  "Supabase の設定が見つかりません。環境変数 NEXT_PUBLIC_SUPABASE_URL と NEXT_PUBLIC_SUPABASE_ANON_KEY を設定してください。";

// 会員登録（メール + パスワード）
export const register = async (email: string, password: string) => {
  if (!supabase) {
    return { success: false, message: missingConfigMessage };
  }

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
  });

  if (error) {
    return { success: false, message: error.message };
  }

  return {
    success: true,
    message: "確認メールを送信しました！メールをチェックしてね✨",
    user: data.user,
  };
};

// ログイン
export const login = async (email: string, password: string) => {
  if (!supabase) {
    return { success: false, message: missingConfigMessage };
  }

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return { success: false, message: error.message };
  }

  return { success: true, user: data.user };
};

// ログアウト

export const logout = async () => {
  if (!supabase) {
    return { success: false, message: missingConfigMessage };
  }

  const { error } = await supabase.auth.signOut();
  if (error) {
    console.error("ログアウト失敗:", error.message);
    return { success: false, message: error.message };
  }
  return { success: true };
};
