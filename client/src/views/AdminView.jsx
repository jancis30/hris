import { useEffect, useState } from 'react';
import { useAdminController } from '../controllers/useAdminController.js';
import Notice from './components/Notice.jsx';
import TimesheetTable from './components/TimesheetTable.jsx';

const today = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

function ManualEntry({ employees, onSave }) {
  const [f, setF] = useState({ employeeId: '', date: today(), timeIn: '', timeOut: '' });
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });
  const employeeId = f.employeeId || (employees[0] && employees[0].id) || '';
  return (
    <div className="card">
      <h3>Add or correct a time entry</h3>
      <div className="row">
        <label>Employee
          <select value={employeeId} onChange={set('employeeId')}>
            {employees.map((e) => <option key={e.id} value={e.id}>{e.name}</option>)}
          </select>
        </label>
        <label>Date<input type="date" value={f.date} onChange={set('date')} /></label>
        <label>Time in<input type="time" value={f.timeIn} onChange={set('timeIn')} /></label>
        <label>Time out<input type="time" value={f.timeOut} onChange={set('timeOut')} /></label>
        <button className="primary" onClick={() => onSave({ ...f, employeeId })}>Save entry</button>
      </div>
      <p className="mut small">Use this to fix a missing time out or record a missed day.</p>
    </div>
  );
}

function ScheduleForm({ settings, onSave }) {
  const [s, setS] = useState(settings);
  useEffect(() => setS(settings), [settings]);
  if (!s) return null;
  const set = (k) => (e) => setS({ ...s, [k]: e.target.value });
  return (
    <div className="card">
      <h3>Work schedule</h3>
      <div className="row">
        <label>Start<input type="time" value={s.shiftStart} onChange={set('shiftStart')} /></label>
        <label>End<input type="time" value={s.shiftEnd} onChange={set('shiftEnd')} /></label>
        <label>Grace (minutes)<input type="number" min="0" value={s.graceMinutes} onChange={set('graceMinutes')} className="short" /></label>
        <button onClick={() => onSave(s)}>Save schedule</button>
      </div>
    </div>
  );
}

function EmployeesPanel({ employees, currentUserId, onAdd, onReset, onRemove }) {
  const blank = { name: '', department: '', username: '', password: '', role: 'employee' };
  const [f, setF] = useState(blank);
  const [reset, setReset] = useState({ id: '', password: '' });
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });
  const resetId = reset.id || (employees[0] && employees[0].id) || '';
  return (
    <div className="card">
      <h3>Employees and logins</h3>
      <div className="row">
        <label>Name<input value={f.name} onChange={set('name')} /></label>
        <label>Department<input value={f.department} onChange={set('department')} /></label>
        <label>Username<input value={f.username} onChange={set('username')} autoComplete="off" /></label>
        <label>Temporary password<input value={f.password} onChange={set('password')} autoComplete="off" /></label>
        <label>Role
          <select value={f.role} onChange={set('role')}>
            <option value="employee">Employee</option>
            <option value="admin">Admin</option>
          </select>
        </label>
        <button className="primary" onClick={() => { onAdd(f); setF(blank); }}>Add employee</button>
      </div>
      <p className="mut small">The employee must replace the temporary password the first time they sign in.</p>
      <div className="row">
        <label>Reset password for
          <select value={resetId} onChange={(e) => setReset({ ...reset, id: e.target.value })}>
            {employees.map((e) => <option key={e.id} value={e.id}>{e.name} ({e.username})</option>)}
          </select>
        </label>
        <label>New temporary password
          <input value={reset.password} onChange={(e) => setReset({ ...reset, password: e.target.value })} autoComplete="off" />
        </label>
        <button onClick={() => { onReset(resetId, reset.password); setReset({ id: '', password: '' }); }}>Reset</button>
      </div>
      <div className="scroll">
        <table className="compact">
          <thead><tr><th>ID</th><th>Name</th><th>Username</th><th>Role</th><th>Department</th><th></th></tr></thead>
          <tbody>
            {employees.map((e) => (
              <tr key={e.id}>
                <td>{e.id}</td><td>{e.name}</td><td>{e.username}</td><td>{e.role}</td><td>{e.department}</td>
                <td>{e.id !== currentUserId && <button className="small" onClick={() => onRemove(e.id)}>Remove</button>}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function HolidaysPanel({ holidays, onAdd, onRemove }) {
  const [date, setDate] = useState('');
  const [name, setName] = useState('');
  return (
    <div className="card">
      <h3>Holidays</h3>
      <div className="row">
        <label>Date<input type="date" value={date} onChange={(e) => setDate(e.target.value)} /></label>
        <label>Name<input value={name} onChange={(e) => setName(e.target.value)} /></label>
        <button className="primary" onClick={() => { onAdd({ date, name }); setDate(''); setName(''); }}>Add holiday</button>
      </div>
      <div className="scroll">
        <table className="compact">
          <thead><tr><th>Date</th><th>Name</th><th></th></tr></thead>
          <tbody>
            {holidays.map((h) => (
              <tr key={h.date}>
                <td>{h.date}</td><td>{h.name}</td>
                <td><button className="small" onClick={() => onRemove(h.date)}>Remove</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default function AdminView({ user }) {
  const a = useAdminController();
  const tracked = a.employees.filter((e) => e.trackAttendance !== false);

  const setF = (k) => (e) => a.setFilters({ ...a.filters, [k]: e.target.value });
  return (
    <>
      <div className="card">
        <h3>Timesheet</h3>
        <div className="row">
          <label>Employee
            <select value={a.filters.employeeId} onChange={setF('employeeId')}>
              <option value="">All employees</option>
              {tracked.map((e) => <option key={e.id} value={e.id}>{e.name}</option>)}
            </select>
          </label>
          <label>From<input type="date" value={a.filters.from} onChange={setF('from')} /></label>
          <label>To<input type="date" value={a.filters.to} onChange={setF('to')} /></label>
          <button className="primary" onClick={a.exportExcel}>Export to Excel</button>
        </div>
        <Notice message={a.message} />
        <TimesheetTable rows={a.rows} showEmployee />
      </div>
      <div className="grid">
        <ManualEntry employees={tracked} onSave={a.saveEntry} />
        <ScheduleForm settings={a.settings} onSave={a.saveSettings} />
      </div>
      <div className="grid">
        <EmployeesPanel employees={a.employees} currentUserId={user.id} onAdd={a.addEmployee} onReset={a.resetPassword} onRemove={a.removeEmployee} />
        <HolidaysPanel holidays={a.holidays} onAdd={a.addHoliday} onRemove={a.removeHoliday} />
      </div>
    </>
  );
}
