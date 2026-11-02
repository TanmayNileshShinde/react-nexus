// Centralized F1 Paddock Data for PaddockDle Games

export const F1_DRIVERS = [
  {
    id: 'max-verstappen',
    name: 'Max Verstappen',
    code: 'VER',
    number: 1,
    nationality: 'Netherlands',
    flag: '🇳🇱',
    currentTeam: 'Red Bull',
    engine: 'Honda RBPT',
    championships: 3,
    raceWins: 62,
    podiums: 110,
    debutYear: 2015,
    age: 27,
    careerPath: [
      { team: 'Toro Rosso', years: '2015 - 2016' },
      { team: 'Red Bull Racing', years: '2016 - Present' },
    ],
    teams: ['Toro Rosso', 'Red Bull Racing', 'Red Bull'],
    achievements: ['World Champion', 'Monaco GP Winner', 'Pole Sitter', 'Race Winner', '10+ Race Wins'],
  },
  {
    id: 'lewis-hamilton',
    name: 'Lewis Hamilton',
    code: 'HAM',
    number: 44,
    nationality: 'United Kingdom',
    flag: '🇬🇧',
    currentTeam: 'Mercedes',
    engine: 'Mercedes',
    championships: 7,
    raceWins: 105,
    podiums: 201,
    debutYear: 2007,
    age: 39,
    careerPath: [
      { team: 'McLaren', years: '2007 - 2012' },
      { team: 'Mercedes', years: '2013 - 2024' },
      { team: 'Ferrari', years: '2025 - Future' },
    ],
    teams: ['McLaren', 'Mercedes', 'Ferrari'],
    achievements: ['World Champion', 'Monaco GP Winner', 'British GP Winner', 'Pole Sitter', 'Race Winner', '100+ Race Wins'],
  },
  {
    id: 'fernando-alonso',
    name: 'Fernando Alonso',
    code: 'ALO',
    number: 14,
    nationality: 'Spain',
    flag: '🇪🇸',
    currentTeam: 'Aston Martin',
    engine: 'Mercedes',
    championships: 2,
    raceWins: 32,
    podiums: 106,
    debutYear: 2001,
    age: 43,
    careerPath: [
      { team: 'Minardi', years: '2001' },
      { team: 'Renault', years: '2003 - 2006' },
      { team: 'McLaren', years: '2007' },
      { team: 'Renault', years: '2008 - 2009' },
      { team: 'Ferrari', years: '2010 - 2014' },
      { team: 'McLaren', years: '2015 - 2018' },
      { team: 'Alpine', years: '2021 - 2022' },
      { team: 'Aston Martin', years: '2023 - Present' },
    ],
    teams: ['Minardi', 'Renault', 'McLaren', 'Ferrari', 'Alpine', 'Aston Martin'],
    achievements: ['World Champion', 'Monaco GP Winner', 'Le Mans Winner', 'Pole Sitter', 'Race Winner', '10+ Race Wins'],
  },
  {
    id: 'charles-leclerc',
    name: 'Charles Leclerc',
    code: 'LEC',
    number: 16,
    nationality: 'Monaco',
    flag: '🇲🇨',
    currentTeam: 'Ferrari',
    engine: 'Ferrari',
    championships: 0,
    raceWins: 8,
    podiums: 42,
    debutYear: 2018,
    age: 27,
    careerPath: [
      { team: 'Sauber', years: '2018' },
      { team: 'Ferrari', years: '2019 - Present' },
    ],
    teams: ['Sauber', 'Ferrari', 'Alfa Romeo'],
    achievements: ['Monaco GP Winner', 'Italian GP Winner', 'Pole Sitter', 'Race Winner'],
  },
  {
    id: 'lando-norris',
    name: 'Lando Norris',
    code: 'NOR',
    number: 4,
    nationality: 'United Kingdom',
    flag: '🇬🇧',
    currentTeam: 'McLaren',
    engine: 'Mercedes',
    championships: 0,
    raceWins: 3,
    podiums: 26,
    debutYear: 2019,
    age: 24,
    careerPath: [
      { team: 'McLaren', years: '2019 - Present' },
    ],
    teams: ['McLaren'],
    achievements: ['Pole Sitter', 'Race Winner', 'Podium Finisher'],
  },
  {
    id: 'george-russell',
    name: 'George Russell',
    code: 'RUS',
    number: 63,
    nationality: 'United Kingdom',
    flag: '🇬🇧',
    currentTeam: 'Mercedes',
    engine: 'Mercedes',
    championships: 0,
    raceWins: 2,
    podiums: 14,
    debutYear: 2019,
    age: 26,
    careerPath: [
      { team: 'Williams', years: '2019 - 2021' },
      { team: 'Mercedes', years: '2022 - Present' },
    ],
    teams: ['Williams', 'Mercedes'],
    achievements: ['Pole Sitter', 'Race Winner', 'Podium Finisher'],
  },
  {
    id: 'oscar-piastri',
    name: 'Oscar Piastri',
    code: 'PIA',
    number: 81,
    nationality: 'Australia',
    flag: '🇦🇺',
    currentTeam: 'McLaren',
    engine: 'Mercedes',
    championships: 0,
    raceWins: 2,
    podiums: 9,
    debutYear: 2023,
    age: 23,
    careerPath: [
      { team: 'McLaren', years: '2023 - Present' },
    ],
    teams: ['McLaren'],
    achievements: ['Race Winner', 'Sprint Winner', 'Podium Finisher'],
  },
  {
    id: 'carlos-sainz',
    name: 'Carlos Sainz',
    code: 'SAI',
    number: 55,
    nationality: 'Spain',
    flag: '🇪🇸',
    currentTeam: 'Ferrari',
    engine: 'Ferrari',
    championships: 0,
    raceWins: 4,
    podiums: 25,
    debutYear: 2015,
    age: 30,
    careerPath: [
      { team: 'Toro Rosso', years: '2015 - 2017' },
      { team: 'Renault', years: '2017 - 2018' },
      { team: 'McLaren', years: '2019 - 2020' },
      { team: 'Ferrari', years: '2021 - 2024' },
      { team: 'Williams', years: '2025 - Future' },
    ],
    teams: ['Toro Rosso', 'Renault', 'McLaren', 'Ferrari', 'Williams'],
    achievements: ['British GP Winner', 'Singapore GP Winner', 'Pole Sitter', 'Race Winner', 'Podium Finisher'],
  },
  {
    id: 'sergio-perez',
    name: 'Sergio Perez',
    code: 'PER',
    number: 11,
    nationality: 'Mexico',
    flag: '🇲🇽',
    currentTeam: 'Red Bull',
    engine: 'Honda RBPT',
    championships: 0,
    raceWins: 6,
    podiums: 39,
    debutYear: 2011,
    age: 34,
    careerPath: [
      { team: 'Sauber', years: '2011 - 2012' },
      { team: 'McLaren', years: '2013' },
      { team: 'Force India', years: '2014 - 2018' },
      { team: 'Racing Point', years: '2019 - 2020' },
      { team: 'Red Bull Racing', years: '2021 - Present' },
    ],
    teams: ['Sauber', 'McLaren', 'Force India', 'Racing Point', 'Red Bull Racing', 'Red Bull'],
    achievements: ['Monaco GP Winner', 'Azerbaijan GP Winner', 'Pole Sitter', 'Race Winner', 'Podium Finisher'],
  },
  {
    id: 'pierre-gasly',
    name: 'Pierre Gasly',
    code: 'GAS',
    number: 10,
    nationality: 'France',
    flag: '🇫🇷',
    currentTeam: 'Alpine',
    engine: 'Renault',
    championships: 0,
    raceWins: 1,
    podiums: 5,
    debutYear: 2017,
    age: 28,
    careerPath: [
      { team: 'Toro Rosso', years: '2017 - 2018' },
      { team: 'Red Bull Racing', years: '2019' },
      { team: 'Toro Rosso / AlphaTauri', years: '2019 - 2022' },
      { team: 'Alpine', years: '2023 - Present' },
    ],
    teams: ['Toro Rosso', 'Red Bull Racing', 'AlphaTauri', 'Alpine'],
    achievements: ['Italian GP Winner', 'Race Winner', 'Podium Finisher'],
  },
  {
    id: 'esteban-ocon',
    name: 'Esteban Ocon',
    code: 'OCO',
    number: 31,
    nationality: 'France',
    flag: '🇫🇷',
    currentTeam: 'Alpine',
    engine: 'Renault',
    championships: 0,
    raceWins: 1,
    podiums: 4,
    debutYear: 2016,
    age: 28,
    careerPath: [
      { team: 'Manor', years: '2016' },
      { team: 'Force India', years: '2017 - 2018' },
      { team: 'Renault', years: '2020' },
      { team: 'Alpine', years: '2021 - 2024' },
      { team: 'Haas', years: '2025 - Future' },
    ],
    teams: ['Manor', 'Force India', 'Renault', 'Alpine', 'Haas'],
    achievements: ['Hungarian GP Winner', 'Race Winner', 'Podium Finisher'],
  },
  {
    id: 'alexander-albon',
    name: 'Alexander Albon',
    code: 'ALB',
    number: 23,
    nationality: 'Thailand',
    flag: '🇹🇭',
    currentTeam: 'Williams',
    engine: 'Mercedes',
    championships: 0,
    raceWins: 0,
    podiums: 2,
    debutYear: 2019,
    age: 28,
    careerPath: [
      { team: 'Toro Rosso', years: '2019' },
      { team: 'Red Bull Racing', years: '2019 - 2020' },
      { team: 'Williams', years: '2022 - Present' },
    ],
    teams: ['Toro Rosso', 'Red Bull Racing', 'Williams'],
    achievements: ['Podium Finisher'],
  },
  {
    id: 'yuki-tsunoda',
    name: 'Yuki Tsunoda',
    code: 'TSU',
    number: 22,
    nationality: 'Japan',
    flag: '🇯🇵',
    currentTeam: 'RB',
    engine: 'Honda RBPT',
    championships: 0,
    raceWins: 0,
    podiums: 0,
    debutYear: 2021,
    age: 24,
    careerPath: [
      { team: 'AlphaTauri', years: '2021 - 2023' },
      { team: 'RB', years: '2024 - Present' },
    ],
    teams: ['AlphaTauri', 'RB', 'Toro Rosso'],
    achievements: ['Points Scorer', 'Fastest Lap'],
  },
  {
    id: 'valtteri-bottas',
    name: 'Valtteri Bottas',
    code: 'BOT',
    number: 77,
    nationality: 'Finland',
    flag: '🇫🇮',
    currentTeam: 'Kick Sauber',
    engine: 'Ferrari',
    championships: 0,
    raceWins: 10,
    podiums: 67,
    debutYear: 2013,
    age: 35,
    careerPath: [
      { team: 'Williams', years: '2013 - 2016' },
      { team: 'Mercedes', years: '2017 - 2021' },
      { team: 'Alfa Romeo / Sauber', years: '2022 - Present' },
    ],
    teams: ['Williams', 'Mercedes', 'Alfa Romeo', 'Kick Sauber', 'Sauber'],
    achievements: ['Pole Sitter', 'Race Winner', '10+ Race Wins', 'Constructors Champion Helper'],
  },
  {
    id: 'nico-hulkenberg',
    name: 'Nico Hulkenberg',
    code: 'HUL',
    number: 27,
    nationality: 'Germany',
    flag: '🇩🇪',
    currentTeam: 'Haas',
    engine: 'Ferrari',
    championships: 0,
    raceWins: 0,
    podiums: 0,
    debutYear: 2010,
    age: 37,
    careerPath: [
      { team: 'Williams', years: '2010' },
      { team: 'Force India', years: '2012' },
      { team: 'Sauber', years: '2013' },
      { team: 'Force India', years: '2014 - 2016' },
      { team: 'Renault', years: '2017 - 2019' },
      { team: 'Racing Point / Aston Martin', years: '2020, 2022' },
      { team: 'Haas', years: '2023 - 2024' },
      { team: 'Sauber / Audi', years: '2025 - Future' },
    ],
    teams: ['Williams', 'Force India', 'Sauber', 'Renault', 'Racing Point', 'Aston Martin', 'Haas'],
    achievements: ['Pole Sitter', 'Le Mans 24h Winner'],
  },
  {
    id: 'daniel-ricciardo',
    name: 'Daniel Ricciardo',
    code: 'RIC',
    number: 3,
    nationality: 'Australia',
    flag: '🇦🇺',
    currentTeam: 'RB',
    engine: 'Honda RBPT',
    championships: 0,
    raceWins: 8,
    podiums: 32,
    debutYear: 2011,
    age: 35,
    careerPath: [
      { team: 'HRT', years: '2011' },
      { team: 'Toro Rosso', years: '2012 - 2013' },
      { team: 'Red Bull Racing', years: '2014 - 2018' },
      { team: 'Renault', years: '2019 - 2020' },
      { team: 'McLaren', years: '2021 - 2022' },
      { team: 'AlphaTauri / RB', years: '2023 - 2024' },
    ],
    teams: ['HRT', 'Toro Rosso', 'Red Bull Racing', 'Renault', 'McLaren', 'AlphaTauri', 'RB'],
    achievements: ['Monaco GP Winner', 'Italian GP Winner', 'Pole Sitter', 'Race Winner', 'Podium Finisher'],
  },
  {
    id: 'sebastian-vettel',
    name: 'Sebastian Vettel',
    code: 'VET',
    number: 5,
    nationality: 'Germany',
    flag: '🇩🇪',
    currentTeam: 'Aston Martin',
    engine: 'Mercedes',
    championships: 4,
    raceWins: 53,
    podiums: 122,
    debutYear: 2007,
    age: 37,
    careerPath: [
      { team: 'BMW Sauber', years: '2007' },
      { team: 'Toro Rosso', years: '2007 - 2008' },
      { team: 'Red Bull Racing', years: '2009 - 2014' },
      { team: 'Ferrari', years: '2015 - 2020' },
      { team: 'Aston Martin', years: '2021 - 2022' },
    ],
    teams: ['BMW Sauber', 'Toro Rosso', 'Red Bull Racing', 'Ferrari', 'Aston Martin'],
    achievements: ['World Champion', 'Monaco GP Winner', 'Pole Sitter', 'Race Winner', '50+ Race Wins'],
  },
  {
    id: 'kimi-raikkonen',
    name: 'Kimi Raikkonen',
    code: 'RAI',
    number: 7,
    nationality: 'Finland',
    flag: '🇫🇮',
    currentTeam: 'Alfa Romeo',
    engine: 'Ferrari',
    championships: 1,
    raceWins: 21,
    podiums: 103,
    debutYear: 2001,
    age: 45,
    careerPath: [
      { team: 'Sauber', years: '2001' },
      { team: 'McLaren', years: '2002 - 2006' },
      { team: 'Ferrari', years: '2007 - 2009' },
      { team: 'Lotus', years: '2012 - 2013' },
      { team: 'Ferrari', years: '2014 - 2018' },
      { team: 'Alfa Romeo', years: '2019 - 2021' },
    ],
    teams: ['Sauber', 'McLaren', 'Ferrari', 'Lotus', 'Alfa Romeo'],
    achievements: ['World Champion', 'Monaco GP Winner', 'Spa Specialist', 'Pole Sitter', 'Race Winner', '20+ Race Wins'],
  },
  {
    id: 'michael-schumacher',
    name: 'Michael Schumacher',
    code: 'MSC',
    number: 1,
    nationality: 'Germany',
    flag: '🇩🇪',
    currentTeam: 'Mercedes',
    engine: 'Mercedes',
    championships: 7,
    raceWins: 91,
    podiums: 155,
    debutYear: 1991,
    age: 55,
    careerPath: [
      { team: 'Jordan', years: '1991' },
      { team: 'Benetton', years: '1991 - 1995' },
      { team: 'Ferrari', years: '1996 - 2006' },
      { team: 'Mercedes', years: '2010 - 2012' },
    ],
    teams: ['Jordan', 'Benetton', 'Ferrari', 'Mercedes'],
    achievements: ['World Champion', 'Monaco GP Winner', 'Spa Specialist', 'Pole Sitter', 'Race Winner', '50+ Race Wins'],
  },
  {
    id: 'ayrton-senna',
    name: 'Ayrton Senna',
    code: 'SEN',
    number: 1,
    nationality: 'Brazil',
    flag: '🇧🇷',
    currentTeam: 'Williams',
    engine: 'Renault',
    championships: 3,
    raceWins: 41,
    podiums: 80,
    debutYear: 1984,
    age: 34,
    careerPath: [
      { team: 'Toleman', years: '1984' },
      { team: 'Lotus', years: '1985 - 1987' },
      { team: 'McLaren', years: '1988 - 1993' },
      { team: 'Williams', years: '1994' },
    ],
    teams: ['Toleman', 'Lotus', 'McLaren', 'Williams'],
    achievements: ['World Champion', 'Monaco GP King (6 wins)', 'Qualifying Master', 'Pole Sitter', 'Race Winner', '40+ Race Wins'],
  },
  {
    id: 'alain-prost',
    name: 'Alain Prost',
    code: 'PRO',
    number: 1,
    nationality: 'France',
    flag: '🇫🇷',
    currentTeam: 'Williams',
    engine: 'Renault',
    championships: 4,
    raceWins: 51,
    podiums: 106,
    debutYear: 1980,
    age: 69,
    careerPath: [
      { team: 'McLaren', years: '1980' },
      { team: 'Renault', years: '1981 - 1983' },
      { team: 'McLaren', years: '1984 - 1989' },
      { team: 'Ferrari', years: '1990 - 1991' },
      { team: 'Williams', years: '1993' },
    ],
    teams: ['McLaren', 'Renault', 'Ferrari', 'Williams'],
    achievements: ['World Champion', 'Monaco GP Winner', 'The Professor', 'Pole Sitter', 'Race Winner', '50+ Race Wins'],
  },
  {
    id: 'niki-lauda',
    name: 'Niki Lauda',
    code: 'LAU',
    number: 1,
    nationality: 'Austria',
    flag: '🇦🇹',
    currentTeam: 'McLaren',
    engine: 'TAG Porsche',
    championships: 3,
    raceWins: 25,
    podiums: 54,
    debutYear: 1971,
    age: 70,
    careerPath: [
      { team: 'March', years: '1971 - 1972' },
      { team: 'BRM', years: '1973' },
      { team: 'Ferrari', years: '1974 - 1977' },
      { team: 'Brabham', years: '1978 - 1979' },
      { team: 'McLaren', years: '1982 - 1985' },
    ],
    teams: ['March', 'BRM', 'Ferrari', 'Brabham', 'McLaren'],
    achievements: ['World Champion', 'Monaco GP Winner', 'Comeback Legend', 'Pole Sitter', 'Race Winner', '20+ Race Wins'],
  },
  {
    id: 'jenson-button',
    name: 'Jenson Button',
    code: 'BUT',
    number: 22,
    nationality: 'United Kingdom',
    flag: '🇬🇧',
    currentTeam: 'McLaren',
    engine: 'Honda',
    championships: 1,
    raceWins: 15,
    podiums: 50,
    debutYear: 2000,
    age: 44,
    careerPath: [
      { team: 'Williams', years: '2000' },
      { team: 'Benetton / Renault', years: '2001 - 2002' },
      { team: 'BAR / Honda', years: '2003 - 2008' },
      { team: 'Brawn GP', years: '2009' },
      { team: 'McLaren', years: '2010 - 2017' },
    ],
    teams: ['Williams', 'Benetton', 'Renault', 'BAR', 'Honda', 'Brawn GP', 'McLaren'],
    achievements: ['World Champion', 'Monaco GP Winner', 'Canadian GP 2011 Miracle', 'Pole Sitter', 'Race Winner', '10+ Race Wins'],
  },
  {
    id: 'nico-rosberg',
    name: 'Nico Rosberg',
    code: 'ROS',
    number: 6,
    nationality: 'Germany',
    flag: '🇩🇪',
    currentTeam: 'Mercedes',
    engine: 'Mercedes',
    championships: 1,
    raceWins: 23,
    podiums: 57,
    debutYear: 2006,
    age: 39,
    careerPath: [
      { team: 'Williams', years: '2006 - 2009' },
      { team: 'Mercedes', years: '2010 - 2016' },
    ],
    teams: ['Williams', 'Mercedes'],
    achievements: ['World Champion', 'Monaco GP Winner (3 in a row)', 'Pole Sitter', 'Race Winner', '20+ Race Wins'],
  },
  {
    id: 'felipe-massa',
    name: 'Felipe Massa',
    code: 'MAS',
    number: 19,
    nationality: 'Brazil',
    flag: '🇧🇷',
    currentTeam: 'Williams',
    engine: 'Mercedes',
    championships: 0,
    raceWins: 11,
    podiums: 41,
    debutYear: 2002,
    age: 43,
    careerPath: [
      { team: 'Sauber', years: '2002, 2004 - 2005' },
      { team: 'Ferrari', years: '2006 - 2013' },
      { team: 'Williams', years: '2014 - 2017' },
    ],
    teams: ['Sauber', 'Ferrari', 'Williams'],
    achievements: ['Brazilian GP Winner', 'Pole Sitter', 'Race Winner', '10+ Race Wins', 'Podium Finisher'],
  },
  {
    id: 'kevin-magnussen',
    name: 'Kevin Magnussen',
    code: 'MAG',
    number: 20,
    nationality: 'Denmark',
    flag: '🇩🇰',
    currentTeam: 'Haas',
    engine: 'Ferrari',
    championships: 0,
    raceWins: 0,
    podiums: 1,
    debutYear: 2014,
    age: 32,
    careerPath: [
      { team: 'McLaren', years: '2014 - 2015' },
      { team: 'Renault', years: '2016' },
      { team: 'Haas', years: '2017 - 2020, 2022 - 2024' },
    ],
    teams: ['McLaren', 'Renault', 'Haas'],
    achievements: ['Pole Sitter (Brazil 2022)', 'Debut Podium (Australia 2014)'],
  },
  {
    id: 'lance-stroll',
    name: 'Lance Stroll',
    code: 'STR',
    number: 18,
    nationality: 'Canada',
    flag: '🇨🇦',
    currentTeam: 'Aston Martin',
    engine: 'Mercedes',
    championships: 0,
    raceWins: 0,
    podiums: 3,
    debutYear: 2017,
    age: 26,
    careerPath: [
      { team: 'Williams', years: '2017 - 2018' },
      { team: 'Racing Point', years: '2019 - 2020' },
      { team: 'Aston Martin', years: '2021 - Present' },
    ],
    teams: ['Williams', 'Racing Point', 'Aston Martin'],
    achievements: ['Pole Sitter (Turkey 2020)', 'Podium Finisher'],
  },
  {
    id: 'zhou-guanyu',
    name: 'Zhou Guanyu',
    code: 'ZHO',
    number: 24,
    nationality: 'China',
    flag: '🇨🇳',
    currentTeam: 'Kick Sauber',
    engine: 'Ferrari',
    championships: 0,
    raceWins: 0,
    podiums: 0,
    debutYear: 2022,
    age: 25,
    careerPath: [
      { team: 'Alfa Romeo', years: '2022 - 2023' },
      { team: 'Kick Sauber', years: '2024' },
    ],
    teams: ['Alfa Romeo', 'Kick Sauber', 'Sauber'],
    achievements: ['First Chinese F1 Driver', 'Points on Debut'],
  },
  {
    id: 'mark-webber',
    name: 'Mark Webber',
    code: 'WEB',
    number: 2,
    nationality: 'Australia',
    flag: '🇦🇺',
    currentTeam: 'Retired / Red Bull',
    engine: 'Renault',
    championships: 0,
    raceWins: 9,
    podiums: 42,
    debutYear: 2002,
    age: 48,
    careerPath: [
      { team: 'Minardi', years: '2002' },
      { team: 'Jaguar', years: '2003 - 2004' },
      { team: 'Williams', years: '2005 - 2006' },
      { team: 'Red Bull Racing', years: '2007 - 2013' },
    ],
    teams: ['Minardi', 'Jaguar', 'Williams', 'Red Bull Racing', 'Red Bull'],
    achievements: ['Monaco GP Winner', 'British GP Winner', 'Pole Sitter', 'Race Winner'],
  },
  {
    id: 'david-coulthard',
    name: 'David Coulthard',
    code: 'COU',
    number: 10,
    nationality: 'United Kingdom',
    flag: '🇬🇧',
    currentTeam: 'Retired / Red Bull',
    engine: 'Mercedes',
    championships: 0,
    raceWins: 13,
    podiums: 62,
    debutYear: 1994,
    age: 53,
    careerPath: [
      { team: 'Williams', years: '1994 - 1995' },
      { team: 'McLaren', years: '1996 - 2004' },
      { team: 'Red Bull Racing', years: '2005 - 2008' },
    ],
    teams: ['Williams', 'McLaren', 'Red Bull Racing', 'Red Bull'],
    achievements: ['Monaco GP Winner', 'British GP Winner', 'Pole Sitter', 'Race Winner', '10+ Race Wins'],
  },
  {
    id: 'rubens-barrichello',
    name: 'Rubens Barrichello',
    code: 'BAR',
    number: 2,
    nationality: 'Brazil',
    flag: '🇧🇷',
    currentTeam: 'Retired / Stock Car',
    engine: 'Ferrari',
    championships: 0,
    raceWins: 11,
    podiums: 68,
    debutYear: 1993,
    age: 52,
    careerPath: [
      { team: 'Jordan', years: '1993 - 1996' },
      { team: 'Stewart', years: '1997 - 1999' },
      { team: 'Ferrari', years: '2000 - 2005' },
      { team: 'Honda', years: '2006 - 2008' },
      { team: 'Brawn GP', years: '2009' },
      { team: 'Williams', years: '2010 - 2011' },
    ],
    teams: ['Jordan', 'Stewart', 'Ferrari', 'Honda', 'Brawn GP', 'Williams'],
    achievements: ['Italian GP Winner', 'Pole Sitter', 'Race Winner', '10+ Race Wins', '300+ GP Starts'],
  },
  {
    id: 'mika-hakkinen',
    name: 'Mika Häkkinen',
    code: 'HAK',
    number: 1,
    nationality: 'Finland',
    flag: '🇫🇮',
    currentTeam: 'Retired / McLaren',
    engine: 'Mercedes',
    championships: 2,
    raceWins: 20,
    podiums: 51,
    debutYear: 1991,
    age: 56,
    careerPath: [
      { team: 'Lotus', years: '1991 - 1992' },
      { team: 'McLaren', years: '1993 - 2001' },
    ],
    teams: ['Lotus', 'McLaren'],
    achievements: ['World Champion', 'Monaco GP Winner', 'Pole Sitter', 'Race Winner', '2x World Champion'],
  },
  {
    id: 'nigel-mansell',
    name: 'Nigel Mansell',
    code: 'MAN',
    number: 5,
    nationality: 'United Kingdom',
    flag: '🇬🇧',
    currentTeam: 'Retired',
    engine: 'Renault',
    championships: 1,
    raceWins: 31,
    podiums: 59,
    debutYear: 1980,
    age: 71,
    careerPath: [
      { team: 'Lotus', years: '1980 - 1984' },
      { team: 'Williams', years: '1985 - 1988' },
      { team: 'Ferrari', years: '1989 - 1990' },
      { team: 'Williams', years: '1991 - 1992' },
      { team: 'Williams', years: '1994' },
      { team: 'McLaren', years: '1995' },
    ],
    teams: ['Lotus', 'Williams', 'Ferrari', 'McLaren'],
    achievements: ['World Champion', 'British GP Winner', 'Pole Sitter', 'Race Winner', '10+ Race Wins'],
  },
  {
    id: 'damon-hill',
    name: 'Damon Hill',
    code: 'HIL',
    number: 0,
    nationality: 'United Kingdom',
    flag: '🇬🇧',
    currentTeam: 'Retired / Sky F1',
    engine: 'Renault',
    championships: 1,
    raceWins: 22,
    podiums: 42,
    debutYear: 1992,
    age: 64,
    careerPath: [
      { team: 'Brabham', years: '1992' },
      { team: 'Williams', years: '1993 - 1996' },
      { team: 'Arrows', years: '1997' },
      { team: 'Jordan', years: '1998 - 1999' },
    ],
    teams: ['Brabham', 'Williams', 'Arrows', 'Jordan'],
    achievements: ['World Champion', 'British GP Winner', 'Pole Sitter', 'Race Winner', '10+ Race Wins'],
  },
  {
    id: 'romain-grosjean',
    name: 'Romain Grosjean',
    code: 'GRO',
    number: 8,
    nationality: 'France',
    flag: '🇫🇷',
    currentTeam: 'IndyCar',
    engine: 'Ferrari',
    championships: 0,
    raceWins: 0,
    podiums: 10,
    debutYear: 2009,
    age: 38,
    careerPath: [
      { team: 'Renault', years: '2009' },
      { team: 'Lotus', years: '2012 - 2015' },
      { team: 'Haas', years: '2016 - 2020' },
    ],
    teams: ['Renault', 'Lotus', 'Haas'],
    achievements: ['10 F1 Podiums', 'Bahrain Fire Survivor', 'IndyCar Pole Sitter'],
  },
];

