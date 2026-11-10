import fs from "node:fs";
import path from "node:path";

const spainPlayers = [
  {
    id: "unai-simon",
    name: "Unai Simón",
    clubId: "athletic-bilbao",
    nationality: "Spain",
    position: "GK",
    birthDate: "1997-06-11",
    source: "https://en.wikipedia.org/wiki/Spain_national_football_team",
    lastUpdated: "2026-11-10"
  },
  {
    id: "david-raya",
    name: "David Raya",
    clubId: "arsenal",
    nationality: "Spain",
    position: "GK",
    birthDate: "1995-09-15",
    source: "https://en.wikipedia.org/wiki/Spain_national_football_team",
    lastUpdated: "2026-11-10"
  },
  {
    id: "dani-carvajal",
    name: "Dani Carvajal",
    clubId: "real-madrid",
    nationality: "Spain",
    position: "DEF",
    birthDate: "1992-01-11",
    source: "https://en.wikipedia.org/wiki/Spain_national_football_team",
    lastUpdated: "2026-11-10"
  },
  {
    id: "robin-le-normand",
    name: "Robin Le Normand",
    clubId: "atletico-madrid",
    nationality: "Spain",
    position: "DEF",
    birthDate: "1996-11-11",
    source: "https://en.wikipedia.org/wiki/Spain_national_football_team",
    lastUpdated: "2026-11-10"
  },
  {
    id: "aymeric-laporte",
    name: "Aymeric Laporte",
    clubId: "al-nassr",
    nationality: "Spain",
    position: "DEF",
    birthDate: "1994-05-27",
    source: "https://en.wikipedia.org/wiki/Spain_national_football_team",
    lastUpdated: "2026-11-10"
  },
  {
    id: "pau-cubarsi",
    name: "Pau Cubarsí",
    clubId: "barcelona",
    nationality: "Spain",
    position: "DEF",
    birthDate: "2007-01-22",
    source: "https://en.wikipedia.org/wiki/Spain_national_football_team",
    lastUpdated: "2026-11-10"
  },
  {
    id: "marc-cucurella",
    name: "Marc Cucurella",
    clubId: "chelsea",
    nationality: "Spain",
    position: "DEF",
    birthDate: "1998-07-22",
    source: "https://en.wikipedia.org/wiki/Spain_national_football_team",
    lastUpdated: "2026-11-10"
  },
  {
    id: "alejandro-grimaldo",
    name: "Alejandro Grimaldo",
    clubId: "bayer-leverkusen",
    nationality: "Spain",
    position: "DEF",
    birthDate: "1995-09-20",
    source: "https://en.wikipedia.org/wiki/Spain_national_football_team",
    lastUpdated: "2026-11-10"
  },
  {
    id: "pedro-porro",
    name: "Pedro Porro",
    clubId: "tottenham-hotspur",
    nationality: "Spain",
    position: "DEF",
    birthDate: "1999-09-13",
    source: "https://en.wikipedia.org/wiki/Spain_national_football_team",
    lastUpdated: "2026-11-10"
  },
  {
    id: "rodri",
    name: "Rodri",
    clubId: "manchester-city",
    nationality: "Spain",
    position: "MID",
    birthDate: "1996-06-22",
    source: "https://en.wikipedia.org/wiki/Spain_national_football_team",
    lastUpdated: "2026-11-10"
  },
  {
    id: "martin-zubimendi",
    name: "Martín Zubimendi",
    clubId: "real-sociedad",
    nationality: "Spain",
    position: "MID",
    birthDate: "1999-02-02",
    source: "https://en.wikipedia.org/wiki/Spain_national_football_team",
    lastUpdated: "2026-11-10"
  },
  {
    id: "pedri",
    name: "Pedri",
    clubId: "barcelona",
    nationality: "Spain",
    position: "MID",
    birthDate: "2002-11-25",
    source: "https://en.wikipedia.org/wiki/Spain_national_football_team",
    lastUpdated: "2026-11-10"
  },
  {
    id: "dani-olmo",
    name: "Dani Olmo",
    clubId: "barcelona",
    nationality: "Spain",
    position: "MID",
    birthDate: "1998-05-07",
    source: "https://en.wikipedia.org/wiki/Spain_national_football_team",
    lastUpdated: "2026-11-10"
  },
  {
    id: "fabian-ruiz",
    name: "Fabián Ruiz",
    clubId: "paris-saint-germain",
    nationality: "Spain",
    position: "MID",
    birthDate: "1996-04-03",
    source: "https://en.wikipedia.org/wiki/Spain_national_football_team",
    lastUpdated: "2026-11-10"
  },
  {
    id: "mikel-merino",
    name: "Mikel Merino",
    clubId: "arsenal",
    nationality: "Spain",
    position: "MID",
    birthDate: "1996-06-22",
    source: "https://en.wikipedia.org/wiki/Spain_national_football_team",
    lastUpdated: "2026-11-10"
  },
  {
    id: "lamine-yamal",
    name: "Lamine Yamal",
    clubId: "barcelona",
    nationality: "Spain",
    position: "FWD",
    birthDate: "2007-07-13",
    source: "https://en.wikipedia.org/wiki/Spain_national_football_team",
    lastUpdated: "2026-11-10"
  },
  {
    id: "nico-williams",
    name: "Nico Williams",
    clubId: "athletic-bilbao",
    nationality: "Spain",
    position: "FWD",
    birthDate: "2002-07-12",
    source: "https://en.wikipedia.org/wiki/Spain_national_football_team",
    lastUpdated: "2026-11-10"
  },
  {
    id: "alvaro-morata",
    name: "Álvaro Morata",
    clubId: "milan",
    nationality: "Spain",
    position: "FWD",
    birthDate: "1992-10-23",
    source: "https://en.wikipedia.org/wiki/Spain_national_football_team",
    lastUpdated: "2026-11-10"
  },
  {
    id: "mikel-oyarzabal",
    name: "Mikel Oyarzabal",
    clubId: "real-sociedad",
    nationality: "Spain",
    position: "FWD",
    birthDate: "1997-04-21",
    source: "https://en.wikipedia.org/wiki/Spain_national_football_team",
    lastUpdated: "2026-11-10"
  },
  {
    id: "ferran-torres",
    name: "Ferran Torres",
    clubId: "barcelona",
    nationality: "Spain",
    position: "FWD",
    birthDate: "2000-02-29",
    source: "https://en.wikipedia.org/wiki/Spain_national_football_team",
    lastUpdated: "2026-11-10"
  }
];

