# 🐾 NyaNudge

> **Your cat-powered wellness companion.**

NyaNudge is a minimalist, privacy-first wellness reminder app built to help you build healthier habits through the gentle, sometimes judgmental, but always loving nudges of virtual cats. 

Whether it's remembering to drink water, stretch, or take your medication, NyaNudge replaces nagging push notifications with delightful micro-moments.

---

## ✨ Why NyaNudge?

Most habit trackers feel like chores. NyaNudge changes the dynamic by pairing essential health reminders with witty, category-specific messages and charming animations. 

- **Cat-Driven Delight:** Each reminder is delivered by a virtual feline friend (meet Mochi, Sora, or Kuro!) who reacts uniquely to the type of reminder you receive.
- **Zero Friction:** No mandatory accounts, no cloud sync required. Just set your preferences and let the cats do the rest.
- **Respectful & Quiet:** Choose exactly how you want to be notified—sound and vibration, vibration only, or completely silent.
- **Privacy First:** Your data is yours. Everything is stored locally on your device via an encrypted SQLite database. No telemetry, no ads.

## 🚀 Key Features

- 💧 **Hydration Tracking:** Gentle nudges to keep your water bowl full.
- 🍽 **Meal Reminders:** Timely alerts so you never miss breakfast or lunch.
- 🏃 **Movement Alerts:** Encouragement to get up and do your zoomies.
- 🚽 **Bathroom Breaks:** Reminders to step away from the screen for self-care.
- 💊 **Medication Alerts:** Reliable, persistent notifications for your daily doses.
- 🔥 **Streak Tracking:** Build consistency and unlock celebrations for extended streaks.

---

## 🛠️ Tech Stack

NyaNudge is built with web developers in mind. We use standard web technologies wrapped in a native shell, offering a 1:1 experience with modern frontend development.

- **Framework:** [React 18](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/)
- **Build Tool:** [Vite 5](https://vitejs.dev/)
- **Native Runtime:** [Capacitor.js v6](https://capacitorjs.com/) (iOS & Android)
- **State Management:** [Zustand](https://github.com/pmndrs/zustand)
- **Local Database:** SQLite (via `@capacitor-community/sqlite`)
- **ORM:** [Drizzle ORM](https://orm.drizzle.team/)
- **Animations:** [Lottie-Web](https://airbnb.io/lottie/#/web)
- **i18n:** [i18next](https://www.i18next.com/)

---

## 📦 Getting Started

Ready to help build the ultimate cat-powered wellness app? Here's how to get NyaNudge running locally.

### Prerequisites

- [Node.js](https://nodejs.org/) (v18 or higher)
- [npm](https://www.npmjs.com/)
- *For native builds:* Android Studio and/or Xcode

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/wduqu001/Nyanudge.git
   cd Nyanudge
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Run the development server:**
   ```bash
   npm run dev
   ```
   *The app will be available at `http://localhost:5173`.*

### Native Execution (Capacitor)

To run NyaNudge on a simulator or physical device:

1. **Build the web assets:**
   ```bash
   npm run build
   ```

2. **Sync with Capacitor:**
   ```bash
   npx cap sync
   ```

3. **Open the native IDE:**
   ```bash
   npx cap open android  # or 'ios'
   ```

---

## 🗺️ Project Roadmap

NyaNudge is actively being developed. You can track our progress, upcoming features, and current tasks on our [GitHub Project Board](https://github.com/users/wduqu001/projects/1).

For a detailed breakdown of the product vision, architecture, and design tokens, check out the [Product Requirements Document (PRD)](docs/NyaNudge_PRD.md).

---

## 🤝 Contributing

We welcome contributions of all kinds—whether it's fixing bugs, improving documentation, or proposing new cat animations. Please take a look at our open issues before starting any major work.

*Made with 🐾 and ☕.*
