# Attendance App - Server

Express + MongoDB backend with Supabase Storage (photos) and Brevo (email).

## Setup
1. `npm install`
2. Copy `.env.example` to `.env` and fill in MongoDB URI, JWT secret, Supabase keys, Brevo key
3. Create a Supabase Storage bucket matching `SUPABASE_BUCKET` (default: `attendance-photos`) with public read access
4. Create your first admin manually (insert into MongoDB directly, or write a one-off seed script using `employee.service.js`'s `createEmployee` with `role: 'admin'`) - there is no public signup route by design
5. `npm run dev`

## Structure
Feature-based modules under `src/modules/` - each folder (auth, employee, office, attendance) is self-contained with its own model/controller/service/routes.

## Key endpoints
- `POST /api/auth/login`
- `POST /api/attendance/punch` - self punch, multipart (photo + lat/lng), auto in/out
- `POST /api/attendance/admin-punch` - admin only, punch for any employee, no photo/location
- `GET /api/attendance/summary?date=YYYY-MM-DD` - admin daily view (first-in/last-out, aggregated live)
- `GET /api/employees`, `POST /api/employees`, etc. - admin only

## Notes
- No geofence enforcement: `distanceFromOffice` is calculated and stored for reference only.
- No offline queueing - punches must reach the server in real time.
