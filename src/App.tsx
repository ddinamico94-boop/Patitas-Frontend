import { useState, useEffect } from 'react';
import { Page } from './data/mock';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Reports from './pages/Reports';
import ReportDetail from './pages/ReportDetail';
import MapPage from './pages/MapPage';
import CreateReport from './pages/CreateReport';
import Login from './pages/Login';
import Register from './pages/Register';
import Profile from './pages/Profile';
import Admin from './pages/Admin';
import { getSession, clearSession, User } from './lib/api';

export default function App() {
  const [page, setPage] = useState<Page>('home');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const session = getSession();
    if (session) setUser(session.user);
  }, []);

  const navigate = (p: Page, id?: string) => {
    setPage(p);
    if (id !== undefined) setSelectedId(id);
    window.scrollTo({ top: 0, behavior: 'instant' });
  };

  const handleLogin = () => {
    const session = getSession();
    if (session) setUser(session.user);
    navigate('home');
  };

  const handleLogout = () => {
    clearSession();
    setUser(null);
    navigate('home');
  };

  const loggedIn = !!user;
  const hideNav = page === 'login' || page === 'register';

  return (
    <div className="min-h-full font-sans text-dark bg-cream">
      {!hideNav && <Navbar page={page} navigate={navigate} loggedIn={loggedIn} />}

      {page === 'home' && <Home navigate={navigate} />}
      {page === 'reports' && <Reports navigate={navigate} />}
      {page === 'detail' && <ReportDetail id={selectedId} navigate={navigate} />}
      {page === 'map' && <MapPage navigate={navigate} />}
      {page === 'create' && <CreateReport navigate={navigate} />}
      {page === 'login' && (
        <Login navigate={navigate} onLogin={handleLogin} />
      )}
      {page === 'register' && <Register navigate={navigate} />}
      {page === 'profile' && (
        <Profile navigate={navigate} user={user} onLogout={handleLogout} />
      )}
      {page === 'admin' && <Admin navigate={navigate} />}
    </div>
  );
}