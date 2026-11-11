import React, { useState, useEffect, useMemo, useCallback } from "react";
import type { Player, Pool, Rating, Vote, Position, RatingFile } from "../engine/types";
import { computeBradleyTerry } from "../engine/bradleyTerry";
import { nextPair } from "../engine/pairSelection";
import { getLocalVotes, getSessionId, saveLocalVote, popLocalVote, clearLocalVotes } from "../lib/storage";
import { fetchRatings } from "../data/loaders";
import { VoteCard } from "../components/VoteCard";
import { RankingTable } from "../components/RankingTable";
import { PlayerAvatar } from "../components/PlayerAvatar";
import { ShareModal } from "../components/ShareModal";

/**
 * Formula used by merge-sort comparison sorters:
 * Worst-case comparisons: W(N) = N * ceil(log2(N)) - 2^ceil(log2(N)) + 1
 * For N = 24: 24 * 5 - 32 + 1 = 89 matchups (matches player-sorter exactly!)
 * For N = 20: 20 * 5 - 32 + 1 = 69 matchups
 */
export function getMaxMatchups(n: number): number {
  if (n <= 1) return 0;
  const k = Math.ceil(Math.log2(n));
  return n * k - Math.pow(2, k) + 1;
}

/**
 * Expected average comparisons to fully sort N items
 * Approximately N * log2(N) - 1.8 * N (around 50-55 for N=24, ~45 for N=20)
 */
export function getExpectedMatchups(n: number): number {
  if (n <= 1) return 0;
  return Math.max(10, Math.round(n * Math.log2(n) - 1.8 * n));
}

interface PoolPageProps {
  pool: Pool;
  players: Player[];
  onBack: () => void;
}

