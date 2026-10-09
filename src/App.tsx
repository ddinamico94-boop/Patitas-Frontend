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
        <p className="text-gray-500">Cargando...</p>
      </div>
    </div>
  )
}

function getPageFromPath(): {
  page: Page
  id: string | null
} {
  const path = window.location.pathname

  if (path === '/') {
    return { page: 'home', id: null }
  }

  if (path === '/reportes') {
    return { page: 'reports', id: null }
  }

  if (path === '/adoptar') {
    return { page: 'adoptar', id: null }
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
    return { page: 'map', id: null }
  }

  if (path === '/crear-reporte') {
    return { page: 'create', id: null }
  }

  if (path === '/login') {
    return { page: 'login', id: null }
  }

  if (path === '/registro') {
    return { page: 'register', id: null }
  }

  if (path === '/perfil') {
    return { page: 'profile', id: null }
  }

  if (path === '/admin') {
    return { page: 'admin', id: null }
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
      if (id) {
        return '/reporte/' + encodeURIComponent(id)
      }

      return '/reportes'

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
      if (id) {
        return '/chat/' + encodeURIComponent(id)
      }

      return '/'

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
    useState<string | null>(initialRoute.id)

  const [user, setUser] =
    useState<User | null>(
      () => getSession()?.user ?? null
    )

  const [authModalOpen, setAuthModalOpen] =
    useState(false)

  const loggedIn = !!user

  const navigate = (
    nextPage: Page,
    id?: string
  ) => {
    const path = getPathFromPage(
      nextPage,
      id
    )

    if (
      window.location.pathname !== path
    ) {
      window.history.pushState(
        {},
        '',
        path
      )
    }

    setPage(nextPage)
    setSelectedId(id ?? null)
    setUser(getSession()?.user ?? null)

    window.scrollTo({
      top: 0,
      behavior: 'instant',
    })
  }

  useEffect(() => {
    if (
      page !== 'admin' &&
      page !== 'admin-organismos'
    ) {
      return
    }

    const session = getSession()

    if (!session) {
      sessionStorage.setItem(
        'patitas_return_after_auth',
        page
      )

      navigate('login')
      return
    }

    if (session.user.role !== 'ADMIN') {
      navigate('home')
    }
  }, [page])

  useEffect(() => {
    const handlePopState = () => {
      const route = getPageFromPath()

      setPage(route.page)
      setSelectedId(route.id)
      setUser(getSession()?.user ?? null)

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

  const handleLogout = () => {
    clearSession()
    setUser(null)
    navigate('home')
  }

  const hideNav =
    page === 'login' ||
    page === 'register' ||
    page === 'admin' ||
    page === 'admin-organismos'

  const showAuthBackground =
    page === 'create' &&
    authModalOpen

  const showDonationWidget =
    page !== 'map' &&
    !showAuthBackground &&
    page !== 'admin' &&
    page !== 'admin-organismos'

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
        {showAuthBackground && (
          <div
            aria-hidden="true"
            className="pointer-events-none select-none"
          >
            <Home navigate={navigate} disableSEO/>
          </div>
        )}

        {page === 'home' && (
          <Home navigate={navigate} />
        )}

        {page === 'reports' && (
          <Reports navigate={navigate} />
        )}

        {page === 'adoptar' && (
          <Adoptar navigate={navigate} />
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
              const session = getSession()

              const loggedUser =
                session?.user ?? null

              setUser(loggedUser)

              const returnAfterAuth =
                sessionStorage.getItem(
                  'patitas_return_after_auth'
                )

              if (
                returnAfterAuth ===
                'create'
              ) {
                sessionStorage.removeItem(
                  'patitas_return_after_auth'
                )

                navigate('create')
                return
              }

              if (
                returnAfterAuth ===
                  'admin' ||
                returnAfterAuth ===
                  'admin-organismos'
              ) {
                sessionStorage.removeItem(
                  'patitas_return_after_auth'
                )

                if (
                  loggedUser?.role ===
                  'ADMIN'
                ) {
                  if (
                    returnAfterAuth ===
                    'admin-organismos'
                  ) {
                    navigate(
                      'admin-organismos'
                    )
                  } else {
                    navigate('admin')
                  }
                } else {
                  navigate('home')
                }

                return
              }

              if (
                loggedUser?.role ===
                'ADMIN'
              ) {
                navigate('admin')
                return
              }

              navigate('home')
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

        {page === 'admin' &&
          user?.role === 'ADMIN' && (
            <Admin navigate={navigate} />
          )}

        {page === 'admin-organismos' &&
          user?.role === 'ADMIN' && (
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
              conversationId={selectedId}
              currentUserId={user.id}
            />
          )}
      </Suspense>

      {showDonationWidget && (
        <DonationWidget />
      )}
    </div>
  )
}

