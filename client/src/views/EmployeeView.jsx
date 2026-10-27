import { useEmployeeController } from '../controllers/useEmployeeController.js';
import Clock from './components/Clock.jsx';
import Notice from './components/Notice.jsx';
import TimesheetTable from './components/TimesheetTable.jsx';

export default function EmployeeView({ user }) {
  const tracked = user.trackAttendance !== false;
  const c = useEmployeeController(tracked);
  const log = c.today && c.today.log;

  return (
    <>
      <div className="card">
        <p className="center-text"><strong>{user.name}</strong> <span className="mut">({user.id})</span></p>
        <Clock />
        {c.today && c.today.holiday && (
          <div className="stat"><span className="badge HOLIDAY">Holiday: {c.today.holiday}</span></div>
        )}
        {tracked ? (
          <>
            <div className="big">
              <button className="primary" disabled={c.busy} onClick={() => c.punch('in')}>Time in</button>
              <button disabled={c.busy} onClick={() => c.punch('out')}>Time out</button>
            </div>
            <div className="stat">
              {log ? `Today: in ${log.timeIn || '-'}, out ${log.timeOut || '-'}` : 'No time in yet today'}
              {c.today && ` (shift ${c.today.settings.shiftStart}-${c.today.settings.shiftEnd})`}
            </div>
          </>
        ) : (
          <p className="stat">This account does not track attendance.</p>
        )}
        <Notice message={c.message} />
      </div>
      {tracked && (
        <div className="card">
          <h3>My attendance, last 14 days</h3>
          <TimesheetTable rows={c.rows} showEmployee={false} />
        </div>
      )}
    </>
  );
}
