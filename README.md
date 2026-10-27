# HRIS Timekeeping (Node + React + JSON, MVC)

Time in / time out with automatic remarks (Late, Absent, No Time Out, Holiday) and an admin Excel export.

## Run it
```
npm install              # installs concurrently
npm run install:all      # installs server + client
npm run dev              # API on :4000, React on http://localhost:5173
```
Production: `npm run build` then `npm start` (Express serves the built React app on :4000).

## Accounts and passwords
On first start the server creates logins automatically:
- Admin: username `admin`, password `admin123` (or `ADMIN_PASSWORD=...` before the first start).
- Seeded employees: username `e001`, `e002`, `e003`, password `welcome123`.

Every account created or reset by the admin has a temporary password, and the user is forced to choose their own at first login (at least 8 characters, with a letter and a number). Users can change it any time from the "Password" tab. Passwords are stored as salted scrypt hashes, never in plain text. After 5 failed logins an account/IP is locked for 15 minutes.
Admins add employees (with username, temporary password and role) and can reset passwords from the Admin tab.
Change the default admin password right after first login.

Timezone defaults to `Asia/Manila`. Override with `TZ=...`.

## MVC layout
```
server/
  models/        Employee, Attendance, Holiday, Settings  -> read/write data/db.json
  controllers/   request handling (auth, employee, attendance, holiday, settings, export)
  routes/        URL -> controller map, admin routes guarded by middleware/auth.js
  services/      timesheetService.js: the remark rules (late, absent, no time out, holiday)
  config/db.js   JSON file storage (atomic writes)
  data/db.json   the database
client/src/
  models/        api.js, all fetch calls
  controllers/   React hooks that hold state and actions
  views/         React components (EmployeeView, AdminView, ...)
```

## Remark rules (server/services/timesheetService.js)
- Holiday: date is in the holiday list (never counted Late or Absent).
- Late: time in is later than shift start plus grace minutes.
- No Time Out: past day with a time in but no time out.
- Absent: past weekday since the employee's start date with no time in.
- Weekends are skipped unless someone worked.

## API
Public: POST /api/auth/login.
Signed in (Bearer token): GET /api/auth/me, POST /api/auth/logout, POST /api/auth/change-password (works with a temporary password), then, after the password is changed: GET /api/attendance/today, GET /api/attendance/mine, POST /api/attendance/time-in, POST /api/attendance/time-out, GET /api/holidays, GET /api/settings.
Admin only: GET/POST /api/employees, POST /api/employees/:id/reset-password, DELETE /api/employees/:id, GET /api/attendance/timesheet, PUT /api/attendance, GET /api/export/timesheet.xlsx, POST/DELETE /api/holidays, PUT /api/settings.

## Notes
- Time in/out uses the server clock, so employees can't change their own times.
- The JSON file suits small teams on one server. Back up server/data/db.json.
- Sessions are kept in server memory, so everyone signs in again after a server restart.
- Use HTTPS when you deploy, so passwords are not sent in the clear.
