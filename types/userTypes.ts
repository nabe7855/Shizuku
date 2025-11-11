/**
 * @file ユーザーアカウントに関連するデータ構造の型定義。
 */

/**
 * ユーザー情報を表すインターフェース。
 */
export interface User {
    email: string; // 必須。ユーザーの一意な識別子。
    password?: string; // メール/パスワード認証で使用。認証後は持ち回さないためオプショナル。
    name?: string; // ユーザー名またはニックネーム。
    picture?: string; // プロフィール画像のURL。
    // 以下はAIのパーソナライズに使用されるデータ
    bio?: string; // 自己紹介
    values?: string[]; // 大切にしている価値観
    interests?: string[]; // 趣味・関心事
    goals?: string; // 現在の目標や課題
}
