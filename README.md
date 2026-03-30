# ShiftSync — Multi-Location Staff Scheduling Platform

## Live Demo
- Frontend: https://shiftsync-client.vercel.app
- Backend: https://shiftsync-dlic.onrender.com

## Demo Accounts
| Role | Email | Password |
|------|-------|----------|
| Admin | admin@shiftsync.com | admin123 |
| Manager | manager.east@shiftsync.com | manager123 |
| Staff (Alex Thompson — Bartender) | staff1@shiftsync.com | staff123 |

## Tech Stack
- Frontend: Vue 3, TypeScript, Vuetify 3, Pinia
- Backend: Node.js, Express, Prisma, PostgreSQL
- Real-time: Socket.io
- Deployment: Vercel (frontend), Render (backend)

## Assumptions Made
- Consecutive days: any shift regardless of length counts as a worked day
- De-certified staff: historical shifts preserved, future assignments blocked
- Desired hours vs availability: availability is a hard constraint, desired hours is a soft preference
- Shift edited after swap approval: swap auto-cancelled, all parties notified
- Location timezone boundary: one canonical timezone assigned per location

## Known Limitations
- Overtime amber warning triggers after 35h but may be blocked by rest rule constraint first
- Real-time Socket.io may disconnect on Render free tier due to inactivity spin-down
- Render free tier spins down after inactivity — first request may take 50 seconds

## Running Locally
\`\`\`bash
git clone https://github.com/usiere/shiftsync
cd shiftsync
npm install
cd server && cp .env.example .env # add DATABASE_URL and JWT_SECRET
npx prisma@5 migrate deploy && npx prisma@5 db seed
npm run dev
\`\`\`