# Football Sorter: Build Plan

A static football ranking site. Users vote head-to-head ("which is better, A or B?"), and the site turns those votes into fair rankings. Hosted on GitHub Pages.

This file is the source of truth for the build. Work through the phases in order. Do not start a phase until the previous one's acceptance criteria are met.

---

## 0. Decisions (fill in before starting)

- [x] GitHub username: `bonsa9`
- [x] Repo name: `football-sorter`. Live URL will be `https://bonsa9.github.io/football-sorter/`
- [ ] Shared vote storage for Phase 2: Supabase (recommended) or Firebase
- [x] Personal or public project: `public`

Until these are set, Phases 1 is still fully buildable, since it uses no external services.

---

## 1. Stack

- **Vite + React + TypeScript** (static build, no server)
- **Vitest** for unit tests (ranking math and pair selection must be tested)
- **Tailwind CSS** for styling (optional, but keep the design system to a few tokens)
- **GitHub Actions** for build, deploy, and scheduled rating updates
- **Supabase** (Phase 2+) for shared votes, accessed directly from the browser with row-level security

Do not add a backend server, Next.js server features, or any service that requires a secret in the frontend.

---

## 2. Repo setup

Create the repo, then:

1. Scaffold with Vite: `npm create vite@latest <repo-name> -- --template react-ts`
2. Set `base` in `vite.config.ts` to `/<repo-name>/` for project pages. If the repo is named `<username>.github.io`, use `/` instead.
3. Add `.gitignore` (node_modules, dist), `README.md`, and `LICENSE` (MIT unless told otherwise).
4. Add a GitHub Actions workflow at `.github/workflows/deploy.yml` that builds and deploys `dist/` to GitHub Pages on push to `main`. Use the official `actions/deploy-pages` flow, not a `gh-pages` branch.
5. In repo settings, set Pages source to "GitHub Actions".
6. Confirm the empty site loads at the live URL before writing any features.

### Target folder structure

```
src/
  engine/          # pure TypeScript: Bradley-Terry, pair selection, types (no React imports)
  components/      # reusable UI (VoteCard, RankingTable, PoolCard)
  pages/           # Home, PoolPage, BuildYourOwn
  data/            # loaders for static JSON
  lib/             # storage adapters (localStorage, Supabase later)
public/
  data/
    pools/         # pool definitions (squads, custom pools)
    players/       # player records
    ratings/       # computed ratings, written by the scheduled job
scripts/
  compute-ratings.ts   # run by GitHub Actions
tests/
```

Keep the `engine/` folder free of React and browser APIs. It must run in Node for the scheduled job and in the browser for the live app.

---

## 3. Data model

Plain JSON files in `public/data/`. Use TypeScript types in `src/engine/types.ts`.

```ts
type Player = {
  id: string;            // stable slug, e.g. "lamine-yamal"
  name: string;
  clubId?: string;
  nationality?: string;
  position?: "GK" | "DEF" | "MID" | "FWD";
  birthDate?: string;    // ISO date
  source: string;        // where the data came from
  lastUpdated: string;   // ISO date
};

type Pool = {
  id: string;            // e.g. "spain-2026"
  title: string;         // e.g. "Spain 2026"
  kind: "squad" | "custom" | "award" | "moments" | "managers";
  memberIds: string[];   // entities ranked in this pool
  createdAt: string;
};

type Vote = {
  poolId: string;
  a: string;             // entity id
  b: string;             // entity id
  result: "a" | "b" | "tie";
  sessionId: string;     // anonymous, random, stored in localStorage
  createdAt: string;
};

type Rating = {
  poolId: string;
  entityId: string;
  strength: number;      // Bradley-Terry strength (log scale)
  votes: number;         // number of votes involving this entity
  low: number;           // lower confidence bound
  high: number;          // upper confidence bound
};

type RatingFile = {
  poolId: string;
  computedAt: string;
  totalVotes: number;
  ratings: Rating[];     // sorted best to worst
};
```

Votes are never edited or deleted by the public site. Only the scheduled job reads them in bulk.

---

## 4. Ranking engine (`src/engine/`)

This is the core of the product. Get it right and tested before building UI on top.

### 4.1 Bradley-Terry

Input: a list of votes for one pool. Output: a strength per entity.

- Use the iterative minorization-maximization algorithm (Hunter, 2004).
- Ties count as half a win for each side.
- Add a small prior (for example, one phantom win and one phantom loss against an average opponent) so that an entity that wins every vote does not get an infinite strength.
- Stop when the largest change in strength is below `1e-6`, or after 1000 iterations.
- Confidence intervals: bootstrap the votes 200 times and take the 5th and 95th percentile of each strength. Keep this in the scheduled job, not in the browser, because it is slow.

### 4.2 Pair selection

Function `nextPair(pool, ratings, votesSoFar, sessionHistory)` returns two entity ids.

Rules, in priority order:

1. Never show a pair the same session has already voted on in this pool.
2. Prefer entities with fewer votes.
3. Among candidates, prefer pairs whose current strengths are close (the vote is most informative there).
4. Break remaining ties randomly.

### 4.3 Tests (required)

- Bradley-Terry returns known strengths on a small synthetic dataset.
- Ties are handled symmetrically.
- An undefeated entity gets a finite strength.
- Vote order does not change the result.
- `nextPair` never returns a repeated pair in one session.
- Pool with fewer than 2 entities throws a clear error.

---

## 5. Phases

### Phase 1: Static prototype (no external services)

Goal: a live URL where one squad can be ranked, with votes stored in the browser.

