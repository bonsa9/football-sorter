import React from "react";
import type { Player } from "../engine/types";

interface VoteCardProps {
  playerA: Player;
  playerB: Player;
  onVote: (winner: "a" | "b" | "tie") => void;
  voteCount: number;
  targetVotes: number;
  onFinishEarly?: () => void;
}

export const VoteCard: React.FC<VoteCardProps> = ({
  playerA,
  playerB,
  onVote,
  voteCount,
  targetVotes,
  onFinishEarly,
}) => {
  const currentRound = Math.min(voteCount + 1, targetVotes);
  const progressPercent = Math.min(100, Math.round((voteCount / targetVotes) * 100));

  return (
    <div className="vote-container">
      <div className="vote-header">
        <div className="vote-progress-info">
          <span className="vote-badge">Pairwise Calibration</span>
          <span className="vote-progress-text">
            Vote <strong>{currentRound}</strong> of {targetVotes} ({progressPercent}%)
          </span>
        </div>
        {voteCount >= 5 && onFinishEarly && (
          <button
            type="button"
            className="btn btn-outline btn-sm finish-early-btn"
            onClick={onFinishEarly}
          >
            Finish & View Rankings →
          </button>
        )}
      </div>

      <div className="progress-bar-container">
        <div
          className="progress-bar-fill"
          style={{ width: `${progressPercent}%` }}
        ></div>
      </div>

      <div className="matchup-grid">
        {/* Player A Card */}
        <div className="player-card" onClick={() => onVote("a")}>
          <div className="player-position">{playerA.position || "Player"}</div>
          <h2 className="player-name">{playerA.name}</h2>
          <div className="player-meta">
            {playerA.clubId && <span className="meta-tag">Club: {formatClub(playerA.clubId)}</span>}
            {playerA.nationality && <span className="meta-tag">{playerA.nationality}</span>}
          </div>
          <button
            type="button"
            className="btn btn-primary"
            onClick={(e) => {
              e.stopPropagation();
              onVote("a");
            }}
          >
            Select {playerA.name}
          </button>
        </div>

        {/* VS / Tie Center */}
        <div className="matchup-center">
          <div className="vs-circle">VS</div>
          <button
            type="button"
            className="btn btn-secondary tie-btn"
            onClick={() => onVote("tie")}
          >
            It's a Tie
          </button>
        </div>

        {/* Player B Card */}
        <div className="player-card" onClick={() => onVote("b")}>
          <div className="player-position">{playerB.position || "Player"}</div>
          <h2 className="player-name">{playerB.name}</h2>
          <div className="player-meta">
            {playerB.clubId && <span className="meta-tag">Club: {formatClub(playerB.clubId)}</span>}
            {playerB.nationality && <span className="meta-tag">{playerB.nationality}</span>}
          </div>
          <button
            type="button"
            className="btn btn-primary"
            onClick={(e) => {
              e.stopPropagation();
              onVote("b");
            }}
          >
            Select {playerB.name}
          </button>
        </div>
      </div>
    </div>
  );
};

function formatClub(clubId: string): string {
  return clubId
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}
