// src/app/page.tsx
"use client";

import React, { useState, useEffect } from "react";
import JournalForm from "@/components/JournalForm";
import JournalList from "@/components/JournalList";
import JournalDetailModal from "@/components/JournalDetailModal";
import CalendarView from "@/components/CalendarHeatmap";
import ChatView from "@/components/ChatView";
import AnalyticsView from "@/components/AnalyticsView";
import SettingsView from "@/components/SettingsView";
import UpgradeView from "@/components/UpgradeView";
import PersonalizeView from "@/components/PersonalizeView";
import TopPage from "@/components/TopPage";
import SideMenu from "@/components/SideMenu";

import {
  HomeIcon,
  CalendarIcon,
  ChatBubbleLeftRightIcon,
  PlusIcon,
  ChartBarIcon,
  ChevronLeftIcon,
} from "@/components/Icons";

import { JournalEntry, JournalFormData, View, User } from "@/types/types";
import { analyzeJournalEntry } from "@/services/journalAnalysisService";
import * as authService from "@/services/old_authService";
import { generateDummyData } from "@/data/dummyData";

export default function Page() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedEntry, setSelectedEntry] = useState<JournalEntry | null>(null);
  const [view, setView] = useState<View>("JOURNAL");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // --- 初期化 ---
  useEffect(() => {
    const user = authService.getCurrentUser();
    if (user) setCurrentUser(user);
  }, []);

  // --- 日記データロード ---
  useEffect(() => {
    if (!currentUser) return;
    try {
      const key = `journalEntries_${currentUser.email}`;
      const stored = localStorage.getItem(key);
      if (stored) {
        setEntries(
          JSON.parse(stored).map((e: any) => ({
            ...e,
            createdAt: new Date(e.createdAt),
          }))
        );
      } else {
        setEntries(generateDummyData());
      }
    } catch (e) {
      console.error("Failed to load journal:", e);
    }
  }, [currentUser]);

  // --- 日記保存 ---
  useEffect(() => {
    if (!currentUser || entries.length === 0) return;
    try {
      const key = `journalEntries_${currentUser.email}`;
      const real = entries.some((e) => !e.id.startsWith("dummy-"));
      if (real) localStorage.setItem(key, JSON.stringify(entries));
    } catch (e) {
      console.error("Failed to save journal:", e);
    }
  }, [entries, currentUser]);

  // --- ハンドラ類 ---
  const handleLoginSuccess = (user: User) => {
    setCurrentUser(user);
    authService.setCurrentUser(user);
  };

  const handleLogout = () => {
    authService.logout();
    setCurrentUser(null);
    setEntries([]);
  };

  const handleSaveEntry = async (formData: JournalFormData) => {
    if (!currentUser) return;
    setIsLoading(true);
    try {
      const analysis = await analyzeJournalEntry(formData);
      const newEntry: JournalEntry = {
        id: new Date().toISOString(),
        createdAt: new Date(),
        ...formData,
        summary: analysis.summary,
        emotionLabel: analysis.emotions,
        tags: analysis.tags,
      };
      setEntries((prev) =>
        [newEntry, ...prev.filter((e) => !e.id.startsWith("dummy-"))].sort(
          (a, b) => b.createdAt.getTime() - a.createdAt.getTime()
        )
      );
      setIsFormOpen(false);
    } catch (e) {
      console.error("Failed to analyze:", e);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUserUpdate = (updated: User) => {
    const result = authService.updateUser(updated);
    if (result.success && result.user) setCurrentUser(result.user);
  };

  const handleSelectEntry = (entry: JournalEntry) => setSelectedEntry(entry);
  const handleCloseModal = () => setSelectedEntry(null);

  const headerTitle: Record<View, string> = {
    JOURNAL: "日記",
    CALENDAR: "カレンダー",
    ANALYTICS: "感情分析",
    CHAT: "AIチャット",
    SETTINGS: "設定",
    UPGRADE: "プランをアップグレード",
    PERSONALIZE: "パーソナライズ",
  };

  const hasTodaysEntry = entries.some(
    (e) =>
      e.createdAt.toISOString().split("T")[0] ===
      new Date().toISOString().split("T")[0]
  );
  const isSubView = ["SETTINGS", "UPGRADE", "PERSONALIZE"].includes(view);

  const renderView = () => {
    switch (view) {
      case "CALENDAR":
        return (
          <div style={{ padding: "1rem" }}>
            <CalendarView entries={entries} onSelectEntry={handleSelectEntry} />
          </div>
        );
      case "ANALYTICS":
        return <AnalyticsView entries={entries} user={currentUser!} />;
      case "CHAT":
        return (
          <ChatView
            entries={entries}
            onSaveReport={() => {}}
            hasTodaysEntry={hasTodaysEntry}
            user={currentUser!}
          />
        );
      case "SETTINGS":
        return (
          <SettingsView user={currentUser!} onUpdateUser={handleUserUpdate} />
        );
      case "UPGRADE":
        return <UpgradeView />;
      case "PERSONALIZE":
        return <PersonalizeView />;
      case "JOURNAL":
      default:
        return (
          <JournalList entries={entries} onSelectEntry={handleSelectEntry} />
        );
    }
  };

  if (!currentUser) return <TopPage onLoginSuccess={handleLoginSuccess} />;

  return (
    <div className="app-container">
      {/* ヘッダー */}
      <header className="app-header">
        <div className="header-content">
          <div className="left">
            {isSubView ? (
              <button onClick={() => setView("JOURNAL")} className="back-btn">
                <ChevronLeftIcon className="icon" />
              </button>
            ) : (
              <button onClick={() => setIsMenuOpen(true)} className="menu-btn">
                {currentUser.picture ? (
                  <img
                    src={currentUser.picture}
                    alt="avatar"
                    className="avatar"
                  />
                ) : (
                  <div className="avatar-placeholder">
                    {(currentUser.name || currentUser.email)[0].toUpperCase()}
                  </div>
                )}
              </button>
            )}
          </div>
          <h1 className="header-title">{headerTitle[view]}</h1>
          <div className="right" />
        </div>
      </header>

      <main className="app-main">{renderView()}</main>

      {view !== "CHAT" && !isSubView && (
        <button onClick={() => setIsFormOpen(true)} className="fab">
          <PlusIcon className="icon" />
        </button>
      )}

      {!isSubView && (
        <footer className="app-footer">
          {[
            { v: "JOURNAL", i: HomeIcon, l: "日記" },
            { v: "CALENDAR", i: CalendarIcon, l: "カレンダー" },
            { v: "ANALYTICS", i: ChartBarIcon, l: "分析" },
            { v: "CHAT", i: ChatBubbleLeftRightIcon, l: "チャット" },
          ].map((n) => (
            <button
              key={n.v}
              onClick={() => setView(n.v as View)}
              className={`nav-btn ${view === n.v ? "active" : ""}`}
            >
              <n.i className="icon" />
              <span>{n.l}</span>
            </button>
          ))}
        </footer>
      )}

      {isFormOpen && (
        <JournalForm
          onSave={handleSaveEntry}
          onClose={() => setIsFormOpen(false)}
          isLoading={isLoading}
        />
      )}
      <JournalDetailModal entry={selectedEntry} onClose={handleCloseModal} />
      <SideMenu
        isOpen={isMenuOpen}
        onClose={() => setIsMenuOpen(false)}
        user={currentUser}
        onLogout={handleLogout}
        onNavigate={setView}
      />
    </div>
  );
}