Build:
- Home page listing pools (start with one: a national squad of your choice, with a small player list, 10 to 25 players).
- Pool page: shows two players at a time with "A", "B", and "Tie" buttons, plus a progress count.
- Votes saved to `localStorage` under a `sessionId`.
- Ranking view: runs Bradley-Terry in the browser from the local votes and shows the ordered list with vote counts and an "not enough votes yet" marker for players with fewer than 5 votes.
- Simple, readable design. No photos.

Acceptance criteria:
- [x] `npm run build` succeeds with no TypeScript errors
- [x] All engine tests pass
- [x] Site deploys to GitHub Pages from `main` via Actions
- [x] Refreshing the page keeps votes
- [x] Ranking updates after each vote
- [x] Works on a phone-sized screen

### Phase 2: Shared votes (Supabase)

Goal: votes from all users count toward one community ranking.

Build:
- Supabase project with a `votes` table matching the `Vote` type.
- Row-level security: anonymous users can insert votes, cannot update or delete, and cannot read other users' session ids.
- Client sends each vote to Supabase. Keep a lo```````````````````````````cal copy so the app works offline and retries failed sends.
- Keep the Supabase URL and anon key in the frontend config (these are public by design). Never put a service key in the repo or the frontend.
- Basic rate limiting: a maximum number of votes per session per minute, enforced in Postgres (for example, a trigger or a check on recent rows).

Acceptance criteria:
- [ ] Vote from one browser appears for another browser after the next ratings update
- [ ] Anonymous user cannot read or modify existing rows beyond what the policy allows
- [ ] Failed sends are retried and not duplicated
- [ ] Rate limit rejects a burst of votes from one session

### Phase 3: Scheduled ratings (GitHub Actions)

Goal: community rankings are computed and published as static JSON, on a schedule.

Build:
- `scripts/compute-ratings.ts` reads votes from Supabase using a read-only key stored as a GitHub Actions secret, runs the engine, and writes `public/data/ratings/<poolId>.json`.
- Workflow `.github/workflows/ratings.yml` runs nightly (`cron`) and on manual trigger. It commits changed rating files with a bot message, which triggers the deploy workflow.
- Ratings show a `computedAt` and `totalVotes` line in the UI.

Acceptance criteria:
- [ ] Manual trigger produces a commit with updated JSON
- [ ] Deploy runs after the commit and the live ranking matches the JSON
- [ ] Job fails loudly (non-zero exit) if Supabase is unreachable, and does not overwrite good data with empty data
- [ ] Secret is never printed in logs

### Phase 4: More pools and features

Add in this order. Each one reuses the engine, so the engine should not need changes.

1. **More squads.** Data for each squad lives in `public/data/players/` and a pool file. Source squad data from Wikipedia or official federation pages, and record the source on every player. Do not use photos unless their license is confirmed.
2. **"Build your own" pools.** Users pick 5 to 50 players from the catalogue. Stored as a `custom` pool. Custom pools are created in Supabase and ranked by the same job.
3. **Greatest moments.** Entities are goals, saves, or matches (text descriptions and links, no embedded video). Same voting flow.
4. **Manager rankings.** Entities are coaches. Same voting flow.
5. **Player comparison cards.** Pick two players, show stats side by side for a season, league, or era. Reads only the stats data, no voting.
6. **"Would he start for us?"** Pick a player and a club. Compare the player with the club's current starters on a few stats. Reads only the stats data.
7. **Career timelines.** Club spells, trophies, and season stats per player, with a chart of rating over time. Build last, because it needs the most data.

### Phase 5: Predictions and leaderboards

For transfer rumour polls and award predictions (for example, Ballon d'Or and FIFA The Best).

Build:
- `predictions` table in Supabase: a question, its options, a session id, and the chosen option.
- A `results` file that is filled in when the real outcome is known (manually, via a committed JSON file).
- Accuracy per session, shown on a leaderboard page. Sessions are anonymous until accounts are added.
- Prediction pages are open for voting before the event and locked after it.

Acceptance criteria:
- [ ] Votes lock at the announced time
- [ ] Leaderboard recomputes from results and predictions
- [ ] Result changes are committed, so history stays visible

### Phase 6 (optional): Accounts

Supabase Auth with Google sign-in. Lets users keep rankings across devices and claim leaderboard scores. Add only after Phase 5 is stable.

---

## 6. Content and licensing rules

These apply to every phase.

- Every player, match, and stat record has a `source` field and a `lastUpdated` field.
- Club names, crests, and player photos belong to their owners. Do not host them. Use text names, or link out only if the license allows it.
- Wikipedia text and data are reusable with attribution. Show the source on the site's About page.
- Include a Disclaimer and Attribution section on the site: data sources, the fact that the site is not affiliated with any club or federation, and a contact method for takedown requests.

---

## 7. Quality rules for the agent

- Keep `engine/` pure and fully tested. Do not merge engine changes without tests.
- Do not add dependencies without stating why in the commit message.
- Never commit secrets. Use `.env.local` for local development and GitHub Actions secrets for CI. Add `.env*` to `.gitignore`.
- Prefer small commits, one phase step per commit.
- Keep the UI usable on a 360px-wide phone screen.
- Before marking a phase done, run the build, the tests, and open the deployed site.

---

## 8. Open questions

- Which squad should be the Phase 1 pool? (Suggestion: a national team from the 2026 World Cup, since it has a clear, public squad list.)
- Will photos be used at all? If not, the design is text-first, which is simpler and avoids licensing risk.
- Which languages should the UI support? (English first. Amharic and Afaan Oromo would be a meaningful addition later.)
