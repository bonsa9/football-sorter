import React, { useEffect } from "react";
import type { Player } from "../engine/types";
import { PlayerAvatar } from "./PlayerAvatar";

interface VoteCardProps {
  playerA: Player;
  playerB: Player;
  onVote: (winner: "a" | "b" | "tie") => void;
  onUndo?: () => void;
  canUndo?: boolean;
  onExit?: () => void;
  voteCount: number;
  targetVotes: number;
  kitColor: "home" | "away" | "third";
  onSetKitColor: (color: "home" | "away" | "third") => void;
}

export const VoteCard: React.FC<VoteCardProps> = ({
  playerA,
  playerB,
  onVote,
  onUndo,
  canUndo = false,
  onExit,
  voteCount,
  targetVotes,
  kitColor,
  onSetKitColor,
}) => {
  const currentMatchup = Math.min(voteCount + 1, targetVotes);
  const percentSorted = Math.min(100, Math.round((voteCount / targetVotes) * 100));

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger if user is in an input field
      if (
        document.activeElement?.tagName === "INPUT" ||
        document.activeElement?.tagName === "TEXTAREA"
      ) {
        return;
      }

      if (e.key === "ArrowLeft") {
        e.preventDefault();
        onVote("a");
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        onVote("b");
      } else if (e.key === "ArrowDown" || e.key.toLowerCase() === "t") {
        e.preventDefault();
        onVote("tie");
      } else if ((e.key === "Backspace" || e.key.toLowerCase() === "u") && canUndo && onUndo) {
        e.preventDefault();
        onUndo();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onVote, onUndo, canUndo]);

  const getPositionLabel = (pos?: string) => {
    switch (pos) {
      case "GK":
        return "GOALKEEPER";
      case "DEF":
        return "DEFENDER";
      case "MID":
        return "MIDFIELDER";
      case "FWD":
        return "FORWARD";
      default:
        return "PLAYER";
    }
  };

  return (
    <div className="vote-battle-screen">
      {/* Top Progress Bar & Matchup Counter */}
      <div className="vote-top-bar">
        <div className="matchup-indicator">
          MATCHUP {currentMatchup} OF {targetVotes}
        </div>
        <div className="percent-indicator">{percentSorted}% SORTED</div>
      </div>
      <div className="top-progress-track">
        <div
          className="top-progress-fill"
          style={{ width: `${percentSorted}%` }}
        ></div>
      </div>

      {/* Main Question Title */}
      <h1 className="battle-title">WHO DO YOU PREFER?</h1>

      {/* Head-to-Head Cards */}
      <div className="battle-cards-container">
        {/* Left Player Card */}
        <div
          className="battle-card"
          onClick={() => onVote("a")}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => e.key === "Enter" && onVote("a")}
        >
          <div className="battle-card-crest">🇪🇸</div>
          <div className="battle-card-avatar">
            <PlayerAvatar player={playerA} kitColor={kitColor} size="lg" />
          </div>
          <div className="battle-card-info">
            <span className="card-position-kicker">
              {getPositionLabel(playerA.position)}
            </span>
            <h2 className="card-player-name">{playerA.name}</h2>
            <div className="card-player-sub">
              #{playerA.number ?? "—"} · ESP
            </div>
          </div>
        </div>

        {/* Center VS Circle */}
        <div className="battle-vs-badge">VS</div>

        {/* Right Player Card */}
        <div
          className="battle-card"
          onClick={() => onVote("b")}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => e.key === "Enter" && onVote("b")}
        >
          <div className="battle-card-crest">🇪🇸</div>
          <div className="battle-card-avatar">
            <PlayerAvatar player={playerB} kitColor={kitColor} size="lg" />
          </div>
          <div className="battle-card-info">
            <span className="card-position-kicker">
              {getPositionLabel(playerB.position)}
            </span>
            <h2 className="card-player-name">{playerB.name}</h2>
            <div className="card-player-sub">
              #{playerB.number ?? "—"} · ESP
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Action Controls */}
      <div className="battle-actions">
        {canUndo && onUndo && (
          <button
            type="button"
            className="action-pill-btn btn-undo"
            onClick={onUndo}
          >
            Undo
          </button>
        )}
        <button
          type="button"
          className="action-pill-btn btn-tie"
          onClick={() => onVote("tie")}
        >
          Can't choose (tie)
        </button>
        {onExit && (
          <button
            type="button"
            className="action-pill-btn btn-exit"
            onClick={onExit}
          >
            Save & exit
          </button>
        )}
      </div>

      {/* Kit Color Switcher */}
      <div className="kit-color-switcher">
        <button
          type="button"
          className={`kit-pill-btn ${kitColor === "home" ? "active" : ""}`}
          onClick={() => onSetKitColor("home")}
        >
          <span className="kit-dot dot-home"></span> Home
        </button>
        <button
          type="button"
          className={`kit-pill-btn ${kitColor === "away" ? "active" : ""}`}
          onClick={() => onSetKitColor("away")}
        >
          <span className="kit-dot dot-away"></span> Away
        </button>
        <button
          type="button"
          className={`kit-pill-btn ${kitColor === "third" ? "active" : ""}`}
          onClick={() => onSetKitColor("third")}
        >
          <span className="kit-dot dot-third"></span> Third
        </button>
      </div>

      {/* Keyboard Shortcut Hints */}
      <p className="keyboard-shortcuts-hint">
        Keyboard: <strong>←</strong> / <strong>→</strong> to pick, <strong>↓</strong> for a tie, <strong>Backspace</strong> to undo
      </p>
    </div>
  );
};
