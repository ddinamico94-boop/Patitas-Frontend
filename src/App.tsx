import { lazy, Suspense, useState } from 'react';
import type { Page } from './types/navigation';
import Navbar from './components/Navbar';
import { getSession, clearSession, type User } from './lib/api';

const Home = lazy(() => import('./pages/Home'));
const Reports = lazy(() => import('./pages/Reports'));
const ReportDetail = lazy(() => import('./pages/ReportDetail'));
const MapPage = lazy(() => import('./pages/MapPage'));
const CreateReport = lazy(() => import('./pages/CreateReport'));
const Login = lazy(() => import('./pages/Login'));
const Register = lazy(() => import('./pages/Register'));
const Profile = lazy(() => import('./pages/Profile'));
const Admin = lazy(() => import('./pages/Admin'));
const Chat = lazy(() => import('./pages/Chat'));

function PageLoader() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-cream">
      <div className="text-center">
        <div className="text-4xl mb-3">🐾</div>
        <p className="text-gray-500">Cargando...</p>
      </div>
    </div>
  );
}

export default function App() {
  const [page, setPage] = useState<Page>('home');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  // El usuario arranca leyendo lo que haya guardado en localStorage (si ya inició sesión antes)
  const [user, setUser] = useState<User | null>(() => getSession()?.user ?? null);

  const loggedIn = !!user;

  const navigate = (p: Page, id?: string) => {
    setPage(p);

    if (id !== undefined) {
      setSelectedId(id);
    }

    // Cada vez que navegamos, releemos la sesión. Esto cubre el caso de
    // Register/Login, que guardan la sesión en localStorage y después navegan:
    // así App se entera del usuario recién logueado sin lógica extra.
    setUser(getSession()?.user ?? null);

    window.scrollTo({
      top: 0,
      behavior: 'instant',
    });
  };

  const handleLogout = () => {
    clearSession();
    setUser(null);
    navigate('home');
  };

  const hideNav = page === 'login' || page === 'register';

  return (
    <div className="min-h-full font-sans text-dark bg-cream">
      {!hideNav && (
        <Navbar
          page={page}
          navigate={navigate}
          loggedIn={loggedIn}
        />
      )}

      <Suspense fallback={<PageLoader />}>
        {page === 'home' && <Home navigate={navigate} />}

        {page === 'reports' && (
          <Reports navigate={navigate} />
        )}

        {page === 'detail' && (
          <ReportDetail
            id={selectedId}
            navigate={navigate}
          />
        )}

        {page === 'map' && (
          <MapPage navigate={navigate} />
        )}

        {page === 'create' && (
          <CreateReport navigate={navigate} />
        )}

        {page === 'login' && (
          <Login
            navigate={navigate}
            onLogin={() => {
              setUser(getSession()?.user ?? null);
              navigate('home');
            }}
          />
        )}

        {page === 'register' && (
          <Register navigate={navigate} />
        )}

        {page === 'profile' && (
          <Profile
            navigate={navigate}
            user={user}
            onLogout={handleLogout}
          />
        )}

        {page === 'admin' && (
          <Admin navigate={navigate} />
        )}
      </Suspense>
    </div>
  );
}