const poolSpain2026 = {
  id: "spain-2026",
  title: "Spain 2026",
  kind: "squad",
  memberIds: spainPlayers.map((p) => p.id),
  createdAt: "2026-11-10T10:00:00Z"
};

const poolsIndex = [poolSpain2026];

// Save individual player files
const playersDir = path.resolve("public/data/players");
fs.mkdirSync(playersDir, { recursive: true });
for (const player of spainPlayers) {
  fs.writeFileSync(
    path.join(playersDir, `${player.id}.json`),
    JSON.stringify(player, null, 2)
  );
}
fs.writeFileSync(
    path.join(playersDir, "index.json"),
    JSON.stringify(spainPlayers, null, 2)
);

// Save pools
const poolsDir = path.resolve("public/data/pools");
fs.mkdirSync(poolsDir, { recursive: true });
fs.writeFileSync(
  path.join(poolsDir, "spain-2026.json"),
  JSON.stringify(poolSpain2026, null, 2)
);
fs.writeFileSync(
  path.join(poolsDir, "index.json"),
  JSON.stringify(poolsIndex, null, 2)
);

// Save initial ratings
const ratingsDir = path.resolve("public/data/ratings");
fs.mkdirSync(ratingsDir, { recursive: true });
const initialRatings = {
  poolId: "spain-2026",
  computedAt: "2026-11-10T10:00:00Z",
  totalVotes: 0,
  ratings: spainPlayers.map((p) => ({
    poolId: "spain-2026",
    entityId: p.id,
    strength: 0,
    votes: 0,
    low: 0,
    high: 0
  }))
};
fs.writeFileSync(
  path.join(ratingsDir, "spain-2026.json"),
  JSON.stringify(initialRatings, null, 2)
);

console.log("Successfully seeded Spain 2026 pool and player data.");
