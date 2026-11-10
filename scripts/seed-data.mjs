import fs from "node:fs";
import path from "node:path";

// 1. WORLD STRIKERS / ATTACKERS
const worldStrikers = [
  {
    id: "erling-haaland",
    name: "Erling Haaland",
    number: 9,
    clubId: "manchester-city",
    nationality: "Norway",
    position: "FWD",
    birthDate: "2000-07-21",
    photoUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/07/Erling_Haaland_2023_%28cropped-v2%29.jpg/440px-Erling_Haaland_2023_%28cropped-v2%29.jpg",
    source: "https://en.wikipedia.org/wiki/Erling_Haaland",
    lastUpdated: "2026-11-10"
  },
  {
    id: "kylian-mbappe",
    name: "Kylian Mbappé",
    number: 9,
    clubId: "real-madrid",
    nationality: "France",
    position: "FWD",
    birthDate: "1998-12-20",
    photoUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/b/b3/2022_FIFA_World_Cup_France_4%E2%80%931_Australia_-_%287%29_%28cropped%29.jpg/440px-2022_FIFA_World_Cup_France_4%E2%80%931_Australia_-_%287%29_%28cropped%29.jpg",
    source: "https://en.wikipedia.org/wiki/Kylian_Mbapp%C3%A9",
    lastUpdated: "2026-11-10"
  },
  {
    id: "vinicius-junior",
    name: "Vinícius Júnior",
    number: 7,
    clubId: "real-madrid",
    nationality: "Brazil",
    position: "FWD",
    birthDate: "2000-07-12",
    photoUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/f/f3/Vinicius_Jr_2021.jpg/440px-Vinicius_Jr_2021.jpg",
    source: "https://en.wikipedia.org/wiki/Vin%C3%ADcius_J%C3%BAnior",
    lastUpdated: "2026-11-10"
  },
  {
    id: "harry-kane",
    name: "Harry Kane",
    number: 9,
    clubId: "bayern-munich",
    nationality: "England",
    position: "FWD",
    birthDate: "1993-07-28",
    photoUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/2/22/Harry_Kane_2024.jpg/440px-Harry_Kane_2024.jpg",
    source: "https://en.wikipedia.org/wiki/Harry_Kane",
    lastUpdated: "2026-11-10"
  },
  {
    id: "mohamed-salah",
    name: "Mohamed Salah",
    number: 11,
    clubId: "liverpool",
    nationality: "Egypt",
    position: "FWD",
    birthDate: "1992-06-15",
    photoUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c1/Mohamed_Salah_2018.jpg/440px-Mohamed_Salah_2018.jpg",
    source: "https://en.wikipedia.org/wiki/Mohamed_Salah",
    lastUpdated: "2026-11-10"
  },
  {
    id: "robert-lewandowski",
    name: "Robert Lewandowski",
    number: 9,
    clubId: "barcelona",
    nationality: "Poland",
    position: "FWD",
    birthDate: "1988-08-21",
    photoUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/b/b8/Robert_Lewandowski_2018_%28cropped%29.jpg/440px-Robert_Lewandowski_2018_%28cropped%29.jpg",
    source: "https://en.wikipedia.org/wiki/Robert_Lewandowski",
    lastUpdated: "2026-11-10"
  },
  {
    id: "viktor-gyokeres",
    name: "Viktor Gyökeres",
    number: 14,
    clubId: "arsenal",
    nationality: "Sweden",
    position: "FWD",
    birthDate: "1998-06-04",
    photoUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a2/Viktor_Gy%C3%B6keres_2023.jpg/440px-Viktor_Gy%C3%B6keres_2023.jpg",
    source: "https://en.wikipedia.org/wiki/Viktor_Gy%C3%B6keres",
    lastUpdated: "2026-11-10"
  },
  {
    id: "bukayo-saka",
    name: "Bukayo Saka",
    number: 7,
    clubId: "arsenal",
    nationality: "England",
    position: "FWD",
    birthDate: "2001-09-05",
    photoUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/3/3b/Bukayo_Saka_2023.jpg/440px-Bukayo_Saka_2023.jpg",
    source: "https://en.wikipedia.org/wiki/Bukayo_Saka",
    lastUpdated: "2026-11-10"
  },
  {
    id: "lamine-yamal",
    name: "Lamine Yamal",
    number: 19,
    clubId: "barcelona",
    nationality: "Spain",
    position: "FWD",
    birthDate: "2007-07-13",
    photoUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/a/ab/Lamine_Yamal_Euro_2024_%28cropped%29.jpg/440px-Lamine_Yamal_Euro_2024_%28cropped%29.jpg",
    source: "https://en.wikipedia.org/wiki/Lamine_Yamal",
    lastUpdated: "2026-11-10"
  },
  {
    id: "lautaro-martinez",
    name: "Lautaro Martínez",
    number: 10,
    clubId: "inter-milan",
    nationality: "Argentina",
    position: "FWD",
    birthDate: "1997-08-22",
    photoUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/8/87/Lautaro_Mart%C3%ADnez_2019.jpg/440px-Lautaro_Mart%C3%ADnez_2019.jpg",
    source: "https://en.wikipedia.org/wiki/Lautaro_Mart%C3%ADnez",
    lastUpdated: "2026-11-10"
  },
  {
    id: "cole-palmer",
    name: "Cole Palmer",
    number: 20,
    clubId: "chelsea",
    nationality: "England",
    position: "FWD",
    birthDate: "2002-05-06",
    photoUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/5/5e/Cole_Palmer_2023.jpg/440px-Cole_Palmer_2023.jpg",
    source: "https://en.wikipedia.org/wiki/Cole_Palmer",
    lastUpdated: "2026-11-10"
  },
  {
    id: "victor-osimhen",
    name: "Victor Osimhen",
    number: 9,
    clubId: "galatasaray",
    nationality: "Nigeria",
    position: "FWD",
    birthDate: "1998-12-29",
    photoUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/b/b2/Victor_Osimhen_2021.jpg/440px-Victor_Osimhen_2021.jpg",
    source: "https://en.wikipedia.org/wiki/Victor_Osimhen",
    lastUpdated: "2026-11-10"
  }
];

