import { lazy, Suspense, useState } from 'react';
import type { Page } from './types/navigation';
import Navbar from './components/Navbar';

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
  const [loggedIn, setLoggedIn] = useState(false);

  const navigate = (p: Page, id?: string) => {
  setPage(p);

  if (id !== undefined) {
    setSelectedId(id);
  }

  window.scrollTo({
    top: 0,
    behavior: 'instant',
  });
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
              setLoggedIn(true);
              navigate('home');
            }}
          />
        )}

        {page === 'register' && (
          <Register navigate={navigate} />
        )}

        {page === 'profile' && (
          <Profile navigate={navigate} />
        )}

        {page === 'admin' && (
          <Admin navigate={navigate} />
        )}
      </Suspense>
    </div>
  );
}