import { useState, useEffect } from "react";
import type { Player, Pool } from "./engine/types";
import { fetchPlayers, fetchPools } from "./data/loaders";
import { getLocalVotes } from "./lib/storage";
import { HomePage } from "./pages/HomePage";
import { PoolPage } from "./pages/PoolPage";
import "./App.css";

export function App() {
  const [pools, setPools] = useState<Pool[]>([]);
  const [players, setPlayers] = useState<Player[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedPoolId, setSelectedPoolId] = useState<string | null>(() => {
    // Check initial hash like #/pool/spain-2026
    const hash = window.location.hash;
    if (hash.startsWith("#/pool/")) {
      return hash.replace("#/pool/", "");
    }
    return null;
  });

  useEffect(() => {
    async function init() {
      try {
        const [loadedPools, loadedPlayers] = await Promise.all([
          fetchPools(),
          fetchPlayers(),
        ]);
        setPools(loadedPools);
        setPlayers(loadedPlayers);
      } catch (err) {
        console.error("Failed to load initial data", err);
      } finally {
        setLoading(false);
      }
    }
    init();
  }, []);

  // Sync hash routing
  useEffect(() => {
    const onHashChange = () => {
      const hash = window.location.hash;
      if (hash.startsWith("#/pool/")) {
        setSelectedPoolId(hash.replace("#/pool/", ""));
      } else {
        setSelectedPoolId(null);
      }
    };
    window.addEventListener("hashchange", onHashChange);
    return () => window.removeEventListener("hashchange", onHashChange);
  }, []);

  const handleSelectPool = (poolId: string) => {
    setSelectedPoolId(poolId);
    window.location.hash = `#/pool/${poolId}`;
  };

  const handleBackHome = () => {
    setSelectedPoolId(null);
    window.location.hash = "";
  };

  const localVoteCounts = pools.reduce<Record<string, number>>((acc, pool) => {
    acc[pool.id] = getLocalVotes(pool.id).length;
    return acc;
  }, {});

  const currentPool = pools.find((p) => p.id === selectedPoolId);

  return (
    <div className="app-shell">
      <nav className="site-nav">
        <div className="nav-inner">
          <div className="nav-brand" onClick={handleBackHome}>
            ⚽ <span>Football Sorter</span>
          </div>
          <div className="nav-links">
            <button
              type="button"
              className={`nav-link ${!selectedPoolId ? "active" : ""}`}
              onClick={handleBackHome}
            >
              Squads
            </button>
            <a
              href="https://github.com/bonsa9/football-sorter"
              target="_blank"
              rel="noopener noreferrer"
              className="nav-link"
            >
              GitHub
            </a>
          </div>
        </div>
      </nav>

      <main className="main-content">
        {loading ? (
          <div className="loading-state">
            <div className="spinner"></div>
            <p>Loading squad data...</p>
          </div>
        ) : currentPool ? (
          <PoolPage
            pool={currentPool}
            players={players}
            onBack={handleBackHome}
          />
        ) : (
          <HomePage
            pools={pools}
            localVoteCounts={localVoteCounts}
            onSelectPool={handleSelectPool}
          />
        )}
      </main>

      <footer className="site-footer">
        <div className="footer-inner">
          <p>© 2026 Football Sorter • Bradley-Terry Pairwise Ranking</p>
          <p className="text-muted text-xs">
            Data sourced from Wikipedia under CC BY-SA 4.0. No club crests or copyrighted photos hosted.
          </p>
        </div>
      </footer>
    </div>
  );
}

export default App;