// 2. WORLD MIDFIELDERS
const worldMidfielders = [
  {
    id: "rodri",
    name: "Rodri",
    number: 16,
    clubId: "manchester-city",
    nationality: "Spain",
    position: "MID",
    birthDate: "1996-06-22",
    photoUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/4/41/Rodri_2024.jpg/440px-Rodri_2024.jpg",
    source: "https://en.wikipedia.org/wiki/Rodri_(footballer)",
    lastUpdated: "2026-11-10"
  },
  {
    id: "jude-bellingham",
    name: "Jude Bellingham",
    number: 5,
    clubId: "real-madrid",
    nationality: "England",
    position: "MID",
    birthDate: "2003-06-29",
    photoUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/1/16/Jude_Bellingham_2024.jpg/440px-Jude_Bellingham_2024.jpg",
    source: "https://en.wikipedia.org/wiki/Jude_Bellingham",
    lastUpdated: "2026-11-10"
  },
  {
    id: "kevin-de-bruyne",
    name: "Kevin De Bruyne",
    number: 17,
    clubId: "manchester-city",
    nationality: "Belgium",
    position: "MID",
    birthDate: "1991-06-28",
    photoUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/4/40/Kevin_De_Bruyne_201807091.jpg/440px-Kevin_De_Bruyne_201807091.jpg",
    source: "https://en.wikipedia.org/wiki/Kevin_De_Bruyne",
    lastUpdated: "2026-11-10"
  },
  {
    id: "pedri",
    name: "Pedri",
    number: 8,
    clubId: "barcelona",
    nationality: "Spain",
    position: "MID",
    birthDate: "2002-11-25",
    photoUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/f/f6/Pedri_2021.jpg/440px-Pedri_2021.jpg",
    source: "https://en.wikipedia.org/wiki/Pedri",
    lastUpdated: "2026-11-10"
  },
  {
    id: "florian-wirtz",
    name: "Florian Wirtz",
    number: 10,
    clubId: "bayer-leverkusen",
    nationality: "Germany",
    position: "MID",
    birthDate: "2003-05-03",
    photoUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e0/Florian_Wirtz_2022.jpg/440px-Florian_Wirtz_2022.jpg",
    source: "https://en.wikipedia.org/wiki/Florian_Wirtz",
    lastUpdated: "2026-11-10"
  },
  {
    id: "martin-odegaard",
    name: "Martin Ødegaard",
    number: 8,
    clubId: "arsenal",
    nationality: "Norway",
    position: "MID",
    birthDate: "1998-12-17",
    photoUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/0e/Martin_%C3%98degaard_2023.jpg/440px-Martin_%C3%98degaard_2023.jpg",
    source: "https://en.wikipedia.org/wiki/Martin_%C3%98degaard",
    lastUpdated: "2026-11-10"
  },
  {
    id: "federico-valverde",
    name: "Federico Valverde",
    number: 8,
    clubId: "real-madrid",
    nationality: "Uruguay",
    position: "MID",
    birthDate: "1998-07-22",
    photoUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/0a/Federico_Valverde_2021.jpg/440px-Federico_Valverde_2021.jpg",
    source: "https://en.wikipedia.org/wiki/Federico_Valverde",
    lastUpdated: "2026-11-10"
  },
  {
    id: "declan-rice",
    name: "Declan Rice",
    number: 41,
    clubId: "arsenal",
    nationality: "England",
    position: "MID",
    birthDate: "1999-01-14",
    photoUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/3/30/Declan_Rice_2024.jpg/440px-Declan_Rice_2024.jpg",
    source: "https://en.wikipedia.org/wiki/Declan_Rice",
    lastUpdated: "2026-11-10"
  },
  {
    id: "jamal-musiala",
    name: "Jamal Musiala",
    number: 42,
    clubId: "bayern-munich",
    nationality: "Germany",
    position: "MID",
    birthDate: "2003-02-26",
    photoUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/d/d4/Jamal_Musiala_2022.jpg/440px-Jamal_Musiala_2022.jpg",
    source: "https://en.wikipedia.org/wiki/Jamal_Musiala",
    lastUpdated: "2026-11-10"
  },
  {
    id: "luka-modric",
    name: "Luka Modrić",
    number: 10,
    clubId: "real-madrid",
    nationality: "Croatia",
    position: "MID",
    birthDate: "1985-09-09",
    photoUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e9/Luka_Modric_2021.jpg/440px-Luka_Modric_2021.jpg",
    source: "https://en.wikipedia.org/wiki/Luka_Modri%C3%A7",
    lastUpdated: "2026-11-10"
  },
  {
    id: "bruno-fernandes",
    name: "Bruno Fernandes",
    number: 8,
    clubId: "manchester-united",
    nationality: "Portugal",
    position: "MID",
    birthDate: "1994-09-08",
    photoUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/b/b3/Bruno_Fernandes_2021.jpg/440px-Bruno_Fernandes_2021.jpg",
    source: "https://en.wikipedia.org/wiki/Bruno_Fernandes",
    lastUpdated: "2026-11-10"
  },
  {
    id: "dani-olmo",
    name: "Dani Olmo",
    number: 20,
    clubId: "barcelona",
    nationality: "Spain",
    position: "MID",
    birthDate: "1998-05-07",
    photoUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/c/ca/Dani_Olmo_2024.jpg/440px-Dani_Olmo_2024.jpg",
    source: "https://en.wikipedia.org/wiki/Dani_Olmo",
    lastUpdated: "2026-11-10"
  }
];

