import { describe, expect, it } from "vitest";
import {
  computeBradleyTerry,
  nextPair,
  type Pool,
  type Vote,
} from "../src/engine";

describe("Bradley-Terry Ranking Engine", () => {
  it("Bradley-Terry returns known strengths on a small synthetic dataset", () => {
    // 3 entities: a beats b, b beats c, a beats c
    const memberIds = ["player-a", "player-b", "player-c"];
    const poolId = "test-pool";
    const votes: Vote[] = [
      { poolId, a: "player-a", b: "player-b", result: "a", sessionId: "s1", createdAt: "2026-01-01" },
      { poolId, a: "player-a", b: "player-b", result: "a", sessionId: "s1", createdAt: "2026-01-01" },
      { poolId, a: "player-b", b: "player-c", result: "a", sessionId: "s1", createdAt: "2026-01-01" },
      { poolId, a: "player-b", b: "player-c", result: "a", sessionId: "s1", createdAt: "2026-01-01" },
      { poolId, a: "player-a", b: "player-c", result: "a", sessionId: "s1", createdAt: "2026-01-01" },
      { poolId, a: "player-a", b: "player-c", result: "a", sessionId: "s1", createdAt: "2026-01-01" },
    ];

    const ratings = computeBradleyTerry(poolId, memberIds, votes);

    expect(ratings).toHaveLength(3);
    expect(ratings[0].entityId).toBe("player-a");
    expect(ratings[1].entityId).toBe("player-b");
    expect(ratings[2].entityId).toBe("player-c");
    expect(ratings[0].strength).toBeGreaterThan(ratings[1].strength);
    expect(ratings[1].strength).toBeGreaterThan(ratings[2].strength);
  });

  it("Ties are handled symmetrically", () => {
    const memberIds = ["player-x", "player-y"];
    const poolId = "test-pool";
    const votes: Vote[] = [
      { poolId, a: "player-x", b: "player-y", result: "tie", sessionId: "s1", createdAt: "2026-01-01" },
      { poolId, a: "player-x", b: "player-y", result: "tie", sessionId: "s2", createdAt: "2026-01-01" },
    ];

    const ratings = computeBradleyTerry(poolId, memberIds, votes);
    const ratingX = ratings.find((r) => r.entityId === "player-x")!;
    const ratingY = ratings.find((r) => r.entityId === "player-y")!;

    expect(ratingX).toBeDefined();
    expect(ratingY).toBeDefined();
    expect(Math.abs(ratingX.strength - ratingY.strength)).toBeLessThan(1e-6);
  });

  it("An undefeated entity gets a finite strength", () => {
    const memberIds = ["dominant", "underdog"];
    const poolId = "test-pool";
    const votes: Vote[] = Array.from({ length: 20 }, (_, i) => ({
      poolId,
      a: "dominant",
      b: "underdog",
      result: "a",
      sessionId: `s${i}`,
      createdAt: "2026-01-01",
    }));

    const ratings = computeBradleyTerry(poolId, memberIds, votes);
    const dominant = ratings.find((r) => r.entityId === "dominant")!;
    const underdog = ratings.find((r) => r.entityId === "underdog")!;

    expect(Number.isFinite(dominant.strength)).toBe(true);
    expect(Number.isFinite(underdog.strength)).toBe(true);
    expect(dominant.strength).toBeGreaterThan(underdog.strength);
  });

  it("Vote order does not change the result", () => {
    const memberIds = ["alpha", "beta", "gamma", "delta"];
    const poolId = "test-pool";
    const votes: Vote[] = [
      { poolId, a: "alpha", b: "beta", result: "a", sessionId: "s1", createdAt: "2026-01-01" },
      { poolId, a: "gamma", b: "alpha", result: "b", sessionId: "s2", createdAt: "2026-01-02" },
      { poolId, a: "delta", b: "beta", result: "tie", sessionId: "s3", createdAt: "2026-01-03" },
      { poolId, a: "gamma", b: "delta", result: "a", sessionId: "s4", createdAt: "2026-01-04" },
      { poolId, a: "alpha", b: "delta", result: "a", sessionId: "s5", createdAt: "2026-01-05" },
      { poolId, a: "beta", b: "gamma", result: "b", sessionId: "s6", createdAt: "2026-01-06" },
    ];

    const ratingsOriginal = computeBradleyTerry(poolId, memberIds, votes);

    // Shuffle votes
    const shuffledVotes = [...votes].reverse();
    const ratingsShuffled = computeBradleyTerry(poolId, memberIds, shuffledVotes);

    for (const rOrig of ratingsOriginal) {
      const rShuf = ratingsShuffled.find((r) => r.entityId === rOrig.entityId)!;
      expect(Math.abs(rOrig.strength - rShuf.strength)).toBeLessThan(1e-6);
    }
  });

  it("Pool with fewer than 2 entities throws a clear error", () => {
    expect(() => computeBradleyTerry("pool", [], [])).toThrow(
      "Pool must contain at least 2 entities"
    );
    expect(() => computeBradleyTerry("pool", ["lonely"], [])).toThrow(
      "Pool must contain at least 2 entities"
    );

    const emptyPool: Pool = {
      id: "empty",
      title: "Empty",
      kind: "squad",
      memberIds: ["one"],
      createdAt: "2026-01-01",
    };
    expect(() => nextPair(emptyPool, [], [], [])).toThrow(
      "Pool must contain at least 2 entities"
    );
  });
});

describe("Pair Selection Engine", () => {
  const pool: Pool = {
    id: "spain-2026",
    title: "Spain 2026",
    kind: "squad",
    memberIds: ["p1", "p2", "p3", "p4", "p5"],
    createdAt: "2026-01-01",
  };

  it("nextPair never returns a repeated pair in one session", () => {
    const sessionHistory: Vote[] = [];
    const totalPairs = (pool.memberIds.length * (pool.memberIds.length - 1)) / 2; // 10 pairs
    const seenPairs = new Set<string>();

    for (let step = 0; step < totalPairs; step++) {
      const pair = nextPair(pool, [], [], sessionHistory);
      expect(pair).not.toBeNull();
      const [a, b] = pair!;
      const key = a < b ? `${a}::${b}` : `${b}::${a}`;

      expect(seenPairs.has(key)).toBe(false);
      seenPairs.add(key);

      sessionHistory.push({
        poolId: pool.id,
        a,
        b,
        result: "a",
        sessionId: "session-test",
        createdAt: "2026-01-01",
      });
    }

    expect(seenPairs.size).toBe(totalPairs);

    // After all pairs voted, nextPair returns null
    const noMore = nextPair(pool, [], [], sessionHistory);
    expect(noMore).toBeNull();
  });

  it("Prefers entities with fewer votes", () => {
    const ratings = [
      { poolId: pool.id, entityId: "p1", strength: 0.1, votes: 5, low: 0, high: 0 },
      { poolId: pool.id, entityId: "p2", strength: 0.1, votes: 5, low: 0, high: 0 },
      { poolId: pool.id, entityId: "p3", strength: 0.1, votes: 5, low: 0, high: 0 },
      { poolId: pool.id, entityId: "p4", strength: 0.0, votes: 0, low: 0, high: 0 },
      { poolId: pool.id, entityId: "p5", strength: 0.0, votes: 0, low: 0, high: 0 },
    ];

    const pair = nextPair(pool, ratings, [], []);
    expect(pair).not.toBeNull();
    // p4 and p5 have 0 votes each, so the pair should be [p4, p5] (in either order)
    const set = new Set(pair!);
    expect(set.has("p4")).toBe(true);
    expect(set.has("p5")).toBe(true);
  });
});

