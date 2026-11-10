import React, { useState, useEffect, useMemo, useCallback } from "react";
import type { Player, Pool, Rating, Vote } from "../engine/types";
import { computeBradleyTerry } from "../engine/bradleyTerry";
import { nextPair } from "../engine/pairSelection";
import { getLocalVotes, getSessionId, saveLocalVote, clearLocalVotes } from "../lib/storage";
import { VoteCard } from "../components/VoteCard";
import { RankingTable } from "../components/RankingTable";

const TARGET_CALIBRATION_VOTES = 25;

interface PoolPageProps {
  pool: Pool;
  players: Player[];
  onBack: () => void;
}

export const PoolPage: React.FC<PoolPageProps> = ({ pool, players, onBack }) => {
  const [votes, setVotes] = useState<Vote[]>(() => getLocalVotes(pool.id));
  const [currentPair, setCurrentPair] = useState<[string, string] | null>(null);
  const [activeTab, setActiveTab] = useState<"vote" | "ranking">("vote");
  const [bonusMode, setBonusMode] = useState<boolean>(false);

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
    const updatedPoolVotes = updated.filter((v) => v.poolId === pool.id);
    setVotes(updatedPoolVotes);

    // If reaching exactly the target calibration threshold, switch to ranking view
    if (updatedPoolVotes.length === TARGET_CALIBRATION_VOTES && !bonusMode) {
      setActiveTab("ranking");
    }
  };

  const handleResetVotes = () => {
    if (window.confirm("Are you sure you want to reset your local votes for this squad?")) {
      clearLocalVotes(pool.id);
      setVotes([]);
      setBonusMode(false);
      selectNext();
      setActiveTab("vote");
    }
  };

  const isCalibrationFinished = votes.length >= TARGET_CALIBRATION_VOTES && !bonusMode;
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
          Vote ({votes.length}/{TARGET_CALIBRATION_VOTES})
        </button>
        <button
          type="button"
          className={`tab-btn ${activeTab === "ranking" ? "tab-active" : ""}`}
          onClick={() => setActiveTab("ranking")}
        >
          Squad Rankings
        </button>
      </div>

      {activeTab === "vote" && (
        <div className="tab-content">
          {!isCalibrationFinished && currentPair && playerA && playerB ? (
            <VoteCard
              playerA={playerA}
              playerB={playerB}
              onVote={handleVote}
              voteCount={votes.length}
              targetVotes={TARGET_CALIBRATION_VOTES}
              onFinishEarly={() => setActiveTab("ranking")}
            />
          ) : (
            <div className="completion-card">
              <h2>🎉 Squad Calibration Complete!</h2>
              <p>
                You've completed {votes.length} head-to-head comparisons. The Bradley-Terry engine has converged on a clear, calibrated ranking for this squad.
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
                  className="btn btn-secondary"
                  onClick={() => {
                    setBonusMode(true);
                    selectNext();
                  }}
                >
                  Keep Voting (Bonus Matchups)
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

          {/* Quick preview of top 5 rankings below vote */}
          {votes.length > 0 && !isCalibrationFinished && (
            <div className="mini-ranking-preview">
              <div className="mini-ranking-header">
                <h3>Live Top 5 Preview</h3>
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
            targetVotes={TARGET_CALIBRATION_VOTES}
          />
          <div className="ranking-actions">
            <button
              type="button"
              className="btn btn-primary"
              onClick={() => {
                setBonusMode(true);
                setActiveTab("vote");
              }}
            >
              {votes.length >= TARGET_CALIBRATION_VOTES
                ? "Cast More Votes (Refine) →"
                : "Continue Voting →"}
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
