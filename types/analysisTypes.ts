/**
 * @file AIによる日記分析に関連するデータ構造の型定義。
 */

/**
 * 生成をリクエストする詳細レポートの種類を示す型。
 */
export type ReportType = 'MONTHLY_THEME' | 'BIG_FIVE' | 'MBTI' | 'STRENGTHS_VALUES' | 'KEYWORDS' | 'SENTIMENT_TREND';

/**
 * Big Five性格特性のスコアを格納するインターフェース。
 * 各特性は0から100の範囲で評価されます。
 */
export interface PersonalityTraits {
  openness: number; // 開放性
  conscientiousness: number; // 誠実性
  extraversion: number; // 外向性
  agreeableness: number; // 協調性
  neuroticism: number; // 神経症傾向
}

/**
 * MBTIの4つの指標における傾向スコアを格納するインターフェース。
 * 各指標は-100（左側の特性）から100（右側の特性）の範囲で評価されます。
 */
export interface MBTIScores {
  ei: number; // 内向(I) <-> 外向(E)
  sn: number; // 直感(N) <-> 感覚(S)
  tf: number; // 感情(F) <-> 思考(T)
  jp: number; // 知覚(P) <-> 判断(J)
}

/**
 * 日記エントリー群に対する包括的な分析結果を格納するインターフェース。
 */
export interface JournalAnalysis {
  keywords: string[]; // 頻出キーワード
  coreValues: string[]; // 推定されるコアバリュー
  overallInsight: string; // 全体的な洞察
  monthlyTheme: string; // 今月のテーマ
  personalityTraits: PersonalityTraits; // Big Five性格特性
  topStrengths: string[]; // VIAに基づく強み
  comprehensiveReport: string; // Markdown形式の総合レポート
  mbtiType: string; // 推定されるMBTIタイプ
  mbtiScores: MBTIScores; // MBTIの各指標スコア
}
