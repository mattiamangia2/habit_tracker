# Dayloop

A personal habit tracker with streaks and a year wall. It runs entirely in the browser: no account, no server.

## Views

- **Today**: a colored card per habit due that day. Tap the check to mark it done, or use +/− for count and minutes habits. The week strip lets you go back and fill in past days. The sidebar has today's ring, your perfect-day streak, your level and points, and the next milestone.
- **Habits**: every habit with its schedule, the last 30 days, completion rate and current streak. Click a row to edit it, drag the handle to reorder. The form on the right adds new habits (yes/no, count or minutes; time of day; icon; colour; days).
- **Year**: a 12 × 31 wall of the year. Filter by habit, click any day to correct it, or replay the year. It also shows streaks, completion, month-by-month bars and milestones.
- **Insights**: done-vs-due for the last 4 weeks, 12 weeks or year, compared with the period before. Shows week-by-week and weekday charts, a per-habit breakdown (click one to focus on it) and plain-language findings.

Keyboard: `1`–`4` switch views. On Today, the arrow keys move between cards, `Enter` checks one off, and `[` / `]` change the day.

## Open it

The app is published with GitHub Pages at **https://mattiamangia2.github.io/habit_tracker/**. It updates automatically every time `main` changes.

- **Desktop:** open the link in Chrome or Edge. To get it as a desktop app, click the install icon at the right of the address bar.
- **Android:** open the link in Chrome, tap ⋮ → **Add to Home screen** → **Install**. It then opens full-screen like a normal app and also works offline.

### One-time setup (already done once, then never again)

1. Merge this branch into `main`.
2. On GitHub, open the repo → **Settings** → **Pages** → under **Source** choose **GitHub Actions**.
3. Open the **Actions** tab, then **Deploy to GitHub Pages** → **Run workflow** (or just push to `main`).

## Run it locally

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # static site in dist/
```

## Your data

On first launch the app shows a sample year so you can explore. Open **Settings** (gear icon) and choose **Clear sample, start fresh** to begin with your own habits.

Data is saved in your browser's `localStorage`. Your computer and your phone each keep their **own separate copy**: they do not sync. Pick one device as your main tracker, or move your data across with **Export backup** on one device and **Import backup** on the other (Settings → gear icon). Export a backup now and then either way.

Points: 10 per check-in, plus 25 for each perfect day (every due habit done). Every 1,000 points is a level.