// 3. WORLD GOALKEEPERS
const worldGoalkeepers = [
  {
    id: "thibaut-courtois",
    name: "Thibaut Courtois",
    number: 1,
    clubId: "real-madrid",
    nationality: "Belgium",
    position: "GK",
    birthDate: "1992-05-11",
    photoUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c4/Courtois_2018_%28cropped%29.jpg/440px-Courtois_2018_%28cropped%29.jpg",
    source: "https://en.wikipedia.org/wiki/Thibaut_Courtois",
    lastUpdated: "2026-11-10"
  },
  {
    id: "alisson-becker",
    name: "Alisson Becker",
    number: 1,
    clubId: "liverpool",
    nationality: "Brazil",
    position: "GK",
    birthDate: "1992-10-02",
    photoUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/4/4a/Alisson_Becker_2018.jpg/440px-Alisson_Becker_2018.jpg",
    source: "https://en.wikipedia.org/wiki/Alisson",
    lastUpdated: "2026-11-10"
  },
  {
    id: "ederson",
    name: "Ederson",
    number: 31,
    clubId: "manchester-city",
    nationality: "Brazil",
    position: "GK",
    birthDate: "1993-08-17",
    photoUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/5/52/Ederson_Moraes_2018.jpg/440px-Ederson_Moraes_2018.jpg",
    source: "https://en.wikipedia.org/wiki/Ederson_(footballer,_born_1993)",
    lastUpdated: "2026-11-10"
  },
  {
    id: "david-raya",
    name: "David Raya",
    number: 22,
    clubId: "arsenal",
    nationality: "Spain",
    position: "GK",
    birthDate: "1995-09-15",
    photoUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/0f/David_Raya_2022.jpg/440px-David_Raya_2022.jpg",
    source: "https://en.wikipedia.org/wiki/David_Raya",
    lastUpdated: "2026-11-10"
  },
  {
    id: "emiliano-martinez",
    name: "Emiliano Martínez",
    number: 23,
    clubId: "aston-villa",
    nationality: "Argentina",
    position: "GK",
    birthDate: "1992-09-02",
    photoUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/1/1c/Emiliano_Mart%C3%ADnez_2022.jpg/440px-Emiliano_Mart%C3%ADnez_2022.jpg",
    source: "https://en.wikipedia.org/wiki/Emiliano_Mart%C3%ADnez",
    lastUpdated: "2026-11-10"
  },
  {
    id: "gianluigi-donnarumma",
    name: "Gianluigi Donnarumma",
    number: 1,
    clubId: "paris-saint-germain",
    nationality: "Italy",
    position: "GK",
    birthDate: "1999-02-25",
    photoUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/8/87/Gianluigi_Donnarumma_2021.jpg/440px-Gianluigi_Donnarumma_2021.jpg",
    source: "https://en.wikipedia.org/wiki/Gianluigi_Donnarumma",
    lastUpdated: "2026-11-10"
  },
  {
    id: "jan-oblak",
    name: "Jan Oblak",
    number: 13,
    clubId: "atletico-madrid",
    nationality: "Slovenia",
    position: "GK",
    birthDate: "1993-01-07",
    photoUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/1/16/Jan_Oblak_2021.jpg/440px-Jan_Oblak_2021.jpg",
    source: "https://en.wikipedia.org/wiki/Jan_Oblak",
    lastUpdated: "2026-11-10"
  },
  {
    id: "marc-andre-ter-stegen",
    name: "Marc-André ter Stegen",
    number: 1,
    clubId: "barcelona",
    nationality: "Germany",
    position: "GK",
    birthDate: "1992-04-30",
    photoUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/4/4b/Marc-Andr%C3%A9_ter_Stegen_2018.jpg/440px-Marc-Andr%C3%A9_ter_Stegen_2018.jpg",
    source: "https://en.wikipedia.org/wiki/Marc-Andr%C3%A9_ter_Stegen",
    lastUpdated: "2026-11-10"
  },
  {
    id: "mike-maignan",
    name: "Mike Maignan",
    number: 16,
    clubId: "milan",
    nationality: "France",
    position: "GK",
    birthDate: "1995-07-03",
    photoUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/b/be/Mike_Maignan_2022.jpg/440px-Mike_Maignan_2022.jpg",
    source: "https://en.wikipedia.org/wiki/Mike_Maignan",
    lastUpdated: "2026-11-10"
  },
  {
    id: "unai-simon",
    name: "Unai Simón",
    number: 1,
    clubId: "athletic-bilbao",
    nationality: "Spain",
    position: "GK",
    birthDate: "1997-06-11",
    photoUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/d/d4/Unai_Sim%C3%B3n_2024.jpg/440px-Unai_Sim%C3%B3n_2024.jpg",
    source: "https://en.wikipedia.org/wiki/Unai_Sim%C3%B3n",
    lastUpdated: "2026-11-10"
  }
];