// Helper to get daily secret driver based on calendar day
export function getDailyDriver(date = new Date()) {
  const dayIndex = Math.floor(
    (Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()) -
      Date.UTC(2024, 0, 1)) /
      (1000 * 60 * 60 * 24)
  );
  const index = Math.abs(dayIndex) % F1_DRIVERS.length;
  return F1_DRIVERS[index];
}

// Helper to evaluate guess against secret driver
export function compareDrivers(guess, secret) {
  const result = {
    driver: guess,
    nameMatch: guess.id === secret.id,
    team: {
      value: guess.currentTeam,
      status:
        guess.currentTeam === secret.currentTeam
          ? 'exact'
          : secret.teams.includes(guess.currentTeam)
          ? 'partial'
          : 'miss',
    },
    nationality: {
      value: `${guess.flag} ${guess.nationality}`,
      status: guess.nationality === secret.nationality ? 'exact' : 'miss',
    },
    engine: {
      value: guess.engine,
      status: guess.engine === secret.engine ? 'exact' : 'miss',
    },
    championships: {
      value: guess.championships,
      status:
        guess.championships === secret.championships
          ? 'exact'
          : guess.championships < secret.championships
          ? 'higher'
          : 'lower',
    },
    podiums: {
      value: guess.podiums,
      status:
        guess.podiums === secret.podiums
          ? 'exact'
          : guess.podiums < secret.podiums
          ? 'higher'
          : 'lower',
    },
    raceWins: {
      value: guess.raceWins,
      status:
        guess.raceWins === secret.raceWins
          ? 'exact'
          : guess.raceWins < secret.raceWins
          ? 'higher'
          : 'lower',
    },
    age: {
      value: guess.age,
      status:
        guess.age === secret.age
          ? 'exact'
          : guess.age < secret.age
          ? 'higher'
          : 'lower',
    },
    debutYear: {
      value: guess.debutYear,
      status:
        guess.debutYear === secret.debutYear
          ? 'exact'
          : guess.debutYear < secret.debutYear
          ? 'higher'
          : 'lower',
    },
  };

  return result;
}

