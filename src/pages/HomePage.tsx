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
  const [activeTab, setActiveTab] = useState<"ALL" | "NATIONS" | "LALIGA" | "PREMIER">("ALL");
  const [searchQuery, setSearchQuery] = useState("");

  const popularClubs = [
    {
      id: "fc-barcelona",
      title: "FC BARCELONA",
      league: "LALIGA",
      season: "2026/27",
      rankings: "23.1k rankings",
      bgClass: "card-barca",
      badge: "🔵🔴",
    },
    {
      id: "real-madrid",
      title: "REAL MADRID",
      league: "LALIGA",
      season: "2026/27",
      rankings: "18.8k rankings",
      bgClass: "card-madrid",
      badge: "👑",
    },
    {
      id: "atletico-madrid",
      title: "ATLÉTICO DE MADRID",
      league: "LALIGA",
      season: "2026/27",
      rankings: "3.3k rankings",
      bgClass: "card-atletico",
      badge: "⚪🔴",
    },
    {
      id: "arsenal",
      title: "ARSENAL",
      league: "PREMIER",
      season: "2026/27",
      rankings: "15.4k rankings",
      bgClass: "card-arsenal",
      badge: "🔴⚪",
    },
    {
      id: "man-city",
      title: "MANCHESTER CITY",
      league: "PREMIER",
      season: "2026/27",
      rankings: "12.7k rankings",
      bgClass: "card-mancity",
      badge: "🩵",
    },
    {
      id: "liverpool",
      title: "LIVERPOOL",
      league: "PREMIER",
      season: "2026/27",
      rankings: "14.2k rankings",
      bgClass: "card-liverpool",
      badge: "🔴",
    },
  ];

  return (
    <div className="home-screen-wrapper">
      {/* Header section matching Image 1 */}
      <header className="home-hero">
        <span className="home-kicker">FOOTBALL SQUAD SORTER</span>
        <h1 className="home-huge-title">PICK A SQUAD &amp; START RANKING</h1>
        <p className="home-subtitle">
          Pick between two players at a time until your whole squad is ranked.
        </p>

        {/* Feature Pills */}
        <div className="hero-feature-pills">
          <a
            href="https://github.com/bonsa9/football-sorter/issues"
            target="_blank"
            rel="noopener noreferrer"
            className="hero-pill hero-pill-white"
          >
            Missing a squad or player? →
          </a>
          <button
            type="button"
            className="hero-pill hero-pill-accent"
            onClick={() => onSelectPool("spain-2026")}
          >
            ✦ Rank Spain 2026 Squad →
          </button>
        </div>

        {/* Category bar & Search matching Image 1 */}
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
              className={`cat-pill ${activeTab === "NATIONS" ? "active" : ""}`}
              onClick={() => setActiveTab("NATIONS")}
            >
              NATIONS
            </button>
            <button
              type="button"
              className={`cat-pill ${activeTab === "LALIGA" ? "active" : ""}`}
              onClick={() => setActiveTab("LALIGA")}
            >
              LALIGA
            </button>
            <button
              type="button"
              className={`cat-pill ${activeTab === "PREMIER" ? "active" : ""}`}
              onClick={() => setActiveTab("PREMIER")}
            >
              PREMIER LEAGUE
            </button>
          </div>

          <div className="search-input-pill">
            <span className="search-icon">🔍</span>
            <input
              type="text"
              placeholder="Search squads..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
      </header>

      {/* Primary Pool: Spain 2026 */}
      {(activeTab === "ALL" || activeTab === "NATIONS") && (
        <section className="squad-section">
          <h2 className="league-title">NATIONAL SQUADS (2026)</h2>
          <div className="squads-cards-grid">
            {pools.map((pool) => {
              const voteCount = localVoteCounts[pool.id] || 0;
              return (
                <div
                  key={pool.id}
                  className="squad-club-card card-spain"
                  onClick={() => onSelectPool(pool.id)}
                  role="button"
                  tabIndex={0}
                >
                  <div className="card-top-row">
                    <span className="card-club-badge">🇪🇸</span>
                    <span className="card-rankings-pill">
                      {voteCount > 0 ? `${voteCount} votes` : "Ready to rank"}
                    </span>
                  </div>
                  <div className="card-bottom-row">
                    <h3 className="card-club-name">{pool.title.toUpperCase()}</h3>
                    <div className="card-club-sub">
                      2026 SQUAD · {pool.memberIds.length} players
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* LaLiga & Premier League previews matching Image 1 */}
      {(activeTab === "ALL" || activeTab === "LALIGA") && (
        <section className="squad-section">
          <h2 className="league-title">LALIGA</h2>
          <div className="squads-cards-grid">
            {popularClubs
              .filter((c) => c.league === "LALIGA")
              .map((club) => (
                <div
                  key={club.id}
                  className={`squad-club-card ${club.bgClass}`}
                  onClick={() => onSelectPool("spain-2026")}
                  role="button"
                  tabIndex={0}
                >
                  <div className="card-top-row">
                    <span className="card-club-badge">{club.badge}</span>
                    <span className="card-rankings-pill">Available</span>
                  </div>
                  <div className="card-bottom-row">
                    <h3 className="card-club-name">{club.title}</h3>
                    <div className="card-club-sub">
                      {club.season} · {club.rankings}
                    </div>
                  </div>
                </div>
              ))}
          </div>
        </section>
      )}

      {(activeTab === "ALL" || activeTab === "PREMIER") && (
        <section className="squad-section">
          <h2 className="league-title">PREMIER LEAGUE</h2>
          <div className="squads-cards-grid">
            {popularClubs
              .filter((c) => c.league === "PREMIER")
              .map((club) => (
                <div
                  key={club.id}
                  className={`squad-club-card ${club.bgClass}`}
                  onClick={() => onSelectPool("spain-2026")}
                  role="button"
                  tabIndex={0}
                >
                  <div className="card-top-row">
                    <span className="card-club-badge">{club.badge}</span>
                    <span className="card-rankings-pill">Available</span>
                  </div>
                  <div className="card-bottom-row">
                    <h3 className="card-club-name">{club.title}</h3>
                    <div className="card-club-sub">
                      {club.season} · {club.rankings}
                    </div>
                  </div>
                </div>
              ))}
          </div>
        </section>
      )}

      {/* Attribution footer matching Image 3 */}
      <footer className="home-attribution-footer">
        <p>
          Squads from Wikipedia & official federation rosters.
        </p>
        <p>
          Club names and marks belong to their respective owners. Purely for nominative and comparison purposes.
        </p>
      </footer>
    </div>
  );
};
