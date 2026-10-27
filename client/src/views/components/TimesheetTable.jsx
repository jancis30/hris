export function Remarks({ remarks }) {
  if (!remarks.length) return <span className="mut">-</span>;
  return remarks.map((r) => (
    <span key={r.type} className={`badge ${r.type}`}>
      {r.label}
    </span>
  ));
}

export default function TimesheetTable({ rows, showEmployee }) {
  return (
    <div className="scroll">
      <table>
        <thead>
          <tr>
            {showEmployee && <th>ID</th>}
            {showEmployee && <th>Employee</th>}
            <th>Date</th><th>Day</th><th>Time In</th><th>Time Out</th><th>Hours</th><th>Remarks</th>
          </tr>
        </thead>
        <tbody>
          {rows.length === 0 && (
            <tr><td colSpan={8} className="mut">No records in this range.</td></tr>
          )}
          {rows.map((r) => (
            <tr key={r.employeeId + r.date}>
              {showEmployee && <td>{r.employeeId}</td>}
              {showEmployee && <td>{r.employeeName}</td>}
              <td>{r.date}</td>
              <td>{r.day}</td>
              <td>{r.timeIn || '-'}</td>
              <td>{r.timeOut || '-'}</td>
              <td>{r.hours ?? '-'}</td>
              <td><Remarks remarks={r.remarks} /></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