// Generate shareable emoji result like Wordle
export function generateShareGrid(guesses, secret, isWon, mode = 'Daily') {
  const rows = guesses.map((g) => {
    const comp = compareDrivers(g, secret);
    const getEmoji = (prop) => {
      if (prop.status === 'exact') return '🟩';
      if (prop.status === 'partial') return '🟨';
      if (prop.status === 'higher') return '⬆️';
      if (prop.status === 'lower') return '⬇️';
      return '⬛';
    };

    return [
      getEmoji(comp.nationality),
      getEmoji(comp.team),
      getEmoji(comp.engine),
      getEmoji(comp.championships),
      getEmoji(comp.podiums),
      getEmoji(comp.debutYear),
      getEmoji(comp.age),
    ].join('');
  });

  const header = `🏎️ PaddockDle (${mode}) - ${isWon ? guesses.length : 'X'}/6`;
  return `${header}\n\n${rows.join('\n')}\n\nhttps://react-nexus.web.app`;
}

// ==========================================
// PADDOCKDLE GRID (3x3 IMMACULATE GRID) DATA
// ==========================================

export const GRID_CATEGORIES = {
  ferrari: {
    id: 'ferrari',
    label: 'Ferrari',
    badge: 'Scuderia Ferrari',
    type: 'team',
    color: '#e10600',
    check: (d) => d.teams.some((t) => /ferrari/i.test(t)),
  },
  mercedes: {
    id: 'mercedes',
    label: 'Mercedes',
    badge: 'Mercedes-AMG',
    type: 'team',
    color: '#00d2be',
    check: (d) => d.teams.some((t) => /mercedes/i.test(t)),
  },
  redbull: {
    id: 'redbull',
    label: 'Red Bull',
    badge: 'Red Bull Racing',
    type: 'team',
    color: '#1e41ff',
    check: (d) => d.teams.some((t) => /red bull/i.test(t)),
  },
  mclaren: {
    id: 'mclaren',
    label: 'McLaren',
    badge: 'McLaren F1',
    type: 'team',
    color: '#ff8700',
    check: (d) => d.teams.some((t) => /mclaren/i.test(t)),
  },
  renault_alpine: {
    id: 'renault_alpine',
    label: 'Alpine / Renault',
    badge: 'Alpine / Lotus / Renault',
    type: 'team',
    color: '#0090ff',
    check: (d) => d.teams.some((t) => /renault|alpine|lotus/i.test(t)),
  },
  williams: {
    id: 'williams',
    label: 'Williams',
    badge: 'Williams Racing',
    type: 'team',
    color: '#005aff',
    check: (d) => d.teams.some((t) => /williams/i.test(t)),
  },
  sauber: {
    id: 'sauber',
    label: 'Sauber / Alfa Romeo',
    badge: 'Hinwil Team',
    type: 'team',
    color: '#00e700',
    check: (d) => d.teams.some((t) => /sauber|alfa romeo|kick/i.test(t)),
  },
  champion: {
    id: 'champion',
    label: 'World Champion 🏆',
    badge: '1+ World Titles',
    type: 'stat',
    color: '#ffd700',
    check: (d) => d.championships >= 1,
  },
  podiums_10: {
    id: 'podiums_10',
    label: '10+ Podiums 🍾',
    badge: '10+ Career Podiums',
    type: 'stat',
    color: '#a855f7',
    check: (d) => d.podiums >= 10,
  },
  podiums_50: {
    id: 'podiums_50',
    label: '50+ Podiums ⭐',
    badge: '50+ Career Podiums',
    type: 'stat',
    color: '#ec4899',
    check: (d) => d.podiums >= 50,
  },
  race_winner: {
    id: 'race_winner',
    label: 'Race Winner 🏁',
    badge: '1+ GP Victories',
    type: 'stat',
    color: '#10b981',
    check: (d) => d.raceWins >= 1,
  },
  british: {
    id: 'british',
    label: 'British Driver 🇬🇧',
    badge: 'United Kingdom',
    type: 'nationality',
    color: '#3b82f6',
    check: (d) => d.nationality === 'United Kingdom',
  },
  german: {
    id: 'german',
    label: 'German Driver 🇩🇪',
    badge: 'Germany',
    type: 'nationality',
    color: '#f59e0b',
    check: (d) => d.nationality === 'Germany',
  },
};

