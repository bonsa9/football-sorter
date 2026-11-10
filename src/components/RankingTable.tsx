import React from "react";
import type { Player, Rating } from "../engine/types";

interface RankingTableProps {
  ratings: Rating[];
  playersMap: Map<string, Player>;
  totalVotes: number;
  targetVotes?: number;
}

export const RankingTable: React.FC<RankingTableProps> = ({
  ratings,
  playersMap,
  totalVotes,
  targetVotes = 25,
}) => {
  if (ratings.length === 0) {
    return (
      <div className="card text-center py-8">
        <p className="text-muted">No ranking data available yet.</p>
      </div>
    );
  }

  const isFullCalibration = totalVotes >= targetVotes;

  return (
    <div className="ranking-container">
      <div className="ranking-header">
        <div>
          <h2 className="section-title">Squad Rankings</h2>
          <p className="section-subtitle">
            Calculated via Bradley-Terry maximum likelihood estimation from{" "}
            <strong>{totalVotes}</strong> head-to-head {totalVotes === 1 ? "vote" : "votes"}.
            {isFullCalibration ? (
              <span className="text-success font-bold"> (25-vote calibration reached ✓)</span>
            ) : (
              <span className="text-muted"> (Target: {targetVotes} votes)</span>
            )}
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
              const isCalibrated = rating.votes >= 2 || (isFullCalibration && rating.votes >= 1);

              return (
                <tr key={rating.entityId} className={isCalibrated ? "row-verified" : "row-provisional"}>
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
                    {rating.votes === 0 ? (
                      <span className="badge badge-warning">Unrated (0 votes)</span>
                    ) : isCalibrated ? (
                      <span className="badge badge-success">Calibrated</span>
                    ) : (
                      <span className="badge badge-warning" title="Player needs at least 2 appearances">
                        Provisional (1 vote)
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
