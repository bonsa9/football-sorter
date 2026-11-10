import type { Vote } from "../engine/types";
import { enqueuePendingVote } from "./syncQueue";

const SESSION_STORAGE_KEY = "football_sorter_session_id";
const VOTES_STORAGE_KEY = "football_sorter_votes";

export function getSessionId(): string {
  let sessionId = localStorage.getItem(SESSION_STORAGE_KEY);
  if (!sessionId) {
    sessionId = "sess_" + Math.random().toString(36).substring(2, 11) + Date.now().toString(36);
    localStorage.setItem(SESSION_STORAGE_KEY, sessionId);
  }
  return sessionId;
}

export function getLocalVotes(poolId?: string): Vote[] {
  try {
    const raw = localStorage.getItem(VOTES_STORAGE_KEY);
    if (!raw) return [];
    const allVotes: Vote[] = JSON.parse(raw);
    if (!Array.isArray(allVotes)) return [];
    if (poolId) {
      return allVotes.filter((v) => v.poolId === poolId);
    }
    return allVotes;
  } catch (err) {
    console.error("Failed to read local votes:", err);
    return [];
  }
}

export function saveLocalVote(vote: Vote): Vote[] {
  // Ensure vote has a stable UUID for deduplication across local and remote
  const id = vote.id || (typeof crypto !== "undefined" && crypto.randomUUID ? crypto.randomUUID() : "v_" + Math.random().toString(36).substring(2) + Date.now().toString(36));
  const voteWithId: Vote = { ...vote, id };

  const currentVotes = getLocalVotes();
  const updatedVotes = [...currentVotes, voteWithId];
  try {
    localStorage.setItem(VOTES_STORAGE_KEY, JSON.stringify(updatedVotes));
  } catch (err) {
    console.error("Failed to save local vote:", err);
  }

  // Enqueue for background sync to Supabase (Phase 2)
  try {
    enqueuePendingVote(voteWithId);
  } catch (err) {
    console.warn("Could not enqueue vote for Supabase sync:", err);
  }

  return updatedVotes;
}

export function popLocalVote(poolId: string): Vote[] {
  const currentVotes = getLocalVotes();
  // Find last vote for this pool
  let lastIndex = -1;
  for (let i = currentVotes.length - 1; i >= 0; i--) {
    if (currentVotes[i].poolId === poolId) {
      lastIndex = i;
      break;
    }
  }

  if (lastIndex !== -1) {
    currentVotes.splice(lastIndex, 1);
    try {
      localStorage.setItem(VOTES_STORAGE_KEY, JSON.stringify(currentVotes));
    } catch (err) {
      console.error("Failed to update votes after undo:", err);
    }
  }

  return currentVotes.filter((v) => v.poolId === poolId);
}

export function clearLocalVotes(poolId?: string): void {
  try {
    if (poolId) {
      const remaining = getLocalVotes().filter((v) => v.poolId !== poolId);
      localStorage.setItem(VOTES_STORAGE_KEY, JSON.stringify(remaining));
    } else {
      localStorage.removeItem(VOTES_STORAGE_KEY);
    }
  } catch (err) {
    console.error("Failed to clear votes:", err);
  }
}