export const CURATED_GRIDS = [
  {
    id: 'grid-1',
    title: 'Titan Constructors vs Champions',
    rows: ['ferrari', 'mclaren', 'williams'],
    cols: ['champion', 'british', 'podiums_50'],
  },
  {
    id: 'grid-2',
    title: 'Modern Powerhouses',
    rows: ['redbull', 'mercedes', 'ferrari'],
    cols: ['race_winner', 'champion', 'podiums_10'],
  },
  {
    id: 'grid-3',
    title: 'Historic Legends & Podiums',
    rows: ['mclaren', 'renault_alpine', 'williams'],
    cols: ['podiums_10', 'champion', 'race_winner'],
  },
  {
    id: 'grid-4',
    title: 'German & British Precision',
    rows: ['mercedes', 'ferrari', 'williams'],
    cols: ['german', 'british', 'race_winner'],
  },
  {
    id: 'grid-5',
    title: 'Midfield to Glory',
    rows: ['sauber', 'redbull', 'renault_alpine'],
    cols: ['race_winner', 'podiums_10', 'champion'],
  },
  {
    id: 'grid-6',
    title: 'Speed & Silverware',
    rows: ['ferrari', 'redbull', 'williams'],
    cols: ['race_winner', 'podiums_10', 'british'],
  },
];

