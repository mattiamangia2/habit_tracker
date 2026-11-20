# Dayloop

A personal habit tracker with streaks and a year wall. It runs entirely in the browser: no account, no server.

## Views

- **Today**: a colored card per habit due that day. Tap the check to mark it done, or use +/− for count and minutes habits. The week strip lets you go back and fill in past days. The sidebar has today's ring, your perfect-day streak, your level and points, and the next milestone.
- **Habits**: every habit with its schedule, the last 30 days, completion rate and current streak. Click a row to edit it, drag the handle to reorder. The form on the right adds new habits (yes/no, count or minutes; time of day; icon; colour; days).
- **Year**: a 12 × 31 wall of the year. Filter by habit, click any day to correct it, or replay the year. It also shows streaks, completion, month-by-month bars and milestones.
- **Insights**: done-vs-due for the last 4 weeks, 12 weeks or year, compared with the period before. Shows week-by-week and weekday charts, a per-habit breakdown (click one to focus on it) and plain-language findings.

Keyboard: `1`–`4` switch views. On Today, the arrow keys move between cards, `Enter` checks one off, and `[` / `]` change the day.

## Run it

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # static site in dist/
```

`dist/` is a static site, so you can host it anywhere (GitHub Pages, Netlify, Vercel) and add it to your phone's home screen.

## Your data

On first launch the app shows a sample year so you can explore. Open **Settings** (gear icon) and choose **Clear sample, start fresh** to begin with your own habits.

Data is saved in your browser's `localStorage`. Use **Export backup** in Settings now and then, and **Import backup** to restore it or move it to another device.

Points: 10 per check-in, plus 25 for each perfect day (every due habit done). Every 1,000 points is a level.
