# PresencePal

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Electron](https://img.shields.io/badge/Electron-31-47848F?logo=electron)](https://www.electronjs.org/)
[![Platform](https://img.shields.io/badge/Platform-Windows-0078D4?logo=windows)](https://github.com/foxmanhwa/presencepal/releases)

Set your Discord game activity to any game — including mobile titles Discord can't detect on its own.

---

## Features

- 6000+ games pulled live from Discord's detectable games list
- Mobile game support — Clash Royale, Brawl Stars, PUBG Mobile, and more
- Live elapsed timer shown in your activity
- Custom games — add any exe name not in the list
- Discord-style dark UI
- NSIS installer and portable single-exe builds

---

## How It Works

PresencePal copies a small background executable, renames it to the game's exact process name, and launches it from the folder path Discord expects. Discord's process scanner detects it by name and registers it as your active game.

```
PresencePal -> spawn game.exe -> Discord process scanner -> your activity status
```

Note: the background process window is visible in the taskbar while a game is active. This is required for Discord to detect it.

---

## Installation

Download the latest installer or portable exe from [Releases](https://github.com/foxmanhwa/presencepal/releases).

To build from source:

```bash
git clone https://github.com/foxmanhwa/presencepal.git
cd presencepal
npm install
npm start
```

Requirements: Node.js 18+, Discord running on your PC, Discord status set to Online.

---

## Usage

1. Launch PresencePal and make sure Discord is open and set to Online
2. Search for a game in the sidebar
3. Select the executable from the dropdown (pick the non-launcher exe when multiple are listed)
4. Click Launch — Discord will detect the process within a few seconds
5. Click Stop to end the activity

### Adding a custom game

Click **+ Add Custom Game** at the bottom of the sidebar. Provide the game name and the exact `.exe` filename Discord associates with it. You can find the correct exe name by looking up the game on [discord.com/api/v9/applications/detectable](https://discord.com/api/v9/applications/detectable).

---

## Contributing

```bash
git clone https://github.com/foxmanhwa/presencepal.git
cd presencepal
npm install
npm start
```

- Add or update games: `src/renderer/games.js`
- UI: `src/renderer/index.html`
- Main process / spawn logic: `src/main/index.js`

Open a PR with a clear description of what changed and why.

---

## License

MIT (c) foxmanhwa
