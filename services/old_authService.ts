/**
 * @file ユーザー認証関連の機能を提供するサービス。
 * 会員登録、ログイン、ログアウト、Google認証、ユーザー情報管理などを行います。
 *
 * @warning このファイルはデモンストレーション目的で、localStorageにパスワードを含むユーザー情報を
 * 平文で保存しています。これは非常に危険な実装であり、実際のアプリケーションでは絶対に使用しないでください。
 * プロダクション環境では、バックエンドサーバーと連携し、OAuthやJWT、セキュアなセッション管理などの
 * 適切な認証・認可メカニズムを実装する必要があります。
 */
import { User } from "../types/types";

// localStorageで使用するキー
const USERS_KEY = "mii_shizuku_users";
const CURRENT_USER_KEY = "mii_shizuku_currentUser";

/**
 * JWT（JSON Web Token）を簡易的にデコードする関数。
 * 署名の検証は行わず、ペイロード部分をデコードしてJSONオブジェクトを返します。
 * GoogleのIDトークンからユーザー情報を抽出するために使用します。
 * @param token - デコード対象のJWT文字列。
 * @returns {any | null} デコードされたペイロードオブジェクト、または失敗した場合はnull。
 */
const jwtDecode = (token: string): any => {
  try {
    const base64Url = token.split(".")[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map(function (c) {
          return "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2);
        })
        .join("")
    );
    return JSON.parse(jsonPayload);
  } catch (e) {
    console.error("Invalid token", e);
    return null;
  }
};

/**
 * 新規ユーザーを登録します。
 * @param email - ユーザーのメールアドレス。
 * @param password - ユーザーのパスワード。
 * @returns 登録の成否、メッセージ、成功した場合はユーザー情報を含むオブジェクト。
 */
export const register = (
  email: string,
  password: string
): { success: boolean; message: string; user?: User } => {
  const users: User[] = JSON.parse(localStorage.getItem(USERS_KEY) || "[]");
  const existingUser = users.find((u) => u.email === email);
  if (existingUser) {
    return {
      success: false,
      message: "このメールアドレスは既に使用されています。",
    };
  }
  // 注意: パスワードを平文で保存しています。
  const newUser: User = { id: Date.now().toString(), email, password, name: email.split("@")[0] };
  users.push(newUser);
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
  // レスポンスからはパスワードを除外
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { password: _, ...userToReturn } = newUser;
  return { success: true, message: "登録が完了しました。", user: userToReturn };
};

/**
 * 既存ユーザーをログインさせます。
 * @param email - ユーザーのメールアドレス。
 * @param password - ユーザーのパスワード。
 * @returns ログインの成否、メッセージ、成功した場合はユーザー情報を含むオブジェクト。
 */
export const login = (
  email: string,
  password: string
): { success: boolean; message: string; user?: User } => {
  const users: User[] = JSON.parse(localStorage.getItem(USERS_KEY) || "[]");
  // 注意: パスワードを平文で比較しています。
  const user = users.find((u) => u.email === email && u.password === password);
  if (user) {
    // レスポンスからはパスワードを除外
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password: _, ...userToReturn } = user;
    return { success: true, message: "ログインしました。", user: userToReturn };
  }
  return {
    success: false,
    message: "メールアドレスまたはパスワードが正しくありません。",
  };
};

/**
 * Googleの認証情報を使用してログインまたは新規登録を行います。
 * @param credential - Googleから提供されたIDトークン。
 * @returns 処理の成否、メッセージ、成功した場合はユーザー情報を含むオブジェクト。
 */
export const loginOrRegisterWithGoogle = (
  credential: string
): { success: boolean; message: string; user?: User } => {
  const decoded: { email: string; name: string; picture: string } | null =
    jwtDecode(credential);
  if (!decoded || !decoded.email) {
    return { success: false, message: "Google認証情報の解析に失敗しました。" };
  }
  const users: User[] = JSON.parse(localStorage.getItem(USERS_KEY) || "[]");
  let user = users.find((u) => u.email === decoded.email);

  if (user) {
    // ユーザーが既に存在する場合、Googleからの最新情報で更新
    user.name = decoded.name;
    user.picture = decoded.picture;
  } else {
    // 新規ユーザーの場合、新しいユーザーオブジェクトを作成
    user = {
      id: Date.now().toString(),
      email: decoded.email,
      name: decoded.name,
      picture: decoded.picture,
    };
    users.push(user);
  }

  localStorage.setItem(USERS_KEY, JSON.stringify(users));
  // レスポンスからはパスワードを除外（Googleログインユーザーはパスワードを持たない）
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { password, ...userToReturn } = user;
  return {
    success: true,
    message: "Googleアカウントでログインしました。",
    user: userToReturn,
  };
};

/**
 * ユーザー情報を更新します（例: プロフィール設定の変更）。
 * @param updatedUser - 更新されたユーザー情報。
 * @returns 更新の成否と、成功した場合は更新後のユーザー情報を含むオブジェクト。
 */
export const updateUser = (
  updatedUser: User
): { success: boolean; user?: User } => {
  const users: User[] = JSON.parse(localStorage.getItem(USERS_KEY) || "[]");
  const userIndex = users.findIndex((u) => u.email === updatedUser.email);
  if (userIndex !== -1) {
    // パスワード情報が失われないように、既存のユーザー情報とマージ
    const existingUser = users[userIndex];
    const newUser = { ...existingUser, ...updatedUser };
    users[userIndex] = newUser;
    localStorage.setItem(USERS_KEY, JSON.stringify(users));

    // 現在のログインユーザー情報も更新
    setCurrentUser(newUser);

    // レスポンスからはパスワードを除外
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password, ...userToReturn } = newUser;
    return { success: true, user: userToReturn };
  }
  return { success: false };
};

/**
 * ユーザーをログアウトさせ、現在のユーザー情報をlocalStorageから削除します。
 */
export const logout = (): void => {
  localStorage.removeItem(CURRENT_USER_KEY);
};

/**
 * 現在のログインユーザー情報をlocalStorageに保存します。
 * パスワード情報は保存対象から除外します。
 * @param user - 保存するユーザーオブジェクト。
 */
export const setCurrentUser = (user: User): void => {
  // パスワードはセッション情報として保存しない
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { password, ...userToSave } = user;
  localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(userToSave));
};

/**
 * localStorageから現在のログインユーザー情報を取得します。
 * @returns {User | null} ログイン中のユーザーオブジェクト、またはログインしていない場合はnull。
 */
export const getCurrentUser = (): User | null => {
  const userJson = localStorage.getItem(CURRENT_USER_KEY);
  if (userJson) {
    return JSON.parse(userJson);
  }
  return null;
};
