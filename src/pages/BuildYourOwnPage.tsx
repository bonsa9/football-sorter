import React, { useState, useMemo } from "react";
import type { Player, Pool } from "../engine/types";
import { PlayerAvatar } from "../components/PlayerAvatar";

interface BuildYourOwnPageProps {
  allPlayers: Player[];
  onStartCustomRanking: (customPool: Pool) => void;
  onBack: () => void;
  initialSelectedIds?: string[];
  initialTitle?: string;
  initialTheme?: string;
}

const THEME_OPTIONS = [
  { id: "neutral", label: "Neutral Slate", color: "#0f172a" },
  { id: "arsenal", label: "Arsenal Red", color: "#DB0007" },
  { id: "liverpool", label: "Liverpool Crimson", color: "#C8102E" },
  { id: "mancity", label: "Man City Sky Blue", color: "#6CABDD" },
  { id: "chelsea", label: "Chelsea Royal Blue", color: "#034694" },
  { id: "manutd", label: "Man United Red", color: "#DA291C" },
  { id: "tottenham", label: "Spurs Navy", color: "#132257" },
  { id: "aston-villa", label: "Villa Claret", color: "#670E36" },
  { id: "gold", label: "Ballon d'Or Gold", color: "#ca8a04" },
];

export const BuildYourOwnPage: React.FC<BuildYourOwnPageProps> = ({
  allPlayers,
  onStartCustomRanking,
  onBack,
  initialSelectedIds = [],
  initialTitle = "My Custom Ranking",
  initialTheme = "neutral",
}) => {
  const [title, setTitle] = useState(initialTitle);
  const [selectedTheme, setSelectedTheme] = useState(initialTheme);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set(initialSelectedIds));
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedClubFilter, setSelectedClubFilter] = useState<string>("ALL");
  const [selectedPosFilter, setSelectedPosFilter] = useState<string>("ALL");
  const [copiedShareLink, setCopiedShareLink] = useState(false);

  // Group players by club
  const clubOptions = useMemo(() => {
    const set = new Set<string>();
    for (const p of allPlayers) {
      if (p.clubName) set.add(p.clubName);
    }
    return Array.from(set).sort();
  }, [allPlayers]);

  // Filtered available players
  const filteredPlayers = useMemo(() => {
    return allPlayers.filter((p) => {
      const matchesSearch =
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (p.clubName && p.clubName.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (p.nationality && p.nationality.toLowerCase().includes(searchQuery.toLowerCase()));
      if (!matchesSearch) return false;

      if (selectedClubFilter !== "ALL" && p.clubName !== selectedClubFilter) {
        return false;
      }
      if (selectedPosFilter !== "ALL" && p.position !== selectedPosFilter) {
        return false;
      }
      return true;
    });
  }, [allPlayers, searchQuery, selectedClubFilter, selectedPosFilter]);

  const togglePlayer = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        if (next.size >= 25) {
          alert("Maximum 25 players allowed in a ranking.");
          return prev;
        }
        next.add(id);
      }
      return next;
    });
  };

  const selectedPlayersList = useMemo(() => {
    const list: Player[] = [];
    for (const id of selectedIds) {
      const p = allPlayers.find((item) => item.id === id);
      if (p) list.push(p);
    }
    return list;
  }, [allPlayers, selectedIds]);

  const canStart = selectedIds.size >= 3;

  const handleStart = () => {
    if (!canStart) return;
    const customPool: Pool = {
      id: `custom-${Date.now()}`,
      title: title.trim() || "My Custom Ranking",
      kind: "custom",
      teamId: selectedTheme,
      memberIds: Array.from(selectedIds),
      createdAt: new Date().toISOString(),
    };
    onStartCustomRanking(customPool);
  };

  const handleCopyShareLink = () => {
    const ids = Array.from(selectedIds).join(",");
    const params = new URLSearchParams();
    params.set("name", title);
    params.set("theme", selectedTheme);
    params.set("players", ids);
    const shareUrl = `${window.location.origin}${window.location.pathname}#/custom?${params.toString()}`;

    if (navigator.clipboard) {
      navigator.clipboard.writeText(shareUrl);
      setCopiedShareLink(true);
      setTimeout(() => setCopiedShareLink(false), 2500);
    }
  };

  const loadPreset = (presetName: string) => {
    if (presetName === "attackers") {
      const fwdIds = allPlayers.filter((p) => p.position === "FWD").slice(0, 12).map((p) => p.id);
      setSelectedIds(new Set(fwdIds));
      setTitle("Top Premier League Attackers");
    } else if (presetName === "midfielders") {
      const midIds = allPlayers.filter((p) => p.position === "MID").slice(0, 12).map((p) => p.id);
      setSelectedIds(new Set(midIds));
      setTitle("Premier League Midfield Maestros");
    } else if (presetName === "defenders") {
      const defIds = allPlayers.filter((p) => p.position === "DEF").slice(0, 12).map((p) => p.id);
      setSelectedIds(new Set(defIds));
      setTitle("Rock Solid Premier League Defenders");
    } else if (presetName === "clear") {
      setSelectedIds(new Set());
    }
  };

  return (
    <div className="builder-screen-wrapper">
      {/* Top Navigation */}
      <div className="builder-top-nav">
        <button type="button" className="nav-back-link" onClick={onBack}>
          ← BACK TO SQUADS
        </button>
        <span className="builder-badge-pill">✦ CUSTOM SQUAD BUILDER</span>
      </div>

      {/* Header */}
      <header className="builder-header">
        <span className="builder-kicker">CUSTOM SORTER</span>
        <h1 className="builder-title">BUILD YOUR OWN RANKING</h1>
        <p className="builder-subtitle">
          Pick any 5 to 25 players across all clubs and leagues, choose your kit theme, and rank them head-to-head.
        </p>
      </header>

      {/* Configuration Bar */}
      <div className="builder-config-card">
        <div className="config-grid">
          {/* Custom Name */}
          <div className="config-field">
            <label className="config-label">Ranking Title</label>
            <input
              type="text"
              className="config-input-text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. My Premier League 2026 Dream XI"
              maxLength={40}
            />
          </div>

          {/* Theme Selector */}
          <div className="config-field">
            <label className="config-label">Kit Theme</label>
            <div className="theme-pills-row">
              {THEME_OPTIONS.map((theme) => (
                <button
                  key={theme.id}
                  type="button"
                  className={`theme-pill ${selectedTheme === theme.id ? "active" : ""}`}
                  onClick={() => setSelectedTheme(theme.id)}
                >
                  <span className="theme-color-dot" style={{ backgroundColor: theme.color }}></span>
                  {theme.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Selected Summary & Action Bar */}
        <div className="builder-action-bar">
          <div className="selection-stats">
            <span className="count-large">{selectedIds.size}</span>
            <span className="count-label">/ 25 players selected (minimum 3)</span>
          </div>

          <div className="action-buttons-row">
            {selectedIds.size >= 3 && (
              <button
                type="button"
                className="btn-share-custom-link"
                onClick={handleCopyShareLink}
              >
                {copiedShareLink ? "✓ Link Copied!" : "🔗 Share List Link"}
              </button>
            )}
            <button
              type="button"
              className="btn-start-custom-sort"
              onClick={handleStart}
              disabled={!canStart}
            >
              Start Sorting ({selectedIds.size}) →
            </button>
          </div>
        </div>

        {/* Selected Players Tray */}
        {selectedPlayersList.length > 0 && (
          <div className="selected-tray">
            <div className="tray-header">
              <span className="tray-title">Your Squad Selection:</span>
              <button
                type="button"
                className="btn-clear-tray"
                onClick={() => setSelectedIds(new Set())}
              >
                Clear all
              </button>
            </div>
            <div className="selected-chips-scroll">
              {selectedPlayersList.map((player) => (
                <div key={player.id} className="selected-player-badge">
                  <span className="badge-name">{player.name}</span>
                  <button
                    type="button"
                    className="btn-remove-chip"
                    onClick={() => togglePlayer(player.id)}
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Preset Quick Selects */}
      <div className="builder-presets-row">
        <span className="presets-label">Quick Presets:</span>
        <button
          type="button"
          className="btn-preset-pill"
          onClick={() => loadPreset("attackers")}
        >
          ⚡ Top Strikers (12)
        </button>
        <button
          type="button"
          className="btn-preset-pill"
          onClick={() => loadPreset("midfielders")}
        >
          🪄 Top Midfielders (12)
        </button>
        <button
          type="button"
          className="btn-preset-pill"
          onClick={() => loadPreset("defenders")}
        >
          🛡️ Top Defenders (12)
        </button>
      </div>

      {/* Search & Filter Row */}
      <div className="builder-filters-row">
        <div className="builder-search-box">
          <span className="search-icon">🔍</span>
          <input
            type="text"
            placeholder="Search players by name, club, nationality..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="filters-dropdowns">
          <select
            className="filter-select"
            value={selectedClubFilter}
            onChange={(e) => setSelectedClubFilter(e.target.value)}
          >
            <option value="ALL">All Clubs</option>
            {clubOptions.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>

          <select
            className="filter-select"
            value={selectedPosFilter}
            onChange={(e) => setSelectedPosFilter(e.target.value)}
          >
            <option value="ALL">All Positions</option>
            <option value="GK">Goalkeepers</option>
            <option value="DEF">Defenders</option>
            <option value="MID">Midfielders</option>
            <option value="FWD">Forwards</option>
            <option value="MGR">Managers</option>
          </select>
        </div>
      </div>

      {/* Player Selection Grid */}
      <div className="builder-players-grid">
        {filteredPlayers.map((player) => {
          const isSelected = selectedIds.has(player.id);
          return (
            <div
              key={player.id}
              className={`builder-player-card ${isSelected ? "selected" : ""}`}
              onClick={() => togglePlayer(player.id)}
            >
              <div className="card-check-indicator">
                {isSelected ? "✓" : "+"}
              </div>
              <div className="card-avatar-wrapper">
                <PlayerAvatar player={player} kitColor="home" size="sm" />
              </div>
              <div className="card-info-wrapper">
                <span className="player-name">{player.name}</span>
                <div className="player-meta">
                  {player.crestUrl && (
                    <img src={player.crestUrl} alt="" className="meta-crest" />
                  )}
                  <span>
                    {player.position} · {player.clubName || player.nationality}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

