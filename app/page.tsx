// src/app/page.tsx
"use client";


import React, { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";   // ←← これをここに追加！
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
import { journalService } from "@/services/journalService";
import * as authService from "@/services/authService";
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
    const init = async () => {
      const user = await authService.getCurrentUser();
      if (user) {
        setCurrentUser({
          id: user.id,
          email: user.email ?? "",
          name: user.email?.split("@")[0] ?? "",
        });
      }
    };
    init();
  }, []);

  // --- 日記データロード ---
  // --- 日記データロード（Supabase版） ---
  useEffect(() => {
    const load = async () => {
      if (!currentUser) return;

      console.log("Loading diaries for:", currentUser.id);

      const data = await loadDiariesFromSupabase(currentUser.id);

      console.log("Loaded diaries:", data);

      setEntries(data);
    };

    load();
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

  // ⭐⭐⭐ ① Supabase から日記を読み込む関数はここに入れる！ ⭐⭐⭐

  const loadDiariesFromSupabase = async (userId: string) => {
    try {
      return await journalService.getJournalEntries(userId);
    } catch (error) {
      console.error("Failed to load diaries:", error);
      return [];
    }
  };


  // --- ハンドラ類 ---
  const handleLoginSuccess = (user: User) => {
    setCurrentUser(user);
  };

  const handleLogout = () => {
    authService.logout();
    setCurrentUser(null);
    setEntries([]);
  };

  const handleSaveEntry = async (formData: JournalFormData) => {
    console.log("handleSaveEntry called. currentUser:", currentUser);
    console.log("formData:", formData);

    if (!currentUser) {
      console.warn("No currentUser found, aborting save.");
      return;
    }

    setIsLoading(true);
    try {
      const analysis = await analyzeJournalEntry(formData);
      const newEntry: JournalEntry = {
        id: new Date().toISOString(),
        createdAt: new Date(),
        body: formData.body,
        emotion: formData.emotion,
        action: formData.action, // 追加
        thought: formData.thought, // 追加
        tags: analysis.tags,
        summary: analysis.summary,
        emotionLabel: Array.isArray(analysis.emotions)
          ? analysis.emotions
          : [analysis.emotions],
      };

      // Supabase に保存
      await journalService.upsertJournalEntry(currentUser.id, newEntry);

      setEntries((prev) =>
        [newEntry, ...prev.filter((e) => !e.id.startsWith("dummy-"))].sort(
          (a, b) => b.createdAt.getTime() - a.createdAt.getTime()
        )
      );
      setIsFormOpen(false);
    } catch (e) {
      console.error("Failed to save or analyze:", e);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemoveEntry = async (entryId: string) => {
    if (!currentUser) return;
    if (!confirm("この日記を削除してもよろしいですか？")) return;

    try {
      await journalService.deleteJournalEntry(entryId);
      setEntries((prev) => prev.filter((e) => e.id !== entryId));
      if (selectedEntry?.id === entryId) setSelectedEntry(null);
    } catch (e) {
      console.error("Failed to delete entry:", e);
      alert("削除に失敗しました。");
    }
  };

  const handleUserUpdate = (updated: User) => {
    // Supabase Auth の更新が必要ならここに実装
    setCurrentUser(updated);
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
            onSaveReport={() => { }}
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
      <JournalDetailModal
        entry={selectedEntry}
        onClose={handleCloseModal}
        onDelete={handleRemoveEntry}
      />
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
