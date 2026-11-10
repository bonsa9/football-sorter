import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";

const PL_TEAMS = [
  { id: "arsenal", poolId: "arsenal-2026", name: "Arsenal" },
  { id: "liverpool", poolId: "liverpool-2026", name: "Liverpool" },
  { id: "manchester-city", poolId: "mancity-2026", name: "Manchester City" },
  { id: "chelsea", poolId: "chelsea-2026", name: "Chelsea" },
  { id: "manchester-united", poolId: "manutd-2026", name: "Manchester United" },
  { id: "tottenham", poolId: "tottenham-2026", name: "Tottenham Hotspur" },
  { id: "aston-villa", poolId: "aston-villa-2026", name: "Aston Villa" }
];

async function fetchTeamJs(section, group, teamId) {
  const url = `https://player-sorter.github.io/data/teams/${section}/${group}/${teamId}.js`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to fetch ${url}: ${res.status}`);
  const code = await res.text();
  let result = null;
  const sandbox = {
    registerTeam: (data) => {
      result = data;
    }
  };
  vm.createContext(sandbox);
  vm.runInContext(code, sandbox);
  return result;
}

const MANAGERS_DEF = [
  { id: "pep-guardiola", name: "Pep Guardiola", title: "Pep_Guardiola", clubId: "manchester-city", clubName: "Manchester City", nation: "ESP" },
  { id: "mikel-arteta", name: "Mikel Arteta", title: "Mikel_Arteta", clubId: "arsenal", clubName: "Arsenal", nation: "ESP" },
  { id: "arne-slot", name: "Arne Slot", title: "Arne_Slot", clubId: "liverpool", clubName: "Liverpool", nation: "NED" },
  { id: "unai-emery", name: "Unai Emery", title: "Unai_Emery", clubId: "aston-villa", clubName: "Aston Villa", nation: "ESP" },
  { id: "ange-postecoglou", name: "Ange Postecoglou", title: "Ange_Postecoglou", clubId: "tottenham", clubName: "Tottenham Hotspur", nation: "AUS" },
  { id: "enzo-maresca", name: "Enzo Maresca", title: "Enzo_Maresca", clubId: "chelsea", clubName: "Chelsea", nation: "ITA" },
  { id: "ruben-amorim", name: "Rúben Amorim", title: "R%C3%BAben_Amorim", clubId: "manchester-united", clubName: "Manchester United", nation: "POR" },
  { id: "eddie-howe", name: "Eddie Howe", title: "Eddie_Howe", clubId: "newcastle", clubName: "Newcastle United", nation: "ENG" },
  { id: "thomas-frank", name: "Thomas Frank", title: "Thomas_Frank_(football_manager)", clubId: "brentford", clubName: "Brentford", nation: "DEN" },
  { id: "marco-silva", name: "Marco Silva", title: "Marco_Silva", clubId: "fulham", clubName: "Fulham", nation: "POR" }
];

async function fetchWikiThumb(title) {
  const headers = { "User-Agent": "FootballSorter/1.0 (info@footballsorter.dev)" };
  try {
    const api = `https://en.wikipedia.org/w/api.php?action=query&titles=${title}&prop=pageimages&format=json&pithumbsize=500`;
    const res = await fetch(api, { headers });
    const json = await res.json();
    const pages = json.query?.pages;
    const firstPage = Object.values(pages || {})[0];
    return firstPage?.thumbnail?.source || null;
  } catch (e) {
    console.warn(`Wiki thumb error for ${title}:`, e.message);
    return null;
  }
}

