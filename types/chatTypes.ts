/**
 * @file AIチャット機能に関連するデータ構造の型定義。
 */

/**
 * 一つのチャットメッセージを表すインターフェース。
 * @param role - メッセージの送信者が'user'（ユーザー）か'model'（AI）かを示す。
 * @param content - メッセージのテキスト内容。
 */
export interface ChatMessage {
  role: 'user' | 'model';
  content: string;
}
