import { supabase } from "@/lib/supabaseClient";
import { JournalEntry, DatabaseDiary } from "@/types/journalTypes";

/**
 * DatabaseDiary を JournalEntry に変換します。
 */
const mapToJournalEntry = (item: DatabaseDiary): JournalEntry => ({
    id: item.id,
    createdAt: new Date(item.date),
    body: item.content,
    emotion: item.mood,
    action: (item as any).action || "",
    thought: (item as any).thought || "",
    tags: item.tags || [],
    summary: "",
    emotionLabel: [],
});

/**
 * 日記エントリーに関連する Supabase 操作を提供するサービス。
 */
export const journalService = {
    /**
     * 指定されたユーザーの日記一覧を取得します。
     */
    async getJournalEntries(userId: string): Promise<JournalEntry[]> {
        const { data, error } = await supabase
            .from("diaries")
            .select("*")
            .eq("user_id", userId)
            .order("date", { ascending: false });

        if (error) {
            console.error("Failed to fetch diaries:", {
                message: error.message,
                code: error.code,
                details: error.details,
                hint: error.hint
            });
            throw new Error(`Failed to fetch diaries: ${error.message}`);
        }

        return (data as DatabaseDiary[]).map(mapToJournalEntry);
    },

    /**
     * 日記を保存または更新（UPSERT）します。
     */
    async upsertJournalEntry(userId: string, entry: Partial<JournalEntry>): Promise<void> {
        console.log("[journalService] upsertJournalEntry called with:", { userId, entry });

        const payload: any = {
            user_id: userId,
            date: (entry.createdAt || new Date()).toISOString().split("T")[0],
            content: entry.body,
            mood: entry.emotion,
            tags: entry.tags || [],
        };

        // IDがあれば更新、なければ新規作成
        if (entry.id && !entry.id.includes("T")) {
            payload.id = entry.id;
        }

        console.log("[journalService] Final payload for Supabase:", payload);

        const { error } = await supabase
            .from("diaries")
            .upsert(payload, { onConflict: 'user_id,date' }); // 日付の重複があれば更新する設定

        if (error) {
            console.error("[journalService] Supabase Error:", error);
            console.error("[journalService] Failed payload:", payload);
            throw new Error(`Failed to save diary: ${error.message}`);
        }
    },

    /**
     * 指定されたIDの日記を削除します。
     */
    async deleteJournalEntry(entryId: string): Promise<void> {
        const { error } = await supabase
            .from("diaries")
            .delete()
            .eq("id", entryId);

        if (error) {
            console.error("Failed to delete diary:", error);
            throw new Error("Failed to delete diary");
        }
    }
};
