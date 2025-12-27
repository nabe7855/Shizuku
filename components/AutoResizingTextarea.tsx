/**
 * @file 入力内容に応じて高さが自動的に調整されるテキストエリアのコンポーネント。
 * 標準のtextarea要素のpropsをすべて受け付けます。
 */
import React, { useRef, useEffect } from 'react';

interface AutoResizingTextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  className?: string; // 任意の追加クラスも指定可能にしておく
}

const AutoResizingTextarea: React.FC<AutoResizingTextareaProps> = (props) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [props.value]);

  return (
    <textarea
      ref={textareaRef}
      className={`auto-textarea ${props.className || ''}`}
      {...props}
    />
  );
};

export default AutoResizingTextarea;