// 4. WORLD MANAGERS
const worldManagers = [
  {
    id: "pep-guardiola",
    name: "Pep Guardiola",
    clubId: "manchester-city",
    nationality: "Spain",
    position: "MGR",
    birthDate: "1971-01-18",
    photoUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/b/b8/Pep_2017_%28cropped%29.jpg/440px-Pep_2017_%28cropped%29.jpg",
    source: "https://en.wikipedia.org/wiki/Pep_Guardiola",
    lastUpdated: "2026-11-10"
  },
  {
    id: "carlo-ancelotti",
    name: "Carlo Ancelotti",
    clubId: "real-madrid",
    nationality: "Italy",
    position: "MGR",
    birthDate: "1959-06-10",
    photoUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a2/Carlo_Ancelotti_2021.jpg/440px-Carlo_Ancelotti_2021.jpg",
    source: "https://en.wikipedia.org/wiki/Carlo_Ancelotti",
    lastUpdated: "2026-11-10"
  },
  {
    id: "mikel-arteta",
    name: "Mikel Arteta",
    clubId: "arsenal",
    nationality: "Spain",
    position: "MGR",
    birthDate: "1982-03-26",
    photoUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/3/36/Mikel_Arteta_2022.jpg/440px-Mikel_Arteta_2022.jpg",
    source: "https://en.wikipedia.org/wiki/Mikel_Arteta",
    lastUpdated: "2026-11-10"
  },
  {
    id: "jurgen-klopp",
    name: "Jürgen Klopp",
    clubId: "red-bull",
    nationality: "Germany",
    position: "MGR",
    birthDate: "1967-06-16",
    photoUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/d/d4/J%C3%BCrgen_Klopp%2C_Liverpool_vs._Chelsea%2C_UEFA_Super_Cup_2019-08-14_06.jpg/440px-J%C3%BCrgen_Klopp%2C_Liverpool_vs._Chelsea%2C_UEFA_Super_Cup_2019-08-14_06.jpg",
    source: "https://en.wikipedia.org/wiki/J%C3%BCrgen_Klopp",
    lastUpdated: "2026-11-10"
  },
  {
    id: "xabi-alonso",
    name: "Xabi Alonso",
    clubId: "bayer-leverkusen",
    nationality: "Spain",
    position: "MGR",
    birthDate: "1981-11-25",
    photoUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/9/90/Xabi_Alonso_2023.jpg/440px-Xabi_Alonso_2023.jpg",
    source: "https://en.wikipedia.org/wiki/Xabi_Alonso",
    lastUpdated: "2026-11-10"
  },
  {
    id: "luis-de-la-fuente",
    name: "Luis de la Fuente",
    clubId: "spain-national-team",
    nationality: "Spain",
    position: "MGR",
    birthDate: "1961-06-21",
    photoUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/6/67/Luis_de_la_Fuente_2024.jpg/440px-Luis_de_la_Fuente_2024.jpg",
    source: "https://en.wikipedia.org/wiki/Luis_de_la_Fuente",
    lastUpdated: "2026-11-10"
  },
  {
    id: "hansi-flick",
    name: "Hansi Flick",
    clubId: "barcelona",
    nationality: "Germany",
    position: "MGR",
    birthDate: "1965-02-24",
    photoUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/3/30/Hansi_Flick_2020.jpg/440px-Hansi_Flick_2020.jpg",
    source: "https://en.wikipedia.org/wiki/Hansi_Flick",
    lastUpdated: "2026-11-10"
  },
  {
    id: "diego-simeone",
    name: "Diego Simeone",
    clubId: "atletico-madrid",
    nationality: "Argentina",
    position: "MGR",
    birthDate: "1970-04-28",
    photoUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/d/d4/Diego_Simeone_2019.jpg/440px-Diego_Simeone_2019.jpg",
    source: "https://en.wikipedia.org/wiki/Diego_Simeone",
    lastUpdated: "2026-11-10"
  },
  {
    id: "unai-emery",
    name: "Unai Emery",
    clubId: "aston-villa",
    nationality: "Spain",
    position: "MGR",
    birthDate: "1971-11-03",
    photoUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/1/1a/Unai_Emery_2019.jpg/440px-Unai_Emery_2019.jpg",
    source: "https://en.wikipedia.org/wiki/Unai_Emery",
    lastUpdated: "2026-11-10"
  },
  {
    id: "simone-inzaghi",
    name: "Simone Inzaghi",
    clubId: "inter-milan",
    nationality: "Italy",
    position: "MGR",
    birthDate: "1976-04-05",
    photoUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e5/Simone_Inzaghi_2021.jpg/440px-Simone_Inzaghi_2021.jpg",
    source: "https://en.wikipedia.org/wiki/Simone_Inzaghi",
    lastUpdated: "2026-11-10"
  }
];

