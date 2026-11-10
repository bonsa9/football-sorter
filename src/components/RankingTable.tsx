import React from "react";
import type { Player, Rating } from "../engine/types";

interface RankingTableProps {
  ratings: Rating[];
  playersMap: Map<string, Player>;
  totalVotes: number;
}

export const RankingTable: React.FC<RankingTableProps> = ({
  ratings,
  playersMap,
  totalVotes,
}) => {
  if (ratings.length === 0) {
    return (
      <div className="card text-center py-8">
        <p className="text-muted">No ranking data available yet.</p>
      </div>
    );
  }

  return (
    <div className="ranking-container">
      <div className="ranking-header">
        <div>
          <h2 className="section-title">Live Squad Rankings</h2>
          <p className="section-subtitle">
            Derived using Bradley-Terry maximum-likelihood estimation from{" "}
            <strong>{totalVotes}</strong> total votes.
          </p>
        </div>
      </div>

      <div className="table-responsive">
        <table className="ranking-table">
          <thead>
            <tr>
              <th style={{ width: "4rem" }}>Rank</th>
              <th>Player</th>
              <th>Position</th>
              <th>Club</th>
              <th>Strength</th>
              <th>Votes</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {ratings.map((rating, index) => {
              const player = playersMap.get(rating.entityId);
              const rank = index + 1;
              const hasEnoughVotes = rating.votes >= 5;

              return (
                <tr key={rating.entityId} className={hasEnoughVotes ? "row-verified" : "row-provisional"}>
                  <td className="rank-cell">
                    <span className={`rank-badge rank-${rank <= 3 ? rank : "other"}`}>
                      #{rank}
                    </span>
                  </td>
                  <td className="player-cell">
                    <strong>{player?.name || rating.entityId}</strong>
                  </td>
                  <td>
                    <span className="pos-badge">{player?.position || "—"}</span>
                  </td>
                  <td>{player?.clubId ? formatClub(player.clubId) : "—"}</td>
                  <td className="strength-cell">
                    <code>{rating.strength >= 0 ? `+${rating.strength.toFixed(2)}` : rating.strength.toFixed(2)}</code>
                  </td>
                  <td className="votes-cell">{rating.votes}</td>
                  <td>
                    {hasEnoughVotes ? (
                      <span className="badge badge-success">Calibrated</span>
                    ) : (
                      <span className="badge badge-warning" title="Player needs at least 5 votes for a calibrated rating">
                        Not enough votes yet ({rating.votes}/5)
                      </span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
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
