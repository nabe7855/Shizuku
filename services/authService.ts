import { supabase } from "../lib/supabaseClient";

// 会員登録（メール + パスワード）
export const register = async (email: string, password: string) => {
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
  const { error } = await supabase.auth.signOut();
  if (error) {
    console.error("ログアウト失敗:", error.message);
    return { success: false, message: error.message };
  }
  return { success: true };
};
export const getCurrentUser = async () => {
  const { data: { user } } = await supabase.auth.getUser();
  return user;
};
