# FocusPilot 🎮

**Gamified productivity — level up your life.**

FocusPilot is a retro-style productivity app that turns your daily focus sessions into an RPG experience. Earn XP, level up your pilot, unlock rewards, and stay on track with a built-in Pomodoro timer, countdown events, and rich notes — all wrapped in a sleek pixel-art aesthetic.

🔗 **Live Demo:** [focuspilot.vercel.app](https://focuspilot.vercel.app)

---

## Features

### 🎯 Focus & Pomodoro Timer
- Pomodoro-based focus sessions with short and long breaks
- Timer runs persistently in the background — navigate freely without losing progress
- Scaled XP rewards per cycle: 25 → 50 → 75 → 100 XP
- Live countdown bubble on the home screen while a session is active
- Session history with a 7-day focus chart

### 🧑‍✈️ Pilot & Progression System
- Earn XP and level up your pixel-art pilot mascot
- 5 stats: Strength, Skills, Intelligence, Vitality, Senses
- Stats grow based on the categories of tasks you complete
- XP bar, level titles, and animated stat flash on gain

### ✅ Task Manager
- Add tasks with notes and category tags
- Drag-and-drop manual reordering
- Time-spent tracking (focus sessions only, not breaks)
- Sort by manual order, A–Z, or time spent
- Custom categories with custom stat mappings

### ⏱ Countdown Events
- Track upcoming events with live countdowns
- Colour-coded cards, sort by date or creation time

### 📝 Rich Notes
- Full rich-text editor with font family, font size, bold, italic, underline
- Colour-tagged notes with live preview
- Sort by last edited or date created

### 🎵 Lo-Fi Music Engine
- 5 fully procedural lo-fi tracks — no copyright, generated via Web Audio API
- Spinning record player button on the home screen
- Track name appears on click, disappears after 3 seconds
- Volume control and per-sound toggles in settings

### ⭐ Reward Shop
- Create custom rewards with point costs
- Redeem points earned from tasks and focus sessions
- Confetti burst animation on redemption

### 🎨 UI & Polish
- Dark and light theme with animated sun/moon toggle
- Retro pixel mascot with wobble animation and random dialogue
- Satisfying retro click sound on every button press
- Fully responsive within a 390px app shell

---

## Tech Stack

| Layer | Tech |
|---|---|
| Framework | React 19 + TypeScript |
| Build | Vite |
| State | Zustand (with persist middleware) |
| Styling | CSS variables + Tailwind |
| Audio | Web Audio API (procedural) |
| Storage | localStorage |

---

## Getting Started

```bash
# Clone the repo
git clone https://github.com/riyasatzaman/focuspilot.git
cd focuspilot

# Install dependencies
npm install

# Start dev server
npm run dev

# Build for production
npm run build
```

---

## Deployment

This app is a static SPA — deploy anywhere:

- **Vercel** (recommended): import the repo, Vite is auto-detected
- **Netlify**: drag and drop the `dist/` folder after `npm run build`
- **GitHub Pages**: use the `dist/` output with any static host action

---

## License

MIT — free to use, modify, and distribute.
