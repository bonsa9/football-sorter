import type { Player, Pool, RatingFile } from "../engine/types";

// Base URL provided by Vite for GitHub Pages (e.g. /football-sorter/)
const BASE_URL = import.meta.env.BASE_URL || "/";

export async function fetchPools(): Promise<Pool[]> {
  try {
    const res = await fetch(`${BASE_URL}data/pools/index.json`);
    if (!res.ok) throw new Error(`HTTP error ${res.status}`);
    return await res.json();
  } catch (err) {
    console.warn("Falling back to embedded pool data:", err);
    return [];
  }
}

export async function fetchPlayers(): Promise<Player[]> {
  try {
    const res = await fetch(`${BASE_URL}data/players/index.json`);
    if (!res.ok) throw new Error(`HTTP error ${res.status}`);
    return await res.json();
  } catch (err) {
    console.warn("Falling back to embedded player data:", err);
    return [];
  }
}

export async function fetchRatings(poolId: string): Promise<RatingFile | null> {
  try {
    const res = await fetch(`${BASE_URL}data/ratings/${poolId}.json`);
    if (!res.ok) return null;
    return await res.json();
  } catch (err) {
    console.warn(`Could not load ratings for ${poolId}:`, err);
    return null;
  }
}

