# Attendance App - Client

React + Vite + Tailwind frontend for the smart attendance app.

## Setup
1. `npm install`
2. Copy `.env.example` to `.env` and set `VITE_API_URL` to your backend's URL
3. `npm run dev`

## Structure
- `pages/auth` - Login
- `pages/admin` - Admin dashboard shell, attendance reports (first-in/last-out), employee management
- `pages/user` - Employee dashboard with punch button
- `components/user` - CameraCapture (getUserMedia photo capture), LocationStatus, PunchButton
- `components/admin` - AttendanceTable (flags Admin Entry vs Self Punch), AdminPunchModal, EmployeeCard
- `components/common` - Button, Modal, Table, Loader (shared UI primitives)
- `services` - one file per API resource, all requests go through `services/api.js` (axios instance with JWT interceptor)
- `hooks` - useAuth, useGeolocation
- `context/AuthContext.jsx` - auth state, persisted to localStorage
- `routes` - ProtectedRoute (role-gated), AppRoutes

## Notes
- Camera access requires HTTPS in production (or localhost in dev) - browsers block getUserMedia on plain HTTP.
- No geofence enforcement and no offline queue, per your requirements - punches are logged with location/photo but never blocked.
