import { useState } from 'react';
import Notice from './components/Notice.jsx';

export default function LoginView({ onLogin, message }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const submit = (e) => {
    e.preventDefault();
    onLogin(username, password);
  };
  return (
    <form className="card narrow" onSubmit={submit}>
      <h3>Sign in</h3>
      <div className="stack">
        <label>Username
          <input value={username} onChange={(e) => setUsername(e.target.value)} autoComplete="username" autoFocus />
        </label>
        <label>Password
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="current-password" />
        </label>
        <button className="primary" type="submit">Sign in</button>
      </div>
      <Notice message={message} />
      <p className="mut small">Your username and temporary password are given to you by your administrator.</p>
    </form>
  );
}
