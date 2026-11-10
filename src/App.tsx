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

  if (loading) {
    return (
      <div className="home-screen-wrapper">
        <div className="loading-state">
          <p>Loading squad data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="app-shell">
      {currentPool ? (
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
    </div>
  );
}

export default App;
