# BattleX Points Arena

A blue-and-black esports tournament scoring app for Free Fire and BGMI.
The starter version works without login and stores draft data in the browser.

## Features
- Free Fire / BGMI game selection
- Tournament and team setup
- Manual match result entry and configurable placement/kill points
- Automatic leaderboard calculation
- 100+ generated visual theme variations for points tables and certificates
- Certificate preview and print-to-PDF
- Screenshot upload preview and OCR workflow placeholder
- Responsive dark-blue interface with reduced-motion support

## Requirements
- Node.js 20.9+ (Node.js 22 recommended)
- npm

## Run locally
1. Extract the ZIP.
2. In the project folder, run `npm install`.
3. Run `npm run dev`.
4. Open `http://localhost:3000`.

## Deploy to Vercel
1. Push the project to a GitHub repository.
2. Import the repository in Vercel.
3. Set Vercel **Root Directory** to `apps/web`.
4. Framework preset: Next.js; build command: `npm run build`.
5. Deploy.

No environment variables are required for the local starter.

## Important current limitations
- Browser storage is local to the device/browser. It is not cloud sync and can be cleared by the user.
- Screenshot upload currently provides a preview only. OCR requires a configured OCR service/API and must be connected before scan results can be trusted.
- Certificate printing uses the browser print dialog; a dedicated server-side PDF pipeline can be added later.
- The app is a starter implementation and should be tested with real tournament rules before production use.