export function getDailyGrid(date = new Date()) {
  const dayIndex = Math.floor(
    (Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()) -
      Date.UTC(2024, 0, 1)) /
      (1000 * 60 * 60 * 24)
  );
  const index = Math.abs(dayIndex) % CURATED_GRIDS.length;
  return CURATED_GRIDS[index];
}

export function getRandomGrid() {
  const index = Math.floor(Math.random() * CURATED_GRIDS.length);
  return CURATED_GRIDS[index];
}

export function validateDriverForCell(driver, rowCatKey, colCatKey) {
  const rowCategory = GRID_CATEGORIES[rowCatKey];
  const colCategory = GRID_CATEGORIES[colCatKey];
  if (!rowCategory || !colCategory) return false;
  return rowCategory.check(driver) && colCategory.check(driver);
}

export function generateGridShareText(cells, solvedCount, mode = 'Daily') {
  const gridRows = [0, 1, 2].map((r) => {
    return [0, 1, 2]
      .map((c) => {
        const cell = cells[`${r}-${c}`];
        return cell ? '🟩' : '⬛';
      })
      .join('');
  });

  return `🏎️ PaddockDle Grid (${mode}) - ${solvedCount}/9 Immaculate Cells!\n\n${gridRows.join(
    '\n'
  )}\n\nhttps://react-nexus.web.app/paddockdle-grid`;
}

