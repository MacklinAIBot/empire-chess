# Empire Chess - Project Specification

## Overview

- **Project Name:** Empire Chess
- **Type:** Multiplayer chess variant web game
- **Core Functionality:** A scalable chess variant supporting 2-4 players on an expanded board with custom movement rules
- **Target Users:** Chess enthusiasts, strategy game players

---

## Game Rules (v1.0)

### Board & Scale
- **Scale:** 4x (32×32 board, 4x standard pieces per player)
- **Players:** 2-4 (expandable to 8 in later versions)
- **Starting positions:** Evenly spaced along edges, 1 player per edge at 2-player, 2 per edge at 4-player

### Pieces
- Standard chess set scaled 4x:
  - 4 Kings (player chooses which is the "main" king)
  - 4 Queens
  - 8 Rooks
  - 8 Bishops
  - 8 Knights
  - 32 Pawns

### Movement
- **Standard mode:** Pieces move up to 4x their normal distance
- **King in check:** Limited to 1 square movement only
- **Pawns:** Can move sideways (left/right) in addition to forward
- **Turn order:** Clockwise direction

### Winning Condition
- **Last player/team standing** — capture all enemy kings to win

---

## Tech Stack

- **Framework:** React 18 + TypeScript
- **Build Tool:** Vite
- **Deployment:** Vercel
- **Repository:** GitHub

---

## UI Features

- 32×32 grid board
- Click-to-select, click-to-move
- Valid move highlighting
- Turn indicator
- Player colors
- Check warning
- Win detection
- Responsive design for mobile
