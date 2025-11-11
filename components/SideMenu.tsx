/**
 * @file アプリケーションのサイドメニューコンポーネント。
 * ユーザー情報の表示、各種設定ページへのナビゲーション、ログアウト機能を提供します。
 */
import React from 'react';
import { User, View } from '../types/types';
import {
  UserCircleIcon,
  UpgradePlanIcon,
  PersonalizeIcon,
  SettingsIcon,
  HelpIcon,
  ArrowRightOnRectangleIcon,
} from './Icons';
import MenuItem from './MenuItem';

interface SideMenuProps {
  isOpen: boolean;
  onClose: () => void;
  user: User | null;
  onLogout: () => void;
  onNavigate: (view: View) => void;
}

const SideMenu: React.FC<SideMenuProps> = ({
  isOpen,
  onClose,
  user,
  onLogout,
  onNavigate,
}) => {
  if (!user) return null;

  const handleNavigation = (view: View) => {
    onNavigate(view);
    onClose();
  };

  const handleLogoutClick = () => {
    onLogout();
    onClose();
  };

  return (
    <>
      {/* オーバーレイ */}
      <div
        className={`sidemenu-overlay ${isOpen ? 'visible' : ''}`}
        onClick={onClose}
      />

      {/* メニュー本体 */}
      <div className={`sidemenu ${isOpen ? 'open' : ''}`}>
        <div className="sidemenu-inner">
          {/* ユーザー情報 */}
          <div className="sidemenu-user">
            {user.picture ? (
              <img
                src={user.picture}
                alt={user.name || 'avatar'}
                className="sidemenu-avatar"
              />
            ) : (
              <UserCircleIcon className="sidemenu-avatar-placeholder" />
            )}
            <div className="sidemenu-user-info">
              <p className="sidemenu-user-name">
                {user.name || user.email.split('@')[0]}
              </p>
              <p className="sidemenu-user-email">{user.email}</p>
            </div>
          </div>

          {/* メニューリスト */}
          <nav className="sidemenu-nav">
            <MenuItem
              icon={UpgradePlanIcon}
              label="プランをアップグレードする"
              onClick={() => handleNavigation('UPGRADE')}
            />
            <MenuItem
              icon={PersonalizeIcon}
              label="パーソナライズ"
              onClick={() => handleNavigation('PERSONALIZE')}
            />
            <MenuItem
              icon={SettingsIcon}
              label="設定"
              onClick={() => handleNavigation('SETTINGS')}
            />
          </nav>

          <hr className="sidemenu-divider" />

          <nav className="sidemenu-nav">
            <MenuItem icon={HelpIcon} label="ヘルプ" hasChevron />
            <MenuItem
              icon={ArrowRightOnRectangleIcon}
              label="ログアウト"
              onClick={handleLogoutClick}
            />
          </nav>
        </div>
      </div>
    </>
  );
};

export default SideMenu;