// ==========================================
// PADDOCKDLE CAREER (TIMELINE GUESSER) DATA
// ==========================================

export function getDailyCareerDriver(date = new Date()) {
  const dayIndex = Math.floor(
    (Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()) -
      Date.UTC(2024, 0, 1)) /
      (1000 * 60 * 60 * 24)
  );
  // Shift by 7 so classic and career aren't always the same driver on the same day
  const index = Math.abs(dayIndex + 7) % F1_DRIVERS.length;
  return F1_DRIVERS[index];
}

export function getRandomCareerDriver() {
  const index = Math.floor(Math.random() * F1_DRIVERS.length);
  return F1_DRIVERS[index];
}

export function generateCareerClues(driver) {
  return [
    {
      step: 1,
      title: 'Debut Team & Entry Year',
      value: `${driver.careerPath[0].team} (${driver.careerPath[0].years})`,
      hint: `Entered F1 around ${driver.debutYear}`,
      icon: 'Flag',
    },
    {
      step: 2,
      title: 'Career Trajectory / Teams',
      value: driver.careerPath.map((c) => `${c.team} (${c.years})`).join(' ➔ '),
      hint: `${driver.teams.length} distinct teams in Formula 1`,
      icon: 'GitFork',
    },
    {
      step: 3,
      title: 'Nationality & Heritage',
      value: `${driver.flag} ${driver.nationality}`,
      hint: `Engine heritage: ${driver.engine}`,
      icon: 'Globe',
    },
    {
      step: 4,
      title: 'Podiums & Victories',
      value: `${driver.podiums} Podiums • ${driver.raceWins} Grand Prix Wins`,
      hint: driver.raceWins > 0 ? `Race Winner with ${driver.raceWins} GP triumphs` : 'Seeking first GP victory',
      icon: 'Trophy',
    },
    {
      step: 5,
      title: 'Championships & Driver Code',
      value: `${driver.championships > 0 ? `${driver.championships}x World Champion 🏆` : 'Non-Champion'} • Code: ${driver.code} (#${driver.number})`,
      hint: `Age ${driver.age}`,
      icon: 'Award',
    },
  ];
}

export function generateCareerShareText(driver, step, isWon, mode = 'Daily') {
  const score = isWon ? (6 - step) * 200 : 0;
  const boxes = [1, 2, 3, 4, 5]
    .map((s) => (s < step ? '🟥' : s === step && isWon ? '🟩' : '⬜'))
    .join('');

  return `🏎️ PaddockDle Career (${mode})\n${isWon ? `Identified in Clue ${step}/5!` : 'DNF (Out of clues)'}\nScore: ${score} pts\n${boxes}\n\nhttps://react-nexus.web.app/paddockdle-career`;
}
