export type Position = "GK" | "DEF" | "MID" | "FWD";

export type Player = {
  id: string; // stable slug, e.g. "lamine-yamal"
  name: string;
  clubId?: string;
  nationality?: string;
  position?: Position;
  birthDate?: string; // ISO date
  source: string; // where the data came from
  lastUpdated: string; // ISO date
};

export type PoolKind = "squad" | "custom" | "award" | "moments" | "managers";

export type Pool = {
  id: string; // e.g. "spain-2026"
  title: string; // e.g. "Spain 2026"
  kind: PoolKind;
  memberIds: string[]; // entities ranked in this pool
  createdAt: string;
};

export type VoteResult = "a" | "b" | "tie";

export type Vote = {
  poolId: string;
  a: string; // entity id
  b: string; // entity id
  result: VoteResult;
  sessionId: string; // anonymous, random, stored in localStorage
  createdAt: string;
};

export type Rating = {
  poolId: string;
  entityId: string;
  strength: number; // Bradley-Terry strength (log scale)
  votes: number; // number of votes involving this entity
  low: number; // lower confidence bound
  high: number; // upper confidence bound
};

export type RatingFile = {
  poolId: string;
  computedAt: string;
  totalVotes: number;
  ratings: Rating[]; // sorted best to worst
};

