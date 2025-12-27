/**
 * @file サイドメニュー内で使用される、再利用可能なメニュー項目コンポーネント。
 * アイコン、ラベル、オプションのシェブロン（右矢印）を表示します。
 */
import React from 'react';
import { ChevronRightIcon } from './Icons';

interface MenuItemProps {
  icon: React.FC<any>;
  label: string;
  hasChevron?: boolean;
  onClick?: () => void;
}

const MenuItem: React.FC<MenuItemProps> = ({ icon: Icon, label, hasChevron = false, onClick }) => (
  <button onClick={onClick} className="menu-item">
    <Icon className="menu-item-icon" />
    <span className="menu-item-label">{label}</span>
    {hasChevron && <ChevronRightIcon className="menu-item-chevron" />}
  </button>
);

export default MenuItem;
