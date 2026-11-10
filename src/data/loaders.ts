import type { Player, Pool } from "../engine/types";

// Base URL provided by Vite for GitHub Pages (e.g. /football-sorter/)
const BASE_URL = import.meta.env.BASE_URL || "/";

export async function fetchPools(): Promise<Pool[]> {
  try {
    const res = await fetch(`${BASE_URL}data/pools/index.json`);
    if (!res.ok) throw new Error(`HTTP error ${res.status}`);
    return await res.json();
  } catch (err) {
    console.warn("Falling back to embedded pool data:", err);
    return [
      {
        id: "spain-2026",
        title: "Spain 2026",
        kind: "squad",
        memberIds: [
          "unai-simon",
          "david-raya",
          "dani-carvajal",
          "robin-le-normand",
          "aymeric-laporte",
          "pau-cubarsi",
          "marc-cucurella",
          "alejandro-grimaldo",
          "pedro-porro",
          "rodri",
          "martin-zubimendi",
          "pedri",
          "dani-olmo",
          "fabian-ruiz",
          "mikel-merino",
          "lamine-yamal",
          "nico-williams",
          "alvaro-morata",
          "mikel-oyarzabal",
          "ferran-torres"
        ],
        createdAt: "2026-11-10T10:00:00Z"
      }
    ];
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
