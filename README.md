# PresencePal

Set your Discord game activity to any game — including mobile titles Discord can't detect on its own.

## The problem

Discord shows what game you're playing automatically — but only if it's running on your PC. If you play on your phone, tablet, or any device that isn't your PC, your status stays blank. PresencePal fixes that.

## How it works

PresencePal runs a small background process named after the real game executable. Discord's process scanner picks it up and registers it as your active game — the same way it detects any real PC game.

## Features

- 10,444 verified Discord games pulled live from Discord's API
- Auto-selects the correct executable for each game — no manual configuration
- Recently played and favorites for quick access
- System tray support — runs quietly in the background
- Full keyboard navigation
- Add any custom game not in the list

## Quest completion

As a side effect of how Discord detects games, running a game through PresencePal will also tick Discord Quest timers for that game. This works for most play-time quests. We are honest that this is a side effect, not the primary purpose — but it works, and we are not going to pretend otherwise.

## Requirements

- Windows 10 or later
- Discord desktop app must be running
- Discord status must be set to Online to show activity to friends

## Installation

Download the latest installer or portable exe from the Releases page.

## Windows Defender warning

Windows may flag PresencePal as potentially harmful when you first run it. This is a false positive.

The warning appears because PresencePal spawns a small background process named after a real game executable — the same technique antivirus software flags as suspicious, even when the intent is harmless. The source code is fully public and auditable at github.com/foxmanhwa/presencepal.

To run it anyway:

1. When Windows SmartScreen appears, click "More info"
2. Click "Run anyway"

Or if Windows Defender quarantined the file:

1. Open Windows Security
2. Go to Virus & threat protection > Protection history
3. Find the PresencePal entry and click Allow

This is a known limitation of unsigned open source applications. We are not able to fix it without purchasing a code signing certificate.

## Building from source

```
git clone https://github.com/foxmanhwa/presencepal.git
cd presencepal
npm install
npm start
```

## License

MIT (c) foxmanhwa
