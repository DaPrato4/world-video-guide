
# World Video Guide

A personal web app that lets you **explore the world through geolocated YouTube videos by country**.
Users can suggest content, while **moderators/admins** review it (approve/reject) before it appears publicly on the map.

## Features

- **Interactive map** (world-atlas) with countries highlighted based on the number of approved videos.
- **Country overlay** with an approved video feed and **category** filters.
- **Video suggestion** (YouTube URL) with multiple categories + custom category.
- **Firebase Authentication**: Google, GitHub, Apple, Email/Password.
- **Moderation**: pending queue, approve/reject with reason.
- **User profile**: stats, suggested videos list, approved/rejected history, video removal.
- **Roles**: `user`, `moderator`, `admin` (admin only: user/role management).

## Stack

- **Vite** + **React 19** + **TypeScript**
- **Tailwind CSS v4**
- **Firebase** (Auth + Firestore) + **Firebase Hosting**
- **react-router-dom** (routing)
- **react19-simple-maps** (map)
- **Framer Motion** (UI animations) + Swiper (region selector on mobile)

## Running Locally

### Requirements

- Node.js (recommended **>= 20 LTS**)
- A Firebase project with Auth + Firestore enabled

### Setup

1) Install dependencies:

```bash
npm ci
```

2) Configure environment variables:

- Create a `.env.local` file starting from `.env.example`.
- Fill in the values using Firebase Console -> Project settings -> Your apps -> (Web app config).

```bash
cp .env.example .env.local
```

3) Start in development mode:

```bash
npm run dev
```

## Available Scripts

- `npm run dev` — starts the development server
- `npm run build` — production build (TypeScript + Vite)
- `npm run preview` — build preview
- `npm run lint` — ESLint

## Firebase: Recommended Configuration

### Authentication

Enable the providers you want to use:

- Google
- GitHub
- Apple (`apple.com` via OAuth provider)
- Email/Password

Note: if you enable GitHub/Apple, you must also configure the **OAuth redirect URIs** in the provider settings.

### Firestore: Used Collections

The app relies on three collections:

- `users` (doc id = `uid`)
	- `uid`, `email`, `displayName`, `role`, `photoURL`
	- `stats`: `pendingVideos`, `approvedVideos`, `rejectedVideos`, `suggestedVideos`
- `videos`
	- `url` (YouTube)
	- `countryCode` (numeric, e.g. `380`)
	- `status`: `pending | approved | rejected`
	- `categories`: `string[]`
	- `submittedBy`: `uid`
	- `createdAt` (Date/Timestamp)
	- `rejectionReason` (only if rejected)
- `categories`
	- documents with a `category` field (label shown in the UI)

### Indexes

In the user profile, a query `where(submittedBy == uid) + orderBy(createdAt desc)` is executed.
If Firestore requires it, create the **composite index** suggested by the error link in the console.

## Deploy (Firebase Hosting)

The project is already configured as an SPA (rewrite to `index.html`).

```bash
npm run build
firebase deploy --only hosting
```

If you want to target your own Firebase project:

- edit `.firebaserc` or use `firebase use --add`

## Technical Notes

- Video metadata (title/thumbnail) is fetched through **YouTube oEmbed**.
- Country info (name/flag/capital coordinates) comes from **REST Countries**.
- The map uses the **world-atlas** dataset (TopoJSON) fetched from a CDN.

## License

MIT - see [LICENSE](LICENSE).

