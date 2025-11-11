/**
 * @file タグ形式の入力を受け付けるための、再利用可能なUIコンポーネント。
 * ユーザーがテキストを入力し、Enterキーでタグとして確定できます。
 */
import React, { useState, KeyboardEvent } from 'react';
import { XCircleIcon } from './Icons';

interface TagInputProps {
  tags: string[];
  setTags: React.Dispatch<React.SetStateAction<string[]>>;
  placeholder: string;
}

const TagInput: React.FC<TagInputProps> = ({ tags, setTags, placeholder }) => {
  const [inputValue, setInputValue] = useState('');

  /** Enter or , でタグ追加 */
  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      const newTag = inputValue.trim();
      if (newTag && !tags.includes(newTag)) {
        setTags([...tags, newTag]);
      }
      setInputValue('');
    }
  };

  /** タグ削除 */
  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter((tag) => tag !== tagToRemove));
  };

  return (
    <div className="taginput">
      <div className="taginput-container">
        {tags.map((tag) => (
          <div key={tag} className="taginput-tag">
            {tag}
            <button onClick={() => removeTag(tag)} className="taginput-remove">
              <XCircleIcon className="taginput-remove-icon" />
            </button>
          </div>
        ))}
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={tags.length === 0 ? placeholder : '次のタグ...'}
          className="taginput-field"
        />
      </div>
    </div>
  );
};

export default TagInput;
