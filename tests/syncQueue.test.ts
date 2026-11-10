import { describe, expect, it, beforeEach } from "vitest";
import {
  enqueuePendingVote,
  getPendingVotes,
  savePendingVotes,
  flushSyncQueue,
} from "../src/lib/syncQueue";
import type { Vote } from "../src/engine/types";

// Simple in-memory localStorage polyfill for tests in node environment
const storageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] ?? null,
    setItem: (key: string, value: string) => {
      store[key] = value.toString();
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
  };
})();

Object.defineProperty(globalThis, "localStorage", {
  value: storageMock,
  writable: true,
});

describe("Offline Sync Queue & Deduplication", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("enqueues votes with stable IDs", () => {
    const vote: Vote = {
      poolId: "spain-2026",
      a: "rodri",
      b: "pedri",
      result: "a",
      sessionId: "test-session",
      createdAt: "2026-01-01T00:00:00Z",
    };

    enqueuePendingVote(vote);
    const pending = getPendingVotes();

    expect(pending).toHaveLength(1);
    expect(pending[0].poolId).toBe("spain-2026");
    expect(pending[0].id).toBeDefined();
    expect(typeof pending[0].id).toBe("string");
  });

  it("deduplicates identical votes with the same ID in the queue", () => {
    const vote: Vote = {
      id: "fixed-uuid-1234",
      poolId: "spain-2026",
      a: "rodri",
      b: "pedri",
      result: "a",
      sessionId: "test-session",
      createdAt: "2026-01-01T00:00:00Z",
    };

    enqueuePendingVote(vote);
    enqueuePendingVote(vote); // Duplicate enqueue

    const pending = getPendingVotes();
    expect(pending).toHaveLength(1);
    expect(pending[0].id).toBe("fixed-uuid-1234");
  });

  it("handles offline state gracefully without losing pending votes", async () => {
    const vote1: Vote = {
      id: "vote-1",
      poolId: "spain-2026",
      a: "rodri",
      b: "pedri",
      result: "a",
      sessionId: "test-session",
      createdAt: "2026-01-01T00:00:00Z",
    };
    const vote2: Vote = {
      id: "vote-2",
      poolId: "spain-2026",
      a: "pedri",
      b: "gavi",
      result: "b",
      sessionId: "test-session",
      createdAt: "2026-01-01T00:01:00Z",
    };

    savePendingVotes([vote1, vote2]);
    expect(getPendingVotes()).toHaveLength(2);

    // In local test environment without Supabase URL configured, flush leaves votes safely in queue
    const result = await flushSyncQueue();
    expect(result.remaining).toBe(2);
    expect(getPendingVotes()).toHaveLength(2);
  });
});
