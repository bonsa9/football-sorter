import React from "react";
import type { Pool } from "../engine/types";

interface PoolCardProps {
  pool: Pool;
  voteCount: number;
  onSelect: (poolId: string) => void;
}

export const PoolCard: React.FC<PoolCardProps> = ({ pool, voteCount, onSelect }) => {
  return (
    <div className="pool-card">
      <div className="pool-card-header">
        <span className="badge badge-info">{pool.kind.toUpperCase()}</span>
        <span className="text-muted text-sm">{pool.memberIds.length} Players</span>
      </div>
      <h3 className="pool-title">{pool.title}</h3>
      <p className="pool-desc">
        Head-to-head ranking for Spain's 2026 national team squad candidates sourced from Wikipedia.
      </p>
      <div className="pool-footer">
        <span className="text-sm">
          {voteCount > 0 ? (
            <>
              <strong>{voteCount}</strong> local votes cast
            </>
          ) : (
            "Not started yet"
          )}
        </span>
        <button
          type="button"
          className="btn btn-primary btn-sm"
          onClick={() => onSelect(pool.id)}
        >
          {voteCount > 0 ? "Continue Ranking →" : "Start Ranking →"}
        </button>
      </div>
    </div>
  );
};
