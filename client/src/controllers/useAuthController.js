import { useEffect, useState } from 'react';
import { Auth, hasToken, setToken } from '../models/api.js';

export function useAuthController() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(hasToken());
  const [message, setMessage] = useState(null);

  // Restore the session after a page refresh.
  useEffect(() => {
    if (!hasToken()) return;
    Auth.me()
      .then(setUser)
      .catch(() => setToken(''))
      .finally(() => setLoading(false));
  }, []);

  // Any API call that comes back 401 sends the user to the login screen.
  useEffect(() => {
    const onExpired = () => {
      setUser(null);
      setMessage({ error: 'Your session ended. Please sign in again.' });
    };
    window.addEventListener('hris:unauthorized', onExpired);
    return () => window.removeEventListener('hris:unauthorized', onExpired);
  }, []);

  async function login(username, password) {
    try {
      const res = await Auth.login(username, password);
      setToken(res.token);
      setUser(res.user);
      setMessage(null);
    } catch (e) {
      setMessage({ error: e.message });
    }
  }

  async function logout() {
    try { await Auth.logout(); } catch (e) { /* already signed out */ }
    setToken('');
    setUser(null);
    setMessage(null);
  }

  async function changePassword(currentPassword, newPassword) {
    try {
      const res = await Auth.changePassword(currentPassword, newPassword);
      setUser(res.user);
      setMessage({ ok: 'Password changed.' });
      return true;
    } catch (e) {
      setMessage({ error: e.message });
      return false;
    }
  }

  return { user, loading, message, setMessage, login, logout, changePassword };
}
