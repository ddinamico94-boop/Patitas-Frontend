import {
  lazy,
  Suspense,
  useEffect,
  useState,
} from 'react'

import type { Page } from './types/navigation'
import Navbar from './components/Navbar'
import DonationWidget from './components/DonationWidget'

import {
  getSession,
  clearSession,
  type User,
} from './lib/api'

const Home = lazy(() => import('./pages/Home'))
const Reports = lazy(() => import('./pages/Reports'))
const Adoptar = lazy(() => import('./pages/Adoptar'))
const ReportDetail = lazy(() => import('./pages/ReportDetail'))
const MapPage = lazy(() => import('./pages/MapPage'))
const CreateReport = lazy(() => import('./pages/CreateReport'))
const Login = lazy(() => import('./pages/Login'))
const Register = lazy(() => import('./pages/Register'))
const Profile = lazy(() => import('./pages/Profile'))
const Admin = lazy(() => import('./pages/Admin'))
const Chat = lazy(() => import('./pages/Chat'))
const MaltratoAnimal = lazy(() => import('./pages/MaltratoAnimal'))
const AdminOrganismos = lazy(() => import('./pages/AdminOrganismos'))

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
  )
}

/*
 * Convierte una URL en una página de la aplicación.
 */
function getPageFromPath(): {
  page: Page
  id: string | null
} {
  const path = window.location.pathname

  if (path === '/') {
    return {
      page: 'home',
      id: null,
    }
  }

  if (path === '/reportes') {
    return {
      page: 'reports',
      id: null,
    }
  }

  if (path === '/adoptar') {
    return {
      page: 'adoptar',
      id: null,
    }
  }

  if (path.startsWith('/reporte/')) {
    const id = decodeURIComponent(
      path.replace('/reporte/', '')
    )

    return {
      page: 'detail',
      id: id || null,
    }
  }

  if (path === '/mapa') {
    return {
      page: 'map',
      id: null,
    }
  }

  if (path === '/crear-reporte') {
    return {
      page: 'create',
      id: null,
    }
  }

  if (path === '/login') {
    return {
      page: 'login',
      id: null,
    }
  }

  if (path === '/registro') {
    return {
      page: 'register',
      id: null,
    }
  }

  if (path === '/perfil') {
    return {
      page: 'profile',
      id: null,
    }
  }

  if (path === '/admin') {
    return {
      page: 'admin',
      id: null,
    }
  }

  if (path === '/admin/organismos') {
    return {
      page: 'admin-organismos',
      id: null,
    }
  }

  if (path === '/maltrato-animal') {
    return {
      page: 'maltrato',
      id: null,
    }
  }

  if (path.startsWith('/chat/')) {
    const id = decodeURIComponent(
      path.replace('/chat/', '')
    )

    return {
      page: 'chat',
      id: id || null,
    }
  }

  return {
    page: 'home',
    id: null,
  }
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
      return '/'

    case 'reports':
      return '/reportes'

    case 'adoptar':
      return '/adoptar'

    case 'detail':
      return id
        ? `/reporte/${encodeURIComponent(id)}`
        : '/reportes'

    case 'map':
      return '/mapa'

    case 'create':
      return '/crear-reporte'

    case 'login':
      return '/login'

    case 'register':
      return '/registro'

    case 'profile':
      return '/perfil'

    case 'admin':
      return '/admin'

    case 'admin-organismos':
      return '/admin/organismos'

    case 'maltrato':
      return '/maltrato-animal'

    case 'chat':
      return id
        ? `/chat/${encodeURIComponent(id)}`
        : '/'

    default:
      return '/'
  }
}

export default function App() {
  const initialRoute = getPageFromPath()

  const [page, setPage] = useState<Page>(
    initialRoute.page
  )

  const [selectedId, setSelectedId] =
    useState<string | null>(
      initialRoute.id
    )

  const [user, setUser] =
    useState<User | null>(
      () =>
        getSession()?.user ??
        null
    )

  /*
   * Lo activa CreateReport cuando muestra el cartel
   * "Para reportar un animal necesitás una cuenta".
   */
  const [authModalOpen, setAuthModalOpen] =
    useState(false)

  const loggedIn = !!user

  /*
   * Soporte para los botones atrás y adelante
   * del navegador.
   */
  useEffect(() => {
    const handlePopState = () => {
      const route =
        getPageFromPath()

      setPage(route.page)

      setSelectedId(
        route.id
      )

      setUser(
        getSession()?.user ??
          null
      )

      window.scrollTo({
        top: 0,
        behavior: 'instant',
      })
    }

    window.addEventListener(
      'popstate',
      handlePopState
    )

    return () => {
      window.removeEventListener(
        'popstate',
        handlePopState
      )
    }
  }, [])

  const navigate = (
    p: Page,
    id?: string
  ) => {
    const path =
      getPathFromPage(
        p,
        id
      )

    if (
      window.location.pathname !==
      path
    ) {
      window.history.pushState(
        {},
        '',
        path
      )
    }

    setPage(p)

    setSelectedId(
      id ?? null
    )

    /*
     * Releemos la sesión por si Login o Register
     * acaban de guardar el usuario.
     */
    setUser(
      getSession()?.user ??
        null
    )

    window.scrollTo({
      top: 0,
      behavior: 'instant',
    })
  }

  const handleLogout = () => {
    clearSession()

    setUser(null)

    navigate('home')
  }

  const hideNav =
    page === 'login' ||
    page === 'register'

  const showAuthBackground =
    page === 'create' && authModalOpen

  const showDonationWidget =
    page !== 'map' && !showAuthBackground

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
        {/*
         * Fondo del cartel de "necesitás una cuenta":
         * la página de inicio, sin interacción.
         * El desenfoque lo aplica el cartel.
         */}
        {showAuthBackground && (
          <div
            aria-hidden="true"
            className="pointer-events-none select-none"
          >
            <Home navigate={navigate} />
          </div>
        )}

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

        {page === 'adoptar' && (
          <Adoptar
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
            onAuthModalChange={
              setAuthModalOpen
            }
          />
        )}

        {page === 'login' && (
          <Login
            navigate={navigate}
            onLogin={() => {
              setUser(
                getSession()?.user ??
                  null
              )

              /*
               * Si el usuario llegó al login porque
               * quería reportar un animal, después
               * de autenticarse vuelve directamente
               * al formulario.
               */
              const returnAfterAuth =
                sessionStorage.getItem(
                  'patitas_return_after_auth'
                )

              if (
                returnAfterAuth === 'create'
              ) {
                sessionStorage.removeItem(
                  'patitas_return_after_auth'
                )

                navigate('create')
                return
              }

              navigate('home')
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

        {page === 'admin-organismos' && (
          <AdminOrganismos
            navigate={navigate}
          />
        )}

        {page === 'maltrato' && (
          <MaltratoAnimal
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

      {showDonationWidget && (
        <DonationWidget />
      )}
    </div>
  )
}