export const PoolPage: React.FC<PoolPageProps> = ({ pool, players, onBack }) => {
  const [votes, setVotes] = useState<Vote[]>(() => getLocalVotes(pool.id));
  const [currentPair, setCurrentPair] = useState<[string, string] | null>(null);
  const [viewState, setViewState] = useState<"roster" | "voting" | "rankings">("roster");
  const [selectedPositions, setSelectedPositions] = useState<Set<Position>>(
    new Set(["GK", "DEF", "MID", "FWD", "MGR"])
  );
  const [kitColor, setKitColor] = useState<"home" | "away" | "third">("home");
  const [communityRatings, setCommunityRatings] = useState<RatingFile | null>(null);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);

  // Load published community ratings if available
  useEffect(() => {
    fetchRatings(pool.id).then((data) => {
      if (data) setCommunityRatings(data);
    });
  }, [pool.id]);

  const sessionId = useMemo(() => getSessionId(), []);

  // Map of player ID to Player object
  const playersMap = useMemo(() => {
    const map = new Map<string, Player>();
    for (const p of players) {
      map.set(p.id, p);
    }
    return map;
  }, [players]);

  // Dynamic calculations based on selected roster size
  const filteredMemberIds = useMemo(() => {
    return pool.memberIds.filter((id) => {
      const p = playersMap.get(id);
      return p?.position ? selectedPositions.has(p.position) : true;
    });
  }, [pool.memberIds, playersMap, selectedPositions]);

  const activeRosterSize = filteredMemberIds.length;
  const maxPossibleMatchups = useMemo(() => getMaxMatchups(activeRosterSize), [activeRosterSize]);
  const targetCalibrationVotes = useMemo(() => getExpectedMatchups(activeRosterSize), [activeRosterSize]);

  // Compute live Bradley-Terry ratings from all votes in this pool
  const ratings: Rating[] = useMemo(() => {
    if (!pool.memberIds || pool.memberIds.length < 2) return [];
    return computeBradleyTerry(pool.id, pool.memberIds, votes);
  }, [pool, votes]);

  // Next pair selection
  const selectNext = useCallback(() => {
    if (filteredMemberIds.length < 2) return;
    const sessionHistory = votes.filter((v) => v.sessionId === sessionId);
    const subPool: Pool = {
      ...pool,
      memberIds: filteredMemberIds,
    };
    const pair = nextPair(subPool, ratings, votes, sessionHistory);
    setCurrentPair(pair);
  }, [pool, filteredMemberIds, ratings, votes, sessionId]);

  useEffect(() => {
    selectNext();
  }, [selectNext]);

  // Handle vote
  const handleVote = (result: "a" | "b" | "tie") => {
    if (!currentPair) return;

    const newVote: Vote = {
      poolId: pool.id,
      a: currentPair[0],
      b: currentPair[1],
      result,
      sessionId,
      createdAt: new Date().toISOString(),
    };

    const updated = saveLocalVote(newVote);
    const updatedPoolVotes = updated.filter((v) => v.poolId === pool.id);
    setVotes(updatedPoolVotes);

    if (updatedPoolVotes.length >= targetCalibrationVotes) {
      setViewState("rankings");
    } else {
      selectNext();
    }
  };

  // Handle undo
  const handleUndo = () => {
    const updated = popLocalVote(pool.id);
    setVotes(updated);
    selectNext();
  };

  const handleResetVotes = () => {
    if (window.confirm("Are you sure you want to reset your votes for this squad?")) {
      clearLocalVotes(pool.id);
      setVotes([]);
      selectNext();
      setViewState("roster");
    }
  };

  // Counts by position
  const positionCounts = useMemo(() => {
    const counts: Record<Position, number> = { GK: 0, DEF: 0, MID: 0, FWD: 0, MGR: 0 };
    for (const id of pool.memberIds) {
      const p = playersMap.get(id);
      if (p?.position && counts[p.position] !== undefined) {
        counts[p.position]++;
      }
    }
    return counts;
  }, [pool.memberIds, playersMap]);

  const getPoolBadge = (id: string) => {
    if (id.includes("strikers")) return "⚡";
    if (id.includes("midfielders")) return "🪄";
    if (id.includes("goalkeepers")) return "🧤";
    if (id.includes("managers")) return "👔";
    if (id.includes("arsenal")) return "🔴⚪";
    return "🇪🇸";
  };

  const togglePosition = (pos: Position) => {
    setSelectedPositions((prev) => {
      const next = new Set(prev);
      if (next.has(pos)) {
        if (next.size > 1) next.delete(pos);
      } else {
        next.add(pos);
      }
      return next;
    });
  };

  const playerA = currentPair ? playersMap.get(currentPair[0]) : null;
  const playerB = currentPair ? playersMap.get(currentPair[1]) : null;

  // Dynamic background matching authentic club kit colors
  const pageBgColor = useMemo(() => {
    if (pool.kits?.[kitColor]?.paper) {
      return pool.kits[kitColor].paper;
    }
    if (pool.id.includes("arsenal")) {
      return kitColor === "home" ? "#DB0007" : kitColor === "away" ? "#063672" : "#F5E6CC";
    }
    if (pool.id.includes("liverpool")) {
      return kitColor === "home" ? "#C8102E" : kitColor === "away" ? "#001f3f" : "#D2B48C";
    }
    if (pool.id.includes("mancity")) {
      return kitColor === "home" ? "#6CABDD" : kitColor === "away" ? "#1C2C5B" : "#1B2838";
    }
    if (pool.id.includes("chelsea")) {
      return kitColor === "home" ? "#034694" : kitColor === "away" ? "#111827" : "#0D9488";
    }
    if (pool.id.includes("manutd")) {
      return kitColor === "home" ? "#DA291C" : kitColor === "away" ? "#062A4E" : "#18181B";
    }
    if (pool.id.includes("tottenham")) {
      return kitColor === "home" ? "#132257" : kitColor === "away" ? "#0A122A" : "#15803D";
    }
    if (pool.id.includes("aston-villa")) {
      return kitColor === "home" ? "#670E36" : kitColor === "away" ? "#1E293B" : "#0C2340";
    }
    if (pool.id.includes("strikers")) return "#9a3412";
    if (pool.id.includes("midfielders")) return "#4c1d95";
    if (pool.id.includes("centre-backs")) return "#064e3b";
    if (pool.id.includes("goalkeepers")) return "#78350f";
    if (pool.id.includes("managers")) return "#0f172a";
    return kitColor === "home" ? "#C60B1E" : kitColor === "away" ? "#001f3f" : "#f7ede2";
  }, [pool, kitColor]);

  return (
    <div
      className={`squad-page-wrapper theme-${kitColor}`}
      style={{ backgroundColor: pageBgColor }}
    >
      {/* 1. VOTING / MATCHUP BATTLE VIEW */}
      {viewState === "voting" && (
        <div className="battle-view-container">
          {currentPair && playerA && playerB ? (
            <VoteCard
              playerA={playerA}
              playerB={playerB}
              onVote={handleVote}
              onUndo={handleUndo}
              canUndo={votes.length > 0}
              onExit={() => setViewState("roster")}
              voteCount={votes.length}
              targetVotes={targetCalibrationVotes}
              kitColor={kitColor}
              onSetKitColor={setKitColor}
            />
          ) : (
            <div className="completion-hero">
              <h1 className="hero-display-title">ALL MATCHUPS COMPLETED!</h1>
              <p className="hero-display-sub">
                You've completed every head-to-head comparison for this squad.
              </p>
              <div className="completion-buttons">
                <button
                  type="button"
                  className="btn-pill-primary"
                  onClick={() => setViewState("rankings")}
                >
                  View Final Rankings →
                </button>
                <button
                  type="button"
                  className="btn-pill-share"
                  onClick={() => setIsShareModalOpen(true)}
                >
                  📸 Export Poster / Story
                </button>
                <button
                  type="button"
                  className="btn-pill-secondary"
                  onClick={handleResetVotes}
                >
                  Reset My Votes
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* 2. SQUAD ROSTER OVERVIEW (Matching Image 2 & 3) */}
      {viewState === "roster" && (
        <div className="roster-view-container">
          {/* Top Banner Navigation */}
          <div className="roster-top-nav">
            <button type="button" className="nav-back-link" onClick={onBack}>
              ← ALL SQUADS
            </button>
            <div className="kit-switcher-compact">
              <span className="kit-label">COLORS</span>
              <div className="kit-color-switcher">
                <button
                  type="button"
                  className={`kit-pill-btn ${kitColor === "home" ? "active" : ""}`}
                  onClick={() => setKitColor("home")}
                >
                  <span className="kit-dot dot-home"></span> Home
                </button>
                <button
                  type="button"
                  className={`kit-pill-btn ${kitColor === "away" ? "active" : ""}`}
                  onClick={() => setKitColor("away")}
                >
                  <span className="kit-dot dot-away"></span> Away
                </button>
                <button
                  type="button"
                  className={`kit-pill-btn ${kitColor === "third" ? "active" : ""}`}
                  onClick={() => setKitColor("third")}
                >
                  <span className="kit-dot dot-third"></span> Third
                </button>
              </div>
            </div>
          </div>

          {/* Squad Header */}
          <div className="squad-hero-header">
            {pool.crestUrl ? (
              <img
                src={pool.crestUrl}
                alt="crest"
                className="squad-crest-large"
                referrerPolicy="no-referrer"
              />
            ) : (
              <div className="squad-badge-large">{getPoolBadge(pool.id)}</div>
            )}
            <div className="squad-title-group">
              <span className="squad-season-tag">
                {pool.kind === "managers" ? "PREMIER LEAGUE" : "2026/27 ROSTER"}
              </span>
              <h1 className="squad-huge-name">{pool.title.toUpperCase()}</h1>
            </div>
          </div>

          <p className="squad-feedback-link">
            Entities sourced from Wikipedia &amp; official football registries •{" "}
            <a
              href="https://en.wikipedia.org/"
              target="_blank"
              rel="noopener noreferrer"
            >
              View source
            </a>
          </p>

          {/* Filter & Action Card */}
          <div className="roster-control-card">
            <h2 className="control-card-title">
              Choose who to include in your ranking:
            </h2>

            <div className="position-filter-pills">
              {positionCounts.GK > 0 && (
                <button
                  type="button"
                  className={`pos-pill ${selectedPositions.has("GK") ? "active" : ""}`}
                  onClick={() => togglePosition("GK")}
                >
                  Goalkeepers {positionCounts.GK}
                </button>
              )}
              {positionCounts.DEF > 0 && (
                <button
                  type="button"
                  className={`pos-pill ${selectedPositions.has("DEF") ? "active" : ""}`}
                  onClick={() => togglePosition("DEF")}
                >
                  Defenders {positionCounts.DEF}
                </button>
              )}
              {positionCounts.MID > 0 && (
                <button
                  type="button"
                  className={`pos-pill ${selectedPositions.has("MID") ? "active" : ""}`}
                  onClick={() => togglePosition("MID")}
                >
                  Midfielders {positionCounts.MID}
                </button>
              )}
              {positionCounts.FWD > 0 && (
                <button
                  type="button"
                  className={`pos-pill ${selectedPositions.has("FWD") ? "active" : ""}`}
                  onClick={() => togglePosition("FWD")}
                >
                  Forwards {positionCounts.FWD}
                </button>
              )}
              {positionCounts.MGR > 0 && (
                <button
                  type="button"
                  className={`pos-pill ${selectedPositions.has("MGR") ? "active" : ""}`}
                  onClick={() => togglePosition("MGR")}
                >
                  Managers {positionCounts.MGR}
                </button>
              )}
            </div>

            <div className="roster-sub-status">
              {activeRosterSize} players · at most {maxPossibleMatchups} matchups
              {votes.length > 0 && ` (${votes.length} votes recorded)`}
            </div>

            <div className="roster-action-buttons">
              <button
                type="button"
                className="btn-start-sorting"
                onClick={() => setViewState("voting")}
              >
                {votes.length > 0 ? "Continue sorting" : "Start sorting"}
              </button>
              <button
                type="button"
                className="btn-community-ranking"
                onClick={() => setViewState("rankings")}
              >
                Community ranking
              </button>
            </div>
          </div>

          {/* 4-Column Player Cards Grid */}
          <div className="players-roster-grid">
            {filteredMemberIds.map((id) => {
              const player = playersMap.get(id);
              if (!player) return null;
              return (
                <div key={id} className="roster-player-chip">
                  <PlayerAvatar player={player} kitColor={kitColor} size="sm" />
                  <span className="roster-player-name">{player.name}</span>
                  <span className="roster-player-pos">{formatPos(player.position)}</span>
                </div>
              );
            })}
          </div>

          <footer className="roster-footer-disclaimer">
            <p>
              Squads from Wikipedia & official federation rosters.
            </p>
            <p>
              Club names and marks belong to their owners. Purely for nominative and comparison purposes.
            </p>
          </footer>
        </div>
      )}

      {/* 3. SQUAD RANKINGS VIEW */}
      {viewState === "rankings" && (
        <div className="rankings-view-container">
          <div className="roster-top-nav">
            <button
              type="button"
              className="nav-back-link"
              onClick={() => setViewState("roster")}
            >
              ← BACK TO ROSTER
            </button>
            <button
              type="button"
              className="btn-pill-primary"
              onClick={() => setViewState("voting")}
            >
              {votes.length >= targetCalibrationVotes ? "Vote More" : "Continue Voting"}
            </button>
          </div>

          <div className="squad-hero-header">
            <div className="squad-badge-large">🏆</div>
            <div className="squad-title-group">
              <span className="squad-season-tag">BRADLEY-TERRY CALIBRATION</span>
              <h1 className="squad-huge-name">SQUAD RANKING</h1>
            </div>
          </div>

          <div className="rankings-inner-card">
            <RankingTable
              myRatings={ratings}
              communityRatings={communityRatings}
              playersMap={playersMap}
              totalVotes={votes.length}
              targetVotes={targetCalibrationVotes}
              kitColor={kitColor}
              onContinueVoting={() => setViewState("voting")}
              onOpenShareModal={() => setIsShareModalOpen(true)}
            />
            <div className="ranking-table-footer">
              <button
                type="button"
                className="btn-start-sorting"
                onClick={() => setViewState("voting")}
              >
                Keep Voting
              </button>
              <button
                type="button"
                className="btn-community-ranking"
                onClick={() => setIsShareModalOpen(true)}
              >
                📸 Export Poster / Story
              </button>
              {votes.length > 0 && (
                <button
                  type="button"
                  className="btn-community-ranking text-danger"
                  onClick={handleResetVotes}
                >
                  Reset My Votes
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Share Poster Modal */}
      <ShareModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        pool={pool}
        ratings={ratings}
        playersMap={playersMap}
        kitColor={kitColor}
      />
    </div>
  );
};

function formatPos(pos?: string): string {
  switch (pos) {
    case "GK":
      return "GK";
    case "DEF":
      return "DF";
    case "MID":
      return "MF";
    case "FWD":
      return "FW";
    case "MGR":
      return "MGR";
    default:
      return "—";
  }
}
