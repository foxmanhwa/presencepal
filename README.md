# 🎮 PresencePal

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Electron](https://img.shields.io/badge/Electron-31-47848F?logo=electron)](https://www.electronjs.org/)
[![Discord RPC](https://img.shields.io/badge/Discord-RPC-5865F2?logo=discord)](https://discord.com/)
[![Platform](https://img.shields.io/badge/Platform-Windows-0078D4?logo=windows)](https://github.com/foxmanhwa/presencepal/releases)

> Set your Discord Rich Presence to any game — including mobile games Discord can't detect automatically.

![PresencePal Screenshot](assets/screenshot.png)

---

## ✨ Features

- 🕹️ **30+ built-in games** — Mobile, PC, and Console titles
- 📱 **Mobile game support** — Clash Royale, Brawl Stars, PUBG Mobile, and more
- ⏱️ **Live play timer** — Shows elapsed time in Discord
- 🎨 **Discord-style UI** — Frameless dark theme that feels native
- ➕ **Custom games** — Add any game not in the list
- ⚡ **One-click activity** — Set, preview, and clear presence instantly
- 🔌 **No login required** — Uses Discord's local IPC connection

---

## 🚀 How It Works

PresencePal connects to Discord's local IPC socket using the [Discord RPC protocol](https://discord.com/developers/docs/topics/rpc). It sets your Rich Presence activity without needing to open Discord's developer tools or install anything extra — Discord just needs to be running.

```
PresencePal → discord-rpc → Discord local IPC → Your profile
```

---

## 📦 Installation

### Download (recommended)

Grab the latest portable `.exe` from [Releases](https://github.com/foxmanhwa/presencepal/releases) — no install needed, just run it.

### Build from source

```bash
git clone https://github.com/foxmanhwa/presencepal.git
cd presencepal
npm install
npm start
```

**Requirements:** Node.js 18+, Discord running on your PC.

---

## 🎯 Usage

1. **Launch PresencePal** and make sure Discord is open
2. **Pick a game** from the sidebar (search or filter by category)
3. **Customize** the details and state lines
4. Click **Set Activity** — your Discord profile updates instantly
5. Click **Stop** to clear the activity

### Adding a custom game

Click **+ Add Custom Game** at the bottom of the sidebar and fill in the name, emoji, and (optionally) your own Discord Application Client ID for a custom large image.

---

## 🔧 Using Your Own Client ID

By default, PresencePal uses a shared Application ID. To show a **custom game image** on your profile:

1. Go to [Discord Developer Portal](https://discord.com/developers/applications) → New Application
2. Add art assets under **Rich Presence → Art Assets**
3. Copy your **Application ID** and paste it into the Client ID field in PresencePal

---

## 🤝 Contributing

Contributions are welcome! To add games or fix bugs:

```bash
git clone https://github.com/foxmanhwa/presencepal.git
cd presencepal
npm install
npm start
```

- **Add games:** Edit `src/renderer/games.js`
- **UI changes:** Edit `src/renderer/index.html`
- **Main process:** Edit `src/main/index.js`

Open a PR and describe what you changed. Keep PRs focused — one feature or fix per PR.

---

## 📄 License

MIT © [foxmanhwa](https://github.com/foxmanhwa)
