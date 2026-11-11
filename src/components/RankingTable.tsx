import React, { useState } from "react";
import type { Player, Rating, RatingFile } from "../engine/types";
import { PlayerAvatar } from "./PlayerAvatar";

interface RankingTableProps {
  myRatings: Rating[];
  communityRatings?: RatingFile | null;
  playersMap: Map<string, Player>;
  totalVotes: number;
  targetVotes?: number;
  kitColor?: "home" | "away" | "third";
  onContinueVoting?: () => void;
}

export const RankingTable: React.FC<RankingTableProps> = ({
  myRatings,
  communityRatings,
  playersMap,
  totalVotes,
  targetVotes = 25,
  kitColor = "home",
  onContinueVoting,
}) => {
  const [activeTab, setActiveTab] = useState<"my" | "community">("my");
  const [copied, setCopied] = useState(false);

  const displayedRatings =
    activeTab === "community" && communityRatings?.ratings?.length
      ? communityRatings.ratings
      : myRatings;

  const displayedVotes =
    activeTab === "community" && communityRatings
      ? communityRatings.totalVotes
      : totalVotes;

  const isFullCalibration = displayedVotes >= targetVotes;

  const handleShare = () => {
    const text = `Check out my Football Sorter rankings! Ranked via head-to-head battles: ${window.location.href}`;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="ranking-container">
      {/* Ranking Header with Tabs */}
      <div className="ranking-top-bar">
        <div className="ranking-toggle-segmented">
          <button
            type="button"
            className={`ranking-toggle-btn ${activeTab === "my" ? "active" : ""}`}
            onClick={() => setActiveTab("my")}
          >
            My Ranking ({totalVotes} votes)
          </button>
          <button
            type="button"
            className={`ranking-toggle-btn ${activeTab === "community" ? "active" : ""}`}
            onClick={() => setActiveTab("community")}
          >
            Community Ranking ({communityRatings?.totalVotes || 0} votes)
          </button>
        </div>

        <div className="ranking-actions-group">
          {onContinueVoting && (
            <button
              type="button"
              className="btn-rank-action btn-vote-more"
              onClick={onContinueVoting}
            >
              ⚡ Vote More Matchups
            </button>
          )}
          <button
            type="button"
            className="btn-rank-action btn-share-link"
            onClick={handleShare}
          >
            {copied ? "✓ Link Copied!" : "🔗 Share Ranking"}
          </button>
        </div>
      </div>

      {/* Subtitle info */}
      <div className="ranking-info-banner">
        <p className="ranking-subtitle-text">
          {activeTab === "my" ? (
            <>
              Personal Bradley-Terry calibration from <strong>{totalVotes}</strong> head-to-head matchups.{" "}
              {isFullCalibration ? (
                <span className="text-calibrated">✓ Calibration target reached!</span>
              ) : (
                <span className="text-provisional">(Target: {targetVotes} votes)</span>
              )}
            </>
          ) : (
            <>
              Aggregated community ranking from <strong>{displayedVotes}</strong> votes across all users.
              {communityRatings?.computedAt && (
                <span className="community-updated-at">
                  {" "}• Updated: {new Date(communityRatings.computedAt).toLocaleDateString()}
                </span>
              )}
            </>
          )}
        </p>
      </div>

      {/* Table */}
      {displayedRatings.length === 0 ? (
        <div className="empty-ranking-card">
          <p>No votes recorded for this ranking yet.</p>
          {onContinueVoting && (
            <button type="button" className="btn-pill-primary" onClick={onContinueVoting}>
              Start Voting Now
            </button>
          )}
        </div>
      ) : (
        <div className="table-responsive">
          <table className="ranking-table">
            <thead>
              <tr>
                <th style={{ width: "4rem" }}>Rank</th>
                <th>Player / Manager</th>
                <th>Position</th>
                <th>Club / Nation</th>
                <th>Relative Strength</th>
                <th>Votes</th>
              </tr>
            </thead>
            <tbody>
              {displayedRatings.map((rating, index) => {
                const player = playersMap.get(rating.entityId);
                const rank = index + 1;
                const isPodium = rank <= 3;

                return (
                  <tr
                    key={rating.entityId}
                    className={`rank-row ${isPodium ? `podium-rank-${rank}` : ""}`}
                  >
                    <td className="rank-cell">
                      <span className={`rank-badge rank-${rank <= 3 ? rank : "other"}`}>
                        #{rank}
                      </span>
                    </td>
                    <td className="player-cell">
                      <div className="player-row-content">
                        {player ? (
                          <div className="player-row-avatar">
                            <PlayerAvatar player={player} kitColor={kitColor} size="sm" />
                          </div>
                        ) : null}
                        <div className="player-row-names">
                          <span className="player-row-name">
                            {player?.name || rating.entityId}
                          </span>
                          {player?.number && (
                            <span className="player-row-number">#{player.number}</span>
                          )}
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className={`pos-pill-tag pos-${player?.position || "GEN"}`}>
                        {player?.position || "—"}
                      </span>
                    </td>
                    <td>
                      <div className="club-cell-content">
                        {player?.crestUrl && (
                          <img
                            src={player.crestUrl}
                            alt=""
                            className="rank-crest-icon"
                            referrerPolicy="no-referrer"
                          />
                        )}
                        <span>{player?.clubName || player?.nationality || "—"}</span>
                      </div>
                    </td>
                    <td className="strength-cell">
                      <span className="strength-bar-wrapper">
                        <span
                          className="strength-bar-fill"
                          style={{
                            width: `${Math.min(100, Math.max(10, (rating.strength + 3) * 16))}%`,
                          }}
                        ></span>
                        <code className="strength-number">
                          {rating.strength >= 0 ? `+${rating.strength.toFixed(2)}` : rating.strength.toFixed(2)}
                        </code>
                      </span>
                    </td>
                    <td className="votes-cell">{rating.votes}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
