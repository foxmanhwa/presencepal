const GAMES = [
  // Mobile
  { id: 'clash-royale', name: 'Clash Royale', category: 'Mobile', details: 'Battling in the Arena', state: 'Pushing trophies', clientId: '432980957394370572', imageKey: 'clash_royale' },
  { id: 'clash-of-clans', name: 'Clash of Clans', category: 'Mobile', details: 'Raiding villages', state: 'Building base', clientId: '432980957394370572', imageKey: 'clash_of_clans' },
  { id: 'brawl-stars', name: 'Brawl Stars', category: 'Mobile', details: 'Playing Brawl Stars', state: 'Ranked match', clientId: '432980957394370572', imageKey: 'brawl_stars' },
  { id: 'mobile-legends', name: 'Mobile Legends', category: 'Mobile', details: 'In a ranked match', state: 'Jungling', clientId: '432980957394370572', imageKey: 'mobile_legends' },
  { id: 'pubg-mobile', name: 'PUBG Mobile', category: 'Mobile', details: 'Dropping in', state: 'Solo match', clientId: '432980957394370572', imageKey: 'pubg_mobile' },
  { id: 'free-fire', name: 'Free Fire', category: 'Mobile', details: 'Surviving the zone', state: 'Battle Royale', clientId: '432980957394370572', imageKey: 'free_fire' },
  { id: 'genshin-impact-mobile', name: 'Genshin Impact', category: 'Mobile', details: 'Exploring Teyvat', state: 'Doing quests', clientId: '432980957394370572', imageKey: 'genshin_impact' },
  { id: 'honkai-star-rail', name: 'Honkai: Star Rail', category: 'Mobile', details: 'Riding the Astral Express', state: 'In battle', clientId: '432980957394370572', imageKey: 'honkai_star_rail' },
  { id: 'arena-of-valor', name: 'Arena of Valor', category: 'Mobile', details: 'In the arena', state: '5v5 match', clientId: '432980957394370572', imageKey: 'arena_of_valor' },
  { id: 'candy-crush', name: 'Candy Crush Saga', category: 'Mobile', details: 'Crushing candy', state: 'Level grinding', clientId: '432980957394370572', imageKey: 'candy_crush' },
  { id: 'pokemon-go', name: 'Pokemon GO', category: 'Mobile', details: 'Catching Pokemon', state: 'Out exploring', clientId: '432980957394370572', imageKey: 'pokemon_go' },
  { id: 'among-us-mobile', name: 'Among Us', category: 'Mobile', details: 'Looking for impostors', state: 'Crewmate', clientId: '432980957394370572', imageKey: 'among_us' },

  // PC
  { id: 'valorant', name: 'Valorant', category: 'PC', details: 'In a Competitive match', state: 'Ranked', clientId: '432980957394370572', imageKey: 'valorant' },
  { id: 'league-of-legends', name: 'League of Legends', category: 'PC', details: 'In Summoner\'s Rift', state: 'Ranked Solo/Duo', clientId: '432980957394370572', imageKey: 'league_of_legends' },
  { id: 'minecraft', name: 'Minecraft', category: 'PC', details: 'Mining and crafting', state: 'Survival mode', clientId: '432980957394370572', imageKey: 'minecraft' },
  { id: 'cs2', name: 'Counter-Strike 2', category: 'PC', details: 'Defusing on Dust II', state: 'Competitive', clientId: '432980957394370572', imageKey: 'cs2' },
  { id: 'fortnite', name: 'Fortnite', category: 'PC', details: 'Building and battling', state: 'Battle Royale', clientId: '432980957394370572', imageKey: 'fortnite' },
  { id: 'apex-legends', name: 'Apex Legends', category: 'PC', details: 'Dropping into Kings Canyon', state: 'Ranked Leagues', clientId: '432980957394370572', imageKey: 'apex_legends' },
  { id: 'overwatch2', name: 'Overwatch 2', category: 'PC', details: 'Playing Support', state: 'Competitive', clientId: '432980957394370572', imageKey: 'overwatch2' },
  { id: 'dota2', name: 'Dota 2', category: 'PC', details: 'Mid lane', state: 'Ranked match', clientId: '432980957394370572', imageKey: 'dota2' },
  { id: 'genshin-impact', name: 'Genshin Impact', category: 'PC', details: 'Exploring Teyvat', state: 'World quests', clientId: '432980957394370572', imageKey: 'genshin_impact' },
  { id: 'roblox', name: 'Roblox', category: 'PC', details: 'Playing on Roblox', state: 'In a game', clientId: '432980957394370572', imageKey: 'roblox' },
  { id: 'steam', name: 'Steam', category: 'PC', details: 'Browsing Steam', state: 'Looking for games', clientId: '432980957394370572', imageKey: 'steam' },
  { id: 'rust', name: 'Rust', category: 'PC', details: 'Surviving the wasteland', state: 'PvP', clientId: '432980957394370572', imageKey: 'rust' },
  { id: 'terraria', name: 'Terraria', category: 'PC', details: 'Digging deep', state: 'Hardmode', clientId: '432980957394370572', imageKey: 'terraria' },

  // Console
  { id: 'fifa24', name: 'EA FC 24', category: 'Console', details: 'Playing Ultimate Team', state: 'Division Rivals', clientId: '432980957394370572', imageKey: 'ea_fc24' },
  { id: 'gta5', name: 'GTA V Online', category: 'Console', details: 'Causing chaos in Los Santos', state: 'Free roam', clientId: '432980957394370572', imageKey: 'gta5' },
  { id: 'cod-warzone', name: 'Call of Duty: Warzone', category: 'Console', details: 'Dropping into Verdansk', state: 'Solos', clientId: '432980957394370572', imageKey: 'warzone' },
  { id: 'rocket-league', name: 'Rocket League', category: 'Console', details: 'In a Ranked match', state: 'Diamond II', clientId: '432980957394370572', imageKey: 'rocket_league' },
  { id: 'fall-guys', name: 'Fall Guys', category: 'Console', details: 'Stumbling through rounds', state: 'Show', clientId: '432980957394370572', imageKey: 'fall_guys' },

  // Custom placeholder
  { id: 'custom', name: 'Custom Game', category: 'Custom', details: 'Playing a game', state: '', clientId: '432980957394370572', imageKey: 'default' },
];

if (typeof module !== 'undefined') module.exports = GAMES;
