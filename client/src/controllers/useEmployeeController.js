import { useCallback, useEffect, useState } from 'react';
import { Attendance } from '../models/api.js';

export function useEmployeeController(enabled) {
  const [today, setToday] = useState(null);
  const [rows, setRows] = useState([]);
  const [message, setMessage] = useState(null);
  const [busy, setBusy] = useState(false);

  const refresh = useCallback(async () => {
    try {
      const [t, r] = await Promise.all([Attendance.today(), enabled ? Attendance.mine() : []]);
      setToday(t);
      setRows([...r].reverse());
    } catch (e) {
      setMessage({ error: e.message });
    }
  }, [enabled]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  async function punch(kind) {
    setBusy(true);
    try {
      const log = kind === 'in' ? await Attendance.timeIn() : await Attendance.timeOut();
      setMessage({ ok: kind === 'in' ? `Timed in at ${log.timeIn}` : `Timed out at ${log.timeOut}` });
      await refresh();
    } catch (e) {
      setMessage({ error: e.message });
    } finally {
      setBusy(false);
    }
  }

  return { today, rows, message, busy, punch };
}
