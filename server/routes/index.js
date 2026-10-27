const express = require('express');
const { requireSession, requireAuth, requireAdmin } = require('../middleware/auth');
const auth = require('../controllers/authController');
const employees = require('../controllers/employeeController');
const attendance = require('../controllers/attendanceController');
const holidays = require('../controllers/holidayController');
const settings = require('../controllers/settingsController');
const exporter = require('../controllers/exportController');

const router = express.Router();

// sign in / account (change-password works while a temporary password is still active)
router.post('/auth/login', auth.login);
router.get('/auth/me', requireSession, auth.me);
router.post('/auth/logout', requireSession, auth.logout);
router.post('/auth/change-password', requireSession, auth.changePassword);

// any signed-in user (acts on their own record)
router.get('/attendance/today', requireAuth, attendance.today);
router.get('/attendance/mine', requireAuth, attendance.mine);
router.post('/attendance/time-in', requireAuth, attendance.timeIn);
router.post('/attendance/time-out', requireAuth, attendance.timeOut);
router.get('/holidays', requireAuth, holidays.list);
router.get('/settings', requireAuth, settings.get);

// admin only
router.get('/employees', requireAdmin, employees.list);
router.post('/employees', requireAdmin, employees.create);
router.post('/employees/:id/reset-password', requireAdmin, employees.resetPassword);
router.delete('/employees/:id', requireAdmin, employees.remove);
router.get('/attendance/timesheet', requireAdmin, attendance.timesheet);
router.put('/attendance', requireAdmin, attendance.upsert);
router.get('/export/timesheet.xlsx', requireAdmin, exporter.xlsx);
router.post('/holidays', requireAdmin, holidays.create);
router.delete('/holidays/:date', requireAdmin, holidays.remove);
router.put('/settings', requireAdmin, settings.update);

module.exports = router;
