import React, { useState, useMemo } from "react";
import type { Player, Rating, RatingFile } from "../engine/types";
import { PlayerAvatar } from "./PlayerAvatar";

interface TierItem {
  rating: Rating;
  player?: Player;
  rank: number;
}

interface TierGroup {
  name: string;
  label: string;
  color: string;
  items: TierItem[];
}

interface RankingTableProps {
  myRatings: Rating[];
  communityRatings?: RatingFile | null;
  playersMap: Map<string, Player>;
  totalVotes: number;
  targetVotes?: number;
  kitColor?: "home" | "away" | "third";
  onContinueVoting?: () => void;
  onOpenShareModal?: () => void;
}

export const RankingTable: React.FC<RankingTableProps> = ({
  myRatings,
  communityRatings,
  playersMap,
  totalVotes,
  targetVotes = 25,
  kitColor = "home",
  onContinueVoting,
  onOpenShareModal,
}) => {
  const [activeTab, setActiveTab] = useState<"my" | "community">("my");
  const [viewLayout, setViewLayout] = useState<"table" | "tierlist">("table");
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

  // Group players into S, A, B, C, D tiers
  const tiers = useMemo<TierGroup[]>(() => {
    const hasVariance = displayedRatings.some(
      (r) => Math.abs(r.strength - (displayedRatings[0]?.strength || 0)) > 0.05
    );

    const S: { rating: Rating; player?: Player; rank: number }[] = [];
    const A: { rating: Rating; player?: Player; rank: number }[] = [];
    const B: { rating: Rating; player?: Player; rank: number }[] = [];
    const C: { rating: Rating; player?: Player; rank: number }[] = [];
    const D: { rating: Rating; player?: Player; rank: number }[] = [];

    displayedRatings.forEach((rating, idx) => {
      const player = playersMap.get(rating.entityId);
      const item = { rating, player, rank: idx + 1 };

      if (hasVariance) {
        if (rating.strength >= 1.2) {
          S.push(item);
        } else if (rating.strength >= 0.4) {
          A.push(item);
        } else if (rating.strength >= -0.4) {
          B.push(item);
        } else if (rating.strength >= -1.2) {
          C.push(item);
        } else {
          D.push(item);
        }
      } else {
        // Fallback percentile tiers if all strengths are equal (unvoted)
        const total = displayedRatings.length;
        if (idx < Math.ceil(total * 0.15)) S.push(item);
        else if (idx < Math.ceil(total * 0.4)) A.push(item);
        else if (idx < Math.ceil(total * 0.7)) B.push(item);
        else if (idx < Math.ceil(total * 0.9)) C.push(item);
        else D.push(item);
      }
    });

    return [
      { name: "S", label: "GOD TIER / MVP", color: "#eab308", items: S },
      { name: "A", label: "WORLD CLASS", color: "#10b981", items: A },
      { name: "B", label: "ELITE STARTER", color: "#0ea5e9", items: B },
      { name: "C", label: "SQUAD ROTATION", color: "#8b5cf6", items: C },
      { name: "D", label: "BENCH / PROVISIONAL", color: "#64748b", items: D },
    ];
  }, [displayedRatings, playersMap]);

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
          {onOpenShareModal && (
            <button
              type="button"
              className="btn-rank-action btn-export-poster"
              onClick={onOpenShareModal}
            >
              📸 Export Poster / Story
            </button>
          )}
          <button
            type="button"
            className="btn-rank-action btn-share-link"
            onClick={handleShare}
          >
            {copied ? "✓ Link Copied!" : "🔗 Copy Link"}
          </button>
        </div>
      </div>

      {/* Subtitle info & Layout Switcher */}
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

        {/* View Layout Toggle: Table vs Tier List */}
        <div className="layout-toggle-pills">
          <button
            type="button"
            className={`layout-pill-btn ${viewLayout === "table" ? "active" : ""}`}
            onClick={() => setViewLayout("table")}
          >
            📊 Table View
          </button>
          <button
            type="button"
            className={`layout-pill-btn ${viewLayout === "tierlist" ? "active" : ""}`}
            onClick={() => setViewLayout("tierlist")}
          >
            🏆 Tier List View
          </button>
        </div>
      </div>

      {/* Empty State */}
      {displayedRatings.length === 0 ? (
        <div className="empty-ranking-card">
          <p>No votes recorded for this ranking yet.</p>
          {onContinueVoting && (
            <button type="button" className="btn-pill-primary" onClick={onContinueVoting}>
              Start Voting Now
            </button>
          )}
        </div>
      ) : viewLayout === "tierlist" ? (
        /* Tier List View */
        <div className="tierlist-container">
          {tiers.map((tier: TierGroup) => (
            <div key={tier.name} className="tier-row">
              <div className="tier-header-badge" style={{ backgroundColor: tier.color }}>
                <span className="tier-letter">{tier.name}</span>
                <span className="tier-caption">{tier.label}</span>
              </div>
              <div className="tier-cards-row">
                {tier.items.length === 0 ? (
                  <span className="tier-empty-label">No players in this tier yet</span>
                ) : (
                  tier.items.map(({ player, rating, rank }: TierItem) => (
                    <div key={rating.entityId} className="tier-player-chip">
                      <div className="chip-avatar">
                        {player ? (
                          <PlayerAvatar player={player} kitColor={kitColor} size="sm" />
                        ) : null}
                      </div>
                      <div className="chip-info">
                        <span className="chip-rank">#{rank}</span>
                        <span className="chip-name">{player?.name || rating.entityId}</span>
                        <div className="chip-meta">
                          {player?.crestUrl && (
                            <img src={player.crestUrl} alt="" className="chip-crest" />
                          )}
                          <span>{player?.position || "—"}</span>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* Table View */
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
