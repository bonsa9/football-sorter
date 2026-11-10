import React, { useState, useEffect, useMemo, useCallback } from "react";
import type { Player, Pool, Rating, Vote, Position } from "../engine/types";
import { computeBradleyTerry } from "../engine/bradleyTerry";
import { nextPair } from "../engine/pairSelection";
import { getLocalVotes, getSessionId, saveLocalVote, popLocalVote, clearLocalVotes } from "../lib/storage";
import { VoteCard } from "../components/VoteCard";
import { RankingTable } from "../components/RankingTable";
import { PlayerAvatar } from "../components/PlayerAvatar";

const TARGET_CALIBRATION_VOTES = 25;

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
    new Set(["GK", "DEF", "MID", "FWD"])
  );
  const [kitColor, setKitColor] = useState<"home" | "away" | "third">("home");

  const sessionId = useMemo(() => getSessionId(), []);

  // Map of player ID to Player object
  const playersMap = useMemo(() => {
    const map = new Map<string, Player>();
    for (const p of players) {
      map.set(p.id, p);
    }
    return map;
  }, [players]);

  // Compute live Bradley-Terry ratings from all votes in this pool
  const ratings: Rating[] = useMemo(() => {
    if (!pool.memberIds || pool.memberIds.length < 2) return [];
    return computeBradleyTerry(pool.id, pool.memberIds, votes);
  }, [pool, votes]);

  // Next pair selection
  const selectNext = useCallback(() => {
    if (pool.memberIds.length < 2) return;
    const sessionHistory = votes.filter((v) => v.sessionId === sessionId);
    const pair = nextPair(pool, ratings, votes, sessionHistory);
    setCurrentPair(pair);
  }, [pool, ratings, votes, sessionId]);

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

    if (updatedPoolVotes.length >= TARGET_CALIBRATION_VOTES) {
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
    const counts: Record<Position, number> = { GK: 0, DEF: 0, MID: 0, FWD: 0 };
    for (const id of pool.memberIds) {
      const p = playersMap.get(id);
      if (p?.position && counts[p.position] !== undefined) {
        counts[p.position]++;
      }
    }
    return counts;
  }, [pool.memberIds, playersMap]);

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

  const filteredMemberIds = useMemo(() => {
    return pool.memberIds.filter((id) => {
      const p = playersMap.get(id);
      return p?.position ? selectedPositions.has(p.position) : true;
    });
  }, [pool.memberIds, playersMap, selectedPositions]);

  const playerA = currentPair ? playersMap.get(currentPair[0]) : null;
  const playerB = currentPair ? playersMap.get(currentPair[1]) : null;

  return (
    <div className={`squad-page-wrapper theme-${kitColor}`}>
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
              targetVotes={TARGET_CALIBRATION_VOTES}
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
            <div className="squad-badge-large">🇪🇸</div>
            <div className="squad-title-group">
              <span className="squad-season-tag">2026/27 SQUAD</span>
              <h1 className="squad-huge-name">SPAIN</h1>
            </div>
          </div>

          <p className="squad-feedback-link">
            Squad list sourced from Wikipedia (Spain national football team) •{" "}
            <a
              href="https://en.wikipedia.org/wiki/Spain_national_football_team"
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
              <button
                type="button"
                className={`pos-pill ${selectedPositions.has("GK") ? "active" : ""}`}
                onClick={() => togglePosition("GK")}
              >
                Goalkeepers {positionCounts.GK}
              </button>
              <button
                type="button"
                className={`pos-pill ${selectedPositions.has("DEF") ? "active" : ""}`}
                onClick={() => togglePosition("DEF")}
              >
                Defenders {positionCounts.DEF}
              </button>
              <button
                type="button"
                className={`pos-pill ${selectedPositions.has("MID") ? "active" : ""}`}
                onClick={() => togglePosition("MID")}
              >
                Midfielders {positionCounts.MID}
              </button>
              <button
                type="button"
                className={`pos-pill ${selectedPositions.has("FWD") ? "active" : ""}`}
                onClick={() => togglePosition("FWD")}
              >
                Forwards {positionCounts.FWD}
              </button>
            </div>

            <div className="roster-sub-status">
              {filteredMemberIds.length} players · at most {TARGET_CALIBRATION_VOTES} matchups
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
              {votes.length >= TARGET_CALIBRATION_VOTES ? "Vote More" : "Continue Voting"}
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
              ratings={ratings}
              playersMap={playersMap}
              totalVotes={votes.length}
              targetVotes={TARGET_CALIBRATION_VOTES}
            />
            <div className="ranking-table-footer">
              <button
                type="button"
                className="btn-start-sorting"
                onClick={() => setViewState("voting")}
              >
                Keep Voting
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
    default:
      return "—";
  }
}