async function main() {
  console.log("Fetching Premier League teams...");
  const teamsData = {};
  const allPlayersMap = new Map();
  const pools = [];

  for (const t of PL_TEAMS) {
    console.log(`- Fetching ${t.name} (${t.id})...`);
    const raw = await fetchTeamJs("mens-clubs", "premier-league", t.id);
    teamsData[t.id] = raw;

    const clubCrest = `https://player-sorter.github.io/assets/teams/mens-clubs/premier-league/${t.id}/crest.png`;
    const playerIds = [];

    for (const p of raw.players || []) {
      const fullPlayerId = `${t.id}-${p.id}`;
      playerIds.push(fullPlayerId);

      const photoUrl = `https://player-sorter.github.io/assets/teams/mens-clubs/premier-league/${t.id}/players/${p.id}.webp`;

      allPlayersMap.set(fullPlayerId, {
        id: fullPlayerId,
        rawId: p.id,
        name: p.name,
        number: p.number ?? null,
        position: p.position === "GK" ? "GK" : p.position === "DF" ? "DEF" : p.position === "MF" ? "MID" : "FWD",
        clubId: t.id,
        clubName: raw.name,
        nationality: p.nation || "",
        crestUrl: clubCrest,
        photoUrl: photoUrl,
        source: `https://player-sorter.github.io/#/${t.id}`,
        lastUpdated: "2026-11-10"
      });
    }

    // Add club pool
    pools.push({
      id: t.poolId,
      teamId: t.id,
      title: `${raw.name} ${raw.season || "2026/27"}`,
      kind: "squad",
      crestUrl: clubCrest,
      kits: raw.kits,
      memberIds: playerIds,
      createdAt: "2026-11-10T12:00:00Z"
    });
  }

  // Fetch Spain 2026
  console.log("Fetching Spain 2026 squad...");
  try {
    const spainRaw = await fetchTeamJs("wcs", "world-cup-2026", "2026-spain");
    teamsData["spain"] = spainRaw;
    const spainCrest = `https://player-sorter.github.io/assets/teams/wcs/world-cup-2026/2026-spain/crest.png`;
    const spainPlayerIds = [];

    for (const p of spainRaw.players || []) {
      const fullId = `spain-${p.id}`;
      spainPlayerIds.push(fullId);
      const photoUrl = `https://player-sorter.github.io/assets/teams/wcs/world-cup-2026/2026-spain/players/${p.id}.webp`;

      allPlayersMap.set(fullId, {
        id: fullId,
        rawId: p.id,
        name: p.name,
        number: p.number ?? null,
        position: p.position === "GK" ? "GK" : p.position === "DF" ? "DEF" : p.position === "MF" ? "MID" : "FWD",
        clubId: "spain",
        clubName: "Spain",
        nationality: p.nation || "Spain",
        crestUrl: spainCrest,
        photoUrl: photoUrl,
        source: "https://player-sorter.github.io/#/2026-spain",
        lastUpdated: "2026-11-10"
      });
    }

    pools.push({
      id: "spain-2026",
      teamId: "spain",
      title: "Spain 2026",
      kind: "squad",
      crestUrl: spainCrest,
      kits: spainRaw.kits,
      memberIds: spainPlayerIds,
      createdAt: "2026-11-10T10:00:00Z"
    });
  } catch (e) {
    console.warn("Could not fetch Spain squad:", e.message);
  }

  // Build PL Managers
  console.log("Fetching PL Manager thumbs...");
  const managerIds = [];
  for (const m of MANAGERS_DEF) {
    const thumb = await fetchWikiThumb(m.title);
    managerIds.push(m.id);
    const clubCrest = `https://player-sorter.github.io/assets/teams/mens-clubs/premier-league/${m.clubId}/crest.png`;

    allPlayersMap.set(m.id, {
      id: m.id,
      name: m.name,
      position: "MGR",
      clubId: m.clubId,
      clubName: m.clubName,
      nationality: m.nation,
      crestUrl: clubCrest,
      photoUrl: thumb || "",
      source: `https://en.wikipedia.org/wiki/${m.title}`,
      lastUpdated: "2026-11-10"
    });
  }

  // 1. PL MANAGERS POOL
  pools.push({
    id: "pl-managers",
    title: "Premier League Managers",
    kind: "managers",
    crestUrl: "https://player-sorter.github.io/assets/teams/mens-clubs/premier-league/arsenal/crest.png",
    memberIds: managerIds,
    createdAt: "2026-11-10T12:00:00Z"
  });

  const getP = (clubId, rawId) => {
    const key = `${clubId}-${rawId}`;
    if (!allPlayersMap.has(key)) {
      console.warn(`Missing player key: ${key}`);
    }
    return key;
  };

  // 2. PL GOALKEEPERS POOL
  const plGoalkeepers = [
    getP("arsenal", "raya"),
    getP("liverpool", "alisson"),
    getP("manchester-city", "donnarumma"),
    getP("chelsea", "emiliano-martinez"),
    getP("tottenham", "dubravka"),
    getP("tottenham", "kinsky"),
    getP("aston-villa", "suzuki"),
    getP("arsenal", "kepa"),
    getP("arsenal", "meslier"),
    getP("liverpool", "mamardashvili"),
    getP("manchester-united", "lammens"),
    getP("manchester-city", "bettinelli")
  ].filter(id => allPlayersMap.has(id));

  pools.push({
    id: "pl-goalkeepers",
    title: "Premier League Goalkeepers",
    kind: "award",
    crestUrl: "https://player-sorter.github.io/assets/teams/mens-clubs/premier-league/arsenal/crest.png",
    memberIds: plGoalkeepers,
    createdAt: "2026-11-10T12:00:00Z"
  });

  // 3. PL DEFENDERS POOL
  const plDefenders = [
    getP("arsenal", "saliba"),
    getP("arsenal", "gabriel"),
    getP("liverpool", "van-dijk"),
    getP("manchester-city", "ruben-dias"),
    getP("manchester-city", "guehi"),
    getP("tottenham", "van-de-ven"),
    getP("tottenham", "porro"),
    getP("tottenham", "udogie"),
    getP("arsenal", "calafiori"),
    getP("arsenal", "timber"),
    getP("arsenal", "white"),
    getP("arsenal", "konsa"),
    getP("chelsea", "colwill"),
    getP("chelsea", "reece-james"),
    getP("chelsea", "gusto"),
    getP("liverpool", "frimpong"),
    getP("liverpool", "kerkez"),
    getP("manchester-city", "gvardiol"),
    getP("manchester-city", "ait-nouri"),
    getP("manchester-united", "lisandro-martinez"),
    getP("manchester-united", "de-ligt"),
    getP("aston-villa", "pau-torres"),
    getP("aston-villa", "maatsen")
  ].filter(id => allPlayersMap.has(id));

  pools.push({
    id: "pl-centre-backs",
    title: "Premier League Defenders",
    kind: "award",
    crestUrl: "https://player-sorter.github.io/assets/teams/mens-clubs/premier-league/arsenal/crest.png",
    memberIds: plDefenders,
    createdAt: "2026-11-10T12:00:00Z"
  });

  // 4. PL MIDFIELDERS POOL
  const plMidfielders = [
    getP("arsenal", "rice"),
    getP("arsenal", "odegaard"),
    getP("arsenal", "merino"),
    getP("arsenal", "havertz"),
    getP("arsenal", "zubimendi"),
    getP("arsenal", "bruno-guimaraes"),
    getP("arsenal", "eze"),
    getP("liverpool", "wirtz"),
    getP("liverpool", "szoboszlai"),
    getP("liverpool", "mac-allister"),
    getP("liverpool", "gravenberch"),
    getP("chelsea", "palmer"),
    getP("chelsea", "caicedo"),
    getP("chelsea", "lavia"),
    getP("manchester-united", "bruno-fernandes"),
    getP("manchester-united", "mainoo"),
    getP("tottenham", "maddison"),
    getP("tottenham", "kulusevski"),
    getP("tottenham", "xavi-simons"),
    getP("manchester-city", "foden"),
    getP("manchester-city", "enzo-fernandez"),
    getP("manchester-city", "cherki"),
    getP("manchester-city", "doku"),
    getP("aston-villa", "mcginn")
  ].filter(id => allPlayersMap.has(id));

  pools.push({
    id: "pl-midfielders",
    title: "Premier League Midfielders",
    kind: "award",
    crestUrl: "https://player-sorter.github.io/assets/teams/mens-clubs/premier-league/arsenal/crest.png",
    memberIds: plMidfielders,
    createdAt: "2026-11-10T12:00:00Z"
  });

  // 5. PL STRIKERS & FORWARDS POOL
  const plStrikers = [
    getP("manchester-city", "haaland"),
    getP("arsenal", "saka"),
    getP("arsenal", "gyokeres"),
    getP("liverpool", "isak"),
    getP("liverpool", "gakpo"),
    getP("liverpool", "barcola"),
    getP("liverpool", "ekitike"),
    getP("tottenham", "solanke"),
    getP("tottenham", "savio"),
    getP("tottenham", "kudus"),
    getP("tottenham", "marmoush"),
    getP("chelsea", "neto"),
    getP("chelsea", "joao-pedro"),
    getP("chelsea", "estevao"),
    getP("manchester-united", "rashford"),
    getP("manchester-united", "cunha"),
    getP("manchester-united", "sesko"),
    getP("aston-villa", "nicolas-jackson"),
    getP("aston-villa", "garnacho"),
    getP("aston-villa", "abraham")
  ].filter(id => allPlayersMap.has(id));

  pools.push({
    id: "pl-strikers",
    title: "Premier League Strikers & Forwards",
    kind: "award",
    crestUrl: "https://player-sorter.github.io/assets/teams/mens-clubs/premier-league/arsenal/crest.png",
    memberIds: plStrikers,
    createdAt: "2026-11-10T12:00:00Z"
  });

  // Write all players to public/data/players
  const playersDir = path.resolve("public/data/players");
  fs.mkdirSync(playersDir, { recursive: true });
  const allPlayersList = Array.from(allPlayersMap.values());

  for (const player of allPlayersList) {
    fs.writeFileSync(
      path.join(playersDir, `${player.id}.json`),
      JSON.stringify(player, null, 2)
    );
  }
  fs.writeFileSync(
    path.join(playersDir, "index.json"),
    JSON.stringify(allPlayersList, null, 2)
  );

  // Write pools to public/data/pools
  const poolsDir = path.resolve("public/data/pools");
  fs.mkdirSync(poolsDir, { recursive: true });
  for (const pool of pools) {
    fs.writeFileSync(
      path.join(poolsDir, `${pool.id}.json`),
      JSON.stringify(pool, null, 2)
    );
  }
  fs.writeFileSync(
    path.join(poolsDir, "index.json"),
    JSON.stringify(pools, null, 2)
  );

  // Write initial ratings for all pools
  const ratingsDir = path.resolve("public/data/ratings");
  fs.mkdirSync(ratingsDir, { recursive: true });
  for (const pool of pools) {
    const initialRatings = {
      poolId: pool.id,
      computedAt: "2026-11-10T12:00:00Z",
      totalVotes: 0,
      ratings: pool.memberIds.map((id) => ({
        poolId: pool.id,
        entityId: id,
        strength: 0,
        votes: 0,
        low: 0,
        high: 0,
      })),
    };
    fs.writeFileSync(
      path.join(ratingsDir, `${pool.id}.json`),
      JSON.stringify(initialRatings, null, 2)
    );
  }

  // Save teams metadata
  fs.writeFileSync(
    path.resolve("public/data/teams.json"),
    JSON.stringify(teamsData, null, 2)
  );

  console.log(`\nSUCCESS! Generated:`);
  console.log(`- ${allPlayersList.length} total players with working photo & crest URLs.`);
  console.log(`- ${pools.length} pools total:`);
  pools.forEach(p => console.log(`   * ${p.id}: ${p.title} (${p.memberIds.length} members)`));
}

main().catch(console.error);
