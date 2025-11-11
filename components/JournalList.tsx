/**
 * @file 記録された日記エントリーの一覧を表示するコンポーネント。
 * エントリーが存在しない場合は、その旨を伝えるメッセージを表示します。
 */
import React from 'react';
import { JournalEntry } from '../types/types';
import EntryCard from './EntryCard';

interface JournalListProps {
  entries: JournalEntry[];
  onSelectEntry: (entry: JournalEntry) => void;
}

const JournalList: React.FC<JournalListProps> = ({ entries, onSelectEntry }) => {
  if (entries.length === 0) {
    return (
      <div className="entry-list-empty">
        <h3 className="entry-list-empty-title">まだ日記がありません。</h3>
        <p className="entry-list-empty-text">最初の日記を書いて、あなたの旅を始めましょう。</p>
      </div>
    );
  }

  return (
    <div className="entry-list-container">
      <div className="entry-list-wrapper">
        {entries.map((entry, index) => (
          <EntryCard
            key={`${entry.id}-${index}`} // ← 👈 indexを組み合わせてユニーク化
            entry={entry}
            onSelect={() => onSelectEntry(entry)}
          />
        ))}
      </div>
    </div>
  );
};

export default JournalList;
