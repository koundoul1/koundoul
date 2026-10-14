import { lazy, Suspense, Component } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import { I18nProvider, useTranslation } from './hooks/useTranslation.jsx'
import ProtectedRoute from './components/ProtectedRoute'
import GuestRoute from './components/GuestRoute'
import PageLoader from './components/PageLoader'
// Navigation : mobile bottom nav + desktop sidebar/topbar
import MobileNavBar from './components/MobileNavBar'
import Sidebar from './components/Sidebar'
import TopBar from './components/TopBar'
import OfflineIndicator from './components/OfflineIndicator'
import ConnectionStatus from './components/ConnectionStatus'
import FlashcardsDueNotification from './components/FlashcardsDueNotification'
import GamificationToastContainer from './components/GamificationToast'

// Lazy-loaded pages
const NewHome = lazy(() => import('./pages/NewHome'))
const Login = lazy(() => import('./pages/Login'))
const Register = lazy(() => import('./pages/Register'))
const ForgotPassword = lazy(() => import('./pages/ForgotPassword'))
const ResetPassword = lazy(() => import('./pages/ResetPassword'))
const NewDashboard = lazy(() => import('./pages/NewDashboard'))
const Solver = lazy(() => import('./pages/Solver'))
const Quiz = lazy(() => import('./pages/Quiz'))
const Profile = lazy(() => import('./pages/Profile'))
const Courses = lazy(() => import('./pages/Courses'))
const SubjectChapters = lazy(() => import('./pages/SubjectChapters'))
const ChapterDetail = lazy(() => import('./pages/ChapterDetail'))
const Lesson = lazy(() => import('./pages/Lesson'))
const Exercise = lazy(() => import('./pages/Exercise'))
const QuizPlay = lazy(() => import('./pages/QuizPlay'))
const QuizResults = lazy(() => import('./pages/QuizResults'))
const Badges = lazy(() => import('./pages/Badges'))
const Layout = lazy(() => import('./components/Layout'))
const Flashcards = lazy(() => import('./pages/Flashcards'))
const FlashcardsReview = lazy(() => import('./pages/FlashcardsReview'))
const Forum = lazy(() => import('./pages/Forum'))
const DiscussionDetail = lazy(() => import('./pages/DiscussionDetail'))
const CreateDiscussion = lazy(() => import('./pages/CreateDiscussion'))
const EducationalResources = lazy(() => import('./pages/EducationalResources'))
const VirtualCoach = lazy(() => import('./pages/VirtualCoach'))
const NotificationsPage = lazy(() => import('./pages/Notifications'))
const InteractiveVisualizations = lazy(() => import('./pages/InteractiveVisualizations'))
const MicroLessons = lazy(() => import('./pages/MicroLessons'))
const MicroLessonDetail = lazy(() => import('./pages/MicroLessonDetail'))
const SmartExercises = lazy(() => import('./pages/SmartExercises'))
const WhyItWorks = lazy(() => import('./pages/WhyItWorks'))
const AdvancedFeatures = lazy(() => import('./pages/AdvancedFeatures'))
const Challenge = lazy(() => import('./pages/Challenge'))
const Leaderboard = lazy(() => import('./pages/Leaderboard'))
const ParentDashboard = lazy(() => import('./pages/ParentDashboard'))
const ParentCoach = lazy(() => import('./pages/ParentCoach'))
const AdminDashboard = lazy(() => import('./pages/AdminDashboard'))
const QuestionBanks = lazy(() => import('./pages/QuestionBanks'))
const QuestionBankDetail = lazy(() => import('./pages/QuestionBankDetail'))
const TestHintSystem = lazy(() => import('./pages/TestHintSystem'))
const Contact = lazy(() => import('./pages/Contact'))
const Terms = lazy(() => import('./pages/Terms'))
const Privacy = lazy(() => import('./pages/Privacy'))
const Subscriptions = lazy(() => import('./pages/Subscriptions'))
const PaymentSuccess = lazy(() => import('./pages/PaymentSuccess'))
const PaymentError = lazy(() => import('./pages/PaymentError'))