// 5. ARSENAL 2026/27 SQUAD (Matching User's Screenshot 2)
const arsenalPlayers = [
  {
    id: "david-raya",
    name: "David Raya",
    number: 22,
    clubId: "arsenal",
    nationality: "Spain",
    position: "GK",
    birthDate: "1995-09-15",
    photoUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/0f/David_Raya_2022.jpg/440px-David_Raya_2022.jpg",
    source: "https://en.wikipedia.org/wiki/David_Raya",
    lastUpdated: "2026-11-10"
  },
  {
    id: "william-saliba",
    name: "William Saliba",
    number: 2,
    clubId: "arsenal",
    nationality: "France",
    position: "DEF",
    birthDate: "2001-03-24",
    photoUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/5/5e/William_Saliba_2022.jpg/440px-William_Saliba_2022.jpg",
    source: "https://en.wikipedia.org/wiki/William_Saliba",
    lastUpdated: "2026-11-10"
  },
  {
    id: "gabriel-magalhaes",
    name: "Gabriel Magalhães",
    number: 6,
    clubId: "arsenal",
    nationality: "Brazil",
    position: "DEF",
    birthDate: "1997-12-19",
    photoUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/c/ca/Gabriel_Magalh%C3%A3es_2022.jpg/440px-Gabriel_Magalh%C3%A3es_2022.jpg",
    source: "https://en.wikipedia.org/wiki/Gabriel_Magalh%C3%A3es",
    lastUpdated: "2026-11-10"
  },
  {
    id: "ben-white",
    name: "Ben White",
    number: 4,
    clubId: "arsenal",
    nationality: "England",
    position: "DEF",
    birthDate: "1997-10-08",
    photoUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/4/4b/Ben_White_2021.jpg/440px-Ben_White_2021.jpg",
    source: "https://en.wikipedia.org/wiki/Ben_White_(footballer)",
    lastUpdated: "2026-11-10"
  },
  {
    id: "jurrien-timber",
    name: "Jurriën Timber",
    number: 12,
    clubId: "arsenal",
    nationality: "Netherlands",
    position: "DEF",
    birthDate: "2001-06-17",
    photoUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/2/25/Jurri%C3%ABn_Timber_2022.jpg/440px-Jurri%C3%ABn_Timber_2022.jpg",
    source: "https://en.wikipedia.org/wiki/Jurri%C3%ABn_Timber",
    lastUpdated: "2026-11-10"
  },
  {
    id: "riccardo-calafiori",
    name: "Riccardo Calafiori",
    number: 33,
    clubId: "arsenal",
    nationality: "Italy",
    position: "DEF",
    birthDate: "2002-05-19",
    photoUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/3/36/Riccardo_Calafiori_2024.jpg/440px-Riccardo_Calafiori_2024.jpg",
    source: "https://en.wikipedia.org/wiki/Riccardo_Calafiori",
    lastUpdated: "2026-11-10"
  },
  {
    id: "declan-rice",
    name: "Declan Rice",
    number: 41,
    clubId: "arsenal",
    nationality: "England",
    position: "MID",
    birthDate: "1999-01-14",
    photoUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/3/30/Declan_Rice_2024.jpg/440px-Declan_Rice_2024.jpg",
    source: "https://en.wikipedia.org/wiki/Declan_Rice",
    lastUpdated: "2026-11-10"
  },
  {
    id: "martin-odegaard",
    name: "Martin Ødegaard",
    number: 8,
    clubId: "arsenal",
    nationality: "Norway",
    position: "MID",
    birthDate: "1998-12-17",
    photoUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/0e/Martin_%C3%98degaard_2023.jpg/440px-Martin_%C3%98degaard_2023.jpg",
    source: "https://en.wikipedia.org/wiki/Martin_%C3%98degaard",
    lastUpdated: "2026-11-10"
  },
  {
    id: "mikel-merino",
    name: "Mikel Merino",
    number: 23,
    clubId: "arsenal",
    nationality: "Spain",
    position: "MID",
    birthDate: "1996-06-22",
    photoUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/9/90/Mikel_Merino_2024.jpg/440px-Mikel_Merino_2024.jpg",
    source: "https://en.wikipedia.org/wiki/Mikel_Merino",
    lastUpdated: "2026-11-10"
  },
  {
    id: "kai-havertz",
    name: "Kai Havertz",
    number: 29,
    clubId: "arsenal",
    nationality: "Germany",
    position: "MID",
    birthDate: "1999-06-11",
    photoUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/1/18/Kai_Havertz_2024.jpg/440px-Kai_Havertz_2024.jpg",
    source: "https://en.wikipedia.org/wiki/Kai_Havertz",
    lastUpdated: "2026-11-10"
  },
  {
    id: "bukayo-saka",
    name: "Bukayo Saka",
    number: 7,
    clubId: "arsenal",
    nationality: "England",
    position: "FWD",
    birthDate: "2001-09-05",
    photoUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/3/3b/Bukayo_Saka_2023.jpg/440px-Bukayo_Saka_2023.jpg",
    source: "https://en.wikipedia.org/wiki/Bukayo_Saka",
    lastUpdated: "2026-11-10"
  },
  {
    id: "viktor-gyokeres",
    name: "Viktor Gyökeres",
    number: 14,
    clubId: "arsenal",
    nationality: "Sweden",
    position: "FWD",
    birthDate: "1998-06-04",
    photoUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a2/Viktor_Gy%C3%B6keres_2023.jpg/440px-Viktor_Gy%C3%B6keres_2023.jpg",
    source: "https://en.wikipedia.org/wiki/Viktor_Gy%C3%B6keres",
    lastUpdated: "2026-11-10"
  },
  {
    id: "gabriel-martinelli",
    name: "Gabriel Martinelli",
    number: 11,
    clubId: "arsenal",
    nationality: "Brazil",
    position: "FWD",
    birthDate: "2001-06-18",
    photoUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/3/3f/Gabriel_Martinelli_2022.jpg/440px-Gabriel_Martinelli_2022.jpg",
    source: "https://en.wikipedia.org/wiki/Gabriel_Martinelli",
    lastUpdated: "2026-11-10"
  },
  {
    id: "gabriel-jesus",
    name: "Gabriel Jesus",
    number: 9,
    clubId: "arsenal",
    nationality: "Brazil",
    position: "FWD",
    birthDate: "1997-04-03",
    photoUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a2/Gabriel_Jesus_2022.jpg/440px-Gabriel_Jesus_2022.jpg",
    source: "https://en.wikipedia.org/wiki/Gabriel_Jesus",
    lastUpdated: "2026-11-10"
  }
];

