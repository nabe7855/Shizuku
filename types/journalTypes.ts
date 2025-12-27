/**
 * @file 日記に関連するデータ構造の型定義。
 */

/**
 * 新規日記作成フォームから送信されるデータの型。
 * BEATフレームワークの4項目と、任意で添付される画像データ（Base64文字列）を含みます。
 */
export interface JournalFormData {
  body: string;
  emotion: string;
  action: string;
  thought: string;
  image?: string;
}

/**
 * 保存される日記エントリーの完全なデータ型。
 * フォームデータに加え、ID、作成日時、AIによる分析結果（要約、感情ラベル、タグ）を含みます。
 * AIチャットのレポートも任意で含まれることがあります。
 */

export interface JournalEntry {
  id: string;
  createdAt: Date;

  body: string;
  emotion: string;
  action: string;
  thought: string;

  image?: string;       // ← optional にしてOK！

  tags: string[];
  summary: string;
  emotionLabel: string[];  // ← 配列で確定！

  chatReport?: string;
}

/**
 * Supabase の `diaries` テーブルのレコード構造を表す型。
 */
export interface DatabaseDiary {
  id: string;
  user_id: string;
  date: string; // ISO format: YYYY-MM-DD
  content: string;
  mood: string;
  tags: string[] | null;
  created_at: string;
}