function NotFoundPage() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="text-center">
        <p className="text-7xl font-black text-white/10 mb-4">404</p>
        <h1 className="text-2xl font-black text-white mb-2">Page introuvable</h1>
        <p className="text-gray-400 text-sm mb-8">Cette page n'existe pas ou a été déplacée.</p>
        <a
          href="/"
          className="inline-block px-6 py-3 rounded-xl bg-kprimary text-white font-bold text-sm hover:opacity-90 transition-opacity"
        >
          ← Retour à l'accueil
        </a>
      </div>
    </div>
  )
}

// ErrorBoundary global — intercepte les chunk load errors (nouveau déploiement Vercel)
// et force un rechargement pour récupérer les nouveaux chunks
class ChunkErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false }
  }
  static getDerivedStateFromError(error) {
    const isChunkError =
      error?.name === 'ChunkLoadError' ||
      /Loading chunk \d+ failed/i.test(error?.message || '') ||
      /Failed to fetch dynamically imported module/i.test(error?.message || '') ||
      /Importing a module script failed/i.test(error?.message || '')
    if (isChunkError) {
      // Recharge la page une seule fois pour récupérer les nouveaux chunks
      if (!sessionStorage.getItem('chunk_reload')) {
        sessionStorage.setItem('chunk_reload', '1')
        window.location.reload()
      }
    }
    return { hasError: true }
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center px-4">
          <div className="text-center">
            <p className="text-white font-bold text-lg mb-2">Une erreur est survenue</p>
            <p className="text-gray-400 text-sm mb-6">Rechargement en cours…</p>
            <button
              onClick={() => window.location.reload()}
              className="px-5 py-2.5 rounded-xl bg-kprimary text-white font-bold text-sm hover:opacity-90"
            >
              Recharger la page
            </button>
          </div>
        </div>
      )
    }
    return this.props.children
  }
}

// Routes sans app shell (login, register, terms — standalone pages)
const STANDALONE_ROUTES = ['/login', '/register', '/terms', '/privacy', '/payment/success', '/payment/error']

