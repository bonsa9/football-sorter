# Football Sorter

A static football ranking site. Users vote head-to-head ("which is better, A or B?"), and the site turns those votes into fair rankings using the Bradley-Terry ranking model. Hosted on GitHub Pages.

Live URL: [https://bonsa9.github.io/football-sorter/](https://bonsa9.github.io/football-sorter/)

## Features (Phase 1)

- **Head-to-head Pairwise Voting**: Compares squad members pair-by-pair without bias.
- **Bradley-Terry Engine**: Runs the iterative Minorization-Maximization (Hunter, 2004) algorithm in the browser with a phantom prior to ensure finite strengths.
- **Pair Selection Algorithm**:
  1. Never repeats pairs within a voting session.
  2. Prioritizes entities with fewer votes.
  3. Favors matchups between players with close strengths.
  4. Breaks remaining ties randomly.
- **Local Persistence**: Votes persist across browser refreshes via `localStorage`.
- **Pool "Spain 2026"**: Sourced from Wikipedia's Spain national football team squad with attribution and license compliance.

## Development

```bash
# Install dependencies
npm install

# Run unit tests
npm test

# Run dev server
npm run dev

# Build for production
npm run build
```

## Attribution & License

- Squad and player data sourced from [Wikipedia (Spain national football team)](https://en.wikipedia.org/wiki/Spain_national_football_team) under CC BY-SA 4.0.
- No copyrighted images or club badges are hosted.
- Code released under the [MIT License](LICENSE).
