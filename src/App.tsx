import { useState, useEffect } from "react";
import type { Player, Pool } from "./engine/types";
import { fetchPlayers, fetchPools } from "./data/loaders";
import { getLocalVotes } from "./lib/storage";
import { HomePage } from "./pages/HomePage";
import { PoolPage } from "./pages/PoolPage";
import { BuildYourOwnPage } from "./pages/BuildYourOwnPage";
import "./App.css";

export function App() {
  const [pools, setPools] = useState<Pool[]>([]);
  const [customPools, setCustomPools] = useState<Pool[]>([]);
  const [players, setPlayers] = useState<Player[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [view, setView] = useState<"home" | "pool" | "builder">("home");
  const [selectedPoolId, setSelectedPoolId] = useState<string | null>(null);

  // Shared custom list initial params
  const [sharedCustomParams, setSharedCustomParams] = useState<{
    title?: string;
    theme?: string;
    playerIds?: string[];
  }>({});

  useEffect(() => {
    async function init() {
      try {
        const [loadedPools, loadedPlayers] = await Promise.all([
          fetchPools(),
          fetchPlayers(),
        ]);
        setPools(loadedPools);
        setPlayers(loadedPlayers);

        // Parse initial hash
        parseHashRoute(window.location.hash, loadedPools);
      } catch (err) {
        console.error("Failed to load initial data", err);
      } finally {
        setLoading(false);
      }
    }
    init();
  }, []);

  function parseHashRoute(hash: string, _availablePools: Pool[]) {
    if (hash.startsWith("#/pool/")) {
      const poolId = hash.replace("#/pool/", "");
      setSelectedPoolId(poolId);
      setView("pool");
    } else if (hash.startsWith("#/build-your-own")) {
      setView("builder");
      setSelectedPoolId(null);
    } else if (hash.startsWith("#/custom")) {
      // Parse query params in hash: #/custom?name=...&theme=...&players=id1,id2
      const queryIdx = hash.indexOf("?");
      if (queryIdx >= 0) {
        const queryStr = hash.slice(queryIdx + 1);
        const params = new URLSearchParams(queryStr);
        const name = params.get("name") || "Shared Custom Squad";
        const theme = params.get("theme") || "neutral";
        const playerIdsStr = params.get("players") || "";
        const playerIds = playerIdsStr.split(",").map((s) => s.trim()).filter(Boolean);

        if (playerIds.length >= 2) {
          const customPool: Pool = {
            id: `custom-shared-${Date.now()}`,
            title: name,
            kind: "custom",
            teamId: theme,
            memberIds: playerIds,
            createdAt: new Date().toISOString(),
          };
          setCustomPools((prev) => [...prev, customPool]);
          setSelectedPoolId(customPool.id);
          setView("pool");
          return;
        } else {
          setSharedCustomParams({ title: name, theme, playerIds });
          setView("builder");
          return;
        }
      }
      setView("builder");
    } else {
      setView("home");
      setSelectedPoolId(null);
    }
  }

  // Sync hash routing
  useEffect(() => {
    const onHashChange = () => {
      parseHashRoute(window.location.hash, [...pools, ...customPools]);
    };
    window.addEventListener("hashchange", onHashChange);
    return () => window.removeEventListener("hashchange", onHashChange);
  }, [pools, customPools]);

  const handleSelectPool = (poolId: string) => {
    setSelectedPoolId(poolId);
    setView("pool");
    window.location.hash = `#/pool/${poolId}`;
  };

  const handleStartCustomRanking = (customPool: Pool) => {
    setCustomPools((prev) => [...prev, customPool]);
    setSelectedPoolId(customPool.id);
    setView("pool");
    window.location.hash = `#/pool/${customPool.id}`;
  };

  const handleNavigateToBuilder = () => {
    setView("builder");
    window.location.hash = "#/build-your-own";
  };

  const handleBackHome = () => {
    setSelectedPoolId(null);
    setView("home");
    window.location.hash = "";
  };

  const allPools = [...pools, ...customPools];
  const currentPool = allPools.find((p) => p.id === selectedPoolId);

  const localVoteCounts = allPools.reduce<Record<string, number>>((acc, pool) => {
    acc[pool.id] = getLocalVotes(pool.id).length;
    return acc;
  }, {});

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
      {view === "builder" ? (
        <BuildYourOwnPage
          allPlayers={players}
          onStartCustomRanking={handleStartCustomRanking}
          onBack={handleBackHome}
          initialSelectedIds={sharedCustomParams.playerIds}
          initialTitle={sharedCustomParams.title}
          initialTheme={sharedCustomParams.theme}
        />
      ) : view === "pool" && currentPool ? (
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
          onNavigateToBuilder={handleNavigateToBuilder}
        />
      )}
    </div>
  );
}

export default App;