function AppLayout() {
  const { isAuthenticated } = useAuth()
  const location = useLocation()

  const isStandaloneRoute = STANDALONE_ROUTES.includes(location.pathname)
  const isAdminRoute = location.pathname.startsWith('/admin')
  // Show app shell for all users (authenticated + non-authenticated landing preview)
  // Non-authenticated users see the same interface but with locked navigation
  const showAppShell = !isStandaloneRoute && !isAdminRoute

  return (
    <div className="min-h-screen bg-gray-900 flex flex-col">
      <OfflineIndicator />
      <ConnectionStatus />
      <GamificationToastContainer />
      {showAppShell && isAuthenticated && <FlashcardsDueNotification />}

      {/* Navigation seulement pour les connectés sur routes protégées */}
      {showAppShell && (
        <>
          <MobileNavBar />
          <Sidebar />
          <TopBar />
        </>
      )}

      {/* Main content */}
      <main className={showAppShell ? 'flex-1 pb-20 md:pb-0 md:ml-60 md:mt-16' : 'flex-1'}>
        <ChunkErrorBoundary>
        <Suspense fallback={<PageLoader />}>
          <Routes>
            {/* Routes publiques (full width, sans sidebar) */}
            <Route path="/" element={<NewHome />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/terms" element={<Terms />} />
            <Route path="/privacy" element={<Privacy />} />
            <Route path="/payment/success" element={<ProtectedRoute><PaymentSuccess /></ProtectedRoute>} />
            <Route path="/payment/error" element={<PaymentError />} />

            {/* ── Routes protégées (données personnelles) ── */}
            <Route path="/dashboard" element={<ProtectedRoute><NewDashboard /></ProtectedRoute>} />
            <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
            <Route path="/settings" element={<Navigate to="/profile" replace />} />
            <Route path="/notifications" element={<ProtectedRoute><NotificationsPage /></ProtectedRoute>} />
            <Route path="/flashcards" element={<ProtectedRoute><Flashcards /></ProtectedRoute>} />
            <Route path="/flashcards/review" element={<ProtectedRoute><FlashcardsReview /></ProtectedRoute>} />
            <Route path="/forum/new" element={<ProtectedRoute><CreateDiscussion /></ProtectedRoute>} />
            <Route path="/parent-dashboard" element={<ProtectedRoute><ParentDashboard /></ProtectedRoute>} />
            <Route path="/parent-coach" element={<ProtectedRoute><ParentCoach /></ProtectedRoute>} />
            <Route path="/admin" element={<ProtectedRoute><AdminDashboard /></ProtectedRoute>} />
            <Route path="/quiz/:quizId/results" element={<ProtectedRoute><Suspense fallback={<PageLoader />}><Layout><QuizResults /></Layout></Suspense></ProtectedRoute>} />

            {/* ── Routes ouvertes (GuestRoute — pas de redirect /login) ── */}
            {/* IA : page accessible, mur au moment du submit si non connecté */}
            <Route path="/solver" element={<GuestRoute><Solver /></GuestRoute>} />
            <Route path="/coach" element={<GuestRoute><VirtualCoach /></GuestRoute>} />
            {/* Contenu — lecture seule */}
            <Route path="/courses" element={<GuestRoute><Courses /></GuestRoute>} />
            <Route path="/courses/:slug" element={<GuestRoute><SubjectChapters /></GuestRoute>} />
            <Route path="/courses/:slug/chapters/:chapterSlug" element={<GuestRoute><ChapterDetail /></GuestRoute>} />
            <Route path="/lessons/:lessonId" element={<GuestRoute><Suspense fallback={<PageLoader />}><Layout><Lesson /></Layout></Suspense></GuestRoute>} />
            <Route path="/exercises/:exerciseId" element={<GuestRoute><Suspense fallback={<PageLoader />}><Layout><Exercise /></Layout></Suspense></GuestRoute>} />
            <Route path="/micro-lessons" element={<GuestRoute><MicroLessons /></GuestRoute>} />
            <Route path="/microlessons/:id" element={<GuestRoute><MicroLessonDetail /></GuestRoute>} />
            <Route path="/exercices" element={<GuestRoute><QuestionBanks /></GuestRoute>} />
            <Route path="/exercices/:id" element={<GuestRoute><QuestionBankDetail /></GuestRoute>} />
            <Route path="/question-banks/:id" element={<GuestRoute><QuestionBankDetail /></GuestRoute>} />
            {/* Quiz — listing + détail ouverts, jouer/soumettre requiert auth backend */}
            <Route path="/quiz" element={<GuestRoute><Quiz /></GuestRoute>} />
            <Route path="/quiz/:quizId" element={<GuestRoute><QuizPlay /></GuestRoute>} />
            {/* Social */}
            <Route path="/forum" element={<GuestRoute><Forum /></GuestRoute>} />
            <Route path="/forum/:id" element={<GuestRoute><DiscussionDetail /></GuestRoute>} />
            <Route path="/leaderboard" element={<GuestRoute><Leaderboard /></GuestRoute>} />
            <Route path="/badges" element={<GuestRoute><Badges /></GuestRoute>} />
            {/* Découverte */}
            <Route path="/subscriptions" element={<GuestRoute><Subscriptions /></GuestRoute>} />
            <Route path="/resources" element={<GuestRoute><EducationalResources /></GuestRoute>} />
            <Route path="/visualizations" element={<GuestRoute><InteractiveVisualizations /></GuestRoute>} />
            <Route path="/challenge" element={<GuestRoute><Challenge /></GuestRoute>} />
            <Route path="/defi" element={<GuestRoute><SmartExercises /></GuestRoute>} />
            <Route path="/contact" element={<GuestRoute><Contact /></GuestRoute>} />
            <Route path="/why-it-works" element={<GuestRoute><WhyItWorks /></GuestRoute>} />
            <Route path="/advanced-features" element={<GuestRoute><AdvancedFeatures /></GuestRoute>} />
            <Route path="/test-hints" element={<GuestRoute><TestHintSystem /></GuestRoute>} />

            {/* Route 404 */}
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </Suspense>
        </ChunkErrorBoundary>
      </main>
    </div>
  )
}

function App() {
  return (
    <I18nProvider>
      <AuthProvider>
        <Router>
          <AppLayout />
        </Router>
      </AuthProvider>
    </I18nProvider>
  )
}

export default App