// Combine all unique players
const allPlayersMap = new Map();
[
  ...worldStrikers,
  ...worldMidfielders,
  ...worldGoalkeepers,
  ...worldManagers,
  ...arsenalPlayers,
].forEach((p) => {
  allPlayersMap.set(p.id, p);
});

const allPlayersList = Array.from(allPlayersMap.values());

// Pools
const pools = [
  {
    id: "world-strikers",
    title: "World's Best Strikers",
    kind: "award",
    memberIds: worldStrikers.map((p) => p.id),
    createdAt: "2026-11-10T11:00:00Z",
  },
  {
    id: "world-midfielders",
    title: "World's Best Midfielders",
    kind: "award",
    memberIds: worldMidfielders.map((p) => p.id),
    createdAt: "2026-11-10T11:00:00Z",
  },
  {
    id: "world-goalkeepers",
    title: "World's Best Goalkeepers",
    kind: "award",
    memberIds: worldGoalkeepers.map((p) => p.id),
    createdAt: "2026-11-10T11:00:00Z",
  },
  {
    id: "world-managers",
    title: "World's Top Managers",
    kind: "managers",
    memberIds: worldManagers.map((p) => p.id),
    createdAt: "2026-11-10T11:00:00Z",
  },
  {
    id: "arsenal-2026",
    title: "Arsenal 2026/27",
    kind: "squad",
    memberIds: arsenalPlayers.map((p) => p.id),
    createdAt: "2026-11-10T11:00:00Z",
  },
  {
    id: "spain-2026",
    title: "Spain 2026",
    kind: "squad",
    memberIds: [
      "unai-simon",
      "david-raya",
      "dani-carvajal",
      "robin-le-normand",
      "aymeric-laporte",
      "pau-cubarsi",
      "marc-cucurella",
      "alejandro-grimaldo",
      "pedro-porro",
      "rodri",
      "martin-zubimendi",
      "pedri",
      "dani-olmo",
      "fabian-ruiz",
      "mikel-merino",
      "lamine-yamal",
      "nico-williams",
      "alvaro-morata",
      "mikel-oyarzabal",
      "ferran-torres"
    ],
    createdAt: "2026-11-10T10:00:00Z",
  }
];

// Write individual player files
const playersDir = path.resolve("public/data/players");
fs.mkdirSync(playersDir, { recursive: true });
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

// Write pools
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

// Write initial ratings
const ratingsDir = path.resolve("public/data/ratings");
fs.mkdirSync(ratingsDir, { recursive: true });
for (const pool of pools) {
  const initialRatings = {
    poolId: pool.id,
    computedAt: "2026-11-10T11:00:00Z",
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

console.log("Successfully seeded rich dataset with world strikers, midfielders, goalkeepers, managers, and Arsenal with photo URLs.");
