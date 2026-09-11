import {
  lazy,
  Suspense,
  useEffect,
  useState,
} from 'react';

import type { Page } from './types/navigation';
import Navbar from './components/Navbar';

import {
  getSession,
  clearSession,
  type User,
} from './lib/api';

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

        <p className="text-gray-500">
          Cargando...
        </p>
      </div>
    </div>
  );
}

/*
 * Convierte una URL en una página de la aplicación.
 *
 * Ejemplos:
 *
 * /                  -> home
 * /reportes          -> reports
 * /reporte/123       -> detail
 * /mapa              -> map
 * /crear-reporte     -> create
 */
function getPageFromPath(): {
  page: Page;
  id: string | null;
} {
  const path = window.location.pathname;

  if (path === '/') {
    return {
      page: 'home',
      id: null,
    };
  }

  if (path === '/reportes') {
    return {
      page: 'reports',
      id: null,
    };
  }

  if (path.startsWith('/reporte/')) {
    const id = decodeURIComponent(
      path.replace('/reporte/', '')
    );

    return {
      page: 'detail',
      id: id || null,
    };
  }

  if (path === '/mapa') {
    return {
      page: 'map',
      id: null,
    };
  }

  if (path === '/crear-reporte') {
    return {
      page: 'create',
      id: null,
    };
  }

  if (path === '/login') {
    return {
      page: 'login',
      id: null,
    };
  }

  if (path === '/registro') {
    return {
      page: 'register',
      id: null,
    };
  }

  if (path === '/perfil') {
    return {
      page: 'profile',
      id: null,
    };
  }

  if (path === '/admin') {
    return {
      page: 'admin',
      id: null,
    };
  }

  if (path.startsWith('/chat/')) {
    const id = decodeURIComponent(
      path.replace('/chat/', '')
    );

    return {
      page: 'chat',
      id: id || null,
    };
  }

  /*
   * Si alguien entra a una URL que no existe,
   * mostramos Home.
   */
  return {
    page: 'home',
    id: null,
  };
}

/*
 * Convierte una página de la aplicación en una URL.
 */
function getPathFromPage(
  page: Page,
  id?: string
): string {
  switch (page) {
    case 'home':
      return '/';

    case 'reports':
      return '/reportes';

    case 'detail':
      return id
        ? `/reporte/${encodeURIComponent(id)}`
        : '/reportes';

    case 'map':
      return '/mapa';

    case 'create':
      return '/crear-reporte';

    case 'login':
      return '/login';

    case 'register':
      return '/registro';

    case 'profile':
      return '/perfil';

    case 'admin':
      return '/admin';

    case 'chat':
      return id
        ? `/chat/${encodeURIComponent(id)}`
        : '/';

    default:
      return '/';
  }
}

export default function App() {
  /*
   * Al iniciar la aplicación leemos la URL actual.
   *
   * Esto permite entrar directamente a:
   *
   * patitastucuman.com/reportes
   * patitastucuman.com/mapa
   * patitastucuman.com/reporte/123
   */
  const initialRoute = getPageFromPath();

  const [page, setPage] = useState<Page>(
    initialRoute.page
  );

  const [selectedId, setSelectedId] =
    useState<string | null>(
      initialRoute.id
    );

  const [user, setUser] =
    useState<User | null>(
      () =>
        getSession()?.user ??
        null
    );

  const loggedIn = !!user;

  /*
   * Soporte para los botones atrás y adelante
   * del navegador.
   */
  useEffect(() => {
    const handlePopState = () => {
      const route =
        getPageFromPath();

      setPage(route.page);

      setSelectedId(
        route.id
      );

      setUser(
        getSession()?.user ??
          null
      );

      window.scrollTo({
        top: 0,
        behavior: 'instant',
      });
    };

    window.addEventListener(
      'popstate',
      handlePopState
    );

    return () => {
      window.removeEventListener(
        'popstate',
        handlePopState
      );
    };
  }, []);

  const navigate = (
    p: Page,
    id?: string
  ) => {
    const path =
      getPathFromPage(
        p,
        id
      );

    /*
     * Cambiamos la URL sin recargar la página.
     */
    if (
      window.location.pathname !==
      path
    ) {
      window.history.pushState(
        {},
        '',
        path
      );
    }

    setPage(p);

    setSelectedId(
      id ?? null
    );

    /*
     * Releemos la sesión por si Login o Register
     * acaban de guardar el usuario.
     */
    setUser(
      getSession()?.user ??
        null
    );

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

  const hideNav =
    page === 'login' ||
    page === 'register';

  return (
    <div className="min-h-full font-sans text-dark bg-cream">
      {!hideNav && (
        <Navbar
          page={page}
          navigate={navigate}
          loggedIn={loggedIn}
        />
      )}

      <Suspense
        fallback={<PageLoader />}
      >
        {page === 'home' && (
          <Home
            navigate={navigate}
          />
        )}

        {page === 'reports' && (
          <Reports
            navigate={navigate}
          />
        )}

        {page === 'detail' && (
          <ReportDetail
            id={selectedId}
            navigate={navigate}
          />
        )}

        {page === 'map' && (
          <MapPage
            navigate={navigate}
          />
        )}

        {page === 'create' && (
          <CreateReport
            navigate={navigate}
          />
        )}

        {page === 'login' && (
          <Login
            navigate={navigate}
            onLogin={() => {
              setUser(
                getSession()?.user ??
                  null
              );

              navigate('home');
            }}
          />
        )}

        {page === 'register' && (
          <Register
            navigate={navigate}
          />
        )}

        {page === 'profile' && (
          <Profile
            navigate={navigate}
            user={user}
            onLogout={
              handleLogout
            }
          />
        )}

        {page === 'admin' && (
          <Admin
            navigate={navigate}
          />
        )}

        {page === 'chat' &&
          selectedId &&
          user && (
            <Chat
              navigate={navigate}
              conversationId={
                selectedId
              }
              currentUserId={
                user.id
              }
            />
          )}
      </Suspense>
    </div>
  );
}