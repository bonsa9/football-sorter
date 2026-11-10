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
  const [activeTab, setActiveTab] = useState<"ALL" | "PREMIER_LEAGUE" | "POSITIONS" | "NATIONS">("ALL");
  const [searchQuery, setSearchQuery] = useState("");

  const positionPoolIds = [
    "pl-strikers",
    "pl-midfielders",
    "pl-centre-backs",
    "pl-goalkeepers",
    "pl-managers",
  ];

  const clubPoolIds = [
    "arsenal-2026",
    "liverpool-2026",
    "mancity-2026",
    "chelsea-2026",
    "manutd-2026",
    "tottenham-2026",
    "aston-villa-2026",
  ];

  const nationPoolIds = ["spain-2026"];

  const getClubCardStyle = (poolId: string) => {
    switch (poolId) {
      case "arsenal-2026":
        return { background: "linear-gradient(135deg, #DB0007 0%, #9B0005 100%)", color: "#ffffff" };
      case "liverpool-2026":
        return { background: "linear-gradient(135deg, #C8102E 0%, #870014 100%)", color: "#ffffff" };
      case "mancity-2026":
        return { background: "linear-gradient(135deg, #6CABDD 0%, #1C2C5B 100%)", color: "#ffffff" };
      case "chelsea-2026":
        return { background: "linear-gradient(135deg, #034694 0%, #0A1E4A 100%)", color: "#ffffff" };
      case "manutd-2026":
        return { background: "linear-gradient(135deg, #DA291C 0%, #111111 100%)", color: "#ffffff" };
      case "tottenham-2026":
        return { background: "linear-gradient(135deg, #132257 0%, #080D24 100%)", color: "#ffffff" };
      case "aston-villa-2026":
        return { background: "linear-gradient(135deg, #670E36 0%, #95BFE5 100%)", color: "#ffffff" };
      case "spain-2026":
        return { background: "linear-gradient(135deg, #C60B1E 0%, #8A0614 100%)", color: "#ffffff" };
      case "pl-strikers":
        return { background: "linear-gradient(135deg, #ea580c 0%, #9a3412 100%)", color: "#ffffff" };
      case "pl-midfielders":
        return { background: "linear-gradient(135deg, #7c3aed 0%, #4c1d95 100%)", color: "#ffffff" };
      case "pl-centre-backs":
        return { background: "linear-gradient(135deg, #059669 0%, #064e3b 100%)", color: "#ffffff" };
      case "pl-goalkeepers":
        return { background: "linear-gradient(135deg, #d97706 0%, #78350f 100%)", color: "#ffffff" };
      case "pl-managers":
        return { background: "linear-gradient(135deg, #334155 0%, #0f172a 100%)", color: "#ffffff" };
      default:
        return { background: "linear-gradient(135deg, #1e293b 0%, #0f172a 100%)", color: "#ffffff" };
    }
  };

  const getPositionIcon = (id: string) => {
    if (id.includes("strikers")) return "⚡";
    if (id.includes("midfielders")) return "🪄";
    if (id.includes("centre-backs")) return "🛡️";
    if (id.includes("goalkeepers")) return "🧤";
    if (id.includes("managers")) return "👔";
    return "⚽";
  };

  const filteredPools = pools.filter((p) => {
    const matchesSearch = p.title.toLowerCase().includes(searchQuery.toLowerCase());
    if (!matchesSearch) return false;
    if (activeTab === "ALL") return true;
    if (activeTab === "POSITIONS") return positionPoolIds.includes(p.id);
    if (activeTab === "PREMIER_LEAGUE") return clubPoolIds.includes(p.id);
    if (activeTab === "NATIONS") return nationPoolIds.includes(p.id);
    return true;
  });

  return (
    <div className="home-screen-wrapper">
      {/* Header section matching Reference Screenshot 1 */}
      <header className="home-hero">
        <span className="home-kicker">PLAYER SORTER · PREMIER LEAGUE EDITION</span>
        <h1 className="home-huge-title">PICK A SQUAD &amp; START RANKING</h1>
        <p className="home-subtitle">
          Pick between two players at a time until your whole squad or position is ranked with authentic portraits.
        </p>

        {/* Feature quick links */}
        <div className="hero-feature-pills">
          <button
            type="button"
            className="hero-pill hero-pill-accent"
            onClick={() => onSelectPool("pl-strikers")}
          >
            ⚡ Premier League Strikers →
          </button>
          <button
            type="button"
            className="hero-pill hero-pill-accent"
            onClick={() => onSelectPool("pl-midfielders")}
          >
            🪄 Premier League Midfielders →
          </button>
          <button
            type="button"
            className="hero-pill hero-pill-white"
            onClick={() => onSelectPool("pl-managers")}
          >
            👔 Premier League Managers →
          </button>
        </div>

        {/* Navigation Tabs & Search Bar */}
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
              className={`cat-pill ${activeTab === "POSITIONS" ? "active" : ""}`}
              onClick={() => setActiveTab("POSITIONS")}
            >
              POSITIONS
            </button>
            <button
              type="button"
              className={`cat-pill ${activeTab === "PREMIER_LEAGUE" ? "active" : ""}`}
              onClick={() => setActiveTab("PREMIER_LEAGUE")}
            >
              PREMIER LEAGUE
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
              placeholder="Search squads, clubs, positions..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
      </header>

      {/* 1. Premier League by Position */}
      {(activeTab === "ALL" || activeTab === "POSITIONS") && (
        <section className="squad-section">
          <h2 className="league-title">PREMIER LEAGUE BY POSITION &amp; MANAGERS</h2>
          <div className="squads-cards-grid">
            {filteredPools
              .filter((p) => positionPoolIds.includes(p.id))
              .map((pool) => {
                const voteCount = localVoteCounts[pool.id] || 0;
                return (
                  <div
                    key={pool.id}
                    className="squad-club-card"
                    style={getClubCardStyle(pool.id)}
                    onClick={() => onSelectPool(pool.id)}
                    role="button"
                    tabIndex={0}
                  >
                    <div className="card-top-row">
                      <span className="card-club-badge">{getPositionIcon(pool.id)}</span>
                      <span className="card-rankings-pill">
                        {voteCount > 0 ? `${voteCount} rankings` : "Ready to rank"}
                      </span>
                    </div>
                    <div className="card-bottom-row">
                      <h3 className="card-club-name">{pool.title.toUpperCase()}</h3>
                      <div className="card-club-sub">
                        LEAGUE COMPARISON · {pool.memberIds.length} STARS
                      </div>
                    </div>
                  </div>
                );
              })}
          </div>
        </section>
      )}

      {/* 2. Premier League Clubs */}
      {(activeTab === "ALL" || activeTab === "PREMIER_LEAGUE") && (
        <section className="squad-section">
          <h2 className="league-title">PREMIER LEAGUE SQUADS (2026/27)</h2>
          <div className="squads-cards-grid">
            {filteredPools
              .filter((p) => clubPoolIds.includes(p.id))
              .map((pool) => {
                const voteCount = localVoteCounts[pool.id] || 0;
                return (
                  <div
                    key={pool.id}
                    className="squad-club-card"
                    style={getClubCardStyle(pool.id)}
                    onClick={() => onSelectPool(pool.id)}
                    role="button"
                    tabIndex={0}
                  >
                    <div className="card-top-row">
                      {pool.crestUrl ? (
                        <img
                          src={pool.crestUrl}
                          alt="crest"
                          className="card-crest-img"
                          referrerPolicy="no-referrer"
                        />
                      ) : (
                        <span className="card-club-badge">⚽</span>
                      )}
                      <span className="card-rankings-pill">
                        {voteCount > 0 ? `${voteCount} rankings` : "Ready to rank"}
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

      {/* 3. National Squads */}
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
                    className="squad-club-card"
                    style={getClubCardStyle(pool.id)}
                    onClick={() => onSelectPool(pool.id)}
                    role="button"
                    tabIndex={0}
                  >
                    <div className="card-top-row">
                      {pool.crestUrl ? (
                        <img
                          src={pool.crestUrl}
                          alt="crest"
                          className="card-crest-img"
                          referrerPolicy="no-referrer"
                        />
                      ) : (
                        <span className="card-club-badge">🇪🇸</span>
                      )}
                      <span className="card-rankings-pill">
                        {voteCount > 0 ? `${voteCount} rankings` : "Ready to rank"}
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

      {/* Footer matching reference */}
      <footer className="home-attribution-footer">
        <p>
          Squads from Wikipedia &amp; UEFA. Photos from UEFA and official club sites.
        </p>
        <p>
          Club names and marks belong to their owners. Made with love for football fans.
        </p>
      </footer>
    </div>
  );
};
