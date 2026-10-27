let token = sessionStorage.getItem('hris_token') || '';

export function setToken(t) {
  token = t || '';
  if (t) sessionStorage.setItem('hris_token', t);
  else sessionStorage.removeItem('hris_token');
}
export const hasToken = () => Boolean(token);

async function request(path, { method = 'GET', body, blob } = {}) {
  const res = await fetch('/api' + path, {
    method,
    headers: {
      ...(body ? { 'Content-Type': 'application/json' } : {}),
      ...(token ? { Authorization: 'Bearer ' + token } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    if (res.status === 401 && token) {
      setToken(''); // session expired or revoked: tell the app to show the login screen
      window.dispatchEvent(new Event('hris:unauthorized'));
    }
    const error = new Error(err.error || 'Request failed.');
    error.code = err.code;
    throw error;
  }
  if (res.status === 204) return null;
  return blob ? res.blob() : res.json();
}

const qs = (o) => new URLSearchParams(Object.entries(o).filter(([, v]) => v)).toString();

export const Auth = {
  login: (username, password) => request('/auth/login', { method: 'POST', body: { username, password } }),
  me: () => request('/auth/me'),
  logout: () => request('/auth/logout', { method: 'POST' }),
  changePassword: (currentPassword, newPassword) =>
    request('/auth/change-password', { method: 'POST', body: { currentPassword, newPassword } }),
};

export const Employees = {
  list: () => request('/employees'),
  create: (e) => request('/employees', { method: 'POST', body: e }),
  remove: (id) => request(`/employees/${id}`, { method: 'DELETE' }),
  resetPassword: (id, password) => request(`/employees/${id}/reset-password`, { method: 'POST', body: { password } }),
};

export const Attendance = {
  today: () => request('/attendance/today'),
  mine: () => request('/attendance/mine'),
  timeIn: () => request('/attendance/time-in', { method: 'POST' }),
  timeOut: () => request('/attendance/time-out', { method: 'POST' }),
  timesheet: (f) => request('/attendance/timesheet?' + qs(f)),
  save: (entry) => request('/attendance', { method: 'PUT', body: entry }),
  exportXlsx: (f) => request('/export/timesheet.xlsx?' + qs(f), { blob: true }),
};

export const Holidays = {
  list: () => request('/holidays'),
  create: (h) => request('/holidays', { method: 'POST', body: h }),
  remove: (date) => request(`/holidays/${date}`, { method: 'DELETE' }),
};

export const Settings = {
  get: () => request('/settings'),
  update: (s) => request('/settings', { method: 'PUT', body: s }),
};
