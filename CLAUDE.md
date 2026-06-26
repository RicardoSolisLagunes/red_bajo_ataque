# Red Bajo Ataque
This is a web videogame, to teach the user about networks and their security. You can find the details in [README.md](README.md).

# Presentation
The game is a single `index.html` page that runs locally in any modern browser.

## UI
Use plain HTML and CSS. Challenge visuals are generated as **inline SVG** in JavaScript. Vector assets under [/src](/src/) are used only for anti-phishing email icons.

A **📚 Docs** button in the header opens the documentation section, which contains the facilitator manual and a technical specification of each challenge topic.

## Navigation and Interaction
The user navigates via a tab menu at the top. When a user leaves a challenge, the progress is lost.

Completed challenges show a **✓** checkmark both in their tab and in their home-screen card.

## Challenges
There are **3 challenges**:
1. **El cable perdido** (`cable_perdido`) — identify the broken cable in a network topology.
2. **La intrusa** (`la_intrusa`) — identify the unauthorized device in a network diagram.
3. **Anti-phishing** (`anti_phishing`) — classify emails one at a time as phishing or legitimate. After a correct answer the game auto-advances after 1 second. A wrong answer shows the full explanation and the player must select the correct option to continue.

# Game
## Memory
Player name is stored in `sessionStorage` and `localStorage`. Scores are stored in `localStorage` under key `rba_scoreboard`. An optional `server.js` (Node.js, no dependencies) exposes a `/api/scoreboard` endpoint that persists to `memory/scoreboard.txt` — the game falls back to localStorage when the server is not running.

## Scores
When the page first opens, a modal asks for a nickname and remembers it throughout the session. The score is saved under that name in `localStorage` (and optionally in `memory/scoreboard.txt`). The game tracks mistakes and time per attempt. If the user attempts a challenge multiple times, only the highest score is kept.

### Score calculation
Each challenge starts at 100 points; the minimum is 0.
- Time: First 25s are free. After that, each 10s removes 10 points, up to 50 lost points.
- Mistakes: Every mistake removes 20 points.

Formula: `max(0, 100 - mistakes×20 - min(50, floor(max(0, secs-25)/10)×10))`

### Scoreboard
The scoreboard is stored in [scoreboard.txt](/memory/scoreboard.txt) as a JSON array.\
The scoreboard displays:
- Name (String) → Nickname of the player.
- Score (Integer) → Total score from all challenges.
- Time (Integer) → Total seconds spent across challenges.

The scoreboard is ordered by Score descending.