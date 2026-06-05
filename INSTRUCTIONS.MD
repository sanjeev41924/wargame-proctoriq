# Coalesce App Instructions

This file is the single operating runbook for the Coalesce workshop app.

It covers:

- local startup
- screen assignment in the room
- facilitator and admin steps
- team steps
- the turn-by-turn operating rhythm
- a short troubleshooting section

## 1. What this app does

The app supports a live workshop with four surface types:

- one Admin control screen
- one center stage screen
- two side leaderboard screens
- one Team screen per table

The app includes:

- intro slide references for the facilitator
- turn briefing screens
- timed team answer collection
- live room leaderboard
- post-turn debrief support

The center stage experience now reuses the real 50-minute HTML deck directly for slide-based content.

## 2. Local startup

Open PowerShell in:

`Coalesce/app`

Run:

```bash
npm run build
npm run start
```

When the server starts, use:

`http://localhost:3000`

## 3. Browser routes

Use these routes:

- Home: `http://localhost:3000/`
- Admin: `http://localhost:3000/admin`
- Team: `http://localhost:3000/team`
- Center stage display: `http://localhost:3000/display`
- Side leaderboard display: `http://localhost:3000/display/leaderboard`

## 4. Screen assignment in the room

### Center stage screen

Use only:

`http://localhost:3000/display`

Purpose:

- full-screen facilitator intro slides from the real 50-minute HTML deck
- full-screen game rules
- full-screen turn briefing
- full-screen live timer state
- full-screen post-turn debrief slide from the real 50-minute HTML deck

The stage display uses a cleaned full-screen deck render with no slide progress bar, no on-screen Marp controls, and no vertical scrollbar.

This screen is intentionally cleaner than the admin view.

### Side screen 1

Use only:

`http://localhost:3000/display/leaderboard`

### Side screen 2

Use only:

`http://localhost:3000/display/leaderboard`

Purpose of the two side screens:

- show a static holding slide from the real deck before the game starts
- switch automatically to the live leaderboard once Turn 1 briefing begins
- remain leaderboard-focused during the game

### Admin laptop

Use only:

`http://localhost:3000/admin`

### Team devices

Each table uses:

`http://localhost:3000/team`

One device per table is enough.

## 5. Recommended local simulation setup

To simulate a live room locally, open the app in separate browsers or browser profiles.

Suggested pattern:

1. Browser 1: Admin
2. Browser 2: Center stage display
3. Browser 3: Side leaderboard
4. Browser 4: Team 1
5. Browser 5: Team 2
6. Browser 6: Team 3

## 6. Facilitator and admin instructions

### Before the session

1. Start the app server.
2. Open the Admin route on your laptop.
3. Open the stage route on the center screen.
4. Open the side leaderboard route on both side screens.
5. Confirm the side screens show the holding slide.
6. Ask each table to open the Team route.

### During registration

1. Ask each table to enter a team name, table number, and sector.
2. Ask each table to decide how many coins to commit before the game starts and how many to hold in reserve.
3. Remind them they can place up to 10 coins per workstream from a 60-coin pool.
4. Confirm teams appear in the Admin leaderboard snapshot.

### Intro sequence

The facilitator intro uses these exact slides from the 50-minute deck:

- 1
- 4
- 5
- 6
- 7
- 10
- 11
- 12
- 14
- 15
- 19
- 31

You have two ways to run the opening.

#### Option A: Run the intro from the app

Use the Admin console to step through the intro sequence and keep the center screen on the stage route.

#### Option B: Run a separate deck first

If you prefer to run your own intro deck outside the app:

1. Keep the app open on the admin laptop.
2. Leave the side screens on the leaderboard holding slide.
3. Run your separate intro deck on the center stage screen.
4. Return to the app when you are ready to begin the rules and game flow.

### Start of the game

1. In Admin, click `Open game rules`.
2. The center screen shows the rules slide.
3. Teams stay on their own focused team screens.
4. Side screens remain on the holding slide until the game starts.

### Start Turn 1

1. In Admin, click `Show turn briefing`.
2. The center stage screen changes to the Turn 1 briefing.
3. The side screens automatically switch from the holding slide to the live leaderboard.
4. Read the turn story aloud from the center screen.

### Post-turn slide mapping

After each timed turn, the center stage screen uses the exact matching slide from the 50-minute deck.

