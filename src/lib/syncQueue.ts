import type { Vote } from "../engine/types";
import { supabase, isSupabaseConfigured, voteToRow } from "./supabase";

const PENDING_QUEUE_KEY = "football_sorter_pending_votes";

let isSyncing = false;
let retryTimeout: ReturnType<typeof setTimeout> | null = null;

export function getPendingVotes(): Vote[] {
  try {
    const raw = localStorage.getItem(PENDING_QUEUE_KEY);
    if (!raw) return [];
    const list = JSON.parse(raw);
    return Array.isArray(list) ? list : [];
  } catch (err) {
    console.error("Failed to read pending votes queue:", err);
    return [];
  }
}

export function savePendingVotes(votes: Vote[]): void {
  try {
    localStorage.setItem(PENDING_QUEUE_KEY, JSON.stringify(votes));
  } catch (err) {
    console.error("Failed to save pending votes queue:", err);
  }
}

export function enqueuePendingVote(vote: Vote): void {
  const pending = getPendingVotes();
  // Ensure vote has a stable UUID for deduplication
  const id = vote.id || (typeof crypto !== "undefined" && crypto.randomUUID ? crypto.randomUUID() : "v_" + Math.random().toString(36).substring(2) + Date.now().toString(36));
  const voteWithId: Vote = { ...vote, id };

  // Avoid duplicate enqueue
  if (!pending.some((v) => v.id === voteWithId.id)) {
    pending.push(voteWithId);
    savePendingVotes(pending);
  }

  // Attempt background sync
  flushSyncQueue().catch((err) => {
    console.warn("Background sync error:", err);
  });
}

export async function flushSyncQueue(): Promise<{ sent: number; remaining: number }> {
  if (isSyncing) {
    return { sent: 0, remaining: getPendingVotes().length };
  }

  if (!isSupabaseConfigured() || !supabase) {
    return { sent: 0, remaining: getPendingVotes().length };
  }

  if (typeof navigator !== "undefined" && !navigator.onLine) {
    return { sent: 0, remaining: getPendingVotes().length };
  }

  const pending = getPendingVotes();
  if (pending.length === 0) {
    return { sent: 0, remaining: 0 };
  }

  isSyncing = true;
  try {
    // Process in batches of 25
    const batch = pending.slice(0, 25);
    const rows = batch.map(voteToRow);

    // Use upsert with ignoreDuplicates to guarantee idempotency and no duplicates
    const { error } = await supabase
      .from("votes")
      .upsert(rows, { onConflict: "id", ignoreDuplicates: true });

    if (error) {
      console.warn("Supabase vote sync encountered error:", error.message);
      // If rate limited or network failure, schedule retry with backoff
      scheduleRetry();
      return { sent: 0, remaining: pending.length };
    }

    // Success: remove sent batch from pending
    const sentIds = new Set(batch.map((b) => b.id));
    const remaining = pending.filter((v) => !sentIds.has(v.id));
    savePendingVotes(remaining);

    // If more pending remain, schedule immediate next batch
    if (remaining.length > 0) {
      setTimeout(() => {
        flushSyncQueue().catch(() => {});
      }, 200);
    }

    return { sent: batch.length, remaining: remaining.length };
  } catch (err) {
    console.warn("Unexpected error flushing sync queue:", err);
    scheduleRetry();
    return { sent: 0, remaining: pending.length };
  } finally {
    isSyncing = false;
  }
}

function scheduleRetry(delayMs = 5000): void {
  if (retryTimeout) clearTimeout(retryTimeout);
  retryTimeout = setTimeout(() => {
    retryTimeout = null;
    flushSyncQueue().catch(() => {});
  }, delayMs);
}

// Auto-sync when coming back online
if (typeof window !== "undefined") {
  window.addEventListener("online", () => {
    flushSyncQueue().catch(() => {});
  });
}

