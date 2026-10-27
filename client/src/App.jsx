import { useState } from 'react';
import { useAuthController } from './controllers/useAuthController.js';
import LoginView from './views/LoginView.jsx';
import ChangePasswordView from './views/ChangePasswordView.jsx';
import EmployeeView from './views/EmployeeView.jsx';
import AdminView from './views/AdminView.jsx';

export default function App() {
  const auth = useAuthController();
  const [tab, setTab] = useState('time');
  const { user } = auth;

  const go = (t) => {
    auth.setMessage(null);
    setTab(t);
  };

  let body;
  if (auth.loading) body = <p className="mut">Loading...</p>;
  else if (!user) body = <LoginView onLogin={auth.login} message={auth.message} />;
  else if (user.mustChangePassword)
    body = <ChangePasswordView forced message={auth.message} onSubmit={auth.changePassword} onLogout={auth.logout} />;
  else if (tab === 'admin' && user.role === 'admin') body = <AdminView user={user} />;
  else if (tab === 'account') body = <ChangePasswordView message={auth.message} onSubmit={auth.changePassword} />;
  else body = <EmployeeView user={user} />;

  const showNav = user && !user.mustChangePassword;
  return (
    <div className="wrap">
      <header>
        <h1>HRIS Timekeeping</h1>
        {showNav && (
          <nav className="tabs">
            <button className={tab === 'time' ? 'on' : ''} onClick={() => go('time')}>My time</button>
            {user.role === 'admin' && (
              <button className={tab === 'admin' ? 'on' : ''} onClick={() => go('admin')}>Admin</button>
            )}
            <button className={tab === 'account' ? 'on' : ''} onClick={() => go('account')}>Password</button>
            <button onClick={auth.logout}>Sign out</button>
          </nav>
        )}
      </header>
      {body}
    </div>
  );
}
