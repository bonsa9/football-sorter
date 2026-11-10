import React, { useState, useEffect, useMemo, useCallback } from "react";
import type { Player, Pool, Rating, Vote } from "../engine/types";
import { computeBradleyTerry } from "../engine/bradleyTerry";
import { nextPair } from "../engine/pairSelection";
import { getLocalVotes, getSessionId, saveLocalVote, clearLocalVotes } from "../lib/storage";
import { VoteCard } from "../components/VoteCard";
import { RankingTable } from "../components/RankingTable";

interface PoolPageProps {
  pool: Pool;
  players: Player[];
  onBack: () => void;
}

export const PoolPage: React.FC<PoolPageProps> = ({ pool, players, onBack }) => {
  const [votes, setVotes] = useState<Vote[]>(() => getLocalVotes(pool.id));
  const [currentPair, setCurrentPair] = useState<[string, string] | null>(null);
  const [activeTab, setActiveTab] = useState<"vote" | "ranking">("vote");

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

  const totalPossiblePairs = (pool.memberIds.length * (pool.memberIds.length - 1)) / 2;

  // Pick the next pair based on current ratings and session history
  const selectNext = useCallback(() => {
    if (pool.memberIds.length < 2) return;
    const sessionHistory = votes.filter((v) => v.sessionId === sessionId);
    const pair = nextPair(pool, ratings, votes, sessionHistory);
    setCurrentPair(pair);
  }, [pool, ratings, votes, sessionId]);

  // Initial pair selection or re-selection when pool changes
  useEffect(() => {
    selectNext();
  }, [selectNext]);

  // Handle a vote
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
    setVotes(updated.filter((v) => v.poolId === pool.id));
  };

  const handleResetVotes = () => {
    if (window.confirm("Are you sure you want to reset your local votes for this squad?")) {
      clearLocalVotes(pool.id);
      setVotes([]);
      selectNext();
    }
  };

  const playerA = currentPair ? playersMap.get(currentPair[0]) : null;
  const playerB = currentPair ? playersMap.get(currentPair[1]) : null;

  return (
    <div className="pool-page-container">
      <div className="page-nav">
        <button type="button" className="btn btn-outline btn-sm" onClick={onBack}>
          ← Back to Squads
        </button>
        <div className="pool-header-info">
          <h1 className="pool-page-title">{pool.title}</h1>
          <span className="badge badge-info">{pool.memberIds.length} Squad Members</span>
        </div>
      </div>

      <div className="tabs-bar">
        <button
          type="button"
          className={`tab-btn ${activeTab === "vote" ? "tab-active" : ""}`}
          onClick={() => setActiveTab("vote")}
        >
          Vote ({votes.length})
        </button>
        <button
          type="button"
          className={`tab-btn ${activeTab === "ranking" ? "tab-active" : ""}`}
          onClick={() => setActiveTab("ranking")}
        >
          Live Rankings
        </button>
      </div>

      {activeTab === "vote" && (
        <div className="tab-content">
          {currentPair && playerA && playerB ? (
            <VoteCard
              playerA={playerA}
              playerB={playerB}
              onVote={handleVote}
              voteCount={votes.length}
              totalPossiblePairs={totalPossiblePairs}
            />
          ) : (
            <div className="completion-card">
              <h2>🎉 All Pairs Voted!</h2>
              <p>
                You have voted on all {totalPossiblePairs} possible matchups for this squad in this session!
              </p>
              <div className="completion-actions">
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={() => setActiveTab("ranking")}
                >
                  View Full Squad Rankings →
                </button>
                <button
                  type="button"
                  className="btn btn-outline"
                  onClick={handleResetVotes}
                >
                  Reset My Votes
                </button>
              </div>
            </div>
          )}

          {/* Quick preview of top 5 rankings right below vote */}
          {votes.length > 0 && (
            <div className="mini-ranking-preview">
              <div className="mini-ranking-header">
                <h3>Current Top 5</h3>
                <button
                  type="button"
                  className="btn-link"
                  onClick={() => setActiveTab("ranking")}
                >
                  See all {ratings.length} players →
                </button>
              </div>
              <ol className="mini-ranking-list">
                {ratings.slice(0, 5).map((r, i) => {
                  const p = playersMap.get(r.entityId);
                  return (
                    <li key={r.entityId}>
                      <span className="mini-rank">#{i + 1}</span>
                      <span className="mini-name">{p?.name || r.entityId}</span>
                      <span className="mini-pos">{p?.position}</span>
                      <span className="mini-votes">{r.votes} votes</span>
                    </li>
                  );
                })}
              </ol>
            </div>
          )}
        </div>
      )}

      {activeTab === "ranking" && (
        <div className="tab-content">
          <RankingTable
            ratings={ratings}
            playersMap={playersMap}
            totalVotes={votes.length}
          />
          <div className="ranking-actions">
            <button
              type="button"
              className="btn btn-primary"
              onClick={() => setActiveTab("vote")}
            >
              Continue Voting →
            </button>
            {votes.length > 0 && (
              <button
                type="button"
                className="btn btn-outline text-danger"
                onClick={handleResetVotes}
              >
                Reset Local Votes
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
