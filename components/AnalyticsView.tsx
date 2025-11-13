import React, { useState, useEffect } from "react";
import {
  JournalEntry,
  JournalAnalysis,
  ReportType,
  User,
} from "../types/types";
import {
  analyzePatternsAndInsights,
  generateDetailedReport,
} from "../services/insightsService";
import ReportModal from "./ReportModal";
import ComprehensiveReportCard from "./ComprehensiveReportCard";
import MonthlyThemeCard from "./MonthlyThemeCard";
import BigFiveRadarChart from "./BigFiveRadarChart";
import MBTIAnalysisCard from "./MBTIAnalysisCard";
import SentimentPositionCard from "./SentimentPositionCard";
import SkeletonLoader from "./SkeletonLoader";
import Tooltip from "./Tooltip";
import { InformationCircleIcon } from "./Icons";
import ReportButton from "./ReportButton";

interface AnalyticsViewProps {
  entries: JournalEntry[];
  user: User;
}

const AnalyticsView: React.FC<AnalyticsViewProps> = ({ entries, user }) => {
  const [analysis, setAnalysis] = useState<JournalAnalysis | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [isReportLoading, setIsReportLoading] = useState(false);
  const [reportContent, setReportContent] = useState<string | null>(null);
  const [reportTitle, setReportTitle] = useState("");
  const [hasTriggeredAnalysis, setHasTriggeredAnalysis] = useState(false);
  const [analysisError, setAnalysisError] = useState<string | null>(null);

  useEffect(() => {
    setAnalysis(null);
    setHasTriggeredAnalysis(false);
    setAnalysisError(null);
    setIsLoading(false);
  }, [entries.length, user]);

  const handleRunAnalysis = async () => {
    if (isLoading || entries.length < 3) return;
    setHasTriggeredAnalysis(true);
    setIsLoading(true);
    setAnalysisError(null);
    try {
      const result = await analyzePatternsAndInsights(entries, user);
      setAnalysis(result);
    } catch (error) {
      console.error("Failed to analyze entries:", error);
      setAnalysisError(
        "AI分析の実行中にエラーが発生しました。時間を置いて再度お試しください。"
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleGenerateReport = async (
    reportType: ReportType,
    title: string
  ) => {
    if (!analysis) return;
    setReportTitle(title);
    setIsReportModalOpen(true);
    setIsReportLoading(true);
    setReportContent(null);

    const journalSummaries = entries
      .slice(0, 30)
      .map((e) => `${e.createdAt.toLocaleDateString("ja-JP")}: ${e.summary}`)
      .join("\n");

    try {
      const content = await generateDetailedReport(
        reportType,
        analysis,
        journalSummaries,
        user
      );
      setReportContent(content);
    } catch (error) {
      console.error("Failed to generate report:", error);
      setReportContent("申し訳ありません、レポートの生成中にエラーが発生しました。");
    } finally {
      setIsReportLoading(false);
    }
  };

  const closeReportModal = () => {
    setIsReportModalOpen(false);
    setTimeout(() => {
      setReportContent(null);
      setReportTitle("");
    }, 300);
  };

  if (entries.length < 3 && !isLoading) {
    return (
      <div className="analytics-empty">
        <h3>感情データがまだありません。</h3>
        <p>日記を3つ以上書くと、あなたの感情の傾向が見られるようになります。</p>
      </div>
    );
  }

  return (
    <div className="analytics-container">
      <div className="analysis-trigger-card">
        <div className="analysis-trigger-copy">
          <h3>AI分析を実行する</h3>
          <p>
            過去の日記をもとにした詳細なレポートを必要なときだけ生成できます。
          </p>
          {!hasTriggeredAnalysis && (
            <p className="analysis-trigger-hint">
              ※ 「AI分析を実行」ボタンを押すと初めてAIが作動します
            </p>
          )}
          {analysisError && (
            <p className="analysis-trigger-error">{analysisError}</p>
          )}
        </div>
        <button
          className="analysis-trigger-button"
          onClick={handleRunAnalysis}
          disabled={isLoading || entries.length < 3}
        >
          {isLoading ? "分析中..." : "AI分析を実行"}
        </button>
      </div>
      {/* 総合レポート */}
      <div className="analytics-section">
        <ComprehensiveReportCard
          report={
            analysis?.comprehensiveReport ??
            (!hasTriggeredAnalysis
              ? "AI分析はまだ実行されていません。ボタンを押して最新のレポートを生成しましょう。"
              : null)
          }
          isLoading={isLoading}
        />
        <MonthlyThemeCard
          theme={analysis?.monthlyTheme ?? null}
          isLoading={isLoading}
          onClickReport={() =>
            handleGenerateReport("MONTHLY_THEME", "今月のテーマ 詳細レポート")
          }
        />
      </div>

      {/* 性格分析 */}
      <div className="analytics-grid">
        <div className="analytics-grid-left">
          <BigFiveRadarChart
            data={analysis?.personalityTraits ?? null}
            isLoading={isLoading}
            onClickReport={() =>
              handleGenerateReport("BIG_FIVE", "性格特性 (Big Five) 詳細レポート")
            }
          />
        </div>
        <div className="analytics-grid-right">
          <MBTIAnalysisCard
            mbtiType={analysis?.mbtiType ?? null}
            scores={analysis?.mbtiScores ?? null}
            isLoading={isLoading}
            onClickReport={() =>
              handleGenerateReport("MBTI", "MBTIパーソナリティ 詳細レポート")
            }
          />

          {/* 強み */}
          <div className="analytics-card">
            <div className="analytics-card-header">
              <h3>あなたの強み (VIA)</h3>
              <Tooltip text="ポジティブ心理学に基づき、日記の内容から浮かび上がってきたあなたの核となる強みです。">
                <InformationCircleIcon className="icon-info" />
              </Tooltip>
            </div>
            <div className="analytics-card-body">
              {isLoading ? (
                <>
                  <SkeletonLoader />
                  <SkeletonLoader />
                  <SkeletonLoader />
                </>
              ) : analysis?.topStrengths?.length ? (
                analysis.topStrengths.map((item) => (
                  <div key={item} className="tag tag-teal">
                    {item}
                  </div>
                ))
              ) : (
                <p className="placeholder-text">まだ分析できません。</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* コアバリューとキーワード */}
      <div className="analytics-card">
        <div className="analytics-card-header">
          <h3>あなたのコアバリュー</h3>
          <Tooltip text="あなたが人生で何を大切にし、何を指針に行動しているかを示唆する価値観です。">
            <InformationCircleIcon className="icon-info" />
          </Tooltip>
        </div>
        <div className="analytics-card-body">
          {isLoading ? (
            <>
              <SkeletonLoader />
              <SkeletonLoader />
            </>
          ) : analysis?.coreValues?.length ? (
            analysis.coreValues.map((value) => (
              <div key={value} className="tag tag-indigo">
                {value}
              </div>
            ))
          ) : (
            <p className="placeholder-text">まだ分析できません。</p>
          )}
        </div>

        <div className="analytics-divider">
          <h3>頻出キーワード</h3>
          <Tooltip text="あなたが頻繁に使っている言葉です。">
            <InformationCircleIcon className="icon-info" />
          </Tooltip>
        </div>
        <div className="analytics-keywords">
          {isLoading ? (
            <>
              <SkeletonLoader />
              <SkeletonLoader />
            </>
          ) : analysis?.keywords?.length ? (
            analysis.keywords.map((word) => (
              <div key={word} className="tag tag-cyan">
                {word}
              </div>
            ))
          ) : (
            <p className="placeholder-text">まだキーワードを抽出できません。</p>
          )}
        </div>
        <ReportButton
          onClick={() =>
            handleGenerateReport("STRENGTHS_VALUES", "あなたの強みと価値観 詳細レポート")
          }
          disabled={isLoading || !analysis?.coreValues?.length}
        />
      </div>

      {/* 心のポジション */}
      <SentimentPositionCard
        entries={entries}
        onClickReport={() =>
          handleGenerateReport("SENTIMENT_TREND", "心のポジション推移 詳細レポート")
        }
      />

      {/* モーダル */}
      <ReportModal
        isOpen={isReportModalOpen}
        onClose={closeReportModal}
        title={reportTitle}
        content={reportContent}
        isLoading={isReportLoading}
      />
    </div>
  );
};

export default AnalyticsView;
