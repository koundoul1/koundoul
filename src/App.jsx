import { lazy, Suspense } from 'react'
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import { I18nProvider, useTranslation } from './hooks/useTranslation.jsx'
import ProtectedRoute from './components/ProtectedRoute'
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
const AdminDashboard = lazy(() => import('./pages/AdminDashboard'))
const QuestionBanks = lazy(() => import('./pages/QuestionBanks'))
const QuestionBankDetail = lazy(() => import('./pages/QuestionBankDetail'))
const TestHintSystem = lazy(() => import('./pages/TestHintSystem'))
const Terms = lazy(() => import('./pages/Terms'))
const Privacy = lazy(() => import('./pages/Privacy'))
const Subscriptions = lazy(() => import('./pages/Subscriptions'))
const PaymentSuccess = lazy(() => import('./pages/PaymentSuccess'))
const PaymentError = lazy(() => import('./pages/PaymentError'))

function NotFoundPage() {
  const { t } = useTranslation()
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">{t('notFound.title')}</h1>
        <p className="text-gray-600 mb-8">{t('notFound.message')}</p>
        <a
          href="/"
          className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
        >
          {t('notFound.backHome')}
        </a>
      </div>
    </div>
  )
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
        <Suspense fallback={<PageLoader />}>
          <Routes>
            {/* Routes publiques (full width, sans sidebar) */}
            <Route path="/" element={<NewHome />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/terms" element={<Terms />} />
            <Route path="/privacy" element={<Privacy />} />
            <Route path="/payment/success" element={<ProtectedRoute><PaymentSuccess /></ProtectedRoute>} />
            <Route path="/payment/error" element={<PaymentError />} />

            {/* Routes protégées (avec sidebar) */}
            <Route path="/dashboard" element={<ProtectedRoute><NewDashboard /></ProtectedRoute>} />
            <Route path="/solver" element={<ProtectedRoute><Solver /></ProtectedRoute>} />
            <Route path="/quiz" element={<ProtectedRoute><Quiz /></ProtectedRoute>} />
            <Route path="/quiz/:quizId" element={<ProtectedRoute><QuizPlay /></ProtectedRoute>} />
            <Route path="/quiz/:quizId/results" element={<ProtectedRoute><Suspense fallback={<PageLoader />}><Layout><QuizResults /></Layout></Suspense></ProtectedRoute>} />
            <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
            <Route path="/subscriptions" element={<ProtectedRoute><Subscriptions /></ProtectedRoute>} />
            <Route path="/resources" element={<ProtectedRoute><EducationalResources /></ProtectedRoute>} />
            <Route path="/coach" element={<ProtectedRoute><VirtualCoach /></ProtectedRoute>} />
            <Route path="/visualizations" element={<ProtectedRoute><InteractiveVisualizations /></ProtectedRoute>} />
            <Route path="/micro-lessons" element={<ProtectedRoute><MicroLessons /></ProtectedRoute>} />
            <Route path="/microlessons/:id" element={<ProtectedRoute><MicroLessonDetail /></ProtectedRoute>} />
            <Route path="/defi" element={<ProtectedRoute><SmartExercises /></ProtectedRoute>} />
            <Route path="/exercices" element={<ProtectedRoute><QuestionBanks /></ProtectedRoute>} />
            <Route path="/exercices/:id" element={<ProtectedRoute><QuestionBankDetail /></ProtectedRoute>} />
            <Route path="/question-banks/:id" element={<ProtectedRoute><QuestionBankDetail /></ProtectedRoute>} />
            <Route path="/why-it-works" element={<ProtectedRoute><WhyItWorks /></ProtectedRoute>} />
            <Route path="/advanced-features" element={<ProtectedRoute><AdvancedFeatures /></ProtectedRoute>} />
            <Route path="/test-hints" element={<ProtectedRoute><TestHintSystem /></ProtectedRoute>} />
            <Route path="/challenge" element={<ProtectedRoute><Challenge /></ProtectedRoute>} />
            <Route path="/leaderboard" element={<ProtectedRoute><Leaderboard /></ProtectedRoute>} />
            <Route path="/badges" element={<ProtectedRoute><Suspense fallback={<PageLoader />}><Layout><Badges /></Layout></Suspense></ProtectedRoute>} />
            <Route path="/notifications" element={<ProtectedRoute><Suspense fallback={<PageLoader />}><Layout><NotificationsPage /></Layout></Suspense></ProtectedRoute>} />
            <Route path="/flashcards" element={<ProtectedRoute><Flashcards /></ProtectedRoute>} />
            <Route path="/flashcards/review" element={<ProtectedRoute><FlashcardsReview /></ProtectedRoute>} />
            <Route path="/forum" element={<ProtectedRoute><Forum /></ProtectedRoute>} />
            <Route path="/forum/:id" element={<ProtectedRoute><DiscussionDetail /></ProtectedRoute>} />
            <Route path="/forum/new" element={<ProtectedRoute><CreateDiscussion /></ProtectedRoute>} />
            <Route path="/courses" element={<ProtectedRoute><Courses /></ProtectedRoute>} />
            <Route path="/courses/:slug" element={<ProtectedRoute><SubjectChapters /></ProtectedRoute>} />
            <Route path="/courses/:slug/chapters/:chapterSlug" element={<ProtectedRoute><ChapterDetail /></ProtectedRoute>} />
            <Route path="/lessons/:lessonId" element={<ProtectedRoute><Suspense fallback={<PageLoader />}><Layout><Lesson /></Layout></Suspense></ProtectedRoute>} />
            <Route path="/exercises/:exerciseId" element={<ProtectedRoute><Suspense fallback={<PageLoader />}><Layout><Exercise /></Layout></Suspense></ProtectedRoute>} />
            <Route path="/parent-dashboard" element={<ProtectedRoute><ParentDashboard /></ProtectedRoute>} />
            <Route path="/admin" element={<ProtectedRoute><AdminDashboard /></ProtectedRoute>} />

            {/* Route 404 */}
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </Suspense>
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
