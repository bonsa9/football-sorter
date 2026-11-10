import React, { useState } from "react";
import type { Pool } from "../engine/types";

interface HomePageProps {
  pools: Pool[];
  localVoteCounts: Record<string, number>;
  onSelectPool: (poolId: string) => void;
}

export const HomePage: React.FC<HomePageProps> = ({
  pools,
  localVoteCounts,
  onSelectPool,
}) => {
  const [activeTab, setActiveTab] = useState<"ALL" | "WORLD" | "NATIONS" | "CLUBS">("ALL");
  const [searchQuery, setSearchQuery] = useState("");

  const worldPoolIds = ["world-strikers", "world-midfielders", "world-goalkeepers", "world-managers"];
  const clubPoolIds = ["arsenal-2026"];
  const nationPoolIds = ["spain-2026"];

  const getPoolBadge = (poolId: string) => {
    switch (poolId) {
      case "world-strikers":
        return "⚡";
      case "world-midfielders":
        return "🪄";
      case "world-goalkeepers":
        return "🧤";
      case "world-managers":
        return "👔";
      case "arsenal-2026":
        return "🔴⚪";
      case "spain-2026":
      default:
        return "🇪🇸";
    }
  };

  const getPoolGradient = (poolId: string) => {
    switch (poolId) {
      case "world-strikers":
        return "card-strikers";
      case "world-midfielders":
        return "card-midfielders";
      case "world-goalkeepers":
        return "card-goalkeepers";
      case "world-managers":
        return "card-managers";
      case "arsenal-2026":
        return "card-arsenal";
      case "spain-2026":
      default:
        return "card-spain";
    }
  };

  const filteredPools = pools.filter((p) => {
    const matchesSearch = p.title.toLowerCase().includes(searchQuery.toLowerCase());
    if (!matchesSearch) return false;
    if (activeTab === "ALL") return true;
    if (activeTab === "WORLD") return worldPoolIds.includes(p.id);
    if (activeTab === "CLUBS") return clubPoolIds.includes(p.id);
    if (activeTab === "NATIONS") return nationPoolIds.includes(p.id);
    return true;
  });

  return (
    <div className="home-screen-wrapper">
      {/* Header section matching Screenshot 1 */}
      <header className="home-hero">
        <span className="home-kicker">FOOTBALL SQUAD &amp; WORLD SORTER</span>
        <h1 className="home-huge-title">PICK A CATEGORY &amp; START RANKING</h1>
        <p className="home-subtitle">
          Vote head-to-head on the world's best players, managers, and squads with authentic photos.
        </p>

        {/* Feature Pills */}
        <div className="hero-feature-pills">
          <button
            type="button"
            className="hero-pill hero-pill-accent"
            onClick={() => onSelectPool("world-strikers")}
          >
            ⚡ Rank World's Best Strikers →
          </button>
          <button
            type="button"
            className="hero-pill hero-pill-accent"
            onClick={() => onSelectPool("world-midfielders")}
          >
            🪄 Rank World's Midfielders →
          </button>
          <button
            type="button"
            className="hero-pill hero-pill-white"
            onClick={() => onSelectPool("world-managers")}
          >
            👔 Rank World's Top Managers →
          </button>
        </div>

        {/* Category bar & Search matching Screenshot 1 */}
        <div className="home-filter-row">
          <div className="category-segmented-bar">
            <button
              type="button"
              className={`cat-pill ${activeTab === "ALL" ? "active" : ""}`}
              onClick={() => setActiveTab("ALL")}
            >
              ALL
            </button>
            <button
              type="button"
              className={`cat-pill ${activeTab === "WORLD" ? "active" : ""}`}
              onClick={() => setActiveTab("WORLD")}
            >
              WORLD ELITE
            </button>
            <button
              type="button"
              className={`cat-pill ${activeTab === "CLUBS" ? "active" : ""}`}
              onClick={() => setActiveTab("CLUBS")}
            >
              CLUBS
            </button>
            <button
              type="button"
              className={`cat-pill ${activeTab === "NATIONS" ? "active" : ""}`}
              onClick={() => setActiveTab("NATIONS")}
            >
              NATIONS
            </button>
          </div>

          <div className="search-input-pill">
            <span className="search-icon">🔍</span>
            <input
              type="text"
              placeholder="Search players, clubs, awards..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
      </header>

      {/* World Elite Categories */}
      {(activeTab === "ALL" || activeTab === "WORLD") && (
        <section className="squad-section">
          <h2 className="league-title">WORLD POSITIONS &amp; MANAGERS</h2>
          <div className="squads-cards-grid">
            {filteredPools
              .filter((p) => worldPoolIds.includes(p.id))
              .map((pool) => {
                const voteCount = localVoteCounts[pool.id] || 0;
                return (
                  <div
                    key={pool.id}
                    className={`squad-club-card ${getPoolGradient(pool.id)}`}
                    onClick={() => onSelectPool(pool.id)}
                    role="button"
                    tabIndex={0}
                  >
                    <div className="card-top-row">
                      <span className="card-club-badge">{getPoolBadge(pool.id)}</span>
                      <span className="card-rankings-pill">
                        {voteCount > 0 ? `${voteCount} votes` : "Ready to rank"}
                      </span>
                    </div>
                    <div className="card-bottom-row">
                      <h3 className="card-club-name">{pool.title.toUpperCase()}</h3>
                      <div className="card-club-sub">
                        GLOBAL POOL · {pool.memberIds.length} ENTITIES · PHOTOS
                      </div>
                    </div>
                  </div>
                );
              })}
          </div>
        </section>
      )}

      {/* Club Squads */}
      {(activeTab === "ALL" || activeTab === "CLUBS") && (
        <section className="squad-section">
          <h2 className="league-title">CLUB SQUADS (2026/27)</h2>
          <div className="squads-cards-grid">
            {filteredPools
              .filter((p) => clubPoolIds.includes(p.id))
              .map((pool) => {
                const voteCount = localVoteCounts[pool.id] || 0;
                return (
                  <div
                    key={pool.id}
                    className={`squad-club-card ${getPoolGradient(pool.id)}`}
                    onClick={() => onSelectPool(pool.id)}
                    role="button"
                    tabIndex={0}
                  >
                    <div className="card-top-row">
                      <span className="card-club-badge">{getPoolBadge(pool.id)}</span>
                      <span className="card-rankings-pill">
                        {voteCount > 0 ? `${voteCount} votes` : "Ready to rank"}
                      </span>
                    </div>
                    <div className="card-bottom-row">
                      <h3 className="card-club-name">{pool.title.toUpperCase()}</h3>
                      <div className="card-club-sub">
                        PREMIER LEAGUE · {pool.memberIds.length} PLAYERS
                      </div>
                    </div>
                  </div>
                );
              })}
          </div>
        </section>
      )}

      {/* National Teams */}
      {(activeTab === "ALL" || activeTab === "NATIONS") && (
        <section className="squad-section">
          <h2 className="league-title">NATIONAL SQUADS (2026 WORLD CUP)</h2>
          <div className="squads-cards-grid">
            {filteredPools
              .filter((p) => nationPoolIds.includes(p.id))
              .map((pool) => {
                const voteCount = localVoteCounts[pool.id] || 0;
                return (
                  <div
                    key={pool.id}
                    className={`squad-club-card ${getPoolGradient(pool.id)}`}
                    onClick={() => onSelectPool(pool.id)}
                    role="button"
                    tabIndex={0}
                  >
                    <div className="card-top-row">
                      <span className="card-club-badge">{getPoolBadge(pool.id)}</span>
                      <span className="card-rankings-pill">
                        {voteCount > 0 ? `${voteCount} votes` : "Ready to rank"}
                      </span>
                    </div>
                    <div className="card-bottom-row">
                      <h3 className="card-club-name">{pool.title.toUpperCase()}</h3>
                      <div className="card-club-sub">
                        2026 SQUAD · {pool.memberIds.length} PLAYERS
                      </div>
                    </div>
                  </div>
                );
              })}
          </div>
        </section>
      )}

      {/* Attribution footer */}
      <footer className="home-attribution-footer">
        <p>
          Squad rosters and portraits sourced from Wikipedia &amp; Wikimedia Commons under CC BY-SA 4.0 / Public Domain.
        </p>
        <p>
          Club names, marks, and player portraits belong to their respective copyright holders. Purely for nominative and comparison ranking purposes.
        </p>
      </footer>
    </div>
  );
};