Current mapping:

1. Turn 1 → Slide 22
2. Turn 2 → Slide 24
3. Turn 3 → Slide 23
4. Turn 4 → Slide 25
5. Turn 5 → Slide 27
6. Turn 6 → Slide 28

### Launch a timed turn

1. In Admin, click `Launch timed turn`.
2. The center stage screen stays on the turn briefing slide.
3. A timer overlay appears in the top-right corner of that same briefing slide.
4. Teams rank their top 4 actions on their own devices.
5. The side screens continue showing leaderboard context.

### End a turn

1. Let the timer expire naturally, or click `Reveal follow-up slide`.
2. The center stage screen changes to the post-turn debrief slide.
3. Discuss the lesson for that turn.
4. If needed, click `Show leaderboard` to put rankings on the center screen too.

### Move to the next turn

1. Click `Advance to next turn`.
2. Click `Show turn briefing` for the next round.
3. Repeat the same rhythm.

### Suggested operating rhythm for every turn

1. Turn briefing on the center screen
2. Timed table answer phase
3. Post-turn debrief slide on the center screen
4. Leaderboard check on the side screens
5. Move to next turn

## 7. Team instructions

### Registration

Each table should:

1. Open `http://localhost:3000/team`
2. Enter the team name
3. Enter the table number
4. Enter the sector
5. Commit coins across the six workstreams
6. Keep any unused coins in reserve if the table wants later flexibility
7. Confirm no workstream exceeds 10 coins
8. Click `Register this table`

After registration, the team screen switches into a more focused table view.

### What the team sees after registration

The post-registration screen is intentionally simpler.

It shows:

- the current phase
- the current turn title
- the same deck slide as the center screen during intro and deck-backed debrief phases
- the timer when relevant
- the live turn instructions
- the committed and reserve coin position
- the team KPI status
- the answer panel only when the timer is open

### During a briefing phase

1. Read the turn story on the team screen.
2. Discuss the evidence and pressure lanes.
3. Do not submit yet.

### During a live turn

1. Rank the top 4 actions in order.
2. Choose confidence: low, medium, or high.
3. Spend an Intel token only if the team wants the hidden clue.
4. Click `Lock table answer` before time runs out.

### During a rebalance turn

If the turn allows rebalance:

1. Adjust coins.
2. Keep each workstream at or below 10.
3. Use reserve coins if needed, or shift coins between workstreams.
4. Respect the rebalance limit shown on screen.
5. Click `Save posture`.

### After submission

1. Watch the center screen for the facilitator debrief.
2. Watch the side screens for leaderboard movement.
3. Wait for the next turn briefing.

## 8. Screen behavior summary

### Center screen behavior

- intro content is the exact 50-minute HTML deck slide render
- rules fit a single full-screen slide without scroll
- turn briefings are full screen
- live turns keep the briefing slide visible with a timer overlay in the top-right corner
- debrief slides are the exact 50-minute HTML deck slide render

### Side screen behavior

- static holding slide from the 50-minute deck before the game starts
- leaderboard once Turn 1 briefing begins
- leaderboard remains the main side-screen content throughout the game

### Team screen behavior

- registration first
- 60-coin posture with reserve shown explicitly
- focused table view after registration
- answer controls only when needed
- less noise than the admin screen

## 9. Troubleshooting

### The app does not open

1. Confirm you started the server from `Coalesce/app`
2. Run:

```bash
npm run build
npm run start
```

3. Confirm `http://localhost:3000` loads

### Admin changes are not appearing on other screens

1. Refresh the affected browser once
2. Confirm all screens are using the same host and port
3. Confirm the server is still running in PowerShell

### A team screen still shows registration after earlier testing

Open the Team route in a fresh browser profile or register again on that device.

### Side screens do not switch to the leaderboard

The side screens switch once the game has actually started.

Use this sequence:

1. Register at least one team
2. Open game rules
3. Show Turn 1 briefing

At that point the side screens should move from the holding slide into leaderboard mode.

## 10. Short facilitator checklist

1. Start server
2. Open Admin
3. Open center stage display
4. Open both side leaderboard screens
5. Ask tables to register
6. Run intro
7. Open game rules
8. Show Turn 1 briefing
9. Launch timed turn
10. Reveal debrief slide
11. Advance and repeat