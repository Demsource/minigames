# minigames

# Minigames Platform (Story 1)

A modern, responsive single-page web application featuring interactive game components, user authentication flows, leaderboards, and a sleek user interface built with modern web technologies.

## Features

- **Responsive Layout:** Mobile-friendly design featuring a collapsible burger menu, custom navigation headers, and structured footers.
- **Interactive Components:** Dynamic hero sections, interactive carousel sliders, and real-time game development showcases.
- **Leaderboard System:** Clean, structured tabular views displaying top player scores and rankings.
- **Authentication Flow:** Smooth modal triggers, login/register switchers, and robust form validation states.

## App Session Storage

After a successful sign-in, the client-side app session is stored in `localStorage` as one JSON object under this key:

```
minigames:demsource-rs-minigames:app-session
```

Stored fields: `displayName`, `email`, `authenticatedAt` (`Date.now()` milliseconds) and `avatarUrl` (only when available). No passwords or Firebase tokens are stored.

The session lasts a fixed **5 minutes** from `authenticatedAt`. Reloading or using the app does not extend it. When the session expires, or the stored value is invalid, the key is removed, Firebase `signOut` is called and the app returns to Guest Mode.

## Prerequisites

Ensure you have the following installed on your machine:

- **Node.js** (v18.x or higher recommended)
- **npm** (or your preferred package manager like yarn or pnpm)

## Getting Started

1. Clone the repository:
   ````bash
   git clone <your-repository-url>
   cd minigames```
   git checkout story-1
   npm install
   npm run dev
   ````
