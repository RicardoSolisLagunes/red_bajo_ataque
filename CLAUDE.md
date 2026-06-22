# Red Bajo Ataque
This is a web videogame, to teach the user about networks and their security. You can find the details in [README.md](/CLAUDE.md).

# Presentation
The game should be playable in a simple html page, localy.

## UI
Use plain HTML and vector assets under [/src](/src/) for the icons and images.

## Navigation and Interaction
The user should be able to go around the challenges by mearly clicks on a tab menu on top. When a user leaves a challenge, the progess is lost.

# Game
## Memory
This can be either using text files under [/memory](/memory/), cookies or in ram that is forgoten when you close the page.

## Scores
When the page first opens, we need to ask for a name and remember it throughout the session. The score will be saved under that name in a file under [/memory](/memory/). The game keeps track of how many mistakes were commited each challenge attempt and the time it took to complete.\
If the user attempts a challenge multiple times, the game only keeps the highest score achieved along with the time spent.

### Score calculation
We start each challenge with a per-challenge amount of points, which will decrease with every mistake or when too much time goes by. The lowest we can go is 0 points.
- Time: First 25s don't substract any points. After that, each 10s will decrease 10 points, up to 50 lost points.
- Mistakes: Every mistake will decrease 

### Scoreboard
The scoreboard is stored in [scoreboard.txt](/memory/scoreboard.txt) as a json string.\
The scoreboard will display a table with the next columns:
- Name (String) --> Nickname of the player entered on the game start.
- Score (Integer) --> Total score accumulated from all challenges.
- Time (Integer) --> Reference to the total time in seconds spent in the challenges.

The scoreboard is ordered only by the Score value.