# PresencePal

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Electron](https://img.shields.io/badge/Electron-31-47848F?logo=electron)](https://www.electronjs.org/)
[![Platform](https://img.shields.io/badge/Platform-Windows-0078D4?logo=windows)](https://github.com/foxmanhwa/presencepal/releases)

Set your Discord game activity to any game — including mobile titles Discord can't detect on its own.

---

## Features

- 10,000+ games pulled live from Discord's detectable games list
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
3. Click Launch — the correct executable is selected automatically
4. Click Stop to end the activity

### Adding a custom game

Click **+ Add Custom Game** at the bottom of the sidebar. Provide the game name and the exact `.exe` filename Discord associates with it. You can find the correct exe name by looking up the game on [discord.com/api/v9/applications/detectable](https://discord.com/api/v9/applications/detectable).

---

## Companion App

Control your Discord activity from your phone over local Wi-Fi.

### Setup

1. Make sure your phone and PC are on the same Wi-Fi network
2. Find your PC's local IP address: open Command Prompt and run `ipconfig`, then look for **IPv4 Address** under your Wi-Fi adapter (e.g. `192.168.1.42`)
3. Open `companion/index.html` from this repo in your phone's browser, or serve it with any static file server:
   ```bash
   npx serve companion
   ```
4. Enter your PC IP in the companion app and tap **Connect**

PresencePal listens on two ports when running:
- **HTTP — port 41235**: `GET /play?game=...`, `GET /stop`, `GET /status`
- **UDP — port 41234**: JSON packets `{ "action": "play", "game": "..." }` or `{ "action": "stop" }`

### Usage

- Tap any game card to set it as your Discord activity
- A **Stop Activity** bar appears at the bottom while a game is active
- The gear icon in the top-right lets you switch to a different PC IP

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
