/**
 * @file 初回利用時など、ユーザーの日記データが存在しない場合に表示するためのダミーデータを生成します。
 */
import { JournalEntry } from '../types/types';

/**
 * ダミーの日記エントリーを複数生成して配列として返します。
 * @returns {JournalEntry[]} ダミー日記データの配列。
 */
export const generateDummyData = (): JournalEntry[] => {
  const dummyEntries: JournalEntry[] = [];
  const today = new Date();

  // ダミーデータの元となるサンプルテキスト
  const sampleBodies = ["体が軽い感じがする。", "少し肩が凝っている。", "リラックスしていて、心地よい。", "エネルギーに満ち溢れている。", "少し眠気を感じる。"];
  const sampleEmotions = ["嬉しい気持ちでいっぱい。", "少し将来のことが不安になった。", "穏やかな心境。", "わくわくする期待感がある。", "理由もなく少し悲しい。"];
  const sampleActions = ["近所を散歩した。", "仕事に集中して取り組んだ。", "友人と電話で話した。", "好きな本を読んだ。", "5分間の瞑想を試した。"];
  const sampleThoughts = ["今日は生産的な一日だった。", "明日はもっと良い日になるだろう。", "自分の成長を実感できた。", "もっと時間を有効活用したい。", "周りの人々に感謝したい。"];
  const sampleSummaries = [
    "穏やかな一日を過ごし、心身ともにリフレッシュできました。",
    "忙しいながらも、充実感のある一日でした。",
    "少し疲れを感じましたが、明日に向けて良い休息が取れそうです。",
    "新しい発見があり、刺激的な一日でした。",
    "自分の感情と向き合い、大切な気づきを得ました。",
  ];
  const sampleEmotionLabels = [["喜び"], ["不安"], ["穏やか"], ["充実感"], ["感謝"], ["期待"]];
  const sampleTags = [["仕事", "目標達成"], ["人間関係", "友人"], ["自己成長", "読書"], ["リラックス", "趣味"], ["健康", "運動"]];

  // 15件のダミーエントリーを生成
  for (let i = 0; i < 15; i++) {
    const date = new Date(today);
    // 日付をランダムに過去に設定
    date.setDate(today.getDate() - i * (Math.floor(Math.random() * 3) + 1) );
    
    // 配列からランダムに要素を選択するヘルパー関数
    const randomIdx = (arr: any[]) => Math.floor(Math.random() * arr.length);

    const entry: JournalEntry = {
      id: `dummy-${date.toISOString()}`,
      createdAt: date,
      body: sampleBodies[randomIdx(sampleBodies)],
      emotion: sampleEmotions[randomIdx(sampleEmotions)],
      action: sampleActions[randomIdx(sampleActions)],
      thought: sampleThoughts[randomIdx(sampleThoughts)],
      summary: sampleSummaries[randomIdx(sampleSummaries)],
      emotionLabel: sampleEmotionLabels[randomIdx(sampleEmotionLabels)],
      tags: sampleTags[randomIdx(sampleTags)],
      chatReport: undefined,
    };
    dummyEntries.push(entry);
  }
  // 日付の降順（新しいものが先頭）にソートして返す
  return dummyEntries.sort((a,b) => b.createdAt.getTime() - a.createdAt.getTime());
};
