import React from "react";
import type { Pool } from "../engine/types";
import { PoolCard } from "../components/PoolCard";

interface HomePageProps {
  pools: Pool[];
  localVoteCounts: Record<string, number>;
  onSelectPool: (poolId: string) => void;
}

export const HomePage: React.FC<HomePageProps> = ({
  pools,
  localVoteCounts,
  onSelectPool,
}) => {
  return (
    <div className="home-container">
      <header className="hero-section">
        <h1 className="hero-title">Football Sorter</h1>
        <p className="hero-lead">
          Rank football squads fairly with head-to-head pairwise voting powered by the Bradley-Terry algorithm.
        </p>
      </header>

      <section className="section">
        <div className="section-header">
          <h2 className="section-title">Available Squad Pools</h2>
          <p className="section-subtitle">
            Choose a squad to start ranking players head-to-head.
          </p>
        </div>

        <div className="pools-grid">
          {pools.map((pool) => (
            <PoolCard
              key={pool.id}
              pool={pool}
              voteCount={localVoteCounts[pool.id] || 0}
              onSelect={onSelectPool}
            />
          ))}
        </div>
      </section>

      <section className="section info-section">
        <h3 className="text-xl font-bold mb-3">How it works</h3>
        <div className="features-grid">
          <div className="feature-item">
            <h4>1. Pairwise Comparisons</h4>
            <p>
              Instead of manually sorting an entire squad, you vote on simple head-to-head matchups ("A or B?").
            </p>
          </div>
          <div className="feature-item">
            <h4>2. Bradley-Terry Engine</h4>
            <p>
              The engine runs Minorization-Maximization in real time in your browser to compute mathematical player strengths.
            </p>
          </div>
          <div className="feature-item">
            <h4>3. Instant Calibration</h4>
            <p>
              Every vote instantly recalibrates the entire squad ranking. Votes are saved locally to your browser session.
            </p>
          </div>
        </div>
      </section>

      <section className="section disclaimer-section">
        <h3>Attribution & Disclaimer</h3>
        <p>
          Squad information and player details are sourced from{" "}
          <a
            href="https://en.wikipedia.org/wiki/Spain_national_football_team"
            target="_blank"
            rel="noopener noreferrer"
          >
            Wikipedia (Spain national football team)
          </a>{" "}
          under the CC BY-SA 4.0 license.
        </p>
        <p>
          This website is an independent project and is not affiliated with, endorsed by, or sponsored by the Royal Spanish Football Federation (RFEF), FIFA, UEFA, or any football club. All player names and club names are the property of their respective owners and are used purely for nominative and identification purposes.
        </p>
        <p className="text-sm text-muted mt-2">
          Contact for takedown requests or feedback: <a href="https://github.com/bonsa9/football-sorter/issues" target="_blank" rel="noopener noreferrer">GitHub Issues</a>
        </p>
      </section>
    </div>
  );
};

