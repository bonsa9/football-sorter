import type { Rating, Vote } from "./types";

export interface BradleyTerryOptions {
  maxIterations?: number;
  tolerance?: number;
  bootstrap?: boolean;
  bootstrapIterations?: number;
}

/**
 * Computes Bradley-Terry strengths for entities in a pool using
 * the Minorization-Maximization (MM) algorithm (Hunter, 2004)
 * with a phantom prior to handle undefeated/winless entities.
 */
export function computeBradleyTerry(
  poolId: string,
  memberIds: string[],
  votes: Vote[],
  options: BradleyTerryOptions = {}
): Rating[] {
  if (!memberIds || memberIds.length < 2) {
    throw new Error("Pool must contain at least 2 entities");
  }

  const maxIterations = options.maxIterations ?? 1000;
  const tolerance = options.tolerance ?? 1e-6;

  // Filter votes for this pool and between known members
  const memberSet = new Set(memberIds);
  const poolVotes = votes.filter(
    (v) => v.poolId === poolId && memberSet.has(v.a) && memberSet.has(v.b)
  );

  const N = memberIds.length;
  const idToIndex = new Map<string, number>();
  memberIds.forEach((id, index) => {
    idToIndex.set(id, index);
  });

  // Track vote counts and wins
  const voteCounts = new Array<number>(N).fill(0);
  const rawWins = new Array<number>(N).fill(0);
  const matchCounts: number[][] = Array.from({ length: N }, () =>
    new Array<number>(N).fill(0)
  );

  for (const vote of poolVotes) {
    const i = idToIndex.get(vote.a)!;
    const j = idToIndex.get(vote.b)!;

    voteCounts[i]++;
    voteCounts[j]++;
    matchCounts[i][j]++;
    matchCounts[j][i]++;

    if (vote.result === "a") {
      rawWins[i] += 1.0;
    } else if (vote.result === "b") {
      rawWins[j] += 1.0;
    } else if (vote.result === "tie") {
      rawWins[i] += 0.5;
      rawWins[j] += 0.5;
    }
  }

  const solveStrengths = (
    wins: number[],
    matches: number[][]
  ): number[] => {
    // Initial parameter vector pi = 1 for all entities
    let pi = new Array<number>(N).fill(1.0);

    for (let iter = 0; iter < maxIterations; iter++) {
      const nextPi = new Array<number>(N).fill(0);
      let maxChange = 0;

      for (let i = 0; i < N; i++) {
        // Hunter (2004) MM update with phantom prior:
        // Prior: 1 win and 1 loss against an average opponent with strength 1.0
        const totalWins = wins[i] + 1.0;
        let denom = 2.0 / (pi[i] + 1.0);

        for (let j = 0; j < N; j++) {
          if (i !== j && matches[i][j] > 0) {
            denom += matches[i][j] / (pi[i] + pi[j]);
          }
        }

        nextPi[i] = totalWins / denom;
      }

      // Normalize by geometric mean so that sum of log strengths = 0
      let logSum = 0;
      for (let i = 0; i < N; i++) {
        logSum += Math.log(nextPi[i]);
      }
      const geomMean = Math.exp(logSum / N);
      for (let i = 0; i < N; i++) {
        nextPi[i] /= geomMean;
      }

      // Check convergence in log-strength scale
      for (let i = 0; i < N; i++) {
        const change = Math.abs(Math.log(nextPi[i]) - Math.log(pi[i]));
        if (change > maxChange) {
          maxChange = change;
        }
      }

      pi = nextPi;
      if (maxChange < tolerance) {
        break;
      }
    }

    return pi.map((p) => Math.log(p));
  };

  const pointStrengths = solveStrengths(rawWins, matchCounts);

  let lowBounds = [...pointStrengths];
  let highBounds = [...pointStrengths];

  if (options.bootstrap && poolVotes.length > 0) {
    const B = options.bootstrapIterations ?? 200;
    const bootstrapStrengths: number[][] = Array.from({ length: N }, () => []);

    for (let b = 0; b < B; b++) {
      const bWins = new Array<number>(N).fill(0);
      const bMatches: number[][] = Array.from({ length: N }, () =>
        new Array<number>(N).fill(0)
      );

      for (let k = 0; k < poolVotes.length; k++) {
        const randIndex = Math.floor(Math.random() * poolVotes.length);
        const vote = poolVotes[randIndex];
        const i = idToIndex.get(vote.a)!;
        const j = idToIndex.get(vote.b)!;

        bMatches[i][j]++;
        bMatches[j][i]++;

        if (vote.result === "a") {
          bWins[i] += 1.0;
        } else if (vote.result === "b") {
          bWins[j] += 1.0;
        } else if (vote.result === "tie") {
          bWins[i] += 0.5;
          bWins[j] += 0.5;
        }
      }

      const sampleStrengths = solveStrengths(bWins, bMatches);
      for (let i = 0; i < N; i++) {
        bootstrapStrengths[i].push(sampleStrengths[i]);
      }
    }

    const lowIdx = Math.floor(0.05 * B);
    const highIdx = Math.min(B - 1, Math.floor(0.95 * B));

    lowBounds = bootstrapStrengths.map((arr) => {
      arr.sort((a, b) => a - b);
      return arr[lowIdx];
    });

    highBounds = bootstrapStrengths.map((arr) => {
      arr.sort((a, b) => a - b);
      return arr[highIdx];
    });
  }

  const ratings: Rating[] = memberIds.map((id, index) => ({
    poolId,
    entityId: id,
    strength: pointStrengths[index],
    votes: voteCounts[index],
    low: lowBounds[index],
    high: highBounds[index],
  }));

  // Sort best to worst (descending strength)
  ratings.sort((a, b) => {
    if (b.strength !== a.strength) {
      return b.strength - a.strength;
    }
    return a.entityId.localeCompare(b.entityId);
  });

  return ratings;
}

