import React, { useState, useMemo } from "react";
import { JournalEntry } from "../types/types";
import { ChevronLeftIcon, ChevronRightIcon } from "./Icons";

interface CalendarViewProps {
  entries: JournalEntry[];
  onSelectEntry: (entry: JournalEntry) => void;
}

// 感情ラベルに応じた色クラス（global.cssで定義）
const emotionClasses: { [key: string]: string } = {
  喜び: "emotion-joy",
  感謝: "emotion-gratitude",
  穏やか: "emotion-calm",
  充実感: "emotion-fulfilled",
  期待: "emotion-hope",
  不安: "emotion-anxiety",
  悲しい: "emotion-sad",
  分析できません: "emotion-error",
  default: "emotion-default",
};

const getEmotionClass = (emotion: string): string => {
  const key = Object.keys(emotionClasses).find((k) => emotion.includes(k));
  return key ? emotionClasses[key] : emotionClasses.default;
};

const CalendarView: React.FC<CalendarViewProps> = ({
  entries,
  onSelectEntry,
}) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const today = new Date();
  const todayString = today.toISOString().split("T")[0];

  const entriesMap = useMemo(() => {
    const map = new Map<string, JournalEntry>();
    entries.forEach((entry) => {
      const dateStr = entry.createdAt.toISOString().split("T")[0];
      if (!map.has(dateStr)) map.set(dateStr, entry);
    });
    return map;
  }, [entries]);

  const changeMonth = (amount: number) => {
    setCurrentDate((prev) => {
      const newDate = new Date(prev);
      newDate.setMonth(newDate.getMonth() + amount);
      return newDate;
    });
  };

  const goToToday = () => setCurrentDate(new Date());

  const { daysInMonth, firstDayOfMonth } = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    return {
      daysInMonth: new Date(year, month + 1, 0).getDate(),
      firstDayOfMonth: new Date(year, month, 1).getDay(),
    };
  }, [currentDate]);

  const calendarDays = useMemo(() => {
    const days = [];
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const prevMonthLastDay = new Date(year, month, 0).getDate();

    for (let i = firstDayOfMonth - 1; i >= 0; i--) {
      days.push({ day: prevMonthLastDay - i, isCurrentMonth: false });
    }
    for (let i = 1; i <= daysInMonth; i++) {
      days.push({ day: i, isCurrentMonth: true });
    }
    const remaining = 42 - days.length;
    for (let i = 1; i <= remaining; i++) {
      days.push({ day: i, isCurrentMonth: false });
    }
    return days;
  }, [currentDate, daysInMonth, firstDayOfMonth]);

  const weekDays = ["日", "月", "火", "水", "木", "金", "土"];

  return (
    <div className="calendar-container">
      {/* ヘッダー */}
      <div className="calendar-header">
        <h2 className="calendar-title">
          {currentDate.getFullYear()}年 {currentDate.getMonth() + 1}月
        </h2>
        <div className="calendar-nav">
          <button onClick={goToToday} className="calendar-today-btn">
            今日
          </button>
          <button onClick={() => changeMonth(-1)} className="calendar-arrow-btn">
            <ChevronLeftIcon className="calendar-icon" />
          </button>
          <button onClick={() => changeMonth(1)} className="calendar-arrow-btn">
            <ChevronRightIcon className="calendar-icon" />
          </button>
        </div>
      </div>

      {/* カレンダー */}
      <div className="calendar-grid">
        {weekDays.map((day) => (
          <div key={day} className="calendar-weekday">
            {day}
          </div>
        ))}

        {calendarDays.map((dayInfo, i) => {
          const year = currentDate.getFullYear();
          const month = currentDate.getMonth();
          const cellDate = dayInfo.isCurrentMonth
            ? new Date(year, month, dayInfo.day)
            : i < firstDayOfMonth
            ? new Date(year, month - 1, dayInfo.day)
            : new Date(year, month + 1, dayInfo.day);

          const dateStr = cellDate.toISOString().split("T")[0];
          const entry = entriesMap.get(dateStr);
          const isToday = dateStr === todayString;

          return (
            <div
              key={i}
              onClick={() =>
                entry && dayInfo.isCurrentMonth && onSelectEntry(entry)
              }
              className={`calendar-cell ${
                dayInfo.isCurrentMonth
                  ? entry
                    ? "calendar-cell-entry"
                    : "calendar-cell-empty"
                  : "calendar-cell-outside"
              }`}
            >
              <div
                className={`calendar-day ${
                  isToday ? "calendar-day-today" : ""
                } ${!dayInfo.isCurrentMonth ? "calendar-day-out" : ""}`}
              >
                {dayInfo.day}
              </div>

              {entry && dayInfo.isCurrentMonth && (
                <div className="calendar-emotions">
                  {entry.emotionLabel.slice(0, 2).map((label) => (
                    <div
                      key={label}
                      className={`calendar-emotion-tag ${getEmotionClass(
                        label
                      )}`}
                    >
                      {label}
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default CalendarView;
