const timesheet = require('../services/timesheetService');
const { parseRange } = require('./attendanceController');

const HEAD = ['Employee ID', 'Employee', 'Department', 'Date', 'Day', 'Time In', 'Time Out', 'Hours', 'Remarks'];
const SUMMARY_HEAD = ['Employee ID', 'Employee', 'Days Present', 'Late', 'Absent', 'No Time Out', 'Holidays', 'Total Hours'];

exports.xlsx = async (req, res, next) => {
  try {
    const ExcelJS = require('exceljs'); // loaded on demand
    const range = parseRange(req.query);
    const rows = timesheet.build(range);

    const wb = new ExcelJS.Workbook();
    const ws = wb.addWorksheet('Timesheet', { views: [{ state: 'frozen', ySplit: 1 }] });
    ws.addRow(HEAD);
    rows.forEach((r) =>
      ws.addRow([r.employeeId, r.employeeName, r.department, r.date, r.day, r.timeIn, r.timeOut, r.hours ?? '', r.remarks.map((x) => x.label).join(', ')])
    );
    [12, 24, 18, 12, 6, 10, 10, 8, 36].forEach((w, i) => (ws.getColumn(i + 1).width = w));

    const ss = wb.addWorksheet('Summary', { views: [{ state: 'frozen', ySplit: 1 }] });
    ss.addRow(SUMMARY_HEAD);
    timesheet.summarize(rows).forEach((s) =>
      ss.addRow([s.employeeId, s.employeeName, s.present, s.late, s.absent, s.noTimeOut, s.holidays, s.hours])
    );
    [12, 24, 13, 8, 8, 13, 10, 12].forEach((w, i) => (ss.getColumn(i + 1).width = w));

    [ws, ss].forEach((sheet) => {
      sheet.getRow(1).font = { bold: true };
      sheet.getRow(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFDDE8FF' } };
    });

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename="Timesheet_${range.from}_to_${range.to}.xlsx"`);
    await wb.xlsx.write(res);
    res.end();
  } catch (err) {
    next(err);
  }
};
