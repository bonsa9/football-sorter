import type { Pool, Rating, Vote } from "./types";

/**
 * Returns the next pair of entities to present for voting.
 * Rules in priority order:
 * 1. Never show a pair the same session has already voted on in this pool.
 * 2. Prefer entities with fewer votes.
 * 3. Among candidates, prefer pairs whose current strengths are close.
 * 4. Break remaining ties randomly.
 */
export function nextPair(
  pool: Pool,
  ratings: Rating[] | Map<string, Rating>,
  votesSoFar: Vote[],
  sessionHistory: Vote[]
): [string, string] | null {
  if (!pool.memberIds || pool.memberIds.length < 2) {
    throw new Error("Pool must contain at least 2 entities");
  }

  // Build a lookup for ratings
  const ratingsMap = new Map<string, Rating>();
  if (Array.isArray(ratings)) {
    for (const r of ratings) {
      if (r.poolId === pool.id) {
        ratingsMap.set(r.entityId, r);
      }
    }
  } else if (ratings instanceof Map) {
    for (const [id, r] of ratings.entries()) {
      if (r.poolId === pool.id) {
        ratingsMap.set(id, r);
      }
    }
  }

  // Entity vote counts
  const voteCounts = new Map<string, number>();
  for (const id of pool.memberIds) {
    voteCounts.set(id, ratingsMap.get(id)?.votes ?? 0);
  }

  // In case ratings wasn't updated with votesSoFar, also tally from votesSoFar
  if (votesSoFar && votesSoFar.length > 0) {
    const tallied = new Map<string, number>();
    for (const id of pool.memberIds) {
      tallied.set(id, 0);
    }
    for (const v of votesSoFar) {
      if (v.poolId === pool.id) {
        if (tallied.has(v.a)) tallied.set(v.a, tallied.get(v.a)! + 1);
        if (tallied.has(v.b)) tallied.set(v.b, tallied.get(v.b)! + 1);
      }
    }
    for (const id of pool.memberIds) {
      const existing = voteCounts.get(id) ?? 0;
      const count = tallied.get(id) ?? 0;
      voteCounts.set(id, Math.max(existing, count));
    }
  }

  // Rule 1: Set of pairs voted in this session
  const votedPairs = new Set<string>();
  for (const v of sessionHistory) {
    if (v.poolId === pool.id) {
      const key = v.a < v.b ? `${v.a}::${v.b}` : `${v.b}::${v.a}`;
      votedPairs.add(key);
    }
  }

  // Generate all candidate unvoted pairs
  type Candidate = {
    a: string;
    b: string;
    minEntityVotes: number;
    totalVotes: number;
    strengthDiff: number;
  };

  const candidates: Candidate[] = [];
  const members = pool.memberIds;

  for (let i = 0; i < members.length; i++) {
    for (let j = i + 1; j < members.length; j++) {
      const a = members[i];
      const b = members[j];
      const key = a < b ? `${a}::${b}` : `${b}::${a}`;

      if (votedPairs.has(key)) {
        continue;
      }

      const votesA = voteCounts.get(a) ?? 0;
      const votesB = voteCounts.get(b) ?? 0;
      const minEntityVotes = Math.min(votesA, votesB);
      const totalVotes = votesA + votesB;

      const strengthA = ratingsMap.get(a)?.strength ?? 0;
      const strengthB = ratingsMap.get(b)?.strength ?? 0;
      const strengthDiff = Math.abs(strengthA - strengthB);

      candidates.push({
        a,
        b,
        minEntityVotes,
        totalVotes,
        strengthDiff,
      });
    }
  }

  if (candidates.length === 0) {
    return null;
  }

  // Rule 2: Prefer entities with fewer votes
  // First, find the minimum minEntityVotes among candidates
  let minEntityVotes = Infinity;
  for (const c of candidates) {
    if (c.minEntityVotes < minEntityVotes) {
      minEntityVotes = c.minEntityVotes;
    }
  }
  const minEntityPool = candidates.filter(
    (c) => c.minEntityVotes === minEntityVotes
  );

  // Then lowest totalVotes within that pool
  let minTotalVotes = Infinity;
  for (const c of minEntityPool) {
    if (c.totalVotes < minTotalVotes) {
      minTotalVotes = c.totalVotes;
    }
  }
  const minVotesPool = minEntityPool.filter(
    (c) => c.totalVotes === minTotalVotes
  );

  // Rule 3: Among candidates, prefer pairs whose current strengths are close
  let minStrengthDiff = Infinity;
  for (const c of minVotesPool) {
    if (c.strengthDiff < minStrengthDiff) {
      minStrengthDiff = c.strengthDiff;
    }
  }

  const bestCandidates = minVotesPool.filter(
    (c) => Math.abs(c.strengthDiff - minStrengthDiff) < 1e-6
  );

  // Rule 4: Break remaining ties randomly
  const chosenIndex = Math.floor(Math.random() * bestCandidates.length);
  const chosen = bestCandidates[chosenIndex];

  // Randomize display order between a and b
  return Math.random() < 0.5 ? [chosen.a, chosen.b] : [chosen.b, chosen.a];
}
