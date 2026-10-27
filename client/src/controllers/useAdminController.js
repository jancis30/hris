import { useCallback, useEffect, useState } from 'react';
import { Attendance, Employees, Holidays, Settings } from '../models/api.js';

const iso = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

export function useAdminController() {
  const [filters, setFilters] = useState({ from: iso(new Date(Date.now() - 13 * 864e5)), to: iso(new Date()), employeeId: '' });
  const [rows, setRows] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [holidays, setHolidays] = useState([]);
  const [settings, setSettings] = useState(null);
  const [message, setMessage] = useState(null);

  // Run an action and report success or failure (an expired session is handled by the auth controller).
  const guard = useCallback(async (fn, okText) => {
    try {
      const result = await fn();
      if (okText) setMessage({ ok: okText });
      return result;
    } catch (e) {
      setMessage({ error: e.message });
    }
  }, []);

  const loadTimesheet = useCallback(
    () => guard(async () => setRows(await Attendance.timesheet(filters))),
    [filters, guard]
  );
  const loadReference = useCallback(
    () =>
      guard(async () => {
        const [e, h, s] = await Promise.all([Employees.list(), Holidays.list(), Settings.get()]);
        setEmployees(e);
        setHolidays(h);
        setSettings(s);
      }),
    [guard]
  );

  useEffect(() => {
    loadTimesheet();
  }, [loadTimesheet]);
  useEffect(() => {
    loadReference();
  }, [loadReference]);

  const saveEntry = async (entry) => {
    if (await guard(() => Attendance.save(entry), 'Entry saved.')) loadTimesheet();
  };
  const addEmployee = async (e) => {
    if (await guard(() => Employees.create(e), 'Employee added.')) loadReference();
  };
  const resetPassword = async (id, password) => {
    await guard(() => Employees.resetPassword(id, password), 'Password reset. The employee must change it at next login.');
  };
  const removeEmployee = async (id) => {
    await guard(() => Employees.remove(id), 'Employee removed.');
    loadReference();
    loadTimesheet();
  };
  const addHoliday = async (h) => {
    if (await guard(() => Holidays.create(h), 'Holiday added.')) {
      loadReference();
      loadTimesheet();
    }
  };
  const removeHoliday = async (date) => {
    await guard(() => Holidays.remove(date), 'Holiday removed.');
    loadReference();
    loadTimesheet();
  };
  const saveSettings = async (s) => {
    if (await guard(() => Settings.update(s), 'Schedule saved.')) {
      loadReference();
      loadTimesheet();
    }
  };

  async function exportExcel() {
    const blob = await guard(() => Attendance.exportXlsx(filters));
    if (!blob) return;
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Timesheet_${filters.from}_to_${filters.to}.xlsx`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return {
    filters, setFilters, rows, employees, holidays, settings, message,
    saveEntry, addEmployee, resetPassword, removeEmployee, addHoliday, removeHoliday, saveSettings, exportExcel,
  };
}
