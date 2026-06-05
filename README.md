# Coalesce App

This is the live workshop app for the Coalesce Mythos resilience exercise.

## What is implemented

- A facilitator/admin route at `/admin`
- A team route at `/team`
- A public display route at `/display`
- Intro briefing references for slides 1, 4, 5 to 7, 10 to 12, 14, 15, 19, and 31
- Six realistic live turns, each mapped to one follow-up slide from 22, 23, 24, 25, 27, and 28
- Team registration, 60-coin workstream allocation with reserve, Intel token usage, confidence selection, and rank-and-stack answers
- A public leaderboard driven by enterprise resilience score

## Current runtime mode

The app now includes a lightweight Node server plus WebSocket session sync.

That means:

- Admin, Team, and Display stay in sync across separate browsers on the same machine.
- You can test locally by opening different browsers or profiles against the same local URL.
- The same production build can be deployed as a single app instead of splitting the frontend and backend.

## Local production test

Build the assets, then run the production server:

```bash
npm run build
npm run start
```

Then open these routes in different browsers:

- `http://localhost:3000/admin`
- `http://localhost:3000/team`
- `http://localhost:3000/display`

Register 2 to 3 teams, launch turns from Admin, and use Display as the room screen.

## Local development

From this folder:

```bash
npm install
npm run dev
```

To expose the app on your local network for testing with nearby devices:

```bash
npm run dev:lan
```

## Production build

```bash
npm run build
```

The static build output lands in `dist`.

## Cheapest hosting path

Because the app now needs a realtime server, host it on a low-cost Node platform rather than static-only hosting.

Practical options:

- Render
- Railway
- Fly.io
- Any VPS or container host that can run `npm run build` and `npm run start`

Point your custom DNS, for example `coalesce.proctoriq.com`, to that deployed service.

## Route summary

- `/` gives the route chooser, intro slide plan, and hosting summary.
- `/admin` runs the briefing flow, timer, turn reveals, and leaderboard.
- `/team` registers a table and handles live submissions.
- `/display` is the projection-safe room view.

## Production run command

```bash
npm run prod
```
