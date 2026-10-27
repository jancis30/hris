import { useState } from 'react';
import Notice from './components/Notice.jsx';

export default function ChangePasswordView({ forced, message, onSubmit, onLogout }) {
  const [current, setCurrent] = useState('');
  const [next, setNext] = useState('');
  const [confirm, setConfirm] = useState('');
  const [localError, setLocalError] = useState(null);

  const submit = async (e) => {
    e.preventDefault();
    if (next !== confirm) return setLocalError({ error: 'New passwords do not match.' });
    setLocalError(null);
    if (await onSubmit(current, next)) {
      setCurrent(''); setNext(''); setConfirm('');
    }
  };

  return (
    <form className="card narrow" onSubmit={submit}>
      <h3>{forced ? 'Set a new password' : 'Change password'}</h3>
      {forced && <p className="mut">You are using a temporary password. Please choose your own to continue.</p>}
      <div className="stack">
        <label>Current password
          <input type="password" value={current} onChange={(e) => setCurrent(e.target.value)} autoComplete="current-password" />
        </label>
        <label>New password
          <input type="password" value={next} onChange={(e) => setNext(e.target.value)} autoComplete="new-password" />
        </label>
        <label>Confirm new password
          <input type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)} autoComplete="new-password" />
        </label>
        <button className="primary" type="submit">Save password</button>
        {forced && <button type="button" onClick={onLogout}>Sign out</button>}
      </div>
      <Notice message={localError || message} />
      <p className="mut small">At least 8 characters, with a letter and a number.</p>
    </form>
  );
}
